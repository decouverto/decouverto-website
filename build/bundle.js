var fs = require('fs');
var path = require('path');
var browserify = require('browserify');
var uglifyify = require('uglifyify');

function build (name) {
    browserify({ cache: {}, entries: [path.resolve(__dirname, '../public/javascripts/'+ name +'/index.js')], packageCache: {} })
    .transform({
            global: true,
            sourcemap: false
    }, uglifyify)
    .bundle()
    .pipe(fs.createWriteStream(path.resolve(__dirname, '../public/javascripts/'+ name +'/build.js')));
}

var bundle = {
    admin: function () {
        build('admin');
    },
    preview: function () {
        build('preview');
    },
    index: function () {
        build('index');
    },
    all: function () {
        this.admin();
        this.preview();
        this.index();
    }
};

if (module.parent) {
    module.exports = bundle;
} else {
    bundle.all();
}