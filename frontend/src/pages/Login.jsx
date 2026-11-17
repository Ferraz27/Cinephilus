import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleLogin(event) {
    event.preventDefault();

    setError("");

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);

      navigate("/search");
    } catch (err) {
      const message = err?.response?.data?.error || "Credenciais invalidas";
      setError(message);
    }
  }

  return (
    <main className="ui-page flex items-center justify-center py-16">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm ui-card p-8 backdrop-blur shadow-2xl shadow-black/50 space-y-5"
      >
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-red-500"><span className="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_14px] shadow-red-500/70" />Cinephilus</h1>
          <p className="text-zinc-400 mt-2">Entre na sua conta</p>
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

        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-200" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="ui-btn-primary w-full py-3"
        >
          Entrar
        </button>

        <Link
          to="/register"
          className="block text-center text-sm text-zinc-400 hover:text-red-400 transition"
        >
          Criar conta
        </Link>
      </form>
    </main>
  );
}