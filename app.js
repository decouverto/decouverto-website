var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var serveIndex = require('serve-index');
var compress = require('compression');
var minifyTemplate = require('express-beautify').minify;
var isDocker = require('./libs/is-docker.js');

var passport = require('passport');
var hash = require('password-hash-and-salt');
var flash = require('connect-flash');
var helmet = require('helmet');
var session = require('express-session');

var MongoDBStore = require('connect-mongodb-session')(session);
var LocalStrategy = require('passport-local').Strategy;

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(compress());

if (app.get('env') === 'development') {
    app.use(logger('dev'));
} else {
    app.use(compress());
    app.use(minifyTemplate());
}
  
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 259200000, immutable: false }));

app.use('/save', express.static(path.join(__dirname, 'walks'), { maxAge: 3600000, immutable: false }));
app.use('/save/metas.json', express.static(path.join(__dirname, 'metas.json'), { maxAge: 3600000, immutable: false }));
app.use('/save/shops.json', express.static(path.join(__dirname, 'shops.json'), { maxAge: 3600000, immutable: false }));

app.use('/walks', function (req, res, next) {
    next();
    if (/zip/gi.test(req.url)) {
        app.stats.add(req.url.replace('/', '').replace('.zip', ''), function () {});
    }
});

app.use('/walks/first-points.json', function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); 
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); 
    res.setHeader('Access-Control-Allow-Credentials', true); 
    next()
});

app.use('/walks', express.static(path.join(__dirname, 'walks'), { maxAge: 3600000, immutable: false }));
app.use('/walks', serveIndex(path.join(__dirname, 'walks')));

app.use(helmet());

app.use('/', require('./routes/index'));

app.use(flash());


var mongoHost = 'localhost';
if (isDocker()) {
    mongoHost = 'mongo';
}

app.use(session({
    secret: 'website of the Découverto organization',
    name: 'decouverto-session',
    proxy: false,
    resave: true,
    saveUninitialized: true,
    store: new MongoDBStore({
        uri: 'mongodb://'+mongoHost+':27017/decouverto',
        collection: 'sessions'
    })
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/users-api'));
app.use('/api/metas', require('./routes/metas-api'));
app.use('/api/walks', require('./routes/walks-api'));
app.use('/api/stats', require('./routes/stats-api'));
app.use('/api/shops', require('./routes/shops-api'));
app.use('/api/force-tasks', require('./routes/force-tasks-api'));

// authentication
passport.serializeUser(function (model, done) {
    done(null, model.email);
});

passport.deserializeUser(function (email, done) {
    app.models.users.findOne({ email: email }, function (err, model) {
        if (model != null) {
            delete model.password;
            return done(err, model);
        }
        done(err, false);
    });
});

// define local strategy
passport.use('local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, function (email, password, done) {
    // search in database
    app.models.users.findOne({ email: email }, function (err, model) {
        if (err) { return done(err); }
        if (!model) {
            return done(null, false, { message: 'invalid-email' });
        }
        // test password
        hash(password).verifyAgainst(model.password, function (err, verified) {
            if (err || !verified) {
                return done(null, false, {
                    message: 'invalid-password'
                });
            } else {
                var returnmodel = {
                    email: model.email
                };
                return done(null, returnmodel, {
                    message: 'Connexion réussi.'
                });
            }
        });
    });
}));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Élément introuvable');
    res.status(404);
    res.render('404');
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            status: err.status || 500,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        status: err.status || 500, 
        error: {}
    });
});

module.exports = app;
