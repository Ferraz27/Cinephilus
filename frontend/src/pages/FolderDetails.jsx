import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../services/api";

export default function FolderDetails() {
  const [folder, setFolder] = useState(null);

  const { id } = useParams();

  async function loadFolder() {
    const token = localStorage.getItem("token");

    const response = await api.get(`/folders/${id}/lists`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setFolder(response.data);
  }

  useEffect(() => {
    loadFolder();
  }, [id]);

  if (!folder) {
    return (
      <main className="ui-page">
        <p className="text-zinc-400">Carregando pasta...</p>
      </main>
    );
  }

  const lists = folder.MediaLists || folder.MediaList || [];
  const listCountLabel = `${lists.length} lista${lists.length === 1 ? "" : "s"}`;

  return (
    <main className="ui-page">
      <section className="max-w-7xl mx-auto">
        <div className="mb-10">
          <Link
            to="/lists"
            className="ui-link-back"
          >
            ← Voltar para listas
          </Link>

          <div className="mt-6 ui-card p-8">
            <p className="text-sm text-red-500 font-semibold mb-2">
              Pasta Cinephilus
            </p>

            <h1 className="ui-title">{folder.title}</h1>

            <p className="text-zinc-400 mt-3 max-w-3xl">
              {folder.description || "Sem descrição"}
            </p>

            <div className="mt-6 flex gap-4 text-sm text-zinc-500">
              <span>{listCountLabel}</span>
            </div>
          </div>
        </div>

        <h2 className="ui-section-title mb-6">Listas da pasta</h2>

        {lists.length === 0 ? (
          <div className="ui-empty">
            <p className="text-zinc-400">
              Essa pasta ainda não possui listas.
            </p>

            <Link
              to="/lists/create"
              className="ui-btn-primary mt-5"
            >
              Criar lista
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {lists.map((list) => renderListCard(list))}
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
