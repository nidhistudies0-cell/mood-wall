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

// Bucket notes into 30-minute windows over the note lifetime (5 hours = 10 buckets)
// so the timeline shows how the vibe has shifted every 30 minutes.
const BUCKET_COUNT = 10;
const BUCKET_MS = 30 * 60 * 1000; // 30 mins

function formatSlotTime(ms) {
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function labelForBucket(index) {
  if (index === 0) return "Last 30m";
  if (index === 1) return "30m – 1h ago";
  const hours = index * 0.5;
  const nextHours = (index + 1) * 0.5;
  return `${hours}h – ${nextHours}h ago`;
}

function shortLabelForBucket(index) {
  if (index === 0) return "Now";
  if (index === 1) return "30m";
  const hours = index * 0.5;
  return `${hours}h`;
}

export function computeTimeline(notes, now = Date.now()) {
  // Buckets from 0 (now to -30m) down to 9 (-4.5h to -5h)
  const rawBuckets = Array.from({ length: BUCKET_COUNT }, (_, i) => {
    const startMs = now - (i + 1) * BUCKET_MS;
    const endMs = now - i * BUCKET_MS;
    return {
      bucketIndex: i,
      startMs,
      endMs,
      label: labelForBucket(i),
      shortLabel: shortLabelForBucket(i),
      timeRange: `${formatSlotTime(startMs)} – ${formatSlotTime(endMs)}`,
      counts: new Map(),
      notes: [],
    };
  });

  for (const note of notes) {
    const ageMs = now - note.createdAt;
    if (ageMs < 0 || ageMs >= BUCKET_COUNT * BUCKET_MS) continue;
    const bucketIndex = Math.floor(ageMs / BUCKET_MS);
    if (bucketIndex >= 0 && bucketIndex < BUCKET_COUNT) {
      rawBuckets[bucketIndex].notes.push(note);
      const mood = note.moodName;
      rawBuckets[bucketIndex].counts.set(
        mood,
        (rawBuckets[bucketIndex].counts.get(mood) || 0) + 1
      );
    }
  }

  // Reverse so chronological order: oldest (4.5h – 5h ago) -> newest (Last 30m)
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

      const dominant = breakdown.length > 0 ? breakdown[0] : null;
      const dominantPct = dominant && total > 0 ? Math.round((dominant.count / total) * 100) : 0;

      return {
        bucketIndex: bucket.bucketIndex,
        startMs: bucket.startMs,
        endMs: bucket.endMs,
        pointTime: formatSlotTime(bucket.endMs),
        label: bucket.label,
        shortLabel: bucket.shortLabel,
        timeRange: bucket.timeRange,
        isCurrent: bucket.bucketIndex === 0,
        total,
        dominant,
        dominantPct,
        dominantHex: dominant ? dominant.mood.hex : null,
        breakdown,
      };
    })
    .reverse();

  // Mood shift summary: compare recent active 30-minute intervals
  const activeBuckets = buckets.filter((b) => b.dominant);
  let shiftSummary = null;

  if (activeBuckets.length >= 2) {
    const prev = activeBuckets[activeBuckets.length - 2];
    const curr = activeBuckets[activeBuckets.length - 1];
    if (prev.dominant.moodName === curr.dominant.moodName) {
      shiftSummary = {
        type: "steady",
        text: `Vibe held steady as ${curr.dominant.mood.label}`,
        fromMood: prev.dominant.mood,
        toMood: curr.dominant.mood,
        period: curr.label,
      };
    } else {
      shiftSummary = {
        type: "shifted",
        text: `Shifted from ${prev.dominant.mood.label} ➔ ${curr.dominant.mood.label}`,
        fromMood: prev.dominant.mood,
        toMood: curr.dominant.mood,
        period: curr.label,
      };
    }
  } else if (activeBuckets.length === 1) {
    const single = activeBuckets[0];
    shiftSummary = {
      type: "single",
      text: `${single.dominant.mood.label} in ${single.label.toLowerCase()}`,
      fromMood: null,
      toMood: single.dominant.mood,
      period: single.label,
    };
  }

  return {
    buckets,
    shiftSummary,
  };
}
