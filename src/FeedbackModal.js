import React, { useEffect, useState } from "react";
import Stars from "./Stars";
import { getConversation, setConversationFeedback } from "./storage";

// Inline feedback card shown after a conversation is saved (it never covers the page).
export default function FeedbackModal({ conversationId, onClose }) {
  const existing = getConversation(conversationId);
  const [rating, setRating] = useState(existing ? existing.rating : 0);
  const [comment, setComment] = useState(existing ? existing.feedback : "");
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = () => {
    if (!rating && !comment.trim()) {
      setError("Add a star rating or a few words, or choose Skip.");
      return;
    }
    setConversationFeedback(conversationId, { rating, feedback: comment.trim() });
    onClose(true);
  };

  return (
    <div className="fb-card" role="region" aria-labelledby="fb-title">
      <h2 id="fb-title">How was this conversation?</h2>
      <p className="muted">Rate it out of 5 and tell us what you thought.</p>

      <Stars value={rating} onChange={setRating} label="Rate this conversation" />

      <label htmlFor="fb-comment">Anything you'd like to add?</label>
      <textarea
        id="fb-comment"
        rows={3}
        placeholder="Tell us what worked and what didn't"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      {error && <p className="error" role="alert">{error}</p>}

      <div className="fb-row">
        <button type="button" className="btn" onClick={() => onClose(false)}>Skip</button>
        <button type="button" className="btn primary" onClick={submit}>Submit feedback</button>
      </div>
    </div>
  );
}
