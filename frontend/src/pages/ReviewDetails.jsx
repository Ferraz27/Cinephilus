import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ThumbsUp, ThumbsDown, Star } from "lucide-react";

import api from "../services/api";
import ThreadedComments from "../components/ThreadedComments";

export default function ReviewDetails() {
  const { id } = useParams();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setError("");
      setLoading(true);

      try {
        const response = await api.get(`/media/reviews/${id}`);
        setReview(response.data);
      } catch (err) {
        setError("Review não encontrada.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

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

    setReview((current) => ({
      ...current,
      MediaReviewComments: [...(current.MediaReviewComments || []), response.data],
    }));
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

      setReview((current) => ({
        ...current,
        likes: response.data?.likes ?? current.likes,
        dislikes: response.data?.dislikes ?? current.dislikes,
        user_vote: current.user_vote === value ? null : value,
      }));
    } catch (error) {
      console.error("Erro ao votar na review:", error);
    }
  }

  function formatRating(value) {
    if (value === null || value === undefined || value === "") {
      return "Sem nota";
    }

    return Number(value).toFixed(1).replace(".0", "");
  }

  if (loading) {
    return (
      <main className="ui-page">
        <p className="text-zinc-400">Carregando review...</p>
      </main>
    );
  }

  if (error || !review) {
    return (
      <main className="ui-page">
        <p className="text-zinc-400">{error || "Review não encontrada."}</p>
        <Link to="/search" className="ui-btn-primary mt-5">
          Voltar para busca
        </Link>
      </main>
    );
  }

  const ratingValue = Number(review.rating);
  const displayReviewRating = Number.isFinite(ratingValue) ? Math.floor(ratingValue * 2) / 2 : null;

  return (
    <main className="ui-page">
      <section className="max-w-5xl mx-auto">
        <div className="ui-card p-6">
          <div className="flex items-start justify-between gap-3 text-sm text-zinc-300">
            <div className="flex items-center gap-3">
              {review.User?.avatar_url ? (
                <img src={review.User.avatar_url} alt={review.User?.name || review.User?.username} className="h-11 w-11 rounded-full object-cover border border-zinc-800" />
              ) : (
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-sm font-bold uppercase">{(review.User?.name || review.User?.username || "U")[0]}</div>
              )}

              <div>
                {review.User?.username ? (
                  <Link to={`/u/${review.User.username}`} className="font-semibold text-white hover:underline">{review.User?.name || review.User?.username}</Link>
                ) : (
                  <span className="font-semibold text-white">{review.User?.name || review.User?.username}</span>
                )}
                <div className="text-xs text-zinc-500">{new Date(review.created_at).toLocaleDateString("pt-BR")}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {Number.isFinite(ratingValue) && (
                <div className="flex items-center gap-2 text-amber-400">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }, (_, index) => {
                      const value = index + 1;
                      const filled = Math.max(0, Math.min(1, displayReviewRating - (value - 1)));
                      const isFull = filled >= 1;
                      const isHalf = filled >= 0.5 && filled < 1;

                      return (
                        <div key={value} className="relative h-5 w-5">
                          <Star size={20} className="absolute inset-0 text-zinc-700" />

                          {isFull && <Star size={20} className="absolute inset-0 text-amber-400" fill="currentColor" />}
                          {isHalf && <Star size={20} className="absolute inset-0 text-amber-400" fill="currentColor" style={{ clipPath: "inset(0 50% 0 0)" }} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {review.Media?.type === "SERIES" && (
                <span className="text-xs uppercase tracking-wide rounded-full bg-zinc-800 text-zinc-300 px-3 py-1.5">{Number(review.season_number) > 0 ? `S${review.season_number}` : "Série"}</span>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-white mt-4">{review.title}</h1>

          <p className="text-sm text-zinc-200 mt-4 whitespace-pre-wrap">{review.content}</p>

          <div className="flex items-center gap-4 mt-4 text-sm text-zinc-300">
            <button type="button" onClick={() => voteReview(review.id, 1)} className={`flex items-center gap-2 transition ${Number(review.user_vote) === 1 ? "text-blue-400" : "text-zinc-300 hover:text-white"}`}>
              <ThumbsUp size={16} />
              {Number(review.likes || 0)}
            </button>

            <button type="button" onClick={() => voteReview(review.id, -1)} className={`flex items-center gap-2 transition ${Number(review.user_vote) === -1 ? "text-red-400" : "text-zinc-300 hover:text-white"}`}>
              <ThumbsDown size={16} />
              {Number(review.dislikes || 0)}
            </button>
          </div>

          <div className="mt-6">
            <ThreadedComments
              title="Comentários da review"
              comments={review.MediaReviewComments || []}
              canComment={Boolean(localStorage.getItem("token")) && review.allow_replies !== false}
              allowReplies={review.allow_replies !== false}
              disabledMessage={review.allow_replies === false ? "Replies estão desativados para esta review." : "Faça login para comentar esta review."}
              topLevelPlaceholder="Escreva um comentário sobre esta review..."
              submitLabel="Comentar"
              onSubmitComment={(payload) => handleReviewComment(review.id, payload)}
            />
          </div>

          {review.Media && (
            <div className="mt-6 text-sm text-zinc-400">
              Mídia: <Link to={`/media/${review.Media.tmdb_id}`} className="text-white hover:underline">{review.Media.title}</Link>
              {review.rating !== undefined && <span className="ml-4">Nota do autor: <strong className="text-white">{formatRating(review.rating)}</strong></span>}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
