/* effects-cat.js — CatGate, Compass, EFFECTS registry */
class CatGateEffect {
  constructor(ctx) { this.ctx = ctx; this.done = false; }
  mount() {
    const c = this.ctx;
    this.lines = makeLines(c.card, c.bodyEl);
    this.comp = new CatCompanion({ side: 'center', purr: c.purr, onPet: (n) => this.onPet(n) });
    c.bodyEl.insertBefore(this.comp.el, c.bodyEl.firstChild);
    c.hint('Погладь котика 6 раз');
  }
  onPet(n) {
    this.ctx.onProgress(Math.min(n / 6, 1) * 0.9);
    if (n < 6) { this.ctx.hint('Ещё ' + (6 - n) + ' поглаживаний'); return; }
    if (this.done) return;
    this.done = true;
    this.comp.el.classList.add('is-aside');
    revealLines(this.lines, false);
    this.ctx.onProgress(1);
    setTimeout(() => this.ctx.onComplete(), 500);
  }
  revealNow() {
    this.done = true;
    this.comp.el.classList.add('is-aside');
    revealLines(this.lines, true);
    this.ctx.onProgress(1);
    this.ctx.onComplete();
  }
  reset() {
    this.done = false;
    this.comp.pets = 0;
    this.comp.el.classList.remove('is-aside', 'is-bliss');
    this.lines.forEach((p) => p.classList.remove('is-visible'));
    this.ctx.onProgress(0);
    this.ctx.hint('Погладь котика 6 раз');
  }
  destroy() { if (this.comp) this.comp.destroy(); }
}

function buildCompassSvg() {
  return '<svg class="compass" viewBox="0 0 120 120" aria-hidden="true">'
    + '<circle cx="60" cy="60" r="54" fill="#fff7ec" stroke="#6e431f" stroke-width="4"/>'
    + '<text x="60" y="27" text-anchor="middle" font-size="15">❤️</text>'
    + '<g class="compass__needle"><path d="M60 20 L66 60 L54 60 Z" fill="#b34a2e"/><path d="M60 100 L54 60 L66 60 Z" fill="#6b4c2e"/></g>'
    + '<circle cx="60" cy="60" r="5" fill="#3a2210"/></svg>';
}

class CompassEffect {
  constructor(ctx) { this.ctx = ctx; this.settled = false; this.done = false; this.raf = 0; }
  mount() {
    const c = this.ctx;
    c.bodyEl.insertAdjacentHTML('afterbegin', buildCompassSvg());
    this.needle = c.bodyEl.querySelector('.compass__needle');
    this.lines = makeLines(c.card, c.bodyEl);
    this.t0 = performance.now();
    c.cardEl.addEventListener('pointerdown', () => this.settle());
    this.timeout = setTimeout(() => this.settle(), 3400);
    this.loop();
    c.hint('Стрелка ищет… тап, чтобы успокоить');
  }
  loop() {
    const step = () => {
      const t = performance.now() - this.t0;
      if (!this.settled) {
        this.angle = 40 * Math.sin(t / 300) + 25 * Math.sin(t / 173 + 1.7) + 12 * Math.sin(t / 71);
        this.ctx.onProgress(0.15);
      } else {
        const k = Math.min(1, (performance.now() - this.ss) / 900);
        const e = k * k * (3 - 2 * k);
        this.angle = this.from * (1 - e);
        this.ctx.onProgress(0.15 + 0.85 * e);
        if (k >= 1) { this.finish(); return; }
      }
      this.needle.setAttribute('transform', 'rotate(' + this.angle.toFixed(2) + ' 60 60)');
      this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }
  settle() {
    if (this.settled) return;
    this.settled = true;
    this.ss = performance.now();
    let a = (this.angle || 0) % 360;
    if (a > 180) a -= 360;
    if (a < -180) a += 360;
    this.from = a;
    clearTimeout(this.timeout);
    Host.haptic('light');
    this.ctx.onFirstTouch();
  }
  finish() {
    if (this.done) return;
    this.done = true;
    cancelAnimationFrame(this.raf);
    this.needle.setAttribute('transform', 'rotate(0 60 60)');
    revealLines(this.lines, false);
    this.ctx.onProgress(1);
    setTimeout(() => this.ctx.onComplete(), 450);
  }
  revealNow() {
    this.settled = true; this.done = true;
    cancelAnimationFrame(this.raf);
    clearTimeout(this.timeout);
    this.needle.setAttribute('transform', 'rotate(0 60 60)');
    revealLines(this.lines, true);
    this.ctx.onProgress(1);
    this.ctx.onComplete();
  }
  reset() {
    cancelAnimationFrame(this.raf);
    clearTimeout(this.timeout);
    this.settled = false; this.done = false;
    this.t0 = performance.now();
    this.lines.forEach((p) => p.classList.remove('is-visible'));
    this.timeout = setTimeout(() => this.settle(), 3400);
    this.loop();
    this.ctx.onProgress(0);
  }
  destroy() { cancelAnimationFrame(this.raf); clearTimeout(this.timeout); }
}

const EFFECTS = {
  fog: FogEffect,
  envelope: EnvelopeEffect,
  typewriter: TypewriterEffect,
  polaroid: PolaroidEffect,
  steps: StepsEffect,
  scroll: ScrollEffect,
  'cat-gate': CatGateEffect,
  compass: CompassEffect
};
