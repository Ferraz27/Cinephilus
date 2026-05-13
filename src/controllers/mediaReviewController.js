import { createOrUpdateReview, listReviews, setReviewVote } from "../services/mediaReviewService.js";

export async function createReview(req, res) {
  try {
    const review = await createOrUpdateReview({
      userId: req.user.id,
      tmdb_id: req.params.tmdbId,
      ...req.body,
    });

    return res.status(200).json(review);
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
}

export async function getReviews(req, res) {
  try {
    const { season } = req.query;

    const reviews = await listReviews({
      tmdb_id: req.params.tmdbId,
      season_number: season,
      userId: req.user?.id,
    });

    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function voteReview(req, res) {
  try {
    const { value } = req.body;

    const result = await setReviewVote({
      userId: req.user.id,
      reviewId: req.params.reviewId,
      value,
    });

    return res.json(result);
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
}
