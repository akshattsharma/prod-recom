import React, { useEffect, useRef, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import { FiMoon, FiSun } from "react-icons/fi";
import Chat from "./Chat";
import History from "./History";
import { getReply } from "./bot";
import { logFeedback, upsertConversation } from "./storage";

const newId = (prefix) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [messages, setMessages] = useState([]);
  const [ctx, setCtx] = useState(null);
  const [savedId, setSavedId] = useState(null);
  const [feedbackId, setFeedbackId] = useState(null);
  const [notice, setNotice] = useState("");
  const timer = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Keep a saved conversation up to date when thumbs feedback is added afterwards.
  useEffect(() => {
    if (savedId && messages.length) upsertConversation(savedId, messages);
  }, [messages, savedId]);

  const flash = (text) => {
    setNotice(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(""), 3000);
  };

  const ask = (input) => {
    const text = input.trim();
    if (!text) return false;
    const reply = getReply(text, ctx);
    setMessages((m) => [
      ...m,
      { id: newId("u"), role: "user", text },
      { id: newId("a"), role: "ai", text: reply.text },
    ]);
    setCtx(reply.ctx);
    return true;
  };

  const save = () => {
    if (!messages.length) {
      flash("Ask something first, then save the conversation.");
      return;
    }
    const id = savedId || newId("c");
    upsertConversation(id, messages);
    setSavedId(id);
    setFeedbackId(id);
    flash("Conversation saved.");
  };

  const newChat = () => {
    if (messages.length) upsertConversation(savedId || newId("c"), messages);
    setMessages([]);
    setCtx(null);
    setSavedId(null);
    setFeedbackId(null);
    setNotice("");
  };

  const closeFeedback = (submitted) => {
    setFeedbackId(null);
    if (submitted) flash("Thanks for your feedback!");
  };

  const giveFeedback = (messageId, patch) => {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;
    const feedback = { ...(msg.feedback || {}), ...patch };
    setMessages((ms) => ms.map((m) => (m.id === messageId ? { ...m, feedback } : m)));
    logFeedback({ messageId, reply: msg.text, ...feedback, at: new Date().toISOString() });
  };

  return (
    <div className="shell">
      <header className="top">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">AI</span>
          <h1>Product Recommendation AI</h1>
        </div>
        <nav className="top-nav">
          <NavLink to="/" end onClick={newChat}>Want new suggestion?</NavLink>
          <NavLink to="/history">Previous Suggestions</NavLink>
          <button
            type="button"
            className="icon-btn"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <FiSun /> : <FiMoon />}
          </button>
        </nav>
      </header>

      <main className="main">
        <Routes>
          <Route path="/history" element={<History />} />
          <Route
            path="*"
            element={
              <Chat messages={messages} notice={notice} feedbackId={feedbackId} onAsk={ask}
                onSave={save} onCloseFeedback={closeFeedback} onFeedback={giveFeedback} />
            }
          />
        </Routes>
      </main>
    </div>
  );
}
