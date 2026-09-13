import { MOODS } from "./moodData.js";

const ALIAS_TABLE = [
  { matchers: ["hyped", "electric", "vibe"], targetIndex: 0 },
  { matchers: ["low", "power"], targetIndex: 1 },
  { matchers: ["crisis", "tiny", "spiral"], targetIndex: 2 },
];

export function moodByName(moodName) {
  if (!moodName) return MOODS[0];
  const lower = moodName.toLowerCase();

  const direct = MOODS.find(
    (m) => m.name.toLowerCase() === lower || m.label.toLowerCase() === lower
  );
  if (direct) return direct;

  for (const { matchers, targetIndex } of ALIAS_TABLE) {
    if (matchers.some((term) => lower.includes(term))) {
      return MOODS[targetIndex];
    }
  }

  return MOODS[0];
}
