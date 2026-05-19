import { useEffect, useState } from "react";

import api from "../services/api";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [lists, setLists] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [formValues, setFormValues] = useState({
    name: "",
    bio: "",
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
    });
    setAvatarPreview(userResponse.data?.avatar_url || "");
    setAvatarFile(null);
  }

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

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

                const payload = new FormData();
                payload.append("name", formValues.name);
                payload.append("bio", formValues.bio);
                if (avatarFile) {
                  payload.append("avatar", avatarFile);
                }

                const response = await api.put("/users/me", payload, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                  },
                });

                setUser(response.data);
                setFormValues({
                  name: response.data?.name || "",
                  bio: response.data?.bio || "",
                });
                setAvatarPreview(response.data?.avatar_url || "");
                setAvatarFile(null);
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
                <label className="text-sm text-zinc-300">Foto (upload)</label>
                <div className="flex items-center gap-4">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Preview do avatar"
                      className="w-16 h-16 rounded-full object-cover border border-zinc-800"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400">
                      Sem foto
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      setAvatarFile(file);
                      if (file) {
                        setAvatarPreview(URL.createObjectURL(file));
                      } else {
                        setAvatarPreview(user.avatar_url || "");
                      }
                    }}
                    className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm text-white outline-none focus:border-red-500"
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  JPG, PNG ou WEBP ate 2MB.
                </p>
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
                    });
                    setAvatarPreview(user.avatar_url || "");
                    setAvatarFile(null);
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