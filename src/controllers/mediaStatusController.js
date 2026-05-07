import { setMediaStatus } from "../services/mediaStatusService.js";

export async function createOrUpdateMediaStatus(req, res) {
  try {
    const result = await setMediaStatus({
      userId: req.user.id,
      ...req.body,
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
}