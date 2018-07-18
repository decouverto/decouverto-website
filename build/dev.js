var fs = require('fs');
var bs = require('browser-sync');
var bundle = require('./bundle');
var p = require('path');

process.on('uncaughtException', function (err) {
  console.error(err);
});

var path = function (d) {
  return p.resolve(__dirname, d);
};

var dev = function () {
  bs.init({
    proxy: 'http://localhost:' + require('env-port')('8000')
  });

  bs.watch(path('../public/stylesheets/admin-styles.css')).on('change', bs.reload);
  bs.watch(path('../public/stylesheets/index-styles.css')).on('change', bs.reload);
  bs.watch(path('../public/views/*.html')).on('change', bs.reload);
  bs.watch(path('../views/*.ejs')).on('change', bs.reload);
  bs.watch(path('../public/javascripts/admin/*.js'), {
    ignored: /build/
  }).on('change', function () {
    bs.notify('Compiling...');
    bundle.admin();
    bs.reload();
  });
  bs.watch(path('../public/javascripts/preview/*.js'), {
    ignored: /build/
  }).on('change', function () {
    bs.notify('Compiling...');
    bundle.preview();
    bs.reload();
  });
};

if (module.parent) {
  module.exports = dev;
} else {
  dev();
}