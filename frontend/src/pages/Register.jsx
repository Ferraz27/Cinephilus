import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  async function handleRegister(event) {
    event.preventDefault();

    await api.post("/auth/register", {
      username,
      email,
      password,
      name,
    });

    navigate("/");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-sm bg-zinc-900 p-8 rounded-2xl shadow-lg space-y-5"
      >
        <div>
          <h1 className="text-3xl font-bold">Cinephilus</h1>
          <p className="text-zinc-400 mt-2">Crie sua conta</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Nome</label>
          <input
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3 outline-none focus:border-red-500"
            placeholder="Seu nome"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Usuario</label>
          <input
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3 outline-none focus:border-red-500"
            placeholder="Seu usuario"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Email</label>
          <input
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3 outline-none focus:border-red-500"
            placeholder="seu@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Senha</label>
          <input
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3 outline-none focus:border-red-500"
            placeholder="Sua senha"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 transition rounded-lg py-3 font-semibold"
        >
          Criar conta
        </button>

        <Link
          to="/"
          className="block text-center text-sm text-zinc-400 hover:text-white transition"
        >
          Ja tenho conta
        </Link>
      </form>
    </main>
  );
}
