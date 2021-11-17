const ws = require('ws');
const rsock = require('../request-sockets');


const server = new ws.Server({noServer: true});
// handles connections created by the active request view on a requester's machine
server.on('connection', socket => {

});

/**
 * @description
 */
exports.handleUpgrade = (request, socket, head) => {
    server.handleUpgrade(request, socket, head, (socket) => {

        // FIXME: prevent a user from opening multiple request 
        // connections (maybe in multiple tabs)

        const req_score = request.url.replace('/ws/request/', '');

        console.log('rt server adding request socket: ', req_score);

        socket.on('close', () => {
            console.log(`deleting request socket ${req_score}`);
            rsock.deleteSocket(req_score);
        })

        const parsedScore = parseInt(req_score);

        if (parsedScore == NaN) {
            console.error(`socket attempted to connect with an invalid request score of ${parsedScore}`);
            socket.on('open', () => {
                socket.close();
            })
        }

        rsock.addSocket(parsedScore, socket)
        server.emit('connection', socket, request);
    });
}

/**
 * Utility method for a provider endpoint to notify a requester that their request has been
 * accepted. This method notifies the requester, ensures the requester also agrees, and then creates a new session 
 * and distributes the session ID to both parties.
 * @param {string} sessionId - id of the newly formed chat session
 * @param {number} score - the score of the request being offered
 * @param {string} name - the provider's name
 * @returns {Promise<boolean>} whether or not the notification was accepted properly.
 */
exports.notifyOfAcceptedRequest = async ( sessionId, score, name) => {

    console.log('rt server looking for request socket: ', score);
    
    const targetSocket = rsock.getSocket(score)
    if (! targetSocket) {console.error('cannot notify requester of offer: can\'t find their socket...'); return false;}

    const token = signChatToken(sessionId, 'new participant');

    const acceptObject = {
        type: 'accept',
        token: sessionId,
        score: score,
        name: name,
    }

    const promise = new Promise((resolve, reject) => {
        try {
            targetSocket.on('message', (message) => {
                if (message == 'ok') {
                    resolve(true);
                } else {
                    reject(false);
                }
            })
            targetSocket.send(JSON.stringify(acceptObject));
        } catch (e) {
            console.error(e);
            reject(false);
        } 
    })

    return promise;
}