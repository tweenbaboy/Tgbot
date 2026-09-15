
'use strict';
/* ============================================================
   effects-fog.js — сборка v2.3-single (модуль 4/6).
   Переходы: запотевшее стекло (fog), конверт (envelope),
   печатная машинка (typewriter).
   Контракт эффекта: mount(), reset(), revealNow(), destroy();
   колбэки через ctx: onProgress(r), onComplete(), onFirstTouch().
   ============================================================ */

/* ---- 1. fog wipe ---- */
class FogEffect {
  constructor(ctx, opts) {
    this.ctx = ctx;
    this.threshold = clamp(opts.threshold || 0.42, 0.05, 0.95);
    this.brushRatio = clamp(opts.brushRatio || 0.11, 0.03, 0.3);
    this.seed = 20260915;
    this.progress = 0;
    this.completed = false;
    this.destroyed = false;
    this._pointers = new Map();
    this._queue = [];
    this._frame = 0;
    this._lastSample = 0;
    this._resizeTimer = 0;
    this._dpr = 1;
    this._down = this._down.bind(this);
    this._move = this._move.bind(this);
    this._up = this._up.bind(this);
    this._resizeNow = () => {
      clearTimeout(this._resizeTimer);
      this._resizeTimer = setTimeout(() => this._resize(), 150);
    };
    this._flush = this._flush.bind(this);
  }
  mount() {
    const scene = this.ctx.scene;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'fog';
    this.canvas.setAttribute('aria-hidden', 'true');
    scene.appendChild(this.canvas);
    this.main = this.canvas.getContext('2d');
    this.fogLayer = document.createElement('canvas');
    this.fogCtx = this.fogLayer.getContext('2d');
    this.mask = document.createElement('canvas');
    this.maskCtx = this.mask.getContext('2d');
    this.sampler = document.createElement('canvas');
    this.samplerCtx = this.sampler.getContext('2d', { willReadFrequently: true });
    if (!this.main || !this.fogCtx || !this.maskCtx || !this.samplerCtx) {
      throw new Error('Canvas 2D недоступен');
    }
    this._makeGhost();
    this._resize();
    this.ctx.title.classList.add('fx-hidden');
    this.canvas.addEventListener('pointerdown', this._down);
    this.canvas.addEventListener('pointermove', this._move);
    this.canvas.addEventListener('pointerup', this._up);
    this.canvas.addEventListener('pointercancel', this._up);
    window.addEventListener('resize', this._resizeNow);
    if (typeof ResizeObserver === 'function') {
      this._ro = new ResizeObserver(() => this._syncGhost());
      this._ro.observe(this.ctx.title);
    }
    return this;
  }
  _makeGhost() {
    this.ghost = document.createElement('div');
    this.ghost.className = 'title-ghost';
    this.ghost.setAttribute('aria-hidden', 'true');
    this.ghost.innerHTML = '<span class="title-ghost__scrim"></span>' +
      '<span class="title-ghost__text card__title"></span>';
    this.ghost.querySelector('.title-ghost__text').textContent = this.ctx.title.textContent;
    this.ctx.scene.appendChild(this.ghost);
    this._syncGhost();
  }
  _syncGhost() {
    if (!this.ghost) return;
    const r = this.ctx.title.getBoundingClientRect();
    if (r.width < 1) { this.ghost.removeAttribute('data-synced'); return; }
    this.ghost.style.left = Math.round(r.left) + 'px';
    this.ghost.style.top = Math.round(r.top) + 'px';
    this.ghost.style.width = Math.round(r.width) + 'px';
    if (!this.completed) this.ghost.setAttribute('data-synced', 'true');
  }
  _brushRadius() {
    return Math.max(14, Math.min(this._w, this._h) * this.brushRatio);
  }
  _makeBrush() {
    const r = Math.ceil(this._brushRadius());
    const size = r * 2;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const bctx = c.getContext('2d');
    const g = bctx.createRadialGradient(r, r, r * 0.04, r, r, r);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(0.55, 'rgba(0,0,0,.9)');
    g.addColorStop(0.86, 'rgba(0,0,0,.35)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    bctx.fillStyle = g;
    bctx.fillRect(0, 0, size, size);
    const rnd = mulberry32(7);
    bctx.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 7; i += 1) {
      const a = rnd() * Math.PI * 2;
      const d = r * (0.62 + rnd() * 0.34);
      const br = r * (0.1 + rnd() * 0.16);
      const x = r + Math.cos(a) * d, y = r + Math.sin(a) * d;
      const bg = bctx.createRadialGradient(x, y, 0, x, y, br);
      bg.addColorStop(0, 'rgba(0,0,0,' + (0.25 + rnd() * 0.3) + ')');
      bg.addColorStop(1, 'rgba(0,0,0,0)');
      bctx.fillStyle = bg;
      bctx.beginPath(); bctx.arc(x, y, br, 0, Math.PI * 2); bctx.fill();
    }
    this.brush = { canvas: c, radius: r };
  }
  _paint() {
    const c = this.fogCtx, w = this._w, h = this._h;
    const rnd = mulberry32(this.seed);
    c.clearRect(0, 0, w, h);
    const base = c.createLinearGradient(w, 0, 0, h);
    base.addColorStop(0, '#CE9657');
    base.addColorStop(0.42, '#A9682F');
    base.addColorStop(1, '#6E431F');
    c.fillStyle = base; c.fillRect(0, 0, w, h);
    const bloom = c.createRadialGradient(w * 0.78, h * 0.1, 0, w * 0.78, h * 0.1, Math.hypot(w, h) * 0.8);
    bloom.addColorStop(0, 'rgba(255,222,175,.38)');
    bloom.addColorStop(0.4, 'rgba(232,178,112,.12)');
    bloom.addColorStop(1, 'rgba(232,178,112,0)');
    c.fillStyle = bloom; c.fillRect(0, 0, w, h);
    const sh = c.createRadialGradient(w * 0.12, h * 0.92, 0, w * 0.12, h * 0.92, Math.hypot(w, h) * 0.7);
    sh.addColorStop(0, 'rgba(66,36,12,.34)');
    sh.addColorStop(1, 'rgba(66,36,12,0)');
    c.fillStyle = sh; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 14; i += 1) {
      const x = rnd() * w, y = rnd() * h, rr = Math.hypot(w, h) * (0.06 + rnd() * 0.16);
      const warm = rnd() > 0.45, al = 0.03 + rnd() * 0.07;
      const bl = c.createRadialGradient(x, y, 0, x, y, rr);
      bl.addColorStop(0, warm ? 'rgba(255,226,184,' + al + ')' : 'rgba(74,42,16,' + al + ')');
      bl.addColorStop(1, warm ? 'rgba(255,226,184,0)' : 'rgba(74,42,16,0)');
      c.fillStyle = bl; c.beginPath(); c.arc(x, y, rr, 0, Math.PI * 2); c.fill();
    }
    for (let i = 0; i < 70; i += 1) {
      const x = rnd() * w, y = rnd() * h, dr = 1 + Math.pow(rnd(), 2.4) * Math.min(w, h) * 0.022;
      const dg = c.createRadialGradient(x - dr * 0.32, y - dr * 0.36, dr * 0.08, x, y, dr);
      dg.addColorStop(0, 'rgba(255,241,216,.5)');
      dg.addColorStop(0.5, 'rgba(255,224,182,.12)');
      dg.addColorStop(0.85, 'rgba(84,48,18,.2)');
      dg.addColorStop(1, 'rgba(84,48,18,0)');
      c.fillStyle = dg; c.beginPath(); c.arc(x, y, dr, 0, Math.PI * 2); c.fill();
    }
    const vg = c.createRadialGradient(w / 2, h * 0.45, Math.min(w, h) * 0.28, w / 2, h * 0.5, Math.hypot(w, h) * 0.72);
    vg.addColorStop(0, 'rgba(42,23,8,0)');
    vg.addColorStop(1, 'rgba(42,23,8,.42)');
    c.fillStyle = vg; c.fillRect(0, 0, w, h);
  }
  _resize() {
    if (this.destroyed) return;
    const r = this.ctx.scene.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width));
    const h = Math.max(1, Math.round(r.height));
    const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
    const snap = this.mask && this.mask.width > 0 ? (() => {
      const s = document.createElement('canvas');
      s.width = this.mask.width; s.height = this.mask.height;
      s.getContext('2d').drawImage(this.mask, 0, 0);
      return s;
    })() : null;
    this._w = w; this._h = h; this._dpr = dpr;
    for (const s of [this.canvas, this.fogLayer, this.mask]) {
      s.width = Math.round(w * dpr); s.height = Math.round(h * dpr);
    }
    this.main.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.fogCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.maskCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const sh = Math.max(1, Math.round(56 * h / w));
    this.sampler.width = 56; this.sampler.height = sh;
    this._makeBrush();
    this._paint();
    if (snap) this.maskCtx.drawImage(snap, 0, 0, w, h);
    this._composite();
    this._syncGhost();
  }
  _composite() {
    this.main.save();
    this.main.setTransform(1, 0, 0, 1, 0, 0);
    this.main.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.main.drawImage(this.fogLayer, 0, 0);
    this.main.globalCompositeOperation = 'destination-out';
    this.main.drawImage(this.mask, 0, 0);
    this.main.restore();
  }
  _local(e) {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  _down(e) {
    if (this.completed || this.destroyed) return;
    e.preventDefault();
    try { this.canvas.setPointerCapture(e.pointerId); } catch { /* noop */ }
    const p = this._local(e);
    this._pointers.set(e.pointerId, p);
    this._queue.push(p);
    if (this.ctx.onFirstTouch) this.ctx.onFirstTouch();
    this._schedule();
  }
  _move(e) {
    if (this.completed || this.destroyed) return;
    const prev = this._pointers.get(e.pointerId);
    if (!prev) return;
    e.preventDefault();
    const p = this._local(e);
    this._queue.push(...buildStrokePoints(prev, p, this._brushRadius() * 0.28));
    this._pointers.set(e.pointerId, p);
    this._schedule();
  }
  _up(e) { this._pointers.delete(e.pointerId); }
  _schedule() {
    if (this._frame || this.destroyed) return;
    this._frame = requestAnimationFrame(this._flush);
  }
  _flush() {
    this._frame = 0;
    if (this.destroyed || this.completed) return;
    if (this._queue.length) {
      const stamp = this.brush.canvas;
      const radius = this.brush.radius;
      this.maskCtx.globalCompositeOperation = 'destination-out';
      this.main.globalCompositeOperation = 'destination-out';
      for (const p of this._queue) {
        this.maskCtx.drawImage(stamp, p.x - radius, p.y - radius);
        this.main.drawImage(stamp, p.x - radius, p.y - radius);
      }
      this.maskCtx.globalCompositeOperation = 'source-over';
      this.main.globalCompositeOperation = 'source-over';
      this._queue.length = 0;
    }
    const now = performance.now();
    if (now - this._lastSample >= 160) {
      this._lastSample = now;
      this._sample();
    } else {
      this._schedule();
    }
  }
  _sample() {
    try {
      this.samplerCtx.clearRect(0, 0, this.sampler.width, this.sampler.height);
      this.samplerCtx.drawImage(this.canvas, 0, 0, this.sampler.width, this.sampler.height);
      const img = this.samplerCtx.getImageData(0, 0, this.sampler.width, this.sampler.height);
      this.progress = computeClearedRatio(img.data);
      if (this.ctx.onProgress) this.ctx.onProgress(clamp(this.progress / this.threshold, 0, 1));
      if (this.progress >= this.threshold) this._complete();
    } catch (e) { this.ctx.logger.warn('fog sampling failed', e); }
  }
  _complete() {
    if (this.completed) return;
    this.completed = true;
    this.canvas.dataset.gone = 'true';
    this.ghost.classList.add('is-gone');
    this.ctx.title.classList.remove('fx-hidden');
    this.ctx.logger.info('fog cleared');
    if (this.ctx.onComplete) this.ctx.onComplete({});
  }
  revealNow() {
    if (this.completed) return;
    this.maskCtx.save();
    this.maskCtx.setTransform(1, 0, 0, 1, 0, 0);
    this.maskCtx.fillStyle = 'rgba(0,0,0,1)');
    this.maskCtx.fillRect(0, 0, this.mask.width, this.mask.height);
    this.maskCtx.restore();
    this._composite();
    this._complete();
  }
  reset() {
    this.completed = false;
    this.progress = 0;
    this._pointers.clear();
    this._queue.length = 0;
    this.maskCtx.save();
    this.maskCtx.setTransform(1, 0, 0, 1, 0, 0);
    this.maskCtx.clearRect(0, 0, this.mask.width, this.mask.height);
    this.maskCtx.restore();
    this._composite();
    this.canvas.dataset.gone = 'false';
    this.ghost.classList.remove('is-gone');
    this.ghost.setAttribute('data-synced', 'true');
    this.ctx.title.classList.add('fx-hidden');
    if (this.ctx.onProgress) this.ctx.onProgress(0);
  }
  destroy() {
    this.destroyed = true;
    if (this._frame) cancelAnimationFrame(this._frame);
    clearTimeout(this._resizeTimer);
    if (this._ro) this._ro.disconnect();
    window.removeEventListener('resize', this._resizeNow);
    this.canvas.removeEventListener('pointerdown', this._down);
    this.canvas.removeEventListener('pointermove', this._move);
    this.canvas.removeEventListener('pointerup', this._up);
    this.canvas.removeEventListener('pointercancel', this._up);
    this.canvas.remove();
    this.ghost.remove();
  }
}

