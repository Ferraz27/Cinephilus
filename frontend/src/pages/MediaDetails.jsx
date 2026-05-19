import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  Clock3,
  MonitorCheck,
  MonitorPlay,
  MonitorX,
  Scroll,
  Star,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import api from "../services/api";

export default function MediaDetails() {
  const location = useLocation();

  const [media] = useState(location.state?.media || null);
  const [videos, setVideos] = useState([]);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [currentRating, setCurrentRating] = useState(null);
  const [hoverRating, setHoverRating] = useState(null);
  const [seasonsCount, setSeasonsCount] = useState(0);
  const [selectedSeason, setSelectedSeason] = useState(0);
  const [seasonPosters, setSeasonPosters] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewSort, setReviewSort] = useState("newest");
  const [reviewRatingFilter, setReviewRatingFilter] = useState("all");
  const [ratingSummary, setRatingSummary] = useState({
    average: 0,
    total: 0,
    distribution: {},
  });
  const [reviewSeason, setReviewSeason] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [lists, setLists] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const ratingStatuses = ["COMPLETED", "WATCHING", "DROPPED"];
  const showRating = ratingStatuses.includes(currentStatus);
  const displayRating = hoverRating ?? currentRating ?? 0;
  const ratingSteps = Array.from({ length: 10 }, (_, index) => (index + 1) * 0.5);
  const averageValue = ratingSummary.total ? Number(ratingSummary.average) : 0;
  const displayAverage = Math.floor(averageValue * 2) / 2;
  const averageLabel = ratingSummary.total
    ? averageValue.toFixed(2)
    : "0.00";
  const maxRatingCount = ratingSteps.reduce((max, value) => {
    const key = value.toFixed(1);
    const count = ratingSummary.distribution?.[key] ?? 0;
    return Math.max(max, count);
  }, 0);
  const activeSeasonPoster =
    media?.type === "SERIES"
      ? seasonPosters.find((season) => season.season_number === selectedSeason)?.poster_url
      : null;
  const posterUrl = activeSeasonPoster || media?.poster_url || null;
  const activeSeasonSynopsis =
    media?.type === "SERIES" && selectedSeason > 0
      ? seasonPosters.find((season) => season.season_number === selectedSeason)?.synopsis
      : null;
  const filteredReviews = reviews.filter((review) => {
    const ratingValue = Number(review.rating);

    if (reviewRatingFilter === "high") {
      return Number.isFinite(ratingValue) && ratingValue > 3;
    }

    if (reviewRatingFilter === "low") {
      return Number.isFinite(ratingValue) && ratingValue <= 3;
    }

    return true;
  });
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (reviewSort === "likes") {
      return Number(b.likes || 0) - Number(a.likes || 0);
    }

    const aTime = new Date(a.created_at).getTime();
    const bTime = new Date(b.created_at).getTime();

    if (reviewSort === "oldest") {
      return aTime - bTime;
    }

    return bTime - aTime;
  });

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

    async function loadDetails() {
      if (!media || media.type !== "SERIES") {
        setSeasonsCount(0);
        return;
      }

      try {
        const response = await api.get(
          `/media/${media.tmdb_id}/details?type=${media.type}`,
        );

        const seasons = response.data?.seasonsCount || 0;
        setSeasonsCount(seasons);
        setSeasonPosters(response.data?.seasons || []);

        if (selectedSeason > seasons) {
          setSelectedSeason(0);
          setReviewSeason(0);
        }
      } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
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
          params: media.type === "SERIES" ? { season: selectedSeason } : undefined,
        });

        setCurrentStatus(response.data?.status || null);
        setCurrentRating(normalizeRating(response.data?.rating));
      } catch (error) {
        console.error("Erro ao carregar status:", error);
      }
    }

    async function loadReviews() {
      if (!media) {
        setReviews([]);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await api.get(`/media/${media.tmdb_id}/reviews`, {
          params: media.type === "SERIES" ? { season: selectedSeason } : undefined,
          headers: token
            ? {
              Authorization: `Bearer ${token}`,
            }
            : undefined,
        });

        setReviews(response.data || []);
      } catch (error) {
        console.error("Erro ao carregar reviews:", error);
      }
    }

    async function loadRatingSummary() {
      if (!media) {
        return;
      }

      try {
        const response = await api.get(
          `/media/${media.tmdb_id}/ratings-summary`,
          {
            params: media.type === "SERIES" ? { season: selectedSeason } : undefined,
          },
        );

        setRatingSummary(response.data);
      } catch (error) {
        console.error("Erro ao carregar resumo de notas:", error);
      }
    }

    loadVideos();
    loadDetails();
    loadStatus();
    loadReviews();
    loadRatingSummary();
  }, [media, selectedSeason]);

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
      season_number: media.type === "SERIES" ? selectedSeason : 0,
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

    async function submitReview(event) {
    event.preventDefault();

    if (!reviewTitle.trim() || !reviewText.trim()) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    setReviewSubmitting(true);

    try {
      const payload = {
        ...media,
        review_title: reviewTitle.trim(),
        content: reviewText.trim(),
      };

      if (media.type === "SERIES") {
        payload.season_number = reviewSeason;
      }

      const response = await api.post(`/media/${media.tmdb_id}/reviews`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setReviews((current) => {
        const filtered = current.filter((review) => review.id !== response.data?.id);
        return [response.data, ...filtered];
      });
      setReviewTitle("");
      setReviewText("");
    } catch (error) {
      console.error("Erro ao enviar review:", error);
    } finally {
      setReviewSubmitting(false);
    }
  }

  async function voteReview(reviewId, value) {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    try {
      const response = await api.post(
        `/media/reviews/${reviewId}/vote`,
        { value },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setReviews((current) =>
        current.map((review) => {
          if (review.id !== reviewId) {
            return review;
          }

          return {
            ...review,
            likes: response.data?.likes ?? review.likes,
            dislikes: response.data?.dislikes ?? review.dislikes,
            user_vote: review.user_vote === value ? null : value,
          };
        }),
      );
    } catch (error) {
      console.error("Erro ao votar na review:", error);
    }
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
  const canPublishReview = media?.type === "MOVIE"
    ? currentStatus === "COMPLETED"
    : ["WATCHING", "COMPLETED"].includes(currentStatus);

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
        {posterUrl && (
          <img
            src={posterUrl}
            alt={media.title}
            className="absolute inset-0 w-full h-full object-cover opacity-20 blur-xl scale-110"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/90 to-zinc-950" />

        <div className="relative max-w-6xl mx-auto flex gap-8 items-end">
          {posterUrl ? (
            <img
              src={posterUrl}
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

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <p className="text-red-500 font-semibold">{media.type}</p>

              {media.type === "SERIES" && seasonsCount > 0 && (
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span className="uppercase tracking-[0.2em]">Temporadas</span>

                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[240px]">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSeason(0);
                        setReviewSeason(0);
                      }}
                      className={`rounded-lg px-2 py-1 text-xs font-semibold transition ${
                        selectedSeason === 0
                          ? "bg-red-600 text-white"
                          : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                      }`}
                    >
                      Geral
                    </button>
                    {Array.from({ length: seasonsCount }, (_, index) => {
                      const season = index + 1;
                      const isActive = season === selectedSeason;

                      return (
                        <button
                          key={season}
                          type="button"
                          onClick={() => {
                            setSelectedSeason(season);
                            setReviewSeason(season);
                          }}
                          className={`rounded-lg px-2 py-1 text-xs font-semibold transition ${
                            isActive
                              ? "bg-red-600 text-white"
                              : selectedSeason === 0
                                ? "bg-zinc-900 text-zinc-500"
                                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                          }`}
                        >
                          S{season}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

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
              {activeSeasonSynopsis || media.synopsis || "Sem sinopse disponível."}
            </p>

            <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-3 max-w-3xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-zinc-200">
                  Avaliações
                </h3>
                <span className="text-xs text-zinc-400">
                  {ratingSummary.total} total
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <span className="text-5xl font-bold text-amber-400">
                  {averageLabel}
                </span>

                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, index) => {
                    const value = index + 1;
                    const filled = Math.max(0, Math.min(1, displayAverage - (value - 1)));
                    const isFull = filled >= 1;
                    const isHalf = filled >= 0.5 && filled < 1;

                    return (
                      <div key={value} className="relative h-6 w-6">
                        <Star size={24} className="absolute inset-0 text-zinc-700" />

                        {isFull && (
                          <Star
                            size={24}
                            className="absolute inset-0 text-amber-400"
                            fill="currentColor"
                          />
                        )}

                        {isHalf && (
                          <Star
                            size={24}
                            className="absolute inset-0 text-amber-400"
                            fill="currentColor"
                            style={{ clipPath: "inset(0 50% 0 0)" }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {ratingSummary.total > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-end gap-1 h-24">
                    {ratingSteps.map((value) => {
                      const key = value.toFixed(1);
                      const count = ratingSummary.distribution?.[key] ?? 0;
                      const height = maxRatingCount > 0
                        ? Math.max(6, Math.round((count / maxRatingCount) * 100))
                        : 6;

                      return (
                        <div key={key} className="flex-1 flex flex-col items-center justify-end h-full">
                          <div
                            className="w-full rounded-md bg-blue-500/80 hover:bg-blue-400 transition"
                            style={{ height: `${height}%` }}
                            title={`${key} estrelas: ${count}`}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>0.5</span>
                    <span>5.0</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-500">Sem avaliacoes ainda.</p>
              )}
            </div>
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

      <section className="px-8 pb-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-red-500 text-xl">✎</span>
              <h2 className="text-2xl font-bold">Escreva sua Review</h2>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <select
                value={reviewSort}
                onChange={(event) => setReviewSort(event.target.value)}
                className="rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-red-500"
              >
                <option value="newest">Mais recentes</option>
                <option value="oldest">Menos recentes</option>
                <option value="likes">Mais curtidas</option>
              </select>

              <select
                value={reviewRatingFilter}
                onChange={(event) => setReviewRatingFilter(event.target.value)}
                className="rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-red-500"
              >
                <option value="all">Todas as notas</option>
                <option value="high">Nota alta (&gt; 3)</option>
                <option value="low">Nota baixa (≤ 3)</option>
              </select>
            </div>

            <form onSubmit={submitReview} className="space-y-3 mb-8">
              {media.type === "SERIES" && (
                <div className="flex items-center gap-3">
                  <label className="text-xs text-zinc-400">
                    Review de
                  </label>
                  <select
                    value={reviewSeason}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setReviewSeason(value);
                      setSelectedSeason(value);
                    }}
                    className="rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-red-500"
                  >
                    <option value={0}>Série</option>
                    {Array.from({ length: seasonsCount }, (_, index) => (
                      <option key={index + 1} value={index + 1}>
                        Temporada {index + 1}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <input
                value={reviewTitle}
                onChange={(event) => setReviewTitle(event.target.value)}
                placeholder="Titulo da review"
                className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm text-white outline-none focus:border-red-500"
                maxLength={120}
              />

              <textarea
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
                placeholder={
                  media.type === "SERIES"
                    ? reviewSeason > 0
                      ? `Escreva sua review da temporada S${reviewSeason}...`
                      : "Escreva sua review da serie como um todo..."
                    : "Escreva sua review do filme..."
                }
                className="w-full min-h-[140px] rounded-2xl bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm text-white outline-none focus:border-red-500"
                maxLength={2000}
              />

              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">
                  {reviewTitle.length}/120 · {reviewText.length}/2000
                </span>

                <span
                  title={
                    canPublishReview
                      ? ""
                      : "Voce precisa assistir primeiro para publicar."
                  }
                >
                  <button
                    type="submit"
                    disabled={reviewSubmitting || !canPublishReview}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:text-zinc-300 transition rounded-xl px-5 py-2 text-sm font-semibold"
                  >
                    Publicar
                  </button>
                </span>
              </div>
            </form>

            <div className="flex items-center gap-3 mb-5 mt-8">
              <span className="text-red-500 text-xl">✎</span>
              <h3 className="text-xl font-bold">Reviews</h3>
            </div>

            <div className="space-y-4">
              {sortedReviews.map((review) => {
                const ratingValue = Number(review.rating);
                const displayReviewRating = Number.isFinite(ratingValue)
                  ? Math.floor(ratingValue * 2) / 2
                  : null;

                return (
                <div
                  key={review.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4"
                >
                  <div className="flex items-start justify-between gap-3 text-sm text-zinc-300">
                    <div className="flex items-center gap-3">
                      {review.User?.avatar_url ? (
                      <img
                        src={review.User.avatar_url}
                        alt={review.User?.name || review.User?.username || "Usuario"}
                        className="h-9 w-9 rounded-full object-cover border border-zinc-800"
                      />
                      ) : (
                      <div className="h-9 w-9 rounded-full bg-red-600 flex items-center justify-center text-sm font-bold uppercase">
                        {(review.User?.name || review.User?.username || "U")[0]}
                      </div>
                      )}

                      <span className="font-semibold text-white">
                        {review.User?.name || review.User?.username || "Usuario"}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {new Date(review.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {Number.isFinite(ratingValue) && (
                        <div className="flex items-center gap-2 text-amber-400">
                          <div className="flex items-center">
                            {Array.from({ length: 5 }, (_, index) => {
                              const value = index + 1;
                              const filled = Math.max(
                                0,
                                Math.min(1, displayReviewRating - (value - 1))
                              );
                              const isFull = filled >= 1;
                              const isHalf = filled >= 0.5 && filled < 1;

                              return (
                                <div key={value} className="relative h-5 w-5">
                                  <Star size={20} className="absolute inset-0 text-zinc-700" />

                                  {isFull && (
                                    <Star
                                      size={20}
                                      className="absolute inset-0 text-amber-400"
                                      fill="currentColor"
                                    />
                                  )}

                                  {isHalf && (
                                    <Star
                                      size={20}
                                      className="absolute inset-0 text-amber-400"
                                      fill="currentColor"
                                      style={{ clipPath: "inset(0 50% 0 0)" }}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {media.type === "SERIES" && (
                        <span className="text-xs uppercase tracking-wide rounded-full bg-zinc-800 text-zinc-300 px-3 py-1.5">
                          {Number(review.season_number) > 0
                            ? `S${review.season_number}`
                            : "Serie"}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mt-3">
                    {review.title}
                  </h3>

                  <p className="text-sm text-zinc-200 mt-3 whitespace-pre-wrap">
                    {review.content}
                  </p>

                  <div className="flex items-center gap-4 mt-4 text-sm text-zinc-300">
                    <button
                      type="button"
                      onClick={() => voteReview(review.id, 1)}
                      className={`flex items-center gap-2 transition ${
                        Number(review.user_vote) === 1
                          ? "text-blue-400"
                          : "text-zinc-300 hover:text-white"
                      }`}
                    >
                      <ThumbsUp size={16} />
                      {Number(review.likes || 0)}
                    </button>

                    <button
                      type="button"
                      onClick={() => voteReview(review.id, -1)}
                      className={`flex items-center gap-2 transition ${
                        Number(review.user_vote) === -1
                          ? "text-red-400"
                          : "text-zinc-300 hover:text-white"
                      }`}
                    >
                      <ThumbsDown size={16} />
                      {Number(review.dislikes || 0)}
                    </button>
                  </div>
                </div>
                );
              })}

              {sortedReviews.length === 0 && (
                <p className="text-sm text-zinc-500">Nenhuma review ainda.</p>
              )}
            </div>
          </div>
      </section>

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
