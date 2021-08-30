const express = require('express');
const fetch = require('node-fetch');

const app = express();
const port = 8081;
const proxyURL = 'http://localhost:3000'

app.all('*', (req, res) => {
    fetch(`${proxyURL}${req.url}`, {
        method: 'GET',
    }).then(r => r.text())
    .then(proxiedRes => {
        res.send(proxiedRes);
    }).catch(e => {
        console.error(e);
        res.status(500).send('error!');
    })
})

app.listen(port, () => {
    console.log(`proxy express server listening on port ${port}.`)
})