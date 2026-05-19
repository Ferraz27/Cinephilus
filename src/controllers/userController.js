import MediaReview from "../models/MediaReview.js";
import UserMediaStatus from "../models/UserMediaStatus.js";

export async function getMe(req, res) {
  const [completedCount, watchingCount, plannedCount, droppedCount, reviewsCount] = await Promise.all([
    UserMediaStatus.count({
      where: { user_id: req.user.id, status: "COMPLETED" },
    }),
    UserMediaStatus.count({
      where: { user_id: req.user.id, status: "WATCHING" },
    }),
    UserMediaStatus.count({
      where: { user_id: req.user.id, status: "PLANNED" },
    }),
    UserMediaStatus.count({
      where: { user_id: req.user.id, status: "DROPPED" },
    }),
    MediaReview.count({
      where: { user_id: req.user.id },
    }),
  ]);

  return res.json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
    name: req.user.name,
    avatar_url: req.user.avatar_url,
    bio: req.user.bio,
    is_private: req.user.is_private,
    created_at: req.user.created_at,
    stats: {
      completed: completedCount,
      watching: watchingCount,
      planned: plannedCount,
      dropped: droppedCount,
      reviews: reviewsCount,
    },
  });
}

export async function updateMe(req, res) {
  const { name, bio, avatar_url } = req.body;
  const nextName = name ?? req.user.name;
  const nextBio = bio ?? req.user.bio;
  let nextAvatarUrl = avatar_url ?? req.user.avatar_url;

  if (req.file) {
    nextAvatarUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  }

  await req.user.update({
    name: nextName,
    bio: nextBio,
    avatar_url: nextAvatarUrl,
  });

  const [completedCount, watchingCount, plannedCount, droppedCount, reviewsCount] = await Promise.all([
    UserMediaStatus.count({
      where: { user_id: req.user.id, status: "COMPLETED" },
    }),
    UserMediaStatus.count({
      where: { user_id: req.user.id, status: "WATCHING" },
    }),
    UserMediaStatus.count({
      where: { user_id: req.user.id, status: "PLANNED" },
    }),
    UserMediaStatus.count({
      where: { user_id: req.user.id, status: "DROPPED" },
    }),
    MediaReview.count({
      where: { user_id: req.user.id },
    }),
  ]);

  return res.json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
    name: req.user.name,
    avatar_url: req.user.avatar_url,
    bio: req.user.bio,
    is_private: req.user.is_private,
    created_at: req.user.created_at,
    stats: {
      completed: completedCount,
      watching: watchingCount,
      planned: plannedCount,
      dropped: droppedCount,
      reviews: reviewsCount,
    },
  });
}