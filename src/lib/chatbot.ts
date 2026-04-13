import { api } from "./api";

export interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

export interface ChatbotChatResponse {
  success: boolean;
  reply: string;
  history: ChatHistoryItem[];
}

/** Extrae texto legible; prioriza `reply` (DTO del chatbot). */
export function extractChatReply(data: unknown): string {
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (typeof o.reply === "string" && o.reply.length > 0) return o.reply;
    const keys = ["message", "response", "answer", "content", "text"] as const;
    for (const k of keys) {
      const v = o[k];
      if (typeof v === "string" && v.length > 0) return v;
    }
    const nested = o.data;
    if (nested && typeof nested === "object") {
      const d = nested as Record<string, unknown>;
      if (typeof d.reply === "string" && d.reply.length > 0) return d.reply;
      for (const k of keys) {
        const v = d[k];
        if (typeof v === "string" && v.length > 0) return v;
      }
    }
  }
  try {
    return JSON.stringify(data);
  } catch {
    return "Respuesta no reconocida.";
  }
}

function normalizeHistory(raw: unknown): ChatHistoryItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const r = item as Record<string, unknown>;
      const role = r.role;
      const content = r.content;
      if (role !== "user" && role !== "assistant") return null;
      if (typeof content !== "string") return null;
      return { role, content };
    })
    .filter((x): x is ChatHistoryItem => x !== null);
}

/** POST `/chatbot/chat` — body: `{ message, history }`. */
export async function sendChatMessage(message: string, history: ChatHistoryItem[]) {
  const data = (await api.post("/chatbot/chat", {
    message,
    history,
  })) as ChatbotChatResponse;

  if (data && typeof data === "object" && "success" in data && data.success === false) {
    throw new Error(extractChatReply(data));
  }

  const reply = extractChatReply(data);
  const serverHistory = normalizeHistory(data.history);

  return { reply, history: serverHistory.length > 0 ? serverHistory : undefined };
}
