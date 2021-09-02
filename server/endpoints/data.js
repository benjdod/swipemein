const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const redis = require('redis');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const JWT_SECRETKEY = 'a great big secret... (change this) fe9aefhhh3488aefEAFAEF';

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
// const { encryptScore, decryptScore } = require('../encryption');

const client = redis.createClient(6379);
const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));
router.use(cookieParser());

//
// --- Requester endpoints --------------------------
//

/**
 * @param {string} req - request object
 * @param {express.Response} res - response object that will be used in case of verification error
 */
const verifyToken = (req, res, next) => {
    if (req.cookies['smi-token'] == undefined) {
        res.status(401).send('missing token');
        return;
    }

    try {
        const payload = jwt.verify(req.cookies['smi-token'], JWT_SECRETKEY);
		req.token = payload;
		next();
    } catch (e) {
		console.error(e);
        res.status(401).send('invalid token');
    }
}

const verifyRequester = (req,res,next) => {
	if (req.token.role != 'req') res.status(401).send('invalid token');
	else next();
}

const verifyProvider = (req,res,next) => {
	if (req.token.role != 'prv') res.status(401).send('invalid token');
	else next();
}


router.route('/request')
.get(verifyToken, async (req, res) => {
	try {
		const request = await getRequest(req.token.score);

		if (Object.keys(request).length == 0) {
			res.status(404).send(`no request with score of ${req.token.score} exists.`);
		}

		res.send(JSON.stringify(request));

	} catch (e) {
		console.error(e);
		res.status(500).send(`could not get request.`);
	}
})
.delete(verifyToken, verifyRequester, (req,res) => {

    deleteRequest(req.token.key, req.token.score).then(() => {
        //res.clearCookie('smi-request').clearCookie('smi-request-key').sendStatus(200);
        res.clearCookie('smi-token').sendStatus(200);
    }).catch(e => {
        console.error(e);
        res.status(500).send('could not delete request due to a server error');
    })
})
.post(async (req,res) => {

    let newReq;

    try {
        newReq = await addRequest({...req.body});
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }

    const [key, score] = newReq;

    console.log('new request posted: ', newReq);

    //const encScore = encryptScore(score);
    console.log('encrypted: ', score);

    const now = new Date(Date.now());
    const msLeft = (86400 - (now.getHours() * 3600) - (now.getMinutes() * 60) - (now.getSeconds())) * 1000;

    const token = jwt.sign({
        'score': score,
        'key': key, 
        'role': 'req'
    }, JWT_SECRETKEY, { expiresIn: msLeft })

    // add a new request cookie that expires at midnight 
    res //.cookie('smi-request', score, {maxAge: msLeft, secure: true, sameSite: 'strict'})
        //.cookie('smi-request-key', key, {maxAge: msLeft, secure: true, sameSite: 'strict'})
        .cookie('smi-token', token, {maxAge: msLeft, secure: true, sameSite: 'strict'})
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
    const token = jwt.sign({
		...req.body,
		uid: provider_uid,
        role: 'prv'
    }, JWT_SECRETKEY, { expiresIn: msLeft })
    res.cookie('smi-token', token, {maxAge: msLeft, secure: true})
        .sendStatus(200);
})
.delete(verifyToken, verifyRequester, (req,res) => {
    client.del(`prv:${req.token.uid}`);
    res.clearCookie('smi-token').sendStatus(200);
})

// inform requester that provider has accepted request, OK provider to proceed to chat as well.
router.post('/pend-request', verifyToken, verifyProvider, async (req,res) => {

	console.log('pend request endpoint, checking provider');
    const isProvider = await hasProvider(req.token.uid);
    if (! isProvider) {
        res.status(401).send(`Could not verify role.`)
    }

    const sessionId = messageHub.createSession();
	console.log(`notifying socket for request ${req.body.score}`);

    notifyOfAcceptedRequest(sessionId, req.body.score, req.token.name)
    .then(() => pendRequest(req.body.score))
    .then(() => {
        res.cookie('smi-session-id', sessionId)
        .cookie('smi-request', req.body.score)
        .sendStatus(200);
    }).catch(e => {
        console.error(e);
        res.sendStatus(500);
    })
})

router.post('/unpend-request', verifyToken, async (req, res) => {

    let authorized = false;

    if (req.token.uid) {
        authorized = hasProvider(req.body.uid);
    } else if (req.token.key) {
        authorized = hasRequester(req.body.key);
    }

    if (! authorized) {
        res.status(401).send(`Could not verify role.`);
    }

    unpendRequest(req.body.score)
    .then(() => {
        messageHub.sendMessage(req.body.sessionId, createControlMessage(req.body.p, 'CANCEL'));
		messageHub.endSession(req.body.sessionId, {closeSockets: true});
    })
    .then(() => {
        res.clearCookie('smi-request').clearCookie('smi-session-id').sendStatus(200);
    })
    .catch(e => {
        console.error(e);
        res.sendStatus(500);
    })
})

// generate list of recent requests for provider list view
router.get('/requests', verifyToken, (req,res) => {
    // TODO: add params (skip, limit, sort) for infinite scrolling, filtering, etc

    const skip = req.query.skip || 0;
    const limit = req.query.limit || 20;

    getActiveRequests(skip, limit).then(requests => {
        res.set('Content-Type', 'application/json').send(requests.map(r => {
            return r;
        }));
    }).catch(e => {
        console.error(e);
        res.status(500).send('could not fetch requests');
    })
})

module.exports = router;
