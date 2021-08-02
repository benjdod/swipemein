const redis = require('redis');

let client = redis.createClient(6379);

const { promisify } = require('util');
const deterministicStringify = require('json-stringify-deterministic');

const activeRequestsKey = `requests:active`;
const pendingRequestsPrefix = `requests:pending:`;

// --- Utility funcs ----------------

const parseScoredZRange = (range) => {
    let i;

    let out = [];

    for (i = 0; i < range.length; i++) {
        if (i % 2 == 0) {
            out.push([range[i]])
        } else {
            out[out.length-1].push(parseInt(range[i]));
        }
    }

    return out;
}

// these are globals for getTimeBasedScore
let last_date_now = 0;
let last_score = 0;
const getTimeBasedScore = () => {
    const new_date_now = Date.now();

    if (new_date_now > last_date_now) {
        last_date_now = new_date_now;
        last_score = 0;
    } else {
        last_score++;
    }

    str_score = `${last_score}`
        .padStart(2,'0');    // this determines how many scores can be fit into one ms
    
    return 0 - parseInt(`${last_date_now}${str_score}`);
}


//
// --- Export funcs -------------------
//

exports.getActiveRequests = async (start, limit) => {
    const _start = start || 0;
    const _limit = limit || 20;

    const zrangeSync = promisify(client.zrange).bind(client);

    try {
        const range = await zrangeSync(activeRequestsKey, _start, _start + _limit, 'WITHSCORES');
        return parseScoredZRange(range);
    } catch (e) {
        console.error(e);
        return [];
    }
}

/**
 * Adds a request to the active requests. 
 * @param {Object} request the request object 
 * @returns the score value for the newly added request
 * @throws Error if the request is not an object, which is necessary for serialization
 */
exports.addRequest = async (request) => {

    const zAddSync = promisify(client.zadd).bind(client);

    let payload = '';

    const score = getTimeBasedScore();

    if (typeof request == 'object') {
        payload = deterministicStringify({...request, score: score});
    } else {
        throw Error('Request argument is not an object');
    }

    try {
        await zAddSync(activeRequestsKey, score, payload);
    } catch (e) {
        console.error(e);
        return ['', -1]
    }

    return [
        payload,
        score
    ]
}

exports.pendRequest = async (request, score) => {

    if (typeof request == 'object') {
        request = deterministicStringify(request);
    }

    if (score === undefined) {
        const zscoreSync = promisify(client.zscore).bind(client);
        score = await zscoreSync(activeRequestsKey, request);
    }

    const zremSync = promisify(client.zrem).bind(client);
    const setSync = promisify(client.set).bind(client);

    //client.zrem(activeRequestsKey, request);
    // client.set(`requests:pending:${0-score}`, request);
    await zremSync(activeRequestsKey, request);
    await setSync(`requests:pending:${0-score}`, request);
    return;
}

exports.unpendRequest = async (score) => {
    const getSync = promisify(client.get).bind(client);

    const request = await getSync(`requests:pending:${0-score}`);
    client.zadd(activeRequestsKey, score, request);
    client.del(`requests:pending:${0-score}`);
    console.log('unpended request');
}

exports.completeRequest = async (score) => {
    const renameSync = promisify(client.get).bind(client);
    await renameSync(`requests:pending:${0-score}`, `requests:complete:${0-score}`);
}

/**
 * @param {string} request 
 */
exports.deleteRequest = async (request) => {

    if (typeof request == 'object') request = deterministicStringify(request);

    zremSync = promisify(client.zrem).bind(client);
    await zremSync(activeRequestsKey, request);
}

exports.setClient = (newClient) => {

    if (! client instanceof redis.RedisClient) {
        return false;
    }

    client = newClient;
    return true;
}