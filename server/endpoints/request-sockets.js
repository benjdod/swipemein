const requestSockets = {};

/**
 * 
 * @param {number} score 
 * @param {WebSocket} socket 
 */
exports.addSocket = (score, socket) => {
    requestSockets[score] = socket;
}

exports.getSocket = (score) => {
    return requestSockets[score];
}

exports.deleteSocket = (score) => {
    delete requestSockets[score]
}