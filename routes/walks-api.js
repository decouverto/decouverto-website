var express = require('express');
var router = express.Router();
var auth = require('../policies/auth.js');
var path = require('path');
var fs = require('fs-extra');
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
var cleanString = require('get-clean-string')('-', { '\'': '-' });

/* GET Walks */
router.get('/', function (req, res, next) {
    res.json(req.app.walks.getAll());
});

/* GET Categories availible from walks */
router.get('/categories/', function (req, res, next) {
    var walks = req.app.walks.getAll();
    var categories = {
        sectors: [],
        themes: [],
    }
    walks.forEach(function (walk) {
        if (categories.sectors.indexOf(walk.zone) < 0) {
            categories.sectors.push(walk.zone);
        }
        if (categories.themes.indexOf(walk.theme) < 0) {
            categories.themes.push(walk.theme);
        }
    });
    res.json(categories);
});

function contains(title, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i].title === title) {
            return true;
        }
    }
    return false;
}

router.get('/categories/uri/', function (req, res, next) {
    var walks = req.app.walks.getAll();
    var categories = {
        sectors: [],
        themes: [],
    }
    walks.forEach(function (walk) {
        if (!contains(walk.zone, categories.sectors)) {
            categories.sectors.push({ title: walk.zone, uri: cleanString(walk.zone) });
        }
        if (!contains(walk.theme, categories.themes)) {
            categories.themes.push({ title: walk.theme, uri: cleanString(walk.theme) });
        }
    });
    res.json(categories);
});

/* GET Walk */
router.get('/:id', function (req, res, next) {
    req.app.walks.get('id', req.params.id, function (err, model) {
        if (err) return next(err);
        res.json(model);
    });
});

/* GET Walk center and first point (allow it for Découverto Maps) */
router.get('/:id/center', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    var p = path.resolve(__dirname, '../walks/', req.params.id + '/', 'index.json');
    existsFile(p, function (err, exists) {
        if (err || !exists) return next(err);
        fs.readFile(p, function (err, file) {
            if (err) return next(err);
            var data = JSON.parse(file);
            res.json({ center: data.center, first_point: data.itinerary[0], title: data.title });
        });
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


/* POST Walk: replace string */
var randomstring = require('randomstring');
var replace = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.resolve(__dirname, '../walks/'));
        },
        filename: function (req, file, cb) {
            cb(null, randomstring.generate(9) + '.zip');
        }
    })
});
router.post('/:id/change-zip', auth, replace.single('file'), function (req, res, next) {
    if (req.file === undefined) {
        err = new Error('You must upload a file.');
        err.status = 400;
        return next(err);
    }
    res.json({ status: true });
    var p = path.resolve(__dirname, '../walks/', req.file.filename.replace('.zip', ''));
    var old = path.resolve(__dirname, '../walks/', req.params.id);
    existsFile(p + '.zip', function (err, exists) {
        if (!err && exists) {
            try {
                fs.removeSync(old);
                var unzipper = new DecompressZip(p + '.zip');
                unzipper.extract({
                    path: old,
                    filter: function (file) {
                        return file.type !== "SymbolicLink";
                    }
                });
                unzipper.on('error', function (err) {
                    if (req.app.get('env') === 'development') {
                        console.error(err);
                    }
                });
                unzipper.on('extract', function () {
                    fs.moveSync(p + '.zip', old + '.zip', { overwrite: true });
                });
            } catch (e) {
                if (req.app.get('env') === 'development') {
                    console.error(e);
                }
            }
        }
    });
});

/* PUT Walk */
router.put('/:id', auth, function (req, res, next) {
    req.app.walks.get('id', req.params.id, function (err, val) {
        if (err) return next(err);
        val.title = req.body.title;
        val.description = req.body.description;
        val.theme = req.body.theme;
        val.zone = req.body.zone;
        val.fromBook = req.body.fromBook;
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
                rimraf(p, function () { });
            }
        });
        existsFile(p + '.zip', function (err, exists) {
            if (!err && exists) {
                fs.unlink(p + '.zip', function () { });
            }
        });
    });
});

module.exports = router;
