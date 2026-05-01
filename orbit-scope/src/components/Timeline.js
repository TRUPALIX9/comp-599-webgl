/**
 * OrbitScope — Timeline Component
 * Bottom time scrubber with drag, play/pause, reset-to-now, and tick marks.
 * Self-contained DOM component — no framework dependency.
 */

import { TIMELINE } from '../config.js';
import { formatDateUTC, formatDelta } from '../lib/format.js';

export class Timeline {
  /** @type {Date} */   #time;
  /** @type {boolean} */ #dragging = false;
  /** @type {number} */  #dragStartX = 0;
  /** @type {Date} */    #dragStartTime;
  /** @type {Function} */ #onChange;

  /**
   * @param {HTMLElement} container
   * @param {Date} initialTime
   * @param {(date: Date) => void} onChange
   */
  constructor(container, initialTime, onChange) {
    this.#time    = initialTime;
    this.#onChange = onChange;
    this._build(container);
    this._render();
  }

  // ── Public API ────────────────────────────────────────────────────────────

  setTime(date) {
    this.#time = date;
    this._render();
  }

  getTime() { return new Date(this.#time); }

  // ── DOM Build ─────────────────────────────────────────────────────────────

  _build(container) {
    container.innerHTML = `
      <div class="tl-wrap" id="tl-wrap">
        <div class="tl-controls">
          <button class="tl-btn" id="tl-rewind" title="−10 min">⏮</button>
          <button class="tl-btn tl-play" id="tl-play" title="Play">▶</button>
          <button class="tl-btn" id="tl-forward" title="+10 min">⏭</button>
          <button class="tl-btn tl-now" id="tl-now" title="Jump to Now">⊙ Now</button>
        </div>

        <div class="tl-scrubber-area">
          <div class="tl-track" id="tl-track">
            <canvas class="tl-canvas" id="tl-canvas"></canvas>
            <div class="tl-needle"></div>
          </div>
          <div class="tl-timestamp" id="tl-timestamp"></div>
          <div class="tl-delta" id="tl-delta"></div>
        </div>
      </div>
    `;

    this._canvas   = container.querySelector('#tl-canvas');
    this._track    = container.querySelector('#tl-track');
    this._tsEl     = container.querySelector('#tl-timestamp');
    this._deltaEl  = container.querySelector('#tl-delta');
    this._playBtn  = container.querySelector('#tl-play');

    container.querySelector('#tl-play').addEventListener('click', () => this._onPlayPause());
    container.querySelector('#tl-now').addEventListener('click', () => this._onNow());
    container.querySelector('#tl-rewind').addEventListener('click', () => this._step(-10));
    container.querySelector('#tl-forward').addEventListener('click', () => this._step(+10));

    // Drag on the track
    this._track.addEventListener('mousedown', e => this._onDragStart(e));
    window.addEventListener('mousemove', e => this._onDragMove(e));
    window.addEventListener('mouseup', () => this._onDragEnd());

    // Touch support
    this._track.addEventListener('touchstart', e => this._onDragStart(e.touches[0]), { passive: true });
    window.addEventListener('touchmove', e => this._onDragMove(e.touches[0]), { passive: true });
    window.addEventListener('touchend', () => this._onDragEnd());

    // Resize observer to redraw ticks
    new ResizeObserver(() => this._render()).observe(this._track);

    this._playing = false;
    this._animId  = null;
  }

  // ── Rendering ─────────────────────────────────────────────────────────────

  _render() {
    this._tsEl.textContent  = formatDateUTC(this.#time);
    this._deltaEl.textContent = formatDelta(this.#time - Date.now());
    this._drawTicks();
  }

  _drawTicks() {
    const canvas = this._canvas;
    const w = this._track.clientWidth;
    const h = this._track.clientHeight || 52;
    canvas.width  = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);

    const windowMs   = TIMELINE.windowMinutes * 60 * 1000;
    const nowMs      = Date.now();
    const centerMs   = this.#time.getTime();
    const halfW      = w / 2;
    const msPerPx    = windowMs / w;

    // Draw tick marks every 10 minutes
    const tickIntervalMs = 10 * 60 * 1000;
    const firstTickMs = Math.ceil((centerMs - windowMs / 2) / tickIntervalMs) * tickIntervalMs;

    ctx.font      = '10px "Inter", monospace';
    ctx.textAlign = 'center';

    for (let tMs = firstTickMs; tMs <= centerMs + windowMs / 2; tMs += tickIntervalMs) {
      const x = halfW + (tMs - centerMs) / msPerPx;
      const isMajor = (tMs / (60 * 60 * 1000)) % 1 === 0; // every hour
      const isNow   = Math.abs(tMs - nowMs) < tickIntervalMs / 2;

      ctx.strokeStyle = isNow ? '#00d4ff' : (isMajor ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)');
      ctx.lineWidth   = isNow ? 2 : 1;

      ctx.beginPath();
      ctx.moveTo(x, isMajor ? 0 : h * 0.35);
      ctx.lineTo(x, h);
      ctx.stroke();

      if (isMajor) {
        const d = new Date(tMs);
        const label = `${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}`;
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.fillText(label, x, 12);
      }
    }

    // "Now" dot on the track
    const nowX = halfW + (nowMs - centerMs) / msPerPx;
    if (nowX >= 0 && nowX <= w) {
      ctx.fillStyle = '#00d4ff';
      ctx.beginPath();
      ctx.arc(nowX, h / 2, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Interaction ───────────────────────────────────────────────────────────

  _onDragStart(e) {
    this.#dragging      = true;
    this.#dragStartX    = e.clientX;
    this.#dragStartTime = new Date(this.#time);
    this._track.classList.add('dragging');
  }

  _onDragMove(e) {
    if (!this.#dragging) return;
    const dx        = e.clientX - this.#dragStartX;
    const windowMs  = TIMELINE.windowMinutes * 60 * 1000;
    const msPerPx   = windowMs / this._track.clientWidth;
    const newTime   = new Date(this.#dragStartTime.getTime() - dx * msPerPx);
    this.#time = newTime;
    this._render();
    this.#onChange(new Date(this.#time));
  }

  _onDragEnd() {
    if (!this.#dragging) return;
    this.#dragging = false;
    this._track.classList.remove('dragging');
  }

  _onPlayPause() {
    this._playing = !this._playing;
    this._playBtn.textContent = this._playing ? '⏸' : '▶';
    this._playBtn.classList.toggle('active', this._playing);
    if (this._playing) this._startAnim();
    else               this._stopAnim();
  }

  _onNow() {
    this.#time = new Date();
    this._render();
    this.#onChange(new Date(this.#time));
  }

  _step(minutes) {
    this.#time = new Date(this.#time.getTime() + minutes * 60 * 1000);
    this._render();
    this.#onChange(new Date(this.#time));
  }

  _startAnim() {
    const fps     = TIMELINE.animFps;
    const stepMs  = TIMELINE.playStepMs;
    let last      = performance.now();

    const tick = (now) => {
      if (!this._playing) return;
      if (now - last >= 1000 / fps) {
        this.#time = new Date(this.#time.getTime() + stepMs);
        this._render();
        this.#onChange(new Date(this.#time));
        last = now;
      }
      this._animId = requestAnimationFrame(tick);
    };
    this._animId = requestAnimationFrame(tick);
  }

  _stopAnim() {
    if (this._animId) cancelAnimationFrame(this._animId);
    this._animId = null;
  }
}
