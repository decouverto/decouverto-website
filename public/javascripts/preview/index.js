window.showImage = function (id) {
    var arr = [].slice.call(document.getElementById(id + '-images').children);
    arr.forEach(function (el) {
        el.setAttribute('src', el.getAttribute('data-src'));
        document.getElementById(id + '-images-btn').style.display = 'none';
    });
}

var id = window.location.pathname.split('/').slice(-1)[0];

var getJSON = require('./get-json.js');

getJSON('/walks/'+ id+ '/index.json', function (err, data) {
    if (err) return console.error(err);
    console.log(data);
    
});