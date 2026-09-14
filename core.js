'use strict';
/* ============================================================
   core.js — сборка v2.3-single (модуль 3/6).
   Тексты карточек, служебные функции, диагностика, хост-мост
   (Telegram-guarded), процедурный звук мурчания, котик.
   ============================================================ */
const BUILD = 'v2.3-single';

/* ---------------- deck content ---------------- */
const DECK = {
  id: 'apology-deck',
  cards: [
    {
      id: 'card-01', eyebrow: '01 · начало', title: 'Я хочу сказать тебе кое-что', cat: 'right',
      reveal: { type: 'fog', threshold: 0.42, brushRatio: 0.11, hint: 'Потри экран пальцем — как запотевшее стекло' },
      paragraphs: [
        'Я не всегда умею правильно говорить о своих чувствах.',
        'Поэтому решил сказать это так.',
        'Без оправданий.',
        'Без «но».',
        'Просто от себя.'
      ]
    },
    {
      id: 'card-02', eyebrow: '02 · прости', title: 'Прости меня', cat: 'left',
      reveal: { type: 'envelope', hint: 'Нажми на конверт' },
      paragraphs: [
        'Прости меня за всё, чем я когда-либо делал тебе больно.',
        'За слова, которые мог сказать не так.',
        'За поступки, которые могли тебя задеть.',
        'За моменты, когда я был недостаточно внимательным к тебе.',
        'Даже если я не всегда понимал это сразу.'
      ]
    },
    {
      id: 'card-03', eyebrow: '03 · честно', title: 'Я не идеальный', cat: 'right',
      reveal: { type: 'typewriter', hint: 'Печатается само — нажми, чтобы ускорить' },
      paragraphs: [
        'Я знаю, что у меня есть недостатки.',
        'Иногда я ошибаюсь.',
        'Иногда не замечаю очевидного.',
        'Иногда понимаю что-то слишком поздно.',
        'Но ни одна моя ошибка не означает, что ты для меня не важна.'
      ]
    },
    {
      id: 'card-04', eyebrow: '04 · ты', title: 'Ты мне дорога', cat: 'left',
      reveal: { type: 'polaroid', hint: 'Нажимай, чтобы проявить следующее' },
      paragraphs: [
        'Мне важно то, что между нами.',
        'Важно твоё настроение.',
        'Твои чувства.',
        'Твои переживания.',
        'Твоя улыбка.',
        'И мне больно осознавать, что иногда причиной твоих переживаний становился именно я.'
      ]
    },
    {
      id: 'card-05', eyebrow: '05 · дальше', title: 'Я хочу быть лучше', cat: 'right',
      reveal: { type: 'steps', hint: 'Нажимай, чтобы подняться выше' },
      paragraphs: [
        'Я не хочу просто говорить тебе «я изменюсь».',
        'Я хочу постепенно показывать это поступками.',
        'Учиться лучше тебя слышать.',
        'Быть внимательнее.',
        'Беречь то, что у нас есть.'
      ]
    },
    {
      id: 'card-06', eyebrow: '06 · спасибо', title: 'Спасибо тебе', cat: 'left',
      reveal: { type: 'scroll', hint: 'Потяни вниз, чтобы развернуть письмо' },
      paragraphs: [
        'Спасибо тебе за всё хорошее, что ты принесла в мою жизнь.',
        'За моменты, которые я храню в памяти.',
        'За твою заботу.',
        'За твоё терпение.',
        'За то, что ты была рядом.',
        'Я ценю это намного больше, чем иногда умею показать.'
      ]
    },
    {
      id: 'card-07', eyebrow: '07 · главное', title: 'Просто знай',
      reveal: { type: 'cat', petsNeeded: 6, hint: 'Погладь кота — он передаст главное' },
      paragraphs: [
        'Я не хочу терять тебя.',
        'Не хочу, чтобы мои ошибки перечёркивали всё хорошее между нами.',
        'Я безумно люблю тебя 🥺❤️',
        'И если иногда я забываю показать это правильно — это не значит, что я чувствую это меньше.',
        'Прости меня ❤️'
      ]
    },
    {
      id: 'card-08', eyebrow: '08 · навсегда', title: 'Ты мой компас по жизни', cat: 'right',
      reveal: { type: 'compass', hint: 'Нажми на компас — стрелка найдёт тебя' },
      paragraphs: [
        'Куда бы меня ни занесло — стрелка всегда указывает на тебя.',
        'Прости меня ❤️'
      ]
    }
  ]
};

