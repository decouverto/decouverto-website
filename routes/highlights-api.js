var express = require('express');
var router = express.Router();
var auth = require('../policies/auth.js');
var randomstring = require('randomstring');

/* GET Highlights */
router.get('/', function (req, res, next) {
    res.json(req.app.highlights.getAll());
});

/* GET Highlight */
router.get('/:id', function (req, res, next) {
    req.app.highlights.get('id', req.params.id, function (err, model) {
        if (err) return next(err);
        res.json(model);
    });
});

/* POST Highlight */
router.post('/', auth, function (req, res, next) {
    req.body.id = randomstring.generate(5);
    req.app.highlights.post(req.body, function (err) {
        if (err) return next(err);
        res.json({ status: true, id: req.body.id });
    });
});

/* DELETE Highlight */
router.delete('/:id', auth, function (req, res, next) {
    req.app.highlights.delete('id', req.params.id, function (err) {
        if (err) return next(err);
        res.json({ status: true });
    });
});

module.exports = router;
