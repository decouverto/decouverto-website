

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

    var tileLayer = new ol.layer.Tile({
        source: new ol.source.OSM()
    });
    
    var map = new ol.Map({
        target: 'map',
        layers: [
            tileLayer,
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

    function changeTileSourceToOpenTopoMap() {
        tileLayer.setSource(new ol.source.OSM({
            url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png'
        }));
        if (map.getView().getZoom() > 15) {
            map.getView().setZoom(15);
        }
        map.getView().setMaxZoom(15);
    }
    function changeTileSourceToOpenStreetMap() {
        tileLayer.setSource(new ol.source.OSM({
            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        }));
        map.getView().setMaxZoom(20);
    }


    // set center
    map.getView().setCenter(ol.proj.transform([data.points[0].coords.longitude, data.points[0].coords.latitude], 'EPSG:4326', 'EPSG:3857'));
    map.getView().setZoom(15);


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
        requestAnimationFrame(function () {
            map.updateSize();
        })
    }


    window.showImage = function (id) {
        var element = document.getElementById(id + '-images')
        var arr = [].slice.call(element.children);
        arr.forEach(function (el) {
            el.classList.add('loader');
            var downloadingImage = new Image();
            downloadingImage.onload = function () {
                el.src = this.src;
                el.classList.remove('loader');
            };
            downloadingImage.src = el.getAttribute('data-src');
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
    
    var topo = false;
    document.getElementById('tile-source-map').addEventListener('click', function(event) {
        event.preventDefault();
        if (topo) {
            changeTileSourceToOpenStreetMap();
        } else {
            changeTileSourceToOpenTopoMap();
        }
        topo = !topo;
    });
});
