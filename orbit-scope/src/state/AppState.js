/**
 * OrbitScope — Application State
 * Simple observable state store. No framework dependencies.
 * Components subscribe to change notifications via onChange().
 */

const INITIAL = {
  // Search
  query:          '',
  searchResults:  [],

  // Satellite selection
  selectedSat:    null,  // { name, id, category } from catalog
  tleData:        null,  // { name, tle1, tle2, fetchedAt, source }
  satrec:         null,  // satellite.js record

  // Time
  selectedTime:   new Date(),
  isPlaying:      false,

  // Computed position
  position:       null,  // { lat, lon, altKm, eci, vel }
  orbitPath:      [],    // Array<{ lat, lon, altKm } | null>

  // UI
  status:         'idle',   // 'idle' | 'loading' | 'error' | 'ready'
  errorMessage:   '',
  dataSource:     '',       // 'live' | 'cache' | 'fallback'
};

class AppState {
  #state = { ...INITIAL };
  #listeners = new Set();

  /** Subscribe to any state change. Returns an unsubscribe function. */
  onChange(fn) {
    this.#listeners.add(fn);
    return () => this.#listeners.delete(fn);
  }

  /** Notify all listeners. */
  #notify() {
    const snap = this.snapshot();
    this.#listeners.forEach(fn => fn(snap));
  }

  /** Get a frozen snapshot of current state. */
  snapshot() {
    return Object.freeze({ ...this.#state });
  }

  // ── Setters ──────────────────────────────────────────────────────────────

  set(partial) {
    Object.assign(this.#state, partial);
    this.#notify();
  }

  setQuery(q)            { this.set({ query: q }); }
  setResults(r)          { this.set({ searchResults: r }); }
  setSelectedSat(s)      { this.set({ selectedSat: s }); }
  setTLE(t)              { this.set({ tleData: t }); }
  setSatrec(r)           { this.set({ satrec: r }); }
  setPosition(p)         { this.set({ position: p }); }
  setOrbitPath(pts)      { this.set({ orbitPath: pts }); }
  setTime(t)             { this.set({ selectedTime: t }); }
  setPlaying(v)          { this.set({ isPlaying: v }); }
  setStatus(s, msg = '') { this.set({ status: s, errorMessage: msg }); }
  setDataSource(src)     { this.set({ dataSource: src }); }

  resetToNow()           { this.setTime(new Date()); }
}

// Singleton exported for the whole app
export const state = new AppState();
