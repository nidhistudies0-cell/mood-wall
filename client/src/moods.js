// Palette of moods for Vibe Check following the redesigned color scheme
export const MOODS = [
  { label: "Locked In", name: "Locked In", hex: "#FFD600", icon: "🔒", textColor: "#1A1A1A" },
  { label: "Vibing", name: "Vibing", hex: "#7C4DFF", icon: "✨", textColor: "#FFFFFF" },
  { label: "Spiralling", name: "Spiralling", hex: "#FF5252", icon: "🌀", textColor: "#FFFFFF" },
];

export const REACTIONS = [
  { key: "fire", emoji: "🔥" },
  { key: "laugh", emoji: "😂" },
  { key: "dead", emoji: "💀" },
];

export function moodByName(moodName) {
  if (!moodName) return MOODS[0];
  return MOODS.find((m) => m.name.toLowerCase() === moodName.toLowerCase() || m.label.toLowerCase() === moodName.toLowerCase()) || MOODS[0];
}
