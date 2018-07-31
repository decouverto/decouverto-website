var express = require('express');
var router = express.Router();
var auth = require('../policies/auth.js');

/* GET Stats */
router.get('/', auth, function (req, res, next) {
    res.json(req.app.generateStats());
});

module.exports = router;