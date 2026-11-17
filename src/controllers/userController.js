import MediaReview from "../models/MediaReview.js";
import Media from "../models/Media.js";
import UserMediaStatus from "../models/UserMediaStatus.js";
import { getFavorites, setFavorites } from "../services/userFavoriteService.js";

async function getRecentWatched(userId) {
  return UserMediaStatus.findAll({
    where: {
      user_id: userId,
      status: "COMPLETED",
    },
    include: [
      {
        model: Media,
        attributes: ["id", "tmdb_id", "title", "original_title", "type", "poster_url", "release_date"],
      },
    ],
    order: [["updated_at", "DESC"]],
    limit: 6,
  });
}

async function getRecentReviews(userId) {
  return MediaReview.findAll({
    where: {
      user_id: userId,
    },
    attributes: {
      include: [
        [
          MediaReview.sequelize.literal(
            '(SELECT rating FROM user_media_status WHERE user_id = "MediaReview"."user_id" AND media_id = "MediaReview"."media_id" AND season_number = "MediaReview"."season_number" LIMIT 1)'
          ),
          "rating",
        ],
      ],
    },
    include: [
      {
        model: Media,
        attributes: ["id", "tmdb_id", "title", "original_title", "type", "poster_url", "release_date"],
      },
    ],
    order: [["updated_at", "DESC"]],
    limit: 6,
  });
}

async function buildUserPayload(user) {
  const [completedCount, watchingCount, plannedCount, droppedCount, reviewsCount, recentWatched, recentReviews, favorites] = await Promise.all([
    UserMediaStatus.count({
      where: { user_id: user.id, status: "COMPLETED" },
    }),
    UserMediaStatus.count({
      where: { user_id: user.id, status: "WATCHING" },
    }),
    UserMediaStatus.count({
      where: { user_id: user.id, status: "PLANNED" },
    }),
    UserMediaStatus.count({
      where: { user_id: user.id, status: "DROPPED" },
    }),
    MediaReview.count({
      where: { user_id: user.id },
    }),
    getRecentWatched(user.id),
    getRecentReviews(user.id),
    getFavorites(user.id),
  ]);

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    avatar_url: user.avatar_url,
    bio: user.bio,
    is_private: user.is_private,
    created_at: user.created_at,
    stats: {
      completed: completedCount,
      watching: watchingCount,
      planned: plannedCount,
      dropped: droppedCount,
      reviews: reviewsCount,
    },
    recentWatched,
    recentReviews,
    favorites,
  };
}

export async function getMe(req, res) {
  return res.json(await buildUserPayload(req.user));
}

export async function updateMe(req, res) {
  const { name, bio, avatar_url } = req.body;
  const nextName = name ?? req.user.name;
  const nextBio = bio ?? req.user.bio;
  let nextAvatarUrl = avatar_url ?? req.user.avatar_url;

  if (req.file) {
    nextAvatarUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  }

  await req.user.update({
    name: nextName,
    bio: nextBio,
    avatar_url: nextAvatarUrl,
  });

  return res.json(await buildUserPayload(req.user));
}

export async function getMyFavorites(req, res) {
  try {
    const favorites = await getFavorites(req.user.id);
    return res.json(favorites);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function updateMyFavorites(req, res) {
  try {
    const favorites = await setFavorites(req.user.id, req.body.items);
    return res.json(favorites);
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
}

export async function getMyMediaByStatus(req, res) {
  const { status } = req.query;
  const validStatuses = ["COMPLETED", "WATCHING", "PLANNED", "DROPPED"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Status inválido" });
  }

  const entries = await UserMediaStatus.findAll({
    where: { user_id: req.user.id, status },
    include: [
      {
        model: Media,
        attributes: ["id", "tmdb_id", "title", "original_title", "type", "poster_url", "release_date"],
      },
    ],
    order: [["updated_at", "DESC"]],
  });

  return res.json(entries);
}

export async function getMyAllReviews(req, res) {
  const reviews = await MediaReview.findAll({
    where: { user_id: req.user.id },
    attributes: {
      include: [
        [
          MediaReview.sequelize.literal(
            '(SELECT rating FROM user_media_status WHERE user_id = "MediaReview"."user_id" AND media_id = "MediaReview"."media_id" AND season_number = "MediaReview"."season_number" LIMIT 1)'
          ),
          "rating",
        ],
      ],
    },
    include: [
      {
        model: Media,
        attributes: ["id", "tmdb_id", "title", "original_title", "type", "poster_url", "release_date"],
      },
    ],
    order: [["updated_at", "DESC"]],
  });

  return res.json(reviews);
}