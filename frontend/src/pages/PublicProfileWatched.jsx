import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import api from "../services/api";

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

export default function PublicProfileWatched() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    api
      .get(`/public/users/${username}/watched`)
      .then((response) => setData(response.data))
      .catch(() => {
        setData(null);
        setError("Perfil privado ou não encontrado.");
      });
  }, [username]);

  if (error) {
    return (
      <main className="ui-page">
        <p className="text-zinc-400">{error}</p>
        <Link
          to={`/u/${username}`}
          className="ui-btn-primary mt-5"
        >
          Voltar ao perfil
        </Link>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="ui-page">
        <p className="text-zinc-400">Carregando...</p>
      </main>
    );
  }

  const { user, watched } = data;

  return (
    <main className="ui-page">
      <section className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <Link
            to={`/u/${username}`}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition text-sm"
          >
            <ArrowLeft size={15} />
            {user.name}
          </Link>
          <span className="text-zinc-700">/</span>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-zinc-400" />
            <h1 className="ui-title">Assistidos</h1>
          </div>
          <span className="text-zinc-500 text-sm ml-1">({watched.length})</span>
        </div>

        {watched.length === 0 ? (
          <div className="ui-empty">
            Nenhum título assistido ainda.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {watched.map((entry) => {
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
                    <p className="text-sm text-zinc-400 mt-1.5">
                      Nota:{" "}
                      <span className="text-white font-semibold">
                        {formatRating(entry.rating)}
                      </span>
                    </p>
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
