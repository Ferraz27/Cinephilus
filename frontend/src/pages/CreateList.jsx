import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

export default function CreateList() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [folders, setFolders] = useState([]);
  const [folderId, setFolderId] = useState("none");

  const navigate = useNavigate();

  async function loadFolders() {
    const token = localStorage.getItem("token");

    const response = await api.get("/folders", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setFolders(response.data || []);
  }

  async function handleCreateList(event) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    await api.post(
      "/lists",
      {
        title,
        description,
        is_public: isPublic,
        allow_comments: allowComments,
        folder_id: folderId === "none" ? null : Number(folderId),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    navigate("/lists");
  }

  useEffect(() => {
    loadFolders();
  }, []);

  return (
    <main className="ui-page">
      <section className="max-w-3xl mx-auto">
        <div className="mb-10">
          <h1 className="ui-title">Criar lista</h1>

          <p className="text-zinc-400 mt-2">
            Organize filmes, séries e animes em uma coleção personalizada.
          </p>
        </div>

        <form
          onSubmit={handleCreateList}
          className="ui-card p-8 space-y-6"
        >
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Título</label>

            <input
              className="ui-input"
              placeholder="Ex: Ficção científica favorita"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Descrição</label>

            <textarea
              className="ui-input min-h-32 resize-none"
              placeholder="Descreva o tema da sua lista..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Pasta</label>

            <div className="relative">
              <select
                value={folderId}
                onChange={(event) => setFolderId(event.target.value)}
                className="appearance-none ui-input pr-10"
              >
                <option value="none">Sem pasta</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.title}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
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

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
            <p className="font-semibold mb-3">Comentários</p>

            <label className="flex items-center gap-3 text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={allowComments}
                onChange={(event) => setAllowComments(event.target.checked)}
              />

              Lista comentável
            </label>

            <p className="text-sm text-zinc-500 mt-2">
              Se desativado, ninguém poderá comentar nem responder nesta lista.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="ui-btn-primary px-6 py-3"
            >
              Criar lista
            </button>

            <button
              type="button"
              onClick={() => navigate("/lists")}
              className="ui-btn-secondary px-6 py-3"
            >
              Cancelar
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}