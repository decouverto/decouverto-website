(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// Hamburger menu toggle
var navToggle = document.querySelector('.nav-toggle');
var navMenu = document.querySelector('.nav-menu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
        var isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('open');
    });

    // Close menu when clicking on a link
    navMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            navToggle.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('open');
        });
    });
}

function safeJsonParse(text, fallback) {
    try {
        return JSON.parse(text);
    } catch (e) {
        return fallback;
    }
}

function toInt(value, fallback) {
    var n = parseInt(value, 10);
    return isNaN(n) ? fallback : n;
}

function clampIndex(index, length) {
    if (!length) return 0;
    var i = index % length;
    if (i < 0) i += length;
    return i;
}

function clearPlayingClass() {
    document.querySelectorAll('.chansons-cards .card.is-playing').forEach(function (card) {
        card.classList.remove('is-playing');
    });
}

function setPlayingCardByIndex(index) {
    clearPlayingClass();
    var card = document.querySelector('.chansons-cards .card[data-song-index="' + index + '"]');
    if (card) card.classList.add('is-playing');
}

function getSongsFromPage() {
    var el = document.getElementById('songs-data');
    if (!el) return [];
    var data = safeJsonParse((el.textContent || '').trim(), []);
    if (!Array.isArray(data)) return [];
    return data.filter(function (s) {
        return s && s.audio && s.title;
    });
}

