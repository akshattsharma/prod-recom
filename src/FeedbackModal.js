import React, { useEffect, useState } from "react";
import Stars from "./Stars";
import { getConversation, setConversationFeedback } from "./storage";

export default function FeedbackModal({ conversationId, onClose }) {
  const existing = getConversation(conversationId);
  const [rating, setRating] = useState(existing ? existing.rating : 0);
  const [comment, setComment] = useState(existing ? existing.feedback : "");
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = (e) => {
    e.preventDefault();
    if (!rating && !comment.trim()) {
      setError("Add a star rating or a few words, or choose Skip.");
      return;
    }
    setConversationFeedback(conversationId, { rating, feedback: comment.trim() });
    onClose();
  };

  return (
    <div className="overlay">
      <form className="modal" role="dialog" aria-modal="true" aria-labelledby="fb-title" onSubmit={submit}>
        <h2 id="fb-title">How was this conversation?</h2>
        <p className="muted">Your feedback helps improve the recommendations.</p>

        <Stars value={rating} onChange={setRating} label="Rate this conversation" />

        <label htmlFor="fb-comment">Anything you'd like to add?</label>
        <textarea
          id="fb-comment"
          rows={4}
          placeholder="Tell us what worked and what didn't"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        {error && <p className="error" role="alert">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>Skip</button>
          <button type="submit" className="btn primary">Submit</button>
        </div>
      </form>
    </div>
  );
}
