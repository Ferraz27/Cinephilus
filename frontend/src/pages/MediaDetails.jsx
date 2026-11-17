import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  ArrowDown,
  ArrowUp,
  Clock3,
  ChevronDown,
  MonitorCheck,
  MonitorPlay,
  MonitorX,
  Scroll,
  Star,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import api from "../services/api";
import ThreadedComments from "../components/ThreadedComments";

function formatReleaseDate(value) {
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

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
  const [providers, setProviders] = useState([]);
  const [providersLink, setProvidersLink] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewSort, setReviewSort] = useState("date");
  const [reviewSortDirection, setReviewSortDirection] = useState("desc");
  const [reviewRatingFilter, setReviewRatingFilter] = useState("all");
  const [ratingSummary, setRatingSummary] = useState({
    average: 0,
    total: 0,
    distribution: {},
  });
  const [reviewSeason, setReviewSeason] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewAllowReplies, setReviewAllowReplies] = useState(true);
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
    ? averageValue.toFixed(1)
    : "–";
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

    if (reviewRatingFilter !== "all") {
      const target = Number(reviewRatingFilter);

      if (!Number.isFinite(target)) {
        return true;
      }

      return Number.isFinite(ratingValue)
        ? ratingValue >= target && ratingValue < target + 1
        : false;
    }

    return true;
  });
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    const multiplier = reviewSortDirection === "asc" ? 1 : -1;

    if (reviewSort === "likes") {
      return (Number(a.likes || 0) - Number(b.likes || 0)) * multiplier;
    }

    const aTime = new Date(a.created_at).getTime();
    const bTime = new Date(b.created_at).getTime();

    return (aTime - bTime) * multiplier;
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
      if (!media) {
        setSeasonsCount(0);
        setProviders([]);
        setProvidersLink(null);
        return;
      }

      try {
        const response = await api.get(
          `/media/${media.tmdb_id}/details?type=${media.type}`,
        );

        const seasons = response.data?.seasonsCount || 0;
        setSeasonsCount(seasons);
        setSeasonPosters(response.data?.seasons || []);
        setProviders(response.data?.providers || []);
        setProvidersLink(response.data?.providersLink || null);

        if (media.type === "SERIES" && selectedSeason > seasons) {
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
        allow_replies: reviewAllowReplies,
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
      setReviewAllowReplies(true);
    } catch (error) {
      console.error("Erro ao enviar review:", error);
    } finally {
      setReviewSubmitting(false);
    }
  }

  async function handleReviewComment(reviewId, { content, parentCommentId }) {
    const token = localStorage.getItem("token");

    const response = await api.post(
      `/media/reviews/${reviewId}/comments`,
      {
        content,
        parent_comment_id: parentCommentId,
      },
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
          MediaReviewComments: [...(review.MediaReviewComments || []), response.data],
        };
      }),
    );
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
      activeClass: "bg-emerald-500/15 border-emerald-500/50 text-emerald-300",
      hoverClass: "hover:border-emerald-500/40 hover:text-emerald-200",
    },
    {
      value: "WATCHING",
      label: "Assistindo",
      icon: MonitorPlay,
      activeClass: "bg-amber-500/15 border-amber-500/50 text-amber-300",
      hoverClass: "hover:border-amber-500/40 hover:text-amber-200",
    },
    {
      value: "DROPPED",
      label: "Abandonado",
      icon: MonitorX,
      activeClass: "bg-rose-500/15 border-rose-500/50 text-rose-300",
      hoverClass: "hover:border-rose-500/40 hover:text-rose-200",
    },
    {
      value: "PLANNED",
      label: "Quero ver",
      icon: Clock3,
      activeClass: "bg-sky-500/15 border-sky-500/50 text-sky-300",
      hoverClass: "hover:border-sky-500/40 hover:text-sky-200",
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

        <div className="relative max-w-6xl mx-auto flex flex-col sm:flex-row gap-8 sm:items-end">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={media.title}
              className="w-40 sm:w-56 shrink-0 rounded-3xl border border-zinc-800 shadow-2xl shadow-black/60"
            />
          ) : (
            <div className="w-40 sm:w-56 shrink-0 aspect-[2/3] rounded-3xl border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-500">
              Sem pôster
            </div>
          )}

          <div className="pb-4 flex-1 min-w-0">
            <Link
              to="/search"
              className="text-sm text-zinc-400 hover:text-white transition"
            >
              ← Voltar para busca
            </Link>

            {providers.length > 0 && (
              <div className="mt-4 flex items-center gap-2">
                {providers.map((provider) => {
                  const icon = (
                    <img
                      src={provider.logo_url}
                      alt={provider.provider_name}
                      title={provider.provider_name}
                      className="h-9 w-9 rounded-lg border border-zinc-800 shadow-lg"
                    />
                  );

                  return providersLink ? (
                    <a
                      key={provider.provider_id}
                      href={providersLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {icon}
                    </a>
                  ) : (
                    <span key={provider.provider_id}>{icon}</span>
                  );
                })}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-red-600/15 border border-red-500/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-red-400">
                {media.type === "SERIES" ? "Série" : media.type === "MOVIE" ? "Filme" : media.type}
              </span>

              {media.release_date && (
                <span className="rounded-full bg-zinc-800/80 border border-zinc-700/60 px-3 py-1 text-xs text-zinc-300">
                  {formatReleaseDate(media.release_date)}
                </span>
              )}

              {media.type === "SERIES" && seasonsCount > 0 && (
                <span className="rounded-full bg-zinc-800/80 border border-zinc-700/60 px-3 py-1 text-xs text-zinc-300">
                  {seasonsCount} {seasonsCount === 1 ? "temporada" : "temporadas"}
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mt-3 leading-tight">{media.title}</h1>

            {media.original_title && media.original_title !== media.title && (
              <p className="text-zinc-400 mt-2 italic">{media.original_title}</p>
            )}

            {media.type === "SERIES" && seasonsCount > 0 && (
              <div className="mt-6">
                <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                  Temporadas
                </p>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSeason(0);
                      setReviewSeason(0);
                    }}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                      selectedSeason === 0
                        ? "bg-red-600 text-white shadow-lg shadow-red-900/40"
                        : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700"
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
                        className={`min-w-[2.75rem] rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                          isActive
                            ? "bg-red-600 text-white shadow-lg shadow-red-900/40"
                            : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white"
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
        </div>
      </section>

      <section className="px-8 pb-12">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_320px] gap-10 items-start">
          <div className="space-y-8 max-w-3xl">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="h-6 w-1 rounded-full bg-red-600" />
                <h2 className="text-2xl font-bold">Sinopse</h2>
                {media.type === "SERIES" && selectedSeason > 0 && (
                  <span className="rounded-full bg-zinc-800/80 border border-zinc-700/60 px-3 py-1 text-xs text-zinc-300">
                    Temporada {selectedSeason}
                  </span>
                )}
              </div>

              <p className="text-zinc-300 leading-relaxed text-[15px]">
                {activeSeasonSynopsis || media.synopsis || "Sem sinopse disponível."}
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/40 p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className="h-6 w-1 rounded-full bg-amber-400" />
                  <h3 className="text-lg font-semibold">Avaliações</h3>
                </div>
                <span className="rounded-full bg-zinc-800/80 border border-zinc-700/60 px-3 py-1 text-xs text-zinc-300">
                  {ratingSummary.total} {ratingSummary.total === 1 ? "avaliação" : "avaliações"}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex flex-col items-center sm:items-start gap-2 sm:pr-6 sm:border-r sm:border-zinc-800 shrink-0">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-5xl font-bold ${ratingSummary.total ? "text-amber-400" : "text-zinc-600"}`}>
                      {averageLabel}
                    </span>
                    <span className="text-sm text-zinc-500">/ 5</span>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, index) => {
                      const value = index + 1;
                      const filled = Math.max(0, Math.min(1, displayAverage - (value - 1)));
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

                <div className="flex-1 min-w-0">
                  {ratingSummary.total > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-end gap-1 h-20">
                        {ratingSteps.map((value) => {
                          const key = value.toFixed(1);
                          const count = ratingSummary.distribution?.[key] ?? 0;
                          const height = maxRatingCount > 0
                            ? Math.max(6, Math.round((count / maxRatingCount) * 100))
                            : 6;

                          return (
                            <div key={key} className="flex-1 flex flex-col items-center justify-end h-full">
                              <div
                                className={`w-full rounded-t-md transition ${
                                  count > 0
                                    ? "bg-gradient-to-t from-amber-600/70 to-amber-400 hover:to-amber-300"
                                    : "bg-zinc-800"
                                }`}
                                style={{ height: `${height}%` }}
                                title={`${key} estrelas: ${count}`}
                              />
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Star size={12} /> 0.5
                        </span>
                        <span className="flex items-center gap-1">
                          <Star size={12} fill="currentColor" /> 5.0
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-zinc-800 px-5 py-6 text-center">
                      <p className="text-sm text-zinc-300">Ainda não há avaliações.</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        Marque como assistido e seja o primeiro a dar uma nota.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <aside className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 space-y-4 lg:sticky lg:top-24 shadow-xl shadow-black/30">
            <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Seu status</p>

            <div className="grid grid-cols-2 gap-2">
              {visibleStatusOptions.map(({ value, label, icon: Icon, activeClass, hoverClass }) => (
                <button
                  key={value}
                  onClick={() => handleStatusClick(value)}
                  className={`flex items-center justify-center gap-2 transition rounded-xl border py-3 text-sm font-medium ${
                    currentStatus === value
                      ? activeClass
                      : `bg-zinc-800/60 border-zinc-700/50 text-zinc-300 ${hoverClass}`
                  }`}
                >
                  <Icon size={17} />
                  {label}
                </button>
              ))}
            </div>

            {showRating && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Sua nota</p>
                  <span className={`text-sm font-semibold ${displayRating ? "text-amber-400" : "text-zinc-600"}`}>
                    {displayRating ? displayRating.toFixed(1) : "–"}
                  </span>
                </div>
                <div
                  className="flex items-center justify-between"
                  onMouseLeave={() => setHoverRating(null)}
                >
                  {Array.from({ length: 5 }, (_, index) => {
                    const value = index + 1;
                    const filled = Math.max(0, Math.min(1, displayRating - (value - 1)));
                    const isFull = filled >= 1;
                    const isHalf = filled >= 0.5 && filled < 1;

                    return (
                      <div key={value} className="relative h-9 w-9">
                        <Star
                          size={36}
                          className="absolute inset-0 text-zinc-700"
                        />

                        {isFull && (
                          <Star
                            size={36}
                            className="absolute inset-0 text-amber-400"
                            fill="currentColor"
                          />
                        )}

                        {isHalf && (
                          <Star
                            size={36}
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
              className="w-full bg-red-600 hover:bg-red-500 active:scale-[0.99] transition rounded-xl h-[46px] font-semibold flex items-center justify-center gap-2 shadow-lg shadow-red-900/40"
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
              <span className="h-6 w-1 rounded-full bg-red-600" />

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
              <span className="h-6 w-1 rounded-full bg-red-600" />
              <h2 className="text-2xl font-bold">Escreva sua review</h2>
            </div>

            <form
              onSubmit={submitReview}
              className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/40 p-6 space-y-4 mb-12"
            >
              {media.type === "SERIES" && (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                    Review de
                  </span>
                  <div className="relative">
                    <select
                      value={reviewSeason}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        setReviewSeason(value);
                        setSelectedSeason(value);
                      }}
                      className="appearance-none rounded-full bg-zinc-800/80 border border-zinc-700/60 px-4 py-1.5 pr-8 text-xs font-semibold text-zinc-200 outline-none transition hover:border-zinc-600 focus:border-red-500/60"
                    >
                      <option value={0}>Série completa</option>
                      {Array.from({ length: seasonsCount }, (_, index) => (
                        <option key={index + 1} value={index + 1}>
                          Temporada {index + 1}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                  </div>
                </div>
              )}

              <input
                value={reviewTitle}
                onChange={(event) => setReviewTitle(event.target.value)}
                placeholder="Título da review"
                className="w-full rounded-2xl bg-zinc-950/60 border border-zinc-800 px-4 py-3 text-base font-semibold text-white placeholder:font-normal placeholder:text-zinc-500 outline-none transition focus:border-red-500/60 focus:ring-2 focus:ring-red-500/15"
                maxLength={120}
              />

              <textarea
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
                placeholder={
                  media.type === "SERIES"
                    ? reviewSeason > 0
                      ? `Escreva sua review da temporada ${reviewSeason}...`
                      : "Escreva sua review da série como um todo..."
                    : "Escreva sua review do filme..."
                }
                className="w-full min-h-[150px] resize-y rounded-2xl bg-zinc-950/60 border border-zinc-800 px-4 py-3 text-sm leading-relaxed text-white placeholder:text-zinc-500 outline-none transition focus:border-red-500/60 focus:ring-2 focus:ring-red-500/15"
                maxLength={2000}
              />

              {!canPublishReview && (
                <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-200">
                  {media.type === "MOVIE"
                    ? "Marque o filme como Assistido para poder publicar sua review."
                    : "Marque a série como Assistindo ou Assistido para poder publicar sua review."}
                </p>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={reviewAllowReplies}
                      onChange={(event) => setReviewAllowReplies(event.target.checked)}
                      className="h-4 w-4 accent-red-600 cursor-pointer"
                    />
                    Permitir respostas
                  </label>

                  <span className="text-xs text-zinc-500 tabular-nums">
                    {reviewTitle.length}/120 · {reviewText.length}/2000
                  </span>
                </div>

                <span
                  title={
                    canPublishReview
                      ? ""
                      : "Você precisa assistir primeiro para publicar."
                  }
                >
                  <button
                    type="submit"
                    disabled={reviewSubmitting || !canPublishReview}
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-500 active:scale-[0.99] disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none disabled:cursor-not-allowed transition rounded-xl px-6 h-[42px] text-sm font-semibold shadow-lg shadow-red-900/40"
                  >
                    {reviewSubmitting ? "Publicando..." : "Publicar review"}
                  </button>
                </span>
              </div>
            </form>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="h-6 w-1 rounded-full bg-red-600" />
                <h3 className="text-2xl font-bold">Reviews</h3>
                <span className="rounded-full bg-zinc-800/80 border border-zinc-700/60 px-3 py-1 text-xs text-zinc-300">
                  {sortedReviews.length}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <select
                    value={reviewSort}
                    onChange={(event) => setReviewSort(event.target.value)}
                    className="appearance-none rounded-full bg-zinc-800/80 border border-zinc-700/60 px-4 py-1.5 pr-8 text-xs font-semibold text-zinc-200 outline-none transition hover:border-zinc-600 focus:border-red-500/60"
                  >
                    <option value="date">Mais recentes</option>
                    <option value="likes">Mais curtidas</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setReviewSortDirection((value) =>
                      value === "asc" ? "desc" : "asc",
                    )
                  }
                  className="flex items-center justify-center h-[30px] w-[30px] rounded-full bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 hover:text-white hover:border-zinc-600 transition"
                  title={
                    reviewSortDirection === "asc"
                      ? "Ordem crescente"
                      : "Ordem decrescente"
                  }
                >
                  {reviewSortDirection === "asc" ? (
                    <ArrowUp size={14} />
                  ) : (
                    <ArrowDown size={14} />
                  )}
                </button>

                <div className="relative">
                  <select
                    value={reviewRatingFilter}
                    onChange={(event) => setReviewRatingFilter(event.target.value)}
                    className="appearance-none rounded-full bg-zinc-800/80 border border-zinc-700/60 px-4 py-1.5 pr-8 text-xs font-semibold text-zinc-200 outline-none transition hover:border-zinc-600 focus:border-red-500/60"
                  >
                    <option value="all">Todas as notas</option>
                    <option value="5">5 estrelas</option>
                    <option value="4">4 estrelas</option>
                    <option value="3">3 estrelas</option>
                    <option value="2">2 estrelas</option>
                    <option value="1">1 estrela</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {sortedReviews.map((review) => {
                const ratingValue = Number(review.rating);
                const hasRating = review.rating !== null && review.rating !== undefined && Number.isFinite(ratingValue);
                const displayReviewRating = hasRating
                  ? Math.floor(ratingValue * 2) / 2
                  : null;
                const authorName = review.User?.name || review.User?.username || "Usuário";

                return (
                <article
                  key={review.id}
                  className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/40 p-6 transition hover:border-zinc-700"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {review.User?.avatar_url ? (
                      <img
                        src={review.User.avatar_url}
                        alt={authorName}
                        className="h-10 w-10 shrink-0 rounded-full object-cover border border-zinc-700"
                      />
                      ) : (
                      <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-sm font-bold uppercase">
                        {authorName[0]}
                      </div>
                      )}

                      <div className="min-w-0">
                        {review.User?.username ? (
                          <Link
                            to={`/u/${review.User.username}`}
                            className="block truncate text-sm font-semibold text-white hover:text-red-400 transition"
                          >
                            {authorName}
                          </Link>
                        ) : (
                          <span className="block truncate text-sm font-semibold text-white">
                            {authorName}
                          </span>
                        )}
                        <span className="text-xs text-zinc-500">
                          {new Date(review.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {hasRating && (
                        <div className="flex items-center gap-1.5 rounded-full bg-zinc-950/60 border border-zinc-800 px-2.5 py-1">
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
                                <div key={value} className="relative h-4 w-4">
                                  <Star size={16} className="absolute inset-0 text-zinc-700" />

                                  {isFull && (
                                    <Star
                                      size={16}
                                      className="absolute inset-0 text-amber-400"
                                      fill="currentColor"
                                    />
                                  )}

                                  {isHalf && (
                                    <Star
                                      size={16}
                                      className="absolute inset-0 text-amber-400"
                                      fill="currentColor"
                                      style={{ clipPath: "inset(0 50% 0 0)" }}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <span className="text-xs font-semibold text-amber-400 tabular-nums">
                            {ratingValue.toFixed(1)}
                          </span>
                        </div>
                      )}

                      {media.type === "SERIES" && (
                        <span className="rounded-full bg-red-600/15 border border-red-500/30 px-3 py-1 text-xs font-semibold text-red-300">
                          {Number(review.season_number) > 0
                            ? `Temporada ${review.season_number}`
                            : "Série"}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mt-4">
                    <Link to={`/reviews/${review.id}`} className="hover:text-red-400 transition">{review.title}</Link>
                  </h3>

                  <p className="text-sm leading-relaxed text-zinc-300 mt-2 whitespace-pre-wrap">
                    {review.content}
                  </p>

                  <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-zinc-800/80">
                    <div className="flex items-center gap-2 text-sm">
                      <button
                        type="button"
                        onClick={() => voteReview(review.id, 1)}
                        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition ${
                          Number(review.user_vote) === 1
                            ? "bg-sky-500/15 border-sky-500/50 text-sky-300"
                            : "bg-zinc-800/60 border-zinc-700/50 text-zinc-300 hover:border-sky-500/40 hover:text-sky-200"
                        }`}
                      >
                        <ThumbsUp size={15} />
                        {Number(review.likes || 0)}
                      </button>

                      <button
                        type="button"
                        onClick={() => voteReview(review.id, -1)}
                        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition ${
                          Number(review.user_vote) === -1
                            ? "bg-rose-500/15 border-rose-500/50 text-rose-300"
                            : "bg-zinc-800/60 border-zinc-700/50 text-zinc-300 hover:border-rose-500/40 hover:text-rose-200"
                        }`}
                      >
                        <ThumbsDown size={15} />
                        {Number(review.dislikes || 0)}
                      </button>
                    </div>

                    <Link
                      to={`/reviews/${review.id}`}
                      className="text-xs font-semibold text-zinc-400 hover:text-white transition"
                    >
                      Ver review →
                    </Link>
                  </div>

                  <div className="mt-5">
                    <ThreadedComments
                      title="Comentários da review"
                      comments={review.MediaReviewComments || []}
                      canComment={Boolean(localStorage.getItem("token")) && review.allow_replies !== false}
                      allowReplies={review.allow_replies !== false}
                      disabledMessage={
                        review.allow_replies === false
                          ? "Respostas estão desativadas para esta review."
                          : "Faça login para comentar esta review."
                      }
                      topLevelPlaceholder="Escreva um comentário sobre esta review..."
                      submitLabel="Comentar"
                      onSubmitComment={(payload) => handleReviewComment(review.id, payload)}
                    />
                  </div>
                </article>
                );
              })}

              {sortedReviews.length === 0 && (
                <div className="rounded-3xl border border-dashed border-zinc-800 px-6 py-10 text-center">
                  <p className="text-sm text-zinc-300">Nenhuma review por aqui ainda.</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Que tal ser o primeiro a contar o que achou?
                  </p>
                </div>
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
