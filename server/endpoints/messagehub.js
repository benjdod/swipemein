const redis = require('redis');
const crypto = require('crypto');
const { parseMessage, ptcCodeToStr, createGeoMessage } = require('../../src/util/chat-message-format');

/** The hub object. This is populated and modified. */
let hub  = {};


const REDIS_CLIENT_PORT = 6379;
/** base that the slot is represented by in the session ID. */
const SLOT_RADIX = 16;

/** The next publisher to send a message out on. 
 *  Do not access or modify this number directly!
 *  This is modified by functions that need it.
 */
let _currentpub = 0;
/** The number of allowed connections that are dedicated to publishing messages. */
let max_pub_connections = 4;
/** The number of allowed connections that are dedicated to subscribing to message slots. */
let max_sub_connections = 4;


/* session stats */
let sessiontotal = 0;
let sessioncounts = [];

/*

The object of the message hub is to implement a system for an arbitrary number of 
websocket-based conversation sessions using a limited number of redis connections. 
Essentially, it spreads the session load relatively equally across however many 
connections are alloted for. 

A conversation session is an array of web sockets and a corresponding session ID. 
Thus, we group together a collection of sessions with a redis subscribed connection, creating 
as many of these as we can to obtain the best performance.

The overall schema for the hub is as follows:

{
    slots: [
        ...
        {
            subscriber: <RedisClient in subscribe mode>
            sessions: {
                "2-a45fe3": [<websocket>, <websocket>],
                "2-bf629e": [<websocket>, <websocket>]
            }
        },
        ....
    ],

    publishers: [
        ...
        <RedisClient>,
        <RedisClient>,
        ...
    ]
}
*/



// 
// --- UTILITY FUNCTIONS -----------------
//


const incPublisher = () => {
    const ret = _currentpub;
    _currentpub += 1;
    if (_currentpub >= max_pub_connections) _currentpub = 0;
    return ret;
    //return (_currentpub > max_pub_connections - 1) ? (_currentpub = 0) : (++_currentpub);
}

/**
 * Returns the next redis client to use for publishing
 * @returns {redis.RedisClient} 
 */
const nextPublisher = () => {
    return hub['publishers'][incPublisher()];
}

const getMinSessionIndex = () => {

    // a simple loop is probably the best way to approach this, 
    // although it doesn't really matter much.
    // https://devblogs.microsoft.com/oldnewthing/20140526-00/?p=903 

    let acc = Number.MAX_VALUE;
    let a = 0;
    for (let i = 0; i < sessioncounts.length; i++) {
        if (sessioncounts[i] < acc) {acc = sessioncounts[i]; a = i;}
    }
    return a;
}

/**
 * Checks a conversation session id against the slot size and returns an
 * integer value to indicate success or failure. This does not check for
 * the existence of a session; simply that the ID is well-formed. 
 * @param sessionId the session ID to be validated.
 * @returns The slot number of the given id if it is well-formed. Otherwise
 * returns -1.
 */
const validateSessionIdForm = (sessionId) => {

    const parts = sessionId.split('-');

    if (parts.length != 2) return -1;

    const slot_number = parseInt(parts[0], SLOT_RADIX);
    if (slot_number < 0 || slot_number >= max_sub_connections) {
        return -1;
    } 

    if (parts[1].length != 8) return -1;

    return slot_number;
}

/**
 * Checks a conversation session id against both the slot size and session space
 * and returns an integer value to indicate success or failure.
 * Note that unlike validateSessionIdSlot, this will return a failure if the session
 * has been removed from the hub object.  
 * @param sessionId the session ID to be validated.
 * @returns The slot number of the given id if it is valid. Otherwise
 * returns -1 or -2
 */
const validateSessionId = (sessionId) => {

    let idSlot;

    if ((idSlot = validateSessionIdForm(sessionId)) == -1) return -2;

    if (hub['slots'][idSlot]['sessions'][sessionId] === undefined) return -1;

    return idSlot;
}

/**
 * Creates the template for a single empty slot. Used in initialization.
 */
const makeSlot = (slotNumber) => {
    const sub = redis.createClient(REDIS_CLIENT_PORT);

    sub.psubscribe(`chat:${slotNumber}*`);

    // set up message listener 
    // when this fires, it sends the messsage to all participants except the 
    // sending participant.
    sub.on('pmessage', (pattern, channel, message) => {
        const sessionId = channel.replace('chat:', '');
        let slot = -1;

        if ((slot = validateSessionId(sessionId)) == -1) {
            console.error('An incoming message from redis is not from a channel for a valid session.');
            return;
        }

        console.log(`new message from redis for session ${sessionId}`);

        const msg = parseMessage(message);
        const participants = hub['slots'][slot]['sessions'][sessionId]

        for (const id in participants) {
            if (id != msg.p) {
                participants[id].send(message);
            }
        }
    })

    return {
        subscriber: sub,
        sessions: {}
    }
}




// 
// --- EXPORT FUNCTIONS ----------------------------
// 

/**
 * Initializes the message hub and all necessary Redis connections. Nothing will work if this 
 * function isn't run.
 * @param {number} maxPubConnections The maximum number of publishing connections allowed.
 * @param {number} maxSubConnections The maximum number of subscribing connections allowed.
 */