/* ---------------- utils ---------------- */
const clamp = (v, min, max) => (Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : min);
const distance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
function mulberry32(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function buildStrokePoints(from, to, step) {
  if (!to || !Number.isFinite(to.x) || !Number.isFinite(to.y)) return [];
  if (!from) return [{ x: to.x, y: to.y }];
  const gap = distance(from, to);
  if (gap === 0) return [{ x: to.x, y: to.y }];
  const safe = step > 0 ? step : gap;
  const n = Math.max(1, Math.ceil(gap / safe));
  const pts = [];
  for (let i = 1; i <= n; i += 1) {
    const t = i / n;
    pts.push({ x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t });
  }
  return pts;
}
function computeClearedRatio(rgba, alphaThreshold = 128) {
  let total = 0, cleared = 0;
  for (let i = 3; i < rgba.length; i += 4) {
    total += 1;
    if (rgba[i] < alphaThreshold) cleared += 1;
  }
  return total === 0 ? 0 : cleared / total;
}
const createLogger = (prefix) => ({
  debug: (...a) => { if (location.search.includes('debug')) console.log(prefix, ...a); },
  info: (...a) => console.info(prefix, ...a),
  warn: (...a) => console.warn(prefix, ...a),
  error: (...a) => console.error(prefix, ...a)
});

/* ---------------- diagnostics ---------------- */
function showFatal(msg) {
  try {
    const panel = document.getElementById('state-error');
    const text = document.getElementById('state-error-text');
    if (panel && text) { text.textContent = msg; panel.hidden = false; }
    const sc = document.getElementById('scene');
    if (sc) sc.dataset.state = 'error';
  } catch (e) { /* noop */ }
}
window.addEventListener('error', function (e) {
  showFatal('Ошибка скрипта: ' + (e && e.message ? e.message : 'неизвестно') +
    '. Один из файлов вставлен не полностью.');
});
window.addEventListener('unhandledrejection', function (e) {
  showFatal('Сбой запуска: ' + (e && e.reason ? e.reason : 'неизвестно'));
});

/* ---------------- host bridge (Telegram-guarded) ---------------- */
function createHost(logger) {
  const tg = (() => { try { return window.Telegram && window.Telegram.WebApp; } catch { return null; } })();
  const vibrate = (ms) => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch { /* noop */ } };
  return {
    platform: tg ? (tg.platform || 'telegram') : 'browser',
    ready() {
      try {
        if (!tg) return;
        tg.ready && tg.ready();
        tg.expand && tg.expand();
        tg.setHeaderColor && tg.setHeaderColor('#A9682F');
        tg.setBackgroundColor && tg.setBackgroundColor('#6E431F');
        tg.disableVerticalSwipes && tg.disableVerticalSwipes();
        const apply = () => {
          const h = tg.viewportStableHeight || tg.viewportHeight;
          if (h > 0) document.getElementById('scene').style.minHeight = Math.round(h) + 'px';
        };
        apply();
        tg.onEvent && tg.onEvent('viewportChanged', apply);
      } catch (e) { logger.warn('host.ready failed', e); }
    },
    impact(style = 'light') {
      try {
        if (tg && tg.HapticFeedback && tg.HapticFeedback.impactOccurred) {
          tg.HapticFeedback.impactOccurred(style);
          return;
        }
      } catch (e) { logger.warn('haptics failed', e); }
      vibrate(style === 'light' ? 8 : style === 'medium' ? 16 : 25);
    },
    notify(style = 'success') {
      try {
        if (tg && tg.HapticFeedback && tg.HapticFeedback.notificationOccurred) {
          tg.HapticFeedback.notificationOccurred(style);
          return;
        }
      } catch (e) { logger.warn('haptics failed', e); }
      vibrate(style === 'success' ? [12, 40, 12] : 10);
    }
  };
}

