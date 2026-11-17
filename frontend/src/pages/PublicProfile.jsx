import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LayoutList, CheckCircle2, Star } from "lucide-react";

import api from "../services/api";

export default function PublicProfile() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  async function loadProfile() {
    setError("");

    try {
      const response = await api.get(`/public/users/${username}`);
      setData(response.data);
    } catch (fetchError) {
      setData(null);
      setError("Perfil privado ou não encontrado.");
    }
  }

  useEffect(() => {
    loadProfile();
  }, [username]);

  if (error) {
    return (
      <main className="ui-page">
        <section className="max-w-6xl mx-auto">
          <p className="text-zinc-400">{error}</p>
          <Link
            to="/search"
            className="ui-btn-primary mt-5"
          >
            Voltar para busca
          </Link>
        </section>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="ui-page">
        <p className="text-zinc-400">Carregando perfil público...</p>
      </main>
    );
  }

  const { user, stats, folders, lists } = data;
  const recentWatched = data.recentWatched || [];
  const recentReviews = data.recentReviews || [];
  const favorites = (data.favorites || [])
    .map((entry) => entry.Media || entry.Medium || entry.media)
    .filter(Boolean);

  function formatRating(value) {
    if (value === null || value === undefined || value === "") {
      return "Sem nota";
    }

    return Number(value).toFixed(1).replace(".0", "");
  }

  function formatWatchedDate(value) {
    if (!value) {
      return "";
    }

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  }

  function formatWatchedSeason(entry) {
    const media = entry.Media || entry.Medium || entry.media;

    if (!media || media.type !== "SERIES") {
      return null;
    }

    return `Temporada ${entry.season_number ?? 0}`;
  }

  return (
    <main className="ui-page">
      <section className="max-w-6xl mx-auto">
        <div className="ui-card p-8 mb-6">
          <div className="flex flex-wrap items-center gap-6">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-28 h-28 rounded-full object-cover border border-zinc-800"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-4xl font-bold uppercase">
                {user.name?.[0]}
              </div>
            )}

            <div className="flex-1 min-w-[240px]">
              <h1 className="ui-title">{user.name}</h1>
              <p className="text-zinc-400 mt-1">@{user.username}</p>
              <p className="text-zinc-400 mt-4 max-w-2xl">
                {user.bio || "Esse usuário ainda não possui bio."}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 ui-card overflow-hidden divide-x divide-zinc-800 mb-10">
          {[
            { to: `/u/${user.username}`,        Icon: LayoutList,   count: stats.lists ?? 0,   label: "Listas" },
            { to: `/u/${user.username}/watched`, Icon: CheckCircle2, count: stats.watched ?? 0, label: "Assistidos" },
            { to: `/u/${user.username}/reviews`, Icon: Star,         count: stats.reviews ?? 0, label: "Reviews" },
          ].map(({ to, Icon, count, label }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center justify-center gap-2 h-11 hover:bg-zinc-800 transition group"
            >
              <Icon size={15} className="text-zinc-500 group-hover:text-red-400 transition shrink-0" />
              <span className="font-bold text-sm">{count}</span>
              <span className="text-zinc-400 text-sm">{label}</span>
            </Link>
          ))}
        </div>

        {favorites.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <h2 className="ui-section-title">Favoritos</h2>
              <div className="ui-divider" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {favorites.map((media) => (
                <Link
                  key={media.tmdb_id}
                  to={`/media/${media.tmdb_id}`}
                  state={{ media }}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 aspect-[2/3] shadow-lg shadow-black/30">
                    {media.poster_url ? (
                      <img
                        src={media.poster_url}
                        alt={media.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-sm text-center px-2">
                        Sem pôster
                      </div>
                    )}
                  </div>

                  <p className="mt-2 text-sm font-semibold line-clamp-1">
                    {media.title}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="ui-section-title">Assistidos recentemente</h2>
            <div className="ui-divider" />
          </div>

          {recentWatched.length === 0 ? (
            <div className="ui-empty">
              Ainda não há títulos assistidos para mostrar.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentWatched.map((entry) => {
                const media = entry.Media || entry.Medium || entry.media;
                const seasonLabel = formatWatchedSeason(entry);

                if (!media) {
                  return null;
                }

                return (
                  <Link
                    key={entry.id}
                    to={`/media/${media.tmdb_id}`}
                    state={{ media }}
                    className="flex gap-4 ui-card ui-card-hover p-4"
                  >
                    {media.poster_url ? (
                      <img
                        src={media.poster_url}
                        alt={media.title}
                        className="w-20 h-28 rounded-xl object-cover bg-zinc-800 shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-28 rounded-xl bg-zinc-800 flex items-center justify-center text-xs text-zinc-500 shrink-0 text-center px-2">
                        Sem pôster
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="font-semibold line-clamp-2">{media.title}</h3>

                      <p className="text-sm text-zinc-400 mt-1">
                        Nota: <span className="text-white font-semibold">{formatRating(entry.rating)}</span>
                      </p>

                      {seasonLabel ? (
                        <p className="text-xs text-zinc-500 mt-1">{seasonLabel}</p>
                      ) : null}

                      <p className="text-xs text-zinc-500 mt-2">
                        {formatWatchedDate(entry.updated_at)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="ui-section-title">Últimas reviews</h2>
            <div className="ui-divider" />
          </div>

          {recentReviews.length === 0 ? (
            <div className="ui-empty">
              Nenhuma review publicada ainda.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentReviews.map((review) => {
                const media = review.Media || review.Medium || review.media;

                if (!media) {
                  return null;
                }

                return (
                  <div
                    key={review.id}
                    className="ui-card ui-card-hover p-4"
                  >
                    <div className="flex gap-4">
                      {media.poster_url ? (
                        <Link to={`/media/${media.tmdb_id}`} state={{ media }} className="shrink-0">
                          <img
                            src={media.poster_url}
                            alt={media.title}
                            className="w-20 h-28 rounded-xl object-cover bg-zinc-800"
                          />
                        </Link>
                      ) : (
                        <Link to={`/media/${media.tmdb_id}`} state={{ media }} className="shrink-0">
                          <div className="w-20 h-28 rounded-xl bg-zinc-800 flex items-center justify-center text-xs text-zinc-500 shrink-0 text-center px-2">
                            Sem pôster
                          </div>
                        </Link>
                      )}

                      <div className="min-w-0">
                        <h3 className="font-semibold line-clamp-2"><Link to={`/reviews/${review.id}`} className="hover:underline">{review.title}</Link></h3>
                        <p className="text-sm text-zinc-400 mt-1 line-clamp-2"><Link to={`/media/${media.tmdb_id}`} state={{ media }} className="hover:underline text-zinc-400">{media.title}</Link></p>
                        <p className="text-sm text-zinc-400 mt-2">
                          Nota: <span className="text-white font-semibold">{formatRating(review.rating)}</span>
                        </p>
                        <p className="text-xs text-zinc-500 mt-2">
                          {formatWatchedDate(review.updated_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="ui-section-title">Listas públicas</h2>
            <div className="ui-divider" />
          </div>

          {lists.length === 0 ? (
            <div className="ui-empty">
              Nenhuma lista pública disponível.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {lists.map((list) => (
                <PublicListCard key={list.id} list={list} username={user.username} />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="ui-section-title">Pastas públicas</h2>
            <div className="ui-divider" />
          </div>

          {folders.length === 0 ? (
            <div className="ui-empty">
              Nenhuma pasta pública disponível.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {folders.map((folder) => (
                <Link
                  key={folder.id}
                  to={`/u/${user.username}/folders/${folder.id}`}
                  className="block ui-card ui-card-hover p-6"
                >
                  <h3 className="text-xl font-bold mb-2">{folder.title}</h3>
                  <p className="text-zinc-400 text-sm line-clamp-3 mb-4">
                    {folder.description || "Sem descrição"}
                  </p>
                  <div className="text-xs text-zinc-500">
                    {folder.MediaLists?.length || 0} lista(s)
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function PublicListCard({ list, username }) {
  const items = list.ListItems || [];
  const previewItems = items.slice(0, 3);
  const itemCountLabel = `${items.length} item${items.length === 1 ? "" : "s"}`;

  return (
    <Link
      to={`/u/${username}/lists/${list.id}`}
      className="block ui-card ui-card-hover p-6"
    >
      <h3 className="text-xl font-bold mb-2">{list.title}</h3>

      <p className="text-zinc-400 text-sm line-clamp-3 mb-5">
        {list.description || "Sem descrição"}
      </p>

      <div className="flex gap-2 h-36">
        {previewItems.length > 0 ? (
          previewItems.map((item) => {
            const media = item.Media || item.Medium || item.media;

            if (!media) {
              return null;
            }

            return media.poster_url ? (
              <img
                key={item.id}
                src={media.poster_url}
                alt={media.title}
                className="w-24 rounded-xl object-cover bg-zinc-800"
              />
            ) : (
              <div
                key={item.id}
                className="w-24 rounded-xl bg-zinc-800 flex items-center justify-center text-xs text-zinc-500 text-center px-2"
              >
                Sem pôster
              </div>
            );
          })
        ) : (
          <div className="w-full rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 text-sm">
            Lista vazia
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-5 text-xs text-zinc-500">
        <span>{itemCountLabel}</span>
        <span>{list.is_public ? "Pública" : "Privada"}</span>
      </div>
    </Link>
  );
}