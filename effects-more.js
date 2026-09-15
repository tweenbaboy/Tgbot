'use strict';
/* ============================================================
   effects-more.js — сборка v2.3-single (модуль 5/6).
   Переходы: полароиды, ступени, свиток, кот-открытие, компас.
   Здесь же реестр EFFECTS (ссылается на классы из effects-fog.js).
   ============================================================ */

/* ---- 4. polaroids ---- */
class PolaroidEffect {
  constructor(ctx) {
    this.ctx = ctx;
    this.shown = 0;
    this.done = false;
    this._timer = 0;
    this._tap = this._tap.bind(this);
  }
  mount() {
    this.shown = 0;
    this.done = false;
    const glyphs = ['🌤', '', '🫂', '😊'];
    const ps = this.ctx.paragraphs;
    this.polIndexes = [1, 2, 3, 4];
    this.closing = ps[5];
    this.closing.classList.add('fx-hidden');
    this.pols = this.polIndexes.map((idx, i) => {
      const p = ps[idx];
      const pol = document.createElement('div');
      pol.className = 'polaroid';
      p.parentNode.insertBefore(pol, p);
      const photo = document.createElement('div');
      photo.className = 'polaroid__photo';
      photo.setAttribute('aria-hidden', 'true');
      photo.textContent = glyphs[i];
      pol.appendChild(photo);
      pol.appendChild(p);
      return pol;
    });
    this.total = this.pols.length + 1;
    this.ctx.card.addEventListener('pointerdown', this._tap);
    this._timer = setTimeout(() => this._next(), 600);
    return this;
  }
  _tap() { this._next(); }
  _next() {
    if (this.done) return;
    if (this.ctx.onFirstTouch) this.ctx.onFirstTouch();
    if (this.shown < this.pols.length) {
      this.pols[this.shown].classList.add('fx-shown');
      this.shown += 1;
      this.ctx.host.impact('light');
      if (this.ctx.onProgress) this.ctx.onProgress(this.shown / this.total);
    } else {
      this.done = true;
      this.closing.classList.remove('fx-hidden');
      if (this.ctx.onProgress) this.ctx.onProgress(1);
      setTimeout(() => { if (this.ctx.onComplete) this.ctx.onComplete({}); },
        this.ctx.reducedMotion ? 0 : 500);
    }
  }
  revealNow() {
    clearTimeout(this._timer);
    while (!this.done) this._next();
  }
  reset() {
    clearTimeout(this._timer);
    this.ctx.card.removeEventListener('pointerdown', this._tap);
    this.pols.forEach((pol) => {
      const p = pol.querySelector('p');
      pol.parentNode.insertBefore(p, pol);
      pol.remove();
    });
    this.closing.classList.add('fx-hidden');
    this.shown = 0;
    this.done = false;
    this.ctx.card.addEventListener('pointerdown', this._tap);
    this._timer = setTimeout(() => this._next(), 600);
    if (this.ctx.onProgress) this.ctx.onProgress(0);
  }
  destroy() {
    clearTimeout(this._timer);
    this.ctx.card.removeEventListener('pointerdown', this._tap);
  }
}

/* ---- 5. steps ---- */
class StepsEffect {
  constructor(ctx) {
    this.ctx = ctx;
    this.shown = 0;
    this.done = false;
    this._tap = this._tap.bind(this);
  }
  mount() {
    this.shown = 0;
    this.done = false;
    const ps = this.ctx.paragraphs;
    this.steps = [2, 3, 4].map((idx) => {
      const p = ps[idx];
      const step = document.createElement('div');
      step.className = 'step';
      p.parentNode.insertBefore(step, p);
      step.appendChild(p);
      return step;
    });
    this.ctx.card.addEventListener('pointerdown', this._tap);
    return this;
  }
  _tap() {
    if (this.done) return;
    if (this.ctx.onFirstTouch) this.ctx.onFirstTouch();
    if (this.shown < this.steps.length) {
      this.steps[this.shown].classList.add('fx-shown');
      this.shown += 1;
      this.ctx.host.impact('light');
      if (this.ctx.onProgress) this.ctx.onProgress(this.shown / this.steps.length);
      if (this.shown === this.steps.length) {
        this.done = true;
        setTimeout(() => { if (this.ctx.onComplete) this.ctx.onComplete({}); },
          this.ctx.reducedMotion ? 0 : 480);
      }
    }
  }
  revealNow() {
    this.steps.forEach((s) => s.classList.add('fx-shown'));
    this.shown = this.steps.length;
    this.done = true;
    if (this.ctx.onProgress) this.ctx.onProgress(1);
    if (this.ctx.onComplete) this.ctx.onComplete({});
  }
  reset() {
    this.steps.forEach((s) => s.classList.remove('fx-shown'));
    this.shown = 0;
    this.done = false;
    if (this.ctx.onProgress) this.ctx.onProgress(0);
  }
  destroy() {
    this.ctx.card.removeEventListener('pointerdown', this._tap);
    if (this.steps) this.steps.forEach((step) => {
      const p = step.querySelector('p');
      if (p) step.parentNode.insertBefore(p, step);
      step.remove();
    });
  }
}

