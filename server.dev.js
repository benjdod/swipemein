const express = require('express');
const webpack = require('webpack');
const wdm = require('webpack-dev-middleware');
const path = require('path');

const app = express();
const config = require('./webpack.config.js');
const compiler = webpack(config);

app.use(
    wdm(compiler, {
        publicPath: config.output.publicPath
    })
);

app.use(express.static('./public'))

app.get('*', (req,res) => {
    res.sendFile(path.resolve(__dirname, './public/index.html'));
})

app.listen(8080, () => {
    console.log('express app listening on 8080');
})