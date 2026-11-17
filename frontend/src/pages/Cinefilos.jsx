import { useState } from "react";
import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Cinefilos() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await api.get("/public/users", {
        params: { q: query },
      });

      setResults(response.data || []);
    } catch (error) {
      console.error(error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="ui-page">
      <section className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-600/15 border border-red-500/30 text-red-400"><Users size={22} /></span>
          <h1 className="ui-title">Cinéfilos</h1>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome ou username"
            className="flex-1 ui-input"
          />

          <button
            type="submit"
            className="ui-btn-primary px-6"
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </form>

        {results.length === 0 ? (
          <div className="ui-empty">
            <p className="text-zinc-300">Nenhum cinéfilo encontrado.</p><p className="text-xs text-zinc-500 mt-1">Busque pelo nome ou @username de alguém.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {results.map((user) => (
              <Link
                to={`/u/${user.username}`}
                key={user.id}
                className="flex items-center gap-4 ui-card ui-card-hover p-4"
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name || user.username}
                    className="h-12 w-12 rounded-full object-cover border border-zinc-800"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-sm font-bold uppercase">
                    {(user.name || user.username || "U")[0]}
                  </div>
                )}

                <div>
                  <p className="font-semibold">{user.name || user.username}</p>
                  <p className="text-sm text-zinc-400">@{user.username}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