/* ---- 6. scroll ---- */
class ScrollEffect {
  constructor(ctx) {
    this.ctx = ctx;
    this.progress = 0.1;
    this.done = false;
    this._lastY = null;
    this._moved = 0;
    this._down = this._down.bind(this);
    this._move = this._move.bind(this);
    this._up = this._up.bind(this);
  }
  mount() {
    this.progress = 0.1;
    this.done = false;
    this.body = this.ctx.body;
    this.body.classList.add('fx-scroll');
    this.roll = document.createElement('div');
    this.roll.className = 'fx-scroll-roll';
    this.roll.setAttribute('aria-hidden', 'true');
    this.ctx.card.appendChild(this.roll);
    this.ctx.stage.classList.add('touch-drag');
    this.ctx.stage.addEventListener('pointerdown', this._down);
    this.ctx.stage.addEventListener('pointermove', this._move);
    this.ctx.stage.addEventListener('pointerup', this._up);
    this.ctx.stage.addEventListener('pointercancel', this._up);
    this._apply();
    return this;
  }
  _apply() {
    this.body.style.setProperty('--unroll', (this.progress * 100) + '%');
    const top = this.body.offsetTop + this.body.offsetHeight * this.progress;
    this.roll.style.top = top + 'px';
    if (this.ctx.onProgress) this.ctx.onProgress(clamp((this.progress - 0.1) / 0.9, 0, 1));
  }
  _down(e) {
    if (this.done) return;
    if (this.ctx.onFirstTouch) this.ctx.onFirstTouch();
    this._lastY = e.clientY;
    this._moved = 0;
    try { this.ctx.stage.setPointerCapture(e.pointerId); } catch { /* noop */ }
  }
  _move(e) {
    if (this.done || this._lastY == null) return;
    e.preventDefault();
    const dy = e.clientY - this._lastY;
    this._lastY = e.clientY;
    this._moved += Math.abs(dy);
    const needed = Math.max(120, this.body.offsetHeight * 0.9);
    this.progress = clamp(this.progress + dy / needed, 0.1, 1);
    this._apply();
    if (this.progress >= 0.97) this._finish();
  }
  _up() {
    if (this._moved < 8 && !this.done) {
      this.progress = clamp(this.progress + 0.07, 0.1, 1);
      this._apply();
      if (this.progress >= 0.97) this._finish();
    }
    this._lastY = null;
  }
  _finish() {
    if (this.done) return;
    this.done = true;
    this.progress = 1;
    this.body.classList.add('fx-open');
    this.roll.dataset.done = 'true';
    if (this.ctx.onProgress) this.ctx.onProgress(1);
    if (this.ctx.onComplete) this.ctx.onComplete({});
  }
  revealNow() { this._finish(); this._apply(); }
  reset() {
    this.done = false;
    this.progress = 0.1;
    this.body.classList.remove('fx-open');
    this.roll.dataset.done = 'false';
    this._apply();
  }
  destroy() {
    this.ctx.stage.classList.remove('touch-drag');
    this.ctx.stage.removeEventListener('pointerdown', this._down);
    this.ctx.stage.removeEventListener('pointermove', this._move);
    this.ctx.stage.removeEventListener('pointerup', this._up);
    this.ctx.stage.removeEventListener('pointercancel', this._up);
    this.body.classList.remove('fx-scroll');
    this.body.style.removeProperty('--unroll');
    this.roll.remove();
  }
}

/* ---- 7. cat gate ---- */
class CatEffect {
  constructor(ctx, opts) { this.ctx = ctx; this.opts = opts; }
  mount() {
    const { title, paragraphs } = this.ctx;
    this._hidden = [title, ...paragraphs];
    this._hidden.forEach((el) => el.classList.add('fx-hidden'));
    this.slot = document.createElement('div');
    this.slot.className = 'cat-slot cat-slot--center cat-slot--big';
    title.insertAdjacentElement('afterend', this.slot);
    this.cat = new CatCompanion(this.slot, {
      gated: true,
      small: false,
      petsNeeded: this.opts.petsNeeded || 6,
      reducedMotion: this.ctx.reducedMotion,
      host: this.ctx.host,
      audio: this.ctx.audio,
      onFirstTouch: () => { if (this.ctx.onFirstTouch) this.ctx.onFirstTouch(); },
      onProgress: (r) => { if (this.ctx.onProgress) this.ctx.onProgress(r); },
      onComplete: () => this._reveal()
    }).mount();
    return this;
  }
  _reveal() {
    this._hidden.forEach((el, i) => {
      el.style.transitionDelay = (i * 140) + 'ms';
      el.classList.remove('fx-hidden');
    });
    setTimeout(() => { if (this.ctx.onComplete) this.ctx.onComplete({}); },
      (500 + this._hidden.length * 140) * (this.ctx.reducedMotion ? 0 : 1));
  }
  revealNow() { this.cat.revealNow(); }
  reset() {
    this.cat.reset();
    this._hidden.forEach((el) => {
      el.style.transitionDelay = '';
      el.classList.add('fx-hidden');
    });
    if (this.ctx.onProgress) this.ctx.onProgress(0);
  }
  destroy() {
    if (this.cat) this.cat.destroy();
    if (this.slot) this.slot.remove();
  }
}