/* ---------------- purr audio (procedural, no assets) ---------------- */
function createPurrAudio(logger) {
  const volume = 0.12;
  let ctx = null, gain = null, failed = false, muted = false, sustained = false;
  function graph() {
    if (failed) return null;
    try {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) { failed = true; return null; }
        ctx = new AC();
        const len = Math.floor(ctx.sampleRate * 2);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        let last = 0;
        for (let i = 0; i < len; i += 1) {
          const w = Math.random() * 2 - 1;
          last = (last + 0.02 * w) / 1.02;
          d[i] = last * 3.5;
        }
        const src = ctx.createBufferSource();
        src.buffer = buf; src.loop = true;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 170; lp.Q.value = 0.9;
        const lfo = ctx.createOscillator();
        lfo.type = 'sine'; lfo.frequency.value = 24;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = volume * 0.85;
        gain = ctx.createGain();
        gain.gain.value = 0.0001;
        src.connect(lp); lp.connect(gain);
        lfo.connect(lfoGain); lfoGain.connect(gain.gain);
        gain.connect(ctx.destination);
        src.start(); lfo.start();
      }
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      return gain;
    } catch (e) { failed = true; logger.warn('purr audio failed', e); return null; }
  }
  function ramp(target, sec) {
    if (!ctx || !gain) return;
    const t = ctx.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), t);
    gain.gain.linearRampToValueAtTime(Math.max(target, 0.0001), t + sec);
  }
  return {
    get muted() { return muted; },
    setMuted(v) { muted = Boolean(v); if (muted) { sustained = false; ramp(0, 0.15); } },
    start() { if (muted) return; if (!graph()) return; sustained = true; ramp(volume, 0.3); },
    burst() {
      if (muted) return;
      if (!graph() || !ctx || !gain) return;
      const t = ctx.currentTime;
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), t);
      gain.gain.linearRampToValueAtTime(volume * 0.9, t + 0.06);
      gain.gain.linearRampToValueAtTime(sustained ? volume : 0.0001, t + 0.45);
    },
    stop() { sustained = false; ramp(0, 0.25); }
  };
}

