import { useEffect, useState } from "react";
import { FileText, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import apiClient from "../api/client";
import Markdown from "../components/Markdown";
import Spinner from "../components/Spinner";
import { errMsg, fmtDate } from "../utils";

export default function ResumeReview() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [mode, setMode] = useState("view"); // view | new | edit
  const [tab, setTab] = useState("resume");
  const [form, setForm] = useState({ title: "", content: "" });
  const [saving, setSaving] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState("");

  const selected = resumes.find((r) => r.id === selectedId) || null;

  async function load() {
    const res = await apiClient.get("/resumes/");
    setResumes(res.data);
    return res.data;
  }

  useEffect(() => {
    load()
      .then((list) => {
        if (list.length) setSelectedId(list[0].id);
        else setMode("new");
      })
      .catch((err) => setError(errMsg(err, "Couldn't load your resumes. Check that the backend is running.")))
      .finally(() => setLoading(false));
  }, []);

  function startNew() {
    setForm({ title: "", content: "" });
    setMode("new");
    setError("");
  }

  function startEdit() {
    setForm({ title: selected.title, content: selected.content });
    setMode("edit");
    setError("");
  }

  function select(r) {
    setSelectedId(r.id);
    setMode("view");
    setTab(r.ai_feedback ? "feedback" : "resume");
    setError("");
  }

  async function save(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res =
        mode === "new"
          ? await apiClient.post("/resumes/", form)
          : await apiClient.put(`/resumes/${selected.id}`, form);
      await load();
      setSelectedId(res.data.id);
      setMode("view");
      setTab(res.data.ai_feedback ? "feedback" : "resume");
    } catch (err) {
      setError(errMsg(err, "Couldn't save the resume. Check that the backend is running."));
    } finally {
      setSaving(false);
    }
  }

  async function remove(r) {
    if (!window.confirm(`Delete "${r.title}"? This can't be undone.`)) return;
    try {
      await apiClient.delete(`/resumes/${r.id}`);
      const list = await load();
      if (selectedId === r.id) {
        if (list.length) select(list[0]);
        else {
          setSelectedId(null);
          startNew();
        }
      }
    } catch (err) {
      setError(errMsg(err, "Couldn't delete the resume."));
    }
  }

  async function review() {
    setReviewing(true);
    setError("");
    try {
      await apiClient.post(`/resumes/${selected.id}/review`);
      await load();
      setTab("feedback");
    } catch (err) {
      setError(
        errMsg(err, "Couldn't get feedback. The AI service didn't respond. Check the backend terminal for the error.")
      );
    } finally {
      setReviewing(false);
    }
  }

  if (loading) {
    return <div className="grid h-64 place-items-center text-muted"><Spinner size={22} /></div>;
  }

  return (
    <div className="md:grid md:h-full md:grid-cols-[300px_1fr]">
      {/* List */}
      <aside className="border-b border-line bg-white md:flex md:flex-col md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-5 py-4">
          <h1 className="text-lg font-semibold">Resumes</h1>
          <button onClick={startNew} className="btn btn-ghost !px-3 !py-1.5">
            <Plus size={16} /> New
          </button>
        </div>
        <ul className="max-h-56 overflow-y-auto px-3 pb-3 md:max-h-none md:flex-1">
          {resumes.map((r) => (
            <li key={r.id}>
              <div
                className={`group flex items-center gap-2 rounded-lg px-3 py-2.5 ${
                  r.id === selectedId && mode !== "new" ? "bg-primary-soft" : "hover:bg-canvas"
                }`}
              >
                <button onClick={() => select(r)} className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium">{r.title}</p>
                  <p className="text-xs text-muted">
                    {fmtDate(r.created_at)}
                    {r.ai_feedback ? ", reviewed" : ""}
                  </p>
                </button>
                <button
                  onClick={() => remove(r)}
                  aria-label={`Delete ${r.title}`}
                  className="rounded-md p-1.5 text-muted opacity-60 hover:bg-white hover:text-red-600 hover:opacity-100"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </li>
          ))}
          {resumes.length === 0 && (
            <li className="px-3 py-6 text-sm text-muted">No resumes yet. Add your first one.</li>
          )}
        </ul>
      </aside>

      {/* Main */}
      <section className="min-w-0 px-6 py-8 md:overflow-y-auto md:px-10">
        <div className="mx-auto max-w-3xl">
          {error && <p className="banner-error mb-4" role="alert">{error}</p>}

          {mode !== "view" || !selected ? (
            <form onSubmit={save} className="space-y-5">
              <div>
                <h2 className="text-2xl font-semibold">{mode === "edit" ? "Edit resume" : "Add a resume"}</h2>
                <p className="mt-1 text-sm text-muted">Paste the plain text of your resume. Keep it to one page if you can.</p>
              </div>
              <div>
                <label className="label" htmlFor="title">Name</label>
                <input id="title" className="input" placeholder="e.g. Software engineer, v2" required
                  value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="content">Resume text</label>
                <textarea id="content" rows={16} className="input resize-y leading-relaxed" required
                  value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving && <Spinner />} Save resume
                </button>
                {selected && (
                  <button type="button" className="btn btn-ghost" onClick={() => setMode("view")}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-semibold">{selected.title}</h2>
                  <p className="mt-1 text-sm text-muted">Added {fmtDate(selected.created_at)}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={startEdit} className="btn btn-ghost"><Pencil size={15} /> Edit</button>
                  <button onClick={review} disabled={reviewing} className="btn btn-primary">
                    {reviewing ? <Spinner /> : <Sparkles size={15} />}
                    {reviewing ? "Reviewing…" : selected.ai_feedback ? "Review again" : "Get feedback"}
                  </button>
                </div>
              </div>

              <div className="mt-6 flex gap-1 border-b border-line" role="tablist">
                {[
                  ["resume", "Resume"],
                  ["feedback", "Feedback"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    role="tab"
                    aria-selected={tab === key}
                    onClick={() => setTab(key)}
                    className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                      tab === key ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-5">
                {tab === "resume" ? (
                  <pre className="panel whitespace-pre-wrap break-words p-5 font-body text-sm leading-relaxed">
                    {selected.content}
                  </pre>
                ) : selected.ai_feedback ? (
                  <div className="rounded-xl border border-ai-line bg-ai-bg p-6">
                    <p className="mb-3 text-sm font-medium text-ai-text">Written by AI. Treat it as a second opinion.</p>
                    <Markdown>{selected.ai_feedback}</Markdown>
                  </div>
                ) : (
                  <div className="panel grid place-items-center gap-3 px-6 py-14 text-center">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-canvas text-muted">
                      <FileText size={20} />
                    </span>
                    <p className="font-medium">No feedback yet</p>
                    <p className="max-w-xs text-sm text-muted">Get specific edits and notes on how an applicant tracking system will read this resume.</p>
                    <button onClick={review} disabled={reviewing} className="btn btn-primary">
                      {reviewing ? <Spinner /> : <Sparkles size={15} />}
                      {reviewing ? "Reviewing…" : "Get feedback"}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
