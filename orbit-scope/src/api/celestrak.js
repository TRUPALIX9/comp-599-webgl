/**
 * OrbitScope — CelesTrak API Layer
 * Fetches TLE orbital data. Normalizes errors. Caches results for the session.
 */

import { CELESTRAK_TLE_URL, FALLBACK_TLES } from '../config.js';

// In-memory session cache: NORAD ID → { lines: [name, tle1, tle2], fetchedAt: Date }
const _cache = new Map();

/**
 * Fetch the 3-line TLE for a satellite by NORAD catalog ID.
 * Falls back to FALLBACK_TLES if the network request fails.
 * @param {number} noradId
 * @returns {Promise<{ name: string, tle1: string, tle2: string, source: 'live'|'fallback'|'cache' }>}
 */
export async function fetchTLE(noradId) {
  if (_cache.has(noradId)) {
    const cached = _cache.get(noradId);
    return { ...cached, source: 'cache' };
  }

  try {
    const resp = await fetch(CELESTRAK_TLE_URL(noradId), { mode: 'cors' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const text = await resp.text();
    const lines = text.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    if (lines.length < 3) throw new Error('Incomplete TLE response');

    const result = { name: lines[0], tle1: lines[1], tle2: lines[2], fetchedAt: new Date() };
    _cache.set(noradId, result);
    return { ...result, source: 'live' };

  } catch (err) {
    console.warn(`[celestrak] Failed to fetch NORAD ${noradId}:`, err.message);

    // Try embedded fallback
    const fb = FALLBACK_TLES[noradId];
    if (fb) {
      return { name: fb[0], tle1: fb[1], tle2: fb[2], fetchedAt: null, source: 'fallback' };
    }
    throw new Error(`No orbital data available for NORAD ID ${noradId}. Try a different satellite.`);
  }
}

/**
 * Search the catalog (client-side). The full CELESTRAK catalog search would
 * require a server proxy due to CORS. We search the embedded catalog here and
 * optionally extend to the live SATCAT endpoint when available.
 * @param {string} query
 * @param {import('../config.js').SATELLITE_CATALOG} catalog
 * @returns {Array}
 */
export function searchCatalog(query, catalog) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return catalog.filter(s =>
    s.name.toLowerCase().includes(q) ||
    String(s.id).includes(q) ||
    s.category.toLowerCase().includes(q)
  ).slice(0, 12); // cap results for UI clarity
}

/** Clear the session cache (useful for testing or refresh). */
export function clearCache() { _cache.clear(); }
