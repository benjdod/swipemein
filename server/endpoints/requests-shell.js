const redis = require('redis');

let client = redis.createClient(6379);

const { promisify } = require('util');
const deterministicStringify = require('json-stringify-deterministic');

const activeRequestsKey = `requests:active`;
const pendingRequestsPrefix = `requests:pending:`;

const wipeSet = new Set();

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

/**
 * @description - Wipes an array of requests of requests that were deleted but 
 * still in Redis for some reason.
 * @param {Object[]} requests - an array of request objects
 * @returns {Object[]} the original array filtered of any wiped objects 
 */
const wipedRequests = (requests) => {

	if (wipeSet.size == 0) return requests;

	return requests.filter(r => {
		return ! (wipeSet.has(r.score));
	})
}

const deleteWipes = async () => {
	for (let score of wipeSet) {
		try {
			await exports.deleteRequest(score);
			wipeSet.delete(score);
		} catch (e) {
			console.error(e);
		}
	}
}

//
// --- Export funcs -------------------
//

/**
 * 
 * @param {number} start 
 * @param {number} limit 
 * @returns 
 */
exports.getActiveRequests = async (start, limit) => {
    const _start = start || 0;
    const _limit = limit || 20;

    const zrangeSync = promisify(client.zrange).bind(client);

    try {
        const range = await zrangeSync(activeRequestsKey, _start, _start + _limit, 'WITHSCORES');
        const parsedRange = parseScoredZRange(range).map(ps => JSON.parse(ps[0]));
        return wipedRequests(parsedRange);
    } catch (e) {
        console.error(e);
        return [];
    }
}

/**
 * Adds a request to the active requests. 
 * @param {Object} request the request object 
 * @returns an array containing - 1) the payload string, 2) the score of the request
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

exports.getRequest = async (score) => {

	if (typeof score !== 'number') {
		throw Error('score must be a number!');
	}

    const zRangeByScoreSync = promisify(client.zrangebyscore).bind(client);
	try {
		const reqString = await zRangeByScoreSync(activeRequestsKey, score, score);
		return JSON.parse(reqString);
	} catch (e) {
		console.error(e);
	}
}

/**
 * 
 * @param {string | Object} request 
 * @param {number} score 
 * @returns {void}
 */
exports.pendRequest = async (request, score) => {

    if (typeof request == 'object') {
        request = deterministicStringify(request);
    }

    if (score === undefined) {
        const zscoreSync = promisify(client.zscore).bind(client);
        score = await zscoreSync(activeRequestsKey, request);
    }

    const setSync = promisify(client.set).bind(client);
    const zremrangebyscoreSync = promisify(client.zremrangebyscore).bind(client);
    const nremoved=await zremrangebyscoreSync(activeRequestsKey, score, score);
    console.log(`removed ${nremoved} members from active requests`);
    await setSync(`requests:pending:${0-score}`, request);
    return;
}

exports.pendRequestByScore = async (score) => {
    const zrangebyscoreSync = promisify(client.zrangebyscore).bind(client);
    const setSync = promisify(client.set).bind(client);
    const zremrangebyscoreSync = promisify(client.zremrangebyscore).bind(client);
    const request = await zrangebyscoreSync(activeRequestsKey, score, score);
    const nremoved=await zremrangebyscoreSync(activeRequestsKey, score, score);
    await setSync(`requests:pending:${0-score}`, request);
}

/**
 * 
 * @param {number} score 
 */
exports.unpendRequest = async (score) => {
    const getSync = promisify(client.get).bind(client);

    const request = await getSync(`requests:pending:${0-score}`);
    client.zadd(activeRequestsKey, score, request);
    client.del(`requests:pending:${0-score}`);
    console.log('unpended request');
}

/**
 * @param {number} score 
 */
exports.completeRequest = async (score) => {
    const renameSync = promisify(client.get).bind(client);
    await renameSync(`requests:pending:${0-score}`, `requests:complete:${0-score}`);
}

/**
 * @param {string | Object} request 
 */
exports.deleteRequest = async (score) => {

    deleteWipes();

	if (typeof score !== 'number') {
		throw Error('score must be a number.')
	}

    zRemRangeByScoreSync = promisify(client.zremrangebyscore).bind(client);
    try {
        wipeSet.add(score);
		throw Error('a wrench in the system!')
        await zRemRangeByScoreSync(activeRequestsKey, score, score);
        wipeSet.delete(score);
    } catch (e) {
        console.error(e);
    }
}

exports.setClient = (newClient) => {

    if (! client instanceof redis.RedisClient) {
        return false;
    }

    client = newClient;
    return true;
}

const test = async () => {
	const ps = await exports.addRequest({helllo: 'moto'});
	const score = ps[1];
	console.log(score);
	const req = await exports.getRequest(score);
	console.log(req);
}
