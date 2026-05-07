import { addItemToList } from "../services/listItemService.js";

export async function create(req, res) {
  try {

    const result = await addItemToList({
      userId: req.user.id,
      listId: req.params.id,

      ...req.body,
    });

    return res.status(201).json(result);

  } catch (error) {

    return res.status(400).json({
      error: error.message,
    });

  }
}