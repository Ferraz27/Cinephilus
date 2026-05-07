import { searchMovies } from "../services/tmdbService.js";

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