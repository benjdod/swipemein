const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const router = express.Router();

router.use(bodyParser.json());
router.use(cookieParser());

router.post('/post-request', (req,res) => {
    console.log(req.body);

    const now = new Date(Date.now());

    // add a new request cookie that expires at midnight 
    const secondsleft = 86400 - (now.getHours() * 3600) - (now.getMinutes() * 60) - (now.getSeconds());
    res.cookie('smi-request', JSON.stringify(req.body), {maxAge: secondsleft})
        .sendStatus(200);
});

router.get('/', (req,res) => {
    res.send('api routes');
});

module.exports = router;