// ---------- Mobile menu toggle ----------
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('open');
    });

    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => nav.classList.remove('open'));
    });
}

// ---------- Fade-in on scroll ----------
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.15,
    rootMargin: '0px 0px -60px 0px'
});

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// ---------- Contact form: inline handler on contact pages posts to Google Apps Script ----------

// ---------- Lightbox for project gallery ----------
(() => {
    const items = Array.from(document.querySelectorAll('.project-gallery__item'));
    if (!items.length) return;

    const sources = items.map(item => {
        const img = item.querySelector('img');
        return img ? { src: img.src, alt: img.alt || '' } : null;
    }).filter(Boolean);

    const overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.innerHTML = `
        <button class="lightbox__close" aria-label="Close">&times;</button>
        <button class="lightbox__nav lightbox__nav--prev" aria-label="Previous image">&larr;</button>
        <button class="lightbox__nav lightbox__nav--next" aria-label="Next image">&rarr;</button>
        <img alt="">
        <div class="lightbox__counter"></div>
    `;
    document.body.appendChild(overlay);

    const lbImg = overlay.querySelector('img');
    const closeBtn = overlay.querySelector('.lightbox__close');
    const prevBtn = overlay.querySelector('.lightbox__nav--prev');
    const nextBtn = overlay.querySelector('.lightbox__nav--next');
    const counter = overlay.querySelector('.lightbox__counter');

    let currentIndex = 0;

    const show = (index) => {
        currentIndex = (index + sources.length) % sources.length;
        const s = sources[currentIndex];
        lbImg.src = s.src;
        lbImg.alt = s.alt;
        counter.textContent = `${currentIndex + 1} / ${sources.length}`;
    };

    const open = (index) => {
        show(index);
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    };
    const close = () => {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    };
    const next = () => show(currentIndex + 1);
    const prev = () => show(currentIndex - 1);

    items.forEach((item, i) => {
        item.addEventListener('click', () => open(i));
    });

    overlay.addEventListener('click', (e) => {
        // Only close when clicking the dark overlay or the close button
        if (e.target === overlay || e.target === closeBtn) close();
    });

    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prev(); });
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); next(); });

    document.addEventListener('keydown', (e) => {
        if (!overlay.classList.contains('open')) return;
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowLeft') prev();
        else if (e.key === 'ArrowRight') next();
    });

    // Touch swipe support
    let touchStartX = 0;
    overlay.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    overlay.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 50) {
            if (dx < 0) next();
            else prev();
        }
    }, { passive: true });
})();

// ---------- Hero Slider ----------
(() => {
    const slider = document.querySelector('.hero-slider');
    if (!slider) return;

    const slides = Array.from(slider.querySelectorAll('.hero-slider__slide'));
    const dots = Array.from(slider.querySelectorAll('.hero-slider__dot'));
    const infoNum = slider.querySelector('.hero-slider__info-num');
    const infoProject = slider.querySelector('.hero-slider__info-project');
    const infoMeta = slider.querySelector('.hero-slider__info-meta');
    const infoCta = slider.querySelector('.hero-slider__info-cta');
    const prevBtn = slider.querySelector('.hero-slider__nav--prev');
    const nextBtn = slider.querySelector('.hero-slider__nav--next');

    let current = 0;
    let timer;
    const AUTO_MS = 6500;

    const go = (next) => {
        if (next === current) return;
        slides[current].classList.remove('is-active');
        dots[current]?.classList.remove('is-active');
        current = (next + slides.length) % slides.length;
        slides[current].classList.add('is-active');
        dots[current]?.classList.add('is-active');

        const s = slides[current];
        if (infoNum) infoNum.textContent = s.dataset.num || '';
        if (infoProject) infoProject.textContent = s.dataset.project || '';
        if (infoMeta) infoMeta.textContent = s.dataset.meta || '';
        if (infoCta && s.dataset.href) infoCta.setAttribute('href', s.dataset.href);
    };

    const next = () => go(current + 1);
    const prev = () => go(current - 1);

    const restart = () => {
        clearInterval(timer);
        timer = setInterval(next, AUTO_MS);
    };

    nextBtn?.addEventListener('click', () => { next(); restart(); });
    prevBtn?.addEventListener('click', () => { prev(); restart(); });
    dots.forEach((d, i) => d.addEventListener('click', () => { go(i); restart(); }));

    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { next(); restart(); }
        if (e.key === 'ArrowLeft') { prev(); restart(); }
    });

    // Initialize first slide info
    const s = slides[0];
    if (s) {
        if (infoNum) infoNum.textContent = s.dataset.num || '';
        if (infoProject) infoProject.textContent = s.dataset.project || '';
        if (infoMeta) infoMeta.textContent = s.dataset.meta || '';
        if (infoCta && s.dataset.href) infoCta.setAttribute('href', s.dataset.href);
    }

    restart();
})();

// ---------- Transparent header over slider ----------
(() => {
    if (!document.querySelector('.hero-slider')) return;
    document.body.classList.add('has-hero-slider');
    const header = document.querySelector('.header');
    const sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute; top:0; height:80px; width:1px; pointer-events:none;';
    document.body.appendChild(sentinel);

    const onScroll = () => {
        if (window.scrollY > 60) header.classList.add('is-scrolled');
        else header.classList.remove('is-scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();

// ---------- Header shadow on scroll ----------
const header = document.querySelector('.header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (header) {
        header.style.boxShadow = currentScroll > 10
            ? '0 1px 0 rgba(0, 0, 0, 0.05)'
            : 'none';
    }
    lastScroll = currentScroll;
});
