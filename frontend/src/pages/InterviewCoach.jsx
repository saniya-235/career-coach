import { useEffect, useRef, useState } from "react";
import { Flag, RotateCcw, Send } from "lucide-react";
import apiClient from "../api/client";
import Markdown from "../components/Markdown";
import Spinner from "../components/Spinner";
import { errMsg } from "../utils";

const SUGGESTIONS = ["Software engineer", "Data analyst", "Embedded systems engineer", "Product manager"];

export default function InterviewCoach() {
  const [role, setRole] = useState("");
  const [session, setSession] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [transcript, setTranscript] = useState([]);
  const [starting, setStarting] = useState(false);
  const [loadingQ, setLoadingQ] = useState(false);
  const [sending, setSending] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [transcript, question, feedback]);

  async function fetchQuestion(id) {
    setLoadingQ(true);
    try {
      const res = await apiClient.get(`/interviews/${id}/next-question`);
      setQuestion(res.data.question);
    } catch (err) {
      setError(errMsg(err, "Couldn't get the next question. The AI service didn't respond."));
    } finally {
      setLoadingQ(false);
    }
  }

  async function start(e, chosenRole) {
    e?.preventDefault();
    const r = (chosenRole ?? role).trim();
    if (!r) return;
    setStarting(true);
    setError("");
    try {
      const res = await apiClient.post("/interviews/", { role: r });
      setSession(res.data);
      setTranscript([]);
      setFeedback(null);
      setQuestion("");
      await fetchQuestion(res.data.id);
    } catch (err) {
      setError(errMsg(err, "Couldn't start the interview. Check that the backend is running."));
    } finally {
      setStarting(false);
    }
  }

  async function submit(e) {
    e?.preventDefault();
    if (!answer.trim() || !question || sending) return;
    setSending(true);
    setError("");
    try {
      await apiClient.post(`/interviews/${session.id}/answer`, { question, answer });
      setTranscript((t) => [...t, { question, answer }]);
      setAnswer("");
      setQuestion("");
      await fetchQuestion(session.id);
    } catch (err) {
      setError(errMsg(err, "Couldn't save your answer."));
    } finally {
      setSending(false);
    }
  }

  async function finish() {
    setFinishing(true);
    setError("");
    try {
      const res = await apiClient.post(`/interviews/${session.id}/finish`);
      setFeedback(res.data.overall_feedback);
      setQuestion("");
    } catch (err) {
      setError(errMsg(err, "Couldn't get feedback. The AI service didn't respond."));
    } finally {
      setFinishing(false);
    }
  }

  function reset() {
    setSession(null);
    setTranscript([]);
    setQuestion("");
    setAnswer("");
    setFeedback(null);
    setError("");
    setRole("");
  }

  /* Setup screen */
  if (!session) {
    return (
      <div className="mx-auto max-w-xl px-6 py-14 md:py-20">
        <h1 className="text-3xl font-semibold">Mock interview</h1>
        <p className="mt-2 text-muted">
          Pick a role. You'll get one question at a time, and written feedback when you finish.
        </p>

        <form onSubmit={start} className="mt-8 space-y-4">
          <div>
            <label className="label" htmlFor="role">Role you're interviewing for</label>
            <input id="role" className="input" placeholder="e.g. Backend engineer" value={role}
              onChange={(e) => setRole(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button type="button" key={s} onClick={() => setRole(s)}
                className="rounded-full border border-line bg-white px-3 py-1.5 text-sm hover:border-primary hover:text-primary">
                {s}
              </button>
            ))}
          </div>
          {error && <p className="banner-error" role="alert">{error}</p>}
          <button disabled={starting || !role.trim()} className="btn btn-primary">
            {starting && <Spinner />} Start interview
          </button>
        </form>
      </div>
    );
  }

  /* Interview screen */
  return (
    <div className="mx-auto flex max-w-3xl flex-col px-6 py-8 md:min-h-full md:py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{session.role}</h1>
          <p className="text-sm text-muted">
            {feedback
              ? `Finished after ${transcript.length} ${transcript.length === 1 ? "answer" : "answers"}`
              : `Question ${transcript.length + 1}`}
          </p>
        </div>
        {feedback ? (
          <button onClick={reset} className="btn btn-ghost"><RotateCcw size={15} /> New interview</button>
        ) : (
          <button onClick={finish} disabled={finishing || sending || transcript.length === 0} className="btn btn-ghost">
            {finishing ? <Spinner /> : <Flag size={15} />} Finish and get feedback
          </button>
        )}
      </div>

      <div className="mt-8 space-y-6">
        {transcript.map((t, i) => (
          <div key={i} className="space-y-3">
            <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm leading-relaxed border border-line">
              {t.question}
            </div>
            <div className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary-soft px-4 py-3 text-sm leading-relaxed">
              {t.answer}
            </div>
          </div>
        ))}

        {!feedback && (
          <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-line bg-white px-4 py-3 text-sm leading-relaxed">
            {loadingQ || !question ? (
              <span className="inline-flex items-center gap-2 text-muted"><Spinner /> Thinking of a question…</span>
            ) : (
              question
            )}
          </div>
        )}

        {feedback && (
          <div className="rounded-xl border border-ai-line bg-ai-bg p-6">
            <p className="mb-3 text-sm font-medium text-ai-text">Written by AI. Treat it as a second opinion.</p>
            <Markdown>{feedback}</Markdown>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="banner-error mt-6" role="alert">{error}</p>}

      {!feedback && (
        <form onSubmit={submit} className="sticky bottom-0 mt-6 bg-canvas pb-2 pt-3">
          <div className="panel p-2">
            <textarea
              rows={3}
              className="w-full resize-none rounded-lg px-3 py-2 text-sm focus:outline-none"
              placeholder="Type your answer. Press Ctrl+Enter to send."
              value={answer}
              disabled={!question || sending}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submit(e);
              }}
            />
            <div className="flex justify-end">
              <button disabled={!answer.trim() || !question || sending} className="btn btn-primary">
                {sending ? <Spinner /> : <Send size={15} />} Send answer
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
