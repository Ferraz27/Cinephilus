import { useEffect, useState } from "react";

import api from "../services/api";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [lists, setLists] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({
    name: "",
    bio: "",
    avatar_url: "",
  });

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
    setFormValues({
      name: userResponse.data?.name || "",
      bio: userResponse.data?.bio || "",
      avatar_url: userResponse.data?.avatar_url || "",
    });
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
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-28 h-28 rounded-full object-cover border border-zinc-800"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-red-600 flex items-center justify-center text-4xl font-bold uppercase">
                {user.name?.[0]}
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-4xl font-bold">
                  {user.name}
                </h1>

                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-sm px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition"
                >
                  Editar perfil
                </button>
              </div>

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
                    {user.stats?.completed ?? 0}
                  </p>

                  <p className="text-zinc-500">
                    Assistidos
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-bold">
                    {user.stats?.reviews ?? 0}
                  </p>

                  <p className="text-zinc-500">
                    Reviews
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-bold">
                    {user.stats?.watching ?? 0}
                  </p>

                  <p className="text-zinc-500">
                    Assistindo
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-bold">
                    {user.stats?.planned ?? 0}
                  </p>

                  <p className="text-zinc-500">
                    Quero ver
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-bold">
                    {user.stats?.dropped ?? 0}
                  </p>

                  <p className="text-zinc-500">
                    Abandonados
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-10">
            <h2 className="text-2xl font-bold mb-6">Editar perfil</h2>

            <form
              onSubmit={async (event) => {
                event.preventDefault();
                const token = localStorage.getItem("token");

                const response = await api.put(
                  "/users/me",
                  {
                    name: formValues.name,
                    bio: formValues.bio,
                    avatar_url: formValues.avatar_url,
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  },
                );

                setUser(response.data);
                setFormValues({
                  name: response.data?.name || "",
                  bio: response.data?.bio || "",
                  avatar_url: response.data?.avatar_url || "",
                });
                setIsEditing(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm text-zinc-300">Nome</label>
                <input
                  value={formValues.name}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm text-white outline-none focus:border-red-500"
                  placeholder="Seu nome"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300">Foto (URL)</label>
                <input
                  value={formValues.avatar_url}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      avatar_url: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm text-white outline-none focus:border-red-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300">Bio</label>
                <textarea
                  value={formValues.bio}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      bio: event.target.value,
                    }))
                  }
                  className="w-full min-h-[120px] rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm text-white outline-none focus:border-red-500"
                  placeholder="Conte um pouco sobre voce"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 transition rounded-xl px-5 py-2 text-sm font-semibold"
                >
                  Salvar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFormValues({
                      name: user.name || "",
                      bio: user.bio || "",
                      avatar_url: user.avatar_url || "",
                    });
                    setIsEditing(false);
                  }}
                  className="text-sm px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

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