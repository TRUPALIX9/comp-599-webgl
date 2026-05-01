/**
 * OrbitScope — Cesium Helper Module
 * Isolates all CesiumJS imperative code from app logic.
 * Cesium is loaded from CDN as window.Cesium global.
 */

const C = window.Cesium;

// Entity IDs — stable string keys so we update rather than recreate
const ID_SATELLITE = 'orbitscope-satellite';
const ID_ORBIT     = 'orbitscope-orbit-path';
const ID_GROUND    = 'orbitscope-ground-track';

// ─── Viewer ───────────────────────────────────────────────────────────────────

/**
 * Initialize a Cesium Viewer inside the given container element.
 * Uses OpenStreetMap imagery — no Ion token required, includes borders + labels.
 * @param {string} containerId
 * @returns {Cesium.Viewer}
 */
export function initViewer(containerId) {
  const viewer = new C.Viewer(containerId, {
    imageryProvider: new C.UrlTemplateImageryProvider({
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      credit: '\u00a9 OpenStreetMap contributors',
      minimumLevel: 0,
      maximumLevel: 19,
    }),
    baseLayerPicker:       false,
    geocoder:              false,
    homeButton:            false,
    sceneModePicker:       false,
    navigationHelpButton:  false,
    animation:             false,
    timeline:              false,
    fullscreenButton:      false,
    vrButton:              false,
    terrainProvider:       new C.EllipsoidTerrainProvider(),
    creditContainer:       document.createElement('div'), // hide credit
  });

  // Dark space background for the sky beyond the globe
  viewer.scene.backgroundColor = C.Color.fromCssColorString('#0a0e1a');
  viewer.scene.globe.showGroundAtmosphere = true;
  viewer.scene.skyAtmosphere.show         = true;
  viewer.scene.fog.enabled                = false;

  // Default camera — view full Earth from distance
  viewer.camera.setView({
    destination: C.Cartesian3.fromDegrees(0, 20, 25_000_000),
  });

  return viewer;
}

// ─── Coordinate Conversion ───────────────────────────────────────────────────

/**
 * Convert lat/lon/alt to Cesium Cartesian3.
 * @param {number} lat - degrees
 * @param {number} lon - degrees
 * @param {number} altKm - km above surface
 * @returns {Cesium.Cartesian3}
 */
export function toCartesian(lat, lon, altKm) {
  return C.Cartesian3.fromDegrees(lon, lat, altKm * 1000);
}

// ─── Satellite Marker ────────────────────────────────────────────────────────

/**
 * Add or update the satellite marker entity.
 * @param {Cesium.Viewer} viewer
 * @param {{ lat, lon, altKm }} position
 * @param {string} name
 */
export function updateSatelliteMarker(viewer, position, name) {
  const pos = toCartesian(position.lat, position.lon, position.altKm);
  const existing = viewer.entities.getById(ID_SATELLITE);

  if (existing) {
    existing.position = new C.ConstantPositionProperty(pos);
    if (existing.label) existing.label.text = new C.ConstantProperty(name);
  } else {
    viewer.entities.add({
      id: ID_SATELLITE,
      position: pos,
      point: {
        pixelSize:    12,
        color:        C.Color.fromCssColorString('#00d4ff'),
        outlineColor: C.Color.WHITE,
        outlineWidth: 2,
        scaleByDistance: new C.NearFarScalar(1e3, 2.5, 1e8, 0.8),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      label: {
        text:              name,
        font:              '13px "Inter", sans-serif',
        fillColor:         C.Color.WHITE,
        outlineColor:      C.Color.BLACK,
        outlineWidth:      2,
        style:             C.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset:       new C.Cartesian2(14, 0),
        verticalOrigin:    C.VerticalOrigin.CENTER,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        translucencyByDistance: new C.NearFarScalar(1e6, 1.0, 5e7, 0.3),
      },
    });
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Return true only if all three Cartesian3 components are finite numbers. */
function isValidPos(c) {
  return c && isFinite(c.x) && isFinite(c.y) && isFinite(c.z);
}

// ── Orbit Path ──────────────────────────────────────────────────────────────

/**
 * Draw (or redraw) the orbit path polyline.
 * @param {Cesium.Viewer} viewer
 * @param {Array<{ lat, lon, altKm } | null>} samples
 */
export function updateOrbitPath(viewer, samples) {
  const positions = samples
    .filter(Boolean)
    .map(s => toCartesian(s.lat, s.lon, s.altKm))
    .filter(isValidPos);

  if (positions.length < 2) return;

  const existing = viewer.entities.getById(ID_ORBIT);
  if (existing) {
    existing.polyline.positions = new C.ConstantProperty(positions);
  } else {
    viewer.entities.add({
      id: ID_ORBIT,
      polyline: {
        positions,
        width:    2,
        material: new C.PolylineGlowMaterialProperty({
          glowPower: 0.15,
          color:     C.Color.fromCssColorString('#00d4ff').withAlpha(0.75),
        }),
        arcType: C.ArcType.NONE,
        clampToGround: false,
      },
    });
  }
}

/**
 * Draw the ground track (orbit projected onto Earth surface).
 * @param {Cesium.Viewer} viewer
 * @param {Array<{ lat, lon, altKm } | null>} samples
 */
export function updateGroundTrack(viewer, samples) {
  const positions = samples
    .filter(Boolean)
    .map(s => C.Cartesian3.fromDegrees(s.lon, s.lat, 0))
    .filter(isValidPos);

  if (positions.length < 2) return;

  const existing = viewer.entities.getById(ID_GROUND);
  if (existing) {
    existing.polyline.positions = new C.ConstantProperty(positions);
  } else {
    viewer.entities.add({
      id: ID_GROUND,
      polyline: {
        positions,
        width: 1.5,
        material: C.Color.fromCssColorString('#00d4ff').withAlpha(0.25),
        clampToGround: true,
        arcType: C.ArcType.GEODESIC,
      },
    });
  }
}

// ─── Scene Cleanup ───────────────────────────────────────────────────────────

/** Remove all OrbitScope entities from the viewer. */
export function clearOrbitEntities(viewer) {
  [ID_SATELLITE, ID_ORBIT, ID_GROUND].forEach(id => {
    const e = viewer.entities.getById(id);
    if (e) viewer.entities.remove(e);
  });
}

// ─── Camera ──────────────────────────────────────────────────────────────────

/**
 * Fly camera to focus on a satellite position.
 * @param {Cesium.Viewer} viewer
 * @param {{ lat, lon, altKm }} position
 */
export function flyToSatellite(viewer, position) {
  viewer.camera.flyTo({
    destination: C.Cartesian3.fromDegrees(
      position.lon,
      position.lat,
      Math.max(position.altKm * 1000 + 4_000_000, 8_000_000),
    ),
    duration: 1.6,
  });
}
