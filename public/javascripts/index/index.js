var image = document.getElementById('img');
var loader = document.getElementById('img-loader');
var downloadingImage = new Image();
downloadingImage.onload = function(){
    image.src = this.src;
    loader.style.display = 'none';
};
downloadingImage.src = "/images/screenshot.png";
var element = document.getElementById('popup');
var getJSON = require('./get-json.js');
var goToWalk = document.getElementById('go-to-walks');
var goToHome = document.getElementById('go-to-home');
var walksTitle = document.getElementById('walks-title');


goToWalk.onclick = function (e) {
    e.preventDefault();
    var yCoordinate = walksTitle.getBoundingClientRect().top + window.pageYOffset;

    window.scrollTo({
        top: yCoordinate -50,
        behavior: 'smooth'
    });
}

goToHome.onclick = function (e) {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

getJSON('/walks/first-points.json', function(err, data) {
    if (err) return console.error(err);

    var markerSource = new ol.source.Vector();
    var lineSource = new ol.source.Vector();
    var lineStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#000',
            width: 5
        })
    });

    function addMarker(lon, lat, title, id, km) {

        var iconFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857')),
            title: title + ' (' + km + ' km)',
            id: id,
            lon: lon,
            lat: lat
        });

        iconFeature.setStyle(new ol.style.Style({
            image: new ol.style.Icon(({
                anchor: [0.5, 35],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                opacity: 0.75,
                src: '/images/marker_icon.png'
            }))
        }));

        markerSource.addFeature(iconFeature);
    }
    var labelOSM = '© <a href="https://www.openstreetmap.org/copyright">Contributeurs d’OpenStreetMap</a>';
    var tileLayer = new ol.layer.Tile({
        source: new ol.source.OSM({
            attributions: [
                labelOSM
            ]
        })
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
        }),
        controls: ol.control.defaults({
            attribution: false
          }).extend([
            new ol.control.Attribution({
              collapsible: false // ensures attribution is always visible
            })
          ])
    });

    function changeTileSourceToOpenTopoMap() {
        tileLayer.setSource(new ol.source.OSM({
            url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png',
            attributions: [
                labelOSM
            ]
        }));
        if (map.getView().getZoom() > 15) {
            map.getView().setZoom(15);
        }
        map.getView().setMaxZoom(15);
    }
    function changeTileSourceToOpenStreetMap() {
        tileLayer.setSource(new ol.source.OSM({
            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attributions: [
                labelOSM
            ]
        }));
        map.getView().setMaxZoom(20);
    }

    var popup = new ol.Overlay({
        element: element,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -50]
    });
    map.addOverlay(popup);
    map.on('click', function(e) {
        var feature = map.forEachFeatureAtPixel(e.pixel,
            function(feature) {
                return feature;
            });
        lineSource.clear();
        if (feature && feature.get('title') != undefined) {
            var coordinates = feature.getGeometry().getCoordinates();
            popup.setPosition(coordinates);
            element.innerHTML = '<div class="popover fade top in" style="display: block;" role="tooltip"><div class="arrow"></div><h3 class="popover-title">Balade</h3><div class="popover-content"></div></div>'
            
            element.querySelector('.popover-content').innerHTML = '<a target="_blank" href="/rando/' + feature.get('id') + '">' + feature.get('title') + '</a>';

            popover = element.querySelector('.popover');
            popover.style.display = 'block';
            popover.style.position = 'relative';

            map.getView().setCenter(ol.proj.transform([feature.get('lon'), feature.get('lat')], 'EPSG:4326', 'EPSG:3857'));
            getJSON('/walks/'+ feature.get('id') +'/index.json', function(err, data) {
                if (err) return console.error(err);
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
                map.getView().fit(lineSource.getExtent(), {
                    size: map.getSize(),
                    maxZoom: map.getView().getZoom()
                });
            });
        }
    });
    map.on('pointermove', function(e) {
        if (e.dragging) {
            popover = element.querySelector('.popover')
            if (popover != null) {
                popover.style.display = 'none';
            }
            return;
        }
        var hit = this.forEachFeatureAtPixel(e.pixel, function(feature, layer) {
            return true;
        });
        if (hit) {
            this.getTargetElement().style.cursor = 'pointer';
        } else {
            this.getTargetElement().style.cursor = '';
        }
    });

    // set center
    map.getView().setZoom(8);

    // set markers
    barycentre = {
        longitude: 0,
        latitude: 0,
        n: 0
    }

    // set markers
    data.forEach(function(el) {
        addMarker(el.coord.longitude, el.coord.latitude, el.title, el.id, el.dist);
        barycentre.longitude += el.coord.longitude
        barycentre.latitude += el.coord.latitude
        barycentre.n += 1
    });
    barycentre.longitude /= barycentre.n
    barycentre.latitude /= barycentre.n
    map.getView().setCenter(ol.proj.transform([barycentre.longitude, barycentre.latitude], 'EPSG:4326', 'EPSG:3857'));

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