const BASE_URL = "https://api.themoviedb.org/3";
const TMDB_PAGE_SIZE = 20;

function filterMediaResults(results, mediaType = "ALL") {
  const filteredByType = results.filter((media) => {
    if (media.media_type !== "movie" && media.media_type !== "tv") {
      return false;
    }

    if (mediaType === "MOVIE") {
      return media.media_type === "movie";
    }

    if (mediaType === "SERIES") {
      return media.media_type === "tv";
    }

    return true;
  });

  return filteredByType.filter((media) => {
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

export async function searchMovies(query, page = 1, perPage = 24, mediaType = "ALL") {
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;

  let currentPage = 1;
  let totalPagesRaw = null;
  let filteredCount = 0;
  const pageItems = [];

  while (
    (totalPagesRaw === null || currentPage <= totalPagesRaw) &&
    pageItems.length < perPage
  ) {
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

    if (totalPagesRaw === null) {
      totalPagesRaw = data.total_pages || 1;
    }

    const filteredResults = filterMediaResults(data.results || [], mediaType);

    for (const media of filteredResults) {
      if (filteredCount >= startIndex && filteredCount < endIndex) {
        pageItems.push(media);
      }

      filteredCount += 1;
    }

    if (filteredCount >= endIndex && pageItems.length >= perPage) {
      break;
    }

    currentPage += 1;
  }

  const mappedResults = await mapMediaResults(pageItems);

  return {
    results: mappedResults,
    page,
    totalPages: totalPagesRaw || 1,
  };
}

export async function getPopularMedia(page = 1, perPage = 24, mediaType = "ALL") {
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;

  let currentPage = 1;
  let totalPagesRaw = null;
  let filteredCount = 0;
  const pageItems = [];

  while (
    (totalPagesRaw === null || currentPage <= totalPagesRaw) &&
    pageItems.length < perPage
  ) {
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

    if (totalPagesRaw === null) {
      totalPagesRaw = data.total_pages || 1;
    }

    const filteredResults = filterMediaResults(data.results || [], mediaType);

    for (const media of filteredResults) {
      if (filteredCount >= startIndex && filteredCount < endIndex) {
        pageItems.push(media);
      }

      filteredCount += 1;
    }

    if (filteredCount >= endIndex && pageItems.length >= perPage) {
      break;
    }

    currentPage += 1;
  }

  const mappedResults = await mapMediaResults(pageItems);

  return {
    results: mappedResults,
    page,
    totalPages: totalPagesRaw || 1,
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

async function getWatchProviders(tmdbId, endpoint) {
  try {
    const response = await fetch(
      `${BASE_URL}/${endpoint}/${tmdbId}/watch/providers`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    const region = data.results?.BR || data.results?.US || null;

    if (!region) {
      return { providers: [], link: null };
    }

    const providers = region.flatrate || region.ads || region.free || [];

    return {
      link: region.link || null,
      providers: [...providers]
        .sort((a, b) => a.display_priority - b.display_priority)
        .map((provider) => ({
          provider_id: provider.provider_id,
          provider_name: provider.provider_name,
          logo_url: `https://image.tmdb.org/t/p/w92${provider.logo_path}`,
        })),
    };
  } catch (error) {
    console.error("Erro ao buscar provedores de streaming:", error);
    return { providers: [], link: null };
  }
}

export async function getMediaDetails({ tmdbId, type }) {
  const endpoint = type === "MOVIE" ? "movie" : "tv";

  const [response, watchProviders] = await Promise.all([
    fetch(`${BASE_URL}/${endpoint}/${tmdbId}?language=pt-BR`, {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    }),
    getWatchProviders(tmdbId, endpoint),
  ]);

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
    providers: watchProviders.providers,
    providersLink: watchProviders.link,
  };
}