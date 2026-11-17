import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../services/api";

export default function PublicFolder() {
  const { username, folderId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  async function loadFolder() {
    setError("");

    try {
      const response = await api.get(`/public/users/${username}/folders/${folderId}`);
      setData(response.data);
    } catch (fetchError) {
      setData(null);
      setError("Pasta pública não encontrada.");
    }
  }

  useEffect(() => {
    loadFolder();
  }, [username, folderId]);

  if (error) {
    return (
      <main className="ui-page">
        <section className="max-w-6xl mx-auto">
          <p className="text-zinc-400">{error}</p>
        </section>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="ui-page">
        <p className="text-zinc-400">Carregando pasta pública...</p>
      </main>
    );
  }

  const { user, folder } = data;
  const lists = folder.MediaLists || [];

  return (
    <main className="ui-page">
      <section className="max-w-7xl mx-auto space-y-10">
        <div>
          <Link to={`/u/${user.username}`} className="ui-link-back">
            ← Voltar para o perfil
          </Link>

          <div className="mt-6 ui-card p-8">
            <p className="text-sm text-red-500 font-semibold mb-2">Pasta pública</p>
            <h1 className="ui-title">{folder.title}</h1>
            <p className="text-zinc-400 mt-3 max-w-3xl">{folder.description || "Sem descrição"}</p>
            <div className="mt-6 flex gap-4 text-sm text-zinc-500">
              <span>{lists.length} lista{lists.length === 1 ? "" : "s"}</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="ui-section-title mb-6">Listas da pasta</h2>

          {lists.length === 0 ? (
            <div className="ui-empty">
              Nenhuma lista pública nesta pasta.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {lists.map((list) => (
                <PublicListCard key={list.id} list={list} username={user.username} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function PublicListCard({ list, username }) {
  const items = list.ListItems || [];
  const previewItems = items.slice(0, 3);

  return (
    <Link
      to={`/u/${username}/lists/${list.id}`}
      className="block ui-card ui-card-hover p-6"
    >
      <h3 className="text-xl font-bold mb-2">{list.title}</h3>
      <p className="text-zinc-400 text-sm line-clamp-3 mb-5">{list.description || "Sem descrição"}</p>

      <div className="flex gap-2 h-36">
        {previewItems.length > 0 ? (
          previewItems.map((item) => {
            const media = item.Media || item.Medium || item.media;
            if (!media) return null;

            return media.poster_url ? (
              <img key={item.id} src={media.poster_url} alt={media.title} className="w-24 rounded-xl object-cover bg-zinc-800" />
            ) : (
              <div key={item.id} className="w-24 rounded-xl bg-zinc-800 flex items-center justify-center text-xs text-zinc-500 text-center px-2">
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
    </Link>
  );
}