/* ---- 2. envelope ---- */
class EnvelopeEffect {
  constructor(ctx) { this.ctx = ctx; this.opened = false; this._timers = []; }
  mount() {
    this.opened = false;
    const { title, paragraphs, catSlot } = this.ctx;
    this._hidden = [title, ...paragraphs];
    if (catSlot) this._hidden.push(catSlot);
    this._hidden.forEach((el) => el.classList.add('fx-hidden'));
    this.root = document.createElement('div');
    this.root.className = 'fx-envelope';
    this.root.innerHTML =
      '<button class="envelope" type="button" aria-label="Открыть конверт">' +
      '<span class="envelope__back"></span>' +
      '<span class="envelope__letter"></span>' +
      '<span class="envelope__flap"></span>' +
      '<span class="envelope__seal" aria-hidden="true">♥</span>' +
      '</button>';
    this.btn = this.root.querySelector('.envelope');
    this.btn.addEventListener('click', () => this._open());
    this.ctx.stage.appendChild(this.root);
    return this;
  }
  _open() {
    if (this.opened) return;
    this.opened = true;
    if (this.ctx.onFirstTouch) this.ctx.onFirstTouch();
    this.ctx.host.impact('medium');
    const d = this.ctx.reducedMotion ? 0 : 1;
    this.btn.classList.add('is-open');
    this._timers.push(setTimeout(() => {
      this.btn.classList.add('is-gone');
      this._hidden.forEach((el, i) => {
        el.style.transitionDelay = (i * 120 * d) + 'ms';
        el.classList.remove('fx-hidden');
      });
      if (this.ctx.onProgress) this.ctx.onProgress(1);
      this._timers.push(setTimeout(() => {
        if (this.ctx.onComplete) this.ctx.onComplete({});
      }, (650 + this._hidden.length * 120) * d));
    }, 420 * d));
  }
  revealNow() { this._open(); }
  reset() {
    this._timers.forEach(clearTimeout);
    this._timers = [];
    this.destroy();
    this.mount();
  }
  destroy() {
    this._timers.forEach(clearTimeout);
    this._timers = [];
    if (this.root) this.root.remove();
  }
}

