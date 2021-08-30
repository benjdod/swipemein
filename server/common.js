const express = require('express')
const router = express.Router();

const { listRoutes } = require('./listroutes');

const dataRoutes = require('./endpoints/data.js');

router.use('/data', dataRoutes);

router.get('/', (_, res) => {
    res.send(listRoutes(router));
})

module.exports = router;