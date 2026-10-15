import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogIn, LogOut } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { to: "/news", label: "Bills" },
  { to: "/representatives", label: "Reps" },
  { to: "/care", label: "Care" },
  { to: "/impact", label: "Impact" },
  { to: "/about", label: "About" },
];

/** Centered wordmark, hairline, and nav. Shared by every page. */
const Masthead = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="masthead relative flex flex-col items-center" role="banner">
      <div className="masthead-tools flex items-center gap-1">
        {user ? (
          <button
            type="button"
            onClick={() => signOut()}
            className="inline-flex h-9 items-center gap-1.5 rounded px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            Sign out
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate("/auth")}
            className="inline-flex h-9 items-center gap-1.5 rounded px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
            Sign in
          </button>
        )}
        <ThemeToggle />
      </div>

      <Link to="/" aria-label="CivicCare home" className="masthead-mark io text-foreground" data-io="mark">
        CivicCare
      </Link>
      <div className="masthead-rule" data-io="rule" aria-hidden="true" />
      <nav className="masthead-nav flex items-center justify-between" aria-label="Primary">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} className="io" data-io="nav">
            {l.label}
          </NavLink>
        ))}
        {user && (
          <NavLink to="/dashboard" className="io" data-io="nav">
            Tracked
          </NavLink>
        )}
      </nav>
    </header>
  );
};

export default Masthead;
