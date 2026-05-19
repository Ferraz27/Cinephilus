import Media from "../models/Media.js";
import MediaReview from "../models/MediaReview.js";
import MediaReviewVote from "../models/MediaReviewVote.js";
import User from "../models/User.js";
import sequelize from "../config/database.js";

export async function createOrUpdateReview({
  userId,
  tmdb_id,
  title,
  original_title,
  type,
  synopsis,
  poster_url,
  release_date,
  review_title,
  content,
  season_number,
}) {
  if (!review_title || !review_title.trim()) {
    throw new Error("Titulo da review e obrigatorio");
  }

  if (review_title.length > 120) {
    throw new Error("Titulo da review deve ter no maximo 120 caracteres");
  }

  if (!content || !content.trim()) {
    throw new Error("Review nao pode estar vazia");
  }

  if (content.length > 2000) {
    throw new Error("Review deve ter no maximo 2000 caracteres");
  }

  const season = Number.isInteger(Number(season_number))
    ? Number(season_number)
    : 0;

  if (season < 0) {
    throw new Error("Temporada invalida");
  }

  const [media] = await Media.findOrCreate({
    where: { tmdb_id },
    defaults: {
      tmdb_id,
      title,
      original_title,
      type,
      synopsis,
      poster_url,
      release_date,
    },
  });

  const [review, created] = await MediaReview.findOrCreate({
    where: {
      user_id: userId,
      media_id: media.id,
      season_number: season,
    },
    defaults: {
      user_id: userId,
      media_id: media.id,
      season_number: season,
      title: review_title.trim(),
      content: content.trim(),
    },
  });

  if (!created) {
    await review.update({
      title: review_title.trim(),
      content: content.trim(),
    });
  }

  const reviewWithUser = await MediaReview.findByPk(review.id, {
    include: [
      {
        model: User,
        attributes: ["id", "username", "name", "avatar_url"],
      },
    ],
  });

  return reviewWithUser;
}

export async function listReviews({ tmdb_id, season_number, userId }) {
  const media = await Media.findOne({
    where: { tmdb_id },
  });

  if (!media) {
    return [];
  }

  const season = Number.isInteger(Number(season_number))
    ? Number(season_number)
    : 0;

  return MediaReview.findAll({
    where: {
      media_id: media.id,
      season_number: season,
    },
    attributes: {
      include: [
        [
          sequelize.literal(
            '(SELECT COUNT(*) FROM media_review_votes WHERE review_id = "MediaReview"."id" AND value = 1)'
          ),
          "likes",
        ],
        [
          sequelize.literal(
            '(SELECT COUNT(*) FROM media_review_votes WHERE review_id = "MediaReview"."id" AND value = -1)'
          ),
          "dislikes",
        ],
        [
          sequelize.literal(
            userId
              ? `(SELECT value FROM media_review_votes WHERE review_id = "MediaReview"."id" AND user_id = ${Number(userId)} LIMIT 1)`
              : "NULL"
          ),
          "user_vote",
        ],
        [
          sequelize.literal(
            '(SELECT rating FROM user_media_status WHERE user_id = "MediaReview"."user_id" AND media_id = "MediaReview"."media_id" AND season_number = "MediaReview"."season_number" LIMIT 1)'
          ),
          "rating",
        ],
      ],
    },
    include: [
      {
        model: User,
        attributes: ["id", "username", "name", "avatar_url"],
      },
    ],
    order: [["created_at", "DESC"]],
  });
}

export async function setReviewVote({ userId, reviewId, value }) {
  if (![1, -1].includes(value)) {
    throw new Error("Voto invalido");
  }

  const review = await MediaReview.findByPk(reviewId);

  if (!review) {
    throw new Error("Review nao encontrada");
  }

  const existingVote = await MediaReviewVote.findOne({
    where: {
      user_id: userId,
      review_id: reviewId,
    },
  });

  if (existingVote && existingVote.value === value) {
    await existingVote.destroy();
  } else if (existingVote) {
    await existingVote.update({ value });
  } else {
    await MediaReviewVote.create({
      user_id: userId,
      review_id: reviewId,
      value,
    });
  }

  const likes = await MediaReviewVote.count({
    where: { review_id: reviewId, value: 1 },
  });
  const dislikes = await MediaReviewVote.count({
    where: { review_id: reviewId, value: -1 },
  });

  return {
    review_id: reviewId,
    likes,
    dislikes,
  };
}
