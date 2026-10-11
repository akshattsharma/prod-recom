import React, { useEffect, useRef, useState } from "react";
import { FiThumbsUp, FiThumbsDown } from "react-icons/fi";
import Stars from "./Stars";
import FeedbackModal from "./FeedbackModal";
import { GREETING, STARTERS } from "./bot";

function Reactions({ msg, onFeedback }) {
  const fb = msg.feedback || {};
  const [panel, setPanel] = useState(null);
  const [comment, setComment] = useState(fb.comment || "");

  const vote = (v) => {
    onFeedback(msg.id, { vote: v });
    setPanel(v);
  };

  const submitComment = () => {
    onFeedback(msg.id, { comment: comment.trim() });
    setPanel(null);
  };

  return (
    <>
      <div className={`actions${fb.vote ? " voted" : ""}`}>
        <button type="button" className={fb.vote === "up" ? "active" : ""} aria-label="Like this response"
          aria-pressed={fb.vote === "up"} onClick={() => vote("up")}>
          <FiThumbsUp />
        </button>
        <button type="button" className={fb.vote === "down" ? "active" : ""} aria-label="Dislike this response"
          aria-pressed={fb.vote === "down"} onClick={() => vote("down")}>
          <FiThumbsDown />
        </button>
      </div>

      {panel === "up" && (
        <div className="fb-panel">
          <p>Glad it helped! How would you rate this answer?</p>
          <Stars value={fb.stars || 0} onChange={(n) => onFeedback(msg.id, { stars: n })} label="Rate this response" />
          <button type="button" className="link" onClick={() => setPanel(null)}>Done</button>
        </div>
      )}

      {panel === "down" && (
        <div className="fb-panel">
          <label htmlFor={`c-${msg.id}`}>What could be better?</label>
          <textarea id={`c-${msg.id}`} rows={3} placeholder="Tell us what was wrong with this answer"
            value={comment} onChange={(e) => setComment(e.target.value)} />
          <div className="fb-row">
            <button type="button" className="link" onClick={() => setPanel(null)}>Cancel</button>
            <button type="button" className="btn primary small" onClick={submitComment}>Submit</button>
          </div>
        </div>
      )}

      {panel === null && fb.vote === "up" && fb.stars > 0 && <Stars value={fb.stars} readOnly />}
      {panel === null && fb.vote === "down" && fb.comment && <p className="fb-note">Your feedback: {fb.comment}</p>}
    </>
  );
}

export default function Chat({ messages, notice, feedbackId, onAsk, onSave, onCloseFeedback, onFeedback }) {
  const [text, setText] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const submit = (e) => {
    e.preventDefault();
    if (onAsk(text)) setText("");
  };

  return (
    <section className="chat">
      <div className="stage" ref={listRef}>
        {messages.length === 0 ? (
          <div className="hero">
            <div className="hero-mark" aria-hidden="true">AI</div>
            <h2>How can I help you today?</h2>
            <p className="muted">{GREETING}</p>
            <div className="starters">
              {STARTERS.map((s) => (
                <button type="button" key={s} className="starter" onClick={() => onAsk(s)}>{s}</button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div className={`msg ${m.role}`} key={m.id}>
              <div className="avatar" aria-hidden="true">{m.role === "ai" ? "AI" : "You"}</div>
              <div className="bubble-wrap">
                <p className="who">{m.role === "ai" ? "Product AI" : "You"}</p>
                <div className="bubble">{m.text}</div>
                {m.role === "ai" && m.choices && (
                  <div className="choices">
                    {m.choices.map((c) => (
                      <button type="button" key={c} className="chip" onClick={() => onAsk(c)}>{c}</button>
                    ))}
                  </div>
                )}
                {m.role === "ai" && <Reactions msg={m} onFeedback={onFeedback} />}
              </div>
            </div>
          ))
        )}
      </div>

      {notice && <p className="notice" role="status">{notice}</p>}
      {feedbackId && messages.length > 0 && (
        <FeedbackModal key={feedbackId} conversationId={feedbackId} onClose={onCloseFeedback} />
      )}

      <form className="composer" onSubmit={submit}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Please tell me about your query!"
          aria-label="Your message"
        />
        <button type="submit" name="ask" className="btn primary">Ask</button>
        {messages.length > 0 && <button type="button" name="save" className="btn" onClick={onSave}>Save</button>}
      </form>
    </section>
  );
}