/* ---- 8. compass ---- */
function buildCompassSvg(label) {
  const ticks = [];
  for (let i = 0; i < 32; i += 1) {
    const a = ((i * 360) / 32) * (Math.PI / 180);
    const major = i % 8 === 0;
    const r1 = major ? 60 : 67, r2 = 76;
    const cls = major ? 'compass__tick compass__tick--major' : 'compass__tick';
    ticks.push('<line class="' + cls + '" x1="' + (100 + Math.cos(a) * r1).toFixed(2) +
      '" y1="' + (100 + Math.sin(a) * r1).toFixed(2) +
      '" x2="' + (100 + Math.cos(a) * r2).toFixed(2) +
      '" y2="' + (100 + Math.sin(a) * r2).toFixed(2) + '"/>');
  }
  return '<svg class="compass" viewBox="0 0 200 200" role="img" aria-label="' + label + '">' +
    '<circle class="compass__ring" cx="100" cy="100" r="88"/>' +
    '<circle class="compass__dial" cx="100" cy="100" r="80"/>' +
    ticks.join('') +
    '<text class="compass__letter" x="172" y="105">В</text>' +
    '<text class="compass__letter" x="100" y="178">Ю</text>' +
    '<text class="compass__letter" x="28" y="105">З</text>' +
    '<path class="compass__heart" d="M100 46 l-1.8-1.6 C91.4 38.4 87 34.4 87 29.6 87 25.6 90.1 22.5 94.1 22.5 c2.3 0 4.5 1.1 5.9 2.8 1.4-1.7 3.6-2.8 5.9-2.8 4 0 7.1 3.1 7.1 7.1 0 4.8-4.4 8.8-11.2 14.8 z"/>' +
    '<g class="compass__needle"><path class="compass__needle-n" d="M100 40 L107 100 L93 100 Z"/>' +
    '<path class="compass__needle-s" d="M100 160 L107 100 L93 100 Z"/></g>' +
    '<circle class="compass__pin" cx="100" cy="100" r="6"/></svg>';
}
class CompassEffect {
  constructor(ctx) {
    this.ctx = ctx;
    this._timer = 0;
    this.done = false;
    this._tap = this._tap.bind(this);
  }
  mount() {
    this.done = false;
    const media = this.ctx.media;
    media.innerHTML = buildCompassSvg('Компас, стрелка которого указывает на сердце');
    this.compass = media.querySelector('.compass');
    this.compass.addEventListener('click', this._tap);
    this._hidden = [this.ctx.title, ...this.ctx.paragraphs];
    this._hidden.forEach((el) => el.classList.add('fx-hidden'));
    this._timer = setTimeout(() => this._settle(), 3400);
    return this;
  }
  _tap() { this._settle(); }
  _settle() {
    if (this.done) return;
    this.done = true;
    clearTimeout(this._timer);
    if (this.ctx.onFirstTouch) this.ctx.onFirstTouch();
    this.ctx.host.impact('medium');
    this.compass.classList.add('is-settled');
    const d = this.ctx.reducedMotion ? 0 : 1;
    setTimeout(() => {
      this._hidden.forEach((el, i) => {
        el.style.transitionDelay = (i * 150 * d) + 'ms';
        el.classList.remove('fx-hidden');
      });
      if (this.ctx.onProgress) this.ctx.onProgress(1);
      setTimeout(() => { if (this.ctx.onComplete) this.ctx.onComplete({}); },
        (600 + this._hidden.length * 150) * d);
    }, 950 * d);
  }
  revealNow() { this._settle(); }
  reset() {
    clearTimeout(this._timer);
    this.done = false;
    this.compass.classList.remove('is-settled');
    this._hidden.forEach((el) => {
      el.style.transitionDelay = '';
      el.classList.add('fx-hidden');
    });
    this._timer = setTimeout(() => this._settle(), 3400);
    if (this.ctx.onProgress) this.ctx.onProgress(0);
  }
  destroy() {
    clearTimeout(this._timer);
    if (this.compass) this.compass.removeEventListener('click', this._tap);
    this.ctx.media.replaceChildren();
  }
}

/* ---------------- реестр переходов ---------------- */
const EFFECTS = {
  fog: FogEffect, envelope: EnvelopeEffect, typewriter: TypewriterEffect,
  polaroid: PolaroidEffect, steps: StepsEffect, scroll: ScrollEffect,
  cat: CatEffect, compass: CompassEffect
};