/* ---------------- cat art ---------------- */
function buildCatSvg() {
  return '<svg class="cat" viewBox="0 0 220 220" role="img" aria-label="Котик. Погладьте его пальцем — он замурлычет.">' +
  '<ellipse class="cat__shadow" cx="110" cy="203" rx="72" ry="9"/>' +
  '<path class="cat__tail" d="M158 182 Q198 178 196 142 Q195 122 178 126"/>' +
  '<path class="cat__body" d="M62 198 C50 140 72 104 110 104 C148 104 170 140 158 198 Z"/>' +
  '<ellipse class="cat__chest" cx="110" cy="172" rx="30" ry="26"/>' +
  '<ellipse class="cat__paw" cx="92" cy="196" rx="13" ry="8"/>' +
  '<ellipse class="cat__paw" cx="128" cy="196" rx="13" ry="8"/>' +
  '<g class="cat__head">' +
    '<path class="cat__ear" d="M78 58 L64 20 L104 44 Z"/>' +
    '<path class="cat__ear" d="M142 58 L156 20 L116 44 Z"/>' +
    '<path class="cat__ear-inner" d="M80 53 L72 30 L97 45 Z"/>' +
    '<path class="cat__ear-inner" d="M140 53 L148 30 L123 45 Z"/>' +
    '<circle class="cat__face" cx="110" cy="88" r="44"/>' +
    '<path class="cat__stripe" d="M98 48 q12 -9 24 0"/>' +
    '<path class="cat__stripe" d="M92 57 q8 -6 16 -2"/>' +
    '<path class="cat__stripe" d="M112 55 q8 -4 16 2"/>' +
    '<g class="cat__eyes-open"><circle cx="95" cy="84" r="5.5"/><circle cx="125" cy="84" r="5.5"/>' +
    '<circle class="cat__eye-glint" cx="97" cy="82" r="1.8"/><circle class="cat__eye-glint" cx="127" cy="82" r="1.8"/></g>' +
    '<g class="cat__eyes-closed"><path d="M88 84 q7 9 14 0"/><path d="M118 84 q7 9 14 0"/></g>' +
    '<ellipse class="cat__blush" cx="82" cy="97" rx="8" ry="4.5"/>' +
    '<ellipse class="cat__blush" cx="138" cy="97" rx="8" ry="4.5"/>' +
    '<path class="cat__nose" d="M105 95 L115 95 L110 101 Z"/>' +
    '<path class="cat__mouth" d="M110 101 q-6 7 -12 2"/>' +
    '<path class="cat__mouth" d="M110 101 q6 7 12 2"/>' +
    '<g class="cat__whiskers"><path d="M84 97 L58 93"/><path d="M84 102 L60 106"/>' +
    '<path d="M136 97 L162 93"/><path d="M136 102 L160 106"/></g>' +
  '</g>' +
  '<text class="cat__zzz" x="160" y="58">z</text>' +
  '<text class="cat__zzz cat__zzz--mid" x="174" y="44">z</text>' +
  '<text class="cat__zzz cat__zzz--small" x="186" y="32">z</text>' +
  '<g class="cat__purr-bubble"><rect x="126" y="118" width="80" height="30" rx="15"/>' +
  '<text x="166" y="138">муррр…</text></g>' +
  '</svg>';
}
const HEART_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.6-4.9-10.1-9.3C.1 8.3 2 4.9 5.4 4.9c2.1 0 3.7 1.2 6.6 4.1 2.9-2.9 4.5-4.1 6.6-4.1 3.4 0 5.3 3.4 3.5 6.8C19.6 16.1 12 21 12 21z"/></svg>';

