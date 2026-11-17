import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Clock3,
  MonitorCheck,
  MonitorPlay,
  MonitorX,
} from "lucide-react";
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
  const [sortDirection, setSortDirection] = useState("desc");
  const [mediaFilter, setMediaFilter] = useState("all");
  const [statusByTmdbId, setStatusByTmdbId] = useState({});

  const statusBadgeConfig = {
    COMPLETED: { color: "bg-green-700/75", icon: MonitorCheck },
    WATCHING: { color: "bg-yellow-700/75", icon: MonitorPlay },
    DROPPED: { color: "bg-red-800/75", icon: MonitorX },
    PLANNED: { color: "bg-blue-700/75", icon: Clock3 },
  };

  async function loadStatusesForMedia(items) {
    const token = localStorage.getItem("token");

    if (!token || items.length === 0) {
      setStatusByTmdbId({});
      return;
    }

    try {
      const tmdbIds = items.map((item) => item.tmdb_id);
      const response = await api.post(
        "/media/status/batch",
        { tmdbIds },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setStatusByTmdbId(response.data || {});
    } catch (error) {
      console.error("Erro ao carregar status:", error);
      setStatusByTmdbId({});
    }
  }

  async function fetchSearch(page) {
    if (!query.trim()) {
      return;
    }

    const mediaTypeParam =
      mediaFilter === "movie"
        ? "MOVIE"
        : mediaFilter === "series"
          ? "SERIES"
          : null;

    const response = await api.get(
      `/media/search?query=${encodeURIComponent(query)}&page=${page}${
        mediaTypeParam ? `&type=${mediaTypeParam}` : ""
      }`
    );

    setResults(response.data.results || []);
    setCurrentPage(response.data.page || page);
    setTotalPages(response.data.totalPages || 1);
    setSortBy("relevance");
    setIsSearching(true);
    loadStatusesForMedia(response.data.results || []);
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
    const mediaTypeParam =
      mediaFilter === "movie"
        ? "MOVIE"
        : mediaFilter === "series"
          ? "SERIES"
          : null;
    const response = await api.get(
      `/media/popular?page=${page}${mediaTypeParam ? `&type=${mediaTypeParam}` : ""}`
    );

    setPopularMedia(response.data.results || []);
    setPopularPage(response.data.page || page);
    setPopularTotalPages(response.data.totalPages || 1);
    loadStatusesForMedia(response.data.results || []);
  }

  useEffect(() => {
    loadPopularMedia(1);
  }, []);

  useEffect(() => {
    if (isSearching) {
      fetchSearch(1);
      return;
    }

    loadPopularMedia(1);
  }, [mediaFilter]);

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
  const resultsLabel = `${filteredMedia.length} resultado${filteredMedia.length === 1 ? "" : "s"}`;
  function renderStatusBadge(status) {
    const config = statusBadgeConfig[status];

    if (!config) {
      return null;
    }

    const Icon = config.icon;

    return (
      <div
        className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg ${config.color} text-white shadow-lg`}
      >
        <Icon size={16} />
      </div>
    );
  }
  const isDirectionDisabled = sortBy === "relevance";

  const sortedMedia = [...filteredMedia].sort((a, b) => {
    if (sortBy === "relevance") {
      return 0;
    }

    const multiplier = sortDirection === "asc" ? 1 : -1;

    if (sortBy === "title") {
      return a.title.localeCompare(b.title) * multiplier;
    }

    const aTime = new Date(a.release_date || 0).getTime();
    const bTime = new Date(b.release_date || 0).getTime();

    return (aTime - bTime) * multiplier;
  });

  const pageItems = buildPageItems(activePage, activeTotalPages);

  return (
    <main className="min-h-screen bg-black text-white px-8 py-10">
      <section className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="ui-title">Buscar mídia</h1>

          <p className="text-zinc-500 mt-2">
            Descubra filmes e séries .
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-10">
          <input
            className="flex-1 ui-input px-5 py-4 text-base"
            placeholder="Digite o nome de uma mídia..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <button
            type="submit"
            className="ui-btn-primary rounded-2xl px-6 py-4 text-base"
          >
            Buscar
          </button>
        </form>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="ui-section-title">
              {isSearching ? "Resultados da busca" : "Em alta"}
            </h2>

            <p className="text-zinc-500 mt-1">
              {isSearching
                ? resultsLabel
                : "Mídias populares da comunidade"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={mediaFilter}
                onChange={(event) => setMediaFilter(event.target.value)}
                className="appearance-none rounded-2xl bg-zinc-950/60 border border-zinc-800 px-4 py-3 pr-10 text-sm outline-none transition hover:border-zinc-700 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/15"
              >
                <option value="all">Filmes e series</option>
                <option value="movie">Somente filmes</option>
                <option value="series">Somente series</option>
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="appearance-none rounded-2xl bg-zinc-950/60 border border-zinc-800 px-4 py-3 pr-10 text-sm outline-none transition hover:border-zinc-700 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/15"
              >
                <option value="relevance">Relevância</option>

                <option value="title">Ordem alfabética</option>

                <option value="release">Lançamento</option>
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                setSortDirection((value) => (value === "asc" ? "desc" : "asc"))
              }
              disabled={isDirectionDisabled}
              className="flex items-center justify-center h-[48px] rounded-2xl bg-zinc-950/60 border border-zinc-800 px-4 text-zinc-300 hover:text-white hover:border-zinc-700 transition disabled:opacity-40 disabled:hover:border-zinc-800"
              title={
                isDirectionDisabled
                  ? "Ordem baseada em relevância"
                  : sortDirection === "asc"
                    ? "Ordem crescente"
                    : "Ordem decrescente"
              }
            >
              {sortDirection === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            </button>
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
              <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 aspect-[2/3] shadow-lg shadow-black/30">
                {renderStatusBadge(statusByTmdbId[media.tmdb_id])}
                {media.poster_url ? (
                  <img
                    src={media.poster_url}
                    alt={media.title}
                    className="w-full h-full object-cover group-hover:scale-[1.01] transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                    Sem pôster
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/20 transition-opacity duration-300 group-hover:opacity-10" />

                <div className="absolute inset-0 p-4 flex flex-col justify-between transition-opacity duration-300 group-hover:opacity-10">
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
              className="ui-btn-secondary px-3 py-2"
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
              className="ui-btn-secondary px-3 py-2"
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
