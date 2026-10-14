/* =========================================================
   Kouthieye Thiaw — Portfolio GEII · interactions & animations
   GSAP + ScrollTrigger + Lenis (chargés depuis un CDN).
   Sans eux, le site reste entièrement lisible. Avec « réduire les
   animations » (réglage fréquent sous Windows), les animations restent
   actives mais plus calmes : ni défilement à inertie, ni parallaxe,
   ni bandeaux défilant en continu.
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const root = document.documentElement;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const HAS_GSAP = !!(window.gsap && window.ScrollTrigger);
  const ANIM = HAS_GSAP;
  const CALM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const P = window.PROJECTS || [];
  const CATS = window.PROJECT_CATS || {};
  const byId = Object.fromEntries(P.map(p => [p.id, p]));
  const pad = n => String(n).padStart(2, '0');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const src = (name, size) => /\.svg$/.test(name) ? `assets/img/${name}` : `assets/img/${name}${size === 'sm' ? '-sm' : ''}.webp`;
  const ARROW = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 8h11M9 3.5 13.5 8 9 12.5"/></svg>';
  const fmt = (v, d = 0) => Number(v).toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const tick = fn => HAS_GSAP ? gsap.ticker.add(fn) : (function loop() { fn(); requestAnimationFrame(loop); })();

  if (HAS_GSAP) gsap.registerPlugin(ScrollTrigger);
  if (ANIM) root.classList.add('anim');
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const initialHash = location.hash;

  /* ---------- Rendu des projets ---------- */
  function renderProjects() {
    const feat = P.filter(p => p.featured);
    $('.hpanel--end').insertAdjacentHTML('beforebegin', feat.map((p, i) => `
      <a class="pcard" href="#projet-${p.id}" data-open="${p.id}" data-cursor="ouvrir">
        <span class="pcard__num" aria-hidden="true">${pad(i + 1)}</span>
        <div class="pcard__media"><div class="pcard__par"><img src="${src(p.cover, 'sm')}" alt="${esc(p.alt || '')}" decoding="async"></div></div>
        <div class="pcard__body">
          <div class="pcard__meta mono"><span>${esc(p.frame)}</span><span>${p.year}</span></div>
          <h3 class="pcard__title">${esc(p.title)}</h3>
          <p class="pcard__desc">${esc(p.short)}</p>
        </div>
      </a>`).join(''));
    $('.hscroll__count').textContent = `01 / ${pad(feat.length)}`;

    const counts = P.reduce((a, p) => (a[p.cat] = (a[p.cat] || 0) + 1, a), {});
    $('.filters').innerHTML = Object.entries(CATS)
      .filter(([k]) => k === 'all' || counts[k])
      .map(([k, v]) => `<button type="button" class="chip${k === 'all' ? ' is-active' : ''}" data-filter="${k}" aria-pressed="${k === 'all'}">${v}<sup>${k === 'all' ? P.length : counts[k]}</sup></button>`)
      .join('');

    $('.index__list').innerHTML = P.map((p, i) => `
      <li class="irow" data-cat="${p.cat}">
        <a class="irow__link" href="#projet-${p.id}" data-open="${p.id}" data-preview="${p.id}">
          <span class="irow__in">
            <span class="irow__n mono">${pad(i + 1)}</span>
            <span class="irow__title">${esc(p.title)}${p.isNew ? '<em>nouveau</em>' : ''}</span>
            <span class="irow__frame">${esc(p.frame)}</span>
            <span class="irow__year mono">${p.year}</span>
            <span class="irow__arrow">${ARROW}</span>
          </span>
        </a>
      </li>`).join('');
  }

  /* ---------- Découpage du texte ---------- */
  function splitWords(el) {
    const text = el.textContent.replace(/\s+/g, ' ').trim();
    const words = text.split(' ');
    el.setAttribute('aria-label', text);
    el.innerHTML = words.map((w, i) => {
      const inner = i === words.length - 1 && w.endsWith('.') ? esc(w.slice(0, -1)) + '<span class="dot">.</span>' : esc(w);
      return `<span class="w" aria-hidden="true"><span class="wi">${inner}</span></span>`;
    }).join(' ');
    return $$('.wi', el);
  }

  function splitPlain(el) {
    const text = el.textContent.replace(/\s+/g, ' ').trim();
    el.setAttribute('aria-label', text);
    el.innerHTML = text.split(' ').map(w => `<span class="sw" aria-hidden="true">${esc(w)}</span>`).join(' ');
    return $$('.sw', el);
  }

  function splitChars(el) {
    const nodes = Array.from(el.childNodes);
    el.textContent = '';
    nodes.forEach(n => {
      if (n.nodeType === 3) {
        Array.from(n.textContent).forEach(c => {
          const s = document.createElement('span');
          s.className = 'ch';
          s.textContent = c === ' ' ? ' ' : c;
          el.appendChild(s);
        });
      } else el.appendChild(n);
    });
    return $$('.ch', el);
  }

  function rollify(scope = document) {
    $$('[data-roll]:not([data-rolled])', scope).forEach(el => {
      const t = el.textContent.trim();
      el.dataset.rolled = '';
      el.innerHTML = `<span class="sr">${esc(t)}</span><span class="roll" aria-hidden="true">${Array.from(t).map((c, i) => {
        const ch = c === ' ' ? ' ' : esc(c);
        return `<span class="roll__c" style="--i:${i}"><span>${ch}</span><span>${ch}</span></span>`;
      }).join('')}</span>`;
    });
  }

  /* ---------- Défilement fluide ---------- */
  let lenis = null;
  if (ANIM && !CALM && window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, touchMultiplier: 1.4 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  function goTo(target) {
    if (target === 0) {
      if (lenis) lenis.scrollTo(0, { duration: 1.6, easing: t => 1 - Math.pow(1 - t, 4) });
      else scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { duration: 1.6, easing: t => 1 - Math.pow(1 - t, 4) });
    else el.scrollIntoView({ behavior: 'smooth' });
  }

  /* ---------- Ouverture : un oscilloscope qui se met sous tension, puis l'écran s'ouvre ---------- */
  const SCOPE = { t: 0, last: 0 };
  function intro() {
    const ov = $('.intro');
    window.scrollTo(0, 0);
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    const done = () => {
      root.classList.remove('intro-on');
      ov && ov.remove();
      if (HAS_GSAP) ScrollTrigger.refresh();
    };
    if (!ov || !ANIM || !root.classList.contains('intro-on')) { done(); return Promise.resolve(); }

    lenis && lenis.stop();
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const ready = Promise.race([document.fonts ? document.fonts.ready : wait(0), wait(1500)]);

    return ready.then(() => new Promise(resolve => {
      ScrollTrigger.refresh();
      // le trait se pose exactement sur l'oscilloscope du hero
      const sc = $('.scope'), sr = sc.getBoundingClientRect();
      let ly = sr.top + sr.height * 0.56, sh = sr.height;
      if (ly > innerHeight * 0.92 || ly < innerHeight * 0.45) { ly = innerHeight * 0.74; sh = 160; }
      ov.style.setProperty('--ly', ly + 'px');

      // le nom, cloné à l'endroit exact du titre du hero
      const title = $('.hero__title'), tr = title.getBoundingClientRect();
      const name = title.cloneNode(true);
      name.removeAttribute('aria-label');
      name.classList.add('intro__name');
      Object.assign(name.style, { left: tr.left + 'px', top: tr.top + 'px', width: tr.width + 'px' });
      ov.appendChild(name);
      const chars = $$('.hero__line', name).flatMap(splitChars);
      const dot = $('.hero__dot', name);

      // tracé sur toute la largeur
      const cv = $('.intro__trace', ov), ctx = cv.getContext('2d');
      const dpr = Math.min(2, devicePixelRatio || 1);
      cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const W = innerWidth, st = { sweep: 0, amp: 0, glow: 1 };
      const fEl = $('.intro__f', ov), tEl = $('.intro__t', ov), status = $('.intro__status', ov);
      const t0 = performance.now();
      const draw = () => {
        if (performance.now() - SCOPE.last > 120) SCOPE.t += 1 / 60;   // l'oscilloscope du hero n'avance pas : on fait avancer la phase ici
        const t = SCOPE.t, A = st.amp * 0.24 * sh;
        ctx.clearRect(0, 0, W, innerHeight);
        const xEnd = W * st.sweep;
        const yAt = u => ly + A * (0.9 + 0.1 * Math.sin(u * 30 + t * 4)) * Math.sin(u * 7 * Math.PI * 2 - t * 2.4);
        // grille discrète
        ctx.lineWidth = 1; ctx.strokeStyle = `rgba(252,251,248,${0.07 * st.glow})`; ctx.beginPath();
        const cols = Math.max(4, Math.round(W / 90));
        for (let i = 1; i < cols; i++) { const x = Math.round(i * W / cols) + 0.5; ctx.moveTo(x, ly - sh * 0.56); ctx.lineTo(x, ly + sh * 0.44); }
        ctx.stroke();
        if (xEnd > 1) {
          ctx.beginPath();
          for (let x = 0; x <= xEnd; x += 2) { const y = yAt(x / W); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
          ctx.strokeStyle = `rgba(252,251,248,${0.95 * st.glow})`; ctx.lineWidth = 1.8; ctx.stroke();
          ctx.fillStyle = `rgba(253,83,33,${st.glow})`;
          ctx.beginPath(); ctx.arc(xEnd, yAt(xEnd / W), 5, 0, Math.PI * 2); ctx.fill();
        }
        tEl.textContent = ((performance.now() - t0) / 1000).toFixed(3);
      };
      gsap.ticker.add(draw);

      const f = { v: 0 };
      const hud = $$('.intro__hud > span', ov), skip = $('.intro__skip', ov);
      const panels = $$('.intro__panel', ov);
      const heroBits = $$('.hero__meta > *, .hero__lead, .hero__ctas > *');
      gsap.set(chars, { yPercent: 160 });
      gsap.set(dot, { scale: 0 });

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          gsap.ticker.remove(draw);
          done();
          lenis && lenis.start();
          resolve();
        }
      });
      tl.to(hud, { opacity: 1, duration: 0.6, stagger: 0.06 }, 0)
        .to(skip, { opacity: 1, duration: 0.4 }, 0.4)
        .to(st, { sweep: 1, duration: 0.85, ease: 'power2.inOut' }, 0.15)
        .to(st, { amp: 1, duration: 1.1, ease: 'power2.out' }, 0.9)
        .to(f, { v: 144, duration: 1.4, ease: 'expo.out', onUpdate: () => { fEl.textContent = f.v.toFixed(3).padStart(7, '0'); } }, 0.9)
        .to(chars, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.045 }, 1.0)
        .to(dot, { scale: 1, duration: 0.8, ease: 'back.out(3)' }, 1.9)
        .add(() => { status.textContent = 'signal verrouillé'; }, 2.1)
        .addLabel('exit', 2.75)
        .to(panels[0], { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, 'exit')
        .to(panels[1], { yPercent: 100, duration: 1.1, ease: 'expo.inOut' }, 'exit')
        .to([...hud, skip], { opacity: 0, duration: 0.3, ease: 'power1.out' }, 'exit')
        .to(name, { color: '#001011', duration: 0.7, ease: 'power2.inOut' }, 'exit+=0.15')
        .to(st, { glow: 0, duration: 0.6, ease: 'power1.inOut' }, 'exit+=0.35')
        .from('.nav', { yPercent: -100, duration: 1, ease: 'expo.out', clearProps: 'transform' }, 'exit+=0.6')
        .from(heroBits, { y: 24, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.06, clearProps: 'transform,opacity' }, 'exit+=0.5');

      const skipTo = () => { if (tl.time() < tl.labels.exit) tl.play('exit'); };
      skip.addEventListener('click', skipTo);
      ov.addEventListener('click', skipTo);
      addEventListener('keydown', skipTo, { once: true });
    }));
  }

  /* ---------- Navigation ---------- */
  let menuOpen = false;
  const navEl = $('.nav');
  const menu = $('#menu');
  const burger = $('.nav__burger');

  function openMenu() {
    menuOpen = true;
    menu.hidden = false;
    navEl.classList.add('is-menu');
    navEl.classList.remove('is-hidden');
    burger.setAttribute('aria-expanded', 'true');
    lenis && lenis.stop();
    document.body.style.overflow = 'hidden';
    if (HAS_GSAP) {
      gsap.fromTo(menu, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.85, ease: 'expo.inOut' });
      gsap.from($$('a, .menu__foot', menu), { yPercent: 60, opacity: 0, stagger: 0.05, duration: 1, ease: 'expo.out', delay: 0.3 });
    } else menu.style.clipPath = 'none';
  }

  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false;
    navEl.classList.remove('is-menu');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    lenis && lenis.start();
    const done = () => { menu.hidden = true; };
    if (HAS_GSAP) gsap.to(menu, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.7, ease: 'expo.inOut', onComplete: done });
    else done();
  }

  function nav() {
    const bar = $('.progress span');
    let lastY = scrollY;
    const onScroll = () => {
      const y = scrollY, max = root.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      navEl.classList.toggle('is-scrolled', y > 24);
      if (!menuOpen && Math.abs(y - lastY) > 4) {
        navEl.classList.toggle('is-hidden', y > lastY && y > 420);
        lastY = y;
      }
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    burger.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));

    // lien actif + soulignement glissant
    const links = $$('.nav__links a');
    const ind = $('.nav__ind');
    const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
    const setActive = a => {
      links.forEach(l => l.classList.toggle('is-active', l === a));
      if (!a) { ind.style.opacity = 0; return; }
      ind.style.opacity = 1;
      ind.style.width = a.offsetWidth + 'px';
      ind.style.transform = `translateX(${a.offsetLeft}px)`;
    };
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(map.get(e.target.id) || null); });
    }, { rootMargin: '-48% 0px -51% 0px' });
    $$('main > section[id]').forEach(s => io.observe(s));

    // une seule touche « ember » par écran : le bouton de la nav s'éteint
    // quand un autre bouton orange est visible
    const vis = new Set();
    const io2 = new IntersectionObserver(es => {
      es.forEach(e => (e.isIntersecting ? vis.add(e.target) : vis.delete(e.target)));
      document.body.classList.toggle('ember-elsewhere', vis.size > 0);
    });
    $$('.btn-ember').filter(b => !b.classList.contains('nav__cta')).forEach(b => io2.observe(b));
  }

  /* ---------- Section sombre (projets) ---------- */
  function themeSwitch() {
    const meta = $('meta[name="theme-color"]');
    const io = new IntersectionObserver(([e]) => {
      document.body.classList.toggle('theme-dark', e.isIntersecting);
      meta.content = e.isIntersecting ? '#001011' : '#fcfbf8';
    }, { rootMargin: '-50% 0px -50% 0px' });
    io.observe($('#projets'));
  }

  /* ---------- Curseur : un point qui s'agrandit sur les liens, une pastille sur les médias ---------- */
  function cursor() {
    if (!FINE || !HAS_GSAP) return;
    root.classList.add('has-cursor', 'c-hidden');
    const dot = $('.c-dot'), lab = $('.c-label'), labTxt = $('.c-label span');
    let mx = innerWidth / 2, my = innerHeight / 2, dx = mx, dy = my, lx = mx, ly = my;
    addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; root.classList.remove('c-hidden'); }, { passive: true });
    document.addEventListener('mouseleave', () => root.classList.add('c-hidden'));
    gsap.ticker.add(() => {
      dx += (mx - dx) * 0.42; dy += (my - dy) * 0.42;
      lx += (mx - lx) * 0.14; ly += (my - ly) * 0.14;
      dot.style.transform = `translate3d(${dx.toFixed(1)}px,${dy.toFixed(1)}px,0)`;
      lab.style.transform = `translate3d(${lx.toFixed(1)}px,${ly.toFixed(1)}px,0)`;
    });
    document.addEventListener('mouseover', e => {
      const t = e.target.closest('[data-cursor]');
      if (t) {
        labTxt.textContent = t.dataset.cursor;
        root.classList.add('c-lab');
        root.classList.remove('c-link');
        return;
      }
      root.classList.remove('c-lab');
      root.classList.toggle('c-link', !!e.target.closest('a, button, .acc__item, .chip'));
    });
  }

  /* ---------- Boutons magnétiques ---------- */
  function magnetic() {
    if (!FINE || !ANIM) return;
    $$('[data-magnetic]').forEach(el => {
      const k = parseFloat(el.dataset.magnetic) || 0.3;
      const xTo = gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3.out' });
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * k);
        yTo((e.clientY - r.top - r.height / 2) * k);
      });
      el.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ---------- Cartes « offre » : remplissage depuis le point d'entrée ---------- */
  function spots() {
    $$('[data-spot]').forEach(el => {
      const set = e => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', e.clientX - r.left + 'px');
        el.style.setProperty('--my', e.clientY - r.top + 'px');
      };
      el.addEventListener('pointerenter', set);
      el.addEventListener('pointerleave', set);
    });
  }

  /* ---------- Apparitions au scroll ---------- */
  // Révèle les éléments dès qu'ils atteignent le bas de l'écran — y compris ceux
  // qu'un saut de scroll (lien d'ancre, barre de défilement) a fait dépasser.
  function revealer(els, onReveal) {
    let pending = els.slice(), raf = 0;
    const check = () => {
      raf = 0;
      const lim = innerHeight * 0.92;
      const atEnd = scrollY + innerHeight >= root.scrollHeight - 4;
      let k = 0;
      pending = pending.filter(el => {
        if (!atEnd && el.getBoundingClientRect().top >= lim) return true;
        onReveal(el, Math.min(k++, 6) * 0.08);
        return false;
      });
    };
    const schedule = () => { if (!raf && pending.length) raf = requestAnimationFrame(check); };
    return schedule;
  }

  function reveals() {
    if (!ANIM) return;
    const schedule = revealer($$('[data-reveal]'), (el, d) => {
      el.style.setProperty('--d', d + 's');
      el.classList.add('is-in');
    });
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    schedule();
  }

  function scrollAnims() {
    // titres : mots qui montent
    $$('[data-split]').forEach(el => {
      gsap.from($$('.wi', el), { yPercent: 105, duration: 1.3, ease: 'power4.out', stagger: 0.045, scrollTrigger: { trigger: el, start: 'top 88%' } });
    });

    // en-têtes de section : filet qui se trace
    $$('.sh').forEach(sh => {
      gsap.timeline({ scrollTrigger: { trigger: sh, start: 'top 90%' } })
        .from($('.sh__line', sh), { scaleX: 0, duration: 1.8, ease: 'expo.out' })
        .from([$('.sh__l', sh), $('.sh__r', sh)], { y: 12, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: 0.08 }, 0.1);
    });

    // déclaration du profil : les mots s'allument au fil du scroll
    $$('[data-scrub-text]').forEach(el => {
      gsap.fromTo(splitPlain(el), { opacity: 0.12 }, {
        opacity: 1, ease: 'none', stagger: 0.1,
        scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: 0.6 }
      });
    });

    // portrait : rideau + parallaxe
    $$('[data-img-reveal]').forEach(fig => {
      gsap.fromTo(fig, { clipPath: 'inset(100% 0% 0% 0% round 20px)' }, { clipPath: 'inset(0% 0% 0% 0% round 20px)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: fig, start: 'top 80%' } });
      gsap.from($('img', fig), { scale: 1.4, duration: 2, ease: 'expo.out', scrollTrigger: { trigger: fig, start: 'top 80%' } });
    });
    if (!CALM) $$('[data-parallax]').forEach(el => {
      gsap.fromTo(el, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // compteurs
    $$('[data-count]').forEach(el => {
      const end = parseFloat(el.dataset.count), o = { v: 0 };
      el.textContent = '0';
      ScrollTrigger.create({
        trigger: el, start: 'top 92%', once: true,
        onEnter: () => gsap.to(o, { v: end, duration: 2.2, ease: 'expo.out', onUpdate: () => { el.textContent = Math.round(o.v); } })
      });
    });

    // hero : le nom s'écarte et remonte
    const hl = $$('.hero__line');
    gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
      .to(hl[0], { xPercent: -9, ease: 'none' }, 0)
      .to(hl[1], { xPercent: 9, ease: 'none' }, 0)
      .to('.hero__title', { yPercent: -22, ease: 'none' }, 0)
      .to('.hero__bottom', { yPercent: -50, opacity: 0, ease: 'none' }, 0);

    // offres
    gsap.from('.offer', { y: 40, opacity: 0, duration: 1.2, ease: 'power3.out', stagger: 0.1, clearProps: 'transform,opacity', scrollTrigger: { trigger: '.offers', start: 'top 85%' } });

    // frise chronologique : le trait se remplit
    $$('.tl').forEach(tl => {
      gsap.fromTo($('.tl__fill', tl), { height: '0%' }, { height: '100%', ease: 'none', scrollTrigger: { trigger: tl, start: 'top 70%', end: 'bottom 70%', scrub: 0.5 } });
    });

    // accordéon univers
    gsap.from('.acc__item', { y: 40, opacity: 0, duration: 1.2, ease: 'power3.out', stagger: 0.08, clearProps: 'transform,opacity', scrollTrigger: { trigger: '.acc', start: 'top 85%' } });

    // contact : grandes lettres
    gsap.from($$('.contact__big .ch, .contact__big .ember-dot'), { yPercent: 110, duration: 1.4, ease: 'expo.out', stagger: 0.025, scrollTrigger: { trigger: '.contact__big', start: 'top 85%' } });

    // pied de page : le logo se compose au scroll
    const fw = splitChars($('.footer__word'));
    gsap.from(fw, { yPercent: 105, ease: 'none', stagger: 0.06, scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: 0.6 } });
  }

  /* ---------- Bandeaux défilants (vitesse liée au scroll) ---------- */
  function marquees() {
    if (CALM) return;
    $$('.marquee').forEach((m, idx) => {
      const track = $('.marquee__track', m);
      track.innerHTML += track.innerHTML;
      const sign = idx % 2 ? 1 : -1;
      const base = idx % 2 ? 0.022 : 0.03;
      let x = idx % 2 ? -50 : 0, dir = 1, visible = false;
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(m);
      gsap.ticker.add((time, dt) => {
        if (!visible) return;
        const v = lenis ? lenis.velocity : 0;
        if (v > 0.3) dir = 1; else if (v < -0.3) dir = -1;
        x += (base + Math.min(Math.abs(v) * 0.004, 0.12)) * sign * dir * (dt / 16.67);
        if (x <= -50) x += 50;
        if (x > 0) x -= 50;
        track.style.transform = `translate3d(${x.toFixed(3)}%,0,0)`;
      });
    });
  }

  /* ---------- Oscilloscope du hero ---------- */
  function scope() {
    const c = $('.scope__canvas');
    if (!c) return;
    const ctx = c.getContext('2d'), hero = $('.hero');
    const freqEl = $('.scope__freq'), ampEl = $('.scope__amp');
    let w = 0, h = 0, tx = 0.5, ty = 0.5, fx = 0.5, fy = 0.5, visible = true;
    const resize = () => {
      const dpr = Math.min(2, devicePixelRatio || 1);
      w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    addEventListener('resize', resize);
    hero.addEventListener('mousemove', e => { tx = e.clientX / innerWidth; ty = e.clientY / innerHeight; });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(c);

    const draw = () => {
      if (!visible || document.hidden || !w) return;
      fx += (tx - fx) * 0.045; fy += (ty - fy) * 0.045; SCOPE.t += 1 / 60; SCOPE.last = performance.now();
      const t = SCOPE.t;
      const damp = 1 - Math.min(1, scrollY / (hero.offsetHeight * 0.85));
      ctx.clearRect(0, 0, w, h);

      ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(0,16,17,.10)'; ctx.beginPath();
      const cols = Math.max(4, Math.round(w / 90));
      for (let i = 1; i < cols; i++) { const x = Math.round(i * w / cols) + 0.5; ctx.moveTo(x, 0); ctx.lineTo(x, h); }
      for (let j = 1; j < 4; j++) { const y = Math.round(j * h / 4) + 0.5; ctx.moveTo(0, y); ctx.lineTo(w, y); }
      ctx.stroke();

      const cycles = 2.5 + fx * 9;
      const amp = (0.12 + (1 - fy) * 0.24) * h * (0.08 + 0.92 * damp);
      const mid = h * 0.56;
      const yAt = u => mid + amp * (0.9 + 0.1 * Math.sin(u * 30 + t * 4)) * Math.sin(u * cycles * Math.PI * 2 - t * 2.4);
      ctx.beginPath(); ctx.lineWidth = 1.6; ctx.strokeStyle = '#001011';
      for (let x = 0; x <= w; x += 2) { const y = yAt(x / w); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();

      const u = Math.min(0.98, Math.max(0.02, fx)), mx = u * w;
      ctx.setLineDash([3, 5]); ctx.strokeStyle = 'rgba(0,16,17,.35)';
      ctx.beginPath(); ctx.moveTo(mx + 0.5, 0); ctx.lineTo(mx + 0.5, h); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#fd5321'; ctx.beginPath(); ctx.arc(mx, yAt(u), 4.5, 0, Math.PI * 2); ctx.fill();

      freqEl.textContent = `f = ${(144 + (fx - 0.5) * 60).toFixed(3)} MHz`;
      ampEl.textContent = (0.5 + (1 - fy) * 1.5).toFixed(2);
    };
    tick(draw);
  }

  /* ---------- Interlude : une carte électronique qui s'assemble au scroll ---------- */
  function circuit() {
    const svg = $('.circuit__svg');
    if (!svg || !window.buildPCB) return;
    const pcb = window.buildPCB(svg);
    // sur mobile : plan rapproché sur le microcontrôleur
    const narrow = matchMedia('(max-width: 900px)');
    const frame = () => svg.setAttribute('viewBox', narrow.matches ? '400 110 800 680' : '0 0 1600 900');
    frame();
    narrow.addEventListener('change', frame);
    const pct = $('.circuit__pct'), stepEl = $('.circuit__step');
    const glowPwr = $('.pcb-glow--pwr', svg);
    const POWER = 5.45;
    const STEPS = [[0, 'substrat'], [0.7, 'gravure du cuivre'], [2.3, 'vernis & sérigraphie'], [3.1, 'placement des CMS'], [POWER, 'mise sous tension']];

    if (!ANIM) {
      svg.classList.add('is-on');
      pcb.leds[0].setAttribute('opacity', 1);
      glowPwr.style.opacity = 0.85;
      pct.textContent = '100';
      stepEl.textContent = STEPS[STEPS.length - 1][1];
      return;
    }

    let seed = 3;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const lines = [...pcb.clear, ...pcb.traces], n = pcb.traces.length;
    const order = pcb.traces.map(() => rnd());
    lines.forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = `${L} ${L}`; p.style.strokeDashoffset = L; });
    gsap.set(pcb.traces, { stroke: '#d38f4c' });
    gsap.set([pcb.pads, pcb.vias, pcb.silk], { opacity: 0 });
    gsap.set(pcb.parts, { opacity: 0, y: -60, scale: 1.15, transformOrigin: '50% 50%' });

    const tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.fromTo(svg, { rotationX: 42, scale: 0.84, y: 60, opacity: 0, transformPerspective: 1600, transformOrigin: '50% 60%' },
      { rotationX: 0, scale: 1, y: 0, opacity: 1, duration: 1, ease: 'power2.out' }, 0)
      .to(pcb.pads, { opacity: 1, duration: 0.3 }, 0.6)
      .to(lines, { strokeDashoffset: 0, duration: 0.9, stagger: i => order[i % n] * 0.7 }, 0.75)
      .to(pcb.vias, { opacity: 1, duration: 0.3 }, 2.0)
      .to(pcb.traces, { stroke: '#1d3336', duration: 0.5 }, 2.35)
      .to(pcb.silk, { opacity: 1, duration: 0.5 }, 2.5)
      .to(pcb.parts, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out', stagger: 0.045 }, 3.1)
      .to(pcb.leds[0], { opacity: 1, duration: 0.12 }, POWER)
      .to(glowPwr, { opacity: 0.85, duration: 0.2 }, POWER)
      .to({}, { duration: 0.7 }, POWER + 0.2);
    tl.eventCallback('onUpdate', () => {
      const t = tl.time();
      pct.textContent = String(Math.round(tl.progress() * 100)).padStart(3, '0');
      let label = STEPS[0][1];
      STEPS.forEach(([at, l]) => { if (t >= at) label = l; });
      if (stepEl.textContent !== label) stepEl.textContent = label;
      svg.classList.toggle('is-on', t >= POWER);
    });
    ScrollTrigger.create({ animation: tl, trigger: '.circuit', start: 'top top', end: '+=230%', pin: true, scrub: 0.6 });

    // impulsions orange sur les bus une fois la carte alimentée
    const NSV = 'http://www.w3.org/2000/svg';
    const sparks = Array.from({ length: 22 }, (_, k) => {
      const p = pcb.sparkPaths[k % pcb.sparkPaths.length];
      const c = document.createElementNS(NSV, 'circle');
      c.setAttribute('r', 3.6); c.setAttribute('class', 'pcb-spark'); c.setAttribute('opacity', 0);
      pcb.fx.appendChild(c);
      return { p, c, len: p.getTotalLength(), t: rnd(), sp: 0.004 + rnd() * 0.006, vis: false };
    });
    let visible = false;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe($('.circuit'));
    gsap.ticker.add(() => {
      if (!visible) return;
      const on = svg.classList.contains('is-on');
      sparks.forEach(s => {
        if (!on) { if (s.vis) { s.c.setAttribute('opacity', 0); s.vis = false; } return; }
        s.t = (s.t + s.sp) % 1;
        const q = s.p.getPointAtLength(s.t * s.len);
        s.c.setAttribute('cx', q.x.toFixed(1));
        s.c.setAttribute('cy', q.y.toFixed(1));
        const f = s.t < 0.08 ? s.t / 0.08 : s.t > 0.92 ? (1 - s.t) / 0.08 : 1;
        s.c.setAttribute('opacity', (f * 0.95).toFixed(2));
        s.vis = true;
      });
    });

    // légère inclinaison 3D à la souris
    if (FINE) {
      const stage = $('.circuit__stage');
      gsap.set(stage, { transformPerspective: 1600 });
      const rx = gsap.quickTo(stage, 'rotationX', { duration: 1.4, ease: 'power3' });
      const ry = gsap.quickTo(stage, 'rotationY', { duration: 1.4, ease: 'power3' });
      $('.circuit').addEventListener('mousemove', e => {
        ry((e.clientX / innerWidth - 0.5) * 6);
        rx(-(e.clientY / innerHeight - 0.5) * 5);
      });
    }
  }

  /* ---------- Projets : défilement horizontal épinglé ---------- */
  function hscroll() {
    const cards = $$('.pcard');
    if (FINE) {
      cards.forEach(c => {
        const m = $('.pcard__media', c);
        gsap.set(m, { transformPerspective: 900 });
        const rx = gsap.quickTo(m, 'rotationX', { duration: 0.8, ease: 'power3' });
        const ry = gsap.quickTo(m, 'rotationY', { duration: 0.8, ease: 'power3' });
        c.addEventListener('mousemove', e => {
          const r = m.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 6);
          rx(-((e.clientY - r.top) / r.height - 0.5) * 5);
        });
        c.addEventListener('mouseleave', () => { rx(0); ry(0); });
      });
    }

    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => {
      const wrap = $('.hscroll'), track = $('.hscroll__track');
      const bar = $('.hscroll__bar span'), count = $('.hscroll__count');
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      const tween = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: wrap, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.9,
          invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: self => {
            bar.style.transform = `scaleX(${self.progress})`;
            count.textContent = `${pad(Math.min(cards.length, Math.round(self.progress * (cards.length - 1)) + 1))} / ${pad(cards.length)}`;
          }
        }
      });
      if (!CALM) cards.forEach(c => {
        gsap.fromTo($('.pcard__par', c), { xPercent: 7 }, { xPercent: -7, ease: 'none', scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
        gsap.fromTo($('.pcard__num', c), { xPercent: -40 }, { xPercent: 40, ease: 'none', scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
      });
      gsap.from(cards, { y: 60, opacity: 0, duration: 1.3, ease: 'power3.out', stagger: 0.08, clearProps: 'transform,opacity', scrollTrigger: { trigger: wrap, start: 'top 70%' } });
    });
    mm.add('(max-width: 900px)', () => {
      cards.forEach(c => gsap.from(c, { y: 40, opacity: 0, duration: 1.1, ease: 'power3.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: c, start: 'top 90%' } }));
    });
  }

  /* ---------- Index : filtres + aperçu qui suit la souris ---------- */
  function indexList() {
    const list = $('.index__list'), rows = $$('.irow', list);
    $('.filters').addEventListener('click', e => {
      const b = e.target.closest('.chip');
      if (!b) return;
      const f = b.dataset.filter;
      $$('.chip').forEach(c => { const on = c === b; c.classList.toggle('is-active', on); c.setAttribute('aria-pressed', on); });
      rows.forEach(r => {
        const hide = f !== 'all' && r.dataset.cat !== f;
        r.classList.toggle('is-hidden', hide);
        $('a', r).tabIndex = hide ? -1 : 0;
      });
      if (HAS_GSAP) setTimeout(() => ScrollTrigger.refresh(), 800);
    });

    if (!FINE || !HAS_GSAP) return;
    const prev = $('.hover-preview'), inner = $('.hover-preview__inner'), imgs = {};
    let loaded = false, mx = 0, my = 0, px = 0, py = 0, active = null;
    const st = { s: 0.6, o: 0 };
    const load = () => {
      if (loaded) return;
      loaded = true;
      P.forEach(p => { const i = new Image(); i.alt = ''; i.decoding = 'async'; i.src = src(p.cover, 'sm'); inner.appendChild(i); imgs[p.id] = i; });
    };
    list.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    list.addEventListener('mouseenter', e => { load(); px = mx = e.clientX; py = my = e.clientY; gsap.to(st, { s: 1, o: 1, duration: 0.7, ease: 'expo.out', overwrite: true }); });
    list.addEventListener('mouseleave', () => gsap.to(st, { s: 0.6, o: 0, duration: 0.45, ease: 'power3.out', overwrite: true }));
    rows.forEach(r => r.addEventListener('mouseenter', () => {
      load();
      const img = imgs[$('a', r).dataset.preview];
      if (img === active) return;
      active && active.classList.remove('is-active');
      active = img;
      active.classList.add('is-active');
    }));
    gsap.ticker.add(() => {
      if (st.o === 0) { prev.style.opacity = 0; return; }
      const dx = mx - px;
      px += dx * 0.12; py += (my - py) * 0.12;
            prev.style.opacity = st.o;
      prev.style.transform = `translate3d(${px}px,${py}px,0) translate(6%,-58%) scale(${st.s.toFixed(3)})`;
    });
  }

  /* ---------- Terminal SQL / Python ---------- */
  const TERM = [
    ['c', 'MariaDB [northwind]> ', 'SELECT c.CategoryName, COUNT(*) AS nombre,'],
    ['c', '    -> ', 'MIN(p.Price) AS min, MAX(p.Price) AS max'],
    ['c', '    -> ', 'FROM Products p JOIN Categories c USING (CategoryID)'],
    ['c', '    -> ', 'GROUP BY c.CategoryName;'],
    ['o', '+----------------+--------+-----+-----+'],
    ['o', '| CategoryName   | nombre | min | max |'],
    ['o', '+----------------+--------+-----+-----+'],
    ['o', '| Beverages      |     12 |   5 | 264 |'],
    ['o', '| Condiments     |     12 |  10 |  44 |'],
    ['o', '| Confections    |     13 |   9 |  81 |'],
    ['o', '| Dairy Products |     10 |   3 |  55 |'],
    ['o', '| Grains/Cereals |      7 |   7 |  38 |'],
    ['o', '| Meat/Poultry   |      6 |   7 | 124 |'],
    ['o', '| Produce        |      5 |  10 |  53 |'],
    ['o', '| Seafood        |     12 |   6 |  63 |'],
    ['o', '+----------------+--------+-----+-----+'],
    ['o', '8 rows in set (0.00 sec)', 'hl'],
    ['o', ''],
    ['c', 'but@debian:~$ ', 'python3 produits03.py'],
    ['o', '================================='],
    ['o', '          MENU PRODUITS'],
    ['o', ' 0 - Quitter'],
    ['o', ' 1 - Lister les catégories'],
    ['o', ' 2 - Lister les produits d’une catégorie'],
    ['o', ' 3 - Rechercher les produits par leur nom'],
    ['o', ' 4 - Statistiques de ventes par année'],
    ['c', '                   Choix : ', '4'],
    ['c', ' ID produit : ', '38'],
    ['o', ' Statistiques annuelles — Côte de Blaye', 'hl'],
    ['o', ' Année Mois : Chiffre'],
    ['o', '  1996   10 : 36960 €'],
    ['o', '  1997    1 : 26136 €']
  ];
  const TERM_BAR = '<div class="term__bar"><i></i><i></i><i></i><span class="mono">but@debian — northwind</span><button type="button" class="term__replay mono">rejouer</button></div><div class="term__body mono"></div>';

  function mountTerminal(term, rootEl = null) {
    if (!term) return null;
    const body = $('.term__body', term);
    let run = 0, started = false;
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const kw = s => esc(s).replace(/\b(SELECT|FROM|JOIN|USING|GROUP BY|AS|COUNT|MIN|MAX|python3)\b/g, '<span class="kw">$1</span>');
    async function play() {
      const id = ++run;
      body.innerHTML = '';
      const caret = document.createElement('span');
      caret.className = 'term__caret';
      for (const [type, a, b] of TERM) {
        if (id !== run) return;
        const line = document.createElement('div');
        line.className = 'l';
        body.appendChild(line);
        if (type === 'c') {
          line.innerHTML = `<span class="pr">${esc(a)}</span><span class="cmd"></span>`;
          const cmd = line.lastChild;
          line.appendChild(caret);
          for (const ch of b) {
            if (id !== run) return;
            cmd.textContent += ch;
            await sleep(12 + Math.random() * 34);
          }
          cmd.innerHTML = kw(b);
          await sleep(240);
        } else {
          line.textContent = a;
          if (b === 'hl') line.classList.add('hl');
          await sleep(40);
        }
        body.scrollTop = body.scrollHeight;
      }
      const end = document.createElement('div');
      end.className = 'l';
      end.innerHTML = '<span class="pr">but@debian:~$ </span>';
      end.appendChild(caret);
      body.appendChild(end);
      body.scrollTop = body.scrollHeight;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) { started = true; play(); io.disconnect(); }
    }, { root: rootEl, threshold: 0.3 });
    io.observe(term);
    $('.term__replay', term).addEventListener('click', play);
    return { stop: () => { run++; io.disconnect(); } };
  }

  /* ---------- Étude de cas (fenêtre projet) ---------- */
  const caseEl = $('#case'), caseScroll = $('.case__scroll'), caseContent = $('.case__content'), caseBar = $('.case__bar');
  let caseOpen = false, caseIdx = -1, lastFocus = null, caseCleanup = [];

  function caseHTML(p, i) {
    const n = P.length, next = P[(i + 1) % n];
    const isSvg = /\.svg$/.test(p.cover);
    const tags = arr => arr.map(t => `<span class="tag">${esc(t)}</span>`).join('');
    const figs = (p.figures || []).map(f => `
      <div class="fig" data-cr>
        <span class="fig__v">${f.p || ''}<span data-cnt="${f.v}" data-dec="${f.d || 0}">${fmt(f.v, f.d)}</span>${f.u ? `<small>${esc(f.u)}</small>` : ''}</span>
        <span class="fig__l">${esc(f.l)}</span>
      </div>`).join('');
    return `
      <header class="case__head wrap">
        <p class="case__cat mono"><span>(${pad(i + 1)})</span><span>${esc(CATS[p.cat] || '')}</span>${p.isNew ? '<span class="badge-new mono">nouveau · BUT 3</span>' : ''}</p>
        <h2 class="case__title" id="case-title">${esc(p.title)}</h2>
        <dl class="case__meta">
          <div><dt>année</dt><dd>${esc(p.year)}</dd></div>
          <div><dt>cadre</dt><dd>${esc(p.frame)}</dd></div>
          <div><dt>période</dt><dd>${esc(p.duration)}</dd></div>
          <div><dt>rôle</dt><dd>${esc(p.role)}</dd></div>
        </dl>
      </header>
      <figure class="case__cover${isSvg ? ' case__cover--svg' : ''}" data-lb="0" data-cursor="zoom">
        <div class="case__cover-par"><img src="${src(p.cover)}" alt="${esc(p.alt || '')}"></div>
      </figure>
      <div class="wrap case__grid">
        <aside class="case__aside">
          ${figs ? `<p class="mono case__aside-title" data-cr>en chiffres</p>${figs}` : `<p class="mono case__aside-title" data-cr>outils</p><div class="tags" data-cr>${tags(p.tools)}</div>`}
        </aside>
        <div class="case__main">
          <h3 data-cr>contexte</h3>
          <p class="case__context" data-cr>${esc(p.context)}</p>
          <h3 data-cr>missions</h3>
          <ol class="case__missions">${p.missions.map((m, k) => `<li data-cr><span class="mono">${pad(k + 1)}</span><span>${esc(m)}</span></li>`).join('')}</ol>
          <h3 data-cr>acquis</h3>
          <div class="tags" data-cr>${tags(p.skills)}</div>
          ${figs ? `<h3 data-cr>outils</h3><div class="tags" data-cr>${tags(p.tools)}</div>` : ''}
          ${p.terminal ? `<h3 data-cr>démo</h3><div class="term case__term" data-cr>${TERM_BAR}</div>` : ''}
          ${p.docs && p.docs.length ? `<h3 data-cr>documents</h3><div class="case__docs" data-cr>${p.docs.map(d => `
            <a class="pill" href="${esc(d.href)}" target="_blank" rel="noopener"><span class="pill__icon">${ARROW}${ARROW}</span><span data-roll>${esc(d.label)}</span></a>`).join('')}</div>` : ''}
        </div>
      </div>
      ${p.videos ? `
      <section class="case__reels" aria-label="Vidéos">
        <div class="wrap case__gallery-head"><h3 class="mono">en vidéo — ${p.videos.length} séquences</h3><span class="mono">lecture automatique, sans son</span></div>
        <div class="wrap case__reels-row">${p.videos.map(reelHTML).join('')}${p.videosNote ? `<p class="case__reels-note" data-cr>${esc(p.videosNote)}</p>` : ''}</div>
      </section>` : ''}
      ${p.images.length > 1 ? `
      <section class="case__gallery" aria-label="Galerie">
        <div class="wrap case__gallery-head"><h3 class="mono">galerie — ${p.images.length} images</h3><span class="mono">glisser ou cliquer →</span></div>
        <div class="gal" data-cursor="glisser">${p.images.map((im, k) => `
          <figure class="gal__item" data-lb="${k}"><img src="${src(im, 'sm')}" alt="${esc(p.title)} — image ${k + 1}" draggable="false"></figure>`).join('')}
        </div>
      </section>` : ''}
      <a class="case__next" href="#projet-${next.id}" data-next="${next.id}" data-cursor="suivant">
        <span class="case__next-in">
          <span><span class="mono">projet suivant — ${pad(((i + 1) % n) + 1)} / ${pad(n)}</span><span class="case__next-title">${esc(next.title)}</span></span>
          <span class="case__next-img"><img src="${src(next.cover, 'sm')}" alt="" loading="lazy"></span>
        </span>
      </a>`;
  }

  function renderCase(i) {
    caseCleanup.forEach(fn => fn());
    caseCleanup = [];
    const p = P[i];
    caseIdx = i;
    caseContent.innerHTML = caseHTML(p, i);
    $('.case__count').textContent = `${pad(i + 1)} / ${pad(P.length)}`;
    splitWords($('.case__title', caseContent));
    rollify(caseContent);
    caseScroll.scrollTop = 0;
    history.replaceState(null, '', '#projet-' + p.id);

    // apparitions dans la fenêtre + compteurs
    const schedule = revealer($$('[data-cr]', caseContent), (el, d) => {
      el.style.transitionDelay = d + 's';
      el.classList.add('in');
      if (!ANIM) return;
      $$('[data-cnt]', el).forEach(c => {
        const end = parseFloat(c.dataset.cnt), dec = +c.dataset.dec, o = { v: 0 };
        gsap.to(o, { v: end, duration: 2, ease: 'expo.out', onUpdate: () => { c.textContent = fmt(o.v, dec); } });
      });
    });
    caseScroll.addEventListener('scroll', schedule, { passive: true });
    caseCleanup.push(() => caseScroll.removeEventListener('scroll', schedule));
    setTimeout(schedule, ANIM ? 700 : 0);

    // parallaxe de la couverture
    const par = $('.case__cover-par', caseContent);
    const onScroll = () => {
      const y = caseScroll.scrollTop;
      caseBar.classList.toggle('is-stuck', y > 8);
      if (ANIM && !CALM && !par.parentElement.classList.contains('case__cover--svg')) par.style.transform = `translate3d(0,${(y * 0.16).toFixed(1)}px,0)`;
    };
    caseScroll.addEventListener('scroll', onScroll, { passive: true });
    caseCleanup.push(() => caseScroll.removeEventListener('scroll', onScroll));
    onScroll();

    const gal = $('.gal', caseContent);
    if (gal) caseCleanup.push(dragScroll(gal));
    if (p.videos) caseCleanup.push(initReels(caseContent));
    if (p.terminal) {
      const ctl = mountTerminal($('.case__term', caseContent), caseScroll);
      caseCleanup.push(() => ctl && ctl.stop());
    }
  }

  function animateCaseIn(delay = 0) {
    if (!ANIM) return;
    const c = caseContent;
    gsap.from($$('.case__title .wi', c), { yPercent: 105, duration: 1.3, ease: 'power4.out', stagger: 0.045, delay });
    gsap.from($$('.case__cat > *, .case__meta > div', c), { y: 24, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.05, delay: delay + 0.15 });
    const cover = $('.case__cover', c);
    gsap.fromTo(cover, { clipPath: 'inset(12% 4% 0% 4% round 20px)' }, { clipPath: 'inset(0% 0% 0% 0% round 20px)', duration: 1.5, ease: 'power4.out', delay: delay + 0.1 });
    gsap.from($('img', cover), { scale: 1.15, duration: 1.8, ease: 'power4.out', delay: delay + 0.1 });
  }

  function openCase(id, pt) {
    const i = P.findIndex(p => p.id === id);
    if (i < 0) return;
    if (caseOpen) { if (i !== caseIdx) swapCase(i); return; }
    lastFocus = document.activeElement;
    caseOpen = true;
    closeMenu();
    renderCase(i);
    caseEl.hidden = false;
    document.body.classList.add('case-open');
    lenis && lenis.stop();
    root.classList.remove('c-lab', 'c-link');
    if (ANIM) {
      gsap.fromTo(caseEl, { clipPath: 'inset(100% 0% 0% 0%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.inOut',
        onComplete: () => gsap.set(caseEl, { clearProps: 'clipPath' })
      });
      animateCaseIn(0.45);
    }
    setTimeout(() => $('[data-case-close]').focus({ preventScroll: true }), ANIM ? 950 : 0);
  }

  function swapCase(i) {
    if (!ANIM) { renderCase(i); return; }
    gsap.to(caseContent, {
      opacity: 0, y: -40, duration: 0.4, ease: 'power3.in',
      onComplete: () => { renderCase(i); gsap.set(caseContent, { opacity: 1, y: 0 }); animateCaseIn(0); }
    });
  }

  function closeCase() {
    if (!caseOpen) return;
    caseOpen = false;
    history.replaceState(null, '', location.pathname + location.search);
    const done = () => {
      caseCleanup.forEach(fn => fn());
      caseCleanup = [];
      caseEl.hidden = true;
      if (HAS_GSAP) gsap.set(caseEl, { clearProps: 'all' });
      caseContent.innerHTML = '';
      document.body.classList.remove('case-open');
      lenis && lenis.start();
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    };
    if (ANIM) gsap.fromTo(caseEl, { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.85, ease: 'expo.inOut', onComplete: done });
    else done();
  }

  const stepCase = d => openCase(P[(caseIdx + d + P.length) % P.length].id);

  function dragScroll(gal) {
    let down = false, sx = 0, sl = 0, lastX = 0, v = 0, moved = false, raf = 0;
    const move = e => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 5) { moved = true; gal.classList.add('is-drag'); }
      v = e.clientX - lastX; lastX = e.clientX;
      gal.scrollLeft = sl - dx;
    };
    const up = () => {
      if (!down) return;
      down = false;
      gal.classList.remove('is-drag');
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', up);
      const glide = () => { v *= 0.94; gal.scrollLeft -= v; if (Math.abs(v) > 0.4) raf = requestAnimationFrame(glide); };
      glide();
    };
    const downH = e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      e.preventDefault();
      down = true; moved = false; sx = lastX = e.clientX; sl = gal.scrollLeft; v = 0;
      cancelAnimationFrame(raf);
      addEventListener('pointermove', move);
      addEventListener('pointerup', up);
    };
    const clickH = e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } };
    gal.addEventListener('pointerdown', downH);
    gal.addEventListener('click', clickH, true);
    return () => { up(); cancelAnimationFrame(raf); };
  }

  /* ---------- Visionneuse ---------- */
  const lb = $('.lightbox'), lbImg = $('.lightbox__img'), lbCount = $('.lightbox__count');
  let lbList = [], lbI = 0, lbFocus = null;

  function openLB(list, i, fromEl) {
    lbList = list; lbI = i; lbFocus = document.activeElement;
    $$('[data-lb-prev], [data-lb-next]', lb).forEach(btn => { btn.hidden = list.length < 2; });
    lb.hidden = false;
    lenis && lenis.stop();
    if (ANIM) gsap.fromTo(lb, { backgroundColor: 'rgba(0,16,17,0)' }, { backgroundColor: 'rgba(0,16,17,.94)', duration: 0.5 });
    if (ANIM) gsap.from('.lightbox__ui', { y: 40, opacity: 0, duration: 0.8, ease: 'expo.out', delay: 0.2 });
    showLB(fromEl && $('img', fromEl));
    $('[data-lb-close]').focus({ preventScroll: true });
  }

  function showLB(thumb) {
    const item = lbList[lbI];
    lbCount.textContent = `${lbI + 1} / ${lbList.length}`;
    lbImg.alt = item.alt || '';
    lbImg.src = thumb ? thumb.currentSrc || thumb.src : item.full;
    const go = () => {
      if (ANIM && thumb) {
        const r0 = thumb.getBoundingClientRect(), r1 = lbImg.getBoundingClientRect();
        gsap.fromTo(lbImg,
          { x: r0.left + r0.width / 2 - (r1.left + r1.width / 2), y: r0.top + r0.height / 2 - (r1.top + r1.height / 2), scale: r0.width / r1.width, opacity: 1 },
          { x: 0, y: 0, scale: 1, duration: 0.9, ease: 'expo.out' });
      } else if (ANIM) {
        gsap.fromTo(lbImg, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, x: 0, y: 0, duration: 0.6, ease: 'expo.out' });
      }
      if (!lbImg.src.endsWith(item.full)) {
        const hi = new Image();
        hi.src = item.full;
        hi.decode().then(() => { if (lbList[lbI] === item) lbImg.src = item.full; }).catch(() => {});
      }
    };
    lbImg.decode ? lbImg.decode().then(go, go) : go();
  }

  function closeLB() {
    const done = () => {
      lb.hidden = true;
      if (!caseOpen) lenis && lenis.start();
      lbFocus && lbFocus.focus && lbFocus.focus({ preventScroll: true });
    };
    if (ANIM) gsap.to(lb, { opacity: 0, duration: 0.35, onComplete: () => { gsap.set(lb, { clearProps: 'opacity' }); done(); } });
    else done();
  }
  const stepLB = d => { lbI = (lbI + d + lbList.length) % lbList.length; showLB(null); };

  /* ---------- Univers : illustrations animées seulement quand elles sont visibles ---------- */
  function univers() {
    const svgs = $$('.acc .ill');
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.target.pauseAnimations) return;
      e.isIntersecting ? e.target.unpauseAnimations() : e.target.pauseAnimations();
    }));
    svgs.forEach(s => io.observe(s));
  }

  /* ---------- Certifications : cascade SDR (spectre + waterfall) autour de 144 MHz ---------- */
  function waterfall() {
    const fall = $('.wf__fall'), spec = $('.wf__spec'), fEl = $('.wf__f');
    if (!fall) return;
    const fc = fall.getContext('2d'), sc = spec.getContext('2d');
    const stops = [[0, [0, 11, 12]], [0.3, [13, 28, 29]], [0.55, [44, 62, 63]], [0.78, [150, 112, 88]], [1, [253, 83, 33]]];
    const LUT = Array.from({ length: 256 }, (_, k) => {
      const v = k / 255;
      for (let i = 1; i < stops.length; i++) {
        if (v <= stops[i][0]) {
          const [a0, c0] = stops[i - 1], [a1, c1] = stops[i], m = (v - a0) / (a1 - a0);
          return c0.map((c, j) => Math.round(c + (c1[j] - c) * m));
        }
      }
      return stops[stops.length - 1][1];
    });
    const g = (u, c, w) => { const d = (u - c) / w; return Math.exp(-d * d); };
    let W = 0, H = 0, SH = 0, dpr = 1, t = 0, visible = false, row = null, vals = null, smooth = null, centre = 0.5;
    const amp = u =>
      Math.random() * 0.3 +
      0.82 * g(u, centre, 0.006) +
      0.32 * g(u, centre, 0.03) * (0.55 + 0.45 * Math.sin(t * 3.1)) +
      0.7 * g(u, 0.74, 0.0035) * ((Math.floor(t * 5) % 7) < 4 ? 1 : 0) +
      0.26 * g(u, 0.27 + 0.02 * Math.sin(t * 0.3), 0.01);
    const line = () => {
      t += 1 / 60;
      centre = 0.5 + 0.004 * Math.sin(t * 0.6);
      for (let x = 0; x < W; x++) {
        const v = amp(x / W);
        vals[x] = v;
        const c = LUT[Math.min(255, (v * 255) | 0)], i = x * 4;
        row.data[i] = c[0]; row.data[i + 1] = c[1]; row.data[i + 2] = c[2]; row.data[i + 3] = 255;
      }
    };
    const resize = () => {
      dpr = Math.min(2, devicePixelRatio || 1);
      W = Math.max(1, Math.round(fall.clientWidth * dpr));
      H = Math.max(1, Math.round(fall.clientHeight * dpr));
      SH = Math.max(1, Math.round(spec.clientHeight * dpr));
      fall.width = W; fall.height = H; spec.width = W; spec.height = SH;
      row = fc.createImageData(W, 1);
      vals = new Float32Array(W); smooth = new Float32Array(W);
      for (let y = H - 1; y >= 0; y--) { line(); fc.putImageData(row, 0, y); }
      drawSpec();
    };
    const drawSpec = () => {
      sc.clearRect(0, 0, W, SH);
      sc.beginPath();
      for (let x = 0; x < W; x += 2) {
        smooth[x] = smooth[x] * 0.65 + vals[x] * 0.35;
        const y = SH - 3 - Math.min(1, smooth[x]) * SH * 0.82;
        x ? sc.lineTo(x, y) : sc.moveTo(x, y);
      }
      sc.strokeStyle = '#fcfbf8'; sc.lineWidth = 1.2 * dpr; sc.stroke();
      sc.lineTo(W, SH); sc.lineTo(0, SH); sc.closePath();
      sc.fillStyle = 'rgba(252,251,248,.06)'; sc.fill();
      const cx = Math.round(centre * W) + 0.5;
      sc.setLineDash([3 * dpr, 4 * dpr]); sc.strokeStyle = 'rgba(253,83,33,.8)'; sc.lineWidth = dpr;
      sc.beginPath(); sc.moveTo(cx, 0); sc.lineTo(cx, SH); sc.stroke(); sc.setLineDash([]);
      fEl.textContent = `${(143.5 + centre).toFixed(3)} MHz`;
    };
    new ResizeObserver(resize).observe(fall);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(fall);
    tick(() => {
      if (!visible || document.hidden || !W) return;
      fc.drawImage(fall, 0, 0, W, H - 1, 0, 1, W, H - 1);
      line();
      fc.putImageData(row, 0, 0);
      drawSpec();
    });
  }

  /* ---------- Mannequinat : éditorial noir & blanc ---------- */
  const ED = window.EDITO || [];
  const EDITO_LIST = ED.map(e => ({ full: `assets/img/edito/${e.file}.webp`, alt: e.alt }));
  const ED_LABELS = ['portrait', 'profil', 'profil', 'silhouette', 'trois-quarts', 'gros plan'];
  function editorial() {
    const box = $('.edito');
    if (!box || !ED.length) return;
    const fig = (e, i) => `
      <figure class="ed ed--${i + 1}">
        <button type="button" class="ed__frame" data-edito="${i}" data-cursor="voir" aria-label="Agrandir la photo ${i + 1} sur ${ED.length}">
          <span class="ed__in"><img src="assets/img/edito/${e.file}${i === 0 ? '' : '-sm'}.webp" alt="${esc(e.alt)}" loading="lazy" decoding="async"></span>
        </button>
        <figcaption class="mono"><span>${pad(i + 1)} / ${pad(ED.length)}</span><span>${ED_LABELS[i] || ''}</span></figcaption>
      </figure>`;
    box.innerHTML = ED.slice(0, 2).map(fig).join('') +
      `<div class="ed-quote"><span class="mono">séance · 23 mai 2026</span><p>La posture, le regard, le style.</p><span class="mono">noir &amp; blanc · 6 photos</span></div>` +
      ED.slice(2).map((e, k) => fig(e, k + 2)).join('');
    photoReveal($$('.ed', box), '.ed__frame', '.ed__in');
  }

  // photo qui se dévoile de bas en haut, image en léger parallaxe dans son cadre
  function photoReveal(items, frameSel, innerSel) {
    if (!ANIM) return;
    items.forEach(it => {
      const frame = $(frameSel, it), inner = $(innerSel, it);
      gsap.fromTo(frame, { clipPath: 'inset(100% 0% 0% 0% round 14px)' }, { clipPath: 'inset(0% 0% 0% 0% round 14px)', duration: 1.4, ease: 'power4.inOut', scrollTrigger: { trigger: it, start: 'top 88%' } });
      if (!CALM) gsap.fromTo(inner, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: it, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  /* ---------- Engagement : COP1 ---------- */
  const COP1_LIST = $$('.cop__frame img').map(img => ({ full: img.getAttribute('src').replace('-sm.webp', '.webp'), alt: img.alt }));
  function engagement() {
    const items = $$('.cop__it');
    if (!items.length) return;
    photoReveal(items, '.cop__frame', '.cop__in');
    if (!ANIM) return;
    // profondeur : chaque photo défile à sa propre vitesse (grand écran)
    gsap.matchMedia().add('(min-width: 901px)', () => {
      items.forEach((it, k) => {
        const sp = [0, 70, -30, 50, -20][k] || 0;
        if (sp && !CALM) gsap.fromTo(it, { y: sp }, { y: -sp, ease: 'none', scrollTrigger: { trigger: it, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    });
  }

  /* ---------- Vidéos courtes : fabrication des cartes ---------- */
  const playV = v => { const pr = v.play(); if (pr && pr.catch) pr.catch(() => {}); };
  const reelHTML = (v, k) => `
    <figure class="reel reel--${k + 1}">
      <button type="button" class="reel__frame" data-reel data-cursor="lire" aria-label="Lire ou mettre en pause la vidéo : ${esc(v.label.toLowerCase())}">
        <video src="${esc(v.src)}" poster="${esc(v.poster)}" muted loop playsinline preload="none" aria-hidden="true"></video>
        <span class="reel__chip mono"><i></i>${esc(v.tag)}</span>
        <span class="reel__bar"><span></span></span>
      </button>
      <figcaption><span class="mono">${esc(v.step)}</span>${esc(v.label)}</figcaption>
    </figure>`;

  // lecture auto quand la vidéo est visible, pause sinon ; un clic garde la main
  function initReels(scope) {
    const ios = $$('.reel', scope).map(fig => {
      const v = $('video', fig), bar = $('.reel__bar span', fig);
      const sync = () => fig.classList.toggle('is-playing', !v.paused);
      v.addEventListener('play', sync);
      v.addEventListener('pause', sync);
      v.addEventListener('timeupdate', () => { if (v.duration) bar.style.transform = `scaleX(${(v.currentTime / v.duration).toFixed(3)})`; });
      const io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !fig.dataset.paused) playV(v);
        else if (!e.isIntersecting) v.pause();
      }, { threshold: 0.4 });
      io.observe(fig);
      return io;
    });
    return () => ios.forEach(io => io.disconnect());
  }

  // blocs vidéo de la page : chaque conteneur [data-reels] reprend les vidéos d'un projet
  function fabrication() {
    $$('[data-reels]').forEach(box => {
      const p = byId[box.dataset.reels];
      if (!p || !p.videos) return;
      box.innerHTML = p.videos.map(reelHTML).join('');
      initReels(box);
      if (!ANIM) return;
      const reels = $$('.reel', box);
      gsap.from(reels, { yPercent: 14, opacity: 0, duration: 1.4, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: box, start: 'top 85%' } });
      gsap.matchMedia().add('(min-width: 901px)', () => {
        if (!CALM) gsap.fromTo(reels[1], { y: 60 }, { y: -60, ease: 'none', scrollTrigger: { trigger: box, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    });
  }

  /* ---------- Mannequinat : film ---------- */
  function film() {
    const wrap = $('.film'), v = $('.film__video');
    if (!wrap || !v) return;
    const state = $('.film__state'), sound = $('.film__sound'), bar = $('.film__bar span');
    let userPaused = false, inView = false;
    const sync = () => {
      const playing = !v.paused;
      wrap.classList.toggle('is-playing', playing);
      state.textContent = playing ? 'pause' : 'lecture';
    };
    const play = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    v.addEventListener('play', sync); v.addEventListener('pause', sync);
    new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      if (inView && !userPaused) play(); else if (!inView) v.pause();
    }, { threshold: 0.35 }).observe(wrap);
    $('[data-film-toggle]').addEventListener('click', () => {
      if (v.paused) { userPaused = false; play(); } else { userPaused = true; v.pause(); }
    });
    $('[data-film-sound]').addEventListener('click', () => {
      v.muted = !v.muted;
      sound.textContent = v.muted ? 'son coupé' : 'son activé';
      if (!v.muted && v.paused) { userPaused = false; play(); }
    });
    tick(() => { if (inView && v.duration) bar.style.transform = `scaleX(${(v.currentTime / v.duration).toFixed(4)})`; });
    sync();

    if (!ANIM) return;
    const stage = $('.film-stage'), w = $('.mq .wrap');
    gsap.matchMedia().add('(min-width: 901px)', () => {
      // le cadre part de la largeur de la colonne et s'ouvre jusqu'aux bords de l'écran
      const side = () => w.getBoundingClientRect().left + parseFloat(getComputedStyle(w).paddingLeft);
      stage.classList.add('is-bleed');
      const tl = gsap.timeline({ scrollTrigger: { trigger: stage, start: 'top 92%', end: 'top 8%', scrub: 0.6, invalidateOnRefresh: true } });
      tl.fromTo(wrap, { clipPath: () => `inset(7% ${side()}px 7% ${side()}px round 20px)` }, { clipPath: 'inset(0% 0px 0% 0px round 0px)', ease: 'none' }, 0)
        .fromTo(v, { scale: CALM ? 1 : 1.18 }, { scale: 1, ease: 'none' }, 0);
      return () => stage.classList.remove('is-bleed');
    });
  }

  /* ---------- Certification : la feuille du certificat, comme le CV ---------- */
  const CERT_LIST = [{ full: 'assets/img/cert-anfr.webp', alt: 'Certificat d’opérateur des services d’amateur — ANFR (date et lieu de naissance masqués)' }];
  function certSheet() {
    const sheet = $('.cert-doc__sheet');
    if (!sheet || !ANIM) return;
    gsap.fromTo(sheet, { rotationX: 18, y: 90, scale: 0.92, transformPerspective: 1600 }, {
      rotationX: 0, y: 0, scale: 1, ease: 'none',
      scrollTrigger: { trigger: '.cert-doc', start: 'top 98%', end: 'top 40%', scrub: 0.6 }
    });
    if (FINE) {
      const tilt = $('.cert-doc__tilt'), area = $('.cert-doc');
      gsap.set(tilt, { transformPerspective: 1400 });
      const rx = gsap.quickTo(tilt, 'rotationX', { duration: 0.9, ease: 'power3' });
      const ry = gsap.quickTo(tilt, 'rotationY', { duration: 0.9, ease: 'power3' });
      area.addEventListener('mousemove', e => {
        const r = tilt.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 8);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 6);
      });
      area.addEventListener('mouseleave', () => { rx(0); ry(0); });
    }
  }

  /* ---------- CV : feuille A4 en aperçu ---------- */
  function cvSheet() {
    const sheet = $('.sheet');
    if (!sheet) return;
    const fit = () => sheet.style.setProperty('--s', (sheet.clientWidth / 794).toFixed(4));
    new ResizeObserver(fit).observe(sheet);
    fit();
    if (!ANIM) return;
    gsap.fromTo(sheet, { rotationX: 34, y: 140, scale: 0.86, transformPerspective: 1800 }, {
      rotationX: 0, y: 0, scale: 1, ease: 'none',
      scrollTrigger: { trigger: '.cvsec__sheet', start: 'top 98%', end: 'top 30%', scrub: 0.6 }
    });
    if (FINE) {
      const tilt = $('.sheet-tilt'), area = $('.cvsec__sheet');
      gsap.set(tilt, { transformPerspective: 1400 });
      const rx = gsap.quickTo(tilt, 'rotationX', { duration: 0.9, ease: 'power3' });
      const ry = gsap.quickTo(tilt, 'rotationY', { duration: 0.9, ease: 'power3' });
      area.addEventListener('mousemove', e => {
        const r = tilt.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 10);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 8);
      });
      area.addEventListener('mouseleave', () => { rx(0); ry(0); });
    }
  }

  /* ---------- Contact ---------- */
  function proximity() {
    const big = $('.contact__big');
    const chars = $$('.contact__line', big).flatMap(splitChars);
    if (!FINE) return;
    let mx = -9999, my = -9999, visible = false;
    const cur = chars.map(() => 450);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(big);
    addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
    tick(() => {
      if (!visible) return;
      const rects = chars.map(c => c.getBoundingClientRect());
      chars.forEach((c, i) => {
        const r = rects[i];
        const d = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2));
        const target = 300 + 600 * Math.max(0, 1 - d / 340);
        const next = cur[i] + (target - cur[i]) * 0.14;
        if (Math.abs(next - cur[i]) > 0.4 || !c.style.getPropertyValue('--w')) {
          cur[i] = next;
          c.style.setProperty('--w', next.toFixed(0));
        }
      });
    });
  }

  function clock() {
    const el = $('.clock');
    const f = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const set = () => { el.textContent = f.format(new Date()); };
    set();
    setInterval(set, 1000);
  }

  function copy() {
    $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
      const hint = $('.copy__hint', b);
      try { await navigator.clipboard.writeText(b.dataset.copy); }
      catch (err) { location.href = 'mailto:' + b.dataset.copy; return; }
      hint.textContent = 'copié ✓';
      b.classList.add('is-done');
      setTimeout(() => { hint.textContent = 'copier'; b.classList.remove('is-done'); }, 1800);
    }));
  }

  /* ---------- Clics & clavier ---------- */
  function trapFocus(e, container) {
    const f = $$('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])', container).filter(x => x.getClientRects().length);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  const pointFrom = (e, el) => {
    if (e.detail === 0 || (!e.clientX && !e.clientY)) {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
    return { x: e.clientX, y: e.clientY };
  };

  document.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-case-close]')) return closeCase();
    if (t.closest('[data-case-prev]')) return stepCase(-1);
    if (t.closest('[data-case-next]')) return stepCase(1);
    if (t.closest('[data-lb-close]')) return closeLB();
    if (t.closest('[data-lb-prev]')) return stepLB(-1);
    if (t.closest('[data-lb-next]')) return stepLB(1);
    if (t === lb) return closeLB();

    if (t.closest('[data-cert-open]')) return openLB(CERT_LIST, 0, $('.cert-doc__sheet'));
    const edo = t.closest('[data-edito]');
    if (edo) return openLB(EDITO_LIST, +edo.dataset.edito, edo);
    const cop = t.closest('[data-cop]');
    if (cop) return openLB(COP1_LIST, +cop.dataset.cop, cop);

    const reel = t.closest('[data-reel]');
    if (reel) {
      const fig = reel.closest('.reel'), v = $('video', fig);
      if (v.paused) { delete fig.dataset.paused; playV(v); } else { fig.dataset.paused = '1'; v.pause(); }
      return;
    }

    const nx = t.closest('[data-next]');
    if (nx) { e.preventDefault(); return openCase(nx.dataset.next); }

    const lbT = t.closest('[data-lb]');
    if (lbT && caseOpen) {
      const p = P[caseIdx];
      return openLB(p.images.map(im => ({ full: src(im), alt: p.title })), +lbT.dataset.lb, lbT);
    }

    const opener = t.closest('[data-open]');
    if (opener) { e.preventDefault(); return openCase(opener.dataset.open, pointFrom(e, opener)); }

    const a = t.closest('a[href^="#"]');
    if (a) {
      const h = a.getAttribute('href');
      const target = h.length > 1 && document.getElementById(h.slice(1));
      if (target) { e.preventDefault(); closeMenu(); goTo(h === '#top' ? 0 : target); }
    }
  });

  document.addEventListener('keydown', e => {
    if (!lb.hidden) {
      if (e.key === 'Escape') closeLB();
      else if (e.key === 'ArrowRight') stepLB(1);
      else if (e.key === 'ArrowLeft') stepLB(-1);
      else if (e.key === 'Tab') trapFocus(e, lb);
      return;
    }
    if (caseOpen) {
      if (e.key === 'Escape') closeCase();
      else if (e.key === 'ArrowRight') stepCase(1);
      else if (e.key === 'ArrowLeft') stepCase(-1);
      else if (e.key === 'Tab') trapFocus(e, caseEl);
      return;
    }
    if (menuOpen && e.key === 'Escape') closeMenu();
  });

  /* ---------- Démarrage ---------- */
  renderProjects();
  $$('[data-split]').forEach(splitWords);
  rollify();
  nav();
  themeSwitch();
  cursor();
  magnetic();
  spots();
  copy();
  clock();
  scope();
  proximity();
  indexList();
  univers();
  waterfall();
  mountTerminal($('[data-term]'));
  reveals();
  // les sections épinglées sont créées dans l'ordre de la page
  circuit();
  if (ANIM) hscroll();
  certSheet();
  fabrication();
  engagement();
  editorial();
  film();
  cvSheet();
  if (ANIM) {
    scrollAnims();
    marquees();
    ScrollTrigger.sort();
  }

  intro().then(() => {
    const m = /^#projet-([\w-]+)$/.exec(initialHash);
    if (m && byId[m[1]]) openCase(m[1]);
    else if (initialHash.length > 1) {
      const t = document.getElementById(initialHash.slice(1));
      if (t) lenis ? lenis.scrollTo(t, { immediate: true }) : t.scrollIntoView();
    }
  });
  addEventListener('load', () => { if (HAS_GSAP) ScrollTrigger.refresh(); });
})();
