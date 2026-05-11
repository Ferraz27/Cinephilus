import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

import { MonitorCheck , MonitorPlay , Clock3, MonitorX , Scroll } from "lucide-react";

import api from "../services/api";

export default function MediaDetails() {
  const { id } = useParams();
  const location = useLocation();

  const [media, setMedia] = useState(location.state?.media || null);
  const [videos, setVideos] = useState([]);
  const [currentStatus, setCurrentStatus] = useState(null);

  const [lists, setLists] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!media) {
      setMedia(null);
    }
  }, [id, media]);

  useEffect(() => {
    async function loadVideos() {
      if (!media) {
        return;
      }

      try {
        const response = await api.get(
          `/media/${media.tmdb_id}/videos?type=${media.type}`,
        );

        setVideos(response.data || []);
      } catch (error) {
        console.error("Erro ao carregar vídeos:", error);
      }
    }

    async function loadStatus() {
      if (!media) {
        return;
      }

      const token = localStorage.getItem("token");

      try {
        const response = await api.get(`/media/${media.tmdb_id}/status`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCurrentStatus(response.data?.status || null);
      } catch (error) {
        console.error("Erro ao carregar status:", error);
      }
    }

    loadVideos();
    loadStatus();
  }, [media]);

  async function openListModal() {
    const token = localStorage.getItem("token");

    const response = await api.get("/lists", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setLists(response.data);
    setModalOpen(true);
  }

  async function addToList(listId) {
    const token = localStorage.getItem("token");

    await api.post(`/lists/${listId}/items`, media, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    alert("Mídia adicionada à lista!");
    setModalOpen(false);
  }

  async function setMediaStatus(status) {
    const token = localStorage.getItem("token");

    await api.post(
      "/media/status",
      {
        ...media,
        status,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    setCurrentStatus(status);

    alert("Status atualizado!");
  }

  if (!media) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white px-8 py-10">
        <p className="text-zinc-400">
          Mídia não encontrada. Volte para a busca e tente novamente.
        </p>

        <Link
          to="/search"
          className="inline-block mt-5 bg-red-600 hover:bg-red-700 transition rounded-xl px-5 py-3 font-semibold"
        >
          Voltar para busca
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      <section className="relative px-8 py-10 overflow-hidden">
        {media.poster_url && (
          <img
            src={media.poster_url}
            alt={media.title}
            className="absolute inset-0 w-full h-full object-cover opacity-20 blur-xl scale-110"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/90 to-zinc-950" />

        <div className="relative max-w-6xl mx-auto flex gap-8 items-end">
          {media.poster_url ? (
            <img
              src={media.poster_url}
              alt={media.title}
              className="w-56 rounded-3xl border border-zinc-800 shadow-2xl"
            />
          ) : (
            <div className="w-56 aspect-[2/3] rounded-3xl border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-500">
              Sem pôster
            </div>
          )}

          <div className="pb-4">
            <Link
              to="/search"
              className="text-sm text-zinc-400 hover:text-white transition"
            >
              ← Voltar para busca
            </Link>

            <p className="text-red-500 font-semibold mt-6">{media.type}</p>

            <h1 className="text-5xl font-bold mt-2">{media.title}</h1>

            {media.original_title && (
              <p className="text-zinc-400 mt-2">{media.original_title}</p>
            )}

            <p className="text-zinc-500 mt-2">
              {media.release_date || "Sem data"}
            </p>
          </div>
        </div>
      </section>

      <section className="px-8 pb-12">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_320px] gap-10">
          <div>
            <h2 className="text-2xl font-bold mb-4">Sinopse</h2>

            <p className="text-zinc-300 leading-relaxed max-w-3xl">
              {media.synopsis || "Sem sinopse disponível."}
            </p>
          </div>

          <aside className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 h-fit space-y-4">
            {media.type === "MOVIE" ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMediaStatus("COMPLETED")}
                    className={`flex items-center justify-center gap-2 transition rounded-xl py-3 text-sm ${
                      currentStatus === "COMPLETED"
                        ? "bg-green-700"
                        : "bg-zinc-800 hover:bg-green-700"
                    }`}
                  >
                    <MonitorCheck  size={18} />
                    Assistido
                  </button>

                  <button
                    onClick={() => setMediaStatus("PLANNED")}
                    className={`flex items-center justify-center gap-2 transition rounded-xl py-3 text-sm ${
                      currentStatus === "PLANNED"
                        ? "bg-blue-700"
                        : "bg-zinc-800 hover:bg-blue-700"
                    }`}
                  >
                    <Clock3 size={18} />
                    Quero ver
                  </button>
                </div>

                <button
                  onClick={openListModal}
                  className="w-full bg-red-600 hover:bg-red-700 transition rounded-xl h-[44px] font-semibold flex items-center justify-center gap-2"
                >
                  <Scroll size={18} />
                  Adicionar à lista
                </button>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMediaStatus("COMPLETED")}
                    className={`flex items-center justify-center gap-2 transition rounded-xl py-3 text-sm ${
                      currentStatus === "COMPLETED"
                        ? "bg-green-700"
                        : "bg-zinc-800 hover:bg-green-700"
                    }`}
                  >
                    <MonitorCheck  size={18} />
                    Assistido
                  </button>

                  <button
                    onClick={() => setMediaStatus("PLANNED")}
                    className={`flex items-center justify-center gap-2 transition rounded-xl py-3 text-sm ${
                      currentStatus === "PLANNED"
                        ? "bg-blue-700"
                        : "bg-zinc-800 hover:bg-blue-700"
                    }`}
                  >
                    <Clock3 size={18} />
                    Quero ver
                  </button>

                  <button
                    onClick={() => setMediaStatus("WATCHING")}
                    className={`flex items-center justify-center gap-2 transition rounded-xl py-3 text-sm ${
                      currentStatus === "WATCHING"
                        ? "bg-yellow-700"
                        : "bg-zinc-800 hover:bg-yellow-700"
                    }`}
                  >
                    <MonitorPlay  size={18} />
                    Assistindo
                  </button>

                  <button
                    onClick={() => setMediaStatus("DROPPED")}
                    className={`flex items-center justify-center gap-2 transition rounded-xl py-3 text-sm ${
                      currentStatus === "DROPPED"
                        ? "bg-red-800"
                        : "bg-zinc-800 hover:bg-red-800"
                    }`}
                  >
                    <MonitorX  size={18} />
                    Abandonado
                  </button>
                </div>

                <button
                  onClick={openListModal}
                  className="w-full bg-red-600 hover:bg-red-700 transition rounded-xl h-[44px] font-semibold flex items-center justify-center gap-2"
                >
                  <Scroll size={18} />
                  Adicionar à lista
                </button>
              </>
            )}
          </aside>
        </div>
      </section>

      {videos.length > 0 && (
        <section className="px-8 pb-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-red-500 text-xl">▷</span>

              <h2 className="text-2xl font-bold">Vídeos</h2>
            </div>

            <div className="overflow-x-auto overflow-y-hidden pb-3 no-scrollbar">
              <div className="flex gap-4">
                {videos.map((video) => (
                  <div
                    key={video.key}
                    className="relative flex-shrink-0 w-[400px] aspect-video rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900"
                  >
                    <iframe
                      src={`https://www.youtube.com/embed/${video.key}`}
                      title={video.name}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <p className="text-sm font-semibold line-clamp-1">
                        {video.name}
                      </p>

                      <p className="text-xs text-white/50">{video.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-2">Escolher lista</h2>

            <p className="text-zinc-400 mb-5">
              Adicionar{" "}
              <span className="text-white font-semibold">{media.title}</span>{" "}
              em:
            </p>

            <div className="space-y-3">
              {lists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => addToList(list.id)}
                  className="w-full text-left bg-zinc-800 hover:bg-red-600 transition rounded-xl px-4 py-3"
                >
                  <p className="font-semibold">{list.title}</p>

                  {list.description && (
                    <p className="text-sm text-zinc-400">{list.description}</p>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setModalOpen(false)}
              className="mt-5 w-full border border-zinc-700 hover:bg-zinc-800 transition rounded-xl py-3"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
