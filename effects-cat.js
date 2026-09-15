/* effects-cat.js — Steps, CatGate (bubble), Compass (erratic spin -> heart), registry */
class StepsEffect {
  constructor(ctx) { this.ctx = ctx; this.n = 0; }
  mount() {
    const c = this.ctx;
    this.box = document.createElement('div');
    this.box.className = 'steps';
    this.steps = [0, 1, 2].map(() => {
      const d = document.createElement('div');
      d.className = 'step';
      d.textContent = '🐾';
      this.box.appendChild(d);
      return d;
    });
    c.bodyEl.appendChild(this.box);
    this.lines = makeLines(c.card, c.bodyEl);
    c.cardEl.addEventListener('pointerdown', () => this.tap());
    c.hint('Тап — подняться на ступень (1/3)');
  }
  tap() {
    if (this.n >= 3) return;
    this.ctx.onFirstTouch();
    this.steps[this.n].classList.add('is-on');
    Host.haptic('medium');
    this.n++;
    if (this.n < 3) {
      this.ctx.hint('Тап — подняться на ступень (' + (this.n + 1) + '/3)');
      this.ctx.onProgress(this.n / 3 * 0.8);
      return;
    }
    revealLines(this.lines, false);
    setTimeout(() => { this.ctx.onProgress(1); this.ctx.onComplete(); }, 500);
  }
  revealNow() {
    this.steps.forEach((s) => s.classList.add('is-on'));
    this.n = 3;
    revealLines(this.lines, true);
    this.ctx.onProgress(1);
    this.ctx.onComplete();
  }
  reset() {
    this.n = 0;
    this.steps.forEach((s) => s.classList.remove('is-on'));
    this.lines.forEach((p) => p.classList.remove('is-visible'));
    this.ctx.onProgress(0);
  }
  destroy() {}
}

class CatGateEffect {
  constructor(ctx) { this.ctx = ctx; this.done = false; }
  mount() {
    const c = this.ctx;
    this.lines = makeLines(c.card, c.bodyEl);
    this.comp = new CatCompanion({
      side: 'center', purr: c.purr,
      bubble: 'погладь меня, и смотри что будет',
      onPet: (n) => this.onPet(n)
    });
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
    this.comp.showBubble('погладь меня, и смотри что будет');
    this.lines.forEach((p) => p.classList.remove('is-visible'));
    this.ctx.onProgress(0);
    this.ctx.hint('Погладь котика 6 раз');
  }
  destroy() { if (this.comp) this.comp.destroy(); }
}

function buildCompassSvg() {
  return '<svg class="compass" viewBox="0 0 120 120" aria-hidden="true">'
    + '<circle cx="60" cy="60" r="54" fill="#fff7ec" stroke="#6e431f" stroke-width="4"/>'
    + '<text x="60" y="21" text-anchor="middle" font-size="14">❤️</text>'
    + '<g class="compass__needle"><path d="M60 26 L66 60 L54 60 Z" fill="#b34a2e"/><path d="M60 94 L54 60 L66 60 Z" fill="#6b4c2e"/></g>'
    + '<circle cx="60" cy="60" r="5" fill="#3a2210"/></svg>';
}

class CompassEffect {
  constructor(ctx) { this.ctx = ctx; this.settled = false; this.done = false; this.raf = 0; this.angle = 0; this.vel = 0; }
  mount() {
    const c = this.ctx;
    c.bodyEl.insertAdjacentHTML('afterbegin', buildCompassSvg());
    this.needle = c.bodyEl.querySelector('.compass__needle');
    this.lines = makeLines(c.card, c.bodyEl);
    c.cardEl.addEventListener('pointerdown', () => this.settle());
    this.timeout = setTimeout(() => this.settle(), 3400);
    this.loop();
    c.hint('Стрелку трясёт… тап — и она укажет на сердце');
  }
  loop() {
    const step = () => {
      if (!this.settled) {
        this.vel += (Math.random() - 0.5) * 26;
        this.vel = clamp(this.vel, -30, 30);
        if (Math.random() < 0.08) this.vel *= -1;
        this.angle += this.vel;
        this.ctx.onProgress(0.15);
      } else {
        const k = Math.min(1, (performance.now() - this.ss) / 1100);
        const e = 1 - Math.pow(1 - k, 3);
        this.angle = this.from + (this.target - this.from) * e;
        this.ctx.onProgress(0.15 + 0.85 * k);
        if (k >= 1) { this.finish(); return; }
      }
      this.needle.setAttribute('transform', 'rotate(' + (this.angle % 360).toFixed(2) + ' 60 60)');
      this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }
  settle() {
    if (this.settled) return;
    this.settled = true;
    this.ss = performance.now();
    this.from = this.angle;
    this.target = Math.round(this.angle / 360) * 360;
    clearTimeout(this.timeout);
    Host.haptic('medium');
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
    this.angle = 0; this.vel = 0;
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
  yarn: YarnEffect,
  steps: StepsEffect,
  scroll: ScrollEffect,
  'cat-gate': CatGateEffect,
  compass: CompassEffect
};
