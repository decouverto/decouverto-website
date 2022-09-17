var mongoAdapter = require('sails-mongo');
var Waterline = require('waterline');
var fs = require('fs');
var path = require('path');
var isDocker = require('../libs/is-docker.js');

var orm = new Waterline();

var config = {
    adapters: {
        mongo: mongoAdapter
    },
    connections: {
        mongo: {
          adapter: 'mongo',
          database: 'decouverto'
        }
    },
    defaults: {
        migrate: 'safe'
    },
};

if (isDocker()) {
  config.connections.mongo.host = 'mongo';
}

fs.readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function(file) {
    var model = require(path.join(__dirname, file));
    orm.loadCollection(model);
  });

module.exports = {waterline: orm, config: config};