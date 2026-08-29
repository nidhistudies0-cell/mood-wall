import { useState } from "react";
import { MOODS } from "../moods.js";

export default function PostMoodModal({ isOpen, onClose, onPost, posting }) {
  const [status, setStatus] = useState("");
  const [selectedMood, setSelectedMood] = useState(MOODS[0]);

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!status.trim()) return;

    onPost({
      status: status.trim(),
      color: selectedMood.hex,
      moodName: selectedMood.name,
    });
    setStatus("");
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-card__header">
          <h2 className="modal-card__title">Post a New Vibe</h2>
          <button className="modal-card__close" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-card__form">

          <div className="modal-card__field">
            <label className="modal-card__label" htmlFor="vibe-status">
              What's the energy?
            </label>
            <input
              id="vibe-status"
              type="text"
              className="modal-card__input-text"
              placeholder="Feeling radiant today…"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              maxLength={140}
              autoFocus
            />
          </div>

          <div className="modal-card__field">
            <span className="modal-card__label">Select Mood Color</span>
            <div className="modal-card__swatches">
              {MOODS.map((m) => {
                const isSelected = selectedMood.name === m.name;
                return (
                  <button
                    key={m.name}
                    type="button"
                    className={`mood-swatch-card ${isSelected ? "mood-swatch-card--selected" : ""}`}
                    style={{
                      backgroundColor: m.hex,
                      color: m.textColor || "#1A1A1A",
                    }}
                    onClick={() => setSelectedMood(m)}
                  >
                    <span className="mood-swatch-card__icon">{m.icon}</span>
                    <span className="mood-swatch-card__name">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="modal-card__footer">
            <button
              type="submit"
              className="modal-card__submit-btn"
              disabled={posting || !status.trim()}
            >
              {posting ? "Posting…" : "Post Vibe ↗"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
