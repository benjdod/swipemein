const express = require('express');
const path = require('path');

const app = express();

const apiRoutes = require('./common.js');
const {bindChatServer} = require('./endpoints/chatserver.js');

app.use(express.static('./public'));        // frontend
app.use('/api', apiRoutes);                 // backend

app.get('/ping', (req,res) => {
    res.sendStatus(200);
})

app.get('*', (req,res) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
})

const server = app.listen(8080, () => {
    console.log('express app listening on 8080');
})

bindChatServer(server);