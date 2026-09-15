/* effects-fog.js — FogEffect (text visible under fog) + ScrollEffect (rods) */
class FogEffect {
  constructor(ctx) { this.ctx = ctx; this.done = false; this.brushing = false; }
  mount() {
    const c = this.ctx;
    this.wrap = document.createElement('div');
    this.wrap.className = 'fx-fog';
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'fog-canvas';
    this.wrap.appendChild(this.canvas);
    c.cardEl.appendChild(this.wrap);
    this.lines = makeLines(c.card, c.bodyEl);
    this.lines.forEach((p) => p.classList.add('is-visible'));
    this.makeGhost();
    this.ro = new ResizeObserver(() => { this.syncGhost(); this.resize(); });
    this.ro.observe(c.titleEl);
    this.syncGhost();
    this.resize();
    this.bind();
    this.timer = setInterval(() => this.sample(), 160);
    c.hint('Три пальцем по дымке');
  }
  makeGhost() {
    this.ghost = document.createElement('h2');
    this.ghost.className = 'card__title title-ghost';
    this.ghost.textContent = this.ctx.card.title;
    this.ghost.setAttribute('aria-hidden', 'true');
    document.getElementById('scene').appendChild(this.ghost);
  }
  syncGhost() {
    const r = this.ctx.titleEl.getBoundingClientRect();
    const g = this.ghost.style;
    g.left = r.left + 'px'; g.top = r.top + 'px'; g.width = r.width + 'px';
    g.fontSize = getComputedStyle(this.ctx.titleEl).fontSize;
  }
  resize() {
    const rect = this.wrap.getBoundingClientRect();
    if (rect.width < 10) return;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.w = rect.width; this.h = rect.height;
    const old = this.mask;
    this.canvas.width = this.w * this.dpr; this.canvas.height = this.h * this.dpr;
    this.mask = document.createElement('canvas');
    this.mask.width = this.w * this.dpr; this.mask.height = this.h * this.dpr;
    const m = this.mask.getContext('2d');
    if (old) m.drawImage(old, 0, 0, this.mask.width, this.mask.height);
    else { m.fillStyle = '#fff'; m.fillRect(0, 0, this.mask.width, this.mask.height); }
    this.fog = document.createElement('canvas');
    this.fog.width = this.mask.width; this.fog.height = this.mask.height;
    this.drawFog();
    this.paint();
  }
  drawFog() {
    const g = this.fog.getContext('2d');
    g.fillStyle = 'rgba(246,231,210,0.97)';
    g.fillRect(0, 0, this.fog.width, this.fog.height);
    for (let i = 0; i < 42; i++) {
      const x = Math.random() * this.fog.width, y = Math.random() * this.fog.height;
      const r = (0.06 + Math.random() * 0.14) * this.fog.width;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, 'rgba(255,253,248,' + (0.05 + Math.random() * 0.10) + ')');
      gr.addColorStop(1, 'rgba(255,253,248,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    }
  }
  paint() {
    const g = this.canvas.getContext('2d');
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    g.clearRect(0, 0, this.w, this.h);
    g.drawImage(this.fog, 0, 0, this.w, this.h);
    g.globalCompositeOperation = 'destination-in';
    g.drawImage(this.mask, 0, 0, this.w, this.h);
    g.globalCompositeOperation = 'source-over';
  }
  bind() {
    const cv = this.canvas;
    cv.addEventListener('pointerdown', (e) => {
      this.brushing = true;
      if (cv.setPointerCapture) cv.setPointerCapture(e.pointerId);
      this.ctx.onFirstTouch();
      this.brush(e);
    });
    cv.addEventListener('pointermove', (e) => { if (this.brushing) this.brush(e); });
    ['pointerup', 'pointercancel'].forEach((t) => cv.addEventListener(t, () => { this.brushing = false; }));
  }
  brush(e) {
    if (this.done) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const m = this.mask.getContext('2d');
    m.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    m.globalCompositeOperation = 'destination-out';
    const r = Math.min(this.w, this.h) * 0.11;
    const gr = m.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(0,0,0,1)');
    gr.addColorStop(0.7, 'rgba(0,0,0,0.9)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    m.fillStyle = gr;
    m.beginPath(); m.arc(x, y, r, 0, 7); m.fill();
    for (let i = 0; i < 3; i++) {
      const a = Math.random() * 6.28, d = r * (0.6 + Math.random() * 0.5);
      m.beginPath(); m.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r * 0.35, 0, 7); m.fill();
    }
    m.globalCompositeOperation = 'source-over';
    this.paint();
  }
  sample() {
    if (this.done || !this.mask) return;
    const tw = 56, th = Math.max(8, Math.round(56 * this.h / this.w));
    const t = document.createElement('canvas');
    t.width = tw; t.height = th;
    const g = t.getContext('2d');
    g.drawImage(this.mask, 0, 0, tw, th);
    const d = g.getImageData(0, 0, tw, th).data;
    let cleared = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] < 128) cleared++;
    const ratio = cleared / (tw * th);
    this.ctx.onProgress(Math.min(1, ratio / 0.42));
    if (ratio >= 0.42) this.finish(false);
  }
  finish(instant) {
    if (this.done) return;
    this.done = true;
    clearInterval(this.timer);
    this.wrap.classList.add('is-gone');
    if (this.ghost) { this.ghost.remove(); this.ghost = null; }
    this.ctx.onProgress(1);
    setTimeout(() => this.ctx.onComplete(), instant ? 0 : 650);
  }
  revealNow() { this.finish(true); }
  reset() {
    this.done = false;
    this.wrap.classList.remove('is-gone');
    const m = this.mask.getContext('2d');
    m.setTransform(1, 0, 0, 1, 0, 0);
    m.fillStyle = '#fff'; m.fillRect(0, 0, this.mask.width, this.mask.height);
    this.paint();
    if (!this.ghost) { this.makeGhost(); this.syncGhost(); }
    clearInterval(this.timer);
    this.timer = setInterval(() => this.sample(), 160);
    this.ctx.onProgress(0);
  }
  destroy() {
    clearInterval(this.timer);
    if (this.ro) this.ro.disconnect();
    if (this.ghost) this.ghost.remove();
    if (this.wrap) this.wrap.remove();
  }
}

