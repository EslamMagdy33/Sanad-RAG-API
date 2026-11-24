import { mockStream } from "./chatMock";
import { ApiError, API_BASE_URL, authHeader } from "./client";
import type { components } from "./schema";
import type { Lang } from "../i18n/messages";

export type ChatEvent = components["schemas"]["ChatEvent"];
export type Source = components["schemas"]["Source"];

const USE_MOCK = import.meta.env.VITE_CHAT_MOCK !== "false";

/**
 * POST /api/query بـ Server-Sent Events.
 * EventSource مش بيدعم Authorization header، فبنستخدم fetch + reader.
 */
export async function streamQuery(
  question: string,
  documentId: string | undefined,
  lang: Lang,
  onEvent: (event: ChatEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  if (USE_MOCK) return mockStream(question, documentId, lang, onEvent, signal);

  const res = await fetch(`${API_BASE_URL}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream", ...authHeader() },
    body: JSON.stringify({ question, documentId }),
    signal,
  });

  if (!res.ok || !res.body) {
    const problem = (await res.json().catch(() => null)) as { title?: string; code?: string } | null;
    throw new ApiError(res.status, problem?.code, problem?.title ?? `Request failed (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let boundary = buffer.indexOf("\n\n");
    while (boundary !== -1) {
      const block = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);

      for (const line of block.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const json = line.slice(5).trim();
        if (json) onEvent(JSON.parse(json) as ChatEvent);
      }
      boundary = buffer.indexOf("\n\n");
    }
  }
}
