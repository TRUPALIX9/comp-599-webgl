import type { GameState } from "../../core/GameState";
import type { PlayerSnapshot } from "../../types/GameTypes";

interface UIHandlers {
  onStart(): void;
  onResume(): void;
  onRestart(): void;
  onSelectCampus(): void;
  onSelectGame(): void;
  onSelectArena(): void;
  onBackToMenu(): void;
}



export class UIController {
  private readonly hud: HTMLDivElement;
  private readonly overlay: HTMLDivElement;
  private readonly toast: HTMLDivElement;
  private readonly damage: HTMLDivElement;
  private state: GameState = "menu";

  constructor(private readonly root: HTMLDivElement, private readonly handlers: UIHandlers) {
    root.innerHTML = "";
    this.hud = document.createElement("div");
    this.hud.className = "hud";
    this.overlay = document.createElement("div");
    this.overlay.className = "overlay visible";
    this.toast = document.createElement("div");
    this.toast.className = "toast";
    this.damage = document.createElement("div");
    this.damage.className = "damage-vignette";
    root.append(this.hud, this.overlay, this.toast, this.damage);
    this.renderHud(undefined);
    this.setState("menu");
  }

  setState(state: GameState, snapshot?: PlayerSnapshot): void {
    this.state = state;
    this.renderOverlay(snapshot);
  }

  update(snapshot: PlayerSnapshot): void {
    this.renderHud(snapshot);
  }

  showToast(message: string): void {
    this.toast.textContent = message;
    this.toast.classList.add("visible");
    window.setTimeout(() => this.toast.classList.remove("visible"), 1400);
  }

  flashDamage(): void {
    this.damage.classList.add("flash");
    window.setTimeout(() => this.damage.classList.remove("flash"), 140);
  }

  private renderHud(snapshot?: PlayerSnapshot): void {
    const health01 = snapshot ? snapshot.health / snapshot.maxHealth : 1;
    const boost01 = snapshot ? snapshot.boost / snapshot.maxBoost : 1;
    const heat01 = snapshot ? snapshot.paperHeat / snapshot.maxPaperHeat : 0;
    this.hud.innerHTML = `
      <section class="hud-panel">
        <div class="brand">
          <div class="brand-mark"></div>
          <div>
            <div class="brand-title">Paper Plane Assault</div>
            <div class="brand-subtitle">${snapshot?.waveLabel ?? "desk patrol"}</div>
          </div>
        </div>
        ${this.bar("Health", health01, Math.round(snapshot?.health ?? 100).toString(), "")}
        ${this.bar("Boost", boost01, Math.round(snapshot?.boost ?? 100).toString(), "boost")}
        ${this.bar("Heat", heat01, Math.round(snapshot?.paperHeat ?? 0).toString(), "heat")}
      </section>
      <section class="center-hud"><div class="reticle" aria-label="aim reticle"></div></section>
      <section class="hud-panel score-panel">
        <div class="mini-label">Score</div>
        <div class="score-value">${snapshot?.score ?? 0}</div>
        <div class="ammo-line"><span>Missiles ${snapshot?.missileAmmo ?? 0}</span><span>CD ${(snapshot?.missileCooldown ?? 0).toFixed(1)}</span></div>
        <div class="bar-row"><span class="hud-label">Route</span><div class="bar"><span style="transform:scaleX(${snapshot?.progress01 ?? 0})"></span></div><strong>${Math.round((snapshot?.progress01 ?? 0) * 100)}%</strong></div>
      </section>
    `;
  }

