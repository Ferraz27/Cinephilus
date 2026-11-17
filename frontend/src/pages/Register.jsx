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
    <main className="ui-page flex items-center justify-center py-16">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-sm ui-card p-8 backdrop-blur shadow-2xl shadow-black/50 space-y-5"
      >
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-red-500"><span className="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_14px] shadow-red-500/70" />Cinephilus</h1>
          <p className="text-zinc-400 mt-2">Crie sua conta</p>
        </div>

        <div className="space-y-2">
          <label className="ui-eyebrow">Nome</label>
          <input
            className="ui-input"
            placeholder="Seu nome"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="ui-eyebrow">Usuario</label>
          <input
            className="ui-input"
            placeholder="Seu usuario"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="ui-eyebrow">Email</label>
          <input
            className="ui-input"
            placeholder="seu@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="ui-eyebrow">Senha</label>
          <input
            className="ui-input"
            placeholder="Sua senha"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <button
          type="submit"
          className="ui-btn-primary w-full py-3"
        >
          Criar conta
        </button>

        <Link
          to="/"
          className="block text-center text-sm text-zinc-400 hover:text-red-400 transition"
        >
          Ja tenho conta
        </Link>
      </form>
    </main>
  );
}
