var express = require('express');
var router = express.Router();
var auth = require('../policies/auth.js');
var existsFile = require('exists-file');
var path = require('path');

/* GET home page */
router.get('/', function (req, res, next) {
    res.locals.walks = req.app.walks.getAll();
    res.render('index');
});

/* GET walk preview page */
router.get('/preview/:id', function (req, res, next) {
    req.app.walks.get('id', req.params.id, function (err, data) {
        if (err) return next(err);
        res.locals.walk = data;
        var p = path.resolve(__dirname, '../walks/', req.params.id + '/index.json');
        existsFile(p, function (err, exists) {
            if (!err && exists) {
                res.locals.decompressedFile = require(p);
            } else {
                res.locals.decompressedFile = false;
            }
            res.render('preview');
        });
    });
});


module.exports = router;