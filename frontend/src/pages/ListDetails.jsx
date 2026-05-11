import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../services/api";

export default function ListDetails() {
  const [list, setList] = useState(null);

  const { id } = useParams();

  async function loadList() {
    const token = localStorage.getItem("token");

    const response = await api.get(`/lists/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setList(response.data);
  }

  useEffect(() => {
    loadList();
  }, [id]);

  if (!list) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white px-8 py-10">
        <p className="text-zinc-400">Carregando lista...</p>
      </main>
    );
  }

  const items = list.ListItems || [];

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-8 py-10">
      <section className="max-w-7xl mx-auto">
        <div className="mb-10">
          <Link
            to="/lists"
            className="text-sm text-zinc-400 hover:text-white transition"
          >
            ← Voltar para listas
          </Link>

          <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <p className="text-sm text-red-500 font-semibold mb-2">
              Lista Cinephilus
            </p>

            <h1 className="text-4xl font-bold">{list.title}</h1>

            <p className="text-zinc-400 mt-3 max-w-3xl">
              {list.description || "Sem descrição"}
            </p>

            <div className="mt-6 flex gap-4 text-sm text-zinc-500">
              <span>{items.length} item(ns)</span>
              <span>•</span>
              <span>{list.is_public ? "Pública" : "Privada"}</span>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Itens da lista</h2>

        {items.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
            <p className="text-zinc-400">
              Essa lista ainda não possui mídias.
            </p>

            <Link
              to="/search"
              className="inline-block mt-5 bg-red-600 hover:bg-red-700 transition rounded-xl px-5 py-3 font-semibold"
            >
              Buscar mídias
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {items.map((item) => {
              const media = item.Media || item.Medium || item.media;

              if (!media) {
                return null;
              }

              return (
                <div
                  key={item.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg hover:border-red-500 transition"
                >
                  {media.poster_url ? (
                    <img
                      src={media.poster_url}
                      alt={media.title}
                      className="w-full h-72 object-cover"
                    />
                  ) : (
                    <div className="h-72 bg-zinc-800 flex items-center justify-center text-zinc-500 text-sm">
                      Sem pôster
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-2">
                      {media.title}
                    </h3>

                    <p className="text-sm text-zinc-400 mt-1">
                      {media.release_date || "Sem data"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}