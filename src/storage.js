const CONVERSATIONS = "conversations";
const FEEDBACK = "feedbackLog";

const read = (key) => {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable */
  }
};

export const getConversations = () => read(CONVERSATIONS);
export const getConversation = (id) => read(CONVERSATIONS).find((c) => c.id === id) || null;

// Create the conversation, or refresh its messages while keeping its rating and feedback.
export function upsertConversation(id, messages) {
  const list = read(CONVERSATIONS);
  const i = list.findIndex((c) => c.id === id);
  if (i >= 0) list[i] = { ...list[i], messages };
  else list.push({ id, date: new Date().toISOString(), messages, rating: 0, feedback: "" });
  write(CONVERSATIONS, list);
}

export function setConversationFeedback(id, { rating, feedback }) {
  write(
    CONVERSATIONS,
    read(CONVERSATIONS).map((c) => (c.id === id ? { ...c, rating, feedback } : c))
  );
}

export function deleteConversation(id) {
  const list = read(CONVERSATIONS).filter((c) => c.id !== id);
  write(CONVERSATIONS, list);
  return list;
}

// Per-reply thumbs up/down feedback, saved as soon as it is given.
export function logFeedback(entry) {
  const list = read(FEEDBACK);
  const i = list.findIndex((f) => f.messageId === entry.messageId);
  if (i >= 0) list[i] = { ...list[i], ...entry };
  else list.push(entry);
  write(FEEDBACK, list);
}
