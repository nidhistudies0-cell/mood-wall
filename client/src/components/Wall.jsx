import NoteCard from "./NoteCard.jsx";

export default function Wall({ notes, onReact, loading }) {
  if (loading) {
    return <div className="wall-status">Loading the mood wall…</div>;
  }

  if (notes.length === 0) {
    return (
      <div className="wall-status">
        The wall is empty right now — be the first to post your vibe!
      </div>
    );
  }

  return (
    <div className="wall-container">
      <div className="wall-grid">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} onReact={onReact} />
        ))}
      </div>
    </div>
  );
}
