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
