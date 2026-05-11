const BASE_URL = "https://api.themoviedb.org/3";

export async function searchMovies(query) {
  const response = await fetch(
    `${BASE_URL}/search/multi?query=${encodeURIComponent(query)}&language=pt-BR`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  return data.results
    .filter((media) => media.media_type === "movie" || media.media_type === "tv")
    .map((media) => ({
      tmdb_id: media.id,
      title: media.title || media.name,
      original_title: media.original_title || media.original_name,
      synopsis: media.overview,
      poster_url: media.poster_path
        ? `https://image.tmdb.org/t/p/w500${media.poster_path}`
        : null,
      release_date: media.release_date || media.first_air_date || null,
      type: media.media_type === "movie" ? "MOVIE" : "SERIES",
    }));
}

export async function getPopularMedia() {
  const response = await fetch(
    `${BASE_URL}/trending/all/day?language=pt-BR`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  return data.results
    .filter((media) => media.media_type === "movie" || media.media_type === "tv")
    .map((media) => ({
      tmdb_id: media.id,
      title: media.title || media.name,
      original_title: media.original_title || media.original_name,
      synopsis: media.overview,
      poster_url: media.poster_path
        ? `https://image.tmdb.org/t/p/w500${media.poster_path}`
        : null,
      release_date: media.release_date || media.first_air_date || null,
      type: media.media_type === "movie" ? "MOVIE" : "SERIES",
    }));
}

export async function getMediaVideos({ tmdbId, type }) {
  const endpoint = type === "MOVIE" ? "movie" : "tv";

  const response = await fetch(
    `${BASE_URL}/${endpoint}/${tmdbId}/videos?language=pt-BR`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  return (data.results || [])
    .filter((video) => video.site === "YouTube")
    .filter(
      (video) =>
        video.type === "Trailer" ||
        video.type === "Teaser" ||
        video.type === "Clip" ||
        video.type === "Featurette"
    );
}