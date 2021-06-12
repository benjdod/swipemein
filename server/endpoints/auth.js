/* performs various "authorization" tasks to ensure that a user is legit */

const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

router.use(bodyParser.urlencoded({extended: true}));


router.get('/', (req,res) => {
    res.send('authorization routes');
});

module.exports = router;