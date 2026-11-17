import {
  searchMovies,
  getPopularMedia,
  getMediaVideos,
  getMediaDetails,
} from "../services/tmdbService.js";

import {
  setMediaStatus,
} from "../services/mediaStatusService.js";

import Media from "../models/Media.js";
import UserMediaStatus from "../models/UserMediaStatus.js";
import sequelize from "../config/database.js";
import { Op } from "sequelize";

export async function searchMedia(req, res) {
  try {
    const { query, type } = req.query;
    const page = Number(req.query.page) || 1;
    const perPage = 24;

    if (!query) {
      return res.status(400).json({
        error: "Query is required",
      });
    }

    const mediaType = type === "MOVIE" || type === "SERIES" ? type : "ALL";
    const movies = await searchMovies(query, page, perPage, mediaType);

    res.json(movies);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function popularMedia(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const perPage = 24;
    const mediaType =
      req.query.type === "MOVIE" || req.query.type === "SERIES"
        ? req.query.type
        : "ALL";
    const media = await getPopularMedia(page, perPage, mediaType);

    res.json(media);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function mediaVideos(req, res) {
  try {
    const { tmdbId } = req.params;
    const { type } = req.query;

    if (!type) {
      return res.status(400).json({
        error: "type is required",
      });
    }

    const trailer = await getMediaVideos({
      tmdbId,
      type,
    });

    return res.json(trailer);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function updateMediaStatus(req, res) {
  try {
    const userId = req.user.id;

    const result = await setMediaStatus({
      userId,
      ...req.body,
    });

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      error: error.message,
    });
  }
}

export async function getMediaStatus(req, res) {
  try {
    const { tmdbId } = req.params;
    const { season } = req.query;
    const userId = req.user.id;

    const media = await Media.findOne({
      where: {
        tmdb_id: tmdbId,
      },
    });

    if (!media) {
      return res.json(null);
    }

    const userMediaStatus = await UserMediaStatus.findOne({
      where: {
        user_id: userId,
        media_id: media.id,
        season_number:
          media.type === "SERIES"
            ? season
              ? Number(season)
              : 0
            : 0,
      },
    });

    return res.json(userMediaStatus);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function getMediaStatusBatch(req, res) {
  try {
    const userId = req.user.id;
    const { tmdbIds } = req.body;

    if (!Array.isArray(tmdbIds)) {
      return res.status(400).json({
        error: "tmdbIds must be an array",
      });
    }

    const uniqueIds = [...new Set(tmdbIds.map((id) => String(id)))];

    if (uniqueIds.length === 0) {
      return res.json({});
    }

    const medias = await Media.findAll({
      where: {
        tmdb_id: uniqueIds,
      },
    });

    if (medias.length === 0) {
      return res.json({});
    }

    const mediaIds = medias.map((media) => media.id);
    const statuses = await UserMediaStatus.findAll({
      where: {
        user_id: userId,
        media_id: mediaIds,
        season_number: {
          [Op.in]: [0, 1],
        },
      },
    });

    const statusByMediaSeason = new Map(
      statuses.map((status) => [
        `${status.media_id}:${status.season_number}`,
        status.status,
      ]),
    );

    const result = {};
    medias.forEach((media) => {
      const seasonNumber = media.type === "SERIES" ? 0 : 0;
      const key = `${media.id}:${seasonNumber}`;
      const status = statusByMediaSeason.get(key);

      if (status) {
        result[media.tmdb_id] = status;
      }
    });

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function mediaDetails(req, res) {
  try {
    const { tmdbId } = req.params;
    const { type } = req.query;

    if (!type) {
      return res.status(400).json({
        error: "type is required",
      });
    }

    const details = await getMediaDetails({
      tmdbId,
      type,
    });

    return res.json(details);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function getRatingsSummary(req, res) {
  try {
    const { tmdbId } = req.params;
    const { season } = req.query;

    const media = await Media.findOne({
      where: {
        tmdb_id: tmdbId,
      },
    });

    const distribution = {};
    for (let value = 0.5; value <= 5; value += 0.5) {
      distribution[value.toFixed(1)] = 0;
    }

    if (!media) {
      return res.json({
        average: 0,
        total: 0,
        distribution,
      });
    }

    const seasonNumber =
      media.type === "SERIES"
        ? Number.isFinite(Number(season))
          ? Number(season)
          : 1
        : 0;

    const rows = await UserMediaStatus.findAll({
      where: {
        media_id: media.id,
        season_number: seasonNumber,
        rating: {
          [Op.ne]: null,
        },
      },
      attributes: [
        "rating",
        [sequelize.fn("COUNT", sequelize.col("rating")), "count"],
      ],
      group: ["rating"],
      raw: true,
    });

    rows.forEach((row) => {
      const key = Number(row.rating).toFixed(1);
      if (Object.prototype.hasOwnProperty.call(distribution, key)) {
        distribution[key] = Number(row.count);
      }
    });

    const total = Object.values(distribution).reduce(
      (sum, count) => sum + count,
      0
    );
    const sum = Object.entries(distribution).reduce(
      (acc, [rating, count]) => acc + Number(rating) * count,
      0
    );
    const average = total > 0 ? Number((sum / total).toFixed(2)) : 0;

    return res.json({
      average,
      total,
      distribution,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}