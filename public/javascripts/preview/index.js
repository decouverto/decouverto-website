
function resizeImage(el) {
    var containerWidth = el.parentNode.parentElement.clientWidth - 24;
    if (containerWidth > 800) {
        containerWidth = 800;
    }
    if (containerWidth > el.naturalWidth) {
        el.style.width = el.naturalWidth + 'px';
        el.style.height = el.naturalHeight + 'px';
    } else {
        el.style.width = containerWidth + 'px';
        el.style.height = containerWidth * el.naturalHeight / el.naturalWidth + 'px';
    }
}
function getOrientedUrlFromFile(file, callback2) {
    var callback = function (srcOrientation) {
        var reader2 = new FileReader();
        reader2.onload = function (e) {
            var srcBase64 = e.target.result;
            var img = new Image();

            img.onload = function () {
                var width = img.width,
                    height = img.height,
                    canvas = document.createElement('canvas'),
                    ctx = canvas.getContext('2d');

                // set proper canvas dimensions before transform & export
                if (4 < srcOrientation && srcOrientation < 9) {
                    canvas.width = height;
                    canvas.height = width;
                } else {
                    canvas.width = width;
                    canvas.height = height;
                }

                // transform context before drawing image
                switch (srcOrientation) {
                    case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
                    case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
                    case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
                    case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
                    case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
                    case 7: ctx.transform(0, -1, -1, 0, height, width); break;
                    case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
                    default: break;
                }

                // draw image
                ctx.drawImage(img, 0, 0);

                // export base64
                callback2(canvas.toDataURL());
            };

            img.src = srcBase64;
        }

        reader2.readAsDataURL(file);
    }

    var reader = new FileReader();
    reader.onload = function (e) {

        var view = new DataView(e.target.result);
        if (view.getUint16(0, false) != 0xFFD8) return callback(-2);
        var length = view.byteLength, offset = 2;
        while (offset < length) {
            var marker = view.getUint16(offset, false);
            offset += 2;
            if (marker == 0xFFE1) {
                if (view.getUint32(offset += 2, false) != 0x45786966) return callback(-1);
                var little = view.getUint16(offset += 6, false) == 0x4949;
                offset += view.getUint32(offset + 4, little);
                var tags = view.getUint16(offset, little);
                offset += 2;
                for (var i = 0; i < tags; i++)
                    if (view.getUint16(offset + (i * 12), little) == 0x0112)
                        return callback(view.getUint16(offset + (i * 12) + 8, little));
            }
            else if ((marker & 0xFF00) != 0xFF00) break;
            else offset += view.getUint16(offset, false);
        }
        return callback(-1);
    };
    reader.readAsArrayBuffer(file);
}

function getOrientedUrl(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('get', url);
    xhr.responseType = 'blob';
    xhr.onload = function () {
        var fr = new FileReader();
        getOrientedUrlFromFile(xhr.response, callback)
    };

    xhr.send();
}

window.showImage = function (id) {
    var element = document.getElementById(id + '-images')
    element.classList.add('loader');
    var arr = [].slice.call(element.children);
    arr.forEach(function (el) {
        getOrientedUrl(el.getAttribute('data-src'), function (file) {
            el.setAttribute('src', file);
            element.classList.remove('loader');
        });
        el.setAttribute('showed', 'true');
        
        el.onload = function () {
            resizeImage(el);
        }
    });
    document.getElementById(id + '-images-btn').style.display = 'none';
}

window.onresize = function () {
    var arr = [].slice.call(document.getElementsByTagName('img'));
    arr.forEach(function (el) {
        if (el.getAttribute('showed') == 'true') {
            resizeImage(el);
        }
    });
}

var id = window.location.pathname.split('/').slice(-1)[0];
if (id == '') {
    id = window.location.pathname.split('/').slice(-2)[0];;
}

var getJSON = require('./get-json.js');

getJSON('/walks/' + id + '/index.json', function (err, data) {
    if (err) return console.error(err);
    var lineStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#000',
            width: 5
        })
    });
    var markerSource = new ol.source.Vector();
    var lineSource = new ol.source.Vector();

    function addMarker(lon, lat, title) {

        var iconFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857'))
        });

        iconFeature.setStyle(new ol.style.Style({
            image: new ol.style.Icon(({
                anchor: [0.5, 35],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                opacity: 0.75,
                src: '/images/marker_icon.png'
            })),
            text: new ol.style.Text({
                offsetY: -40,
                font: '14px Calibri,sans-serif',
                fill: new ol.style.Fill({ color: '#e74c3c' }),
                stroke: new ol.style.Stroke({
                    color: '#fff', width: 2
                }),
                text: title
            })
        }));

        markerSource.addFeature(iconFeature);
    }

    var map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            }),
            new ol.layer.Vector({
                source: lineSource,
                style: lineStyle,
            }),
            new ol.layer.Vector({
                source: markerSource
            })
        ],
        view: new ol.View({
            center: [0, 0],
            zoom: 0
        })
    });
    // set center
    map.getView().setCenter(ol.proj.transform([data.points[0].coords.longitude, data.points[0].coords.latitude], 'EPSG:4326', 'EPSG:3857'));
    map.getView().setZoom(15);

    // set markers
    data.points.forEach(function (el) {
        addMarker(el.coords.longitude, el.coords.latitude, el.title);
    });

    // set itinerary
    var points = [];
    data.itinerary.forEach(function (el) {
        points.push([el.longitude, el.latitude]);
    });
    points.push([data.itinerary[0].longitude, data.itinerary[0].latitude]);

    var lineString = new ol.geom.LineString(points);
    lineString.transform('EPSG:4326', 'EPSG:3857');
    lineSource.addFeature(new ol.Feature({
        geometry: lineString,
        name: 'Line'
    }));
});
