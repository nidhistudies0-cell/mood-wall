import { computeTimeline } from "../aggregate.js";

function labelFor(bucketIndex) {
  if (bucketIndex === 0) return "now";
  if (bucketIndex === 1) return "30m ago";
  if (bucketIndex === 2) return "1h ago";
  return "1.5h ago";
}

export default function Timeline({ notes }) {
  const buckets = computeTimeline(notes);
  const maxTotal = Math.max(1, ...buckets.map((b) => b.total));

  return (
    <div className="vibe-timeline">
      <div className="vibe-timeline__header">
        <span className="vibe-timeline__title">TIMELINE HISTORY</span>
        <span className="vibe-timeline__subtitle">Last 2 hours activity</span>
      </div>
      <div className="vibe-timeline__track">
        {buckets.map((bucket) => {
          const heightPct = bucket.total === 0 ? 8 : 18 + (bucket.total / maxTotal) * 82;
          return (
            <div className="vibe-timeline__col" key={bucket.bucketIndex}>
              <div
                className="vibe-timeline__bar"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: bucket.dominantHex || "#E0DBED",
                }}
                title={`${bucket.total} vibe${bucket.total === 1 ? "" : "s"}`}
              />
            </div>
          );
        })}
      </div>
      <div className="vibe-timeline__ticks">
        {buckets.map((bucket) => (
          <span key={bucket.bucketIndex} className="vibe-timeline__tick">
            {labelFor(bucket.bucketIndex)}
          </span>
        ))}
      </div>
    </div>
  );
}
