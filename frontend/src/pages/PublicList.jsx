import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ThumbsUp } from "lucide-react";

import api from "../services/api";
import ThreadedComments from "../components/ThreadedComments";

export default function PublicList() {
  const { username, listId } = useParams();
  const [data, setData] = useState(null);
  const [comments, setComments] = useState([]);
  const [likeSubmitting, setLikeSubmitting] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  async function loadData() {
    setError("");

    try {
      const headers = token
        ? { Authorization: `Bearer ${token}` }
        : undefined;

      const [listResponse, commentsResponse] = await Promise.all([
        api.get(`/public/users/${username}/lists/${listId}`, { headers }),
        api.get(`/public/lists/${listId}/comments`, { headers }),
      ]);

      setData(listResponse.data);
      setComments(commentsResponse.data || []);
    } catch (fetchError) {
      setData(null);
      setComments([]);
      setError("Lista pública não encontrada.");
    }
  }

  useEffect(() => {
    loadData();
  }, [username, listId]);

  async function handleLike() {
    if (!token) {
      setError("Faça login para curtir.");
      return;
    }

    setLikeSubmitting(true);

    try {
      const response = await api.post(
        `/public/lists/${listId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setData((current) => ({
        ...current,
        likedByMe: response.data?.liked ?? current?.likedByMe,
        likesCount: response.data?.likesCount ?? current?.likesCount,
      }));
    } catch (likeError) {
      setError("Não foi possível curtir esta lista.");
    } finally {
      setLikeSubmitting(false);
    }
  }

  if (error && !data) {
    return (
      <main className="ui-page">
        <section className="max-w-6xl mx-auto">
          <p className="text-zinc-400">{error}</p>
        </section>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="ui-page">
        <p className="text-zinc-400">Carregando lista pública...</p>
      </main>
    );
  }

  const { user, list, likesCount, commentsCount, likedByMe } = data;
  const items = list.ListItems || [];

  async function handleCreateComment({ content, parentCommentId }) {
    if (!token) {
      setError("Faça login para comentar.");
      return;
    }

    await api.post(
      `/public/lists/${listId}/comments`,
      {
        content,
        parent_comment_id: parentCommentId,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    await loadData();
  }

  return (
    <main className="ui-page">
      <section className="max-w-7xl mx-auto space-y-10">
        {error && data && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div>
          <Link to={`/u/${user.username}`} className="ui-link-back">
            ← Voltar para o perfil
          </Link>

          <div className="mt-6 ui-card p-8">
            <p className="text-sm text-red-500 font-semibold mb-2">Lista pública</p>
            <h1 className="ui-title">{list.title}</h1>
            <p className="text-zinc-400 mt-3 max-w-3xl">{list.description || "Sem descrição"}</p>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-zinc-500 items-center">
              <span>{items.length} item{items.length === 1 ? "" : "s"}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-2">
                <ThumbsUp size={14} />
                <span>{likesCount ?? 0}</span>
              </span>
              <span>•</span>
              <span>{commentsCount ?? 0} comentário{commentsCount === 1 ? "" : "s"}</span>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={handleLike}
                disabled={likeSubmitting}
                aria-pressed={likedByMe}
                className={`flex items-center gap-2 transition ${
                  likedByMe ? "text-blue-400" : "text-zinc-300 hover:text-white"
                }`}
              >
                <ThumbsUp size={16} />
                <span>{likesCount ?? 0}</span>
              </button>

              {!token && (
                <Link
                  to="/"
                  className="ui-btn-secondary px-5 py-3"
                >
                  Entrar para comentar
                </Link>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="ui-section-title mb-6">Itens da lista</h2>

          {items.length === 0 ? (
            <div className="ui-empty">
              Essa lista ainda não possui mídias.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {items.map((item) => {
                const media = item.Media || item.Medium || item.media;
                if (!media) return null;

                return (
                  <div
                    key={item.id}
                    className="ui-card overflow-hidden shadow-lg shadow-black/30"
                  >
                    {media.poster_url ? (
                      <img
                        src={media.poster_url}
                        alt={media.title}
                        className="w-full h-72 object-cover"
                      />
                    ) : (
                      <div className="h-72 bg-zinc-800 flex items-center justify-center text-zinc-500 text-sm">
                        Sem pôster
                      </div>
                    )}

                    <div className="p-4">
                      <h3 className="font-semibold line-clamp-2">{media.title}</h3>
                      <p className="text-sm text-zinc-400 mt-1">{media.release_date || "Sem data"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <ThreadedComments
            title="Comentários"
            comments={comments}
            canComment={Boolean(token) && list.allow_comments !== false}
            allowReplies={list.allow_comments !== false}
            disabledMessage={
              list.allow_comments === false
                ? "Esta lista não permite comentários."
                : "Faça login para comentar."
            }
            topLevelPlaceholder={
              token ? "Escreva um comentário..." : "Faça login para comentar"
            }
            submitLabel="Comentar"
            onSubmitComment={handleCreateComment}
          />
        </div>
      </section>
    </main>
  );
}