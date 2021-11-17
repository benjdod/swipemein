const ws = require('ws');

const messageHub = require('./messagehub.js');
const chatServer = require('./rt/chat');
const reqServer = require('./rt/request');


/**
 * @description - Binds websocket servers based on routes
 * @param {ws.Server} expressServer An express Server object which the web socket server should be bound to
 */
exports.bindWSServers = (expressServer) => {
    expressServer.on('upgrade', (request, socket, head) => {
        if (request.url.match(/^\/ws\/chat/)) {
            chatServer.handleUpgrade(request, socket, head);
        } else if (request.url.match(/^\/ws\/request/)) {
            reqServer.handleUpgrade(request, socket, head);
        }
    });
}

messageHub.initialize(2,2);
