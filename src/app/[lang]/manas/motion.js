import { formatMessage as format } from "./translations/format";

/**
 * Progressive enhancement for the converted Manas artwork and readers.
 * Queries stay inside the route; all browser resources are released on navigation.
 * @param {HTMLDivElement} root
 * @param {import("./interactive-messages").InteractiveMessages} t
 * @returns {() => void}
 */
export function initializeManas(root, t) {
    const controller = new AbortController();
    const observers = [];
    const frames = new Set();
    const attributes = [root, ...root.querySelectorAll('*')].map(element => [element, [...element.attributes].map(attribute => [attribute.name, attribute.value])]);
    const originalOverflow = document.documentElement.style.overflow;
    function listen(target, event, callback, options = {}) {
        target.addEventListener(event, callback, { ...options, signal: controller.signal });
    }
    function trackObserver(observer) { observers.push(observer); return observer; }
    function scheduleFrame(callback) {
        const frame = window.requestAnimationFrame(time => { frames.delete(frame); callback(time); });
        frames.add(frame);
        return frame;
    }
    const scrollLock = trackObserver(new MutationObserver(() => {
        document.documentElement.style.overflow = root.querySelector('dialog[open]') ? 'hidden' : originalOverflow;
    }));
    root.querySelectorAll('dialog').forEach(dialog => scrollLock.observe(dialog, { attributes: true, attributeFilter: ['open'] }));
    root.classList.add('js');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reveals = root.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const observer = trackObserver(new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: .08 }));
        reveals.forEach(el => {
            if (el.getBoundingClientRect().top < window.innerHeight || reducedMotion.matches) el.classList.add('visible');
            observer.observe(el);
        });
    }
    else {
        reveals.forEach(el => el.classList.add('visible'));
    }
    const svgNS = 'http://www.w3.org/2000/svg';
    const badges = root.querySelector('.forty-badges');
    for (let i = 0; i < 40; i++) {
        const badge = document.createElement('span');
        badge.className = 'warrior-badge';
        badge.setAttribute('aria-label', format(t.s255, { number: i + 1 }));
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('viewBox', '0 0 100 100');
        svg.setAttribute('aria-hidden', 'true');
        const use = document.createElementNS(svgNS, 'use');
        use.setAttribute('href', i % 3 === 0 ? '#kerege' : '#horn');
        svg.appendChild(use);
        badge.appendChild(svg);
        badges.appendChild(badge);
    }
    const wave = root.querySelector('.waveform');
    for (let i = 0; i < 24; i++) {
        const bar = document.createElement('i');
        bar.style.setProperty('--i', i);
        bar.style.height = (8 + Math.sin(i * 1.7) ** 2 * 22) + 'px';
        wave.appendChild(bar);
    }
    const people = { almambet: { name: t.s038, role: t.s039, kyrgyz: 'Алмамбет', story: t.s260 }, chubak: { name: t.s042, role: t.s043, kyrgyz: 'Чубак', story: t.s261 }, syrgak: { name: t.s046, role: t.s047, kyrgyz: 'Сыргак', story: t.s262 }, bakai: { name: t.s050, role: t.s051, kyrgyz: 'Бакай', story: t.s263 } };
    const personDialog = root.querySelector('#person-dialog');
    root.querySelectorAll('[data-person]').forEach(button => listen(button, 'click', () => { const person = people[button.dataset.person]; const portrait = button.querySelector('.card-portrait img'); const dialogPortrait = root.querySelector('#person-portrait'); dialogPortrait.src = portrait.src; dialogPortrait.alt = portrait.alt; root.querySelector('#person-title').textContent = person.name; root.querySelector('#person-role').textContent = person.role; root.querySelector('#person-story').textContent = person.story; root.querySelector('#person-kyrgyz').textContent = person.kyrgyz; personDialog.showModal(); }));
    const videoDialog = root.querySelector('#video-dialog');
    listen(root.querySelector('#listen'), 'click', () => { const iframe = document.createElement('iframe'); iframe.src = 'https://www.youtube-nocookie.com/embed/5C5OZC7kXo4?autoplay=1'; iframe.title = t.s264; iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; iframe.allowFullscreen = true; root.querySelector('#video-frame').replaceChildren(iframe); videoDialog.showModal(); });
    listen(videoDialog, 'close', () => root.querySelector('#video-frame').replaceChildren());
    // Comic reader: reuse embedded artwork, keep the full composition visible, and return focus on close.
    let comicPanels = [...root.querySelectorAll('#episode .comic-panel')];
    const comicReader = root.querySelector('#comic-dialog');
    const duelStories = [
        { title: t.s265, kicker: t.s266, paragraphs: [
                t.s267,
                t.s268
            ], detail: t.s269 },
        { title: t.s270, kicker: t.s271, paragraphs: [
                t.s272,
                t.s273
            ], detail: t.s274 },
        { title: t.s275, kicker: t.s276, paragraphs: [
                t.s277,
                t.s278
            ], detail: t.s279 },
        { title: t.s280, kicker: t.s281, paragraphs: [
                t.s282,
                t.s283
            ], detail: t.s284 }
    ];
    const koshoyStories = [
        {
            title: t.s286,
            kicker: t.s288,
            "paragraphs": [
                t.s289,
                t.s290
            ],
            detail: t.s292
        },
        {
            title: t.s293,
            kicker: t.s294,
            "paragraphs": [
                t.s295,
                t.s296
            ],
            detail: t.s297
        },
        {
            title: t.s298,
            kicker: t.s299,
            "paragraphs": [
                t.s300,
                t.s301
            ],
            detail: t.s302
        },
        {
            title: t.s303,
            kicker: t.s304,
            "paragraphs": [
                t.s305,
                t.s306
            ],
            detail: t.s307,
            "source": "https://open.kg/en/about-kyrgyzstan/culture/folklore/kyrgyz-heroic-epic-manas/the-epic-manas-in-prose/35780-skazanie-o-manase-pominki-po-kekekteyu-chast-5.html"
        }
    ];
    const flightStories = [
        {
            title: t.s308,
            kicker: t.s309,
            "paragraphs": [
                t.s310,
                t.s311
            ],
            detail: t.s312,
            "source": "https://eposmanas.ru/prozaicheskyi%20variant%20epos%20manas/-159/67250877.html"
        },
        {
            title: t.s313,
            kicker: t.s314,
            "paragraphs": [
                t.s315,
                t.s316
            ],
            detail: t.s317,
            "source": "https://eposmanas.ru/prozaicheskyi%20variant%20epos%20manas/-159/44280921.html"
        },
        {
            title: t.s318,
            kicker: t.s319,
            "paragraphs": [
                t.s320,
                t.s321
            ],
            detail: t.s322,
            "source": "https://eposmanas.ru/prozaicheskyi%20variant%20epos%20manas/-159/26664801.html"
        },
        {
            title: t.s323,
            kicker: t.s324,
            "paragraphs": [
                t.s325,
                t.s326
            ],
            detail: t.s327,
            "source": "https://eposmanas.ru/prozaicheskyi%20variant%20epos%20manas/-159/90390378.html"
        }
    ];
    const comicEpisodes = {
        flight: { selector: '#flight .comic-panel', label: t.s142, stories: flightStories, source: "https://eposmanas.ru/prozaicheskyi%20variant%20epos%20manas/-159/67250877.html" },
        duel: { selector: '#episode .comic-panel', label: t.s328, stories: duelStories, source: 'https://slaviccenter.osu.edu/news/daniel-prior-visits-osu-reading-memorial-feast-kokotoy-khan' },
        koshoy: { selector: '#koshoy .comic-panel', label: t.s329, stories: koshoyStories, source: "https://open.kg/en/about-kyrgyzstan/culture/folklore/kyrgyz-heroic-epic-manas/the-epic-manas-in-prose/35754-skazanie-o-manase-pominki-po-kekekteyu-chast-4.html" }
    };
    let activeComicEpisode = comicEpisodes.duel, comicStories = duelStories;
    let comicIndex = 0, comicOpener = null;
    const comicPrevious = root.querySelector('#comic-prev'), comicNext = root.querySelector('#comic-next');
    function renderComic(index) {
        const previousComicIndex = comicIndex;
        comicIndex = Math.max(0, Math.min(comicStories.length - 1, index));
        const story = comicStories[comicIndex], panel = comicPanels[comicIndex], source = panel.querySelector('img'), image = root.querySelector('#comic-reader-image');
        image.src = source.src;
        image.alt = source.alt;
        root.querySelector('#comic-reader-episode').textContent = activeComicEpisode.label;
        root.querySelector('.comic-reader-source').href = story.source || activeComicEpisode.source;
        root.querySelector('#comic-reader-caption').textContent = panel.querySelector('figcaption').textContent;
        root.querySelector('#comic-reader-title').textContent = story.title;
        root.querySelector('#comic-reader-kicker').textContent = story.kicker;
        root.querySelector('#comic-reader-detail').textContent = story.detail;
        root.querySelector('#comic-reader-counter').textContent = format(t.s256, { number: String(comicIndex + 1).padStart(2, '0'), total: String(comicStories.length).padStart(2, '0') });
        const paragraphs = story.paragraphs.map(text => { const paragraph = document.createElement('p'); paragraph.textContent = text; return paragraph; });
        root.querySelector('#comic-reader-text').replaceChildren(...paragraphs);
        comicPrevious.disabled = comicIndex === 0;
        comicNext.disabled = comicIndex === comicStories.length - 1;
        root.querySelectorAll('[data-comic-page]').forEach(button => {
            const page = Number(button.dataset.comicPage);
            button.setAttribute('aria-label', format(t.s257, { number: page + 1, title: comicStories[page].title }));
            if (page === comicIndex)
                button.setAttribute('aria-current', 'step');
            else
                button.removeAttribute('aria-current');
        });
        root.querySelector('#comic-reader-status').textContent = format(t.s258, { number: comicIndex + 1, total: comicStories.length, title: story.title });
        comicReader.scrollTop = 0;
        comicReader.dispatchEvent(new CustomEvent('comicchange', { detail: { direction: Math.sign(comicIndex - previousComicIndex) } }));
    }
    root.querySelectorAll('[data-comic]').forEach(button => listen(button, 'click', () => { comicOpener = button; activeComicEpisode = comicEpisodes[button.dataset.episode || 'duel']; comicStories = activeComicEpisode.stories; comicPanels = [...root.querySelectorAll(activeComicEpisode.selector)]; renderComic(Number(button.dataset.comic)); comicReader.showModal(); }));
    function stepComic(direction) {
        const active = document.activeElement;
        renderComic(comicIndex + direction);
        if (active === comicPrevious && comicPrevious.disabled)
            comicNext.focus({ preventScroll: true });
        if (active === comicNext && comicNext.disabled)
            comicPrevious.focus({ preventScroll: true });
    }
    listen(comicPrevious, 'click', () => stepComic(-1));
    listen(comicNext, 'click', () => stepComic(1));
    root.querySelectorAll('[data-comic-page]').forEach(button => listen(button, 'click', () => renderComic(Number(button.dataset.comicPage))));
    listen(comicReader, 'keydown', event => {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
            return;
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            stepComic(root.dir === 'rtl' ? -1 : 1);
        }
        else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            stepComic(root.dir === 'rtl' ? 1 : -1);
        }
    });
    listen(comicReader, 'close', () => {
        root.querySelector('#comic-reader-image').removeAttribute('src');
        if (comicOpener && comicOpener.isConnected)
            comicOpener.focus({ preventScroll: true });
    });
    root.querySelectorAll('dialog').forEach(dialog => {
        listen(dialog.querySelector('.dialog-close'), 'click', () => dialog.close());
        listen(dialog, 'click', event => {
            if (event.target === dialog) {
                const rect = dialog.getBoundingClientRect();
                if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)
                    dialog.close();
            }
        });
    });
    root.querySelectorAll('a[href="#sources"]').forEach(link => listen(link, 'click', () => { root.querySelector('#sources').open = true; }));
    const chapterBar = root.querySelector('#chapter-current');
    const chapterMap = root.querySelector('#chapter-map');
    const chapterSections = [...root.querySelectorAll('#main>section[id]')];
    const chapterNames = { origin: t.s021, comrades: t.s031, battles: t.s057, episode: t.s231, koshoy: t.s232, flight: t.s233, legacy: t.s175, voice: t.s197 };
    let selectedChapter = -1, scrollFrame = 0, manuallyPaused = false;
    const animations = new Set();
    try { manuallyPaused = localStorage.getItem('manas-motion-paused') === 'true'; } catch {}
    function animate(element, frames, options = {}) {
        if (!element || manuallyPaused || reducedMotion.matches) return;
        const animation = element.animate(frames, { duration: 900, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards', ...options });
        animations.add(animation);
        animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
    }
    function updateJourney() {
        scrollFrame = 0;
        let index = 0;
        chapterSections.forEach((section, i) => {
            if (section.getBoundingClientRect().top <= window.innerHeight * .4) index = i;
        });
        if (index !== selectedChapter) {
            selectedChapter = index;
            root.querySelector('#chapter-current-number').textContent = String(index + 1).padStart(2, '0');
            root.querySelector('#chapter-current-label').textContent = chapterNames[chapterSections[index].id];
            const next = chapterSections[index + 1];
            const nextLink = root.querySelector('.journey-next');
            nextLink.href = next ? '#' + next.id : '#main';
            nextLink.setAttribute('aria-label', next ? format(t.s259, { title: chapterNames[next.id] }) : t.s330);
            chapterMap.querySelectorAll('a').forEach(link => {
                if (link.hash === '#' + chapterSections[index].id) link.setAttribute('aria-current', 'location');
                else link.removeAttribute('aria-current');
            });
        }
        chapterBar.classList.toggle('is-visible', hero.getBoundingClientRect().bottom < window.innerHeight * .75);
    }
    const requestJourney = () => { if (!scrollFrame) scrollFrame = scheduleFrame(updateJourney); };
    const hero = root.querySelector('.hero');
    const heroLayers = [...root.querySelectorAll('.hero-layer img')];
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let targetScroll = window.scrollY, smoothScroll = targetScroll;
    let targetX = 0, targetY = 0, smoothX = 0, smoothY = 0;
    let parallaxFrame = 0;
    function renderParallax() {
        parallaxFrame = 0;
        if (manuallyPaused || reducedMotion.matches || document.hidden) return;
        const rect = hero.getBoundingClientRect();
        if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
        const travel = Math.max(0, Math.min(hero.offsetHeight, -rect.top));
        const mobile = window.innerWidth <= 760;
        heroLayers.forEach((image, index) => {
            const depth = index + 1;
            const x = mobile ? 0 : smoothX * depth * -8;
            const y = -travel * depth * .035 + (mobile ? 0 : smoothY * depth * -5);
            image.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) scale(1.055)';
        });
        const easing = .18;
        smoothScroll += (targetScroll - smoothScroll) * easing;
        smoothX += (targetX - smoothX) * easing;
        smoothY += (targetY - smoothY) * easing;
        if (Math.abs(targetScroll - smoothScroll) > .3 || Math.abs(targetX - smoothX) > .004 || Math.abs(targetY - smoothY) > .004) {
            parallaxFrame = window.requestAnimationFrame(time => {
                frames.delete(parallaxFrame);
                renderParallax(time);
            });
            frames.add(parallaxFrame);
        }
    }
    const requestParallax = () => {
        if (manuallyPaused || reducedMotion.matches || document.hidden) return;
        targetScroll = window.scrollY;
        if (!parallaxFrame) {
            parallaxFrame = window.requestAnimationFrame(time => {
                frames.delete(parallaxFrame);
                parallaxFrame = 0;
                renderParallax(time);
            });
            frames.add(parallaxFrame);
        }
    };
    listen(window, 'scroll', () => { requestJourney(); requestParallax(); }, { passive: true });
    listen(window, 'resize', () => { requestJourney(); requestParallax(); });
    listen(hero, 'pointermove', event => {
        if (!finePointer.matches || event.pointerType !== 'mouse' || reducedMotion.matches || manuallyPaused) return;
        const bounds = hero.getBoundingClientRect();
        targetX = Math.max(-.5, Math.min(.5, (event.clientX - bounds.left) / bounds.width - .5));
        targetY = Math.max(-.5, Math.min(.5, (event.clientY - bounds.top) / bounds.height - .5));
        requestParallax();
    }, { passive: true });
    listen(hero, 'pointerleave', () => { targetX = targetY = 0; requestParallax(); });
    listen(root.querySelector('#chapter-open'), 'click', () => chapterMap.showModal());
    chapterMap.querySelectorAll('a').forEach(link => listen(link, 'click', () => chapterMap.close()));
    function refreshMotionPreference() {
        const paused = manuallyPaused || reducedMotion.matches;
        root.classList.toggle('motion-paused', paused);
        root.classList.toggle('motion-enabled', !paused);
        root.querySelectorAll('[data-motion-toggle]').forEach(button => {
            button.setAttribute('aria-pressed', String(paused));
            button.disabled = reducedMotion.matches;
            button.setAttribute('aria-label', reducedMotion.matches ? t.s331 : paused ? t.s332 : t.s224);
            button.querySelector('.motion-toggle-label').textContent = paused ? t.s333 : t.s225;
        });
        if (paused) {
            animations.forEach(animation => animation.cancel());
            root.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));
            heroLayers.forEach(image => { image.style.transform = ''; });
            smoothX = targetX = smoothY = targetY = 0;
        } else {
            smoothScroll = targetScroll = window.scrollY;
            requestParallax();
        }
    }
    listen(reducedMotion, 'change', refreshMotionPreference);
    root.querySelectorAll('[data-motion-toggle]').forEach(button => listen(button, 'click', () => {
        manuallyPaused = !manuallyPaused;
        try { localStorage.setItem('manas-motion-paused', String(manuallyPaused)); } catch {}
        refreshMotionPreference();
    }));
    listen(root, 'focusin', event => {
        const target = event.target.closest('.reveal');
        if (target) target.classList.add('visible');
    });
    listen(comicReader, 'comicchange', () => {
        scheduleFrame(() => {
            if (!comicReader.open) return;
            const content = comicReader.querySelector('.comic-reader-body');
            content.getAnimations().forEach(animation => animation.cancel());
            animate(content, [{ opacity: .3, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 450 });
        });
    });
    let swipeStart = null;
    const readerArt = comicReader.querySelector('.comic-reader-art');
    listen(readerArt, 'touchstart', event => {
        swipeStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
    }, { passive: true });
    listen(readerArt, 'touchend', event => {
        if (!swipeStart || event.changedTouches.length !== 1) return;
        const dx = event.changedTouches[0].clientX - swipeStart.x;
        const dy = event.changedTouches[0].clientY - swipeStart.y;
        swipeStart = null;
        if (Math.abs(dx) > 65 && Math.abs(dy) < 40) {
            const next = root.dir === 'rtl' ? dx > 0 : dx < 0;
            const button = next ? comicNext : comicPrevious;
            if (!button.disabled) button.click();
        }
    }, { passive: true });
    listen(readerArt, 'touchcancel', () => { swipeStart = null; }, { passive: true });
    listen(comicReader, 'close', () => { swipeStart = null; });
    const dialogObserver = trackObserver(new MutationObserver(records => records.forEach(record => {
        if (record.target.open) animate(record.target, [{ opacity: 0, transform: 'translateY(12px) scale(.985)' }, { opacity: 1, transform: 'none' }], { duration: 400 });
    })));
    root.querySelectorAll('dialog').forEach(dialog => dialogObserver.observe(dialog, { attributes: true, attributeFilter: ['open'] }));
    refreshMotionPreference();
    updateJourney();
    requestParallax();
    animate(root.querySelector('.hero-content'), [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }]);
    animate(root.querySelector('.hero-art'), [{ opacity: 0, transform: 'scale(1.025)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 1200 });
    return () => {
        controller.abort();
        observers.forEach(observer => observer.disconnect());
        frames.forEach(frame => window.cancelAnimationFrame(frame));
        animations.forEach(animation => animation.cancel());
        heroLayers.forEach(image => { image.style.transform = ''; });
        root.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
        document.documentElement.style.overflow = originalOverflow;
        root.querySelectorAll('.forty-badges > *, .waveform > *').forEach(element => element.remove());
        attributes.forEach(([element, original]) => {
            [...element.attributes].forEach(attribute => element.removeAttribute(attribute.name));
            original.forEach(([name, value]) => element.setAttribute(name, value));
        });
    };
}
