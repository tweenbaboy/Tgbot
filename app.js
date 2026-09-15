'use strict';
/* ============================================================
   app.js — сборка v2.3-single (модуль 6/6).
   Контроллер колоды (переключение карточек, состояния, финал)
   и точка запуска приложения.
   ============================================================ */

class DeckController {
  constructor({ refs, deck, logger, host, audio }) {
    this.refs = refs;
    this.deck = deck;
    this.logger = logger;
    this.host = host;
    this.audio = audio;
    this.index = 0;
    this.state = 'idle';
    this.effect = null;
    this.companion = null;
    this.btnNext = null;
    this.btnReplay = null;
    this.reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.events = [];
    this._skip = this._skip.bind(this);
    this._sound = this._sound.bind(this);
    this._restart = this._restart.bind(this);
    this._keys = this._keys.bind(this);
  }
  get card() { return this.deck.cards[this.index]; }
  get isLast() { return this.index === this.deck.cards.length - 1; }
  track(type, payload) {
    this.events.push({ type, at: Date.now(), payload });
    this.logger.debug('event', type);
  }
  async start() {
    this._validate();
    this._setState('loading');
    this._bindGlobal();
    this.host.ready();
    await this._fonts();
    const q = new URLSearchParams(location.search);
    const n = parseInt(q.get('card'), 10);
    if (Number.isInteger(n) && n >= 1) {
      this.index = clamp(n - 1, 0, this.deck.cards.length - 1);
    }
    this.renderCard();
  }
  _validate() {
    if (!Array.isArray(this.deck.cards) || this.deck.cards.length === 0) {
      throw new Error('В колоде нет карточек');
    }
    for (const c of this.deck.cards) {
      if (!c.id || !c.title || !Array.isArray(c.paragraphs)) {
        throw new Error('Карточка ' + (c.id || '?') + ' повреждена');
      }
      if (!EFFECTS[c.reveal && c.reveal.type]) {
        throw new Error('Неизвестный переход: ' + (c.reveal && c.reveal.type));
      }
    }
  }
  async _fonts() {
    try {
      if (document.fonts && document.fonts.ready) {
        await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2200))]);
      }
    } catch (e) { this.logger.warn('fonts', e); }
  }
  _bindGlobal() {
    this.refs.skip.addEventListener('click', this._skip);
    this.refs.sound.addEventListener('click', this._sound);
    this.refs.restart.addEventListener('click', this._restart);
    this.refs.reload.addEventListener('click', () => location.reload());
    window.addEventListener('keydown', this._keys);
  }
  _keys(e) {
    if (e.key === 'ArrowRight' && this.state === 'revealed') this._next();
  }
  _setState(s) {
    this.state = s;
    this.refs.scene.dataset.state = s;
  }
  _announce(msg) { this.refs.live.textContent = msg; }
  renderCard() {
    const card = this.card;
    if (this.effect) { this.effect.destroy(); this.effect = null; }
    if (this.companion) { this.companion.destroy(); this.companion = null; }
    this.refs.scene.dataset.reveal = card.reveal.type;
    this.refs.stage.replaceChildren();
    this.refs.stage.classList.remove('is-out', 'touch-drag');

    const article = document.createElement('article');
    article.className = 'card';
    const media = document.createElement('div');
    media.className = 'card__media';
    const eyebrow = document.createElement('p');
    eyebrow.className = 'card__eyebrow';
    eyebrow.textContent = card.eyebrow || '';
    const title = document.createElement('h1');
    title.className = 'card__title';
    title.id = 'card-title';
    title.textContent = card.title;
    const body = document.createElement('div');
    body.className = 'card__body';
    body.id = 'card-body';
    body.tabIndex = -1;
    const paragraphs = card.paragraphs.map((text, i) => {
      const p = document.createElement('p');
      p.textContent = text;
      if (i === card.paragraphs.length - 1) p.classList.add('is-emphasised');
      body.appendChild(p);
      return p;
    });
    const actions = document.createElement('div');
    actions.className = 'card__actions';
    this.btnNext = document.createElement('button');
    this.btnNext.type = 'button';
    this.btnNext.className = 'btn btn--primary';
    this.btnNext.textContent = this.isLast ? 'Конец ❤️' : 'Дальше';
    this.btnNext.hidden = true;
    this.btnNext.addEventListener('click', () => this._next());
    this.btnReplay = document.createElement('button');
    this.btnReplay.type = 'button';
    this.btnReplay.className = 'btn btn--quiet';
    this.btnReplay.textContent = 'Ещё раз';
    this.btnReplay.hidden = true;
    this.btnReplay.addEventListener('click', () => this._replay());
    actions.appendChild(this.btnNext);
    actions.appendChild(this.btnReplay);

    article.append(media, eyebrow, title, body, actions);

    let catSlot = null;
    if (card.reveal.type !== 'cat' && card.cat) {
      catSlot = document.createElement('div');
      catSlot.className = 'cat-slot cat-slot--sm cat-slot--' + card.cat;
      title.insertAdjacentElement('afterend', catSlot);
    }

    this.refs.stage.appendChild(article);

    if (paragraphs.length === 0) {
      this._setState('empty');
      this.refs.empty.hidden = false;
      return;
    }
    this.refs.empty.hidden = true;

    this.ctx = {
      scene: this.refs.scene, stage: this.refs.stage, card: article,
      title, body, paragraphs, media, catSlot,
      reducedMotion: this.reducedMotion, host: this.host, audio: this.audio, logger: this.logger,
      onFirstTouch: () => this._firstTouch(),
      onProgress: (r) => this._progress(r),
      onComplete: () => this._complete()
    };

    this.refs.hintText.textContent = card.reveal.hint || '';
    this.refs.hint.dataset.hidden = 'false';
    this.refs.skip.hidden = false;
    this.refs.meter.dataset.active = 'false';
    this.refs.meterFill.style.width = '0%';

    const Cls = EFFECTS[card.reveal.type];
    this.effect = new Cls(this.ctx, card.reveal).mount();

    if (catSlot) {
      this.companion = new CatCompanion(catSlot, {
        small: true, reducedMotion: this.reducedMotion, host: this.host, audio: this.audio
      }).mount();
    }

    this._setState('ready');
    this._announce(card.reveal.hint || '');
    this.track('card:shown', { cardId: card.id, index: this.index, reveal: card.reveal.type });
    this.logger.info('build', BUILD, '| card', card.id, card.reveal.type);

    if (new URLSearchParams(location.search).get('reveal') === '1') this.effect.revealNow();
  }
  _firstTouch() {
    this.refs.hint.dataset.hidden = 'true';
    this.refs.meter.dataset.active = 'true';
    this.host.impact('light');
  }
  _progress(r) {
    this.refs.meter.dataset.active = 'true';
    this.refs.meterFill.style.width = Math.round(clamp(r, 0, 1) * 100) + '%';
  }
  _complete() {
    this._setState('revealed');
    this.host.notify('success');
    this.refs.skip.hidden = true;
    this.refs.meter.dataset.active = 'false';
    this.btnNext.hidden = false;
    this.btnReplay.hidden = false;
    this._announce('Открыто. ' + this.card.title);
    this.track('card:revealed', { cardId: this.card.id, index: this.index });
    setTimeout(() => {
      if (this.state === 'revealed') {
        try { this.ctx.body.focus({ preventScroll: true }); } catch { /* noop */ }
      }
    }, this.reducedMotion ? 0 : 460);
  }
  _skip() {
    if (!this.effect || this.state === 'revealed') return;
    this.host.impact('medium');
    this.track('card:skipped', { cardId: this.card.id });
    this.effect.revealNow();
  }
  _replay() {
    if (!this.effect) return;
    this.effect.reset();
    this.btnNext.hidden = true;
    this.btnReplay.hidden = true;
    this.refs.skip.hidden = false;
    this.refs.hint.dataset.hidden = 'false';
    this.refs.meter.dataset.active = 'false';
    this.refs.meterFill.style.width = '0%';
    this._setState('ready');
    this._announce(this.card.reveal.hint || '');
  }
  _next() {
    if (this.state !== 'revealed') return;
    if (this.isLast) {
      this.refs.finale.hidden = false;
      this.refs.restart.focus();
      this.track('deck:finished', {});
      return;
    }
    this.refs.stage.classList.add('is-out');
    setTimeout(() => {
      this.index += 1;
      this.renderCard();
    }, this.reducedMotion ? 0 : 220);
  }
  _restart() {
    this.refs.finale.hidden = true;
    this.index = 0;
    this.renderCard();
  }
  _sound() {
    const muted = !this.audio.muted;
    this.audio.setMuted(muted);
    this.refs.sound.textContent = muted ? '🔇' : '🔊';
    this.refs.sound.setAttribute('aria-pressed', String(!muted));
    this.refs.sound.setAttribute('aria-label', muted ? 'Звук мурчания: выключен' : 'Звук мурчания: включён');
  }
  fail(error) {
    this.logger.error('fatal', error);
    showFatal('Не удалось подготовить историю: ' +
      (error && error.message ? error.message : 'неизвестная ошибка'));
  }
}