  private renderOverlay(snapshot?: PlayerSnapshot): void {
    const visible = this.state !== "playing";
    this.overlay.classList.toggle("visible", visible);
    if (!visible) {
      this.overlay.innerHTML = "";
      return;
    }

    if (this.state === "title") {
      this.overlay.innerHTML = `
        <div class="title-card">
          <div class="brand-subtitle">Browser WebGL arcade flight</div>
          <h1>Paper Plane Assault</h1>
          <p>Fly a folded paper plane across a giant creative desk. Dodge classroom clutter, shred enemy foldlings with paper dots, and launch pencil missiles when the route gets messy.</p>
          <div class="button-row">
            <button class="ui-button" data-action="start">Start Game</button>
            <button class="ui-button secondary" data-action="restart">Reset Run</button>
            <button class="ui-button secondary" data-action="menu">← Back to Menu</button>
          </div>
          <div class="controls-grid">
            <div class="control-chip">W/S speed</div>
            <div class="control-chip">A/D turn</div>
            <div class="control-chip">Mouse aim</div>
            <div class="control-chip">Space dots</div>
            <div class="control-chip">Q/E missile</div>
            <div class="control-chip">Shift boost</div>
          </div>
        </div>`;
    } else if (this.state === "menu") {
      this.overlay.innerHTML = `
        <div class="menu-screen">
          <div class="menu-header">
            <div class="brand-subtitle">CSUCI · WebGL Experience</div>
            <h1 class="menu-title">Choose Your Experience</h1>
          </div>
          <div class="selection-grid">
            <div class="selection-card">
              <div class="icon">&#x1F3DB;&#xFE0F;</div>
              <h2>CSUCI Campus</h2>
              <p>A dedicated 3D campus explorer. Fly freely over buildings, the Bell Tower, Broome Library, and the University Mall. No combat &mdash; just the campus.</p>
              <button class="ui-button" id="btn-campus" data-action="campus">Explore Campus</button>
            </div>
            <div class="selection-card">
              <div class="icon">&#x2694;&#xFE0F;</div>
              <h2>Plane vs AI</h2>
              <p>1-vs-1 arena battle against an AI opponent in a square arena filled with detailed obstacles: books, bags, tables, lamps, pipes, and water bottles.</p>
              <button class="ui-button" id="btn-arena" data-action="arena">Fight AI</button>
            </div>
            <div class="selection-card">
              <div class="icon">&#x2708;&#xFE0F;</div>
              <h2>Paper Plane Assault</h2>
              <p>Classic wave combat over the campus. Fight foldlings, darts, gliders, and the boss kite across 6 waves.</p>
              <button class="ui-button" id="btn-game" data-action="game">Start Mission</button>
            </div>
            <div class="selection-card">
              <div class="icon">&#x1F3D9;&#xFE0F;</div>
              <h2>City Roaming Lab</h2>
              <p>Navigate a generated city while the renderer reports culled geometry, tile cache state, and prefetch targets.</p>
              <button class="ui-button" id="btn-city" data-action="city">Open Lab</button>
            </div>
            <div class="selection-card">
              <div class="icon">&#x1F4E1;</div>
              <h2>Situation Display Lab</h2>
              <p>A simulated data stream drives a WebGL terrain view, 2D map, entity tracks, layer controls, and replay.</p>
              <button class="ui-button" id="btn-situation" data-action="situation">Open Lab</button>
            </div>
            <div class="selection-card">
              <div class="icon">&#x1F6F0;&#xFE0F;</div>
              <h2>OrbitScope</h2>
              <p>Real-time 3D satellite tracker. Search any satellite, visualize its orbit, and scrub through time.</p>
              <button class="ui-button" id="btn-orbit" data-action="orbit">Launch Tracker</button>
            </div>
          </div>
        </div>`;
    } else {
      const heading = this.state === "paused" ? "Paused" : this.state === "victory" ? "Victory Run" : "Plane Down";
      const body = this.state === "victory"
        ? `You reached the final campus gate with ${snapshot?.score ?? 0} points.`
        : this.state === "gameOver"
          ? `Final score: ${snapshot?.score ?? 0}. Ready for another run?`
          : "Take a breath, then dive back in.";
      this.overlay.innerHTML = `
        <div class="overlay-card">
          <h2>${heading}</h2>
          <p>${body}</p>
          <div class="button-row">
            ${this.state === "paused" ? '<button class="ui-button" data-action="resume">Resume</button>' : ""}
            <button class="ui-button secondary" data-action="restart">Restart</button>
            <button class="ui-button secondary" data-action="menu">&#x2190; Main Menu</button>
          </div>
        </div>`;
    }

    this.overlay.querySelectorAll<HTMLButtonElement>("button[data-action]").forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        const action = button.dataset.action;
        if (action === "start") this.handlers.onStart();
        if (action === "resume") this.handlers.onResume();
        if (action === "restart") this.handlers.onRestart();
        if (action === "campus") this.handlers.onSelectCampus();
        if (action === "game") this.handlers.onSelectGame();
        if (action === "arena") this.handlers.onSelectArena();
        if (action === "menu") this.handlers.onBackToMenu();
        if (action === "city") window.open("webgl-showcase/city-roaming/index.html", "_blank");
        if (action === "situation") window.open("webgl-showcase/situation-display/index.html", "_blank");
        if (action === "orbit") window.open("orbit-scope/index.html", "_blank");
      });
    });
  }

  private bar(label: string, value01: number, value: string, className: string): string {
    const clamped = Math.max(0, Math.min(1, value01));
    return `<div class="bar-row"><span class="hud-label">${label}</span><div class="bar ${className}"><span style="transform:scaleX(${clamped})"></span></div><strong>${value}</strong></div>`;
  }
}
