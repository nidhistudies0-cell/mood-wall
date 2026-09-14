import { useState } from "react";
import ComposeBar from "./components/ComposeBar.jsx";
import PostMoodModal from "./components/PostMoodModal.jsx";
import Wall from "./components/Wall.jsx";
import Timeline from "./components/Timeline.jsx";
import ScrapbookDecor from "./components/ScrapbookDecor.jsx";
import { useUserIdentity } from "./hooks/useUserIdentity.js";
import { useNotes } from "./hooks/useNotes.js";

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMood, setModalMood] = useState(null);
  const [viewMode, setViewMode] = useState("wall"); 

 const { userReactions, recordReaction } = useUserIdentity();
  const { activeNotes, loading, posting, error, handlePost, handleReact } = useNotes(recordReaction);
  const handleOpenPostModal = (moodName) => {
    setModalMood(moodName || null);
    setIsModalOpen(true);
  };

  const onPost = async (entry) => {
    const ok = await handlePost(entry);
    if (ok) setViewMode("wall");
  };

  return (
    <div className="app-shell relative">
      <ScrapbookDecor />

      <header className="scrapbook-header">
        <div className="scrapbook-brand-group" onClick={() => setViewMode("wall")}>
          <div className="scrapbook-brand-title-wrap">
            <span className="scrapbook-brand">Mood Wall</span>
          </div>
        </div>

        <button
          type="button"
          className="scrapbook-new-entry-btn"
          onClick={() => handleOpenPostModal()}
        >
          <span className="scrapbook-btn-icon">add_circle</span>
          <span>POST A MOOD</span>
        </button>
      </header>

      <main className="scrapbook-main">
        {error && <div className="banner banner--error">{error}</div>}

        {viewMode === "compose" ? (
          <section className="scrapbook-empty-state">
            <h2 className="scrapbook-empty-title">Share Your Diary Entry</h2>
            <ComposeBar onPost={onPost} posting={posting} />
          </section>
        ) : (
          <>
            <Timeline notes={activeNotes} />
            <Wall
              notes={activeNotes}
              userReactions={userReactions}
              onReact={handleReact}
              loading={loading}
              onOpenPostModal={handleOpenPostModal}
            />
          </>
        )}
      </main>

      <PostMoodModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalMood(null);
        }}
        onPost={onPost}
        posting={posting}
        initialMoodName={modalMood}
      />
    </div>
  );
}
