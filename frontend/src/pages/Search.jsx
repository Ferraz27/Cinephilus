import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  const [popularMedia, setPopularMedia] = useState([]);
  const [popularPage, setPopularPage] = useState(1);
  const [popularTotalPages, setPopularTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("relevance");
  const [mediaFilter, setMediaFilter] = useState("all");

  async function fetchSearch(page) {
    if (!query.trim()) {
      return;
    }

    const response = await api.get(
      `/media/search?query=${encodeURIComponent(query)}&page=${page}`
    );

    setResults(response.data.results || []);
    setCurrentPage(response.data.page || page);
    setTotalPages(response.data.totalPages || 1);
    setSortBy("relevance");
    setIsSearching(true);
  }

  async function handleSearch(event) {
    event.preventDefault();

    await fetchSearch(1);
  }

  function handlePrevPage() {
    if (isSearching && currentPage > 1) {
      fetchSearch(currentPage - 1);
      return;
    }

    if (!isSearching && popularPage > 1) {
      loadPopularMedia(popularPage - 1);
    }
  }

  function handleNextPage() {
    if (isSearching && currentPage < totalPages) {
      fetchSearch(currentPage + 1);
      return;
    }

    if (!isSearching && popularPage < popularTotalPages) {
      loadPopularMedia(popularPage + 1);
    }
  }

  function handlePageSelect(page) {
    if (isSearching) {
      fetchSearch(page);
      return;
    }

    loadPopularMedia(page);
  }

  async function loadPopularMedia(page = 1) {
    const response = await api.get(`/media/popular?page=${page}`);

    setPopularMedia(response.data.results || []);
    setPopularPage(response.data.page || page);
    setPopularTotalPages(response.data.totalPages || 1);
  }

  useEffect(() => {
    loadPopularMedia(1);
  }, []);

  const displayedMedia = isSearching ? results : popularMedia;
  const activePage = isSearching ? currentPage : popularPage;
  const activeTotalPages = isSearching ? totalPages : popularTotalPages;
  const filteredMedia = displayedMedia.filter((media) => {
    if (mediaFilter === "movie") {
      return media.type === "MOVIE";
    }

    if (mediaFilter === "series") {
      return media.type === "SERIES";
    }

    return true;
  });

  const sortedMedia = [...filteredMedia].sort((a, b) => {
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

  const pageItems = buildPageItems(activePage, activeTotalPages);

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
              {isSearching ? "Resultados da busca" : "Em alta"}
            </h2>

            <p className="text-zinc-500 mt-1">
              {isSearching
                ? `${filteredMedia.length} resultado(s)`
                : "Mídias populares da comunidade"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={mediaFilter}
              onChange={(event) => setMediaFilter(event.target.value)}
              className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 outline-none focus:border-red-500"
            >
              <option value="all">Filmes e series</option>
              <option value="movie">Somente filmes</option>
              <option value="series">Somente series</option>
            </select>

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

        {activeTotalPages > 1 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={activePage <= 1}
              className="rounded-xl border border-zinc-800 px-3 py-2 text-sm disabled:opacity-40"
            >
              Anterior
            </button>

            {pageItems.map((item, index) =>
              item === "..." ? (
                <span key={`ellipsis-${index}`} className="px-2 text-zinc-500">
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => handlePageSelect(item)}
                  className={`rounded-xl border px-3 py-2 text-sm transition ${
                    item === activePage
                      ? "border-red-500 bg-red-600 text-white"
                      : "border-zinc-800 text-zinc-300 hover:border-zinc-600"
                  }`}
                >
                  {item}
                </button>
              )
            )}

            <button
              type="button"
              onClick={handleNextPage}
              disabled={activePage >= activeTotalPages}
              className="rounded-xl border border-zinc-800 px-3 py-2 text-sm disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

function buildPageItems(activePage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items = [1];
  const left = Math.max(2, activePage - 1);
  const right = Math.min(totalPages - 1, activePage + 1);

  if (left > 2) {
    items.push("...");
  }

  for (let page = left; page <= right; page += 1) {
    items.push(page);
  }

  if (right < totalPages - 1) {
    items.push("...");
  }

  items.push(totalPages);

  return items;
}
