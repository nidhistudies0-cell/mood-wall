import { computeMoodBreakdown, computeDominant } from "../aggregate.js";

export default function Headline({ notes }) {
  const breakdown = computeMoodBreakdown(notes);
  const dominant = computeDominant(breakdown);

  if (!dominant) {
    return (
      <div className="vibe-headline vibe-headline--quiet">
        <p className="vibe-headline__text">The wall is quiet — share your vibe to start!</p>
      </div>
    );
  }

  const total = notes.length;
  const pct = Math.round((dominant.count / total) * 100);

  return (
    <div className="vibe-headline" style={{ borderColor: "#1A1A1A" }}>
      <div className="vibe-headline__header">
        <span className="vibe-headline__eyebrow">CURRENT VIBE CHECK</span>
        <span className="vibe-headline__pulse-dot" style={{ backgroundColor: dominant.mood.hex }} />
      </div>

      <h2 className="vibe-headline__text">
        Mostly <span className="vibe-headline__highlight" style={{ backgroundColor: dominant.mood.hex, color: dominant.mood.textColor || "#1A1A1A" }}>{dominant.mood.icon} {dominant.mood.label}</span> ({pct}%)
      </h2>

      <div className="vibe-headline__chips">
        {breakdown.map((entry) => (
          <span
            key={entry.moodName}
            className="vibe-chip"
            style={{
              backgroundColor: entry.mood.hex,
              color: entry.mood.textColor || "#1A1A1A",
            }}
          >
            {entry.mood.icon} {entry.mood.label} · {entry.count}
          </span>
        ))}
      </div>
    </div>
  );
}
