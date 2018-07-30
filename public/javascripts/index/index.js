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
        var option = document.createElement('option');
        option.text = walk.zone;
        option.value = walk.zone;
        sectorsInput.add(option);
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
        var option = document.createElement('option');
        option.text = walk.theme;
        option.value = walk.theme;
        themesInput.add(option);
    }
    walks.push(walk);
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
    currentSearch = searchInput.value;
    render();
});