var express = require('express');
var router = express.Router();
var auth = require('../policies/auth.js');

/* GET Metas */
router.get('/', auth, function (req, res, next) {
    res.json(req.app.metas.getAll());
});


/* GET Meta */
router.get('/:id', auth, function (req, res, next) {
    res.json({
        value: req.app.metas.get(req.params.id)
    });
});

/* PUT Meta */
router.put('/:id', auth, function (req, res, next) {
    req.app.metas.put(req.params.id, req.body.value, function (err) {
        if (err) return next(err);
        res.json({ status: true });
    });
});

module.exports = router;
