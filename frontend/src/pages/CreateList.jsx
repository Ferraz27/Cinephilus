import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

export default function CreateList() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const navigate = useNavigate();

  async function handleCreateList(event) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    await api.post(
      "/lists",
      {
        title,
        description,
        is_public: isPublic,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    navigate("/lists");
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-8 py-10">
      <section className="max-w-3xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold">Criar lista</h1>

          <p className="text-zinc-400 mt-2">
            Organize filmes, séries e animes em uma coleção personalizada.
          </p>
        </div>

        <form
          onSubmit={handleCreateList}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6"
        >
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Título</label>

            <input
              className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-5 py-3 outline-none focus:border-red-500"
              placeholder="Ex: Ficção científica favorita"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Descrição</label>

            <textarea
              className="w-full min-h-32 rounded-xl bg-zinc-800 border border-zinc-700 px-5 py-3 outline-none focus:border-red-500 resize-none"
              placeholder="Descreva o tema da sua lista..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
            <p className="font-semibold mb-3">Privacidade</p>

            <label className="flex items-center gap-3 text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(event) => setIsPublic(event.target.checked)}
              />

              Lista pública
            </label>

            <p className="text-sm text-zinc-500 mt-2">
              Listas públicas poderão aparecer no seu perfil futuramente.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 transition rounded-xl px-6 py-3 font-semibold"
            >
              Criar lista
            </button>

            <button
              type="button"
              onClick={() => navigate("/lists")}
              className="bg-zinc-800 hover:bg-zinc-700 transition rounded-xl px-6 py-3 font-semibold"
            >
              Cancelar
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}