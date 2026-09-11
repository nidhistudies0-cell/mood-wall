import NoteCard from "./NoteCard.jsx";

export default function Wall({ notes, userReactions, onReact, loading, onOpenPostModal }) {
  if (loading) {
    return (
      <div className="scrapbook-empty-state">
        <h3 className="scrapbook-empty-title">Loading the Mood Wall…</h3>
        <p className="scrapbook-empty-text">Pulling up the scrapbook pages.</p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <section className="scrapbook-wall-section" aria-label="Empty Mood Wall State">
        <div className="scrapbook-empty-grid">
          <div
            className="scrapbook-empty-card scrapbook-empty-card--pink"
            onClick={() => onOpenPostModal?.("HYPED UP")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpenPostModal?.("HYPED UP");
              }
            }}
          >
            <div className="scrapbook-empty-card-title">No Hyped Up moods yet</div>
            <div className="scrapbook-empty-card-desc">
              Running on adrenaline and zero sleep. This card's just waiting for someone to fill it.
            </div>
            <div className="scrapbook-empty-card-cta-wrap">
              <div className="scrapbook-empty-card-cta">
                <span>Be the first to post one</span>
                <span className="scrapbook-empty-card-arrow">→</span>
              </div>
            </div>
          </div>

          <div
            className="scrapbook-empty-card scrapbook-empty-card--blue"
            onClick={() => onOpenPostModal?.("LOW POWER")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpenPostModal?.("LOW POWER");
              }
            }}
          >
            <div className="scrapbook-empty-card-title">No Low Power moods yet</div>
            <div className="scrapbook-empty-card-desc">
              Battery at 12%, no charger in sight. Also, no entries. Coincidence?
            </div>
            <div className="scrapbook-empty-card-cta-wrap">
              <div className="scrapbook-empty-card-cta">
                <span>Be the first to post one</span>
                <span className="scrapbook-empty-card-arrow">→</span>
              </div>
            </div>
          </div>

          <div
            className="scrapbook-empty-card scrapbook-empty-card--yellow"
            onClick={() => onOpenPostModal?.("TINY CRISIS")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpenPostModal?.("TINY CRISIS");
              }
            }}
          >
            <div className="scrapbook-empty-card-title">No Tiny Crisis moods yet</div>
            <div className="scrapbook-empty-card-desc">
              Everything is fine. This card, however, is empty.
            </div>
            <div className="scrapbook-empty-card-cta-wrap">
              <div className="scrapbook-empty-card-cta">
                <span>Be the first to post one</span>
                <span className="scrapbook-empty-card-arrow">→</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="scrapbook-wall-section" aria-label="Mood Notes Grid">
      <div className="scrapbook-grid">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            userReaction={userReactions ? userReactions[note.id] : null}
            onReact={onReact}
          />
        ))}
      </div>
    </section>
  );
}
