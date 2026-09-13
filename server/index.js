import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db.js";

const app = express();
const PORT = process.env.PORT || 4000;
const PgSession = connectPgSimple(session);

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use(
  session({
    store: new PgSession({ pool, tableName: "user_sessions", createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 5 * 60 * 60 * 1000,
    },
  })
);

const VALID_REACTIONS = ["fire", "laugh", "thumbs_down"];
const VALID_MOODS = ["HYPED UP", "LOW POWER", "TINY CRISIS"];

app.get("/api/notes", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, handle, status, color, mood_name AS "moodName",
              EXTRACT(EPOCH FROM created_at) * 1000 AS "createdAt",
              reactions
       FROM notes
       WHERE created_at > now() - interval '5 hours'
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load notes." });
  }
});

app.post("/api/notes", async (req, res) => {
  try {
    const { status, color, moodName, handle } = req.body;

    if (!status || !status.trim()) {
      return res.status(400).json({ error: "Status text is required." });
    }
    if (!color) {
      return res.status(400).json({ error: "A mood color is required." });
    }
    const cleanMood = VALID_MOODS.includes(moodName) ? moodName : "HYPED UP";

    const cleanHandle = handle && handle.trim()
      ? (handle.trim().startsWith("@") ? handle.trim() : `@${handle.trim()}`)
      : `@vibe_${Math.floor(Math.random() * 899 + 100)}`;

    const { rows } = await pool.query(
      `INSERT INTO notes (handle, status, color, mood_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, handle, status, color, mood_name AS "moodName",
                 EXTRACT(EPOCH FROM created_at) * 1000 AS "createdAt", reactions`,
      [cleanHandle, status.trim().slice(0, 140), color, cleanMood]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save note." });
  }
});

app.post("/api/notes/:id/react", async (req, res) => {
  const { id } = req.params;
  const { reaction } = req.body;
  const userKey = req.session.id;

  if (!VALID_REACTIONS.includes(reaction)) {
    return res.status(400).json({ error: "Invalid reaction type." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const noteCheck = await client.query(`SELECT id FROM notes WHERE id = $1`, [id]);
    if (noteCheck.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Note not found (it may have expired)." });
    }

    const existing = await client.query(
      `SELECT reaction FROM note_reactions WHERE note_id = $1 AND user_key = $2`,
      [id, userKey]
    );
    const prev = existing.rows[0]?.reaction;
    let finalReaction = reaction;

    if (prev === reaction) {
      await client.query(`DELETE FROM note_reactions WHERE note_id = $1 AND user_key = $2`, [id, userKey]);
      await client.query(
        `UPDATE notes SET reactions = jsonb_set(reactions, ARRAY[$2], (GREATEST(COALESCE((reactions->>$2)::int,0)-1,0))::text::jsonb) WHERE id = $1`,
        [id, reaction]
      );
      finalReaction = null;
    } else {
      if (prev) {
        await client.query(
          `UPDATE notes SET reactions = jsonb_set(reactions, ARRAY[$2], (GREATEST(COALESCE((reactions->>$2)::int,0)-1,0))::text::jsonb) WHERE id = $1`,
          [id, prev]
        );
      }
      await client.query(
        `INSERT INTO note_reactions (note_id, user_key, reaction) VALUES ($1, $2, $3)
         ON CONFLICT (note_id, user_key) DO UPDATE SET reaction = $3`,
        [id, userKey, reaction]
      );
      await client.query(
        `UPDATE notes SET reactions = jsonb_set(reactions, ARRAY[$2], (COALESCE((reactions->>$2)::int,0)+1)::text::jsonb) WHERE id = $1`,
        [id, reaction]
      );
    }

    const { rows } = await client.query(
      `SELECT id, handle, status, color, mood_name AS "moodName",
              EXTRACT(EPOCH FROM created_at) * 1000 AS "createdAt", reactions
       FROM notes WHERE id = $1`,
      [id]
    );

    await client.query("COMMIT");
    res.json({ ...rows[0], userReaction: finalReaction });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Failed to react to that note." });
  } finally {
    client.release();
  }
});

app.listen(PORT, () => {
  console.log(`Mood Wall server running on http://localhost:${PORT}`);
});