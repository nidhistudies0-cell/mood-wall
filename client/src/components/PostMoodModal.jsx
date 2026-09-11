import { useState, useEffect } from "react";
import { MOODS } from "../mood/moodData.js";
import { moodByName } from "../mood/moodResolver.js";

const STATUS_PROMPTS = [
  "Just remembered I left the laundry in the washer again...",
  "Convinced my cat is running a secret second life...",
  "Wrote a whole email then forgot to send it...",
  "Said 'five more minutes' to my bed forty minutes ago...",
  "Listening to one song on repeat like it's my full-time job...",
  "Just had a deep thought in the food court...",
];

export default function PostMoodModal({ isOpen, onClose, onPost, posting, initialMoodName }) {
  const [status, setStatus] = useState("");
  const [selectedMood, setSelectedMood] = useState(MOODS[0]);
  const [statusPrompt] = useState(
    () => STATUS_PROMPTS[Math.floor(Math.random() * STATUS_PROMPTS.length)]
  );

  useEffect(() => {
    if (initialMoodName) {
      const mood = moodByName(initialMoodName);
      if (mood) setSelectedMood(mood);
    }
  }, [initialMoodName, isOpen]);

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
      <div className="scrapbook-modal-paper" onClick={(e) => e.stopPropagation()}>
        <div className="scrapbook-modal-washi washi-clip" aria-hidden="true" />

        <div className="scrapbook-modal-header">
          <span className="dymo-label" style={{ margin: 0 }}>
            STICK A MOOD
          </span>
          <button
            type="button"
            className="scrapbook-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="scrapbook-form-group">
            <label className="scrapbook-input-label" htmlFor="scrapbook-status">
              What's the vibe? 
            </label>
            <textarea
              id="scrapbook-status"
              className="scrapbook-textarea"
              placeholder={statusPrompt}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              maxLength={240}
              autoFocus
              required
            />
          </div>

          <div className="scrapbook-form-group">
            <span className="scrapbook-input-label">Pick Paper Color</span>
            <div className="scrapbook-swatches">
              {MOODS.map((m) => {
                const isSelected = selectedMood.name === m.name;
                return (
                  <button
                    key={m.name}
                    type="button"
                    className={`scrapbook-swatch-btn ${
                      isSelected ? "scrapbook-swatch-btn--selected" : ""
                    }`}
                    style={{ backgroundColor: m.hex }}
                    onClick={() => setSelectedMood(m)}
                  >
                    <span style={{ fontSize: "20px" }}>{m.icon}</span>
                    <span className="scrapbook-swatch-name">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="scrapbook-submit-btn"
            disabled={posting || !status.trim()}
          >
            {posting ? "PINNING..." : "STICK TO WALL ↗"}
          </button>
        </form>
      </div>
    </div>
  );
}
