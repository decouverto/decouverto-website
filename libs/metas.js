var fs = require('fs');

function MetasStore(init, path) {
  this.path = path;
  if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify(init));
  this.MetasStore = require(path);
}

MetasStore.prototype.getAll = function () {
    return this.MetasStore;
}

MetasStore.prototype.get = function (id) {
    if (this.MetasStore.hasOwnProperty(id)) {
        return this.MetasStore[id];
    } else {
        return '';
    }
}

MetasStore.prototype.put = function (id, val, cb) {
    this.MetasStore[id] = val;
    this.save(cb);
}

MetasStore.prototype.save = function (cb) {
    fs.writeFile(this.path, JSON.stringify(this.MetasStore), cb);
}

module.exports = function(init, path) {
  return new MetasStore(init, path);
}