const BASE_URL = "https://api.themoviedb.org/3";
const TMDB_PAGE_SIZE = 20;

function filterMediaResults(results) {
  return results
    .filter((media) => media.media_type === "movie" || media.media_type === "tv")
    .filter((media) => {
      const hasAnimationGenre = (media.genre_ids || []).includes(16);
      const isJapanese = media.original_language === "ja";

      if (hasAnimationGenre && isJapanese) {
        return false;
      }

      return true;
    });
}

async function mapMediaResults(results) {
  return Promise.all(
    results.map(async (media) => {
      const isMovie = media.media_type === "movie";
      const fallbackPoster = media.poster_path
        ? `https://image.tmdb.org/t/p/w500${media.poster_path}`
        : null;
      const seasonPoster = isMovie
        ? null
        : await getSeriesSeasonPoster(media.id, 1);

      return {
        tmdb_id: media.id,
        title: media.title || media.name,
        original_title: media.original_title || media.original_name,
        synopsis: media.overview,
        poster_url: seasonPoster || fallbackPoster,
        release_date: media.release_date || media.first_air_date || null,
        type: isMovie ? "MOVIE" : "SERIES",
      };
    })
  );
}

async function getSeriesSeasonPoster(tmdbId, seasonNumber = 1) {
  try {
    const response = await fetch(
      `${BASE_URL}/tv/${tmdbId}?language=pt-BR`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    const season = (data.seasons || []).find(
      (item) => item.season_number === seasonNumber
    );

    if (season?.poster_path) {
      return `https://image.tmdb.org/t/p/w500${season.poster_path}`;
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar poster da temporada:", error);
    return null;
  }
}

export async function searchMovies(query, page = 1, perPage = 24) {
  const offset = ((page - 1) * perPage) % TMDB_PAGE_SIZE;
  const targetCount = offset + perPage;
  const initialPage =
    Math.floor(((page - 1) * perPage) / TMDB_PAGE_SIZE) + 1;

  let aggregated = [];
  let currentPage = initialPage;
  let totalResults = null;
  let totalPagesRaw = null;

  while (aggregated.length < targetCount) {
    const response = await fetch(
      `${BASE_URL}/search/multi?query=${encodeURIComponent(
        query
      )}&language=pt-BR&page=${currentPage}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (totalResults === null) {
      totalResults = data.total_results || 0;
      totalPagesRaw = data.total_pages || 1;
    }

    const filteredResults = filterMediaResults(data.results || []);
    const mappedResults = await mapMediaResults(filteredResults);

    aggregated = aggregated.concat(mappedResults);

    if (currentPage >= totalPagesRaw || mappedResults.length === 0) {
      break;
    }

    currentPage += 1;
  }

  return {
    results: aggregated.slice(offset, offset + perPage),
    page,
    totalPages: Math.max(1, Math.ceil(totalResults / perPage)),
  };
}

export async function getPopularMedia(page = 1, perPage = 24) {
  const offset = ((page - 1) * perPage) % TMDB_PAGE_SIZE;
  const targetCount = offset + perPage;
  const initialPage =
    Math.floor(((page - 1) * perPage) / TMDB_PAGE_SIZE) + 1;

  let aggregated = [];
  let currentPage = initialPage;
  let totalResults = null;
  let totalPagesRaw = null;

  while (aggregated.length < targetCount) {
    const response = await fetch(
      `${BASE_URL}/trending/all/day?language=pt-BR&page=${currentPage}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (totalResults === null) {
      totalResults = data.total_results || 0;
      totalPagesRaw = data.total_pages || 1;
    }

    const filteredResults = filterMediaResults(data.results || []);
    const mappedResults = await mapMediaResults(filteredResults);

    aggregated = aggregated.concat(mappedResults);

    if (currentPage >= totalPagesRaw || mappedResults.length === 0) {
      break;
    }

    currentPage += 1;
  }

  return {
    results: aggregated.slice(offset, offset + perPage),
    page,
    totalPages: Math.max(1, Math.ceil(totalResults / perPage)),
  };
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

export async function getMediaDetails({ tmdbId, type }) {
  const endpoint = type === "MOVIE" ? "movie" : "tv";

  const response = await fetch(
    `${BASE_URL}/${endpoint}/${tmdbId}?language=pt-BR`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  return {
    seasonsCount: type === "SERIES" ? data.number_of_seasons || 0 : 0,
    seasons: type === "SERIES"
      ? (data.seasons || []).map((season) => ({
        season_number: season.season_number,
        synopsis: season.overview || null,
        poster_url: season.poster_path
          ? `https://image.tmdb.org/t/p/w500${season.poster_path}`
          : null,
      }))
      : [],
  };
}