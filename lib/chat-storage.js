const STORAGE_KEY = "answer-engine-chats";
const IDS_KEY = "answer-engine-chat-ids";

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

export function createChatId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function getChatIds() {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(IDS_KEY);
  const list = safeParse(raw, []);
  return Array.isArray(list) ? list : [];
}

export function getChat(id) {
  if (typeof window === "undefined" || !id || id === "new") return null;
  const raw = localStorage.getItem(`${STORAGE_KEY}-${id}`);
  return safeParse(raw, null);
}

export function saveChat(chat) {
  if (typeof window === "undefined" || !chat?.id) return;
  const payload = {
    id: chat.id,
    title: chat.title || "New assignment",
    createdAt: chat.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    questions: chat.questions || [],
    streamResults: chat.streamResults || [],
    answerOptions: chat.answerOptions || { length: "standard", style: "simple" },
  };
  localStorage.setItem(`${STORAGE_KEY}-${chat.id}`, JSON.stringify(payload));
  const ids = getChatIds();
  const existing = ids.findIndex((e) => e.id === chat.id);
  const entry = { id: chat.id, title: payload.title, updatedAt: payload.updatedAt };
  let next;
  if (existing >= 0) {
    next = [...ids];
    next[existing] = entry;
  } else {
    next = [entry, ...ids];
  }
  next.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  localStorage.setItem(IDS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("answer-engine-chat-saved"));
}

export function deleteChat(id) {
  if (typeof window === "undefined" || !id) return;
  localStorage.removeItem(`${STORAGE_KEY}-${id}`);
  const ids = getChatIds().filter((e) => e.id !== id);
  localStorage.setItem(IDS_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent("answer-engine-chat-saved"));
}
