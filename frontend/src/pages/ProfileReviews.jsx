import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";

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

export default function ProfileReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/users/me/reviews")
      .then((response) => setReviews(response.data))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

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
            <Star size={18} className="text-zinc-400" />
            <h1 className="ui-title">Minhas Reviews</h1>
          </div>
          {!loading && (
            <span className="text-zinc-500 text-sm ml-1">({reviews.length})</span>
          )}
        </div>

        {loading ? (
          <p className="text-zinc-400">Carregando...</p>
        ) : reviews.length === 0 ? (
          <div className="ui-empty">
            Você ainda não publicou nenhuma review.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => {
              const media = review.Media || review.Medium || review.media;
              if (!media) return null;

              return (
                <div
                  key={review.id}
                  className="ui-card ui-card-hover p-4"
                >
                  <div className="flex gap-4">
                    <Link
                      to={`/media/${media.tmdb_id}`}
                      state={{ media }}
                      className="shrink-0"
                    >
                      {media.poster_url ? (
                        <img
                          src={media.poster_url}
                          alt={media.title}
                          className="w-20 h-28 rounded-xl object-cover bg-zinc-800"
                        />
                      ) : (
                        <div className="w-20 h-28 rounded-xl bg-zinc-800 flex items-center justify-center text-xs text-zinc-500 text-center px-2">
                          Sem pôster
                        </div>
                      )}
                    </Link>

                    <div className="min-w-0">
                      <h3 className="font-semibold line-clamp-2">
                        <Link to={`/reviews/${review.id}`} className="hover:underline">
                          {review.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
                        <Link
                          to={`/media/${media.tmdb_id}`}
                          state={{ media }}
                          className="hover:underline text-zinc-400"
                        >
                          {media.title}
                        </Link>
                      </p>
                      <p className="text-sm text-zinc-400 mt-2">
                        Nota:{" "}
                        <span className="text-white font-semibold">
                          {formatRating(review.rating)}
                        </span>
                      </p>
                      <p className="text-xs text-zinc-500 mt-2">
                        {formatDate(review.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
