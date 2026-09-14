<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Тест · Для тебя</title>
<style>
:root{--cream:#fff8ee;--ink:#241505;--ink-soft:#6b4c2e;--caramel-9:#3a2210;--ivory:#fff7ec}
[hidden]{display:none !important}
*{box-sizing:border-box}
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;background:#6e431f;color:var(--ink)}
.scene{position:relative;min-height:100vh;min-height:100dvh;overflow:hidden}
.paper{position:absolute;inset:0;background:radial-gradient(120% 80% at 14% 6%,#fffdf8 0%,rgba(255,253,248,0) 58%),#fff8ee}
.card{position:relative;z-index:2;max-width:34rem;margin:0 auto;padding:16vh 1.25rem 8.5rem;text-align:center}
.eyebrow{letter-spacing:.16em;text-transform:uppercase;font-size:.72rem;font-weight:700;color:var(--ink-soft);margin:0 0 1rem}
h1{font-family:Georgia,"Times New Roman",serif;font-size:clamp(2.1rem,8vw,3.2rem);line-height:1.1;margin:0;transition:opacity .5s}
h1.hidden{opacity:0}
.body{margin-top:1.25rem;display:grid;gap:.9rem;font-size:clamp(1.05rem,4.2vw,1.25rem);line-height:1.7}
.body p{margin:0}
.actions{margin-top:1.5rem;display:flex;gap:.75rem;justify-content:center}
.btn{min-height:44px;padding:.7rem 1.4rem;border-radius:999px;border:0;font-weight:700;font-size:.95rem;cursor:pointer}
.btn-primary{background:var(--caramel-9);color:var(--ivory)}
canvas.fog{position:absolute;inset:0;z-index:5;width:100%;height:100%;touch-action:none}
.ghost{position:fixed;z-index:6;pointer-events:none;font-family:Georgia,serif;font-weight:700;
  font-size:clamp(2.1rem,8vw,3.2rem);line-height:1.1;color:var(--ivory);text-align:center;
  text-shadow:0 1px 0 rgba(42,23,8,.45),0 0 24px rgba(42,23,8,.4);transition:opacity .3s}
.ghost.off{opacity:0}
.cat{position:relative;z-index:2;width:clamp(6rem,24vw,7.5rem);margin:1rem auto 0;touch-action:none;
  user-select:none;-webkit-user-select:none}
.cat svg{width:100%;display:block}
.hearts{position:absolute;inset:0;pointer-events:none}
.heart{position:absolute;left:50%;bottom:55%;width:1.2rem;height:1.2rem;color:#c0554d;animation:hh 1s ease-out forwards}
.heart svg{width:100%;height:100%;fill:currentColor}
@keyframes hh{0%{opacity:0;transform:translate(calc(-50% + var(--dx,0px)),8px) scale(.5)}25%{opacity:1}100%{opacity:0;transform:translate(calc(-50% + var(--dx,0px)),-64px) scale(1.1)}}
.hint{position:fixed;left:50%;bottom:4.6rem;transform:translateX(-50%);z-index:7;padding:.45rem 1rem;
  border-radius:999px;font-size:.9rem;font-weight:600;color:var(--ivory);background:rgba(42,23,8,.5);
  transition:opacity .3s;white-space:nowrap}
.hint.off{opacity:0}
.badge{position:fixed;left:50%;bottom:1rem;transform:translateX(-50%);z-index:8;font-size:.78rem;font-weight:700;
  padding:.35rem .8rem;border-radius:999px;background:rgba(42,23,8,.55);color:var(--ivory)}
.err{position:fixed;inset:0;z-index:20;display:grid;place-items:center;background:#fff8ee;padding:1.5rem;text-align:center}
.err .box{max-width:24rem;background:#fffdf8;border-radius:1.25rem;padding:1.5rem;box-shadow:0 10px 30px -12px rgba(58,34,16,.4)}
.err h2{margin:0 0 .75rem;font-family:Georgia,serif}
.err p{margin:0 0 1rem;font-size:.9rem;line-height:1.55;color:#6b4c2e;overflow-wrap:anywhere}
</style>
</head>
<body>
<div class="scene" id="scene">
  <div class="paper"></div>
  <div class="card">
    <p class="eyebrow">01 · тестовая сборка</p>
    <h1 id="title" class="hidden">Я хочу сказать тебе кое-что</h1>
    <div class="body" id="body">
      <p>Я не всегда умею правильно говорить о своих чувствах.</p>
      <p>Поэтому решил сказать это так.</p>
      <p>Без оправданий.</p>
      <p>Без «но».</p>
      <p>Просто от себя.</p>
    </div>
    <div class="cat" id="cat"></div>
    <div class="actions" id="actions" hidden>
      <button class="btn btn-primary" id="again" type="button">Ещё раз</button>
    </div>
  </div>
  <canvas class="fog" id="fog"></canvas>
  <div class="ghost" id="ghost">Я хочу сказать тебе кое-что</div>
  <p class="hint" id="hint">Потри экран пальцем</p>
  <p class="badge" id="badge">загрузка…</p>
</div>
<div class="err" id="err" hidden>
  <div class="box">
    <h2>Ошибка</h2>
    <p id="err-text"></p>
    <button class="btn btn-primary" onclick="location.reload()">Обновить</button>
  </div>
</div>
<script>
'use strict';
var BUILD = 'mini-1';
function fatal(msg) {
  var e = document.getElementById('err'), t = document.getElementById('err-text');
  if (t) t.textContent = msg;
  if (e) e.hidden = false;
}
window.addEventListener('error', function (ev) {
  fatal('Ошибка скрипта: ' + (ev && ev.message ? ev.message : 'неизвестно') +
    '. Скорее всего файл скопирован не целиком — последняя строка должна быть </html>.');
});

/* --- заголовок-призрак поверх дымки --- */
var title = document.getElementById('title');
var ghost = document.getElementById('ghost');
function syncGhost() {
  var r = title.getBoundingClientRect();
  ghost.style.left = Math.round(r.left) + 'px';
  ghost.style.top = Math.round(r.top) + 'px';
  ghost.style.width = Math.round(r.width) + 'px';
}

/* --- дымка --- */
var cv = document.getElementById('fog'), cx = cv.getContext('2d');
var layer = document.createElement('canvas'), lx = layer.getContext('2d');
var mask = document.createElement('canvas'), mx = mask.getContext('2d');
var samp = document.createElement('canvas'), sx = samp.getContext('2d', { willReadFrequently: true });
var W = 0, H = 0, brush = null, done = false, touched = false;
var ptrs = Object.create(null), queue = [], raf = 0, lastSample = 0;

function makeBrush(r) {
  r = Math.ceil(r);
  var c = document.createElement('canvas');
  c.width = c.height = r * 2;
  var b = c.getContext('2d');
  var g = b.createRadialGradient(r, r, r * 0.05, r, r, r);
  g.addColorStop(0, 'rgba(0,0,0,1)');
  g.addColorStop(0.55, 'rgba(0,0,0,.9)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  b.fillStyle = g;
  b.fillRect(0, 0, r * 2, r * 2);
  return { c: c, r: r };
}
function paint() {
  lx.clearRect(0, 0, W, H);
  var g = lx.createLinearGradient(W, 0, 0, H);
  g.addColorStop(0, '#CE9657');
  g.addColorStop(0.42, '#A9682F');
  g.addColorStop(1, '#6E431F');
  lx.fillStyle = g;
  lx.fillRect(0, 0, W, H);
  var v = lx.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.3, W / 2, H / 2, Math.hypot(W, H) * 0.72);
  v.addColorStop(0, 'rgba(42,23,8,0)');
  v.addColorStop(1, 'rgba(42,23,8,.42)');
  lx.fillStyle = v;
  lx.fillRect(0, 0, W, H);
}
function snapMask() {
  var s = document.createElement('canvas');
  s.width = mask.width; s.height = mask.height;
  s.getContext('2d').drawImage(mask, 0, 0);
  return s;
}
function comp() {
  cx.save();
  cx.setTransform(1, 0, 0, 1, 0, 0);
  cx.clearRect(0, 0, cv.width, cv.height);
  cx.drawImage(layer, 0, 0);
  cx.globalCompositeOperation = 'destination-out';
  cx.drawImage(mask, 0, 0);
  cx.restore();
}
function resize() {
  var r = document.getElementById('scene').getBoundingClientRect();
  W = Math.max(1, Math.round(r.width));
  H = Math.max(1, Math.round(r.height));
  var dpr = Math.min(2, window.devicePixelRatio || 1);
  var snap = mask.width > 0 ? snapMask() : null;
  [cv, layer, mask].forEach(function (c) {
    c.width = Math.round(W * dpr);
    c.height = Math.round(H * dpr);
  });
  cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  lx.setTransform(dpr, 0, 0, dpr, 0, 0);
  mx.setTransform(dpr, 0, 0, dpr, 0, 0);
  samp.width = 48;
  samp.height = Math.max(1, Math.round(48 * H / W));
  brush = makeBrush(Math.max(16, Math.min(W, H) * 0.11));
  paint();
  if (snap) mx.drawImage(snap, 0, 0, W, H);
  comp();
  syncGhost();
}
function local(e) {
  var r = cv.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}
function stamp(p) {
  mx.drawImage(brush.c, p.x - brush.r, p.y - brush.r);
  cx.drawImage(brush.c, p.x - brush.r, p.y - brush.r);
}
function flush() {
  raf = 0;
  if (done) return;
  if (queue.length) {
    mx.globalCompositeOperation = 'destination-out';
    cx.globalCompositeOperation = 'destination-out';
    queue.forEach(stamp);
    mx.globalCompositeOperation = 'source-over';
    cx.globalCompositeOperation = 'source-over';
    queue = [];
  }
  var now = performance.now();
  if (now - lastSample > 150) { lastSample = now; sample(); }
}
function schedule() { if (!raf && !done) raf = requestAnimationFrame(flush); }
function sample() {
  try {
    sx.clearRect(0, 0, samp.width, samp.height);
    sx.drawImage(cv, 0, 0, samp.width, samp.height);
    var d = sx.getImageData(0, 0, samp.width, samp.height).data;
    var total = 0, cleared = 0;
    for (var i = 3; i < d.length; i += 4) { total++; if (d[i] < 128) cleared++; }
    if (total && cleared / total >= 0.4) finish();
  } catch (e) { /* ignore */ }
}
function finish() {
  if (done) return;
  done = true;
  cv.style.transition = 'opacity .5s';
  cv.style.opacity = '0';
  cv.style.pointerEvents = 'none';
  ghost.classList.add('off');
  title.classList.remove('hidden');
  document.getElementById('hint').classList.add('off');
  document.getElementById('actions').hidden = false;
  if (navigator.vibrate) { try { navigator.vibrate([12, 40, 12]); } catch (e) { /* noop */ } }
  document.getElementById('badge').textContent = '✓ ' + BUILD + ' · дымка открыта';
}
cv.addEventListener('pointerdown', function (e) {
  if (done) return;
  e.preventDefault();
  try { cv.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
  ptrs[e.pointerId] = local(e);
  queue.push(ptrs[e.pointerId]);
  if (!touched) { touched = true; document.getElementById('hint').textContent = 'Продолжай тереть…'; }
  schedule();
});
cv.addEventListener('pointermove', function (e) {
  if (done || !ptrs[e.pointerId]) return;
  e.preventDefault();
  var prev = ptrs[e.pointerId], p = local(e);
  var dist = Math.hypot(p.x - prev.x, p.y - prev.y);
  var n = Math.max(1, Math.ceil(dist / (brush.r * 0.3)));
  for (var i = 1; i <= n; i++) {
    queue.push({ x: prev.x + (p.x - prev.x) * i / n, y: prev.y + (p.y - prev.y) * i / n });
  }
  ptrs[e.pointerId] = p;
  schedule();
});
function up(e) { delete ptrs[e.pointerId]; }
cv.addEventListener('pointerup', up);
cv.addEventListener('pointercancel', up);

document.getElementById('again').addEventListener('click', function () {
  done = false;
  touched = false;
  mx.save();
  mx.setTransform(1, 0, 0, 1, 0, 0);
  mx.clearRect(0, 0, mask.width, mask.height);
  mx.restore();
  comp();
  cv.style.transition = '';
  cv.style.opacity = '1';
  cv.style.pointerEvents = '';
  ghost.classList.remove('off');
  title.classList.add('hidden');
  var hint = document.getElementById('hint');
  hint.classList.remove('off');
  hint.textContent = 'Потри экран пальцем';
  document.getElementById('actions').hidden = true;
  document.getElementById('badge').textContent = '✓ ' + BUILD + ' · всё работает';
});

/* --- котик --- */
var cat = document.getElementById('cat');
cat.innerHTML = '<svg viewBox="0 0 220 220" aria-hidden="true">' +
  '<ellipse cx="110" cy="203" rx="72" ry="9" fill="rgba(107,76,46,.14)"/>' +
  '<path d="M158 182 Q198 178 196 142 Q195 122 178 126" fill="none" stroke="#e8a85c" stroke-width="14" stroke-linecap="round"/>' +
  '<path d="M62 198 C50 140 72 104 110 104 C148 104 170 140 158 198 Z" fill="#e8a85c"/>' +
  '<ellipse cx="110" cy="172" rx="30" ry="26" fill="#f7dfc0"/>' +
  '<path d="M78 58 L64 20 L104 44 Z" fill="#e8a85c"/><path d="M142 58 L156 20 L116 44 Z" fill="#e8a85c"/>' +
  '<circle cx="110" cy="88" r="44" fill="#e8a85c"/>' +
  '<path d="M88 84 q7 9 14 0" fill="none" stroke="#3a2210" stroke-width="4" stroke-linecap="round"/>' +
  '<path d="M118 84 q7 9 14 0" fill="none" stroke="#3a2210" stroke-width="4" stroke-linecap="round"/>' +
  '<ellipse cx="82" cy="97" rx="8" ry="4.5" fill="#e2857f" opacity=".5"/>' +
  '<ellipse cx="138" cy="97" rx="8" ry="4.5" fill="#e2857f" opacity=".5"/>' +
  '<path d="M105 95 L115 95 L110 101 Z" fill="#d97b7b"/>' +
  '<path d="M110 101 q-6 7 -12 2" fill="none" stroke="#3a2210" stroke-width="3" stroke-linecap="round"/>' +
  '<path d="M110 101 q6 7 12 2" fill="none" stroke="#3a2210" stroke-width="3" stroke-linecap="round"/>' +
  '</svg><div class="hearts"></div>';
var cPtrs = Object.create(null), cAcc = Object.create(null), pets = 0;
var HEART = '<svg viewBox="0 0 24 24"><path d="M12 21s-7.6-4.9-10.1-9.3C.1 8.3 2 4.9 5.4 4.9c2.1 0 3.7 1.2 6.6 4.1 2.9-2.9 4.5-4.1 6.6-4.1 3.4 0 5.3 3.4 3.5 6.8C19.6 16.1 12 21 12 21z"/></svg>';
function heart() {
  var box = cat.querySelector('.hearts');
  while (box.children.length >= 10) box.firstChild.remove();
  var h = document.createElement('span');
  h.className = 'heart';
  h.style.setProperty('--dx', Math.round((Math.random() * 2 - 1) * 40) + 'px');
  h.innerHTML = HEART;
  box.appendChild(h);
  setTimeout(function () { h.remove(); }, 1100);
}
cat.addEventListener('pointerdown', function (e) {
  e.preventDefault();
  try { cat.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
  var r = cat.getBoundingClientRect();
  cPtrs[e.pointerId] = { x: e.clientX - r.left, y: e.clientY - r.top };
  cAcc[e.pointerId] = 0;
});
cat.addEventListener('pointermove', function (e) {
  if (!cPtrs[e.pointerId]) return;
  e.preventDefault();
  var r = cat.getBoundingClientRect();
  var p = { x: e.clientX - r.left, y: e.clientY - r.top };
  var prev = cPtrs[e.pointerId];
  cAcc[e.pointerId] += Math.hypot(p.x - prev.x, p.y - prev.y);
  cPtrs[e.pointerId] = p;
  while (cAcc[e.pointerId] >= 90) {
    cAcc[e.pointerId] -= 90;
    pets++;
    heart();
    if (navigator.vibrate) { try { navigator.vibrate(8); } catch (err) { /* noop */ } }
    if (pets % 3 === 0) {
      document.getElementById('badge').textContent = '✓ ' + BUILD + ' · кот мурчит (' + pets + ')';
    }
  }
});
function catUp(e) { delete cPtrs[e.pointerId]; delete cAcc[e.pointerId]; }
cat.addEventListener('pointerup', catUp);
cat.addEventListener('pointercancel', catUp);

/* --- запуск --- */
window.addEventListener('resize', function () { resize(); });
resize();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncGhost).catch(function () {});
document.getElementById('badge').textContent = '✓ ' + BUILD + ' · всё работает';
console.info('[apology]', BUILD, 'loaded');
</script>
</body>
</html>
