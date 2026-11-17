import Media from "../models/Media.js";
import UserFavoriteMedia from "../models/UserFavoriteMedia.js";
import sequelize from "../config/database.js";

const MAX_FAVORITES = 5;

export async function getFavorites(userId) {
  return UserFavoriteMedia.findAll({
    where: { user_id: userId },
    include: [Media],
    order: [["position", "ASC"]],
  });
}

export async function setFavorites(userId, items = []) {
  if (!Array.isArray(items)) {
    throw new Error("items deve ser uma lista");
  }

  if (items.length > MAX_FAVORITES) {
    throw new Error(`Você pode escolher no máximo ${MAX_FAVORITES} favoritos`);
  }

  await sequelize.transaction(async (transaction) => {
    await UserFavoriteMedia.destroy({
      where: { user_id: userId },
      transaction,
    });

    for (let index = 0; index < items.length; index += 1) {
      const {
        tmdb_id,
        title,
        original_title,
        type,
        synopsis,
        poster_url,
        release_date,
      } = items[index];

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
        transaction,
      });

      await UserFavoriteMedia.create(
        {
          user_id: userId,
          media_id: media.id,
          position: index,
        },
        { transaction },
      );
    }
  });

  return getFavorites(userId);
}