function initChansonsPlayer() {
    var songs = getSongsFromPage();
    if (!songs.length) return;

    var globalAudio = document.getElementById('global-audio');
    var globalPlayer = document.querySelector('.chansons-global-player');
    var titleEl = globalPlayer ? globalPlayer.querySelector('.chansons-global-player__title') : null;
    var shuffleBtn = globalPlayer ? globalPlayer.querySelector('[data-action="shuffle"]') : null;

    if (!globalAudio || !globalPlayer) return;

    var currentIndex = 0;
    var shuffleEnabled = false;
    var shuffleHistory = [];
    var shuffleBag = [];
    var isProgrammaticSync = false;

    function setTitle() {
        if (!titleEl) return;
        var song = songs[currentIndex];
        titleEl.textContent = song ? song.title : '';
    }

    function getDesiredSrcForIndex(index) {
        var song = songs[clampIndex(index, songs.length)];
        return song ? ('/songs/' + song.audio) : '';
    }

    function selectIndex(index) {
        currentIndex = clampIndex(index, songs.length);
        var song = songs[currentIndex];
        if (!song) return;

        setPlayingCardByIndex(currentIndex);
        setTitle();
    }

    function ensureGlobalSrcForCurrentIndex() {
        var desiredSrc = getDesiredSrcForIndex(currentIndex);
        if (!desiredSrc) return;
        if (globalAudio.src && globalAudio.src.indexOf(desiredSrc) !== -1) return;
        isProgrammaticSync = true;
        globalAudio.src = desiredSrc;
        isProgrammaticSync = false;
    }

    function playIndex(index) {
        selectIndex(index);
        ensureGlobalSrcForCurrentIndex();
        globalAudio.play();
    }

    function shuffledIndicesExcludingCurrent() {
        var indices = [];
        for (var i = 0; i < songs.length; i++) {
            if (i !== currentIndex) indices.push(i);
        }
        for (var j = indices.length - 1; j > 0; j--) {
            var k = Math.floor(Math.random() * (j + 1));
            var tmp = indices[j];
            indices[j] = indices[k];
            indices[k] = tmp;
        }
        return indices;
    }

    function refillShuffleBagIfNeeded() {
        if (songs.length <= 1) {
            shuffleBag = [];
            return;
        }
        if (shuffleBag.length) return;
        shuffleBag = shuffledIndicesExcludingCurrent();
    }

    function pickPerceivedRandomNextIndex() {
        if (songs.length <= 1) return currentIndex;
        refillShuffleBagIfNeeded();
        var next = shuffleBag.shift();
        if (typeof next !== 'number') return currentIndex;
        return next;
    }

    function goNext() {
        if (!songs.length) return;
        if (shuffleEnabled) {
            shuffleHistory.push(currentIndex);
            playIndex(pickPerceivedRandomNextIndex());
        } else {
            playIndex(currentIndex + 1);
        }
    }

    function goPrev() {
        if (!songs.length) return;
        if (shuffleEnabled && shuffleHistory.length) {
            playIndex(shuffleHistory.pop());
        } else {
            playIndex(currentIndex - 1);
        }
    }

    function togglePlayPause() {
        if (globalAudio.paused) {
            // If we haven't set a src yet (no preload), set it now.
            ensureGlobalSrcForCurrentIndex();
            globalAudio.play();
        } else {
            globalAudio.pause();
        }
    }

    function setShuffleEnabled(enabled) {
        shuffleEnabled = !!enabled;
        if (!shuffleEnabled) {
            shuffleHistory = [];
            shuffleBag = [];
        } else {
            shuffleBag = [];
        }
        if (shuffleBtn) shuffleBtn.setAttribute('aria-pressed', shuffleEnabled ? 'true' : 'false');
        if (shuffleBtn) shuffleBtn.classList.toggle('is-active', shuffleEnabled);
    }

    globalPlayer.addEventListener('click', function (e) {
        var target = e.target;
        if (!target || !target.getAttribute) return;
        var action = target.getAttribute('data-action');
        if (!action) return;
        if (action === 'prev') return goPrev();
        if (action === 'next') return goNext();
        if (action === 'toggle') return togglePlayPause();
        if (action === 'shuffle') return setShuffleEnabled(!shuffleEnabled);
    });

    globalAudio.addEventListener('ended', function () {
        goNext();
    });

    globalAudio.addEventListener('play', function () {
        setPlayingCardByIndex(currentIndex);
    });

    globalAudio.addEventListener('pause', function () {
        // keep the outline on the selected track; do not clear
    });

    function ensureCardPlayButton(card) {
        var existing = card.querySelector('[data-action="play"]');
        if (existing) return existing;

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chansons-card-play';
        btn.setAttribute('data-action', 'play');
        btn.setAttribute('aria-label', 'Lire cette chanson');
        btn.textContent = '▶ Lire';

        var title = card.querySelector('h4.title');
        if (title && title.parentNode === card) {
            title.insertAdjacentElement('afterend', btn);
        } else {
            card.insertAdjacentElement('afterbegin', btn);
        }
        return btn;
    }

    function removeCardAudioBlocks() {
        document.querySelectorAll('audio[data-role="card-audio"]').forEach(function (a) {
            try { a.pause(); } catch (e) { }
            if (a.parentNode) a.parentNode.removeChild(a);
        });
    }

    // Replace per-card audio with a play button when JS runs
    document.querySelectorAll('.chansons-cards .card').forEach(function (card) {
        ensureCardPlayButton(card);
    });
    removeCardAudioBlocks();

    // Card play button → global play
    document.querySelectorAll('.chansons-cards .card').forEach(function (card) {
        var idx = toInt(card.getAttribute('data-song-index'), -1);
        if (idx < 0) return;

        var playBtn = ensureCardPlayButton(card);

        playBtn.addEventListener('click', function (e) {
            e.preventDefault();
            playIndex(idx);
        });
    });

    // Initialize with first track (no autoplay)
    setShuffleEnabled(false);
    selectIndex(0);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChansonsPlayer);
} else {
    initChansonsPlayer();
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvY2hhbnNvbnMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLy8gSGFtYnVyZ2VyIG1lbnUgdG9nZ2xlXG52YXIgbmF2VG9nZ2xlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm5hdi10b2dnbGUnKTtcbnZhciBuYXZNZW51ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm5hdi1tZW51Jyk7XG5cbmlmIChuYXZUb2dnbGUgJiYgbmF2TWVudSkge1xuICAgIG5hdlRvZ2dsZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGlzRXhwYW5kZWQgPSBuYXZUb2dnbGUuZ2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJykgPT09ICd0cnVlJztcbiAgICAgICAgbmF2VG9nZ2xlLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsICFpc0V4cGFuZGVkKTtcbiAgICAgICAgbmF2TWVudS5jbGFzc0xpc3QudG9nZ2xlKCdvcGVuJyk7XG4gICAgfSk7XG5cbiAgICAvLyBDbG9zZSBtZW51IHdoZW4gY2xpY2tpbmcgb24gYSBsaW5rXG4gICAgbmF2TWVudS5xdWVyeVNlbGVjdG9yQWxsKCdhJykuZm9yRWFjaChmdW5jdGlvbiAobGluaykge1xuICAgICAgICBsaW5rLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbmF2VG9nZ2xlLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsICdmYWxzZScpO1xuICAgICAgICAgICAgbmF2TWVudS5jbGFzc0xpc3QucmVtb3ZlKCdvcGVuJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBzYWZlSnNvblBhcnNlKHRleHQsIGZhbGxiYWNrKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UodGV4dCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gZmFsbGJhY2s7XG4gICAgfVxufVxuXG5mdW5jdGlvbiB0b0ludCh2YWx1ZSwgZmFsbGJhY2spIHtcbiAgICB2YXIgbiA9IHBhcnNlSW50KHZhbHVlLCAxMCk7XG4gICAgcmV0dXJuIGlzTmFOKG4pID8gZmFsbGJhY2sgOiBuO1xufVxuXG5mdW5jdGlvbiBjbGFtcEluZGV4KGluZGV4LCBsZW5ndGgpIHtcbiAgICBpZiAoIWxlbmd0aCkgcmV0dXJuIDA7XG4gICAgdmFyIGkgPSBpbmRleCAlIGxlbmd0aDtcbiAgICBpZiAoaSA8IDApIGkgKz0gbGVuZ3RoO1xuICAgIHJldHVybiBpO1xufVxuXG5mdW5jdGlvbiBjbGVhclBsYXlpbmdDbGFzcygpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY2hhbnNvbnMtY2FyZHMgLmNhcmQuaXMtcGxheWluZycpLmZvckVhY2goZnVuY3Rpb24gKGNhcmQpIHtcbiAgICAgICAgY2FyZC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1wbGF5aW5nJyk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHNldFBsYXlpbmdDYXJkQnlJbmRleChpbmRleCkge1xuICAgIGNsZWFyUGxheWluZ0NsYXNzKCk7XG4gICAgdmFyIGNhcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY2hhbnNvbnMtY2FyZHMgLmNhcmRbZGF0YS1zb25nLWluZGV4PVwiJyArIGluZGV4ICsgJ1wiXScpO1xuICAgIGlmIChjYXJkKSBjYXJkLmNsYXNzTGlzdC5hZGQoJ2lzLXBsYXlpbmcnKTtcbn1cblxuZnVuY3Rpb24gZ2V0U29uZ3NGcm9tUGFnZSgpIHtcbiAgICB2YXIgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc29uZ3MtZGF0YScpO1xuICAgIGlmICghZWwpIHJldHVybiBbXTtcbiAgICB2YXIgZGF0YSA9IHNhZmVKc29uUGFyc2UoKGVsLnRleHRDb250ZW50IHx8ICcnKS50cmltKCksIFtdKTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZGF0YSkpIHJldHVybiBbXTtcbiAgICByZXR1cm4gZGF0YS5maWx0ZXIoZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgcmV0dXJuIHMgJiYgcy5hdWRpbyAmJiBzLnRpdGxlO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBpbml0Q2hhbnNvbnNQbGF5ZXIoKSB7XG4gICAgdmFyIHNvbmdzID0gZ2V0U29uZ3NGcm9tUGFnZSgpO1xuICAgIGlmICghc29uZ3MubGVuZ3RoKSByZXR1cm47XG5cbiAgICB2YXIgZ2xvYmFsQXVkaW8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2xvYmFsLWF1ZGlvJyk7XG4gICAgdmFyIGdsb2JhbFBsYXllciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jaGFuc29ucy1nbG9iYWwtcGxheWVyJyk7XG4gICAgdmFyIHRpdGxlRWwgPSBnbG9iYWxQbGF5ZXIgPyBnbG9iYWxQbGF5ZXIucXVlcnlTZWxlY3RvcignLmNoYW5zb25zLWdsb2JhbC1wbGF5ZXJfX3RpdGxlJykgOiBudWxsO1xuICAgIHZhciBzaHVmZmxlQnRuID0gZ2xvYmFsUGxheWVyID8gZ2xvYmFsUGxheWVyLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWFjdGlvbj1cInNodWZmbGVcIl0nKSA6IG51bGw7XG5cbiAgICBpZiAoIWdsb2JhbEF1ZGlvIHx8ICFnbG9iYWxQbGF5ZXIpIHJldHVybjtcblxuICAgIHZhciBjdXJyZW50SW5kZXggPSAwO1xuICAgIHZhciBzaHVmZmxlRW5hYmxlZCA9IGZhbHNlO1xuICAgIHZhciBzaHVmZmxlSGlzdG9yeSA9IFtdO1xuICAgIHZhciBzaHVmZmxlQmFnID0gW107XG4gICAgdmFyIGlzUHJvZ3JhbW1hdGljU3luYyA9IGZhbHNlO1xuXG4gICAgZnVuY3Rpb24gc2V0VGl0bGUoKSB7XG4gICAgICAgIGlmICghdGl0bGVFbCkgcmV0dXJuO1xuICAgICAgICB2YXIgc29uZyA9IHNvbmdzW2N1cnJlbnRJbmRleF07XG4gICAgICAgIHRpdGxlRWwudGV4dENvbnRlbnQgPSBzb25nID8gc29uZy50aXRsZSA6ICcnO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldERlc2lyZWRTcmNGb3JJbmRleChpbmRleCkge1xuICAgICAgICB2YXIgc29uZyA9IHNvbmdzW2NsYW1wSW5kZXgoaW5kZXgsIHNvbmdzLmxlbmd0aCldO1xuICAgICAgICByZXR1cm4gc29uZyA/ICgnL3NvbmdzLycgKyBzb25nLmF1ZGlvKSA6ICcnO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNlbGVjdEluZGV4KGluZGV4KSB7XG4gICAgICAgIGN1cnJlbnRJbmRleCA9IGNsYW1wSW5kZXgoaW5kZXgsIHNvbmdzLmxlbmd0aCk7XG4gICAgICAgIHZhciBzb25nID0gc29uZ3NbY3VycmVudEluZGV4XTtcbiAgICAgICAgaWYgKCFzb25nKSByZXR1cm47XG5cbiAgICAgICAgc2V0UGxheWluZ0NhcmRCeUluZGV4KGN1cnJlbnRJbmRleCk7XG4gICAgICAgIHNldFRpdGxlKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZW5zdXJlR2xvYmFsU3JjRm9yQ3VycmVudEluZGV4KCkge1xuICAgICAgICB2YXIgZGVzaXJlZFNyYyA9IGdldERlc2lyZWRTcmNGb3JJbmRleChjdXJyZW50SW5kZXgpO1xuICAgICAgICBpZiAoIWRlc2lyZWRTcmMpIHJldHVybjtcbiAgICAgICAgaWYgKGdsb2JhbEF1ZGlvLnNyYyAmJiBnbG9iYWxBdWRpby5zcmMuaW5kZXhPZihkZXNpcmVkU3JjKSAhPT0gLTEpIHJldHVybjtcbiAgICAgICAgaXNQcm9ncmFtbWF0aWNTeW5jID0gdHJ1ZTtcbiAgICAgICAgZ2xvYmFsQXVkaW8uc3JjID0gZGVzaXJlZFNyYztcbiAgICAgICAgaXNQcm9ncmFtbWF0aWNTeW5jID0gZmFsc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGxheUluZGV4KGluZGV4KSB7XG4gICAgICAgIHNlbGVjdEluZGV4KGluZGV4KTtcbiAgICAgICAgZW5zdXJlR2xvYmFsU3JjRm9yQ3VycmVudEluZGV4KCk7XG4gICAgICAgIGdsb2JhbEF1ZGlvLnBsYXkoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzaHVmZmxlZEluZGljZXNFeGNsdWRpbmdDdXJyZW50KCkge1xuICAgICAgICB2YXIgaW5kaWNlcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNvbmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoaSAhPT0gY3VycmVudEluZGV4KSBpbmRpY2VzLnB1c2goaSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgaiA9IGluZGljZXMubGVuZ3RoIC0gMTsgaiA+IDA7IGotLSkge1xuICAgICAgICAgICAgdmFyIGsgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoaiArIDEpKTtcbiAgICAgICAgICAgIHZhciB0bXAgPSBpbmRpY2VzW2pdO1xuICAgICAgICAgICAgaW5kaWNlc1tqXSA9IGluZGljZXNba107XG4gICAgICAgICAgICBpbmRpY2VzW2tdID0gdG1wO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbmRpY2VzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlZmlsbFNodWZmbGVCYWdJZk5lZWRlZCgpIHtcbiAgICAgICAgaWYgKHNvbmdzLmxlbmd0aCA8PSAxKSB7XG4gICAgICAgICAgICBzaHVmZmxlQmFnID0gW107XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNodWZmbGVCYWcubGVuZ3RoKSByZXR1cm47XG4gICAgICAgIHNodWZmbGVCYWcgPSBzaHVmZmxlZEluZGljZXNFeGNsdWRpbmdDdXJyZW50KCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGlja1BlcmNlaXZlZFJhbmRvbU5leHRJbmRleCgpIHtcbiAgICAgICAgaWYgKHNvbmdzLmxlbmd0aCA8PSAxKSByZXR1cm4gY3VycmVudEluZGV4O1xuICAgICAgICByZWZpbGxTaHVmZmxlQmFnSWZOZWVkZWQoKTtcbiAgICAgICAgdmFyIG5leHQgPSBzaHVmZmxlQmFnLnNoaWZ0KCk7XG4gICAgICAgIGlmICh0eXBlb2YgbmV4dCAhPT0gJ251bWJlcicpIHJldHVybiBjdXJyZW50SW5kZXg7XG4gICAgICAgIHJldHVybiBuZXh0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdvTmV4dCgpIHtcbiAgICAgICAgaWYgKCFzb25ncy5sZW5ndGgpIHJldHVybjtcbiAgICAgICAgaWYgKHNodWZmbGVFbmFibGVkKSB7XG4gICAgICAgICAgICBzaHVmZmxlSGlzdG9yeS5wdXNoKGN1cnJlbnRJbmRleCk7XG4gICAgICAgICAgICBwbGF5SW5kZXgocGlja1BlcmNlaXZlZFJhbmRvbU5leHRJbmRleCgpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBsYXlJbmRleChjdXJyZW50SW5kZXggKyAxKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdvUHJldigpIHtcbiAgICAgICAgaWYgKCFzb25ncy5sZW5ndGgpIHJldHVybjtcbiAgICAgICAgaWYgKHNodWZmbGVFbmFibGVkICYmIHNodWZmbGVIaXN0b3J5Lmxlbmd0aCkge1xuICAgICAgICAgICAgcGxheUluZGV4KHNodWZmbGVIaXN0b3J5LnBvcCgpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBsYXlJbmRleChjdXJyZW50SW5kZXggLSAxKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRvZ2dsZVBsYXlQYXVzZSgpIHtcbiAgICAgICAgaWYgKGdsb2JhbEF1ZGlvLnBhdXNlZCkge1xuICAgICAgICAgICAgLy8gSWYgd2UgaGF2ZW4ndCBzZXQgYSBzcmMgeWV0IChubyBwcmVsb2FkKSwgc2V0IGl0IG5vdy5cbiAgICAgICAgICAgIGVuc3VyZUdsb2JhbFNyY0ZvckN1cnJlbnRJbmRleCgpO1xuICAgICAgICAgICAgZ2xvYmFsQXVkaW8ucGxheSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ2xvYmFsQXVkaW8ucGF1c2UoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldFNodWZmbGVFbmFibGVkKGVuYWJsZWQpIHtcbiAgICAgICAgc2h1ZmZsZUVuYWJsZWQgPSAhIWVuYWJsZWQ7XG4gICAgICAgIGlmICghc2h1ZmZsZUVuYWJsZWQpIHtcbiAgICAgICAgICAgIHNodWZmbGVIaXN0b3J5ID0gW107XG4gICAgICAgICAgICBzaHVmZmxlQmFnID0gW107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaHVmZmxlQmFnID0gW107XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNodWZmbGVCdG4pIHNodWZmbGVCdG4uc2V0QXR0cmlidXRlKCdhcmlhLXByZXNzZWQnLCBzaHVmZmxlRW5hYmxlZCA/ICd0cnVlJyA6ICdmYWxzZScpO1xuICAgICAgICBpZiAoc2h1ZmZsZUJ0bikgc2h1ZmZsZUJ0bi5jbGFzc0xpc3QudG9nZ2xlKCdpcy1hY3RpdmUnLCBzaHVmZmxlRW5hYmxlZCk7XG4gICAgfVxuXG4gICAgZ2xvYmFsUGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgdmFyIHRhcmdldCA9IGUudGFyZ2V0O1xuICAgICAgICBpZiAoIXRhcmdldCB8fCAhdGFyZ2V0LmdldEF0dHJpYnV0ZSkgcmV0dXJuO1xuICAgICAgICB2YXIgYWN0aW9uID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1hY3Rpb24nKTtcbiAgICAgICAgaWYgKCFhY3Rpb24pIHJldHVybjtcbiAgICAgICAgaWYgKGFjdGlvbiA9PT0gJ3ByZXYnKSByZXR1cm4gZ29QcmV2KCk7XG4gICAgICAgIGlmIChhY3Rpb24gPT09ICduZXh0JykgcmV0dXJuIGdvTmV4dCgpO1xuICAgICAgICBpZiAoYWN0aW9uID09PSAndG9nZ2xlJykgcmV0dXJuIHRvZ2dsZVBsYXlQYXVzZSgpO1xuICAgICAgICBpZiAoYWN0aW9uID09PSAnc2h1ZmZsZScpIHJldHVybiBzZXRTaHVmZmxlRW5hYmxlZCghc2h1ZmZsZUVuYWJsZWQpO1xuICAgIH0pO1xuXG4gICAgZ2xvYmFsQXVkaW8uYWRkRXZlbnRMaXN0ZW5lcignZW5kZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGdvTmV4dCgpO1xuICAgIH0pO1xuXG4gICAgZ2xvYmFsQXVkaW8uYWRkRXZlbnRMaXN0ZW5lcigncGxheScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2V0UGxheWluZ0NhcmRCeUluZGV4KGN1cnJlbnRJbmRleCk7XG4gICAgfSk7XG5cbiAgICBnbG9iYWxBdWRpby5hZGRFdmVudExpc3RlbmVyKCdwYXVzZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8ga2VlcCB0aGUgb3V0bGluZSBvbiB0aGUgc2VsZWN0ZWQgdHJhY2s7IGRvIG5vdCBjbGVhclxuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gZW5zdXJlQ2FyZFBsYXlCdXR0b24oY2FyZCkge1xuICAgICAgICB2YXIgZXhpc3RpbmcgPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWFjdGlvbj1cInBsYXlcIl0nKTtcbiAgICAgICAgaWYgKGV4aXN0aW5nKSByZXR1cm4gZXhpc3Rpbmc7XG5cbiAgICAgICAgdmFyIGJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICBidG4udHlwZSA9ICdidXR0b24nO1xuICAgICAgICBidG4uY2xhc3NOYW1lID0gJ2NoYW5zb25zLWNhcmQtcGxheSc7XG4gICAgICAgIGJ0bi5zZXRBdHRyaWJ1dGUoJ2RhdGEtYWN0aW9uJywgJ3BsYXknKTtcbiAgICAgICAgYnRuLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsICdMaXJlIGNldHRlIGNoYW5zb24nKTtcbiAgICAgICAgYnRuLnRleHRDb250ZW50ID0gJ+KWtiBMaXJlJztcblxuICAgICAgICB2YXIgdGl0bGUgPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJ2g0LnRpdGxlJyk7XG4gICAgICAgIGlmICh0aXRsZSAmJiB0aXRsZS5wYXJlbnROb2RlID09PSBjYXJkKSB7XG4gICAgICAgICAgICB0aXRsZS5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2FmdGVyZW5kJywgYnRuKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhcmQuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdhZnRlcmJlZ2luJywgYnRuKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYnRuO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbW92ZUNhcmRBdWRpb0Jsb2NrcygpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnYXVkaW9bZGF0YS1yb2xlPVwiY2FyZC1hdWRpb1wiXScpLmZvckVhY2goZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgIHRyeSB7IGEucGF1c2UoKTsgfSBjYXRjaCAoZSkgeyB9XG4gICAgICAgICAgICBpZiAoYS5wYXJlbnROb2RlKSBhLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoYSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIFJlcGxhY2UgcGVyLWNhcmQgYXVkaW8gd2l0aCBhIHBsYXkgYnV0dG9uIHdoZW4gSlMgcnVuc1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jaGFuc29ucy1jYXJkcyAuY2FyZCcpLmZvckVhY2goZnVuY3Rpb24gKGNhcmQpIHtcbiAgICAgICAgZW5zdXJlQ2FyZFBsYXlCdXR0b24oY2FyZCk7XG4gICAgfSk7XG4gICAgcmVtb3ZlQ2FyZEF1ZGlvQmxvY2tzKCk7XG5cbiAgICAvLyBDYXJkIHBsYXkgYnV0dG9uIOKGkiBnbG9iYWwgcGxheVxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jaGFuc29ucy1jYXJkcyAuY2FyZCcpLmZvckVhY2goZnVuY3Rpb24gKGNhcmQpIHtcbiAgICAgICAgdmFyIGlkeCA9IHRvSW50KGNhcmQuZ2V0QXR0cmlidXRlKCdkYXRhLXNvbmctaW5kZXgnKSwgLTEpO1xuICAgICAgICBpZiAoaWR4IDwgMCkgcmV0dXJuO1xuXG4gICAgICAgIHZhciBwbGF5QnRuID0gZW5zdXJlQ2FyZFBsYXlCdXR0b24oY2FyZCk7XG5cbiAgICAgICAgcGxheUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBwbGF5SW5kZXgoaWR4KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBJbml0aWFsaXplIHdpdGggZmlyc3QgdHJhY2sgKG5vIGF1dG9wbGF5KVxuICAgIHNldFNodWZmbGVFbmFibGVkKGZhbHNlKTtcbiAgICBzZWxlY3RJbmRleCgwKTtcbn1cblxuaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdsb2FkaW5nJykge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBpbml0Q2hhbnNvbnNQbGF5ZXIpO1xufSBlbHNlIHtcbiAgICBpbml0Q2hhbnNvbnNQbGF5ZXIoKTtcbn1cbiJdfQ==
