var express = require('express');
var router = express.Router();
var auth = require('../policies/auth.js');

/* GET home page */
router.get('/', function (req, res, next) {
    res.locals.walks = req.app.walks.getAll();
    res.render('index');    
});

module.exports = router;
