import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

function buildTree(comments) {
  const byId = new Map();
  const roots = [];

  comments.forEach((comment) => {
    byId.set(comment.id, { ...comment, replies: [] });
  });

  byId.forEach((comment) => {
    const parentId = comment.parent_comment_id;

    if (parentId && byId.has(parentId)) {
      byId.get(parentId).replies.push(comment);
      return;
    }

    roots.push(comment);
  });

  return roots;
}

function CommentNode({
  comment,
  allowReplies,
  onSubmitComment,
  depth = 0,
  parentUserLabel,
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const authorLabel = comment.User?.name || comment.User?.username || "Usuario";
  const replyLabel = parentUserLabel || comment.ParentComment?.User?.name || comment.ParentComment?.User?.username || "comentário";

  async function handleReplySubmit(event) {
    event.preventDefault();

    const cleanText = replyText.trim();
    if (!cleanText) {
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await onSubmitComment({
        content: cleanText,
        parentCommentId: comment.id,
      });
      setReplyText("");
      setReplyOpen(false);
    } catch (submitError) {
      setError(submitError?.response?.data?.error || submitError?.message || "Não foi possível responder.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={depth > 0 ? "ml-4 sm:ml-6 pl-4 border-l-2 border-zinc-800" : ""}>
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-4">
        <div className="flex items-center gap-3 mb-3 text-sm text-zinc-300">
          {comment.User?.avatar_url ? (
            <img
              src={comment.User.avatar_url}
              alt={authorLabel}
              className="h-9 w-9 rounded-full object-cover border border-zinc-800"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-sm font-bold uppercase">
              {authorLabel[0]}
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              {comment.User?.username ? (
                <Link
                  to={`/u/${comment.User.username}`}
                  className="font-semibold text-white hover:text-red-400 transition"
                >
                  {authorLabel}
                </Link>
              ) : (
                <span className="font-semibold text-white">{authorLabel}</span>
              )}

              {depth > 0 && (
                <span className="rounded-full bg-zinc-800/80 border border-zinc-700/60 px-2 py-0.5 text-[11px] text-zinc-400">
                  ↳ {replyLabel}
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-500">
              {new Date(comment.created_at).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>

        <p className="text-sm text-zinc-200 whitespace-pre-wrap">{comment.content}</p>

        {allowReplies && (
          <button
            type="button"
            onClick={() => setReplyOpen((value) => !value)}
            className="mt-3 text-xs font-semibold text-zinc-500 hover:text-red-400 transition"
          >
            {replyOpen ? "Cancelar resposta" : "Responder"}
          </button>
        )}

        {replyOpen && allowReplies && (
          <form onSubmit={handleReplySubmit} className="mt-4 space-y-3">
            <textarea
              value={replyText}
              onChange={(event) => setReplyText(event.target.value)}
              placeholder={`Responder a ${authorLabel}...`}
              className="ui-input min-h-[100px] resize-y"
              maxLength={1000}
            />

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-xs text-zinc-500">{replyText.length}/1000</span>

              <button
                type="submit"
                disabled={submitting || !replyText.trim()}
                className="ui-btn-primary px-4 py-2 text-xs"
              >
                Responder
              </button>
            </div>
          </form>
        )}

        {error && (
          <p className="mt-3 text-sm text-red-300">
            {error}
          </p>
        )}
      </div>

      {comment.replies?.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentNode
              key={reply.id}
              comment={reply}
              allowReplies={allowReplies}
              onSubmitComment={onSubmitComment}
              depth={depth + 1}
              parentUserLabel={authorLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ThreadedComments({
  comments = [],
  allowReplies = true,
  canComment = true,
  title = "Comentários",
  emptyText = "Nenhum comentário ainda.",
  topLevelPlaceholder = "Escreva um comentário...",
  disabledMessage = "Comentários desativados.",
  submitLabel = "Comentar",
  onSubmitComment,
}) {
  const [topLevelText, setTopLevelText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const tree = useMemo(() => buildTree(comments), [comments]);
  const hasComments = tree.length > 0;

  async function handleTopLevelSubmit(event) {
    event.preventDefault();

    const cleanText = topLevelText.trim();
    if (!cleanText) {
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await onSubmitComment({ content: cleanText, parentCommentId: null });
      setTopLevelText("");
    } catch (submitError) {
      setError(submitError?.response?.data?.error || submitError?.message || "Não foi possível enviar o comentário.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-base font-semibold text-zinc-200">{title}</h2>
        {hasComments && <span className="ui-pill">{comments.length}</span>}
        <div className="ui-divider" />
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {canComment ? (
        <form onSubmit={handleTopLevelSubmit} className={`${hasComments ? "mb-6" : "mb-2"} space-y-3`}>
          <textarea
            value={topLevelText}
            onChange={(event) => setTopLevelText(event.target.value)}
            placeholder={topLevelPlaceholder}
            className="ui-input min-h-[80px] resize-y"
            maxLength={1000}
          />

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>{topLevelText.length}/1000</span>
              {tree.length === 0 ? (
                <>
                  <span className="text-zinc-600">·</span>
                  <span className="text-zinc-500">{emptyText}</span>
                </>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={submitting || !topLevelText.trim()}
              className="ui-btn-primary px-4 py-2"
            >
              {submitLabel}
            </button>
          </div>

          {!allowReplies && (
            <p className="text-xs text-zinc-500">Respostas estão desativadas para este conteúdo.</p>
          )}
        </form>
      ) : (
        <div className="mb-6 rounded-2xl border border-dashed border-zinc-800 px-4 py-3 text-sm text-zinc-500">
          {disabledMessage}
        </div>
      )}

      <div className="space-y-3">
        {tree.length === 0 ? null : (
          tree.map((comment) => (
            <CommentNode
              key={comment.id}
              comment={comment}
              allowReplies={allowReplies}
              onSubmitComment={onSubmitComment}
            />
          ))
        )}
      </div>
    </div>
  );
}