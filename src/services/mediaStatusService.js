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

  if (!validStatuses.includes(status)) {
    throw new Error("Status inválido");
  }

  if (rating !== undefined && rating !== null && (rating < 0 || rating > 10)) {
    throw new Error("Nota deve ser entre 0 e 10");
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
      rating,
    },
  });

  if (!created) {
    await userMediaStatus.update({
      status,
      rating,
    });
  }

  return {
    media,
    status: userMediaStatus,
  };
}