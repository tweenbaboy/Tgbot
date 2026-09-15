/* cat.js — svg cat art + CatCompanion (idle life, bubble, purr) */
function buildCatSvg() {
  return '<svg viewBox="0 0 120 110" aria-hidden="true">'
    + '<path d="M30 40 L24 14 L46 26 Z" fill="#6e431f"/>'
    + '<path d="M90 40 L96 14 L74 26 Z" fill="#6e431f"/>'
    + '<path d="M26 80 Q8 72 14 52" stroke="#6e431f" stroke-width="9" fill="none" stroke-linecap="round"/>'
    + '<ellipse cx="60" cy="80" rx="34" ry="26" fill="#7e4f27"/>'
    + '<circle cx="60" cy="42" r="26" fill="#7e4f27"/>'
    + '<g class="eyes-closed"><path d="M47 40 q5 4 10 0" stroke="#241505" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M63 40 q5 4 10 0" stroke="#241505" stroke-width="2.5" fill="none" stroke-linecap="round"/></g>'
    + '<g class="eyes-open"><circle cx="52" cy="40" r="3.4" fill="#241505"/><circle cx="68" cy="40" r="3.4" fill="#241505"/></g>'
    + '<g class="eyes-bliss"><path d="M47 42 q5 -6 10 0" stroke="#241505" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M63 42 q5 -6 10 0" stroke="#241505" stroke-width="2.5" fill="none" stroke-linecap="round"/></g>'
    + '<path d="M57 50 q3 4 6 0" stroke="#241505" stroke-width="2" fill="none" stroke-linecap="round"/>'
    + '<g stroke="#e0b57f" stroke-width="1.6"><path d="M40 48 L28 46"/><path d="M40 52 L28 54"/><path d="M80 48 L92 46"/><path d="M80 52 L92 54"/></g>'
    + '<circle cx="45" cy="48" r="4" fill="#c0554d" opacity=".35"/><circle cx="75" cy="48" r="4" fill="#c0554d" opacity=".35"/>'
    + '</svg>';
}

function spawnHeart(x, y) {
  const h = document.createElement('div');
  h.className = 'heart-fx';
  h.textContent = '❤';
  h.style.left = x + 'px';
  h.style.top = y + 'px';
  document.body.appendChild(h);
  setTimeout(() => h.remove(), 1200);
}

class CatCompanion {
  constructor(opts) {
    this.side = opts.side || 'right';
    this.purr = opts.purr || null;
    this.onPet = opts.onPet || null;
    this.acc = 0; this.pets = 0; this.drag = false; this.last = null;
    this.el = document.createElement('div');
    this.el.className = 'cat cat--' + this.side;
    this.el.innerHTML = buildCatSvg();
    if (opts.bubble) this.showBubble(opts.bubble);
    this.el.addEventListener('pointerdown', (e) => {
      this.drag = true; this.last = [e.clientX, e.clientY];
      if (this.el.setPointerCapture) this.el.setPointerCapture(e.pointerId);
      this.awake();
    });
    this.el.addEventListener('pointermove', (e) => {
      if (!this.drag) return;
      const dx = e.clientX - this.last[0], dy = e.clientY - this.last[1];
      this.last = [e.clientX, e.clientY];
      this.acc += Math.hypot(dx, dy);
      if (this.acc >= 90) { this.acc = 0; this.pet(e); }
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((t) => {
      this.el.addEventListener(t, () => { this.drag = false; this.cool(); });
    });
    this.idle = setInterval(() => this.idleAct(), 3400);
  }
  showBubble(text) {
    this.hideBubble();
    const b = document.createElement('div');
    b.className = 'cat-bubble';
    b.textContent = text;
    this.el.appendChild(b);
    this.bubble = b;
  }
  hideBubble() { if (this.bubble) { this.bubble.remove(); this.bubble = null; } }
  idleAct() {
    if (this.drag || !document.body.contains(this.el)) return;
    if (Math.random() < 0.22) {
      this.el.classList.add('is-blink');
      setTimeout(() => this.el.classList.remove('is-blink'), 200);
      return;
    }
    const modes = ['is-look-left', 'is-look-right', 'is-look-you', 'is-play'];
    const m = modes[Math.floor(Math.random() * modes.length)];
    this.el.classList.add(m);
    setTimeout(() => this.el.classList.remove(m), 1200);
  }
  awake() {
    if (!this.el.classList.contains('is-awake')) { this.el.classList.add('is-awake'); Host.haptic('light'); }
    this.el.classList.add('is-purring');
    if (this.purr) { this.purr.resume(); this.purr.set(0.5); }
  }
  pet(e) {
    this.pets++;
    this.el.classList.add('is-bliss');
    this.hideBubble();
    Host.haptic('medium');
    spawnHeart(e.clientX, e.clientY);
    if (this.purr) this.purr.set(1);
    if (this.onPet) this.onPet(this.pets);
  }
  cool() {
    this.el.classList.remove('is-purring');
    if (this.purr) this.purr.set(0);
  }
  mount(parent) { parent.appendChild(this.el); }
  destroy() { clearInterval(this.idle); this.cool(); this.el.remove(); }
}
