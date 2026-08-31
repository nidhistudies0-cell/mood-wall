import { useState, useMemo, useEffect } from "react";
import { computeTimeline } from "../aggregate.js";
import { MOODS } from "../moods.js";

// Helper to create safe, valid SVG IDs (no spaces)
function getMoodKey(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "_");
}

export default function Timeline({ notes }) {
  const [hoveredCol, setHoveredCol] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Heartbeat to keep time ticks accurate and rolling forward in real time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const { buckets } = computeTimeline(notes, currentTime);

  // Vertically compact dimensions
  const width = 940;
  const height = 225; // Vertically shorter (was 310)
  const paddingLeft = 50;
  const paddingRight = 45;
  const paddingTop = 42; // Room for callout badges
  const paddingBottom = 48; // Room for X-axis labels
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom; // ~135px
  const baselineY = paddingTop + plotHeight;

  // Find max count across all moods and buckets to scale Y axis
  const maxCount = useMemo(() => {
    let max = 2;
    for (const b of buckets) {
      for (const item of b.breakdown) {
        if (item.count > max) max = item.count;
      }
    }
    return max;
  }, [buckets]);

  // Compute (x, y) coordinates for each mood across the 10 buckets
  const seriesData = useMemo(() => {
    const totalBuckets = buckets.length;

    return MOODS.map((mood, moodIndex) => {
      const points = buckets.map((bucket, i) => {
        const x = paddingLeft + (i * plotWidth) / (totalBuckets - 1);
        const item = bucket.breakdown.find(
          (b) => b.moodName.toLowerCase() === mood.name.toLowerCase()
        );
        const count = item ? item.count : 0;
        const y = baselineY - (count / maxCount) * plotHeight;
        return {
          x,
          y,
          count,
          bucket,
          index: i,
          moodIndex,
        };
      });

      // SVG Line path (connecting points)
      const linePath = points
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
        .join(" ");

      // SVG Area path (closed down to baseline)
      const areaPath = `M ${points[0].x} ${baselineY} ${points
        .map((p) => `L ${p.x} ${p.y}`)
        .join(" ")} L ${points[points.length - 1].x} ${baselineY} Z`;

      // Find peak point for callout badge
      const maxPoint = points.reduce(
        (prev, curr) => (curr.count > prev.count ? curr : prev),
        points[0]
      );

      return {
        mood,
        moodKey: getMoodKey(mood.name),
        points,
        linePath,
        areaPath,
        peakPoint: maxPoint.count > 0 ? maxPoint : null,
      };
    });
  }, [buckets, plotWidth, plotHeight, baselineY, maxCount]);

  // Y-axis ticks (integer levels)
  const yTicks = useMemo(() => {
    const ticks = [];
    const step = maxCount <= 4 ? 1 : Math.ceil(maxCount / 4);
    for (let c = 0; c <= maxCount; c += step) {
      const y = baselineY - (c / maxCount) * plotHeight;
      ticks.push({ value: c, y });
    }
    return ticks;
  }, [maxCount, baselineY, plotHeight]);

  // Calculate callout badges to display ONLY when hovered
  const activeBadges = useMemo(() => {
    if (hoveredCol === null) return [];

    const badges = [];
    const activeInCol = [];
    seriesData.forEach((s) => {
      const pt = s.points[hoveredCol];
      if (pt && pt.count > 0) {
        activeInCol.push({ mood: s.mood, point: pt });
      }
    });

    // Position badges with horizontal offset if multiple moods have the same Y
    activeInCol.forEach((item, idx, arr) => {
      let xOffset = 0;
      const sameY = arr.filter((other) => other.point.y === item.point.y);
      if (sameY.length > 1) {
        const rank = sameY.indexOf(item);
        xOffset = (rank - (sameY.length - 1) / 2) * 44;
      }
      badges.push({
        mood: item.mood,
        x: item.point.x + xOffset,
        y: item.point.y,
        count: item.point.count,
      });
    });

    return badges;
  }, [hoveredCol, seriesData]);

  return (
    <section className="vibe-multi-area-card" aria-label="Mood Changes Timeline Chart">
      {/* Header with single clean title and legend */}
      <div className="vibe-multi-area-header">
        <h2 className="vibe-multi-area-title">Mood Frequency</h2>

        {/* Legend */}
        <div className="vibe-multi-area-legend">
          {MOODS.map((mood) => (
            <div key={mood.name} className="vibe-multi-area-legend-item">
              <span
                className="vibe-multi-area-legend-line"
                style={{ backgroundColor: mood.hex }}
              />
              <span
                className="vibe-multi-area-legend-dot"
                style={{ backgroundColor: mood.hex }}
              />
              <span className="vibe-multi-area-legend-text">
                {mood.icon} {mood.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG Multi-Line Area Chart Container */}
      <div className="vibe-multi-area-chart-wrap">
        <svg
          className="vibe-multi-area-svg"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
        >
          <defs>
            {/* Safe valid SVG linear gradients with clean mood colors */}
            {MOODS.map((mood) => {
              const key = getMoodKey(mood.name);
              return (
                <linearGradient
                  key={`grad-${key}`}
                  id={`grad-${key}`}
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={mood.hex} stopOpacity="0.45" />
                  <stop offset="100%" stopColor={mood.hex} stopOpacity="0.04" />
                </linearGradient>
              );
            })}
          </defs>

          {/* Faint Background Grid (Horizontal lines) */}
          {yTicks.map((tick) => (
            <g key={tick.value}>
              <line
                x1={paddingLeft}
                y1={tick.y}
                x2={width - paddingRight}
                y2={tick.y}
                stroke="#EFEBF6"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 8}
                y={tick.y + 4}
                textAnchor="end"
                fontSize="10.5"
                fontWeight="700"
                fill="#888888"
                fontFamily="'Plus Jakarta Sans', sans-serif"
              >
                {tick.value}
              </text>
            </g>
          ))}

          {/* Vertical Grid Lines & Hover Area for each 30-min window */}
          {buckets.map((bucket, i) => {
            const x = paddingLeft + (i * plotWidth) / (buckets.length - 1);
            const isHovered = hoveredCol === i;

            return (
              <g key={`col-${bucket.bucketIndex}`}>
                {/* Vertical grid line */}
                <line
                  x1={x}
                  y1={paddingTop - 6}
                  x2={x}
                  y2={baselineY}
                  stroke={isHovered ? "#1A1A1A" : "#F2EEF8"}
                  strokeWidth={isHovered ? "1.5" : "1"}
                  strokeDasharray={isHovered ? "3 3" : undefined}
                />

                {/* X-Axis Tick Label (e.g. 4.5h, Now) */}
                <text
                  x={x}
                  y={baselineY + 18}
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight={bucket.isCurrent ? "800" : "700"}
                  fill={bucket.isCurrent ? "#7C4DFF" : "#333333"}
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                >
                  {bucket.isCurrent ? "Now" : bucket.shortLabel}
                </text>

                {/* Clock time for this point */}
                <text
                  x={x}
                  y={baselineY + 31}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="600"
                  fill="#777777"
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                >
                  {bucket.pointTime}
                </text>

                {/* NOW Pill Badge for the latest slot */}
                {bucket.isCurrent && (
                  <g transform={`translate(${x - 15}, ${baselineY + 35})`}>
                    <rect
                      width="30"
                      height="14"
                      rx="3.5"
                      fill="#7C4DFF"
                      stroke="#1A1A1A"
                      strokeWidth="1"
                    />
                    <text
                      x="15"
                      y="10.5"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="7.5"
                      fontWeight="800"
                      fontFamily="'Plus Jakarta Sans', sans-serif"
                    >
                      NOW
                    </text>
                  </g>
                )}

                {/* Catch area for column hover */}
                <rect
                  x={x - plotWidth / (buckets.length - 1) / 2}
                  y={paddingTop - 10}
                  width={plotWidth / (buckets.length - 1)}
                  height={plotHeight + 35}
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredCol(i)}
                  onMouseLeave={() => setHoveredCol(null)}
                />
              </g>
            );
          })}

          {/* Clean Shaded Areas for each mood series (using valid gradient IDs) */}
          {seriesData.map((s) => (
            <path
              key={`area-${s.moodKey}`}
              d={s.areaPath}
              fill={`url(#grad-${s.moodKey})`}
              style={{ mixBlendMode: "multiply" }}
            />
          ))}

          {/* Stroke Lines for each mood series */}
          {seriesData.map((s) => (
            <path
              key={`line-${s.moodKey}`}
              d={s.linePath}
              fill="none"
              stroke={s.mood.hex}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Data Dots on each point (staggered slightly if same count to keep all visible) */}
          {seriesData.map((s, moodIdx) =>
            s.points.map((p) => {
              const isColHovered = hoveredCol === p.index;
              const hasCount = p.count > 0;

              // If multiple moods have count > 0 at this point, stagger X slightly
              let dotX = p.x;
              if (hasCount) {
                const sameCountMoods = seriesData.filter(
                  (other) => other.points[p.index].count === p.count && other.points[p.index].count > 0
                );
                if (sameCountMoods.length > 1) {
                  const rank = sameCountMoods.findIndex((other) => other.mood.name === s.mood.name);
                  dotX += (rank - (sameCountMoods.length - 1) / 2) * 6;
                }
              }

              return (
                <circle
                  key={`dot-${s.moodKey}-${p.index}`}
                  cx={dotX}
                  cy={p.y}
                  r={isColHovered && hasCount ? 6.5 : 4.5}
                  fill="#FFFFFF"
                  stroke={s.mood.hex}
                  strokeWidth={isColHovered && hasCount ? 3 : 2}
                  style={{ transition: "all 0.15s ease", cursor: "pointer" }}
                  onMouseEnter={() => setHoveredCol(p.index)}
                  onMouseLeave={() => setHoveredCol(null)}
                />
              );
            })
          )}

          {/* Callout Badges with pointer arrow (positioned without overlapping) */}
          {activeBadges.map((badge, idx) => {
            const badgeW = 42;
            const badgeH = 22;
            const bx = badge.x - badgeW / 2;
            const by = badge.y - badgeH - 7;

            return (
              <g
                key={`badge-${badge.mood.name}-${idx}`}
                className="vibe-callout-badge"
                style={{ pointerEvents: "none" }}
              >
                {/* Speech Bubble Box */}
                <rect
                  x={bx}
                  y={by}
                  width={badgeW}
                  height={badgeH}
                  rx={5}
                  fill={badge.mood.hex}
                  stroke="#1A1A1A"
                  strokeWidth="1.5"
                  style={{ filter: "drop-shadow(1px 2px 0px rgba(0,0,0,0.16))" }}
                />
                {/* Downward Pointer Arrow */}
                <polygon
                  points={`${badge.x - 3.5},${by + badgeH} ${badge.x},${badge.y - 2} ${badge.x + 3.5},${
                    by + badgeH
                  }`}
                  fill={badge.mood.hex}
                  stroke="#1A1A1A"
                  strokeWidth="1"
                />
                {/* Count Text */}
                <text
                  x={badge.x}
                  y={by + 15}
                  textAnchor="middle"
                  fill={badge.mood.textColor || "#1A1A1A"}
                  fontSize="11"
                  fontWeight="800"
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                >
                  {badge.count}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
