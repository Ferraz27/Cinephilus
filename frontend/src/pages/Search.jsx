import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const [popularMedia, setPopularMedia] = useState([]);
  const [sortBy, setSortBy] = useState("relevance");

  async function handleSearch(event) {
    event.preventDefault();

    const response = await api.get(`/media/search?query=${query}`);

    setResults(response.data);

    setSortBy("relevance");
  }

  async function loadPopularMedia() {
    const response = await api.get("/media/popular");

    setPopularMedia(response.data);
  }

  useEffect(() => {
    loadPopularMedia();
  }, []);

  const displayedMedia = results.length > 0 ? results : popularMedia;

  const sortedMedia = [...displayedMedia].sort((a, b) => {
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    }

    if (sortBy === "release_desc") {
      return new Date(b.release_date || 0) - new Date(a.release_date || 0);
    }

    if (sortBy === "release_asc") {
      return new Date(a.release_date || 0) - new Date(b.release_date || 0);
    }

    return 0;
  });

  return (
    <main className="min-h-screen bg-black text-white px-8 py-10">
      <section className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold">Buscar mídia</h1>

          <p className="text-zinc-500 mt-2">
            Descubra filmes, séries e animes.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-10">
          <input
            className="flex-1 rounded-2xl bg-zinc-900 border border-zinc-800 px-5 py-4 outline-none focus:border-red-500"
            placeholder="Digite o nome de uma mídia..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 transition rounded-2xl px-6 py-4 font-semibold"
          >
            Buscar
          </button>
        </form>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {results.length > 0 ? "Resultados da busca" : "Em alta"}
            </h2>

            <p className="text-zinc-500 mt-1">
              {results.length > 0
                ? `${results.length} resultado(s)`
                : "Mídias populares da comunidade"}
            </p>
          </div>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 outline-none focus:border-red-500"
          >
            <option value="relevance">Relevância</option>

            <option value="title">Ordem alfabética</option>

            <option value="release_desc">Lançamento mais recente</option>

            <option value="release_asc">Lançamento mais antigo</option>
          </select>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {sortedMedia.map((media) => (
            <Link
              key={media.tmdb_id}
              to={`/media/${media.tmdb_id}`}
              state={{ media }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900 aspect-[2/3]">
                {media.poster_url ? (
                  <img
                    src={media.poster_url}
                    alt={media.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                    Sem pôster
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/20" />

                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                  <p className="text-xs text-white/60 font-medium">
                    {media.release_date || "Sem data"}
                  </p>

                  <h3 className="text-white/70 text-base">{media.title}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
