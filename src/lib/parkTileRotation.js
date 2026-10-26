/**
 * Cosmetic tile-art orientation only. This never changes grid indexes,
 * simulation neighbours, guest navigation, paths, placement costs or saves
 * created by older versions of the game.
 */
export function safeTileRotation(value) {
  const n = Number(value);
  return Number.isInteger(n) && [0, 90, 180, 270].includes(n) ? n : 0;
}

export function normaliseTileRotations(value, length) {
  const original = Array.isArray(value) ? value : [];
  return Array.from({ length: Math.max(0, Math.min(400, Number(length) || 0)) }, (_, i) =>
    safeTileRotation(original[i])
  );
}

export function nextTileRotation(value) {
  return (safeTileRotation(value) + 90) % 360;
}
