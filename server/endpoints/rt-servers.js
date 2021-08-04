const ws = require('ws');
const redis = require('redis');
const url = require('url');
const crypto = require('crypto');

const messageHub = require('./messagehub.js');

let requestSockets = {};

const chatServer = new ws.Server({ noServer: true });
chatServer.on('connection', (socket, request) => {

    console.log("chat server request url: ", request.url);

    const sessionFull = request.url.replace('/ws/chat/', '');
    messageHub.addParticipant(socket, sessionFull);

    // add event listener to get session ID
    // once it's obtained, remove event listener and
    // do addParticipant(socket, sessionID)
});

// handles connections created by the active request view on a requester's machine
const requestServer = new ws.Server({noServer: true});
requestServer.on('connection', socket => {

    /*
    setTimeout(() => {

        const acceptObject = {
            type: 'accept',
            id: '8-af+39Ha' // some session id...
        }

        socket.send(JSON.stringify(acceptObject));
    }, 3000);
    */
});

/**
 * 
 * @param expressServer An express Server object which the web socket server should be bound to
 */
exports.bindWSServers = (expressServer) => {
    expressServer.on('upgrade', (request, socket, head) => {

        if (request.url.match(/^\/ws\/chat/)) {
            chatServer.handleUpgrade(request, socket, head, socket => {

                if (request.headers['cookie'] !== undefined) {
                    console.log(request.headers.cookie);
                } else {
                    console.log('no cookies');
                }

                chatServer.emit('connection', socket, request);
            });
        } else if (request.url.match(/^\/ws\/request/)) {
            requestServer.handleUpgrade(request, socket, head, socket => {

                const req_uid = request.url.replace('/ws/request/', '');

                requestSockets[req_uid] = socket;
                requestServer.emit('connection', socket, request);
            });
        }
    });
}

/**
 * Utility method for a provider endpoint to notify a requester that their request has been
 * accepted. This method notifies the requester, ensures the requester also agrees, and then creates a new session 
 * and distributes the session ID to both parties.
 * @param {string} requestUID
 * @param {string} sessionId
 * @param {number} score
 * @returns {boolean} whether or not the notification was accepted properly.
 */
exports.notifyOfAcceptedRequest = (requestUID, sessionId, score) => {
    
    const targetSocket = requestSockets[requestUID];
    if (! targetSocket) {console.error('no target socket!'); return false;}

    const acceptObject = {
        type: 'accept',
        id: sessionId,
        score: score,
    }

    targetSocket.send(JSON.stringify(acceptObject));
    return true;
}

exports.notifyOfCancelledRequest = () => {
    
}

messageHub.initialize(2,2);