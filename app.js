/* app.js — DeckController + bootstrap + selftest */
function pillBtn(t) {
  const b = document.createElement('button');
  b.className = 'pill pill-btn';
  b.textContent = t;
  return b;
}

class DeckController {
  constructor() {
    this.i = 0; this.effect = null; this.cat = null;
    this.purr = createPurrAudio();
    this.muted = false;
    this.r = {
      scene: $('scene'), stage: $('stage'), hint: $('hint'), hintText: $('hint-text'),
      meterFill: $('meter-fill'), skip: $('btn-skip'), sound: $('btn-sound'),
      reload: $('btn-reload'), restart: $('btn-restart'), finale: $('finale'),
      live: $('live'), loader: $('loader'), empty: $('state-empty')
    };
  }
  start() {
    const r = this.r;
    const missing = Object.keys(r).filter((k) => !r[k]);
    if (missing.length) { showError('Не найдены элементы: ' + missing.join(', ') + '. Проверь, что index.html вставлен целиком.'); return; }
    if (typeof EFFECTS === 'undefined') { showError('Не загружен реестр EFFECTS (effects-cat.js обрезан или отсутствует).'); return; }
    if (!DECK.cards.length) { r.scene.dataset.state = 'empty'; r.empty.classList.remove('hidden'); return; }
    if (DECK.cards.length !== 8) { showError('DECK.cards.length = ' + DECK.cards.length + ', ожидалось 8.'); return; }
    r.loader.classList.add('hidden');
    r.scene.dataset.state = 'ready';
    this.buildControls();
    this.bindUi();
    this.showCard(0);
  }
  buildControls() {
    this.controls = document.createElement('div');
    this.controls.className = 'controls hidden';
    this.btnAgain = pillBtn('Ещё раз');
    this.btnNext = pillBtn('Дальше');
    this.controls.appendChild(this.btnAgain);
    this.controls.appendChild(this.btnNext);
    this.r.scene.appendChild(this.controls);
    this.btnAgain.addEventListener('click', () => this.replay());
    this.btnNext.addEventListener('click', () => this.next());
  }
  bindUi() {
    this.r.skip.addEventListener('click', () => { if (this.effect) this.effect.revealNow(); });
    this.r.sound.addEventListener('click', () => {
      this.muted = !this.muted;
      this.purr.mute(this.muted);
      this.r.sound.textContent = this.muted ? '🔇' : '🔊';
      this.r.sound.setAttribute('aria-pressed', String(!this.muted));
    });
    this.r.reload.addEventListener('click', () => location.reload());
    this.r.restart.addEventListener('click', () => {
      this.r.finale.classList.add('hidden');
      this.showCard(0);
    });
  }
  showCard(i) {
    this.clearCard();
    this.i = i;
    const card = DECK.cards[i];
    const r = this.r;
    const wrap = document.createElement('section');
    wrap.className = 'card';
    wrap.setAttribute('data-reveal', card.effect);
    const over = document.createElement('p');
    over.className = 'card__over';
    over.textContent = card.subtitle;
    const title = document.createElement('h2');
    title.className = 'card__title';
    title.id = 'card-title';
    title.textContent = card.title;
    const body = document.createElement('div');
    body.className = 'card__body';
    body.id = 'card-body';
    wrap.appendChild(over);
    wrap.appendChild(title);
    wrap.appendChild(body);
    r.stage.appendChild(wrap);
    this.cardWrap = wrap;
    this.bodyEl = body;
    const ctx = {
      card: card, cardEl: wrap, bodyEl: body, titleEl: title, purr: this.purr,
      hint: (t) => { r.hintText.textContent = t; },
      onProgress: (p) => this.setProgress(p),
      onComplete: () => this.onRevealed(),
      onFirstTouch: () => {}
    };
    const Cls = EFFECTS[card.effect];
    if (!Cls) { showError('Нет эффекта: ' + card.effect); return; }
    this.effect = new Cls(ctx);
    this.effect.mount();
    if (card.cat && card.effect !== 'cat-gate') {
      this.cat = new CatCompanion({ side: card.cat, purr: this.purr });
      this.cat.mount(r.stage);
    }
    r.hint.classList.remove('hidden');
    this.controls.classList.add('hidden');
    r.live.textContent = 'Карточка ' + (i + 1) + ' из 8: ' + card.title;
    this.setProgress(0);
  }
  setProgress(p) {
    this.r.meterFill.style.width = (((this.i + clamp(p, 0, 1)) / 8) * 100) + '%';
  }
  onRevealed() {
    this.setProgress(1);
    this.controls.classList.remove('hidden');
    this.r.hint.classList.add('hidden');
    this.btnNext.textContent = this.i === 7 ? 'Конец ❤️' : 'Дальше';
    if (this.bodyEl) {
      this.bodyEl.setAttribute('tabindex', '-1');
      this.bodyEl.focus({ preventScroll: true });
    }
  }
  replay() {
    if (!this.effect) return;
    this.effect.reset();
    this.controls.classList.add('hidden');
    this.r.hint.classList.remove('hidden');
    this.setProgress(0);
  }
  next() {
    if (this.i >= 7) {
      this.clearCard();
      this.r.hint.classList.add('hidden');
      this.controls.classList.add('hidden');
      this.purr.set(0);
      this.r.finale.classList.remove('hidden');
      this.r.meterFill.style.width = '100%';
      this.r.scene.dataset.state = 'finale';
      Host.haptic('heavy');
      return;
    }
    this.showCard(this.i + 1);
  }
  clearCard() {
    if (this.effect) { this.effect.destroy(); this.effect = null; }
    if (this.cat) { this.cat.destroy(); this.cat = null; }
    if (this.cardWrap) { this.cardWrap.remove(); this.cardWrap = null; }
  }
}

(function () {
  function selfTest() {
    setTimeout(() => {
      const fx = (typeof EFFECTS !== 'undefined') ? EFFECTS : {};
      const need = ['fog', 'envelope', 'typewriter', 'polaroid', 'steps', 'scroll', 'cat-gate', 'compass'];
      const miss = need.filter((k) => !fx[k]);
      const proto = ['mount', 'reset', 'revealNow', 'destroy'];
      const bad = need.filter((k) => fx[k] && proto.some((m) => typeof fx[k].prototype[m] !== 'function'));
      const rep = [
        'refs:' + (document.getElementById('scene') ? 'ok' : 'fail'),
        'cards:' + DECK.cards.length,
        miss.length ? 'miss:' + miss.join(',') : 'fx:8/8',
        bad.length ? 'contract:' + bad.join(',') : 'contract:ok'
      ];
      const d = document.createElement('div');
      d.className = 'overlay';
      d.style.background = '#2f6b3f';
      d.style.zIndex = '90';
      d.textContent = 'SELFTEST ' + rep.join(' | ');
      document.body.appendChild(d);
      setTimeout(() => d.remove(), 6000);
    }, 1200);
  }
  const run = () => {
    const dc = new DeckController();
    window.__deck = dc;
    dc.start();
    window.__apologyBooted = true;
    if (location.search.indexOf('test=1') > -1) selfTest();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
