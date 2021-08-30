const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const redis = require('redis');
const crypto = require('crypto');

const messageHub = require('./messagehub');
const { 
    notifyOfAcceptedRequest 
} = require('./rt-servers');
const { 
    addRequest, 
    deleteRequest, 
    getActiveRequests, 
    pendRequest, 
    unpendRequest, 
    getRequest, 
    hasProvider, 
    hasRequester 
} = require('./requests-shell');
const { createControlMessage } = require('../../src/util/chat-message-format');
const { encryptScore, decryptScore } = require('../encryption');

const client = redis.createClient(6379);
const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));
router.use(cookieParser());

//
// --- Requester endpoints --------------------------
//

router.route('/request')
.get(async (req, res) => {
	try {
        console.log('get request query: ', req.query);
        const decryptedScore = decryptScore(req.query.score);
		const request = await getRequest(decryptedScore);

		if (Object.keys(request).length == 0) {
			res.status(404).send(`no request with score of ${decryptedScore} exists.`);
		}

        request.score = request.encScore;
        delete request.encScore;

		res.send(JSON.stringify(request));

	} catch (e) {
		console.error(e);
		res.status(500).send(`could not get request.`);
	}
})
.delete((req,res) => {

    const decryptedScore = decryptScore(req.body.score);

    deleteRequest(req.body.key, decryptedScore).then(() => {
        res.clearCookie('smi-request').clearCookie('smi-request-key').sendStatus(200);
    }).catch(e => {
        console.error(e);
        res.status(500).send('could not delete request due to a server error');
    })
})
.post(async (req,res) => {
    
    // note: uuid generation like this is very safe
    // see https://stackoverflow.com/questions/49267840/are-the-odds-of-a-cryptographically-secure-random-number-generator-generating-th
    /*const request_uid = crypto.randomBytes(16).toString('hex');
    console.info(`creating request ${request_uid}`);

    const request_data = {...req.body, uid: request_uid}
    */

    let newReq;

    try {
        newReq = await addRequest({...req.body});
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }

    //let key, score;
    const [key, score] = newReq;

    console.log('new request ppsted: ', newReq);

    const encScore = encryptScore(score);
    console.log('encrypted: ', encScore);

    // add a new request cookie that expires at midnight 
    const now = new Date(Date.now());
    const msLeft = (86400 - (now.getHours() * 3600) - (now.getMinutes() * 60) - (now.getSeconds())) * 1000;
    res.cookie('smi-request', encScore, {maxAge: msLeft, secure: true, sameSite: 'strict'})
        .cookie('smi-request-key', key, {maxAge: msLeft, secure: true, sameSite: 'strict'})
        .sendStatus(200);
});


//
// --- Provider endpoints ----------------------------
//

// POST and DELETE providers
router.route('/provider')
.post((req,res) => {
    let provider_uid = crypto.randomBytes(16).toString('hex');
    client.set(`prv:${provider_uid}`, JSON.stringify(req.body));
    const now = new Date(Date.now());
    const msLeft = (86400 - (now.getHours() * 3600) - (now.getMinutes() * 60) - (now.getSeconds())) * 1000;
    res.cookie('smi-provider', JSON.stringify({...req.body, uid: provider_uid}), {maxAge: msLeft, secure: true})
        .sendStatus(200);
})
.delete((req,res) => {
    client.del(`prv:${req.body.uid}`);
    res.clearCookie('smi-provider').sendStatus(200);
})

// inform requester that provider has accepted request, OK provider to proceed to chat as well.
router.post('/pend-request', async (req,res) => {

    const sessionId = messageHub.createSession();

    const isProvider = await hasProvider(req.body.uid);

    if (! isProvider) {
        res.status(401).send(`Could not verify role. Please provide a valid 'uid' field in the request body.`)
    }

    const decryptedScore = decryptScore(req.body.score);

    notifyOfAcceptedRequest(sessionId, decryptedScore, req.body.name)
    .then(() => pendRequest(decryptedScore))
    .then(() => {
        res.cookie('smi-session-id', sessionId)
        .cookie('smi-request', req.body.score)
        .sendStatus(200);
    }).catch(e => {
        console.error(e);
        res.sendStatus(500);
    })
})

router.post('/unpend-request', async (req, res) => {

    let authorized = false;

    if (req.body.uid) {
        authorized = hasProvider(req.body.uid);
    } else if (req.body.key) {
        authorized = hasRequester(req.body.key);
    }

    if (! authorized) {
        res.status(401).send(`Could not verify role. Please provide a valid 'uid' or 'key' field in the request body depending on your role.`)
    }

    unpendRequest(decryptScore(req.body.score))
    .then(() => {
        messageHub.sendMessage(req.body.sessionId, createControlMessage(req.body.p, 'CANCEL'));
    })
    .then(() => {
        res.clearCookie('smi-participant-id')
			.clearCookie('smi-session-id')
			.sendStatus(200);
    })
    .catch(e => {
        console.error(e);
        res.sendStatus(500);
    })
})

// generate list of recent requests for provider list view
router.get('/requests', (req,res) => {
    // TODO: add params (skip, limit, sort) for infinite scrolling, filtering, etc

    const skip = req.query.skip || 0;
    const limit = req.query.limit || 20;

    getActiveRequests(skip, limit).then(requests => {
        res.set('Content-Type', 'application/json').send(requests.map(r => {
            r.score = r.encScore;
            return r;
        }));
    }).catch(e => {
        console.error(e);
        res.status(500).send('could not fetch requests');
    })
})

module.exports = router;
