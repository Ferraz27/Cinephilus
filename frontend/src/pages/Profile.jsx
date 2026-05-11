import { useEffect, useState } from "react";

import api from "../services/api";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [lists, setLists] = useState([]);

  async function loadProfile() {
    const token = localStorage.getItem("token");

    const [userResponse, listsResponse] = await Promise.all([
      api.get("/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),

      api.get("/lists", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    ]);

    setUser(userResponse.data);
    setLists(listsResponse.data);
  }

  useEffect(() => {
    loadProfile();
  }, []);

  if (!user) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white px-8 py-10">
        <p className="text-zinc-400">Carregando perfil...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-8 py-10">
      <section className="max-w-6xl mx-auto">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-10">
          <div className="flex items-center gap-6">
            <div className="w-28 h-28 rounded-full bg-red-600 flex items-center justify-center text-4xl font-bold uppercase">
              {user.name?.[0]}
            </div>

            <div>
              <h1 className="text-4xl font-bold">
                {user.name}
              </h1>

              <p className="text-zinc-400 mt-1">
                @{user.username}
              </p>

              <p className="text-zinc-400 mt-4 max-w-2xl">
                {user.bio || "Esse usuário ainda não possui bio."}
              </p>

              <div className="flex gap-6 mt-5 text-sm">
                <div>
                  <p className="text-2xl font-bold">
                    {lists.length}
                  </p>

                  <p className="text-zinc-500">
                    Listas
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-bold">
                    0
                  </p>

                  <p className="text-zinc-500">
                    Assistidos
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-bold">
                    0
                  </p>

                  <p className="text-zinc-500">
                    Reviews
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-3xl font-bold">
            Listas recentes
          </h2>

          <p className="text-zinc-400 mt-2">
            Suas listas criadas recentemente.
          </p>
        </div>

        {lists.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
            <p className="text-zinc-400">
              Você ainda não criou nenhuma lista.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <div
                key={list.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
              >
                <h3 className="text-xl font-bold mb-2">
                  {list.title}
                </h3>

                <p className="text-zinc-400 text-sm line-clamp-3">
                  {list.description || "Sem descrição"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}