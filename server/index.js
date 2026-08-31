import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// How long a note stays on the wall before it expires (ms)
const NOTE_LIFETIME_MS = 5 * 60 * 60 * 1000; // 5 hours

// In-memory store initialized with demo vibes matching the design reference
let notes = [];

function isExpired(note) {
  return Date.now() - note.createdAt > NOTE_LIFETIME_MS;
}

function pruneExpired() {
  const initialCount = notes.length;
  notes = notes.filter((note) => !isExpired(note));
  if (notes.length < initialCount) {
    console.log(`[Auto-Expire] Pruned ${initialCount - notes.length} expired note(s) (> 5 hours old). Remaining: ${notes.length}`);
  }
}

// Automatically prune expired notes every 10 seconds in the background
setInterval(pruneExpired, 10000);

// GET /api/notes — return all active (non-expired) notes, newest first
app.get("/api/notes", (req, res) => {
  pruneExpired();
  const sorted = [...notes].sort((a, b) => b.createdAt - a.createdAt);
  res.json(sorted);
});

// POST /api/notes — create a new note
app.post("/api/notes", (req, res) => {
  const { status, color, moodName, handle } = req.body;

  if (!status || !status.trim()) {
    return res.status(400).json({ error: "Status text is required." });
  }
  if (!color) {
    return res.status(400).json({ error: "A mood color is required." });
  }

  const cleanHandle = handle && handle.trim() 
    ? (handle.trim().startsWith("@") ? handle.trim() : `@${handle.trim()}`)
    : `@vibe_${Math.floor(Math.random() * 899 + 100)}`;

  const note = {
    id: randomUUID(),
    handle: cleanHandle,
    status: status.trim().slice(0, 140),
    color,
    moodName: moodName || "Locked In",
    createdAt: Date.now(),
    reactions: { fire: 0, laugh: 0, dead: 0 },
  };

  notes.push(note);
  res.status(201).json(note);
});

// POST /api/notes/:id/react — increment a reaction count on a note
const VALID_REACTIONS = ["fire", "laugh", "dead"];

app.post("/api/notes/:id/react", (req, res) => {
  pruneExpired();
  const { id } = req.params;
  const { reaction } = req.body;

  if (!VALID_REACTIONS.includes(reaction)) {
    return res.status(400).json({ error: "Invalid reaction type." });
  }

  const note = notes.find((n) => n.id === id);
  if (!note) {
    return res.status(404).json({ error: "Note not found (it may have expired)." });
  }

  note.reactions[reaction] += 1;
  res.json(note);
});

app.listen(PORT, () => {
  console.log(`Vibe Check server running on http://localhost:${PORT}`);
});
