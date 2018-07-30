var walksDivs = document.getElementsByClassName('walks');
var walks = [];
var sectors = [];
var sectorsInput = document.getElementById('sectors-input');
var themes = [];
var themesInput = document.getElementById('themes-input');
var types = [];
var typesInput = document.getElementById('types-input');
Array.prototype.forEach.call(walksDivs,function(element) {
    var walk = {
        id: element.id,
        title: element.getElementsByClassName('title')[0].innerHTML,
        description: element.getElementsByClassName('description')[0].innerHTML,
        type: element.getElementsByClassName('type')[0].innerHTML,
        theme: element.getElementsByClassName('theme')[0].innerHTML,
        zone: element.getElementsByClassName('zone')[0].innerHTML
    };
    if (sectors.indexOf(walk.zone) < 0) {
        sectors.push(walk.zone);
        var option = document.createElement('option');
        option.text = walk.zone;
        option.value = walk.zone;
        sectorsInput.add(option);
    }
    if (types.indexOf(walk.type) < 0) {
        types.push(walk.type);
        var option = document.createElement('option');
        option.text = walk.type;
        option.value = walk.type;
        typesInput.add(option);
    }
    if (themes.indexOf(walk.theme) < 0) {
        themes.push(walk.theme);
        var option = document.createElement('option');
        option.text = walk.theme;
        option.value = walk.theme;
        themesInput.add(option);
    }
    walks.push(walk);
});