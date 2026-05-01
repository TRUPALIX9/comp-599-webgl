/**
 * OrbitScope — Main App Coordinator
 * Wires together: state, search, propagation, Cesium, timeline, and UI panels.
 */

import { SATELLITE_CATALOG } from './config.js';
import { fetchTLE, searchCatalog } from './api/celestrak.js';
import { parseTLE, propagate, sampleFullOrbit, speedKmS } from './lib/propagation.js';
import {
  initViewer, updateSatelliteMarker, updateOrbitPath,
  updateGroundTrack, clearOrbitEntities, flyToSatellite,
} from './lib/cesiumHelpers.js';
import { Timeline } from './components/Timeline.js';
import { state } from './state/AppState.js';
import {
  formatLat, formatLon, formatAlt, formatSpeed, formatDateUTC,
} from './lib/format.js';

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

// ─── Globals ──────────────────────────────────────────────────────────────────
let viewer;
let timeline;

// ─── Init ─────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  viewer   = initViewer('cesium-container');
  timeline = new Timeline($('timeline-container'), new Date(), onTimeChange);

  setupSearch();
  setupStateListener();
  setStatus('idle');

  // Quick-launch chips
  document.addEventListener('orbitscope:select', e => loadSatellite(e.detail));
});

// ─── State Listener — drives all UI from state ────────────────────────────────
function setupStateListener() {
  state.onChange(snap => {
    renderMetaPanel(snap);
    renderStatusBar(snap);
    if (snap.status === 'ready' && snap.position && snap.selectedSat) {
      updateSatelliteMarker(viewer, snap.position, snap.selectedSat.name);
    }
  });
}

// ─── Search ──────────────────────────────────────────────────────────────────
function setupSearch() {
  const input   = $('search-input');
  const results = $('search-results');

  input.addEventListener('input', () => {
    const q = input.value;
    state.setQuery(q);
    const hits = searchCatalog(q, SATELLITE_CATALOG);
    state.setResults(hits);
    renderResults(hits, results);
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') { results.innerHTML = ''; results.hidden = true; }
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('#search-panel')) {
      results.innerHTML = '';
      results.hidden = true;
    }
  });
}

function renderResults(hits, container) {
  container.innerHTML = '';
  if (!hits.length) {
    container.hidden = true;
    return;
  }
  container.hidden = false;
  hits.forEach(sat => {
    const li = document.createElement('li');
    li.className = 'result-item';
    li.innerHTML = `
      <span class="res-name">${sat.name}</span>
      <span class="res-meta">${sat.category} · ${sat.id}</span>
    `;
    li.addEventListener('click', () => {
      $('search-input').value = sat.name;
      container.innerHTML = '';
      container.hidden = true;
      loadSatellite(sat);
    });
    container.appendChild(li);
  });
}

// ─── Satellite Loading ────────────────────────────────────────────────────────
async function loadSatellite(sat) {
  state.setSelectedSat(sat);
  state.setStatus('loading');
  clearOrbitEntities(viewer);

  try {
    const tle = await fetchTLE(sat.id);
    state.setTLE(tle);
    state.setDataSource(tle.source);

    const satrec = parseTLE(tle.tle1, tle.tle2);
    state.setSatrec(satrec);

    // Compute position and orbit path for current timeline time
    computeAndRender(satrec, state.snapshot().selectedTime);
    state.setStatus('ready');
    $('meta-panel').hidden = false;

  } catch (err) {
    state.setStatus('error', err.message);
    $('meta-panel').hidden = true;
  }
}

// ─── Position + Path Computation ─────────────────────────────────────────────
function computeAndRender(satrec, date) {
  const pos = propagate(satrec, date);
  if (!pos) {
    state.setStatus('error', 'Propagation failed — TLE may be too outdated.');
    return;
  }
  state.setPosition(pos);

  const path = sampleFullOrbit(satrec, date);
  state.setOrbitPath(path);

  updateOrbitPath(viewer, path);
  updateGroundTrack(viewer, path);
  updateSatelliteMarker(viewer, pos, state.snapshot().selectedSat.name);
  flyToSatellite(viewer, pos);
}

// ─── Timeline Callback ────────────────────────────────────────────────────────
function onTimeChange(date) {
  state.setTime(date);
  const snap = state.snapshot();
  if (!snap.satrec) return;
  const pos = propagate(snap.satrec, date);
  if (!pos) return;
  state.setPosition(pos);
  updateSatelliteMarker(viewer, pos, snap.selectedSat.name);
}

// ─── UI Rendering ─────────────────────────────────────────────────────────────
function renderMetaPanel(snap) {
  if (!snap.selectedSat) return;
  const pos = snap.position;
  const tle = snap.tleData;

  $('mp-name').textContent     = snap.selectedSat.name;
  $('mp-id').textContent       = snap.selectedSat.id;
  $('mp-category').textContent = snap.selectedSat.category;
  $('mp-time').textContent     = formatDateUTC(snap.selectedTime);
  $('mp-lat').textContent      = pos ? formatLat(pos.lat)          : '—';
  $('mp-lon').textContent      = pos ? formatLon(pos.lon)          : '—';
  $('mp-alt').textContent      = pos ? formatAlt(pos.altKm)        : '—';
  $('mp-spd').textContent      = pos ? formatSpeed(speedKmS(pos.vel)) : '—';
  $('mp-src').textContent      = snap.dataSource || '—';
  $('mp-fetched').textContent  = tle?.fetchedAt ? formatDateUTC(new Date(tle.fetchedAt)) : 'embedded';
}

function renderStatusBar(snap) {
  const bar = $('status-bar');
  bar.className = `status-bar status-${snap.status}`;
  bar.textContent = {
    idle:    'Search for a satellite above to begin.',
    loading: 'Loading orbital data…',
    error:   `Error: ${snap.errorMessage}`,
    ready:   `Tracking ${snap.selectedSat?.name ?? ''}`,
  }[snap.status] ?? '';
}

function setStatus(s) { state.setStatus(s); }
