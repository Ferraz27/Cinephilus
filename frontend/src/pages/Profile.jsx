import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, LayoutList, CheckCircle2, Star, Play, Bookmark, XCircle } from "lucide-react";

import api from "../services/api";

const MAX_FAVORITES = 5;

function mapFavoriteMedia(entry) {
  return entry.Media || entry.Medium || entry.media || null;
}

export default function Profile() {
  const [user, setUser] = useState(null);
  const [lists, setLists] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [formValues, setFormValues] = useState({
    name: "",
    bio: "",
  });
  const [favoritesDraft, setFavoritesDraft] = useState([]);
  const [favoriteQuery, setFavoriteQuery] = useState("");
  const [favoriteResults, setFavoriteResults] = useState([]);
  const [favoriteSearching, setFavoriteSearching] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

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

  async function loadProfile() {
    const token = localStorage.getItem("token");

    const [userResponse, listsResponse] = await Promise.all([
      api.get("/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),

      api.get("/lists", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    ]);

    setUser(userResponse.data);
    setLists(listsResponse.data);
    setFormValues({
      name: userResponse.data?.name || "",
      bio: userResponse.data?.bio || "",
    });
    setAvatarPreview(userResponse.data?.avatar_url || "");
    setAvatarFile(null);
    setFavoritesDraft(
      (userResponse.data?.favorites || []).map(mapFavoriteMedia).filter(Boolean),
    );
  }

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  useEffect(() => {
    if (!favoriteQuery.trim()) {
      setFavoriteResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setFavoriteSearching(true);

      try {
        const response = await api.get(
          `/media/search?query=${encodeURIComponent(favoriteQuery)}`,
        );

        setFavoriteResults(response.data?.results || []);
      } catch (error) {
        console.error("Erro ao buscar mídia:", error);
        setFavoriteResults([]);
      } finally {
        setFavoriteSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [favoriteQuery]);

  function addFavorite(media) {
    setFavoritesDraft((current) => {
      if (
        current.length >= MAX_FAVORITES ||
        current.some((item) => item.tmdb_id === media.tmdb_id)
      ) {
        return current;
      }

      return [...current, media];
    });
    setFavoriteQuery("");
    setFavoriteResults([]);
  }

  function removeFavorite(tmdbId) {
    setFavoritesDraft((current) =>
      current.filter((item) => item.tmdb_id !== tmdbId),
    );
  }

  if (!user) {
    return (
      <main className="ui-page">
        <p className="text-zinc-400">Carregando perfil...</p>
      </main>
    );
  }

  const recentWatched = user.recentWatched || [];
  const recentReviews = user.recentReviews || [];
  const favorites = (user.favorites || []).map(mapFavoriteMedia).filter(Boolean);

  return (
    <main className="ui-page">
      <section className="max-w-6xl mx-auto">
        <div className="ui-card p-8">
          <div className="flex items-center gap-6">
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

            <div>
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="ui-title">
                  {user.name}
                </h1>

                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="ui-btn-secondary px-4 py-2"
                >
                  Editar perfil
                </button>

                <Link
                  to={`/u/${user.username}`}
                  className="ui-btn-secondary px-4 py-2"
                >
                  Ver perfil público
                </Link>
              </div>

              <p className="text-zinc-400 mt-1">
                @{user.username}
              </p>

              <p className="text-zinc-400 mt-4 max-w-2xl">
                {user.bio || "Esse usuário ainda não possui bio."}
              </p>

            </div>
          </div>
        </div>

        <div className="grid grid-cols-6 ui-card overflow-hidden divide-x divide-zinc-800 mt-4 mb-10">
          {[
            { to: "/lists",            Icon: LayoutList,   count: lists.length,               label: "Listas" },
            { to: "/profile/watched",  Icon: CheckCircle2, count: user.stats?.completed ?? 0,  label: "Assistidos" },
            { to: "/profile/reviews",  Icon: Star,         count: user.stats?.reviews ?? 0,    label: "Reviews" },
            { to: "/profile/watching", Icon: Play,         count: user.stats?.watching ?? 0,   label: "Assistindo" },
            { to: "/profile/planned",  Icon: Bookmark,     count: user.stats?.planned ?? 0,    label: "Quero Ver" },
            { to: "/profile/dropped",  Icon: XCircle,      count: user.stats?.dropped ?? 0,    label: "Abandonados" },
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

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="ui-section-title">Favoritos</h2>
            <div className="ui-divider" />
          </div>

          {favorites.length === 0 ? (
            <div className="ui-empty">
              Você ainda não escolheu seus favoritos. Edite seu perfil para adicionar até 5 títulos.
            </div>
          ) : (
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
          )}
        </section>

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="ui-section-title">Assistidos recentemente</h2>
            <div className="ui-divider" />
          </div>

          {recentWatched.length === 0 ? (
            <div className="ui-empty">
              Você ainda não marcou títulos como assistidos.
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

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="ui-section-title">Últimas reviews</h2>
            <div className="ui-divider" />
          </div>

          {recentReviews.length === 0 ? (
            <div className="ui-empty">
              Você ainda não publicou reviews.
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
                          <div className="w-20 h-28 rounded-xl bg-zinc-800 flex items-center justify-center text-xs text-zinc-500 text-center px-2">
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

        {isEditing && (
          <div className="ui-card p-8 mb-10">
            <h2 className="ui-section-title mb-6">Editar perfil</h2>

            <form
              onSubmit={async (event) => {
                event.preventDefault();
                const token = localStorage.getItem("token");

                const payload = new FormData();
                payload.append("name", formValues.name);
                payload.append("bio", formValues.bio);
                if (avatarFile) {
                  payload.append("avatar", avatarFile);
                }

                setSavingProfile(true);

                try {
                  const [profileResponse, favoritesResponse] = await Promise.all([
                    api.put("/users/me", payload, {
                      headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                      },
                    }),
                    api.put(
                      "/users/me/favorites",
                      {
                        items: favoritesDraft.map((media) => ({
                          tmdb_id: media.tmdb_id,
                          title: media.title,
                          original_title: media.original_title,
                          type: media.type,
                          synopsis: media.synopsis,
                          poster_url: media.poster_url,
                          release_date: media.release_date,
                        })),
                      },
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      },
                    ),
                  ]);

                  setUser({
                    ...profileResponse.data,
                    favorites: favoritesResponse.data,
                  });
                  setFormValues({
                    name: profileResponse.data?.name || "",
                    bio: profileResponse.data?.bio || "",
                  });
                  setAvatarPreview(profileResponse.data?.avatar_url || "");
                  setAvatarFile(null);
                  setFavoritesDraft(
                    (favoritesResponse.data || []).map(mapFavoriteMedia).filter(Boolean),
                  );
                  setIsEditing(false);
                } finally {
                  setSavingProfile(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm text-zinc-300">Nome</label>
                <input
                  value={formValues.name}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="ui-input"
                  placeholder="Seu nome"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300">Foto (upload)</label>
                <div className="flex items-center gap-4">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Preview do avatar"
                      className="w-16 h-16 rounded-full object-cover border border-zinc-800"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400">
                      Sem foto
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      setAvatarFile(file);
                      if (file) {
                        setAvatarPreview(URL.createObjectURL(file));
                      } else {
                        setAvatarPreview(user.avatar_url || "");
                      }
                    }}
                    className="ui-input"
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  JPG, PNG ou WEBP ate 2MB.
                </p>
              </div>

              <div>
                <label className="text-sm text-zinc-300">Bio</label>
                <textarea
                  value={formValues.bio}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      bio: event.target.value,
                    }))
                  }
                  className="ui-input min-h-[120px] resize-y"
                  placeholder="Conte um pouco sobre voce"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300">
                  Favoritos (até {MAX_FAVORITES} filmes/séries)
                </label>

                <div className="grid grid-cols-5 gap-3 mt-2">
                  {Array.from({ length: MAX_FAVORITES }, (_, index) => {
                    const favorite = favoritesDraft[index];

                    return (
                      <div
                        key={index}
                        className="relative aspect-[2/3] rounded-xl border border-zinc-700 bg-zinc-800 overflow-hidden flex items-center justify-center"
                      >
                        {favorite ? (
                          <>
                            {favorite.poster_url ? (
                              <img
                                src={favorite.poster_url}
                                alt={favorite.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs text-zinc-400 text-center px-1 line-clamp-3">
                                {favorite.title}
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => removeFavorite(favorite.tmdb_id)}
                              className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 rounded-full p-1 transition"
                              aria-label="Remover favorito"
                            >
                              <X size={12} />
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] uppercase tracking-wide text-zinc-500">
                            Vazio
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="relative mt-3">
                  <input
                    value={favoriteQuery}
                    onChange={(event) => setFavoriteQuery(event.target.value)}
                    placeholder={
                      favoritesDraft.length >= MAX_FAVORITES
                        ? "Limite de favoritos atingido"
                        : "Buscar filme ou série para adicionar..."
                    }
                    disabled={favoritesDraft.length >= MAX_FAVORITES}
                    className="ui-input disabled:opacity-50"
                  />

                  {favoriteQuery.trim() && favoritesDraft.length < MAX_FAVORITES && (
                    <div className="absolute z-10 mt-2 w-full max-h-72 overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl">
                      {favoriteSearching ? (
                        <p className="px-4 py-3 text-sm text-zinc-500">Buscando...</p>
                      ) : favoriteResults.filter(
                          (media) =>
                            !favoritesDraft.some((item) => item.tmdb_id === media.tmdb_id),
                        ).length === 0 ? (
                        <p className="px-4 py-3 text-sm text-zinc-500">Nenhum resultado.</p>
                      ) : (
                        favoriteResults
                          .filter(
                            (media) =>
                              !favoritesDraft.some((item) => item.tmdb_id === media.tmdb_id),
                          )
                          .map((media) => (
                            <button
                              key={media.tmdb_id}
                              type="button"
                              onClick={() => addFavorite(media)}
                              className="flex items-center gap-3 w-full text-left px-3 py-2 hover:bg-zinc-800 transition"
                            >
                              {media.poster_url ? (
                                <img
                                  src={media.poster_url}
                                  alt={media.title}
                                  className="w-8 h-12 object-cover rounded shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-12 bg-zinc-700 rounded shrink-0" />
                              )}

                              <span className="min-w-0">
                                <span className="block text-sm font-medium line-clamp-1">
                                  {media.title}
                                </span>
                                <span className="block text-xs text-zinc-500">
                                  {media.type === "MOVIE" ? "Filme" : "Série"} ·{" "}
                                  {media.release_date?.slice(0, 4) || "—"}
                                </span>
                              </span>
                            </button>
                          ))
                      )}
                    </div>
                  )}
                </div>

                <p className="text-xs text-zinc-500 mt-2">
                  {favoritesDraft.length}/{MAX_FAVORITES} selecionados
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="ui-btn-primary px-5 py-2"
                >
                  {savingProfile ? "Salvando..." : "Salvar"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFormValues({
                      name: user.name || "",
                      bio: user.bio || "",
                    });
                    setAvatarPreview(user.avatar_url || "");
                    setAvatarFile(null);
                    setFavoritesDraft(
                      (user.favorites || []).map(mapFavoriteMedia).filter(Boolean),
                    );
                    setFavoriteQuery("");
                    setFavoriteResults([]);
                    setIsEditing(false);
                  }}
                  disabled={savingProfile}
                  className="ui-btn-secondary px-4 py-2"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mb-6">
          <h2 className="ui-section-title">
            Listas recentes
          </h2>
        </div>

        {lists.length === 0 ? (
          <div className="ui-empty">
            <p className="text-zinc-400">Você ainda não criou nenhuma lista.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <UserListCard key={list.id} list={list} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function UserListCard({ list }) {
  const items = list.ListItems || [];
  const previewItems = items.slice(0, 3);
  const itemCountLabel = `${items.length} item${items.length === 1 ? "" : "s"}`;

  return (
    <Link
      to={`/lists/${list.id}`}
      className="block ui-card ui-card-hover p-6"
    >
      <h3 className="text-xl font-bold mb-2">{list.title}</h3>

      <p className="text-zinc-400 text-sm line-clamp-3 mb-5">{list.description || "Sem descrição"}</p>

      <div className="flex gap-2 h-36">
        {previewItems.length > 0 ? (
          previewItems.map((item) => {
            const media = item.Media || item.Medium || item.media;

            if (!media) {
              return null;
            }

            return media.poster_url ? (
              <img key={item.id} src={media.poster_url} alt={media.title} className="w-24 rounded-xl object-cover bg-zinc-800" />
            ) : (
              <div key={item.id} className="w-24 rounded-xl bg-zinc-800 flex items-center justify-center text-xs text-zinc-500 text-center px-2">Sem pôster</div>
            );
          })
        ) : (
          <div className="w-full rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 text-sm">Lista vazia</div>
        )}
      </div>

      <div className="flex items-center justify-between mt-5 text-xs text-zinc-500">
        <span>{itemCountLabel}</span>
        <span>{list.is_public ? "Pública" : "Privada"}</span>
      </div>
    </Link>
  );
}