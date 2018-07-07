var fs = require('fs');
var path = require('path');
var browserify = require('browserify');
var uglifyify = require('uglifyify');

var prod = function () {
    var b = browserify({ cache: {}, entries: [path.resolve(__dirname, '../public/javascripts/admin/index.js')], packageCache: {} });
    b.transform({
        global: true,
        sourcemap: false
    }, uglifyify);
    b.bundle().pipe(fs.createWriteStream(path.resolve(__dirname, '../public/javascripts/admin/build.js')));
};


if (module.parent) {
  module.exports = prod;
} else {
  prod();
}