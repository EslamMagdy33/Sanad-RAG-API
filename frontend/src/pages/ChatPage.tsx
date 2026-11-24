import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Send } from "lucide-react";
import { streamQuery, type Source } from "../api/chat";
import { listDocuments, type DocumentDto } from "../api/documents";
import { errorKey } from "../api/errors";
import { useI18n } from "../i18n/LanguageContext";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  sources?: Source[];
  insufficient?: boolean;
  pending?: boolean;
  error?: string | null;
};

export function ChatPage() {
  const { t, lang } = useI18n();
  const [params] = useSearchParams();
  const [docs, setDocs] = useState<DocumentDto[]>([]);
  const [documentId, setDocumentId] = useState(params.get("documentId") ?? "");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const readyDocs = useMemo(() => docs.filter((d) => d.status === "Ready"), [docs]);

  useEffect(() => {
    listDocuments()
      .then(setDocs)
      .catch(() => setDocs([]));
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function patchAssistant(id: string, patch: (m: Message) => Message) {
    setMessages((prev) => prev.map((m) => (m.id === id ? patch(m) : m)));
  }

  async function send() {
    const question = input.trim();
    if (!question || streaming) return;

    const assistantId = crypto.randomUUID();
    setInput("");
    setStreaming(true);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text: question },
      { id: assistantId, role: "assistant", text: "", pending: true },
    ]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamQuery(
        question,
        documentId || undefined,
        lang,
        (event) => {
          switch (event.type) {
            case "token":
              patchAssistant(assistantId, (m) => ({ ...m, text: m.text + event.text }));
              break;
            case "sources":
              patchAssistant(assistantId, (m) => ({ ...m, sources: event.sources }));
              break;
            case "insufficient":
              patchAssistant(assistantId, (m) => ({ ...m, insufficient: true }));
              break;
            case "done":
              patchAssistant(assistantId, (m) => ({ ...m, pending: false }));
              break;
          }
        },
        controller.signal,
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      patchAssistant(assistantId, (m) => ({ ...m, error: t(errorKey(err, "err.chatFailed")) }));
    } finally {
      patchAssistant(assistantId, (m) => ({ ...m, pending: false }));
      abortRef.current = null;
      setStreaming(false);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">{t("chat.title")}</h1>
          <p className="page-sub">{t("chat.sub")}</p>
        </div>
      </div>

      <div className="card chat-shell">
        <div className="chat-toolbar">
          <select className="select" value={documentId} onChange={(e) => setDocumentId(e.target.value)}>
            <option value="">{t("chat.allDocs")}</option>
            {readyDocs.map((d) => (
              <option key={d.id} value={d.id}>{d.fileName}</option>
            ))}
          </select>
        </div>

        <div className="chat-messages" ref={listRef}>
          {messages.length === 0 && <div className="empty">{t("chat.empty")}</div>}

          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="bubble bubble-user">{m.text}</div>
            ) : (
              <div key={m.id} className="bubble bubble-bot">
                {m.text || (m.pending ? <span className="typing">{t("chat.thinking")}</span> : null)}

                {m.insufficient && <div className="insufficient">{t("chat.insufficient")}</div>}

                {m.sources && m.sources.length > 0 && (
                  <div className="sources">
                    {m.sources.map((s, i) => (
                      <div key={`${s.documentId}-${s.page}-${i}`} className="source">
                        <div className="source-head">
                          <span className="en">{s.fileName}</span>
                          <span>{t("chat.page", { n: s.page })}</span>
                        </div>
                        <p className="source-snippet">{s.snippet}</p>
                      </div>
                    ))}
                  </div>
                )}

                {m.error && <div className="alert alert-error source-error">{m.error}</div>}
              </div>
            ),
          )}
        </div>

        <div className="composer">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t("chat.placeholder")}
            aria-label={t("chat.inputLabel")}
          />
          <button
            type="button"
            className="btn btn-primary composer-send"
            onClick={send}
            disabled={streaming || !input.trim()}
            aria-label={t("chat.send")}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </>
  );
}
