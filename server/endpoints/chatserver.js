const ws = require('ws');
const redis = require('redis');
const url = require('url');

const sessionChannelCount = 8;
const chatSessions = new Array(sessionChannelCount).fill([]);

let requestSockets = {};

let currentChannel = 0;
const advanceCurrentChannel = () => {currentChannel = (++currentChannel % sessionChannelCount)}

const chatServer = new ws.Server({ noServer: true });
chatServer.on('connection', socket => {
    socket.on('message', message => {
        console.log(message);
        /*
        conSessions.a.forEach(s => {
            if (s != socket && s.readyState === ws.OPEN)
                s.send(message);
        })*/
    });
});

// handles connections created by the active request view on a requester's machine
const requestServer = new ws.Server({noServer: true});
requestServer.on('connection', socket => {
    /*
    setTimeout(() => {
        socket.send('accept');
    }, 3000);
    */
});

/**
 * 
 * @param expressServer An express Server object which the web socket server should be bound to
 */
exports.bindChatServer = (expressServer) => {
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

exports.acceptRequest = (uid) => {
    const targetSocket = requestSockets[uid];
    if (! targetSocket) {console.error('no target socket!'); return;}
    targetSocket.send('accept');
}