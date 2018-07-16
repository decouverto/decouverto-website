var express = require('express');
var router = express.Router();
var auth = require('../policies/auth.js');

/* GET home page */
router.get('/', function (req, res, next) {
    res.locals.walks = req.app.walks.getAll();
    res.render('index');
});

/* GET walk preview page */
router.get('/:id', function (req, res, next) {
    req.app.walks.get('id', req.params.id, function (err, data) {
        if (err) return next(err);
        res.locals.walk = data;
        res.render('walk');
    });
});


module.exports = router;
