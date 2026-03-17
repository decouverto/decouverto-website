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
    var searchInput = document.getElementById('chansons-search-input');
    var titleEl = globalPlayer ? globalPlayer.querySelector('.chansons-global-player__title') : null;
    var shuffleBtn = globalPlayer ? globalPlayer.querySelector('[data-action="shuffle"]') : null;

    if (!globalAudio || !globalPlayer) return;

    var currentIndex = 0;
    var shuffleEnabled = false;
    var shuffleHistory = [];
    var shuffleBag = [];
    var isProgrammaticSync = false;
    var searchableTextByIndex = songs.map(function (s) {
        var parts = [];
        if (s.title) parts.push(String(s.title));
        if (s.description) parts.push(String(s.description));
        if (s.id) parts.push(String(s.id));
        return parts.join(' ').toLowerCase();
    });

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

    function applySearchFilter(rawQuery) {
        var query = (rawQuery || '').trim().toLowerCase();
        document.querySelectorAll('.chansons-cards .card').forEach(function (card) {
            var idx = toInt(card.getAttribute('data-song-index'), -1);
            if (idx < 0) return;
            var hay = searchableTextByIndex[idx] || '';
            var visible = !query || hay.indexOf(query) !== -1;
            card.style.display = visible ? '' : 'none';
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            applySearchFilter(searchInput.value);
        });
    }

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
