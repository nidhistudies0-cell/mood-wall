import { MOODS } from "./moodData.js";

// Backward-compatible alias matching table
const ALIAS_TABLE = [
  { matchers: ["hyped", "electric", "vibe"], targetIndex: 0 },
  { matchers: ["low", "power", "mall"], targetIndex: 1 },
  { matchers: ["crisis", "tiny", "eve", "spiral", "lock"], targetIndex: 2 },
];

export function moodByName(moodName) {
  if (!moodName) return MOODS[0];
  const lower = moodName.toLowerCase();

  // Direct exact match by name or label
  const direct = MOODS.find(
    (m) => m.name.toLowerCase() === lower || m.label.toLowerCase() === lower
  );
  if (direct) return direct;

  // Backward compatibility with previous seeds/notes
  for (const { matchers, targetIndex } of ALIAS_TABLE) {
    if (matchers.some((term) => lower.includes(term))) {
      return MOODS[targetIndex];
    }
  }

  return MOODS[0];
}
