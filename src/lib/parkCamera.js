/**
 * Fit the min-width park playfield into the visible camera viewport.
 * Pure to allow regression tests and preserve behaviour on saved parks.
 */
export function calculateParkFitZoom(viewportWidth, playfieldWidth, minZoom = 0.35, maxZoom = 2.5) {
  const viewport = Number(viewportWidth);
  const playfield = Number(playfieldWidth);
  if (!Number.isFinite(viewport) || !Number.isFinite(playfield) || viewport <= 0 || playfield <= 0) return 1;
  const margin = 18;
  const result = (viewport - margin) / playfield;
  return Math.max(minZoom, Math.min(maxZoom, Number(Math.max(0, result).toFixed(2))));
}

/**
 * Keep panning inside (or close to) the visible park, including at sub-100%
 * auto-fit zoom. Tiny overscroll makes edge plots easier to reach on phones.
 * These are pure camera helpers: no save data, gameplay or device APIs.
 */
export function clampParkPan(pan, viewportSize, worldSize, zoom, slack = 24) {
  const size = Number(viewportSize), content = Number(worldSize), scale = Number(zoom);
  if (![size, content, scale].every(Number.isFinite) || size <= 0 || content <= 0 || scale <= 0) return 0;
  const scaled = content * scale;
  const padding = Math.max(0, Math.min(36, Number(slack) || 0));
  const low = scaled <= size ? -padding : size - scaled - padding;
  const high = scaled <= size ? size - scaled + padding : padding;
  return Math.max(low, Math.min(high, Number.isFinite(Number(pan)) ? Number(pan) : 0));
}

/** Preserve the exact world tile under the fingers while zooming. */
export function zoomParkAtPoint(camera, nextZoom, anchor, bounds) {
  const before = Number(camera.zoom) || 1;
  const after = Math.max(0.1, Number(nextZoom) || before);
  const worldX = (Number(anchor.x) - (Number(camera.panX) || 0)) / before;
  const worldY = (Number(anchor.y) - (Number(camera.panY) || 0)) / before;
  return {
    zoom: after,
    panX: clampParkPan(Number(anchor.x) - worldX * after, bounds.width, bounds.contentWidth, after),
    panY: clampParkPan(Number(anchor.y) - worldY * after, bounds.height, bounds.contentHeight, after),
  };
}
