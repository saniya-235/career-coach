import { NavLink } from "react-router-dom";
import { Compass, FileText, LayoutDashboard, LogOut, MessageSquare, Mic } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/resumes", label: "Resumes", icon: FileText },
  { to: "/interview", label: "Mock interview", icon: Mic },
  { to: "/chat", label: "Career chat", icon: MessageSquare },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const initial = (user?.full_name || "?").trim().charAt(0).toUpperCase();

  return (
    <aside className="flex shrink-0 flex-col bg-ink text-white md:h-screen md:w-60 md:justify-between md:px-4 md:py-6">
      <div>
        <div className="flex items-center justify-between px-4 py-3 md:px-2 md:py-0">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary">
              <Compass size={18} />
            </span>
            <span className="font-display text-lg font-semibold">Pathfinder</span>
          </div>
          <button
            onClick={logout}
            aria-label="Sign out"
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 md:hidden"
          >
            <LogOut size={18} />
          </button>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:mt-8 md:flex-col md:overflow-visible md:px-0 md:pb-0">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/65 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="hidden items-center gap-3 border-t border-white/10 px-2 pt-4 md:flex">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-sm font-semibold">
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user?.full_name}</p>
          <p className="truncate text-xs text-white/55">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          aria-label="Sign out"
          className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
