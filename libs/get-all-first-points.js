var request = require('then-request');
var fs = require('fs');

module.exports = {
    get: function (cb) {
        
        request('GET', 'https://decouverto.fr/walks/index.json').getBody('utf8').then(JSON.parse).done(function (walks) {
            let promises = []     
            walks.forEach(function (w) {
                promises.push(new Promise(function (resolve, reject) {
                    let res = { id: w.id, title: w.title, dist: Math.round(w.distance/1000) }
                    request('GET', 'https://decouverto.fr/walks/' + w.id + '/index.json').getBody('utf8').then(JSON.parse).done(function (walk) {
                        res.lat = walk.itinerary[0].latitude;
                        res.lng = walk.itinerary[0].longitude;
                        //res.points = ''; 
                        //for (let k in walk.points) {
                        //    if (walk.points[k].title != 'Départ') {
                        //        res.points += '- ' + walk.points[k].title + ' '
                        //    }
                        //}
                        resolve(res)
                    })
                }));
            })
            Promise.all(promises).then(cb).catch(function (error) {
                console.error('Failed to get walks: ' + error.message);
                cb(null, error);
            });
        });
    },
    write: function (path,cb) {
        this.get(function (res) {
            fs.writeFile(path, JSON.stringify(res), 'utf8', cb);
        });
    }
}