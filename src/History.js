import React, { useState } from "react";
import { Link } from "react-router-dom";
import Stars from "./Stars";
import { getConversations, deleteConversation } from "./storage";

const FILTERS = [
  ["all", "All ratings"],
  ["5", "5 stars"],
  ["4", "4 stars"],
  ["3", "3 stars"],
  ["2", "2 stars"],
  ["1", "1 star"],
  ["0", "Not rated"],
];

function replyFeedback(fb) {
  if (!fb || !fb.vote) return null;
  if (fb.vote === "up") return `Liked${fb.stars ? ` · ${fb.stars}/5` : ""}`;
  return `Disliked${fb.comment ? ` · “${fb.comment}”` : ""}`;
}

export default function History() {
  const [list, setList] = useState(getConversations);
  const [filter, setFilter] = useState("all");

  const shown = list
    .filter((c) => filter === "all" || (c.rating || 0) === Number(filter))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <section className="history">
      <div className="history-head">
        <h2>Past Conversations</h2>
        <div className="filter">
          <label htmlFor="rating-filter">Filter by rating</label>
          <select id="rating-filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
            {FILTERS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="empty">
          <p className="muted">
            {list.length === 0 ? "No saved conversations yet." : "No conversations match this rating."}
          </p>
          <Link to="/" className="btn primary">Start a chat</Link>
        </div>
      ) : (
        <div className="conv-list">
          {shown.map((c) => (
            <article className="conv" key={c.id}>
              <header>
                <span className="conv-date">{new Date(c.date).toLocaleString()}</span>
                <div className="conv-meta">
                  {c.rating > 0 ? <Stars value={c.rating} readOnly /> : <span className="muted">Not rated</span>}
                  <button type="button" className="link danger" onClick={() => setList(deleteConversation(c.id))}>
                    Delete
                  </button>
                </div>
              </header>

              {c.messages.map((m) => (
                <div className={`hmsg ${m.role}`} key={m.id}>
                  <strong>{m.role === "ai" ? "Product AI" : "You"}</strong>
                  <p>{m.text}</p>
                  {m.role === "ai" && replyFeedback(m.feedback) && (
                    <span className="fb-note">{replyFeedback(m.feedback)}</span>
                  )}
                </div>
              ))}

              {c.feedback && <p className="conv-feedback">Feedback: “{c.feedback}”</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
