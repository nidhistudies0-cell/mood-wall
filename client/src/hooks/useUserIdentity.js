import { useState } from "react";

export function useUserIdentity() {
  // Persistent anonymous user ID to enforce one reaction per user per note
  const [userId] = useState(() => {
    let uid = localStorage.getItem("vibe_user_id");
    if (!uid) {
      uid = "u_" + Math.random().toString(36).slice(2, 12);
      localStorage.setItem("vibe_user_id", uid);
    }
    return uid;
  });

  // Track the user's active reaction for each note
  const [userReactions, setUserReactions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("vibe_user_reactions") || "{}");
    } catch {
      return {};
    }
  });

  const recordReaction = (noteId, reaction) => {
    setUserReactions((prev) => {
      const next = { ...prev };
      if (reaction) {
        next[noteId] = reaction;
      } else {
        delete next[noteId];
      }
      localStorage.setItem("vibe_user_reactions", JSON.stringify(next));
      return next;
    });
  };

  return { userId, userReactions, recordReaction };
}
