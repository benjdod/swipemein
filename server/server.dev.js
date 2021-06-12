const express = require('express');
const webpack = require('webpack');
const wdm = require('webpack-dev-middleware');
const whm = require('webpack-hot-middleware');
const path = require('path');

const app = express();
const config = require('../webpack.config.js');
const compiler = webpack(config);

const apiRoutes = require('./common.js');

app.use(
    wdm(compiler, {
        publicPath: config.output.publicPath
    })
);

app.use(
    whm(compiler, {
        log: console.log,
        path: '/__webpack_hmr',
        heartbeat: 10*1000,
    })
);

app.use(express.static('./public'));    // frontend
app.use('/api', apiRoutes);             // backend

app.get('*', (req,res) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
})

app.listen(8080, () => {
    console.log('express app listening on 8080');
})