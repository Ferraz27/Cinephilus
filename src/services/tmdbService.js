const BASE_URL = "https://api.themoviedb.org/3";

export async function searchMovies(query) {
  const response = await fetch(
    `${BASE_URL}/search/movie?query=${encodeURIComponent(query)}&language=pt-BR`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  return data.results.map((movie) => ({
  tmdb_id: movie.id,
  title: movie.title,
  original_title: movie.original_title,
  synopsis: movie.overview,
  poster_url: movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null,
  release_date: movie.release_date,
  type: "MOVIE",
	}));
}