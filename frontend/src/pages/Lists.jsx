import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";

export default function Lists() {
  const [lists, setLists] = useState([]);

  async function loadLists() {
    const token = localStorage.getItem("token");

    const response = await api.get("/lists", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setLists(response.data);
  }

  useEffect(() => {
    loadLists();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-8 py-10">
      <section className="max-w-6xl mx-auto">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">
              Minhas listas
            </h1>

            <p className="text-zinc-400 mt-2">
              Organize seus filmes, séries e animes em listas personalizadas.
            </p>
          </div>

          <Link
            to="/lists/create"
            className="bg-red-600 hover:bg-red-700 transition rounded-xl px-5 py-3 font-semibold"
          >
            Criar lista
          </Link>
        </div>

        {lists.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
            <p className="text-zinc-400">
              Você ainda não criou nenhuma lista.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => {
              const items = list.ListItems || [];

              const previewItems = items.slice(0, 3);

              return (
                <Link
                  key={list.id}
                  to={`/lists/${list.id}`}
                  className="block bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-red-500 transition"
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
                      {items.length} item(ns)
                    </span>

                    <span>
                      {list.is_public ? "Pública" : "Privada"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}