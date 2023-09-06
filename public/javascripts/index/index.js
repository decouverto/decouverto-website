var image = document.getElementById('img');
var loader = document.getElementById('img-loader');
var downloadingImage = new Image();
downloadingImage.onload = function(){
    image.src = this.src;
    loader.style.display = 'none';
};
downloadingImage.src = "/images/screenshot.png";

var indexOf = require('utils-indexof'); // polyfill
var walksDivs = document.getElementsByClassName('walks');
var walks = [];
var sectors = [];
var sectorsInput = document.getElementById('sectors-input');
var themes = [];
var themesInput = document.getElementById('themes-input');
var types = [];
var typesInput = document.getElementById('types-input');
var searchInput = document.getElementById('search-input');

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


function createSpan (title, text) {
    var p = document.createElement('p');
    bold = document.createElement('b');
    bold.innerHTML = title+': ';
    p.appendChild(bold);
    span = document.createElement('span');
    span.innerHTML = text;
    p.appendChild(span);
    return p
}

var getJSON = require('./get-json.js');
var walksContainer = document.getElementById('walks-container');
getJSON('/walks/index.json', function (err, data) {
    if (err) {
        document.getElementById('walk-loader').style.display = 'none';
        return console.error(err)
    };
    
    data.sort(function(ea, eb) {
        var a = ea.title.trim();
        var b = eb.title.trim();
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    }).forEach(function (walk) {

            walk.type=(walk.fromBook == "true") ? 'Tracé uniquement' : 'Balade commentée';

            var mainDiv = document.createElement('div');
            mainDiv.classList.add('card');
            mainDiv.classList.add('walks');
            mainDiv.id = walk.id;

            h4 = document.createElement('h4');
            h4.innerHTML = walk.title;
            mainDiv.appendChild(h4);

            mainDiv.appendChild(createSpan('Kilométrage',(walk.distance/1000).toFixed(1) + ' km'));
            mainDiv.appendChild(createSpan('Type de balade', walk.type));
            mainDiv.appendChild(createSpan('Secteur',walk.zone));
            mainDiv.appendChild(createSpan('Thème',walk.theme));

            p = document.createElement('p');
            p.innerHTML = walk.description;
            p.classList.add('description');
            mainDiv.appendChild(p);

            a=document.createElement('a');
            a.target='_blank';
            a.innerHTML='Aperçu'
            a.href='/rando/'+walk.id
            mainDiv.appendChild(a);

            walksContainer.appendChild(mainDiv);

            if (indexOf(sectors, walk.zone) < 0) {
                sectors.push(walk.zone);
            }
            if (indexOf(types, walk.type) < 0) {
                types.push(walk.type);
                var option = document.createElement('option');
                option.text = walk.type;
                option.value = walk.type;
                typesInput.add(option);
            }
            if (indexOf(themes, walk.theme) < 0) {
                themes.push(walk.theme);
            }
            walks.push(walk);
    });
    document.getElementById('loading-walks').style.display = 'none';
    walksDivs = document.getElementsByClassName('walks');

    sectors.sort(function(a, b){
        if(a < b) { return -1; }
        if(a > b) { return 1; }
        return 0;
    });
    themes.sort(function(a, b){
        if(a < b) { return -1; }
        if(a > b) { return 1; }
        return 0;
    });

    sectors.forEach(function (element) {
        var option = document.createElement('option');
        option.text = element;
        option.value = element;
        sectorsInput.add(option);
    });

    themes.forEach(function (element) {
        var option = document.createElement('option');
        option.text = element;
        option.value = element;
        themesInput.add(option);
    });
    
});

var currentSector = 'all';
var currentType = 'all';
var currentTheme = 'all';
var currentSearch = '';

function escapeRegex(string) {
    return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}

function render() {
    var arr = [];
    var s = new RegExp(escapeRegex(currentSearch), 'i');
    walks.forEach(function (data) {
        var err = false;
        if (currentSector != 'all' && currentSector != data.zone) {
            err = true;
        }
        if (currentTheme != 'all' && currentTheme != data.theme) {
            err = true;
        }
        if (currentType != 'all' && currentType != data.type) {
            err = true;
        }
        if (currentSearch != '') {
            if (data.zone.search(s) == -1 && data.theme.search(s) == -1 && data.description.search(s) == -1 && data.title.search(s) == -1) {
                err = true;
            }
        }
        if (!err) {
            arr.push(data.id);
        }
    });
    Array.prototype.forEach.call(walksDivs, function (element) {
        if (indexOf(arr, element.id) < 0) {
            element.style.display = 'none'; 
        } else {
            element.style.display = 'block'; 
        }
    });
}

function resetSearch () {
    currentSearch = '';
    searchInput.value = '';
}

sectorsInput.addEventListener('change', function () {
    currentSector = sectorsInput.options[sectorsInput.selectedIndex].value;
    resetSearch();
    render();
});

typesInput.addEventListener('change', function () {
    currentType = typesInput.options[typesInput.selectedIndex].value;
    resetSearch();
    render();
});

themesInput.addEventListener('change', function () {
    currentTheme = themesInput.options[themesInput.selectedIndex].value;
    resetSearch();
    render();
});

searchInput.addEventListener('keyup', function () {
    currentSector = 'all';
    currentType = 'all';
    currentTheme = 'all';
    sectorsInput.options.selectedIndex = 0;
    typesInput.options.selectedIndex = 0;
    themesInput.options.selectedIndex = 0;
    currentSearch = searchInput.value;
    render();
});

