var express = require('express');
var passport = require('passport');
var router = express.Router();
var auth = require('../policies/auth.js');

/* GET home page */
router.get('/', function (req, res, next) {
    if (req.app.get('configurated')) {
        if (!req.isAuthenticated()) {
            res.redirect('/admin/login');
        } else {
            res.render('admin');
        }
    } else {
        req.app.models.users.find().exec(function (err, models) {
            if (err) return next(err);
            if (models.length == 0) {
                res.redirect('/admin/users/new');
            } else if (!req.isAuthenticated()) {
                res.redirect('/admin/login');
            } else {
                res.render('admin');
            }
        });
    }
});

/* GET login page */
router.get('/login', function (req, res) {
    res.locals.message = req.flash('message');
    res.render('login');
});

/* GET login */
router.post('/login', passport.authenticate('local', {
    failureRedirect: '/admin/login',
    failureFlash: true
}), function (req, res) {
    res.redirect('/admin');
});

/* GET logout */
router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/admin');
});

/* GET users: get all users */
router.get('/users', auth, function (req, res) {
    req.app.models.users.find().exec(function (err, models) {
        if (err) return next(err);
        res.locals.users = models;
        res.render('users-list');
    });
});

/* GET new user: create new account */
router.get('/users/new', auth, function (req, res) {
    req.app.models.users.find().exec(function (err, models) {
        if (err) return next(err);
        res.locals.connected = (models.length == 0);
        res.render('new-account');
    });
});

/* GET delete user: delete an user */
router.get('/users/delete/:email', auth, function (req, res) {
    if (req.user.email == req.params.email) {
        res.locals.success = 'user-not-deleted';
        res.render('success-page');
    } else {
        req.app.models.users.destroy({ id: req.params.email }, function (err) {
            if (err) return next(err);
            res.locals.success = 'user-deleted';
            res.render('success-page');
        });
    }
});

/* POST New user: save new user */
router.post('/users/new/', auth, function (req, res, next) {
    req.app.models.users.create(req.body, function (err, model) {
        if (err) return next(err);
        res.redirect('/admin/login');
    });
});

module.exports = router;
