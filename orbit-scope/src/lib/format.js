/**
 * OrbitScope — Formatting Utilities
 * Pure functions for display-ready strings. No dependencies.
 */

const DEG = '°';

/**
 * Format latitude with N/S suffix.
 * @param {number} deg
 * @returns {string} e.g. "37.4° N"
 */
export function formatLat(deg) {
  const d = Math.abs(deg).toFixed(2);
  return `${d}${DEG} ${deg >= 0 ? 'N' : 'S'}`;
}

/**
 * Format longitude with E/W suffix.
 * @param {number} deg
 * @returns {string} e.g. "122.1° W"
 */
export function formatLon(deg) {
  const d = Math.abs(deg).toFixed(2);
  return `${d}${DEG} ${deg >= 0 ? 'E' : 'W'}`;
}

/**
 * Format altitude in km, with 1 decimal.
 * @param {number} km
 * @returns {string} e.g. "408.3 km"
 */
export function formatAlt(km) {
  return `${km.toFixed(1)} km`;
}

/**
 * Format speed in km/s, with 2 decimals.
 * @param {number} kmps
 * @returns {string} e.g. "7.66 km/s"
 */
export function formatSpeed(kmps) {
  return `${kmps.toFixed(2)} km/s`;
}

/**
 * Format a Date as UTC ISO string (readable, not full ISO).
 * @param {Date} date
 * @returns {string} e.g. "2024-04-30 14:22:08 UTC"
 */
export function formatDateUTC(date) {
  return date.toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC');
}

/**
 * Format a relative time delta from now in minutes.
 * @param {number} deltaMs - milliseconds offset from now
 * @returns {string} e.g. "+12 min" or "−45 min" or "Now"
 */
export function formatDelta(deltaMs) {
  const mins = Math.round(deltaMs / 60000);
  if (mins === 0) return 'Now';
  const sign = mins > 0 ? '+' : '−';
  const abs = Math.abs(mins);
  if (abs >= 60) {
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    return `${sign}${h}h ${m}m`;
  }
  return `${sign}${abs} min`;
}
