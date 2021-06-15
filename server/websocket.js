const ws = require('ws');

const conSessions = {
    a: [],
    b: [],
    c: [],
    d: []
}

const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', socket => {

    socket.on('message', message => {
        console.log(message);

        conSessions.a.forEach(s => {
            if (s != socket)
                s.send('someone said: ' + message);
        })
    });
});

/**
 * 
 * @param expressServer An express Server object which the web socket server should be bound to
 */
const bindServer = (expressServer) => {
    expressServer.on('upgrade', (request, socket, head) => {
        wsServer.handleUpgrade(request, socket, head, socket => {
            conSessions.a.push(socket);
            wsServer.emit('connection', socket, request);
        });
    });
}

module.exports = bindServer;