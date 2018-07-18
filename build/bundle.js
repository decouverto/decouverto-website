var fs = require('fs');
var path = require('path');
var browserify = require('browserify');
var uglifyify = require('uglifyify');

var bundle = {
    admin: function () {
        var bAdmin = browserify({ cache: {}, entries: [path.resolve(__dirname, '../public/javascripts/admin/index.js')], packageCache: {} });
        bAdmin.transform({
            global: true,
            sourcemap: false
        }, uglifyify);
        bAdmin.bundle().pipe(fs.createWriteStream(path.resolve(__dirname, '../public/javascripts/admin/build.js')));
    },
    preview: function () {
        var bPreview = browserify({ cache: {}, entries: [path.resolve(__dirname, '../public/javascripts/preview/index.js')], packageCache: {} });
        bPreview.transform({
            global: true,
            sourcemap: false
        }, uglifyify);
        bPreview.bundle().pipe(fs.createWriteStream(path.resolve(__dirname, '../public/javascripts/preview/build.js')));
    },
    all: function () {
        this.admin();
        this.preview();
    }
};

if (module.parent) {
    module.exports = bundle;
} else {
    bundle.all();
}