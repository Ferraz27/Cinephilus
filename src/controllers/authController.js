import { registerUser, loginUser } from "../services/authService.js";

export async function register(req, res) {
  try {
    const { username, email, password, name } = req.body;

    if (!username || !email || !password || !name) {
      return res.status(400).json({
        error: "username, email, password e name são obrigatórios",
      });
    }

    const user = await registerUser({
      username,
      email,
      password,
      name,
    });

    return res.status(201).json(user);
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "email e password são obrigatórios",
      });
    }

    const result = await loginUser({
      email,
      password,
    });

    return res.json(result);
  } catch (error) {
    return res.status(401).json({
      error: error.message,
    });
  }
}