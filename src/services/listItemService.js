import Media from "../models/Media.js";
import MediaList from "../models/MediaList.js";
import ListItem from "../models/ListItem.js";

export async function addItemToList({
  userId,
  listId,

  tmdb_id,
  title,
  original_title,
  type,
  synopsis,
  poster_url,
  release_date,
}) {

  const list = await MediaList.findByPk(listId);

  if (!list) {
    throw new Error("Lista não encontrada");
  }

  if (list.user_id !== userId) {
    throw new Error("Você não pode editar essa lista");
  }

  const [media] = await Media.findOrCreate({
    where: {
      tmdb_id,
    },

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

  const existingItem = await ListItem.findOne({
    where: {
      list_id: list.id,
      media_id: media.id,
    },
  });

  if (existingItem) {
    throw new Error("Essa mídia já está na lista");
  }

  const itemCount = await ListItem.count({
    where: {
      list_id: list.id,
    },
  });

  const listItem = await ListItem.create({
    list_id: list.id,
    media_id: media.id,
    position: itemCount + 1,
  });

  return {
    message: "Mídia adicionada à lista",
    item: listItem,
  };
}