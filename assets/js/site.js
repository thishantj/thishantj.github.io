(function () {
    var root = document.documentElement;

    // Theme: follows the system until the visitor picks one
    function stored() {
        try { return localStorage.getItem('theme'); } catch (e) { return null; }
    }
    function systemDark() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    function apply(theme) {
        root.setAttribute('data-theme', theme);
    }
    apply(stored() || (systemDark() ? 'dark' : 'light'));
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
            if (!stored()) apply(e.matches ? 'dark' : 'light');
        });
    }
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            apply(next);
            try { localStorage.setItem('theme', next); } catch (e) {}
        });
    });

    // Top bar border once the page scrolls
    var bar = document.querySelector('.topbar');
    function onScroll() {
        if (bar) bar.classList.toggle('scrolled', window.scrollY > 8);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mobile menu
    var menuBtn = document.querySelector('.menu-btn');
    var nav = document.querySelector('.nav');
    if (menuBtn && nav) {
        menuBtn.addEventListener('click', function () {
            var open = nav.classList.toggle('open');
            menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        nav.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', function () {
                nav.classList.remove('open');
                menuBtn.setAttribute('aria-expanded', 'false');
            });
        });
        document.addEventListener('click', function (e) {
            if (!nav.contains(e.target) && !menuBtn.contains(e.target)) {
                nav.classList.remove('open');
                menuBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Highlight the section in view
    var links = document.querySelectorAll('.nav a[href^="#"]');
    if ('IntersectionObserver' in window && links.length) {
        var map = {};
        links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting && map[en.target.id]) {
                    links.forEach(function (a) { a.classList.remove('active'); });
                    map[en.target.id].classList.add('active');
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        Object.keys(map).forEach(function (id) {
            var el = document.getElementById(id);
            if (el) spy.observe(el);
        });
    }

    // Project filters
    var filters = document.querySelectorAll('.filter');
    var cards = document.querySelectorAll('.grid .card');
    function setFilter(key) {
        filters.forEach(function (f) {
            f.setAttribute('aria-pressed', f.dataset.filter === key ? 'true' : 'false');
        });
        cards.forEach(function (c) {
            var show = key === 'all' || (' ' + c.dataset.tags + ' ').indexOf(' ' + key + ' ') > -1;
            c.classList.toggle('hidden', !show);
        });
        var grid = document.querySelector('.grid');
        if (grid) grid.classList.toggle('filtered', key !== 'all');
        document.querySelectorAll('.group-head').forEach(function (h) {
            var any = document.querySelector('.grid .card[data-group="' + h.dataset.group + '"]:not(.hidden)');
            h.classList.toggle('hidden', !any);
        });
    }
    filters.forEach(function (f) {
        f.addEventListener('click', function () {
            setFilter(f.dataset.filter);
            if (history.replaceState) history.replaceState(null, '', f.dataset.filter === 'all' ? '#work' : '#work/' + f.dataset.filter);
        });
    });
    var m = location.hash.match(/^#work\/(\w+)/);
    if (m && document.querySelector('.filter[data-filter="' + m[1] + '"]')) setFilter(m[1]);

    // Showcase fans out on load
    var show = document.querySelector('.showcase');
    if (show) {
        show.classList.add('pre');
        requestAnimationFrame(function () {
            requestAnimationFrame(function () { show.classList.remove('pre'); });
        });
    }

    // Gentle reveal on scroll
    var reveals = document.querySelectorAll('.reveal');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce && 'IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) {
                    en.target.classList.add('in');
                    io.unobserve(en.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px' });
        reveals.forEach(function (el) { io.observe(el); });
    } else {
        reveals.forEach(function (el) { el.classList.add('in'); });
    }
})();
