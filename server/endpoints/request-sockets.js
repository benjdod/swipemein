/**
 * Simple key-value store for websocket request connections
 */

const requestSockets = {};

/**
 * Adds a request socket to the store using the score as a key
 * @param {number} score 
 * @param {WebSocket} socket 
 */
exports.addSocket = (score, socket) => {
    requestSockets[score] = socket;
}

/**
 * Gets a websocket matching a score
 * @param {number} score 
 * @returns {WebSocket?} Websocket matching the given score, or null if one is not present
 */
exports.getSocket = (score) => {
    return requestSockets[score] || null;
}

/**
 * Removes a websocket matching the store from the store
 * @param {number} score 
 */
exports.deleteSocket = (score) => {
    delete requestSockets[score]
}