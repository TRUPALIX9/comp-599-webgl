/**
 * OrbitScope — Satellite Propagation Library
 * Wraps satellite.js for position calculation, path sampling, and speed estimation.
 * satellite.js is loaded from CDN as window.satellite global.
 */

import { TIMELINE } from '../config.js';

const sat = window.satellite; // CDN global from satellite.js

/**
 * Parse TLE strings into a satellite record for propagation.
 * @param {string} tle1 - TLE line 1
 * @param {string} tle2 - TLE line 2
 * @returns {object} satrec  — satellite.js record
 */
export function parseTLE(tle1, tle2) {
  return sat.twoline2satrec(tle1.trim(), tle2.trim());
}

/**
 * Propagate satellite position to a given Date.
 * @param {object} satrec
 * @param {Date} date
 * @returns {{ lat: number, lon: number, altKm: number, eci: object, vel: object } | null}
 */
export function propagate(satrec, date) {
  const pv = sat.propagate(satrec, date);

  // satellite.js returns false for position when propagation fails
  if (!pv || typeof pv.position === 'boolean') return null;

  const gmst = sat.gstime(date);
  const geo = sat.eciToGeodetic(pv.position, gmst);

  return {
    lat:   sat.degreesLat(geo.latitude),
    lon:   sat.degreesLong(geo.longitude),
    altKm: geo.height,   // km above WGS-84 ellipsoid
    eci:   pv.position,  // km, Earth-centered inertial
    vel:   pv.velocity,  // km/s, ECI
  };
}

/**
 * Estimate current speed from velocity vector magnitude (km/s).
 * @param {{ x, y, z }} vel - ECI velocity in km/s
 * @returns {number} speed in km/s
 */
export function speedKmS(vel) {
  if (!vel) return 0;
  return Math.sqrt(vel.x ** 2 + vel.y ** 2 + vel.z ** 2);
}

/**
 * Generate an array of positions sampling one full orbit (or the configured window).
 * Steps from (centerDate − windowMin/2) to (centerDate + windowMin/2).
 * @param {object} satrec
 * @param {Date} centerDate
 * @returns {Array<{ lat, lon, altKm, eci, vel } | null>}
 */
export function sampleOrbitPath(satrec, centerDate) {
  const { windowMinutes, orbitSamples, stepSeconds } = TIMELINE;
  const results = [];
  const halfMs = (windowMinutes / 2) * 60 * 1000;
  const stepMs = stepSeconds * 1000;
  const totalSteps = Math.floor((halfMs * 2) / stepMs);

  for (let i = 0; i <= totalSteps; i++) {
    const t = new Date(centerDate.getTime() - halfMs + i * stepMs);
    results.push(propagate(satrec, t));
  }
  return results;
}

/**
 * Generate a full (360°) orbit path by stepping through one orbital period.
 * satrec.no is mean motion in rad/min (satellite.js v4 standard field).
 * @param {object} satrec
 * @param {Date} startDate
 * @returns {Array<{ lat, lon, altKm, eci, vel } | null>}
 */
export function sampleFullOrbit(satrec, startDate) {
  // satrec.no is mean motion in radians/minute
  // Period (minutes) = 2π / no
  const no = satrec.no || satrec.no_kozai;
  if (!no || no <= 0 || !isFinite(no)) {
    console.warn('[propagation] invalid mean motion, cannot sample orbit');
    return [];
  }
  const periodMin = (2 * Math.PI) / no;       // ~93 min for ISS
  const stepMs    = (periodMin * 60 * 1000) / TIMELINE.orbitSamples;
  const results   = [];

  for (let i = 0; i <= TIMELINE.orbitSamples; i++) {
    const t = new Date(startDate.getTime() + i * stepMs);
    if (isNaN(t.getTime())) continue;           // skip bad timestamps
    const pos = propagate(satrec, t);
    if (pos && isFinite(pos.lat) && isFinite(pos.lon) && isFinite(pos.altKm)) {
      results.push(pos);
    } else {
      results.push(null);
    }
  }
  return results;
}
