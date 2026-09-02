import { useState } from "react";
import { computeTimeline } from "../mood/moodStats.js";
import { MOODS } from "../mood/moodData.js";

export default function Timeline({ notes }) {
  const [hoveredBar, setHoveredBar] = useState(null);
  const { buckets } = computeTimeline(notes);

  // Compute maximum count to scale the Y-axis accurately
  let highestMoodCount = 0;
  for (const b of buckets) {
    for (const mc of b.moodCounts) {
      if (mc.count > highestMoodCount) highestMoodCount = mc.count;
    }
  }
  // Minimum scale of 2 so ticks match the reference image (2, 1, 0)
  const maxCount = Math.max(2, highestMoodCount);

  // Generate integer ticks for Y-axis (e.g. [2, 1])
  const yTicks = Array.from({ length: maxCount }, (_, i) => maxCount - i);

  return (
    <section className="scrapbook-board-container" aria-label="Mood Frequency Scrapbook Board">
      {/* Bulldog / Binder Clips */}
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

      {/* Main Torn Notepad Sheet */}
      <div className="scrapbook-board">
        {/* Board Header: Dymo Title + Clean Horizontal Legend */}
        <div className="scrapbook-board-header">
          <h2 className="dymo-label">MOOD FREQUENCY</h2>

          {/* Clean Mood Legend */}
          <div className="scrapbook-legend-row" role="list" aria-label="Mood category legend">
            {MOODS.map((mood) => (
              <div key={mood.name} className="scrapbook-legend-item" role="listitem">
                <span
                  className="scrapbook-legend-dot"
                  style={{ backgroundColor: mood.hex }}
                />
                <span className="scrapbook-legend-text">
                  {mood.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart Layout: Y-Axis on left, Plot area on right */}
        <div className="scrapbook-chart-wrapper">
          {/* Y-Axis Count Labels */}
          <div className="scrapbook-y-axis" aria-hidden="true">
            {yTicks.map((tick) => (
              <span key={tick} className="scrapbook-y-label">
                {tick}
              </span>
            ))}
            <span className="scrapbook-y-label scrapbook-y-label--zero">0</span>
          </div>

          {/* Chart Canvas Stage */}
          <div className="scrapbook-chart-stage">
            {/* Horizontal Dashed Gridlines */}
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

            {/* Bars Columns */}
            <div className="scrapbook-chart-cols">
              {buckets.map((bucket, bucketIdx) => (
                <div key={bucket.bucketIndex} className="scrapbook-chart-col">
                  {/* Cluster of 3 bars (Pink, Blue, Yellow) */}
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

                  {/* Column Label */}
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
