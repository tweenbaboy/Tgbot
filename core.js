/* core.js — utils, host bridge, purr audio, line helpers */
const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const DECK = { cards: [] };

function showError(msg) {
  const txt = $('state-error-text');
  if (txt) txt.textContent = msg;
  const box = $('state-error');
  if (box) box.classList.remove('hidden');
  const rl = $('btn-reload');
  if (rl) rl.classList.remove('hidden');
  const sc = $('scene');
  if (sc) sc.dataset.state = 'error';
}

const Host = {
  tg: (window.Telegram && window.Telegram.WebApp) || null,
  haptic(kind) {
    try {
      if (this.tg && this.tg.HapticFeedback) { this.tg.HapticFeedback.impactOccurred(kind); return; }
      if (navigator.vibrate) navigator.vibrate(kind === 'heavy' ? 30 : 12);
    } catch (e) {}
  }
};

function createPurrAudio() {
  let ctx = null, gain = null, on = true;
  function ensure() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 170;
    gain = ctx.createGain(); gain.gain.value = 0;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 24;
    const lg = ctx.createGain(); lg.gain.value = 0.05;
    lfo.connect(lg); lg.connect(gain.gain);
    src.connect(lp); lp.connect(gain); gain.connect(ctx.destination);
    src.start(); lfo.start();
  }
  return {
    resume() { ensure(); if (ctx && ctx.state === 'suspended') ctx.resume(); },
    set(level) { if (!ctx || !gain) return; gain.gain.setTargetAtTime(on ? 0.12 * level : 0, ctx.currentTime, 0.08); },
    mute(m) { on = !m; if (ctx && gain && !on) gain.gain.setTargetAtTime(0, ctx.currentTime, 0.05); }
  };
}

function makeLines(card, container) {
  const arr = card.text.split('\n');
  return arr.map((t, i) => {
    const p = document.createElement('p');
    p.className = 'line' + (i === arr.length - 1 ? ' is-emphasised' : '');
    p.textContent = t;
    container.appendChild(p);
    return p;
  });
}

function revealLines(lines, instant) {
  lines.forEach((p, i) => {
    if (instant || REDUCED) { p.classList.add('is-visible'); return; }
    setTimeout(() => p.classList.add('is-visible'), 140 * i);
  });
}
