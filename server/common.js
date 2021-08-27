const express = require('express')
const router = express.Router();

const { listRoutes } = require('./listroutes');

const dataRoutes = require('./endpoints/data.js');

router.use('/data', dataRoutes);

router.get('/', (req,res) => {
    res.send(listRoutes(router));
})

module.exports = router;