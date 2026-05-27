"use client";
import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { newSession, type SessionStatus } from "@/types/campaign";

function sessionStatusLabel(s: SessionStatus) {
  switch (s) {
    case "scheduled": return "Planificada";
    case "in-progress": return "En curso";
    case "completed": return "Completada";
    case "cancelled": return "Cancelada";
  }
}

function sessionStatusChip(s: SessionStatus) {
  switch (s) {
    case "scheduled": return "lo-chip lo-chip-gold";
    case "in-progress": return "lo-chip lo-chip-green";
    case "completed": return "lo-chip";
    case "cancelled": return "lo-chip lo-chip-red";
  }
}

interface Props { params: Promise<{ id: string }> }
export default function CampaignSessionsPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { state, dispatch } = useApp();
  const campaign = state.campaigns.find(c => c.id === id);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));

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
  const nextNumber = campaign.sessions.length > 0 ? Math.max(...campaign.sessions.map(s => s.number)) + 1 : 1;
  const sorted = [...campaign.sessions].sort((a, b) => a.number - b.number);

  const createSession = () => {
    if (!newTitle.trim()) return;
    const session = newSession(campaign.id, nextNumber, {
      title: newTitle.trim(),
      date: newDate,
    });
    dispatch({ type: "SESSION_SAVE", campaignId: campaign.id, session });
    setShowNew(false);
    setNewTitle("");
    setNewDate(new Date().toISOString().slice(0, 10));
  };

  const deleteSession = (sessionId: string) => {
    const s = campaign.sessions.find(x => x.id === sessionId);
    if (!s) return;
    if (confirm(`¿Eliminar ${s.title}?`)) {
      dispatch({ type: "SESSION_DELETE", campaignId: campaign.id, sessionId });
    }
  };

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
      <TopBar crumb={["LVL ONE", "Campañas", campaign.name || "Detalle", "Sesiones"]}/>
      <div style={{ padding: "16px 32px 0", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: campaign.coverColor, display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontSize: 22, color: "white" }}>
            {(campaign.name?.[0] ?? "?").toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22, margin: 0 }}>{campaign.name || "Campaña sin nombre"}</h1>
            <p style={{ color: "var(--text-mid)", fontSize: 13, margin: 0 }}>{campaign.setting || "Sin ambientación"}</p>
          </div>
          {isDm && (
            <button className="lo-btn lo-btn-primary" onClick={() => setShowNew(!showNew)}>
              <Ico name="plus" size={14}/> Nueva sesión
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid rgba(244,231,197,0.08)" }}>
          {tabs.map(t => {
            const active = t.href === `/campaigns/${campaign.id}/sessions`;
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
            <h3 style={{ fontSize: 14, marginBottom: 12 }}>Nueva sesión #{nextNumber}</h3>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 11, color: "var(--text-mid)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Título</label>
                <input className="lo-input" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder={`Sesión ${nextNumber}`} onKeyDown={e => { if (e.key === "Enter") createSession(); }}/>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "var(--text-mid)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Fecha</label>
                <input type="date" className="lo-input" value={newDate} onChange={e => setNewDate(e.target.value)} style={{ padding: "8px 10px" }}/>
              </div>
              <button className="lo-btn lo-btn-primary" onClick={createSession} disabled={!newTitle.trim()}>
                Crear
              </button>
              <button className="lo-btn lo-btn-ghost" onClick={() => setShowNew(false)}>Cancelar</button>
            </div>
          </div>
        )}

        {sorted.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Ico name="calendar" size={36} color="var(--text-low)"/>
            <p style={{ color: "var(--text-mid)", marginTop: 12 }}>No hay sesiones aún.</p>
            {isDm && <p style={{ color: "var(--text-low)", fontSize: 13 }}>Crea la primera sesión para empezar.</p>}
          </div>
        ) : (
          <div style={{ position: "relative", paddingLeft: 24 }}>
            {/* Timeline line */}
            <div style={{ position: "absolute", left: 11, top: 0, bottom: 0, width: 2, background: "rgba(244,231,197,0.10)" }}/>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {sorted.map(s => (
                <div key={s.id} style={{ position: "relative", display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ position: "absolute", left: -19, top: 8, width: 12, height: 12, borderRadius: 999, background: s.status === "completed" ? "var(--quest-gold-hi)" : s.status === "in-progress" ? "#A3C28F" : "var(--text-low)", border: "2px solid var(--bg-dark)", zIndex: 1 }}/>
                  <div className="lo-card" style={{ flex: 1, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--text-hi)" }}>{s.title}</span>
                          <span className={sessionStatusChip(s.status)} style={{ fontSize: 10 }}>{sessionStatusLabel(s.status)}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-low)" }}>Sesión #{s.number} · {s.date}</div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="lo-btn lo-btn-ghost" onClick={() => router.push(`/campaigns/${campaign.id}/sessions/${s.id}`)} style={{ padding: "6px 12px", fontSize: 12 }}>
                          Ver detalle
                        </button>
                        {isDm && (
                          <button className="lo-btn lo-btn-ghost" onClick={() => deleteSession(s.id)} style={{ padding: "6px 10px", color: "var(--text-low)" }} title="Eliminar" aria-label={`Eliminar ${s.title}`}>
                            <Ico name="close" size={13}/>
                          </button>
                        )}
                      </div>
                    </div>
                    {s.summary && <p style={{ fontSize: 13, color: "var(--text-mid)", margin: 0, lineHeight: 1.4 }}>{s.summary}</p>}
                    {s.xpAwarded > 0 && (
                      <div style={{ marginTop: 8, fontSize: 12, color: "var(--quest-gold-hi)" }}>
                        <Ico name="sparkle" size={11}/> {s.xpAwarded} XP otorgados
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
