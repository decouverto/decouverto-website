var express = require('express');
var router = express.Router();
var auth = require('../policies/auth.js');
var randomstring = require('randomstring');

/* GET Shops */
router.get('/', function (req, res, next) {
    res.json(req.app.shops.getAll());
});

/* GET Shop */
router.get('/:id', function (req, res, next) {
    req.app.shops.get('id', req.params.id, function (err, model) {
        if (err) return next(err);
        res.json(model);
    });
});

/* POST Shop */
router.post('/', auth, function (req, res, next) {
    req.body.id = randomstring.generate(7);
    req.app.shops.post(req.body, function (err) {
        if (err) return next(err);
        res.json({ status: true });
    });
});

/* PUT Shop */
router.put('/:id', auth, function(req, res, next) {
    req.app.shops.get('id', req.params.id, function (err, val) {
        if (err) return next(err);
        val.title = req.body.title;
        val.description = req.body.description;
        val.latitude =  req.body.latitude; 
        val.longitude =  req.body.longitude;
        val.address =  req.body.address;
        req.app.shops.put('id', req.params.id, val, function (err) {
            if (err) return next(err);
            res.json({ status: true });
        });
    });
});


/* DELETE Shop */
router.delete('/:id', auth, function (req, res, next) {
    req.app.shops.delete('id', req.params.id, function (err) {
        if (err) return next(err);
        res.json({ status: true });
    });
});

module.exports = router;
