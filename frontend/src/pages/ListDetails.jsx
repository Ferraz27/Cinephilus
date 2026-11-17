import { ChevronDown, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

import api from "../services/api";
import ThreadedComments from "../components/ThreadedComments";

export default function ListDetails() {
  const [list, setList] = useState(null);
  const [folders, setFolders] = useState([]);
  const [folderId, setFolderId] = useState("none");
  const [comments, setComments] = useState([]);
  const [isPublic, setIsPublic] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  function syncSettingsFromList(listData) {
    setFolderId(listData.folder_id ? String(listData.folder_id) : "none");
    setIsPublic(listData.is_public !== false);
    setAllowComments(listData.allow_comments !== false);
  }

  async function loadList() {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get(`/lists/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setList(response.data);
      syncSettingsFromList(response.data);
    } catch (error) {
      console.error(error);
      const status = error?.response?.status;
      if (status === 401) {
        navigate("/");
        return;
      }

      setList({ ListItems: [] });
    }
  }

  async function loadComments() {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get(`/lists/${id}/comments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setComments(response.data || []);
    } catch (error) {
      console.error(error);
      const status = error?.response?.status;
      if (status === 401) {
        navigate("/");
        return;
      }

      setComments([]);
    }
  }

  async function loadFolders() {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/folders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFolders(response.data || []);
    } catch (error) {
      console.error(error);
      const status = error?.response?.status;
      if (status === 401) {
        navigate("/");
        return;
      }

      setFolders([]);
    }
  }

  async function handleSaveSettings(event) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    setSavingSettings(true);

    try {
      const response = await api.patch(
        `/lists/${id}`,
        {
          folder_id: folderId === "none" ? null : Number(folderId),
          is_public: isPublic,
          allow_comments: allowComments,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setList((current) => ({
        ...current,
        ...response.data,
      }));
      syncSettingsFromList(response.data);
      setIsEditing(false);
    } finally {
      setSavingSettings(false);
    }
  }

  function handleCancelEdit() {
    if (list) {
      syncSettingsFromList(list);
    }

    setIsEditing(false);
  }

  async function handleCreateComment({ content, parentCommentId }) {
    const token = localStorage.getItem("token");

    const response = await api.post(
      `/lists/${id}/comments`,
      {
        content,
        parent_comment_id: parentCommentId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    setComments((current) => [...current, response.data]);
  }

  useEffect(() => {
    loadList();
    loadFolders();
    loadComments();
  }, [id]);

  if (!list) {
    return (
      <main className="ui-page">
        <p className="text-zinc-400">Carregando lista...</p>
      </main>
    );
  }

  const items = list.ListItems || [];
  const itemCountLabel = `${items.length} item${items.length === 1 ? "" : "s"}`;

  function Toggle({ checked, onChange, label, description }) {
    return (
      <label className="flex items-start justify-between gap-4 ui-card ui-card-hover p-4 cursor-pointer">
        <div>
          <p className="font-medium text-white">{label}</p>
          <p className="text-sm text-zinc-500 mt-1">{description}</p>
        </div>

        <span
          className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 rounded-full transition ${
            checked ? "bg-red-600" : "bg-zinc-700"
          }`}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="peer sr-only"
          />
          <span
            className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200 ${
              checked ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </span>
      </label>
    );
  }

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
              Lista Cinephilus
            </p>

            <h1 className="ui-title">{list.title}</h1>

            <p className="text-zinc-400 mt-3 max-w-3xl">
              {list.description || "Sem descrição"}
            </p>

            <div className="mt-6 flex gap-4 text-sm text-zinc-500">
              <span>{itemCountLabel}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-2">
                <ThumbsUp size={14} />
                <span>{list.likesCount ?? 0}</span>
              </span>
              <span>•</span>
              <span>{list.commentsCount ?? 0} comentário{list.commentsCount === 1 ? "" : "s"}</span>
              <span>•</span>
              <span>{list.is_public ? "Pública" : "Privada"}</span>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => setIsEditing((current) => !current)}
                className="ui-btn-secondary"
              >
                <ChevronDown
                  size={14}
                  className={`transition-transform ${isEditing ? "rotate-180" : ""}`}
                />
                {isEditing ? "Fechar edição" : "Editar lista"}
              </button>

              {isEditing ? (
                <form
                  onSubmit={handleSaveSettings}
                  className="mt-4 bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-5"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold">Editar lista</p>
                    <div className="ui-divider" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-zinc-300">Pasta</label>
                    <div className="relative">
                      <select
                        value={folderId}
                        onChange={(event) => setFolderId(event.target.value)}
                        className="appearance-none ui-input pr-8 text-zinc-200"
                      >
                        <option value="none">Sem pasta</option>
                        {folders.map((folder) => (
                          <option key={folder.id} value={folder.id}>
                            {folder.title}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400"
                      />
                    </div>
                  </div>

                  <Toggle
                    checked={isPublic}
                    onChange={(event) => setIsPublic(event.target.checked)}
                    label="Lista pública"
                    description="Quando ativada, a lista aparece para outras pessoas."
                  />

                  <Toggle
                    checked={allowComments}
                    onChange={(event) => setAllowComments(event.target.checked)}
                    label="Lista comentável"
                    description="Quando desativada, ninguém poderá comentar ou responder."
                  />

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="ui-btn-primary px-5 py-3"
                    >
                      {savingSettings ? "Salvando..." : "Salvar alterações"}
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={savingSettings}
                      className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-200 hover:border-zinc-500 hover:text-white transition disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : null}
            </div>
          </div>
        </div>

        <h2 className="ui-section-title mb-6">Itens da lista</h2>

        {items.length === 0 ? (
          <div className="ui-empty">
            <p className="text-zinc-400">
              Essa lista ainda não possui mídias.
            </p>

            <Link
              to="/search"
              className="ui-btn-primary mt-5"
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
                  className="ui-card ui-card-hover overflow-hidden shadow-lg shadow-black/30"
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

        <div className="mt-12">
          <ThreadedComments
            title="Comentários"
            comments={comments}
            canComment={allowComments}
            allowReplies={allowComments}
            disabledMessage="Esta lista não permite comentários."
            topLevelPlaceholder="Escreva um comentário..."
            onSubmitComment={handleCreateComment}
          />
        </div>
      </section>
    </main>
  );
}