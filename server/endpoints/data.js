const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const redis = require('redis');
const crypto = require('crypto');

const { notifyOfAcceptedRequest } = require('./chatserver');
const messageHub = require('./messagehub');

const client = redis.createClient(6379);
const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));
router.use(cookieParser());

//
// --- Requester endpoints --------------------------
//

// POST and DELETE requests
router.post('/request', (req,res) => {
    
    // note: uuid generation like this is very safe
    // see https://stackoverflow.com/questions/49267840/are-the-odds-of-a-cryptographically-secure-random-number-generator-generating-th
    const request_uid = crypto.randomBytes(16).toString('hex');

    const request_data = {...req.body, uid: request_uid}

    client.lpush('requests', JSON.stringify(request_data));

    // add a new request cookie that expires at midnight 
    const now = new Date(Date.now());
    const msLeft = (86400 - (now.getHours() * 3600) - (now.getMinutes() * 60) - (now.getSeconds())) * 1000;
    res.cookie('smi-request', JSON.stringify(request_data), {maxAge: msLeft, secure: true})
        .sendStatus(200);
});
router.delete('/request', (req,res) => {
    // WARNING: this might be sketchy 
    client.lrem('requests', 0, JSON.stringify(req.body));
    res.clearCookie('smi-request').sendStatus(200);
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
router.post('/accept-request', (req,res) => {
    console.log('accept request: ', req.body.uid);

    const sessionId = messageHub.createSession();

    if (notifyOfAcceptedRequest(req.body.uid, sessionId))
        res.cookie('smi-session-id', sessionId).sendStatus(200);
    else
        res.sendStatus(500);
})

// generate list of recent requests for provider list view
router.get('/requests', (req,res) => {
    // TODO: add params (skip, limit, sort) for infinite scrolling, filtering, etc
    client.lrange('requests', 0, 10, (err, requests) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }
        res.set('Content-Type', 'application/json').send(JSON.stringify(requests.map(r => JSON.parse(r))));
    });
})

module.exports = router;