/* ---------------- CatCompanion (shared pettable cat) ---------------- */
class CatCompanion {
  constructor(el, opts = {}) {
    this.el = el;
    this.gated = opts.gated === true;
    this.petsNeeded = clamp(Math.round(opts.petsNeeded || 6), 1, 20);
    this.small = opts.small !== false;
    this.reducedMotion = opts.reducedMotion === true;
    this.host = opts.host;
    this.audio = opts.audio;
    this.onProgress = opts.onProgress || null;
    this.onComplete = opts.onComplete || null;
    this.onFirstTouch = opts.onFirstTouch || null;
    this.pets = 0;
    this.completed = false;
    this.destroyed = false;
    this._pointers = new Map();
    this._acc = new Map();
    this._blissTimer = 0;
    this._purrTimer = 0;
    this._hapticTimer = 0;
    this._hapticCount = 0;
    this._touched = false;
    this._down = this._down.bind(this);
    this._move = this._move.bind(this);
    this._up = this._up.bind(this);
  }
  mount() {
    this.el.innerHTML = '<div class="cat-wrap">' + buildCatSvg() +
      '<div class="hearts" aria-hidden="true"></div></div>';
    this.wrap = this.el.querySelector('.cat-wrap');
    this.hearts = this.el.querySelector('.hearts');
    this.petStroke = clamp(this.wrap.clientWidth * 0.55, 60, 130);
    this.el.addEventListener('pointerdown', this._down);
    this.el.addEventListener('pointermove', this._move);
    this.el.addEventListener('pointerup', this._up);
    this.el.addEventListener('pointercancel', this._up);
    return this;
  }
  _local(e) {
    const r = this.el.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  _down(e) {
    if (this.destroyed || (this.gated && this.completed)) return;
    e.preventDefault();
    try { this.el.setPointerCapture(e.pointerId); } catch { /* noop */ }
    if (!this._touched) {
      this._touched = true;
      this.el.classList.add('is-awake');
      if (this.onFirstTouch) this.onFirstTouch();
    }
    const p = this._local(e);
    this._pointers.set(e.pointerId, p);
    this._acc.set(e.pointerId, 0);
  }
  _move(e) {
    if (this.destroyed || (this.gated && this.completed)) return;
    if (!this._pointers.has(e.pointerId)) return;
    e.preventDefault();
    const prev = this._pointers.get(e.pointerId);
    const p = this._local(e);
    this._pointers.set(e.pointerId, p);
    let acc = (this._acc.get(e.pointerId) || 0) + distance(prev, p);
    while (acc >= this.petStroke && !(this.gated && this.completed)) {
      acc -= this.petStroke;
      this._pet();
    }
    this._acc.set(e.pointerId, acc);
  }
  _up(e) { this._pointers.delete(e.pointerId); this._acc.delete(e.pointerId); }
  _pet() {
    this.pets += 1;
    this.el.classList.add('is-awake', 'is-bliss');
    clearTimeout(this._blissTimer);
    this._blissTimer = setTimeout(() => this.el.classList.remove('is-bliss'), 560);
    if (!this.reducedMotion) this._heart();
    if (this.host) this.host.impact('light');
    if (this.audio) this.audio.burst();
    if (this.gated) {
      const p = clamp(this.pets / this.petsNeeded, 0, 1);
      if (this.onProgress) this.onProgress(p);
      if (this.pets >= this.petsNeeded) this._complete();
    } else if (this.pets % 3 === 0) {
      this._purrBurst();
    }
  }
  _purrBurst() {
    this.el.classList.add('is-purring');
    if (this.audio) this.audio.start();
    clearTimeout(this._purrTimer);
    this._purrTimer = setTimeout(() => {
      this.el.classList.remove('is-purring');
      if (this.audio) this.audio.stop();
    }, 2400);
  }
  _heart() {
    if (!this.hearts) return;
    while (this.hearts.childElementCount >= 12) this.hearts.firstElementChild.remove();
    const h = document.createElement('span');
    h.className = 'heart';
    h.setAttribute('aria-hidden', 'true');
    h.style.setProperty('--dx', Math.round((Math.random() * 2 - 1) * 46) + 'px');
    h.style.left = (30 + Math.random() * 40) + '%';
    h.innerHTML = HEART_SVG;
    h.addEventListener('animationend', () => h.remove(), { once: true });
    this.hearts.appendChild(h);
  }
  _complete() {
    if (this.completed) return;
    this.completed = true;
    clearTimeout(this._blissTimer);
    this.el.classList.remove('is-bliss');
    this.el.classList.add('is-awake', 'is-purring');
    if (this.audio) this.audio.start();
    if (this.host) {
      clearInterval(this._hapticTimer);
      this._hapticCount = 0;
      this._hapticTimer = setInterval(() => {
        this._hapticCount += 1;
        this.host.impact('soft');
        if (this._hapticCount >= 8) clearInterval(this._hapticTimer);
      }, 300);
    }
    for (let i = 0; i < 8; i += 1) setTimeout(() => this._heart(), i * 90);
    if (this.onComplete) this.onComplete({ pets: this.pets });
  }
  revealNow() {
    if (!this.gated || this.completed) return;
    this.pets = this.petsNeeded;
    if (!this._touched) { this._touched = true; this.el.classList.add('is-awake'); }
    this._complete();
  }
  reset() {
    clearTimeout(this._blissTimer);
    clearTimeout(this._purrTimer);
    clearInterval(this._hapticTimer);
    this.pets = 0;
    this.completed = false;
    this._touched = false;
    this.el.classList.remove('is-awake', 'is-bliss', 'is-purring');
    if (this.hearts) this.hearts.replaceChildren();
    if (this.audio) this.audio.stop();
  }
  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    clearTimeout(this._blissTimer);
    clearTimeout(this._purrTimer);
    clearInterval(this._hapticTimer);
    this.el.removeEventListener('pointerdown', this._down);
    this.el.removeEventListener('pointermove', this._move);
    this.el.removeEventListener('pointerup', this._up);
    this.el.removeEventListener('pointercancel', this._up);
    if (this.audio) this.audio.stop();
    this.el.replaceChildren();
  }
}

