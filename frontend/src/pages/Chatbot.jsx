import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import apiClient from "../api/client";
import Markdown from "../components/Markdown";
import Spinner from "../components/Spinner";
import { errMsg } from "../utils";

const STARTERS = [
  "How do I negotiate a higher offer?",
  "What should I put on a fresher's resume?",
  "How do I switch into data science?",
  "How do I explain a gap in my experience?",
];

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    apiClient
      .get("/chat/")
      .then((res) => setMessages(res.data))
      .catch((err) => setError(errMsg(err, "Couldn't load the chat. Check that the backend is running.")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  async function send(text) {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    setInput("");
    setError("");
    setMessages((m) => [...m, { id: `tmp-${Date.now()}`, role: "user", content }]);
    setBusy(true);
    try {
      const res = await apiClient.post("/chat/", { content });
      setMessages((m) => [...m, res.data]);
    } catch (err) {
      setError(errMsg(err, "Couldn't get a reply. The AI service didn't respond. Try sending it again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-[calc(100dvh-7rem)] flex-col md:h-full">
      <header className="border-b border-line bg-white px-6 py-4 md:px-10">
        <h1 className="text-lg font-semibold">Career chat</h1>
        <p className="text-sm text-muted">Ask about job search, offers, switching fields or skills.</p>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 md:px-10">
        <div className="mx-auto max-w-3xl space-y-4">
          {loading ? (
            <div className="flex justify-center py-10 text-muted"><Spinner size={22} /></div>
          ) : messages.length === 0 ? (
            <div className="py-10">
              <h2 className="text-2xl font-semibold">What's on your mind?</h2>
              <p className="mt-1 text-muted">Start with a question of your own, or try one of these.</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {STARTERS.map((s) => (
                  <button key={s} onClick={() => send(s)}
                    className="rounded-full border border-line bg-white px-4 py-2 text-sm hover:border-primary hover:text-primary">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-white">
                  {m.content}
                </div>
              ) : (
                <div key={m.id} className="max-w-[85%] rounded-2xl rounded-bl-md border border-line bg-white px-4 py-3">
                  <Markdown>{m.content}</Markdown>
                </div>
              )
            )
          )}

          {busy && (
            <div className="inline-flex gap-1 rounded-2xl rounded-bl-md border border-line bg-white px-4 py-3" aria-label="Reply is loading">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-2 w-2 animate-pulse rounded-full bg-muted/60" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          )}
          {error && <p className="banner-error" role="alert">{error}</p>}
          <div ref={bottomRef} />
        </div>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="border-t border-line bg-white px-6 py-4 md:px-10"
      >
        <div className="mx-auto flex max-w-3xl items-end gap-3">
          <textarea
            rows={1}
            className="input max-h-32 resize-none"
            placeholder="Type a message. Enter to send, Shift+Enter for a new line."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
            }}
          />
          <button disabled={busy || !input.trim()} className="btn btn-primary shrink-0" aria-label="Send message">
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
