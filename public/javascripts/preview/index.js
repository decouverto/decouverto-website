window.showImage = function (id) {
    var arr = [].slice.call(document.getElementById(id + '-images').children);
    arr.forEach(function (el) {
        el.setAttribute('src', el.getAttribute('data-src'));
        document.getElementById(id + '-images-btn').style.display = 'none';
    });
}