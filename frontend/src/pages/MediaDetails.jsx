import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  Clock3,
  MonitorCheck,
  MonitorPlay,
  MonitorX,
  Scroll,
  Star,
} from "lucide-react";

import api from "../services/api";

export default function MediaDetails() {
  const location = useLocation();

  const [media] = useState(location.state?.media || null);
  const [videos, setVideos] = useState([]);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [currentRating, setCurrentRating] = useState(null);
  const [hoverRating, setHoverRating] = useState(null);

  const [lists, setLists] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const ratingStatuses = ["COMPLETED", "WATCHING", "DROPPED"];
  const showRating = ratingStatuses.includes(currentStatus);
  const displayRating = hoverRating ?? currentRating ?? 0;

  function normalizeRating(value) {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    return Number.parseFloat(value);
  }

  useEffect(() => {
    async function loadVideos() {
      if (!media) {
        return;
      }

      try {
        const response = await api.get(
          `/media/${media.tmdb_id}/videos?type=${media.type}`,
        );

        setVideos(response.data || []);
      } catch (error) {
        console.error("Erro ao carregar vídeos:", error);
      }
    }

    async function loadStatus() {
      if (!media) {
        return;
      }

      const token = localStorage.getItem("token");

      try {
        const response = await api.get(`/media/${media.tmdb_id}/status`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCurrentStatus(response.data?.status || null);
        setCurrentRating(normalizeRating(response.data?.rating));
      } catch (error) {
        console.error("Erro ao carregar status:", error);
      }
    }

    loadVideos();
    loadStatus();
  }, [media]);

  async function openListModal() {
    const token = localStorage.getItem("token");

    const response = await api.get("/lists", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setLists(response.data);
    setModalOpen(true);
  }

  async function addToList(listId) {
    const token = localStorage.getItem("token");

    await api.post(`/lists/${listId}/items`, media, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setModalOpen(false);
  }

  async function setMediaStatus(status, rating = currentRating) {
    const token = localStorage.getItem("token");
    const shouldPersistRating = ratingStatuses.includes(status);
    const normalizedRating = normalizeRating(rating);
    const payload = {
      ...media,
      status,
      rating: shouldPersistRating ? normalizedRating : null,
    };

    const response = await api.post("/media/status", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const nextStatus =
      response.data?.status?.status ?? response.data?.status ?? status ?? null;
    const nextRating = normalizeRating(response.data?.status?.rating);

    setCurrentStatus(nextStatus);
    setCurrentRating(
      shouldPersistRating
        ? nextRating ?? normalizedRating
        : null,
    );
  }

  function handleStatusClick(status) {
    if (currentStatus === status) {
      setMediaStatus(null);
      return;
    }

    setMediaStatus(status);
  }

  const statusOptions = [
    {
      value: "COMPLETED",
      label: "Assistido",
      icon: MonitorCheck,
      activeClass: "bg-green-700",
      hoverClass: "hover:bg-green-700",
    },
    {
      value: "WATCHING",
      label: "Assistindo",
      icon: MonitorPlay,
      activeClass: "bg-yellow-700",
      hoverClass: "hover:bg-yellow-700",
    },
    {
      value: "DROPPED",
      label: "Abandonado",
      icon: MonitorX,
      activeClass: "bg-red-800",
      hoverClass: "hover:bg-red-800",
    },
    {
      value: "PLANNED",
      label: "Quero ver",
      icon: Clock3,
      activeClass: "bg-blue-700",
      hoverClass: "hover:bg-blue-700",
    },
  ];

  const visibleStatusOptions =
    media?.type === "MOVIE"
      ? statusOptions.filter((option) => ["COMPLETED", "PLANNED"].includes(option.value))
      : statusOptions;

  if (!media) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white px-8 py-10">
        <p className="text-zinc-400">
          Mídia não encontrada. Volte para a busca e tente novamente.
        </p>

        <Link
          to="/search"
          className="inline-block mt-5 bg-red-600 hover:bg-red-700 transition rounded-xl px-5 py-3 font-semibold"
        >
          Voltar para busca
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      <section className="relative px-8 py-10 overflow-hidden">
        {media.poster_url && (
          <img
            src={media.poster_url}
            alt={media.title}
            className="absolute inset-0 w-full h-full object-cover opacity-20 blur-xl scale-110"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/90 to-zinc-950" />

        <div className="relative max-w-6xl mx-auto flex gap-8 items-end">
          {media.poster_url ? (
            <img
              src={media.poster_url}
              alt={media.title}
              className="w-56 rounded-3xl border border-zinc-800 shadow-2xl"
            />
          ) : (
            <div className="w-56 aspect-[2/3] rounded-3xl border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-500">
              Sem pôster
            </div>
          )}

          <div className="pb-4">
            <Link
              to="/search"
              className="text-sm text-zinc-400 hover:text-white transition"
            >
              ← Voltar para busca
            </Link>

            <p className="text-red-500 font-semibold mt-6">{media.type}</p>

            <h1 className="text-5xl font-bold mt-2">{media.title}</h1>

            {media.original_title && (
              <p className="text-zinc-400 mt-2">{media.original_title}</p>
            )}

            <p className="text-zinc-500 mt-2">
              {media.release_date || "Sem data"}
            </p>
          </div>
        </div>
      </section>

      <section className="px-8 pb-12">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_320px] gap-10">
          <div>
            <h2 className="text-2xl font-bold mb-4">Sinopse</h2>

            <p className="text-zinc-300 leading-relaxed max-w-3xl">
              {media.synopsis || "Sem sinopse disponível."}
            </p>
          </div>

          <aside className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 h-fit space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {visibleStatusOptions.map(({ value, label, icon: Icon, activeClass, hoverClass }) => (
                <button
                  key={value}
                  onClick={() => handleStatusClick(value)}
                  className={`flex items-center justify-center gap-2 transition rounded-xl py-3 text-sm ${
                    currentStatus === value
                      ? activeClass
                      : `bg-zinc-800 ${hoverClass}`
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </div>

            {showRating && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3">
                <div
                  className="flex items-center gap-2"
                  onMouseLeave={() => setHoverRating(null)}
                >
                  {Array.from({ length: 5 }, (_, index) => {
                    const value = index + 1;
                    const filled = Math.max(0, Math.min(1, displayRating - (value - 1)));
                    const isFull = filled >= 1;
                    const isHalf = filled >= 0.5 && filled < 1;

                    return (
                      <div key={value} className="relative h-10 w-10">
                        <Star
                          size={40}
                          className="absolute inset-0 text-zinc-700"
                        />

                        {isFull && (
                          <Star
                            size={40}
                            className="absolute inset-0 text-amber-400"
                            fill="currentColor"
                          />
                        )}

                        {isHalf && (
                          <Star
                            size={40}
                            className="absolute inset-0 text-amber-400"
                            fill="currentColor"
                            style={{ clipPath: "inset(0 50% 0 0)" }}
                          />
                        )}

                        <button
                          type="button"
                          onClick={() => setMediaStatus(currentStatus, value - 0.5)}
                          onMouseEnter={() => setHoverRating(value - 0.5)}
                          className="absolute inset-y-0 left-0 w-1/2 cursor-pointer"
                          aria-label={`Dar nota ${value - 0.5} de 5 estrelas`}
                        />

                        <button
                          type="button"
                          onClick={() => setMediaStatus(currentStatus, value)}
                          onMouseEnter={() => setHoverRating(value)}
                          className="absolute inset-y-0 right-0 w-1/2 cursor-pointer"
                          aria-label={`Dar nota ${value} de 5 estrelas`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={openListModal}
              className="w-full bg-red-600 hover:bg-red-700 transition rounded-xl h-[44px] font-semibold flex items-center justify-center gap-2"
            >
              <Scroll size={18} />
              Adicionar à lista
            </button>
          </aside>
        </div>
      </section>

      {videos.length > 0 && (
        <section className="px-8 pb-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-red-500 text-xl">▷</span>

              <h2 className="text-2xl font-bold">Vídeos</h2>
            </div>

            <div className="overflow-x-auto overflow-y-hidden pb-3 no-scrollbar">
              <div className="flex gap-4">
                {videos.map((video) => (
                  <div
                    key={video.key}
                    className="relative flex-shrink-0 w-[400px] aspect-video rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900"
                  >
                    <iframe
                      src={`https://www.youtube.com/embed/${video.key}`}
                      title={video.name}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <p className="text-sm font-semibold line-clamp-1">
                        {video.name}
                      </p>

                      <p className="text-xs text-white/50">{video.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-2">Escolher lista</h2>

            <p className="text-zinc-400 mb-5">
              Adicionar{" "}
              <span className="text-white font-semibold">{media.title}</span>{" "}
              em:
            </p>

            <div className="space-y-3">
              {lists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => addToList(list.id)}
                  className="w-full text-left bg-zinc-800 hover:bg-red-600 transition rounded-xl px-4 py-3"
                >
                  <p className="font-semibold">{list.title}</p>

                  {list.description && (
                    <p className="text-sm text-zinc-400">{list.description}</p>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setModalOpen(false)}
              className="mt-5 w-full border border-zinc-700 hover:bg-zinc-800 transition rounded-xl py-3"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
