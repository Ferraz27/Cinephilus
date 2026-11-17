import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Play, Bookmark, XCircle } from "lucide-react";

import api from "../services/api";

const STATUS_MAP = {
  "/profile/watched":  { status: "COMPLETED", label: "Assistidos",  Icon: CheckCircle2 },
  "/profile/watching": { status: "WATCHING",  label: "Assistindo",  Icon: Play },
  "/profile/planned":  { status: "PLANNED",   label: "Quero Ver",   Icon: Bookmark },
  "/profile/dropped":  { status: "DROPPED",   label: "Abandonados", Icon: XCircle },
};

function formatRating(value) {
  if (value === null || value === undefined || value === "") return "Sem nota";
  return Number(value).toFixed(1).replace(".0", "");
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function ProfileMediaList() {
  const location = useLocation();
  const config = STATUS_MAP[location.pathname];
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!config) return;
    setLoading(true);
    api
      .get(`/users/me/media?status=${config.status}`)
      .then((response) => setEntries(response.data))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [location.pathname]);

  if (!config) {
    return (
      <main className="ui-page">
        <p className="text-zinc-400">Página não encontrada.</p>
      </main>
    );
  }

  const { label, Icon } = config;

  return (
    <main className="ui-page">
      <section className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <Link
            to="/profile"
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition text-sm"
          >
            <ArrowLeft size={15} />
            Meu perfil
          </Link>
          <span className="text-zinc-700">/</span>
          <div className="flex items-center gap-2">
            <Icon size={18} className="text-zinc-400" />
            <h1 className="ui-title">{label}</h1>
          </div>
          {!loading && (
            <span className="text-zinc-500 text-sm ml-1">({entries.length})</span>
          )}
        </div>

        {loading ? (
          <p className="text-zinc-400">Carregando...</p>
        ) : entries.length === 0 ? (
          <div className="ui-empty">
            Nenhum título aqui ainda.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry) => {
              const media = entry.Media || entry.Medium || entry.media;
              if (!media) return null;
              const seasonLabel =
                media.type === "SERIES" && entry.season_number > 0
                  ? `Temporada ${entry.season_number}`
                  : null;

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
                    <p className="text-xs text-zinc-500 mt-1">
                      {media.type === "MOVIE" ? "Filme" : "Série"}
                    </p>
                    {seasonLabel && (
                      <p className="text-xs text-zinc-500 mt-0.5">{seasonLabel}</p>
                    )}
                    {config.status === "COMPLETED" && (
                      <p className="text-sm text-zinc-400 mt-1.5">
                        Nota:{" "}
                        <span className="text-white font-semibold">
                          {formatRating(entry.rating)}
                        </span>
                      </p>
                    )}
                    <p className="text-xs text-zinc-500 mt-2">{formatDate(entry.updated_at)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
