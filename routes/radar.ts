const express = require('express')
const getProtocol = require('../protocols/protocols')

const router = express.Router()

router.post("/", getProtocol, (req, res) => {

})

module.exports = router