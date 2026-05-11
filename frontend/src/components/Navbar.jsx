import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isLoginPage = location.pathname === "/";

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  if (isLoginPage) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
        <Link
          to="/search"
          className="text-2xl font-bold text-red-500"
        >
          Cinephilus
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link
            to="/search"
            className="text-zinc-300 hover:text-white transition"
          >
            Buscar
          </Link>

          <Link
            to="/lists"
            className="text-zinc-300 hover:text-white transition"
          >
            Minhas listas
          </Link>

          <Link
            to="/lists/create"
            className="text-zinc-300 hover:text-white transition"
          >
            Criar lista
          </Link>

		  <Link
			to="/profile"
			className="text-zinc-300 hover:text-white transition"
			>
			Perfil
		  </Link> 

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded-lg text-white"
          >
            Sair
          </button>
        </nav>
      </div>
    </header>
  );
}