/* ---- 3. typewriter ---- */
class TypewriterEffect {
  constructor(ctx) {
    this.ctx = ctx;
    this._timer = 0;
    this._skipLine = false;
    this.destroyed = false;
    this._tap = this._tap.bind(this);
  }
  mount() {
    this.texts = this.ctx.paragraphs.map((p) => p.textContent);
    this.total = this.texts.reduce((s, t) => s + t.length, 0);
    this.typedTotal = 0;
    this.line = 0;
    this.pos = 0;
    this.wait = 0;
    this.done = false;
    this.ctx.paragraphs.forEach((p) => { p.textContent = ''; });
    this.caret = document.createElement('span');
    this.caret.className = 'caret';
    this.caret.setAttribute('aria-hidden', 'true');
    this.ctx.paragraphs[0].appendChild(this.caret);
    this.ctx.card.addEventListener('pointerdown', this._tap);
    this._timer = setInterval(() => this._tick(), 24);
    return this;
  }
  _tap() { this._skipLine = true; }
  _tick() {
    if (this.destroyed || this.done) return;
    if (this.wait > 0) { this.wait -= 1; return; }
    const text = this.texts[this.line];
    const p = this.ctx.paragraphs[this.line];
    if (this._skipLine) {
      this._skipLine = false;
      this.typedTotal += text.length - this.pos;
      this.pos = text.length;
    } else if (this.pos < text.length) {
      this.pos += 1;
      this.typedTotal += 1;
      const ch = text[this.pos - 1];
      if ('.!?…'.includes(ch)) this.wait = 7;
    }
    p.textContent = text.slice(0, this.pos);
    p.appendChild(this.caret);
    if (this.ctx.onProgress) this.ctx.onProgress(clamp(this.typedTotal / this.total, 0, 1));
    if (this.pos >= text.length) {
      this.line += 1;
      this.pos = 0;
      this.wait = 10;
      if (this.line >= this.texts.length) this._finish();
      else this.ctx.paragraphs[this.line].appendChild(this.caret);
    }
  }
  _finish() {
    if (this.done) return;
    this.done = true;
    clearInterval(this._timer);
    this.caret.remove();
    this.ctx.paragraphs.forEach((p, i) => { p.textContent = this.texts[i]; });
    if (this.ctx.onProgress) this.ctx.onProgress(1);
    if (this.ctx.onComplete) this.ctx.onComplete({});
  }
  revealNow() { this._finish(); }
  reset() {
    clearInterval(this._timer);
    this.destroy();
    this.mount();
  }
  destroy() {
    this.destroyed = true;
    clearInterval(this._timer);
    this.ctx.card.removeEventListener('pointerdown', this._tap);
    if (this.caret) this.caret.remove();
  }
}
