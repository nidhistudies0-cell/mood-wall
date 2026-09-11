import { useState } from "react";
import { computeDominantMood, computeTimeline } from "../mood/moodStats.js";
import { MOODS } from "../mood/moodData.js";
import { NOTE_LIFETIME_MS } from "../config.js";

export default function Timeline({ notes }) {
  const [hoveredBar, setHoveredBar] = useState(null);
  const now = Date.now();
  const { buckets } = computeTimeline(notes, now);
  const chartNotes = notes.filter((note) => {
    const ageMs = now - note.createdAt;
    return ageMs >= 0 && ageMs < NOTE_LIFETIME_MS;
  });
  const dominantMood = computeDominantMood(chartNotes);

  let highestMoodCount = 0;
  for (const b of buckets) {
    for (const mc of b.moodCounts) {
      if (mc.count > highestMoodCount) highestMoodCount = mc.count;
    }
  }
  const maxCount = Math.max(2, highestMoodCount);

  const yTicks = Array.from({ length: maxCount }, (_, i) => maxCount - i);

  return (
    <section className="scrapbook-board-container" aria-label="Mood Frequency Scrapbook Board">
      <div className="scrapbook-binder-clip scrapbook-binder-clip--left" aria-hidden="true">
        <svg viewBox="0 0 38 52" width="34" height="48" fill="none" style={{ overflow: "visible" }}>
          <path
            d="M11 2 C11 0.5, 27 0.5, 27 2 L27 22 L11 22 Z"
            stroke="#1F2937"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M12 3.5 C12 2, 26 2, 26 3.5 L26 21 L12 21 Z"
            stroke="#E5E7EB"
            strokeWidth="2.2"
            fill="none"
          />
          <polygon points="4,22 34,22 30,50 8,50" fill="#18181B" stroke="#000000" strokeWidth="2" />
          <line x1="8" y1="26" x2="30" y2="26" stroke="#71717A" strokeWidth="1.8" />
          <line x1="9" y1="44" x2="29" y2="44" stroke="#3F3F46" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="scrapbook-binder-clip scrapbook-binder-clip--right" aria-hidden="true">
        <svg viewBox="0 0 38 52" width="34" height="48" fill="none" style={{ overflow: "visible" }}>
          <path
            d="M11 2 C11 0.5, 27 0.5, 27 2 L27 22 L11 22 Z"
            stroke="#1F2937"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M12 3.5 C12 2, 26 2, 26 3.5 L26 21 L12 21 Z"
            stroke="#E5E7EB"
            strokeWidth="2.2"
            fill="none"
          />
          <polygon points="4,22 34,22 30,50 8,50" fill="#18181B" stroke="#000000" strokeWidth="2" />
          <line x1="8" y1="26" x2="30" y2="26" stroke="#71717A" strokeWidth="1.8" />
          <line x1="9" y1="44" x2="29" y2="44" stroke="#3F3F46" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="scrapbook-board">
        <div className="scrapbook-board-header">
          <h2 className="dymo-label">MOOD FREQUENCY</h2>

          <div className="scrapbook-legend-row" role="list" aria-label="Mood category legend">
            {MOODS.map((mood) => (
              <div key={mood.name} className="scrapbook-legend-item" role="listitem">
                <span
                  className="scrapbook-legend-dot"
                  style={{ backgroundColor: mood.hex }}
                >
                  {dominantMood === mood.name && (
                    <i
                      className="ti ti-crown scrapbook-legend-crown"
                      title="Dominant vibe"
                      aria-label="Dominant vibe"
                    />
                  )}
                </span>
                <span className="scrapbook-legend-text">
                  {mood.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="scrapbook-chart-wrapper">
          <div className="scrapbook-y-axis" aria-hidden="true">
            {yTicks.map((tick) => (
              <span key={tick} className="scrapbook-y-label">
                {tick}
              </span>
            ))}
            <span className="scrapbook-y-label scrapbook-y-label--zero">0</span>
          </div>

          <div className="scrapbook-chart-stage">
            <div className="scrapbook-gridlines" aria-hidden="true">
              {yTicks.map((tick) => {
                const topPct = ((maxCount - tick) / maxCount) * 100;
                return (
                  <div
                    key={tick}
                    className="scrapbook-gridline"
                    style={{ top: `${topPct}%` }}
                  />
                );
              })}
              <div className="scrapbook-gridline scrapbook-gridline--baseline" />
            </div>

            <div className="scrapbook-chart-cols">
              {buckets.map((bucket, bucketIdx) => (
                <div key={bucket.bucketIndex} className="scrapbook-chart-col">
                  <div className="scrapbook-bars-cluster">
                    {bucket.moodCounts.map((item, moodIdx) => {
                      const heightPct =
                        item.count > 0
                          ? Math.min(100, Math.round((item.count / maxCount) * 100))
                          : 0;

                      const barClass =
                        moodIdx === 0
                          ? "scrapbook-bar--pink"
                          : moodIdx === 1
                          ? "scrapbook-bar--blue"
                          : "scrapbook-bar--yellow";

                      const isHovered =
                        hoveredBar &&
                        hoveredBar.bucketIdx === bucketIdx &&
                        hoveredBar.moodIdx === moodIdx;

                      return (
                        <div key={item.mood.name} className="scrapbook-bar-slot">
                          {isHovered && item.count > 0 && (
                            <div className="scrapbook-bar-badge">
                              {item.count}
                            </div>
                          )}

                          {item.count > 0 ? (
                            <div
                              className={`scrapbook-bar ${barClass}`}
                              style={{ height: `${heightPct}%` }}
                              tabIndex={0}
                              role="img"
                              aria-label={`${item.mood.label}: ${item.count} note(s)`}
                              onMouseEnter={() =>
                                setHoveredBar({
                                  bucketIdx,
                                  moodIdx,
                                  count: item.count,
                                  label: item.mood.label,
                                })
                              }
                              onMouseLeave={() => setHoveredBar(null)}
                            />
                          ) : (
                            <div className="scrapbook-bar--zero-dash" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <span
                    className={`scrapbook-col-label ${
                      bucket.isCurrent ? "scrapbook-col-label--now" : ""
                    }`}
                  >
                    {bucket.isCurrent ? "NOW" : bucket.relativeLabel.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
