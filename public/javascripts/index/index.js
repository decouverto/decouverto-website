var walksDivs = document.getElementsByClassName('walks');
var walks = [];
var sectors = [];
var themes = [];
var types = [];
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
    }
    if (types.indexOf(walk.type) < 0) {
        types.push(walk.type);
    }
    if (themes.indexOf(walk.theme) < 0) {
        themes.push(walk.theme);
    }
    walks.push(walk);
});