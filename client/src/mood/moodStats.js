import { MOODS } from "./moodData.js";
import { moodByName } from "./moodResolver.js";
import { NOTE_LIFETIME_MS } from "../config.js";

export function formatClockTime(ms) {
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function computeMoodBreakdown(notes) {
  const counts = new Map();

  for (const note of notes) {
    const key = note.moodName;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  const breakdown = [...counts.entries()]
    .map(([moodName, count]) => ({ moodName, count, mood: moodByName(moodName) }))
    .filter((entry) => entry.mood)
    .sort((a, b) => b.count - a.count);

  return breakdown;
}

export function computeDominant(breakdown) {
  if (breakdown.length === 0) return null;
  return breakdown[0];
}

export function computeDominantMood(notes) {
  if (!notes || notes.length === 0) return null;

  const counts = {};
  for (const note of notes) {
    counts[note.moodName] = (counts[note.moodName] || 0) + 1;
  }

  const entries = Object.entries(counts);
  const topCount = Math.max(...entries.map(([, count]) => count));
  const topMoods = entries.filter(([, count]) => count === topCount);

  if (topMoods.length > 1) return topMoods.map(([name]) => name); 
  return topMoods[0][0];
}

const BUCKET_COUNT = 5;
const BUCKET_MS = NOTE_LIFETIME_MS / BUCKET_COUNT; 

export function computeTimeline(notes, now = Date.now()) {
  const rawBuckets = Array.from({ length: BUCKET_COUNT }, (_, i) => {
    const startMs = now - (i + 1) * BUCKET_MS;
    const endMs = now - i * BUCKET_MS;
    return {
      bucketIndex: i,
      startMs,
      endMs,
      timeLabel: i === 0 ? `Now (${formatClockTime(now)})` : formatClockTime(endMs),
      shortTime: formatClockTime(endMs),
      relativeLabel: i === 0 ? "Now" : `${i}h ago`,
      isCurrent: i === 0,
      counts: new Map(),
      notes: [],
    };
  });

  for (const note of notes) {
  const ageMs = now - note.createdAt;
  if (ageMs < 0) continue; 
  const bucketIndex = Math.min(BUCKET_COUNT - 1, Math.floor(ageMs / BUCKET_MS)); 
  if (bucketIndex >= 0 && bucketIndex < BUCKET_COUNT) {
    rawBuckets[bucketIndex].notes.push(note);
    const mood = note.moodName;
    rawBuckets[bucketIndex].counts.set(
      mood,
      (rawBuckets[bucketIndex].counts.get(mood) || 0) + 1
    );
  }
}

  const buckets = rawBuckets
    .map((bucket) => {
      const total = bucket.notes.length;
      const breakdown = [...bucket.counts.entries()]
        .map(([moodName, count]) => ({
          moodName,
          count,
          mood: moodByName(moodName),
        }))
        .filter((entry) => entry.mood)
        .sort((a, b) => b.count - a.count);

      const moodCounts = MOODS.map((mood) => {
        let count = 0;
        for (const [name, c] of bucket.counts.entries()) {
          const resolved = moodByName(name);
          if (resolved.name === mood.name || resolved.label === mood.label) {
            count += c;
          }
        }
        return {
          mood,
          count,
        };
      });

      return {
        bucketIndex: bucket.bucketIndex,
        startMs: bucket.startMs,
        endMs: bucket.endMs,
        timeLabel: bucket.timeLabel,
        shortTime: bucket.shortTime,
        relativeLabel: bucket.relativeLabel,
        isCurrent: bucket.isCurrent,
        total,
        breakdown,
        moodCounts,
        dominant: breakdown.length > 0 ? breakdown[0] : null,
      };
    })
    .reverse();

  return { buckets };
}
