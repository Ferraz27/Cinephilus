import { ArrowDown, ArrowUp, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";

export default function Lists() {
  const [lists, setLists] = useState([]);
  const [folders, setFolders] = useState([]);
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [folderTitle, setFolderTitle] = useState("");
  const [folderDescription, setFolderDescription] = useState("");
  const [folderIsPublic, setFolderIsPublic] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("updated_desc");
  const [sortDirection, setSortDirection] = useState("desc");
  const [contentFilter, setContentFilter] = useState("both");

  async function loadLists() {
    const token = localStorage.getItem("token");

    const response = await api.get("/lists", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setLists(response.data);
  }

  async function loadFolders() {
    const token = localStorage.getItem("token");

    const response = await api.get("/folders", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setFolders(response.data || []);
  }

  async function handleCreateFolder(event) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    await api.post(
      "/folders",
      {
        title: folderTitle,
        description: folderDescription,
        is_public: folderIsPublic,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    setFolderTitle("");
    setFolderDescription("");
    setFolderIsPublic(true);
    setShowFolderForm(false);
    loadFolders();
  }

  useEffect(() => {
    loadLists();
    loadFolders();
  }, []);

  const filteredLists = lists.filter((list) => {
    if (!searchTerm.trim()) {
      return true;
    }

    const term = searchTerm.trim().toLowerCase();
    const title = (list.title || "").toLowerCase();
    const description = (list.description || "").toLowerCase();

    return title.includes(term) || description.includes(term);
  });

  const sortedLists = [...filteredLists].sort((a, b) => {
    const multiplier = sortDirection === "asc" ? 1 : -1;
    const aValue =
      sortBy === "created_desc"
        ? new Date(a.created_at || 0).getTime()
        : new Date(a.updated_at || 0).getTime();
    const bValue =
      sortBy === "created_desc"
        ? new Date(b.created_at || 0).getTime()
        : new Date(b.updated_at || 0).getTime();

    return (aValue - bValue) * multiplier;
  });

  const listCountLabel = `${sortedLists.length} lista${sortedLists.length === 1 ? "" : "s"}`;
  const folderCountLabel = `${folders.length} pasta${folders.length === 1 ? "" : "s"}`;

  const showLists = contentFilter !== "folders";
  const showFolders = contentFilter !== "lists";

  return (
    <main className="ui-page">
      <section className="max-w-6xl mx-auto">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="ui-title">
              Listas
            </h1>


          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowFolderForm((value) => !value)}
              className="ui-btn-secondary px-5 py-3"
            >
              Nova pasta
            </button>

            <Link
              to="/lists/create"
              className="ui-btn-primary px-5 py-3"
            >
              Criar lista
            </Link>
          </div>
        </div>

        {showFolderForm && (
          <form
            onSubmit={handleCreateFolder}
            className="mb-10 ui-card p-6 space-y-4"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <input
                className="ui-input w-auto"
                placeholder="Titulo da pasta"
                value={folderTitle}
                onChange={(event) => setFolderTitle(event.target.value)}
                required
              />

              <input
                className="ui-input w-auto"
                placeholder="Descricao (opcional)"
                value={folderDescription}
                onChange={(event) => setFolderDescription(event.target.value)}
              />
            </div>

            <label className="flex items-center gap-3 text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={folderIsPublic}
                onChange={(event) => setFolderIsPublic(event.target.checked)}
              />
              Pasta pública
            </label>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="ui-btn-primary px-5 py-3"
              >
                Criar pasta
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowFolderForm(false);
                  setFolderIsPublic(true);
                }}
                className="ui-btn-secondary px-5 py-3"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div className="mb-8 flex flex-wrap items-center gap-3">
          <input
            className="flex-1 min-w-[220px] ui-input"
            placeholder="Pesquisar listas..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <div className="relative">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="appearance-none rounded-2xl bg-zinc-950/60 border border-zinc-800 px-4 py-3 pr-10 text-sm outline-none transition hover:border-zinc-700 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/15"
            >
              <option value="updated_desc">Atualizadas recentemente</option>
              <option value="created_desc">Criadas recentemente</option>
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              setSortDirection((value) => (value === "asc" ? "desc" : "asc"))
            }
            className="flex items-center justify-center h-[48px] rounded-2xl bg-zinc-950/60 border border-zinc-800 px-4 text-zinc-300 hover:text-white hover:border-zinc-700 transition"
            title={sortDirection === "asc" ? "Ordem crescente" : "Ordem decrescente"}
          >
            {sortDirection === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
          </button>
        </div>

        <div className="mb-10 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setContentFilter("lists")}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              contentFilter === "lists"
                ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/40"
                : "bg-zinc-800/80 border-zinc-700/60 text-zinc-300 hover:border-zinc-600 hover:text-white"
            }`}
          >
            Listas
          </button>

          <button
            type="button"
            onClick={() => setContentFilter("folders")}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              contentFilter === "folders"
                ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/40"
                : "bg-zinc-800/80 border-zinc-700/60 text-zinc-300 hover:border-zinc-600 hover:text-white"
            }`}
          >
            Pastas
          </button>

          <button
            type="button"
            onClick={() => setContentFilter("both")}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              contentFilter === "both"
                ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/40"
                : "bg-zinc-800/80 border-zinc-700/60 text-zinc-300 hover:border-zinc-600 hover:text-white"
            }`}
          >
            Ambos
          </button>
        </div>

        {showLists && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="ui-section-title">Listas</h2>
              <div className="ui-divider" />
              <span className="text-sm text-zinc-500">
                {listCountLabel}
              </span>
            </div>

            {lists.length === 0 ? (
              <div className="ui-empty">
                <p className="text-zinc-400">
                  Você ainda não criou nenhuma lista.
                </p>
              </div>
            ) : sortedLists.length === 0 ? (
              <div className="ui-empty">
                <p className="text-zinc-400">
                  Nenhuma lista encontrada.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedLists.map((list) => renderListCard(list))}
              </div>
            )}
          </>
        )}

        {showFolders && (
          <div className={showLists ? "mt-12" : ""}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="ui-section-title">Pastas</h2>
              <div className="ui-divider" />
              <span className="text-sm text-zinc-500">
                {folderCountLabel}
              </span>
            </div>

            {folders.length === 0 ? (
              <div className="ui-empty">
                Você ainda não criou nenhuma pasta.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {folders.map((folder) => (
                  <Link
                    key={folder.id}
                    to={`/folders/${folder.id}`}
                    className="block ui-card ui-card-hover p-6"
                  >
                    <h3 className="text-xl font-bold mb-2">
                      {folder.title}
                    </h3>

                    <p className="text-zinc-400 text-sm line-clamp-3">
                      {folder.description || "Sem descrição"}
                    </p>

                    <div className="mt-4 text-xs text-zinc-500">
                      {folder.is_public ? "Pública" : "Privada"}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function renderListCard(list) {
  const items = list.ListItems || [];
  const previewItems = items.slice(0, 3);
  const itemCountLabel = `${items.length} item${items.length === 1 ? "" : "s"}`;

  return (
    <Link
      key={list.id}
      to={`/lists/${list.id}`}
      className="block ui-card ui-card-hover p-6"
    >
      <h3 className="text-xl font-bold mb-2">
        {list.title}
      </h3>

      <p className="text-zinc-400 text-sm line-clamp-3 mb-5">
        {list.description || "Sem descrição"}
      </p>

      <div className="flex gap-2 h-36">
        {previewItems.length > 0 ? (
          previewItems.map((item) => {
            const media =
              item.Media ||
              item.Medium ||
              item.media;

            if (!media) {
              return null;
            }

            return media.poster_url ? (
              <img
                key={item.id}
                src={media.poster_url}
                alt={media.title}
                className="w-24 rounded-xl object-cover bg-zinc-800"
              />
            ) : (
              <div
                key={item.id}
                className="w-24 rounded-xl bg-zinc-800 flex items-center justify-center text-xs text-zinc-500 text-center px-2"
              >
                Sem pôster
              </div>
            );
          })
        ) : (
          <div className="w-full rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 text-sm">
            Lista vazia
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-5 text-xs text-zinc-500">
        <span>
          {itemCountLabel}
        </span>

        <span>
          {list.is_public ? "Pública" : "Privada"}
        </span>
      </div>
    </Link>
  );
}