export default function ScrapbookDecor() {
  return (
    <>
      {/* Subtle Paper Grain & Noise Filter Overlay across entire canvas */}
      <div className="scrapbook-grain-overlay" aria-hidden="true">
        <svg className="scrapbook-grain-svg">
          <filter id="scrapbook-paper-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.75"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.1 0 0 0 0 0.1 0 0 0 0 0.1 0 0 0 0.15 0"
            />
          </filter>
          <rect
            width="100%"
            height="100%"
            filter="url(#scrapbook-paper-grain)"
            opacity="0.45"
          />
        </svg>
      </div>

      {/* Decorative Background Washi Tapes & Scrapbook Details */}
      <div className="deco-washi-tape-top-right washi-clip" aria-hidden="true" />
      <div className="deco-washi-tape-left-grid washi-clip" aria-hidden="true" />
      <div className="deco-stamp-archive" aria-hidden="true">
        <span>MOOD ARCHIVE</span>
        <span>#0042 ♥</span>
      </div>
      <div className="deco-scrap-paper" aria-hidden="true">
        <svg className="deco-scrap-smiley" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="13" stroke="#006683" strokeWidth="1.8" />
          <circle cx="11.5" cy="12" r="1.5" fill="#006683" />
          <circle cx="20.5" cy="12" r="1.5" fill="#006683" />
          <path
            d="M10 18 Q16 25 22 18"
            stroke="#006683"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </>
  );
}
