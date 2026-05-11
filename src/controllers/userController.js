export async function getMe(req, res) {
  return res.json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
    name: req.user.name,
    avatar_url: req.user.avatar_url,
    bio: req.user.bio,
    is_private: req.user.is_private,
    created_at: req.user.created_at,
  });
}

export async function updateMe(req, res) {
  const { name, bio, avatar_url } = req.body;

  await req.user.update({
    name,
    bio,
    avatar_url,
  });

  return res.json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
    name: req.user.name,
    avatar_url: req.user.avatar_url,
    bio: req.user.bio,
    is_private: req.user.is_private,
    created_at: req.user.created_at,
  });
}