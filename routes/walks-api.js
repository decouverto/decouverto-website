var express = require('express');
var router = express.Router();
var auth = require('../policies/auth.js');
var path = require('path');
var fs = require('fs');
var existsFile = require('exists-file');
var multer = require('multer');
var rimraf = require('rimraf');
var DecompressZip = require('decompress-zip');
var upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.resolve(__dirname, '../walks/'));
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
        var p = path.resolve(__dirname, '../walks/', req.body.id);
        existsFile(p + '.zip', function (err, exists) {
            if (!err && exists) {
                var unzipper = new DecompressZip(p + '.zip');
                unzipper.extract({
                    path: p,
                    filter: function (file) {
                        return file.type !== "SymbolicLink";
                    }
                });
                unzipper.on('error', function (err) {
                    if (req.app.get('env') === 'development') {
                        console.error(err);
                    }
                });
            }
        });
    });
});

/* PUT Walk */
router.put('/:id', auth, function(req, res, next) {
    req.app.walks.get('id', req.params.id, function (err, val) {
        if (err) return next(err);
        val.title = req.body.title;
        val.description = req.body.description;
        req.app.walks.put('id', req.params.id, val, function (err) {
            if (err) return next(err);
            res.json({ status: true });
        });
    });
});


/* DELETE Walk */
router.delete('/:id', auth, function (req, res, next) {
    req.app.walks.delete('id', req.params.id, function (err) {
        if (err) return next(err);
        res.json({ status: true });
        var p = path.resolve(__dirname, '../walks/', req.params.id);
        existsFile(p, function (err, exists) {
            if (!err && exists) {
                rimraf(p, function (){});
            }
        });
        existsFile(p + '.zip', function (err, exists) {
            if (!err && exists) {
                fs.unlink(p + '.zip', function (){});
            }
        });
    });
});

module.exports = router;
