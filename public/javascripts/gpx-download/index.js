

var id = window.location.pathname.split('/').slice(-1)[0].replace('gpx-download', '');
if (id == '') {
    id = window.location.pathname.split('/').slice(-2)[0].replace('gpx-download', '');
}

var getJSON = require('./get-json.js');
var createGpx = require('gps-to-gpx').default;

function download() {
    getJSON('/walks/' + id + '/index.json', function (err, data) {
        var gpx = createGpx(data.itinerary, {});
        var element = document.createElement('a');
        element.setAttribute('href', 'data:application/gpx+xml;charset=utf-8,' + encodeURIComponent(gpx));
        element.setAttribute('download', data.title + '.gpx');

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    });
}
document.getElementById('download').onclick = download;

