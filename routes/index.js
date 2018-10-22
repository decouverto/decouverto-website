var express = require('express');
var router = express.Router();
var auth = require('../policies/auth.js');
var existsFile = require('exists-file');
var path = require('path');

/* GET home page */
router.get('/', function (req, res, next) {
    res.locals.walks = req.app.walks.getAll();
    res.locals.metas = req.app.metas.getAll();
    res.render('index');
    req.app.stats.add('home', function () { });
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
            req.app.stats.add(req.params.id + '-prev', function () { });
        });
    });
});


module.exports = router;