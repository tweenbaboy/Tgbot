/* effects-more.js — Envelope, Typewriter, Yarn (cat rolls a ball) */
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

class YarnEffect {
  constructor(ctx) { this.ctx = ctx; this.n = 0; this.dir = 1; this.rot = 0; }
  mount() {
    const c = this.ctx;
    this.comp = new CatCompanion({ side: 'top', purr: c.purr });
    c.bodyEl.appendChild(this.comp.el);
    this.stage = document.createElement('div');
    this.stage.className = 'yarn-stage';
    this.thread = document.createElement('div');
    this.thread.className = 'yarn-thread';
    this.ball = document.createElement('div');
    this.ball.className = 'yarn-ball';
    this.ball.innerHTML = '<svg viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="26" fill="#c0554d"/><path d="M6 20 Q28 34 50 18 M4 32 Q28 46 52 30 M10 44 Q28 54 46 42" stroke="#fff7ec" stroke-width="2.5" fill="none" opacity=".8"/></svg>';
    this.stage.appendChild(this.thread);
    this.stage.appendChild(this.ball);
    c.bodyEl.appendChild(this.stage);
    this.lines = makeLines(c.card, c.bodyEl);
    c.cardEl.addEventListener('pointerdown', (e) => this.bat(e));
    c.hint('Тапай — котик катает клубок (1/4)');
  }
  bat(e) {
    if (this.n >= 4) return;
    this.ctx.onFirstTouch();
    this.n++;
    this.dir *= -1;
    const w = Math.max(0, this.stage.clientWidth - 56);
    const x = this.dir > 0 ? w : 0;
    this.rot += 360 * this.dir;
    this.ball.style.transform = 'translateX(' + x + 'px) rotate(' + this.rot + 'deg)';
    this.thread.style.width = x + 'px';
    this.comp.el.classList.add('is-bat');
    setTimeout(() => this.comp.el.classList.remove('is-bat'), 520);
    Host.haptic('light');
    spawnHeart(e.clientX, e.clientY);
    if (this.n < 4) {
      this.ctx.hint('Тапай — котик катает клубок (' + (this.n + 1) + '/4)');
      this.ctx.onProgress(this.n / 4 * 0.8);
      return;
    }
    revealLines(this.lines, false);
    setTimeout(() => { this.ctx.onProgress(1); this.ctx.onComplete(); }, 500);
  }
  revealNow() {
    this.n = 4;
    const w = Math.max(0, this.stage.clientWidth - 56);
    this.ball.style.transform = 'translateX(' + w + 'px) rotate(720deg)';
    this.thread.style.width = w + 'px';
    revealLines(this.lines, true);
    this.ctx.onProgress(1);
    this.ctx.onComplete();
  }
  reset() {
    this.n = 0; this.dir = 1; this.rot = 0;
    this.ball.style.transform = 'translateX(0) rotate(0)';
    this.thread.style.width = '0';
    this.lines.forEach((p) => p.classList.remove('is-visible'));
    this.ctx.onProgress(0);
    this.ctx.hint('Тапай — котик катает клубок (1/4)');
  }
  destroy() { if (this.comp) this.comp.destroy(); }
}
