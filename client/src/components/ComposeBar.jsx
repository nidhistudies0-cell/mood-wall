import { useState } from "react";
import { MOODS } from "../moods.js";

export default function ComposeBar({ onPost, posting, onOpenModal }) {
  const [status, setStatus] = useState("");
  const [mood, setMood] = useState(MOODS[0]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!status.trim()) return;
    onPost({
      status: status.trim(),
      color: mood.hex,
      moodName: mood.name,
    });
    setStatus("");
  }

  return (
    <div className="compose-bar-wrapper">
      <form className="compose-bar" onSubmit={handleSubmit}>
        <div className="compose-bar__inputs">
          <input
            type="text"
            className="compose-bar__input"
            placeholder="What's your vibe right now?"
            value={status}
            maxLength={140}
            onChange={(e) => setStatus(e.target.value)}
          />
        </div>

        <div className="compose-bar__actions">
          <div className="compose-bar__swatches" role="radiogroup" aria-label="Pick a mood color">
            {MOODS.map((m) => (
              <button
                key={m.name}
                type="button"
                className={`swatch-pill ${mood.name === m.name ? "swatch-pill--active" : ""}`}
                style={{ backgroundColor: m.hex, color: m.textColor }}
                aria-label={m.name}
                onClick={() => setMood(m)}
              >
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          <div className="compose-bar__buttons">
            <button type="submit" className="btn-primary" disabled={posting || !status.trim()}>
              {posting ? "Posting…" : "Post Vibe ↗"}
            </button>
            {onOpenModal && (
              <button type="button" className="btn-secondary" onClick={onOpenModal}>
                Pop Up Form ⤢
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
