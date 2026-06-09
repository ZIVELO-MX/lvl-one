"use client";
import { useEffect, useState, useRef } from "react";
import { Ico } from "@/components/ui/icons";
import { useApp } from "@/lib/store";
import type { Comment } from "@/types/social";

interface Props {
  campaignId: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

export function CommentThread({ campaignId }: Props) {
  const { state } = useApp();
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`/api/comments?campaignId=${campaignId}`)
      .then(r => r.ok ? r.json() : { comments: [] })
      .then(d => setComments(d.comments ?? d ?? []))
      .finally(() => setLoading(false));
  }, [campaignId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, body: body.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments(c => [...c, data.comment ?? data]);
        setBody("");
      }
    } finally { setSending(false); }
  }

  async function deleteComment(id: string) {
    const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
    if (res.ok) setComments(c => c.filter(x => x.id !== id));
  }

  return (
    <div>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-hi)", marginBottom: 14, display: "flex", alignItems: "center", gap: 7 }}>
        <Ico name="message" size={15}/>
        Comentarios {comments.length > 0 && <span style={{ fontSize: 12, color: "var(--text-low)" }}>({comments.length})</span>}
      </h3>

      {loading ? (
        <div className="lo-skeleton" style={{ height: 60, borderRadius: 8 }}/>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {comments.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--text-low)" }}>Sin comentarios todavía.</p>
          )}
          {comments.map(c => (
            <div key={c.id} style={{
              padding: "10px 14px", borderRadius: 8,
              background: "rgba(255,255,255,0.03)", border: "1px solid var(--line)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg, var(--quest-gold-lo), var(--arcane-blue))", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, color: "var(--text-hi)" }}>
                    {c.author?.username?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-hi)" }}>@{c.author?.username ?? "usuario"}</span>
                  <span style={{ fontSize: 11, color: "var(--text-low)" }}>{timeAgo(c.createdAt)}</span>
                </div>
                {(state.user?.id === c.userId) && (
                  <button
                    type="button"
                    onClick={() => deleteComment(c.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-low)", padding: 4 }}
                  >
                    <Ico name="trash" size={12}/>
                  </button>
                )}
              </div>
              <p style={{ fontSize: 13, color: "var(--text-mid)", margin: 0, lineHeight: 1.5 }}>{c.body}</p>
            </div>
          ))}
        </div>
      )}

      {state.user && (
        <form onSubmit={submit} style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea
            ref={inputRef}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Escribe un comentario..."
            rows={2}
            style={{
              flex: 1, resize: "none", background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--line)", borderRadius: 8, padding: "8px 12px",
              fontSize: 13, color: "var(--text-hi)", outline: "none",
              fontFamily: "inherit",
            }}
          />
          <button
            type="submit"
            disabled={!body.trim() || sending}
            className="lo-btn lo-btn-primary"
            style={{ padding: "8px 14px", flexShrink: 0 }}
          >
            <Ico name="arrow" size={13}/>
          </button>
        </form>
      )}
    </div>
  );
}
