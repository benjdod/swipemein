const ws = require('ws');
const messageHub = require('./messagehub.js');
const rs = require('./request-sockets');
const { decryptScore } = require('../encryption');
const { verifyChatToken, decodeChatToken } = require('../chat-auth');
const cookie = require('cookie');

const chatServer = new ws.Server({ noServer: true });
chatServer.on('connection', (socket, request) => {

	const session = request.payload.s;
    if (! messageHub.addParticipant(socket, session)) {
        console.log(`could not add participant to session ${session}`)
        socket.close();
    }
});

chatServer.on('error', (socket,request) => {
	console.error('chatServer error')
	socket.close();
})

// handles connections created by the active request view on a requester's machine
const requestServer = new ws.Server({noServer: true});
requestServer.on('connection', socket => {

});

/**
 * 
 * @param expressServer An express Server object which the web socket server should be bound to
 */
exports.bindWSServers = (expressServer) => {
    expressServer.on('upgrade', (request, socket, head) => {

        if (request.url.match(/^\/ws\/chat/)) {
            chatServer.handleUpgrade(request, socket, head, socket => {

				// verify chat token and then grant connection
                if (request.headers.cookie !== undefined) {
					const cookies = cookie.parse(request.headers.cookie);
					if (cookies['smi-chat-token'] !== undefined) {
						const chatToken = cookies['smi-chat-token'];
						const payload = verifyChatToken(chatToken);
						if (payload != '') {
							request.payload = payload;
							chatServer.emit('connection', socket, request);
							return;
						} 
					}
                } 

				console.log('invalid credentials to connect to chat server (missing token)');
				chatServer.emit('error', socket, request);
            });
        } else if (request.url.match(/^\/ws\/request/)) {
            requestServer.handleUpgrade(request, socket, head, socket => {

				// FIXME: prevent a user from opening multiple request 
				// connections (maybe in multiple tabs)

                // const req_score = decryptScore(request.url.replace('/ws/request/', ''));
                const req_score = request.url.replace('/ws/request/', '');

				console.log('rt server adding request socket: ', req_score);

				socket.on('close', () => {
					console.log(`deleting request socket ${req_score}`);
                    rs.deleteSocket(req_score);
				})

                const parsedScore = parseInt(req_score);

                if (parsedScore == NaN) {
                    console.error(`socket attempted to connect with an invalid request score of ${parsedScore}`);
                    socket.on('open', () => {
                        socket.close();
                    })
                }

                rs.addSocket(parsedScore, socket)
                requestServer.emit('connection', socket, request);
            });
        }
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
    
    const targetSocket = rs.getSocket(score)
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

messageHub.initialize(2,2);
