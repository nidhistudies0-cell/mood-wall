import { MOODS, moodByName } from "./moods.js";

// Given the active notes, work out which mood is most common right now
// and a breakdown of counts per mood — the data behind the headline.
export function computeMoodBreakdown(notes) {
  const counts = new Map();

  for (const note of notes) {
    const key = note.moodName;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  const breakdown = [...counts.entries()]
    .map(([moodName, count]) => ({ moodName, count, mood: moodByName(moodName) }))
    .filter((entry) => entry.mood) // ignore any unrecognized/legacy mood names
    .sort((a, b) => b.count - a.count);

  return breakdown;
}

export function computeDominant(breakdown) {
  if (breakdown.length === 0) return null;
  return breakdown[0];
}

// Bucket notes into 30-minute windows over the note lifetime (2h) so the
// timeline ticker can show how the vibe has shifted through the last 2 hours.
const BUCKET_COUNT = 4;
const BUCKET_MS = 30 * 60 * 1000; // 30 mins

export function computeTimeline(notes, now = Date.now()) {
  const buckets = Array.from({ length: BUCKET_COUNT }, () => new Map());

  for (const note of notes) {
    const ageMs = now - note.createdAt;
    const bucketIndex = Math.min(BUCKET_COUNT - 1, Math.floor(ageMs / BUCKET_MS));
    const bucket = buckets[bucketIndex];
    bucket.set(note.moodName, (bucket.get(note.moodName) || 0) + 1);
  }

  // buckets[0] = most recent 30m ... buckets[3] = oldest 30m.
  // Reverse so the timeline reads oldest -> newest, left to right.
  return buckets
    .map((bucket, i) => {
      const total = [...bucket.values()].reduce((sum, n) => sum + n, 0);
      let dominantMood = null;
      let dominantCount = 0;
      for (const [moodName, count] of bucket.entries()) {
        if (count > dominantCount) {
          dominantCount = count;
          dominantMood = moodByName(moodName);
        }
      }
      return {
        bucketIndex: i,
        total,
        dominantHex: dominantMood ? dominantMood.hex : null,
      };
    })
    .reverse();
}
