import { REACTIONS, moodByName } from "../moods.js";

function formatDuration(createdAt) {
  const diffMs = Math.max(0, Date.now() - createdAt);
  const totalMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export default function NoteCard({ note, onReact }) {
  const mood = moodByName(note.moodName);
  const isDarkBg = note.color === "#7C4DFF" || note.color === "#FF5252" || note.color === "#1A1A1A";

  return (
    <article
      className={`vibe-card ${isDarkBg ? "vibe-card--dark" : "vibe-card--light"}`}
      style={{
        backgroundColor: note.color || mood.hex,
        color: isDarkBg ? "#FFFFFF" : "#1A1A1A",
      }}
    >
      <div className="vibe-card__top">
        <div className="vibe-card__time-pill">
          <span className="vibe-card__clock-icon">🕒</span>
          <span>{formatDuration(note.createdAt)}</span>
        </div>
      </div>

      <p className="vibe-card__body">{note.status}</p>

      <div className="vibe-card__bottom">
        <span className="vibe-card__tag">
          {mood.icon} {mood.label}
        </span>

        <div className="vibe-card__reactions">
          {REACTIONS.map((r) => (
            <button
              key={r.key}
              type="button"
              className="vibe-card__reaction-btn"
              onClick={() => onReact(note.id, r.key)}
              aria-label={`React with ${r.key}`}
            >
              {r.emoji} <span className="vibe-card__reaction-count">{note.reactions[r.key]}</span>
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}
