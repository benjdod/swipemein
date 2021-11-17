
const ws = require('ws');
const { verifyChatToken} = require('../../chat-auth');

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

const handleUpgrade = (socket) => {
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
}

exports.handleUpgrade = (request, socket, head) => {
    chatServer.handleUpgrade(request, socket, head, handleUpgrade);
}