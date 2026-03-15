var express = require('express');
var router = express.Router();
var auth = require('../policies/auth.js');
var path = require('path');
var fs = require('fs-extra');
var existsFile = require('exists-file');
var multer = require('multer');
var crypto = require('crypto');

// Multer storage configuration - save audio files with hash filename
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(__dirname, '../songs/'));
    },
    filename: function (req, file, cb) {
        // Generate hash from file content
        var hash = crypto.randomBytes(16).toString('hex');
        var ext = path.extname(file.originalname);
        cb(null, hash + ext);
    }
});
var upload = multer({ storage: storage });

/* GET all songs */
router.get('/', function (req, res, next) {
    res.json(req.app.songs.getAll());
});

/* GET single song */
router.get('/:id', function (req, res, next) {
    req.app.songs.get('id', req.params.id, function (err, model) {
        if (err) return next(err);
        res.json(model);
    });
});

/* POST new song */
router.post('/', auth, upload.single('audio'), function (req, res, next) {
    if (req.file === undefined) {
        var err = new Error('You must upload an audio file.');
        err.status = 400;
        return next(err);
    }

    var songData = {
        id: req.body.id || crypto.randomBytes(8).toString('hex'),
        title: req.body.title,
        description: req.body.description,
        audio: req.file.filename,
        cover: req.body.cover || null
    };

    req.app.songs.post(songData, function (err) {
        if (err) return next(err);
        res.json({ status: true, id: songData.id });
    });
});

/* PUT update song */
router.put('/:id', auth, function (req, res, next) {
    req.app.songs.get('id', req.params.id, function (err, val) {
        if (err) return next(err);
        val.title = req.body.title;
        val.description = req.body.description;
        if (req.body.cover !== undefined) {
            val.cover = req.body.cover || null;
        }
        req.app.songs.put('id', req.params.id, val, function (err) {
            if (err) return next(err);
            res.json({ status: true });
        });
    });
});

/* DELETE song */
router.delete('/:id', auth, function (req, res, next) {
    req.app.songs.get('id', req.params.id, function (err, song) {
        if (err) return next(err);

        req.app.songs.delete('id', req.params.id, function (err) {
            if (err) return next(err);
            res.json({ status: true });

            // Delete audio file
            if (song && song.audio) {
                var audioPath = path.resolve(__dirname, '../songs/', song.audio);
                existsFile(audioPath, function (err, exists) {
                    if (!err && exists) {
                        fs.unlink(audioPath, function () { });
                    }
                });
            }
        });
    });
});

module.exports = router;
