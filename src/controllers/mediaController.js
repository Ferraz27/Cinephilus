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

export async function searchMedia(req, res) {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        error: "Query is required",
      });
    }

    const movies = await searchMovies(query);

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
    const media = await getPopularMedia();

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
              : 1
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