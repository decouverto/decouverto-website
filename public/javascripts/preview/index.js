

var id = window.location.pathname.split('/').slice(-1)[0];
if (id == '') {
    id = window.location.pathname.split('/').slice(-2)[0];;
}

var getJSON = require('./get-json.js');


// Function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
}

// Moving average smoothing function
function movingAverage(arr, windowSize) {
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        let start = Math.max(0, i - Math.floor(windowSize / 2));
        let end = Math.min(arr.length, i + Math.ceil(windowSize / 2));
        let window = arr.slice(start, end);
        let avg = window.reduce((sum, val) => sum + val, 0) / window.length;
        result.push(avg);
    }
    return result;
}

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

    // Elevation div

    getJSON('/api/walks/' + id + '/elevation', function (err, data) {
        var elevationDiv = document.getElementById('elevation');
        var elevationData = data.itinerary;
        if (err) {
            console.error(err);
            // hide elevation div
            elevationDiv.style.display = 'none';
        } else {
            // show elevation div
            elevationDiv.style.display = 'block';
            // TODO Add loading animation



            // Calculate cumulative distances and extract elevations
            var cumulativeDistance = 0;
            var distances = [0]; // Start at 0
            var elevations = [elevationData[0].elevation];
            
            for (var i = 1; i < elevationData.length; i++) {
                var prev = elevationData[i-1];
                var curr = elevationData[i];
                
                var distance = calculateDistance(
                    prev.latitude, prev.longitude,
                    curr.latitude, curr.longitude
                );
                
                cumulativeDistance += distance;
                distances.push(cumulativeDistance);
                elevations.push(curr.elevation);
            }

            var windowSize = 10; // You can adjust this for more/less smoothing
            var smoothedElevations = movingAverage(elevations, windowSize);
            
            // Calculate slopes on the smoothed curve
            var slopes = [];
            var colors = [];
            
            for (var i = 1; i < smoothedElevations.length; i++) {
                var elevationDiff = smoothedElevations[i] - smoothedElevations[i-1];
                var distanceDiff = distances[i] - distances[i-1];
                var slopePercentage = (elevationDiff / (distanceDiff * 1000)) * 100; // Convert to percentage
                slopes.push(slopePercentage);
            }
            
            // Calculate percentile-based ranking for each slope
            var sortedSlopes = [...slopes].sort((a, b) => Math.abs(a) - Math.abs(b));
            
            // Function to get percentile rank of a slope
            function getPercentileRank(slope) {
                var absSlope = Math.abs(slope);
                var rank = 0;
                for (var i = 0; i < sortedSlopes.length; i++) {
                    if (Math.abs(sortedSlopes[i]) <= absSlope) {
                        rank = i;
                    } else {
                        break;
                    }
                }
                return rank / (sortedSlopes.length - 1); // 0 to 1
            }
            
            // Function to interpolate color based on percentile rank
            function getColorForPercentile(percentile) {
                // Create gradient with more green and red, less orange/yellow
                var r, g, b;
                
                if (percentile <= 0.4) {
                    // Green for flat sections (30% of segments)
                    r = 0;
                    g = 204;
                    b = 0;
                } else if (percentile <= 0.5) {
                    // Green to Yellow transition (10% of segments)
                    var factor = (percentile - 0.3) * 10; // 0 to 1
                    r = Math.round(0 + factor * 255); // 0 to 255
                    g = 204;
                    b = 0;
                } else if (percentile <= 0.7) {
                    // Yellow to Orange transition (20% of segments)
                    var factor = (percentile - 0.4) * 5; // 0 to 1
                    r = 255;
                    g = Math.round(204 + factor * 51); // 204 to 255
                    b = 0;
                } else if (percentile <= 0.9) {
                    // Orange to Red transition (10% of segments)
                    var factor = (percentile - 0.6) * 10; // 0 to 1
                    r = 255;
                    g = Math.round(255 - factor * 51); // 255 to 204
                    b = 0;
                } else {
                    // Red for steep sections (30% of segments)
                    r = 255;
                    g = 0;
                    b = 0;
                }
                
                return 'rgb(' + r + ',' + g + ',' + b + ')';
            }
            
            // Assign colors based on percentile ranking
            for (var i = 0; i < slopes.length; i++) {
                var slopePercentage = slopes[i];
                var percentile = getPercentileRank(slopePercentage);
                var color = getColorForPercentile(percentile);
                colors.push(color);
            }
            
            var minElevation = Math.min(...smoothedElevations);
            var maxElevation = Math.max(...smoothedElevations);
            var elevationGain = maxElevation - minElevation;
            document.getElementById('total-distance').innerHTML = cumulativeDistance.toFixed(2);
            document.getElementById('min-elevation').innerHTML = minElevation.toFixed(0);
            document.getElementById('max-elevation').innerHTML = maxElevation.toFixed(0);
            document.getElementById('elevation-gain').innerHTML = elevationGain.toFixed(0);

            // Create multiple traces for different slope segments
            var traces = [];
            var currentTrace = {
                x: [distances[0]],
                y: [smoothedElevations[0]],
                type: 'scatter',
                mode: 'lines',
                name: 'Altitude',
                line: {
                    color: colors[0] || '#00cc00',
                    width: 3
                },
                showlegend: false,
                hoverinfo: 'text',
                hovertext: ['Altitude: ' + smoothedElevations[0].toFixed(0) + 'm<br>Distance: ' + distances[0].toFixed(2) + 'km']
            };
            
            for (var i = 1; i < distances.length; i++) {
                if (i-1 < colors.length && colors[i-1] !== colors[i-2]) {
                    // End current trace and start new one
                    traces.push(currentTrace);
                    currentTrace = {
                        x: [distances[i-1]],
                        y: [smoothedElevations[i-1]],
                        type: 'scatter',
                        mode: 'lines',
                        name: 'Altitude',
                        line: {
                            color: colors[i-1],
                            width: 3
                        },
                        showlegend: false,
                        hoverinfo: 'text',
                        hovertext: ['Altitude: ' + smoothedElevations[i-1].toFixed(0) + 'm<br>Distance: ' + distances[i-1].toFixed(2) + 'km']
                    };
                }
                currentTrace.x.push(distances[i]);
                currentTrace.y.push(smoothedElevations[i]);
                currentTrace.hovertext.push('Altitude: ' + smoothedElevations[i].toFixed(0) + 'm<br>Distance: ' + distances[i].toFixed(2) + 'km');
            }
            traces.push(currentTrace);

            var layout = {
                title: 'Profil altimétrique',
                xaxis: {
                    title: 'Distance (km)',
                    showgrid: true,
                    gridcolor: '#f0f0f0'
                },
                yaxis: {
                    title: 'Altitude (m)',
                    showgrid: true,
                    gridcolor: '#f0f0f0'
                },
                plot_bgcolor: 'white',
                paper_bgcolor: 'white',
                hovermode: 'closest',
                autosize: true,
                margin: {
                    l: 60,
                    r: 30,
                    t: 60,
                    b: 60
                }
            };
            
            var config = {
                displayModeBar: false,
                displaylogo: false,
                responsive: true
            };

            Plotly.newPlot('plotly-elevation', traces, layout, config);
            
            // Store itinerary data for hover events
            var itineraryData = data.itinerary;
            
            // Add hover event listener to show cursor on map
            document.getElementById('plotly-elevation').on('plotly_hover', function(data) {
                var pointIndex = data.points[0].pointIndex;
                var distance = data.points[0].x;
                
                // Find the corresponding point in the itinerary based on distance
                var closestPoint = null;
                var minDistance = Infinity;
                
                for (var i = 0; i < itineraryData.length; i++) {
                    var pointDistance = 0;
                    for (var j = 0; j < i; j++) {
                        pointDistance += calculateDistance(
                            itineraryData[j].latitude, itineraryData[j].longitude,
                            itineraryData[j+1].latitude, itineraryData[j+1].longitude
                        );
                    }
                    
                    if (Math.abs(pointDistance - distance) < minDistance) {
                        minDistance = Math.abs(pointDistance - distance);
                        closestPoint = itineraryData[i];
                    }
                }
                
                if (closestPoint) {
                    // Create or update cursor marker on map
                    var cursorFeature = new ol.Feature({
                        geometry: new ol.geom.Point(ol.proj.transform([closestPoint.longitude, closestPoint.latitude], 'EPSG:4326', 'EPSG:3857'))
                    });
                    
                    cursorFeature.setStyle(new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: 8,
                            fill: new ol.style.Fill({ color: '#ff0000' }),
                            stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
                        })
                    }));
                    
                    // Remove previous cursor if exists
                    markerSource.getFeatures().forEach(function(feature) {
                        if (feature.get('name') === 'cursor') {
                            markerSource.removeFeature(feature);
                        }
                    });
                    
                    cursorFeature.set('name', 'cursor');
                    markerSource.addFeature(cursorFeature);
                }
            });
            
            // Remove cursor when mouse leaves the plot
            document.getElementById('plotly-elevation').on('plotly_unhover', function(data) {
                markerSource.getFeatures().forEach(function(feature) {
                    if (feature.get('name') === 'cursor') {
                        markerSource.removeFeature(feature);
                    }
                });
            });
            

            // data.forEach(function (el) {
            //     elevationDiv.innerHTML += '<div class="elevation-point">' + el.elevation + 'm</div>';
            // });
        }
    });
});
