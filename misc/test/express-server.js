const express = require('express');

const server = express();
const PORT = 3000;

server.get('/', (req, res) => {
    console.log(req.headers['content-type']);
    res.send(`<pre>hello, you've reached the index</pre>`);
})

server.post('/', (req,res) => {

    if (req.headers['content-type'] != 'text/plain') {
        res.status(400).send(`bad content type; must be text/plain`);
    } else {
        res.sendStatus(200);
    }

})

server.listen(PORT, () => {
    console.log(`test express server listening at ${PORT}`);
})