var express = require('express');
var router = express.Router();
var auth = require('../policies/auth.js');

/* GET Stats */
router.get('/', auth, function (req, res, next) {
    res.json(req.app.generateStats());
});

/* GET Reset stats */
router.get('/reset/', auth, function (req, res, next) {
    res.app.stats.purge(function (err) {
        if (err) return next(err);
        res.json({ status: true });
    });
    
});

module.exports = router;