class ScrollEffect {
  constructor(ctx) { this.ctx = ctx; this.done = false; this.y = null; this.moved = 0; }
  mount() {
    const c = this.ctx;
    this.knob = document.createElement('div');
    this.knob.className = 'scroll-knob';
    this.knob.textContent = '⌄';
    this.wrap = document.createElement('div');
    this.wrap.className = 'scroll-wrap';
    this.rodTop = document.createElement('div');
    this.rodTop.className = 'scroll-rod scroll-rod--top';
    this.paper = document.createElement('div');
    this.paper.className = 'scroll-paper';
    this.rodBot = document.createElement('div');
    this.rodBot.className = 'scroll-rod';
    this.wrap.appendChild(this.rodTop);
    this.wrap.appendChild(this.paper);
    this.wrap.appendChild(this.rodBot);
    c.bodyEl.appendChild(this.knob);
    c.bodyEl.appendChild(this.wrap);
    this.lines = makeLines(c.card, this.paper);
    this.h0 = 70;
    this.wrap.style.height = this.h0 + 'px';
    this.rodBot.style.top = (this.h0 - 10) + 'px';
    requestAnimationFrame(() => { this.full = this.paper.scrollHeight + 8; });
    this.wrap.addEventListener('pointerdown', (e) => {
      this.y = e.clientY; this.moved = 0;
      if (this.wrap.setPointerCapture) this.wrap.setPointerCapture(e.pointerId);
    });
    this.wrap.addEventListener('pointermove', (e) => {
      if (this.y == null) return;
      const dy = e.clientY - this.y;
      this.y = e.clientY;
      if (dy > 0) { this.moved += dy; this.add(dy); }
    });
    ['pointerup', 'pointercancel'].forEach((t) => this.wrap.addEventListener(t, () => {
      if (this.moved < 6) this.add(90);
      this.y = null;
    }));
    c.hint('Тяни свиток вниз (или тапни)');
  }
  add(d) {
    if (this.done || !this.full) return;
    this.ctx.onFirstTouch();
    this.cur = clamp((this.cur || this.h0) + d, this.h0, this.full);
    this.wrap.style.height = this.cur + 'px';
    this.rodBot.style.top = (this.cur - 10) + 'px';
    const p = (this.cur - this.h0) / Math.max(1, this.full - this.h0);
    this.ctx.onProgress(p);
    if (p >= 0.995) this.finish();
  }
  finish() {
    if (this.done) return;
    this.done = true;
    Host.haptic('medium');
    this.ctx.onProgress(1);
    setTimeout(() => this.ctx.onComplete(), 300);
  }
  revealNow() {
    if (this.full) {
      this.cur = this.full;
      this.wrap.style.height = this.full + 'px';
      this.rodBot.style.top = (this.full - 10) + 'px';
    }
    this.finish();
  }
  reset() {
    this.done = false;
    this.cur = this.h0;
    this.wrap.style.height = this.h0 + 'px';
    this.rodBot.style.top = (this.h0 - 10) + 'px';
    this.ctx.onProgress(0);
  }
  destroy() {}
}