/* ================= bootstrap ================= */
(function bootstrap() {
  const logger = createLogger('[apology]');
  const refs = {
    scene: document.getElementById('scene'),
    stage: document.getElementById('stage'),
    hint: document.getElementById('hint'),
    hintText: document.getElementById('hint-text'),
    meter: document.getElementById('meter'),
    meterFill: document.getElementById('meter-fill'),
    skip: document.getElementById('btn-skip'),
    sound: document.getElementById('btn-sound'),
    restart: document.getElementById('btn-restart'),
    reload: document.getElementById('btn-reload'),
    error: document.getElementById('state-error'),
    errorText: document.getElementById('state-error-text'),
    empty: document.getElementById('state-empty'),
    finale: document.getElementById('finale'),
    live: document.getElementById('live')
  };
  const missing = Object.entries(refs).filter(([, el]) => !el).map(([k]) => k);
  if (missing.length) {
    window.__apologyBooted = true;
    showFatal('Страница повреждена: не найдены элементы ' + missing.join(', ') +
      '. Проверь, что index.html вставлен целиком.');
    return;
  }
  if (!Array.isArray(DECK.cards) || DECK.cards.length !== 8) {
    window.__apologyBooted = true;
    showFatal('Файл core.js повреждён: карточек найдено ' +
      (Array.isArray(DECK.cards) ? DECK.cards.length : 0) + ', должно быть 8.');
    return;
  }
  const host = createHost(logger);
  const audio = createPurrAudio(logger);
  const controller = new DeckController({ refs, deck: DECK, logger, host, audio });
  try {
    controller.start().catch((e) => controller.fail(e));
  } catch (e) {
    controller.fail(e);
  }
  window.__apologyBooted = true;
})();
