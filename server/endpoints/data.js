const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const redis = require('redis');
const { request } = require('express');

const client = redis.createClient(6379);

const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));
router.use(cookieParser());

router.post('/request', (req,res) => {
    console.log(req.body);


    // FIXME: this should check to make sure the uid doesn't collide with any other one in the database

    let request_uid = Math.floor(Math.random() * 0xFFFFFFFF).toString(16).padStart(8,'0');

    client.set(`req:${request_uid}`, JSON.stringify(req.body));

    // add a new request cookie that expires at midnight 
    const now = new Date(Date.now());
    const msLeft = (86400 - (now.getHours() * 3600) - (now.getMinutes() * 60) - (now.getSeconds())) * 1000;
    res.cookie('smi-request', JSON.stringify({...req.body, uid: request_uid}), {maxAge: msLeft})
        .sendStatus(200);
});

router.delete('/request', (req,res) => {
    client.del(`req:${req.body.uid}`);
    res.clearCookie('smi-request').sendStatus(200);
})

router.post('/provider', (req,res) => {

    let request_uid = Math.floor(Math.random() * 0xFFFFFFFF).toString(16).padStart(8,'0');

    client.set(`prv:${request_uid}`, JSON.stringify(req.body));
    const now = new Date(Date.now());
    const msLeft = (86400 - (now.getHours() * 3600) - (now.getMinutes() * 60) - (now.getSeconds())) * 1000;
    res.cookie('smi-provider', JSON.stringify({...req.body, uid: request_uid}), {maxAge: msLeft})
        .sendStatus(200);
})

router.delete('/provider', (req,res) => {
    client.del(`prv:${req.body.uid}`);
    res.clearCookie('smi-provider').sendStatus(200);
})

router.get('/requests', (req,res) => {
    res.set('Content-Type', 'application/json').send(`[{"name": "Bardledoo", "classyear": 2022, "time": 540, "message": "Hello my name is Bardledoo!"}]`);
})

router.get('/', (req,res) => {
    res.send('api routes');
});


module.exports = router;