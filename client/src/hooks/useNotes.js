import { useState, useEffect, useCallback } from "react";
import { API_BASE, NOTE_LIFETIME_MS, POLL_INTERVAL_MS } from "../config.js";

export function useNotes(userId, recordReaction) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);

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
    const interval = setInterval(fetchNotes, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchNotes]);

  const handlePost = async ({ status, color, moodName }) => {
    setPosting(true);
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, color, moodName }),
      });
      if (!res.ok) throw new Error("Couldn't pin that note.");
      await fetchNotes();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setPosting(false);
    }
  };

  const handleReact = async (id, reaction) => {
    try {
      const res = await fetch(`${API_BASE}/${id}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction, userId }),
      });
      if (!res.ok) throw new Error("Couldn't react to that note.");
      const updated = await res.json();
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));

      if (recordReaction) {
        recordReaction(id, updated.userReaction);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const activeNotes = notes.filter((n) => Date.now() - n.createdAt <= NOTE_LIFETIME_MS);

  return {
    notes,
    activeNotes,
    loading,
    posting,
    error,
    fetchNotes,
    handlePost,
    handleReact,
  };
}
