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
    c.hint('Погладь кот
