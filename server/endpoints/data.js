const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const redis = require('redis');
const crypto = require('crypto');

const { acceptRequest } = require('./chatserver');

const client = redis.createClient(6379);
const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));
router.use(cookieParser());

router.post('/request', (req,res) => {
    
    console.log(req.body);

    // WARNING: this should check to make sure the uid doesn't collide with any other one in the database
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

    // WARNING: this is sketchy 
    client.lrem('requests', 0, JSON.stringify(req.body));
    res.clearCookie('smi-request').sendStatus(200);
})

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

router.get('/requests', (req,res) => {
    client.lrange('requests', 0, 10, (err, requests) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }
        
        res.set('Content-Type', 'application/json').send(JSON.stringify(requests.map(r => JSON.parse(r))));
    });
})

router.post('/accept-request', (req,res) => {
    console.log('accept request: ', req.body.uid);
    acceptRequest(req.body.uid);
    res.sendStatus(200);
})

router.get('/', (req,res) => {
    res.send('api routes');
});

module.exports = router;