var express = require('express');
var router = express.Router();
var cache = require('../libs/template-cache.js');
var existsFile = require('exists-file');
var path = require('path');
var cleanString = require('get-clean-string')('-', {'\'': '-'});

/* GET home page */
router.get('/', cache(1800), function (req, res, next) {
    walks = req.app.walks.getAll();
    highlights = req.app.highlights.getAll();
    length = walks.length;
    selected_walks = [];
    walks.forEach(function (element) {
        for (var k in highlights) {
            if (highlights[k].walk_id == element.id) {
                selected_walks.push(element);
            }
        }
    });
    res.locals.selected_walks = selected_walks;
    res.locals.walks = walks.slice(Math.max(length - 6, 1));
    res.locals.walks_number = length;
    res.locals.metas = req.app.metas.getAll();
    res.render('index');
    req.app.stats.add('home', function () { });
});

/* GET walks page */
router.get('/rando/', cache(1800), function (req, res, next) {
    res.locals.walks = req.app.walks.getAll();
    res.locals.metas = req.app.metas.getAll();
    res.render('walks');
    req.app.stats.add('home', function () { });
});

/* GET sector page */
router.get('/secteur/:sector', cache(120), function (req, res, next) {
    var tmp = req.app.walks.getAll();
    var walks = [];
    var title = '';
    tmp.forEach(function (el) {
        if (req.params.sector == cleanString(el.zone)) {
            walks.push(el);
            title = el.zone;
        }
    });
    if (walks.length == 0) {
        title = 'Catégorie introuvable'
        res.status(404);
    }
    res.locals.walks = walks;
    res.locals.categoryType = 'secteur';
    res.locals.item = req.params.sector;
    res.locals.title = title;
    res.locals.meta = req.app.metas.get('short_desc');
    res.render('categories');
    req.app.stats.add('categories', function () { }); 
});

/* GET sector page */
router.get('/theme/:theme', cache(120), function (req, res, next) {
    var tmp = req.app.walks.getAll();
    var walks = [];
    var title = '';
    tmp.forEach(function (el) {
        if (req.params.theme == cleanString(el.theme)) {
            walks.push(el);
            title = el.theme;
        }
    });
    if (walks.length == 0) {
        title = 'Catégorie introuvable'
        res.status(404);
    }
    res.locals.walks = walks;
    res.locals.categoryType = 'theme';
    res.locals.item = req.params.theme;
    res.locals.title = title;
    res.locals.meta = req.app.metas.get('short_desc');
    res.render('categories');
    req.app.stats.add('categories', function () { });
});

/* GET sitemap.xml */
router.get('/sitemap.xml', function (req, res, next) {
    var text = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
            <loc>https://decouverto.fr/</loc>
            <changefreq>weekly</changefreq>
            <priority>1</priority>
        </url>
        <url>
            <loc>https://decouverto.fr/livres/</loc>
            <changefreq>monthly</changefreq>
            <priority>0.8</priority>
        </url>
        <url>
            <loc>https://decouverto.fr/rando/</loc>
            <changefreq>monthly</changefreq>
            <priority>0.5</priority>
        </url>
        <url>
            <loc>https://decouverto.fr/documentation-installation/</loc>
            <changefreq>monthly</changefreq>
            <priority>0.2</priority>
        </url>`
    req.app.walks.getAll().forEach(function (el) {
        text += `<url>
            <loc>https://decouverto.fr/rando/${el.id}/</loc>
            <changefreq>monthly</changefreq>
        </url>`;
    });
    text += '</urlset>';
    res.contentType('application/xml');
    res.send(text);
});

/* GET installation doc page */
router.get('/documentation-installation/', function (req, res) {
    res.locals.metas = req.app.metas.getAll();
    res.render('install-doc');
    req.app.stats.add('install-doc', function () { });
});

/* GET books page */
router.get('/livres/', function (req, res, next) {
    res.locals.metas = req.app.metas.getAll();
    res.locals.shops = req.app.shops.getAll();
    res.render('books');
    req.app.stats.add('books', function () { });
});

/* GET walk preview page */
router.get('/rando/:id', function (req, res, next) {
    req.app.walks.get('id', req.params.id, function (err, data) {
        if (err) {
            var err = new Error('Élément introuvable');
            err.status = 404;
            return next(err);
        };
        res.locals.walk = data;
        res.locals.sectorLink = cleanString(res.locals.walk.zone);
        res.locals.themeLink = cleanString(res.locals.walk.theme);
        var p = path.resolve(__dirname, '../walks/', req.params.id + '/index.json');
        existsFile(p, function (err, exists) {
            if (!err && exists) {
                res.locals.decompressedFile = require(p);
            } else {
                res.locals.decompressedFile = false;
            }
            res.render('preview');
            req.app.stats.add(req.params.id + '-prev', function () { });
        });
    });
});

router.get('/rando/:id/gpx-download', function (req, res, next) {
    req.app.walks.get('id', req.params.id, function (err, data) {
        if (err) {
            var err = new Error('Élément introuvable');
            err.status = 404;
            return next(err);
        };
        res.locals.walk = data;
        res.locals.sectorLink = cleanString(res.locals.walk.zone);
        res.locals.themeLink = cleanString(res.locals.walk.theme);
        var p = path.resolve(__dirname, '../walks/', req.params.id + '/index.json');
        existsFile(p, function (err, exists) {
            if (!err && exists) {
                res.locals.decompressedFile = require(p);
            } else {
                res.locals.decompressedFile = false;
            }
            res.render('gpx-download');
        });
    });
});


module.exports = router;