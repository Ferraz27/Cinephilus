import Media from "../models/Media.js";
import MediaReview from "../models/MediaReview.js";
import MediaReviewComment from "../models/MediaReviewComment.js";
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
  allow_replies,
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
      allow_replies: allow_replies !== false,
    },
  });

  if (!created) {
    await review.update({
      title: review_title.trim(),
      content: content.trim(),
      allow_replies: allow_replies !== false,
    });
  }

  const reviewWithUser = await MediaReview.findByPk(review.id, {
    include: [
      {
        model: User,
        attributes: ["id", "username", "name", "avatar_url"],
      },
      {
        model: MediaReviewComment,
        separate: true,
        order: [["created_at", "ASC"]],
        include: [
          {
            model: User,
            attributes: ["id", "username", "name", "avatar_url"],
          },
        ],
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
      {
        model: MediaReviewComment,
        separate: true,
        order: [["created_at", "ASC"]],
        include: [
          {
            model: User,
            attributes: ["id", "username", "name", "avatar_url"],
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
  });
}

export async function createReviewComment({
  userId,
  reviewId,
  content,
  parent_comment_id,
}) {
  const cleanContent = String(content || "").trim();

  if (!cleanContent) {
    throw new Error("Comentário é obrigatório");
  }

  if (cleanContent.length > 1000) {
    throw new Error("Comentário muito longo");
  }

  const review = await MediaReview.findByPk(reviewId);

  if (!review) {
    throw new Error("Review nao encontrada");
  }

  if (review.allow_replies === false) {
    throw new Error("Esta review nao permite replies");
  }

  if (parent_comment_id) {
    const parent = await MediaReviewComment.findByPk(parent_comment_id);

    if (!parent || parent.review_id !== review.id) {
      throw new Error("Comentario pai invalido");
    }
  }

  const comment = await MediaReviewComment.create({
    user_id: userId,
    review_id: review.id,
    parent_comment_id: parent_comment_id || null,
    content: cleanContent,
  });

  return MediaReviewComment.findByPk(comment.id, {
    include: [
      {
        model: User,
        attributes: ["id", "username", "name", "avatar_url"],
      },
    ],
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

export async function getReviewById({ reviewId, userId }) {
  const review = await MediaReview.findByPk(reviewId, {
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
      {
        model: MediaReviewComment,
        separate: true,
        order: [["created_at", "ASC"]],
        include: [
          {
            model: User,
            attributes: ["id", "username", "name", "avatar_url"],
          },
        ],
      },
      {
        model: Media,
        attributes: ["id", "tmdb_id", "title", "original_title", "type", "poster_url", "release_date"],
      },
    ],
  });

  return review;
}
