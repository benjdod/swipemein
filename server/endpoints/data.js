const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const redis = require('redis');
const crypto = require('crypto');
const log = require('ololog');

const { notifyOfAcceptedRequest } = require('./rt-servers');
const messageHub = require('./messagehub');
const { addRequest, deleteRequest, getActiveRequests, pendRequestByScore, unpendRequest, getRequest } = require('./requests-shell');
const { createControlMessage } = require('../../src/util/chat-message-format');

const client = redis.createClient(6379);
const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));
router.use(cookieParser());

//
// --- Requester endpoints --------------------------
//

// POST and DELETE requests
router.post('/request', async (req,res) => {
    
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

	const key = newReq[0];
    const score = newReq[1];

    // add a new request cookie that expires at midnight 
    const now = new Date(Date.now());
    const msLeft = (86400 - (now.getHours() * 3600) - (now.getMinutes() * 60) - (now.getSeconds())) * 1000;
    res.cookie('smi-request', score, {maxAge: msLeft, secure: true})
		.cookie('smi-request-key', key, {maxAge: msLeft, secure: true})
        .sendStatus(200);
});

router.get('/request', async (req, res) => {
	try {
		const request = await getRequest(parseInt(req.query.score));

		if (Object.keys(request).length == 0) {
			res.status(404).send(`no request with score of ${score} exists.`);
		}

		res.send(JSON.stringify(request));

	} catch (e) {
		console.error(e);
		res.status(500).send(`could not get request.`);
	}
})

router.delete('/request', (req,res) => {

    deleteRequest(req.body.key, req.body.score).then(() => {
        res.clearCookie('smi-request').clearCookie('smi-request-key').sendStatus(200);
    }).catch(e => {
        console.error(e);
        res.status(500).send('could not delete request due to a server error');
    })
})



//
// --- Provider endpoints ----------------------------
//

// POST and DELETE providers
router.post('/provider', (req,res) => {
    let provider_uid = crypto.randomBytes(16).toString('hex');
    client.set(`prv:${provider_uid}`, JSON.stringify(req.body));
    const now = new Date(Date.now());
    const msLeft = (86400 - (now.getHours() * 3600) - (now.getMinutes() * 60) - (now.getSeconds())) * 1000;
    res.cookie('smi-provider', JSON.stringify({...req.body, uid: provider_uid}), {maxAge: msLeft, secure: true})
        .sendStatus(200);
})
router.delete('/provider', (req,res) => {
    client.del(`prv:${req.body.uid}`);
    res.clearCookie('smi-provider').sendStatus(200);
})

// inform requester that provider has accepted request, OK provider to proceed to chat as well.
router.post('/pend-request', async (req,res) => {

    const sessionId = messageHub.createSession();

	// TODO: put a check here to make sure the provider 
	// is actually a legit provider and not some trickster 
	// looking to strike at the soft underbelly of this website

    notifyOfAcceptedRequest(sessionId, req.body.score, req.body.name)
    .then(() => pendRequestByScore(req.body.score))
    .then(() => {
        res.cookie('smi-session-id', sessionId)
        .cookie('smi-request', req.body.score)
        .sendStatus(200);
    }).catch(e => {
        console.error(e);
        res.sendStatus(500);
    })

    /*
    if (notifyOfAcceptedRequest(sessionId, req.body.score, req.body.name)) {
        await pendRequestByScore(req.body.score);
        res.cookie('smi-session-id', sessionId)
            .cookie('smi-request', req.body.score)
            .sendStatus(200);
    }
    else {
        res.sendStatus(500);
    } */
})

router.post('/unpend-request', async (req, res) => {
    unpendRequest(req.body.score)
    .then(() => {
        messageHub.sendMessage(req.body.sessionId, createControlMessage(req.body.p, 'CANCEL'));
    })
    .then(() => {
        res.sendStatus(200);
    })
    .catch(e => {
        console.error(e);
        res.sendStatus(500);
    })
})

// generate list of recent requests for provider list view
router.get('/requests', (req,res) => {
    // TODO: add params (skip, limit, sort) for infinite scrolling, filtering, etc
    getActiveRequests(0,20).then(requests => {

        //const real_requests = requests.map(r=>JSON.parse(r[0]));

        res.set('Content-Type', 'application/json').send(requests);
    })
})

module.exports = router;
