import Media from "../models/Media.js";
import UserMediaStatus from "../models/UserMediaStatus.js";

export async function setMediaStatus({
  userId,
  tmdb_id,
  title,
  original_title,
  type,
  synopsis,
  poster_url,
  release_date,
  status,
  rating,
}) {
  const validStatuses = ["PLANNED", "WATCHING", "COMPLETED", "DROPPED"];
  const normalizedRating =
    rating === undefined || rating === null || rating === ""
      ? null
      : Number(rating);

  if (status === null || status === undefined) {
    const media = await Media.findOne({
      where: { tmdb_id },
    });

    if (!media) {
      return { media: null, status: null };
    }

    await UserMediaStatus.destroy({
      where: {
        user_id: userId,
        media_id: media.id,
      },
    });

    return { media, status: null };
  }

  if (!validStatuses.includes(status)) {
    throw new Error("Status inválido");
  }

  if (normalizedRating !== null) {
    const isHalfStep = Number.isFinite(normalizedRating) && normalizedRating * 2 === Math.round(normalizedRating * 2);

    if (!isHalfStep || normalizedRating < 0.5 || normalizedRating > 5) {
      throw new Error("Nota deve ser entre 0,5 e 5, em passos de 0,5");
    }
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

  const [userMediaStatus, created] = await UserMediaStatus.findOrCreate({
    where: {
      user_id: userId,
      media_id: media.id,
    },
    defaults: {
      user_id: userId,
      media_id: media.id,
      status,
      rating: normalizedRating,
    },
  });

  if (!created) {
    await userMediaStatus.update({
      status,
      rating: normalizedRating,
    });
  }

  return {
    media,
    status: userMediaStatus,
  };
}