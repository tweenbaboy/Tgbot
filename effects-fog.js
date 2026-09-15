/* effects-fog.js — FogEffect (wipe fog) + ScrollEffect (pull down) */
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
    this.makeGhost();
    this.ro = new ResizeObserver(() => { this.syncGhost(); this.resize(); });
    this.ro.observe(c.titleEl);
    this.syncGhost();
    this.resize();
    this.bind();
    this.timer = setInterval(() => this.sample(), 160);
    c.hint('Три пальцем по дымке — проявятся слова');
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
