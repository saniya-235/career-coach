import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, MessageSquare, Mic } from "lucide-react";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import { fmtDate } from "../utils";

function Badge({ done, doneText, todoText }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        done ? "bg-ai-bg text-ai-text" : "bg-canvas text-muted"
      }`}
    >
      {done ? doneText : todoText}
    </span>
  );
}

function ListPanel({ title, to, items, empty, emptyAction, icon: Icon }) {
  return (
    <section className="panel p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">{title}</h2>
        {items.length > 0 && (
          <Link to={to} className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        )}
      </div>
      {items.length === 0 ? (
        <div className="mt-4 rounded-lg bg-canvas p-4 text-sm text-muted">
          <p>{empty}</p>
          <Link to={to} className="mt-2 inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
            <Icon size={15} /> {emptyAction}
          </Link>
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-line">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted">{fmtDate(item.created_at)}</p>
              </div>
              {item.badge}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiClient.get("/resumes/"), apiClient.get("/interviews/")])
      .then(([r, i]) => {
        setResumes(r.data);
        setInterviews(i.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.full_name?.split(" ")[0] || "there";
  const unreviewed = resumes.find((r) => !r.ai_feedback);

  let next;
  if (resumes.length === 0) {
    next = {
      title: "Start with your resume",
      text: "Paste it in and get specific feedback on what to change.",
      cta: "Add a resume",
      to: "/resumes",
    };
  } else if (unreviewed) {
    next = {
      title: `Get feedback on "${unreviewed.title}"`,
      text: "It hasn't been reviewed yet. Feedback takes a few seconds.",
      cta: "Review it",
      to: "/resumes",
    };
  } else {
    next = {
      title: "Practice for your next interview",
      text: "Pick a role and answer questions one at a time. You get feedback at the end.",
      cta: "Start a mock interview",
      to: "/interview",
    };
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 md:px-10 md:py-10">
      <h1 className="text-3xl font-semibold">Hi, {firstName}</h1>
      <p className="mt-1 text-muted">What do you want to work on today?</p>

      {loading ? (
        <div className="mt-16 flex justify-center text-muted"><Spinner size={22} /></div>
      ) : (
        <>
          <section className="mt-8 flex flex-col gap-6 rounded-2xl bg-ink p-8 text-white md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="text-2xl font-semibold">{next.title}</h2>
              <p className="mt-2 text-white/70">{next.text}</p>
            </div>
            <Link to={next.to} className="btn shrink-0 bg-white text-ink hover:bg-white/90">
              {next.cta} <ArrowRight size={16} />
            </Link>
          </section>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <ListPanel
              title="Your resumes"
              to="/resumes"
              icon={FileText}
              empty="You haven't added a resume yet."
              emptyAction="Add a resume"
              items={resumes.slice(0, 4).map((r) => ({
                id: r.id,
                label: r.title,
                created_at: r.created_at,
                badge: <Badge done={!!r.ai_feedback} doneText="Reviewed" todoText="Not reviewed" />,
              }))}
            />
            <ListPanel
              title="Interview practice"
              to="/interview"
              icon={Mic}
              empty="No practice sessions yet."
              emptyAction="Start a mock interview"
              items={interviews.slice(0, 4).map((s) => ({
                id: s.id,
                label: s.role,
                created_at: s.created_at,
                badge: <Badge done={!!s.overall_feedback} doneText="Feedback ready" todoText="In progress" />,
              }))}
            />
          </div>

          <Link
            to="/chat"
            className="panel mt-6 flex items-center justify-between gap-4 p-5 transition-colors hover:border-primary"
          >
            <div className="flex items-center gap-4">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
                <MessageSquare size={18} />
              </span>
              <div>
                <p className="font-medium">Ask the career chat</p>
                <p className="text-sm text-muted">Offers, career switches, skills to learn.</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-muted" />
          </Link>
        </>
      )}
    </div>
  );
}
