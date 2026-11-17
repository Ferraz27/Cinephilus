import { Search, User, List, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { to: "/search", label: "Mídia", icon: Search, match: ["/search", "/media", "/reviews"] },
  { to: "/profile", label: "Perfil", icon: User, match: ["/profile"] },
  { to: "/cinefilos", label: "Cinéfilos", icon: Users, match: ["/cinefilos", "/u/"] },
  { to: "/lists", label: "Listas", icon: List, match: ["/lists", "/folders"] },
];

export default function Navbar() {
  const location = useLocation();

  const isAuthPage = location.pathname === "/" || location.pathname === "/register";

  if (isAuthPage) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        <Link
          to="/search"
          className="flex items-center gap-2 text-2xl font-bold tracking-tight text-red-500"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_12px] shadow-red-500/70" />
          Cinephilus
        </Link>

        <nav className="flex items-center gap-1 text-sm font-medium">
          {navItems.map(({ to, label, icon: Icon, match }) => {
            const isActive = match.some((prefix) => location.pathname.startsWith(prefix));

            return (
              <Link
                key={to}
                to={to}
                title={label}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 transition ${
                  isActive
                    ? "bg-zinc-800/90 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
              >
                <Icon size={17} className={isActive ? "text-red-400" : ""} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
