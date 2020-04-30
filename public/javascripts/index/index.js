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


Array.prototype.slice.call(walksDivs).sort(function(ea, eb) {
    var a = ea.getElementsByClassName('title')[0].innerHTML.trim();
    var b = eb.getElementsByClassName('title')[0].innerHTML.trim();
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
}).forEach(function(div) {
    div.parentElement.appendChild(div);
});

Array.prototype.forEach.call(walksDivs, function (element) {
    var walk = {
        id: element.id,
        title: element.getElementsByClassName('title')[0].innerHTML,
        description: element.getElementsByClassName('description')[0].innerHTML,
        type: element.getElementsByClassName('type')[0].innerHTML,
        theme: element.getElementsByClassName('theme')[0].innerHTML,
        zone: element.getElementsByClassName('zone')[0].innerHTML
    };
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

var currentSector = 'all';
var currentType = 'all';
var currentTheme = 'all';
var currentSearch = '';

function render() {
    var arr = [];
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
            var s = new RegExp(currentSearch, 'i');
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

