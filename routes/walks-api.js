var express = require('express');
var router = express.Router();
var auth = require('../policies/auth.js');
var path = require('path');
var multer = require('multer');
var upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './walks/');
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        }
    })
});

/* GET Walks */
router.get('/', function (req, res, next) {
    res.json(req.app.walks.getAll());
});

/* GET Walk */
router.get('/:id', function (req, res, next) {
    req.app.walks.get('id', req.params.id, function (err, model) {
        if (err) return next(err);
        res.json(model);
    });
});

/* POST Walk */
router.post('/', auth, upload.single('file'), function (req, res, next) {
    if (req.file === undefined) {
        err = new Error('You must upload a file.');
        err.status = 400;
        return next(err);
    }
    req.app.walks.post(req.body, function (err) {
        if (err) return next(err);
        res.json({ status: true });
    });
});

/* DELETE Walk */
router.delete('/:id', auth, function (req, res, next) {
    req.app.walks.delete('id', req.params.id, function (err) {
        if (err) return next(err);
        res.json({ status: true });
    });
});

module.exports = router;