exports.initialize = (maxPubConnections, maxSubConnections) => {
    hub['publishers'] = new Array(maxPubConnections);
    hub['slots'] = new Array(maxSubConnections);

    // not sure why we have to use a simple loop rather than
    // arr.map(), but it only works this way for me...
    for (let i = 0; i < hub.publishers.length; i++) {
        hub.publishers[i] = redis.createClient(REDIS_CLIENT_PORT);
    }
    for (let i = 0; i < hub.slots.length; i++) {
        hub.slots[i] = makeSlot(i);
    }

    max_pub_connections = maxPubConnections;
    max_sub_connections = maxSubConnections;
    sessioncounts = new Array(max_sub_connections).fill(0);

    console.log(`initialized a message hub with ${maxPubConnections} publishers and ${maxSubConnections} subscribers`);
}

/**
 * Initializes a conversation session.
 * @returns {string} the new session's ID.
 */
exports.createSession = () => {
    const targetSlot = getMinSessionIndex();    // target the emptiest slot
    const randomId = crypto.randomBytes(8).toString('base64').substring(0,8);
    const sessionId = `${targetSlot.toString(SLOT_RADIX)}-${randomId}`;

    hub['slots'][targetSlot].sessions[sessionId] = {};

    // inc stats
    sessioncounts[targetSlot] += 1;
    sessiontotal += 1;

    console.log(`messagehub successfully created a new session: ${sessionId}`);

    return sessionId;
}

exports.hasSession = (sessionId) => {
    let slotNumber = validateSessionId(sessionId);

    if (slotNumber == -2) {
        console.error(`could not add participant to session ${sessionId} - malformed session ID`);
        return false;
    } else if (slotNumber == -1) {
        console.error(`could not add participant to session ${sessionId} - session does not exist`);
        return false;
    }

    return true;
}

/**
 * Adds a participant socket to a session.
 * @param {WebSocket} participantSocket
 * @param {string} sessionId 
 * @returns {boolean} whether the participant was successfully added to a session
 */
exports.addParticipant = (participantSocket, sessionId) => {

    let slotNumber = validateSessionId(sessionId);

    if (slotNumber == -2) {
        console.error(`could not add participant to session ${sessionId} - malformed session ID`);
        return false;
    } else if (slotNumber == -1) {
        console.error(`could not add participant to session ${sessionId} - session does not exist`);
        return false;
    }

    const slot = hub['slots'][slotNumber];

    let firstMessage = true;

    participantSocket.on('message', message => {

        // initialization step to give out/confirm a participant ID for the user's machine
        if (firstMessage) {
            firstMessage = false;

            if (message == 'hello') {
                const participantId = crypto.randomBytes(8).toString('base64').substring(0,6);
                slot['sessions'][sessionId][participantId] = participantSocket;
                participantSocket.send(participantId);
            } else {
                console.log(`participant reported id as ${message}`);
                const participantId = message;
                slot['sessions'][sessionId][participantId] = participantSocket;
                participantSocket.send(participantId);
            }

            return;
        } 

        // otherwise...
        messageBody = parseMessage(message);
        console.log(`${messageBody.type} message in session ${sessionId} from participant ${messageBody.p}`);
        //nextPublisher().publish(`chat:${sessionId}`, message, (err, iVal) => {console.log(`published to ${iVal} subscribers.`)});
        this.sendMessage(sessionId, message);
    })

    participantSocket.on('close', () => {

        console.log(`closing socket for session ${sessionId}`);

        const getKeyFromValue = (o, item) => {
            for (k in o) {
                if (o[k] == item) {
                    return k;
                }
            }
            return '';
        }

        const key = getKeyFromValue(slot['sessions'][sessionId], participantSocket);
        if (key != '') {
            delete slot['sessions'][sessionId][key];
        }

		if (Object.keys(slot['sessions'][sessionId]).length == 0) {
			console.log(`no more sockets in session, closing session ${sessionId}`)
            delete slot['sessions'][sessionId];
        }
    })

    console.log(`added a participant to session ${sessionId}.`);
    return true;
}

/**
 * Sends a message to a session
 * @param {string} sessionId ID of the session
 * @param {string} message string message
 */
exports.sendMessage = (sessionId, message) => {

    let slotNumber = validateSessionId(sessionId);

    if (slotNumber < 0) {
        console.error(`could not send message to session ${sessionId} - it does not exist or the ID is malformed`);
    }

    nextPublisher().publish(`chat:${sessionId}`, message, (err, n) => {
        if (err) {
            console.error(err);
        } 
    })
}

/** 
 * Removes all participant sockets matching the given
 * session ID (basically empties and removes the session).
 * @param {string} sessionId
 * @param {Object} options options object
 * @param {boolean} options.closeSockets Whether to close the sockets on removal (defaults to true)
 */
exports.endSession = (sessionId, options) => {

    options = options || {
        closeSockets: true
    };

    let slotNumber;

    if ((slotNumber = validateSessionId(sessionId)) < 0) {
        console.error('invalid conversation ID');
        return;
    }

    if (options.closeSockets === true) {
        /*
        hub[slotNumber]['sessions'][sessionId].forEach(socket => {
            // socket.terminate() or something
        })
        */
    }

    delete hub[slotNumber]['sessions'][sessionId];
    sessioncounts[slotNumber] -= 1;
    sessiontotal -= 1;
}

/**
 * closes all active connections.
 */
exports.shutdown = () => {

    // a-la https://www.npmjs.com/package/redis#example-2

    hub.slots.forEach(slot => {
        // slot.subscriber.unsubscribe();
        // slot.subscriber.quit();
    })

    hub.publishers.forEach(pub => {
        // pub.quit();
    })

    console.log(`message hub has closed all publisher and subscriber connections and is shut down.`);
}
