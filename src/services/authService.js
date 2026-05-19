import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function registerUser({ username, email, password, name }) {
  const existingUser = await User.findOne({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new Error("Email já cadastrado");
  }

  const existingUsername = await User.findOne({
    where: {
      username,
    },
  });

  if (existingUsername) {
    throw new Error("Username já está em uso");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password_hash: passwordHash,
    name,
  });

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
  };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("Credenciais invalidas");
  }

  const passwordIsValid = await bcrypt.compare(password, user.password_hash);

  if (!passwordIsValid) {
    throw new Error("Credenciais invalidas");
  }

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
    },
  };
}