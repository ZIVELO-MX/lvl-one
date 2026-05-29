"use client";
import { useState, use } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { TopBar } from "@/components/layout/AppShell";
import { uid } from "@/lib/uid";
import { Ico } from "@/components/ui/icons";

interface Props { params: Promise<{ id: string }> }
export default function CampaignNotesPage({ params }: Props) {
  const { id } = use(params);
  const { state, dispatch } = useApp();
  const campaign = state.campaigns.find(c => c.id === id);
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isDmOnly, setIsDmOnly] = useState(true);

  if (!campaign) {
    return (
      <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
        <TopBar crumb={["LVL ONE", "Campañas", "No encontrada"]}/>
        <div style={{ padding: "40px 32px", textAlign: "center" }}>
          <h1 style={{ fontSize: 24 }}>Campaña no encontrada</h1>
          <Link href="/campaigns" className="lo-btn lo-btn-primary" style={{ marginTop: 16 }}>Volver</Link>
        </div>
      </main>
    );
  }

  const isDm = campaign.dmId === (state.user?.email ?? "local-user");

  const saveNote = () => {
    if (!title.trim() || !content.trim()) return;
    dispatch({
      type: "CAMPAIGN_NOTE_SAVE",
      campaignId: campaign.id,
      note: {
        id: uid(),
        title: title.trim(),
        content: content.trim(),
        isDmOnly,
      },
    });
    setShowNew(false);
    setTitle("");
    setContent("");
    setIsDmOnly(true);
  };

  const deleteNote = (noteId: string) => {
    const n = campaign.notes.find(x => x.id === noteId);
    if (!n) return;
    if (confirm(`¿Eliminar la nota "${n.title}"?`)) {
      dispatch({ type: "CAMPAIGN_NOTE_DELETE", campaignId: campaign.id, noteId });
    }
  };

  const visibleNotes = isDm ? campaign.notes : campaign.notes.filter(n => !n.isDmOnly);
  const sortedNotes = [...visibleNotes].sort((a, b) => b.updatedAt - a.updatedAt);

  const tabs = [
    { href: `/campaigns/${campaign.id}`, label: "Resumen", icon: "book" as const },
    { href: `/campaigns/${campaign.id}/players`, label: "Jugadores", icon: "users" as const },
    { href: `/campaigns/${campaign.id}/sessions`, label: "Sesiones", icon: "calendar" as const },
    { href: `/campaigns/${campaign.id}/npcs`, label: "NPCs", icon: "user" as const },
    { href: `/campaigns/${campaign.id}/quests`, label: "Quests", icon: "sword" as const },
    { href: `/campaigns/${campaign.id}/world`, label: "Mundo", icon: "globe" as const },
    { href: `/campaigns/${campaign.id}/combat`, label: "Combate", icon: "sword" as const },
    { href: `/campaigns/${campaign.id}/notes`, label: "Notas", icon: "scroll" as const },
  ];

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["LVL ONE", "Campañas", campaign.name || "Detalle", "Notas"]}/>
      <div style={{ padding: "16px 32px 0", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: campaign.coverColor, display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontSize: 22, color: "white" }}>
            {(campaign.name?.[0] ?? "?").toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22, margin: 0 }}>{campaign.name || "Campaña sin nombre"}</h1>
            <p style={{ color: "var(--text-mid)", fontSize: 13, margin: 0 }}>{campaign.setting || "Sin ambientación"}</p>
          </div>
          {isDm && (
            <button type="button" className="lo-btn lo-btn-primary" onClick={() => setShowNew(!showNew)}>
              <Ico name="plus" size={14}/> Nueva nota
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid rgba(244,231,197,0.08)" }}>
          {tabs.map(t => {
            const active = t.href === `/campaigns/${campaign.id}/notes`;
            return (
              <Link key={t.label} href={t.href} style={{ textDecoration: "none" }}>
                <div style={{ padding: "10px 16px", fontSize: 13, color: active ? "var(--text-hi)" : "var(--text-low)", borderBottom: active ? "2px solid var(--quest-gold-hi)" : "2px solid transparent", display: "flex", alignItems: "center", gap: 6 }}>
                  <Ico name={t.icon} size={13}/> {t.label}
                </div>
              </Link>
            );
          })}
        </div>

        {showNew && (
          <div className="lo-card" style={{ padding: 18, marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, marginBottom: 12 }}>Nueva nota</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "var(--text-mid)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Título</label>
                <input className="lo-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Título de la nota"/>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "var(--text-mid)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Contenido</label>
                <textarea className="lo-input" value={content} onChange={e => setContent(e.target.value)} rows={5} placeholder="Escribe aquí tus notas..." style={{ resize: "vertical" }}/>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" id="dm-only" checked={isDmOnly} onChange={e => setIsDmOnly(e.target.checked)} style={{ accentColor: "var(--quest-gold-hi)" }}/>
                <label htmlFor="dm-only" style={{ fontSize: 13, color: "var(--text-mid)", cursor: "pointer" }}>Solo visible para el DM</label>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
              <button type="button" className="lo-btn lo-btn-ghost" onClick={() => setShowNew(false)}>Cancelar</button>
              <button type="button" className="lo-btn lo-btn-primary" onClick={saveNote} disabled={!title.trim() || !content.trim()}>
                <Ico name="save" size={14}/> Guardar
              </button>
            </div>
          </div>
        )}

        {sortedNotes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Ico name="scroll" size={36} color="var(--text-low)"/>
            <p style={{ color: "var(--text-mid)", marginTop: 12 }}>No hay notas aún.</p>
            {isDm && <p style={{ color: "var(--text-low)", fontSize: 13 }}>Crea tu primera nota para guardar secretos e ideas.</p>}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sortedNotes.map(n => (
              <div key={n.id} className="lo-card" style={{ padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <h3 style={{ fontSize: 15, color: "var(--text-hi)", margin: 0 }}>{n.title}</h3>
                    {n.isDmOnly && <span className="lo-chip lo-chip-red" style={{ fontSize: 9 }}>DM only</span>}
                  </div>
                  {isDm && (
                    <button type="button" className="lo-btn lo-btn-ghost" onClick={() => deleteNote(n.id)} style={{ padding: "4px 8px", color: "var(--text-low)" }} title="Eliminar" aria-label={`Eliminar nota ${n.title}`}>
                      <Ico name="close" size={12}/>
                    </button>
                  )}
                </div>
                <p style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>{n.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
