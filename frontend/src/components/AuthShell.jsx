import { Compass, FileText, MessageSquare, Mic } from "lucide-react";

const points = [
  { icon: FileText, title: "Resume feedback", text: "Specific edits you can make today." },
  { icon: Mic, title: "Mock interviews", text: "Practice answers for the role you want." },
  { icon: MessageSquare, title: "Career chat", text: "Ask about offers, switches and skills." },
];

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen md:grid-cols-[1.05fr_1fr]">
      <div className="hidden bg-ink p-12 text-white md:flex md:flex-col md:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary">
            <Compass size={20} />
          </span>
          <span className="font-display text-xl font-semibold">Pathfinder</span>
        </div>

        <div className="max-w-md">
          <h2 className="font-display text-4xl font-semibold leading-tight">
            Prepare for the job you want.
          </h2>
          <ul className="mt-10 space-y-6">
            {points.map(({ icon: Icon, title: t, text }) => (
              <li key={t} className="flex gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/10">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="font-medium">{t}</p>
                  <p className="text-sm text-white/65">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-white/45">Your resumes and chats are private to your account.</p>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 md:hidden">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white">
              <Compass size={18} />
            </span>
            <span className="font-display text-lg font-semibold">Pathfinder</span>
          </div>
          <h1 className="text-3xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-6 text-sm text-muted">{footer}</p>
        </div>
      </div>
    </div>
  );
}
