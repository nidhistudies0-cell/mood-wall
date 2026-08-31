import { useEffect, useState, useCallback } from "react";
import ComposeBar from "./components/ComposeBar.jsx";
import PostMoodModal from "./components/PostMoodModal.jsx";
import Wall from "./components/Wall.jsx";
import Timeline from "./components/Timeline.jsx";

const API_BASE = "/api/notes";
const NOTE_LIFETIME_MS = 5 * 60 * 60 * 1000; // 5 hours

export default function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("wall"); // 'wall' or 'compose'

  const activeNotes = notes.filter((n) => Date.now() - n.createdAt <= NOTE_LIFETIME_MS);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error("Failed to load the wall.");
      const data = await res.json();
      setNotes(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
    const interval = setInterval(fetchNotes, 5000);
    return () => clearInterval(interval);
  }, [fetchNotes]);

  async function handlePost({ status, handle, color, moodName }) {
    setPosting(true);
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, handle, color, moodName }),
      });
      if (!res.ok) throw new Error("Couldn't pin that note.");
      await fetchNotes();
      setViewMode("wall");
    } catch (err) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  }

  async function handleReact(id, reaction) {
    try {
      const res = await fetch(`${API_BASE}/${id}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction }),
      });
      if (!res.ok) throw new Error("Couldn't react to that note.");
      const updated = await res.json();
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app-shell">
      {/* Navigation Top Bar */}
      <header className="top-nav">
        <div className="top-nav__brand" onClick={() => setViewMode("wall")}>
          <span className="top-nav__logo-icon">⚡</span>
          <h1 className="top-nav__title">Mood Wall</h1>
        </div>

        <div className="top-nav__actions">
          <button
            className="top-nav__post-btn"
            onClick={() => setIsModalOpen(true)}
          >
            + Post Mood ↗
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="main-content">
        {error && <div className="banner banner--error">{error}</div>}

        {viewMode === "compose" ? (
          <section className="dedicated-compose-section">
            <h2 className="section-title">Share Your Current Vibe</h2>
            <ComposeBar onPost={handlePost} posting={posting} />
          </section>
        ) : (
          <>
            <Timeline notes={activeNotes} />
            <Wall notes={activeNotes} onReact={handleReact} loading={loading} />
          </>
        )}
      </main>

      {/* Popup Modal Page */}
      <PostMoodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPost={handlePost}
        posting={posting}
      />
    </div>
  );
}
