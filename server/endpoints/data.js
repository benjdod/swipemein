const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const redis = require('redis');
const client = redis.createClient(6379);
const router = express.Router();

router.use(bodyParser.json());
router.use(cookieParser());

router.post('/request', (req,res) => {
    console.log(req.body);

    let request_uid = Math.floor(Math.random() * 0xFFFFFFFF).toString(16).padStart(8,'0');

    client.set(`req:${request_uid}`, JSON.stringify(req.body));

    // add a new request cookie that expires at midnight 
    const now = new Date(Date.now());
    const msLeft = (86400 - (now.getHours() * 3600) - (now.getMinutes() * 60) - (now.getSeconds())) * 1000;
    res.cookie('smi-request', JSON.stringify({...req.body, uid: request_uid}), {maxAge: msLeft})
        .sendStatus(200);
});

router.delete('/request', (req,res) => {
    console.log(req.body);
    client.del(`req:${req.body.uid}`);
    res.clearCookie('smi-request').sendStatus(200);
})

router.get('/', (req,res) => {
    res.send('api routes');
});

module.exports = router;