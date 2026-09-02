import { useState, useEffect } from "react";
import { MOODS } from "../mood/moodData.js";
import { moodByName } from "../mood/moodResolver.js";

export default function PostMoodModal({ isOpen, onClose, onPost, posting, initialMoodName }) {
  const [status, setStatus] = useState("");
  const [selectedMood, setSelectedMood] = useState(MOODS[0]);

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
        {/* Washi tape on modal top */}
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
          {/* Note Status Content */}
          <div className="scrapbook-form-group">
            <label className="scrapbook-input-label" htmlFor="scrapbook-status">
              What's the vibe? 
            </label>
            <textarea
              id="scrapbook-status"
              className="scrapbook-textarea"
              placeholder="Just got the new transparent pager. It's totally off the hook..."
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              maxLength={240}
              autoFocus
              required
            />
          </div>

          {/* Mood Swatches */}
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

          {/* Submit */}
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
