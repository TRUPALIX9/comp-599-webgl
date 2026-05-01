/**
 * OrbitScope — Configuration
 * Central source of truth for API endpoints, defaults, and the curated satellite catalog.
 */

export const CESIUM_VERSION = '1.119';
export const CESIUM_BASE_URL = `https://cesium.com/downloads/cesiumjs/releases/${CESIUM_VERSION}/Build/Cesium/`;

// CelesTrak TLE endpoint — returns plain text (3-line TLE)
export const CELESTRAK_TLE_URL = (noradId) =>
  `https://celestrak.org/satcat/tle.php?CATNR=${noradId}`;

// Timeline defaults
export const TIMELINE = {
  windowMinutes: 180,   // ±180 min visible window (one full orbit on each side)
  orbitSamples: 120,    // number of points along orbit path
  stepSeconds: 30,      // position sample step for path
  animFps: 10,          // frames per second during playback
  playStepMs: 10000,    // time advance per animation frame (10 seconds real time)
};

// Default camera pitch when following a satellite
export const DEFAULT_CAMERA_ALTITUDE_M = 15_000_000;

/** Curated catalog of notable satellites with NORAD IDs and categories. */
export const SATELLITE_CATALOG = [
  // ── Space Stations ──────────────────────────────────────
  { name: 'ISS (ZARYA)',                id: 25544,  category: 'Space Station' },
  { name: 'Tiangong Space Station',     id: 48274,  category: 'Space Station' },
  // ── Observatories ───────────────────────────────────────
  { name: 'Hubble Space Telescope',     id: 20580,  category: 'Observatory' },
  { name: 'Chandra X-ray Observatory',  id: 25867,  category: 'Observatory' },
  { name: 'James Webb (L2 — no TLE)',   id: 50463,  category: 'Observatory' },
  // ── Weather ─────────────────────────────────────────────
  { name: 'GOES-18',                    id: 51850,  category: 'Weather' },
  { name: 'GOES-16',                    id: 41866,  category: 'Weather' },
  { name: 'NOAA-20',                    id: 43013,  category: 'Weather' },
  { name: 'Suomi NPP',                  id: 37849,  category: 'Weather' },
  { name: 'Meteosat-12',                id: 38552,  category: 'Weather' },
  // ── Earth Observation ───────────────────────────────────
  { name: 'Landsat 9',                  id: 49260,  category: 'Earth Observation' },
  { name: 'Sentinel-2A',                id: 40697,  category: 'Earth Observation' },
  { name: 'Sentinel-2B',                id: 42063,  category: 'Earth Observation' },
  { name: 'Terra',                      id: 25994,  category: 'Earth Observation' },
  { name: 'Aqua',                       id: 27424,  category: 'Earth Observation' },
  { name: 'ICESat-2',                   id: 43613,  category: 'Cryosphere' },
  { name: 'CALIPSO',                    id: 29108,  category: 'Atmosphere' },
  { name: 'Aura',                       id: 28376,  category: 'Atmosphere' },
  { name: 'JASON-3',                    id: 41240,  category: 'Oceanography' },
  // ── Navigation ──────────────────────────────────────────
  { name: 'GPS BIIRM-1',                id: 28874,  category: 'Navigation' },
  { name: 'GPS BIIRM-3',                id: 29486,  category: 'Navigation' },
  { name: 'Galileo-1',                  id: 37846,  category: 'Navigation' },
  { name: 'GLONASS-M 723',             id: 32276,  category: 'Navigation' },
  // ── Communications ──────────────────────────────────────
  { name: 'STARLINK-1007',              id: 44713,  category: 'Communications' },
  { name: 'STARLINK-2130',              id: 48833,  category: 'Communications' },
  { name: 'STARLINK-3000',              id: 51049,  category: 'Communications' },
  { name: 'OneWeb-0012',                id: 44058,  category: 'Communications' },
  { name: 'Iridium 117',                id: 42804,  category: 'Communications' },
  // ── Science ─────────────────────────────────────────────
  { name: 'XMM-Newton',                 id: 25989,  category: 'Science' },
  { name: 'Swift',                      id: 28485,  category: 'Science' },
  { name: 'Fermi Gamma-ray',            id: 33053,  category: 'Science' },
  { name: 'SORCE',                      id: 27651,  category: 'Science' },
];

// Fallback TLEs for offline / CORS-failure scenarios
export const FALLBACK_TLES = {
  25544: [
    'ISS (ZARYA)',
    '1 25544U 98067A   24120.84763889  .00010234  00000-0  18741-3 0  9993',
    '2 25544  51.6416 242.4427 0004706 176.5281 183.5965 15.49963985449958',
  ],
  20580: [
    'HST',
    '1 20580U 90037B   24120.55712963  .00002441  00000-0  87481-4 0  9992',
    '2 20580  28.4694  45.7241 0002538 137.6423 222.4789 15.09617020500938',
  ],
};
