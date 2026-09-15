/* effects-more.js — Envelope, Typewriter, Polaroid, Steps */
class EnvelopeEffect {
  constructor(ctx) { this.ctx = ctx; this.opened = false; }
  mount() {
    const c = this.ctx;
    this.env = document.createElement('div');
    this.env.className = 'env';
    this.env.innerHTML = '<div class="env__body"></div><div class="env__letter"></div><div class="env__flap"></div><button class="env__seal" aria-label="Открыть конверт">♥</button>';
    c.bodyEl.appendChild(this.env);
    this.lines = makeLines(c.card, c.bodyEl);
    this.env.addEventListener('pointerdown', () => this.open(false));
    c.hint('Нажми на печать ♥');
  }
  open(instant) {
    if (this.opened) return;
    this.opened = true;
    this.ctx.onFirstTouch();
    Host.haptic('medium');
    this.env.classList.add('is-open');
    const dur = (instant || REDUCED) ? 0 : 900;
    const t0 = performance.now();
    const step = (now) => {
      const k = dur ? Math.min(1, (now - t0) / dur) : 1;
      this.ctx.onProgress(k * 0.9);
      if (k < 1) { requestAnimationFrame(step); return; }
      this.env.classList.add('is-done');
      revealLines(this.lines, instant);
      this.ctx.onProgress(1);
      setTimeout(() => this.ctx.onComplete(), instant ? 0 : 450);
    };
    requestAnimationFrame(step);
  }
  revealNow() { this.open(true); }
  reset() {
    this.opened = false;
    this.env.classList.remove('is-open', 'is-done');
    this.lines.forEach((p) => p.classList.remove('is-visible'));
    this.ctx.onProgress(0);
    this.ctx.hint('Нажми на печать ♥');
  }
  destroy() {}
}

class TypewriterEffect {
  constructor(ctx) { this.ctx = ctx; }
  mount() {
    const c = this.ctx;
    this.lines = makeLines(c.card, c.bodyEl);
    this.full = this.lines.map((p) => p.textContent);
    this.total = this.full.reduce((s, t) => s + t.length, 0);
    this.typed = 0; this.li = 0; this.ci = 0; this.done = false;
    this.lines.forEach((p) => { p.textContent = ''; });
    if (REDUCED) { this.revealNow(); return; }
    this.timer = setInterval(() => this.tick(), 26);
    c.bodyEl.addEventListener('pointerdown', () => this.boost());
    c.hint('Печатается само… тап — ускорить строку');
  }
  tick() {
    if (this.li >= this.lines.length) { this.stop(); return; }
    const line = this.lines[this.li];
    if (this.ci === 0) line.classList.add('is-visible');
    this.ci++; this.typed++;
    line.textContent = this.full[this.li].slice(0, this.ci);
    if (this.ci % 3 === 0) this.ctx.onProgress(this.typed / this.total);
    if (this.ci >= this.full[this.li].length) { this.li++; this.ci = 0; }
  }
  boost() {
    if (this.done || this.li >= this.lines.length) return;
    this.ctx.onFirstTouch();
    Host.haptic('light');
    this.typed += this.full[this.li].length - this.ci;
    this.lines[this.li].textContent = this.full[this.li];
    this.li++; this.ci = 0;
    this.ctx.onProgress(this.typed / this.total);
  }
  stop() {
    clearInterval(this.timer);
    if (this.done) return;
    this.done = true;
    this.ctx.onProgress(1);
    setTimeout(() => this.ctx.onComplete(), 350);
  }
  revealNow() {
    clearInterval(this.timer);
    this.done = true;
    this.lines.forEach((p, i) => { p.textContent = this.full[i]; p.classList.add('is-visible'); });
    this.ctx.onProgress(1);
    this.ctx.onComplete();
  }
  reset() {
    clearInterval(this.timer);
    this.done = false; this.typed = 0; this.li = 0; this.ci = 0;
    this.lines.forEach((p) => { p.textContent = ''; p.classList.remove('is-visible'); });
    this.timer = setInterval(() => this.tick(), 26);
    this.ctx.onProgress(0);
  }
  destroy() { clearInterval(this.timer); }
}

class PolaroidEffect {
  constructor(ctx) { this.ctx = ctx; this.n = 0; }
  mount() {
    const c = this.ctx;
    this.row = document.createElement('div');
    this.row.className = 'pol-row';
    this.pols = ['🌤', '', '🫂', '😊'].map((e) => {
      const d = document.createElement('div');
      d.className = 'pol';
      d.style.setProperty('--tilt', (Math.random() * 12 - 6).toFixed(1) + 'deg');
      d.innerHTML = '<div class="pol__ph">' + e + '</div>';
      this.row.appendChild(d);
      return d;
    });
    c.bodyEl.appendChild(this.row);
    this.lines = makeLines(c.card, c.bodyEl);
    c.cardEl.addEventListener('pointerdown', (e) => this.tap(e));
    c.hint('Тапай — проявятся снимки (1/4)');
  }
  tap(e) {
    if (this.n >= 4) return;
    this.ctx.onFirstTouch();
    this.pols[this.n].classList.add('is-on');
    Host.haptic('light');
    spawnHeart(e.clientX, e.clientY);
    this.n++;
    if (this.n < 4) {
      this.ctx.hint('Тапай — проявятся снимки (' + (this.n + 1) + '/4)');
      this.ctx.onProgress(this.n / 4 * 0.8);
      return;
    }
    revealLines(this.lines, false);
    setTimeout(() => { this.ctx.onProgress(1); this.ctx.onComplete(); }, 500);
  }
  revealNow() {
    this.pols.forEach((p) => p.classList.add('is-on'));
    this.n = 4;
    revealLines(this.lines, true);
    this.ctx.onProgress(1);
    this.ctx.onComplete();
  }
  reset() {
    this.n = 0;
    this.pols.forEach((p) => p.classList.remove('is-on'));
    this.lines.forEach((p) => p.classList.remove('is-visible'));
    this.ctx.onProgress(0);
  }
  destroy() {}
}

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
