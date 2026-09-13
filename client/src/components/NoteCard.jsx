import { REACTIONS } from "../mood/moodData.js";
import { moodByName } from "../mood/moodResolver.js";

function formatStampDuration(createdAt) {
  const diffMs = Math.max(0, Date.now() - createdAt);
  const totalMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMins / 60);
  if (hours > 0) return `${hours}H AGO`;
  return `${Math.max(1, totalMins)}M AGO`;
}

export default function NoteCard({ note, userReaction, onReact }) {
  const mood = moodByName(note.moodName);
  const stampText = formatStampDuration(note.createdAt);

  const isBlue =
    mood.name === "Low Power" ||
    note.color === "#34CDFC";

  const isYellow =
    mood.name === "Tiny Crisis" ||
    note.color === "#FFE359";

  function renderReactionButtons() {
    return (
      <div className="scrapbook-card-reactions">
        {REACTIONS.map((r) => {
          const isMyReaction = userReaction === r.key;
          return (
            <button
              key={r.key}
              type="button"
              className={`scrapbook-reaction-btn ${
                isMyReaction ? "scrapbook-reaction-btn--active" : ""
              }`}
              onClick={() => onReact(note.id, r.key)}
              aria-label={`React ${r.key}`}
              aria-pressed={isMyReaction}
            >
              <span className="scrapbook-reaction-icon">{r.symbol}</span>
              {note.reactions && note.reactions[r.key] > 0 && (
                <span className="scrapbook-reaction-count">
                  {note.reactions[r.key]}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  if (isBlue) {
    return (
      <article className="scrapbook-card scrapbook-card--blue">
        <div className="scrapbook-card-washi washi-clip" aria-hidden="true" />

        <div className="scrapbook-peeking-sticker scrapbook-peeking-sticker--flower" aria-hidden="true">
          <svg viewBox="0 0 36 36" width="34" height="34">
            <circle cx="18" cy="8" r="6" fill="#FF8ECA" stroke="#1A1A1A" strokeWidth="2" />
            <circle cx="28" cy="18" r="6" fill="#FF8ECA" stroke="#1A1A1A" strokeWidth="2" />
            <circle cx="18" cy="28" r="6" fill="#FF8ECA" stroke="#1A1A1A" strokeWidth="2" />
            <circle cx="8" cy="18" r="6" fill="#FF8ECA" stroke="#1A1A1A" strokeWidth="2" />
            <circle cx="18" cy="18" r="5" fill="#FFE359" stroke="#1A1A1A" strokeWidth="2" />
          </svg>
        </div>

        <div className="scrapbook-card-header">
          <h3 className="scrapbook-card-title scrapbook-card-title--boxed">
            {mood.label}
          </h3>
          <span className="scrapbook-stamp scrapbook-stamp--blue">
            {stampText}
          </span>
        </div>

        <p className="scrapbook-card-body">{note.status}</p>

        <div className="scrapbook-card-bottom">
          {renderReactionButtons()}
        </div>
      </article>
    );
  }

  if (isYellow) {
    return (
      <article className="scrapbook-card scrapbook-card--yellow">
        <div className="scrapbook-card-washi--green washi-clip" aria-hidden="true" />

        <div className="scrapbook-peeking-sticker scrapbook-peeking-sticker--smiley" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="32" height="32">
            <circle cx="16" cy="16" r="14" fill="#34CDFC" stroke="#1A1A1A" strokeWidth="2.5" />
            <circle cx="11" cy="13" r="1.5" fill="#1A1A1A" />
            <circle cx="21" cy="13" r="1.5" fill="#1A1A1A" />
            <path d="M11 20 Q16 25 21 20" fill="none" stroke="#1A1A1A" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>

        <div className="scrapbook-card-header" style={{ marginTop: "10px" }}>
          <h3 className="scrapbook-card-title">
            <span className="scrapbook-card-heart">♡</span>
            {mood.label}
          </h3>
          <span className="scrapbook-stamp scrapbook-stamp--yellow">
            {stampText}
          </span>
        </div>

        <p className="scrapbook-card-body">{note.status}</p>

        <div className="scrapbook-card-bottom">
          {renderReactionButtons()}
        </div>
      </article>
    );
  }

  return (
    <article className="scrapbook-card scrapbook-card--pink">
      <div className="scrapbook-pushpin" aria-hidden="true">
        <div className="scrapbook-pushpin-head">
          <div className="scrapbook-pushpin-shine" />
        </div>
        <div className="scrapbook-pushpin-needle" />
        <span className="scrapbook-pushpin-sparkle">✨</span>
      </div>

      <div className="scrapbook-peeking-sticker scrapbook-peeking-sticker--star" aria-hidden="true">
        <svg viewBox="0 0 36 36" width="34" height="34">
          <polygon
            points="18,2 22.5,12.5 34,14 25.5,21.5 28,33 18,27 8,33 10.5,21.5 2,14 13.5,12.5"
            fill="#FFE359"
            stroke="#1A1A1A"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle cx="14" cy="17" r="1.5" fill="#1A1A1A" />
          <circle cx="22" cy="17" r="1.5" fill="#1A1A1A" />
          <path d="M15 22 Q18 25 21 22" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <div className="scrapbook-card-header" style={{ marginTop: "6px" }}>
        <h3 className="scrapbook-card-title">{mood.label}</h3>
        <span className="scrapbook-stamp scrapbook-stamp--pink">
          {stampText}
        </span>
      </div>

      <p className="scrapbook-card-body">{note.status}</p>

      <div className="scrapbook-card-divider" />

      <div className="scrapbook-card-bottom" style={{ borderTop: "none", paddingTop: 0 }}>
        {renderReactionButtons()}
      </div>
    </article>
  );
}
