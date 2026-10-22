// Deterministic cosmetic-only landscaping; no RNG, state or save-file changes.
// Roughly one-third of empty plots receive an illustrated accent.
export const SCENERY_TYPES = Object.freeze(["palm", "flowers", "lamp", "lounge", "hedge", "rock", "sign"]);

export function getDecorativeScenery(index) {
  if (!Number.isInteger(index) || index < 0) return null;
  const row = Math.floor(index / 8);
  const token = (index * 37 + row * 13 + 11) % 53;
  return token < 17 ? SCENERY_TYPES[token % SCENERY_TYPES.length] : null;
}
