"use client";
import { useState, use } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { type SessionStatus } from "@/types/campaign";

interface Props { params: Promise<{ id: string; sessionId: string }> }
export default function SessionDetailPage({ params }: Props) {
  const { id, sessionId } = use(params);
  const { state, dispatch } = useApp();
  const campaign = state.campaigns.find(c => c.id === id);
  const session = campaign?.sessions.find(s => s.id === sessionId);
  const [editing, setEditing] = useState(false);
  const [summary, setSummary] = useState(session?.summary ?? "");
  const [loot, setLoot] = useState(session?.loot ?? "");
  const [xp, setXp] = useState(session?.xpAwarded ?? 0);
  const [npcsText, setNpcsText] = useState(session?.npcs.join(", ") ?? "");
  const [status, setStatus] = useState<SessionStatus>(session?.status ?? "scheduled");

  if (!campaign || !session) {
    return (
      <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
        <TopBar crumb={["LVL ONE", "Campañas", "No encontrada"]}/>
        <div style={{ padding: "40px 32px", textAlign: "center" }}>
          <h1 style={{ fontSize: 24 }}>Sesión no encontrada</h1>
          <Link href={`/campaigns/${id}/sessions`} className="lo-btn lo-btn-primary" style={{ marginTop: 16 }}>Volver a sesiones</Link>
        </div>
      </main>
    );
  }

  const isDm = campaign.dmId === (state.user?.email ?? "local-user");

  const save = () => {
    dispatch({
      type: "SESSION_PATCH",
      campaignId: campaign.id,
      sessionId: session.id,
      patch: {
        summary: summary.trim(),
        loot: loot.trim(),
        xpAwarded: xp,
        npcs: npcsText.split(",").map(s => s.trim()).filter(Boolean),
        status,
      },
    });
    setEditing(false);
  };

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["LVL ONE", "Campañas", campaign.name || "Detalle", `Sesión ${session.number}`]}/>
      <div style={{ padding: "16px 32px 0", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 26, margin: 0 }}>{session.title}</h1>
              <span className={`lo-chip ${status === "completed" ? "" : status === "in-progress" ? "lo-chip-green" : "lo-chip-gold"}`}>
                {status === "scheduled" ? "Planificada" : status === "in-progress" ? "En curso" : status === "completed" ? "Completada" : "Cancelada"}
              </span>
            </div>
            <p style={{ color: "var(--text-mid)", fontSize: 13, margin: 0 }}>Campaña: {campaign.name} · Sesión #{session.number} · {session.date}</p>
          </div>
          {isDm && !editing && (
            <button type="button" className="lo-btn lo-btn-primary" onClick={() => setEditing(true)}>
              <Ico name="pencil" size={13}/> Editar
            </button>
          )}
        </div>

        {editing ? (
          <div className="lo-card" style={{ padding: 20, marginBottom: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <span id="session-status-label" style={{ display: "block", fontSize: 12, color: "var(--text-mid)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Estado</span>
                <div role="group" aria-labelledby="session-status-label" style={{ display: "flex", gap: 8 }}>
                  {(["scheduled", "in-progress", "completed", "cancelled"] as SessionStatus[]).map(s => (
                    <button type="button" key={s} onClick={() => setStatus(s)} aria-pressed={status === s} className={`lo-btn ${status === s ? "lo-btn-primary" : "lo-btn-ghost"}`} style={{ padding: "6px 12px", fontSize: 12 }}>
                      {s === "scheduled" ? "Planificada" : s === "in-progress" ? "En curso" : s === "completed" ? "Completada" : "Cancelada"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="session-summary" style={{ display: "block", fontSize: 12, color: "var(--text-mid)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Resumen</label>
                <textarea id="session-summary" className="lo-input" value={summary} onChange={e => setSummary(e.target.value)} rows={4} placeholder="Qué ocurrió en esta sesión..." style={{ resize: "vertical" }}/>
              </div>
              <div>
                <label htmlFor="session-npcs" style={{ display: "block", fontSize: 12, color: "var(--text-mid)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>NPCs presentes</label>
                <input id="session-npcs" className="lo-input" value={npcsText} onChange={e => setNpcsText(e.target.value)} placeholder="Nombres separados por comas"/>
              </div>
              <div>
                <label htmlFor="session-loot" style={{ display: "block", fontSize: 12, color: "var(--text-mid)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Loot / Recompensas</label>
                <textarea id="session-loot" className="lo-input" value={loot} onChange={e => setLoot(e.target.value)} rows={2} placeholder="Tesoros, objetos, recompensas..." style={{ resize: "vertical" }}/>
              </div>
              <div>
                <label htmlFor="session-xp" style={{ display: "block", fontSize: 12, color: "var(--text-mid)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>XP otorgados</label>
                <input id="session-xp" type="number" className="lo-input" value={xp} onChange={e => setXp(Number(e.target.value))} min={0}/>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
              <button type="button" className="lo-btn lo-btn-ghost" onClick={() => setEditing(false)}>Cancelar</button>
              <button type="button" className="lo-btn lo-btn-primary" onClick={save}>
                <Ico name="save" size={14}/> Guardar cambios
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="lo-card" style={{ padding: 20, marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, marginBottom: 10 }}>Resumen</h2>
              {session.summary ? (
                <p style={{ fontSize: 14, color: "var(--text-mid)", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>{session.summary}</p>
              ) : (
                <p style={{ fontSize: 14, color: "var(--text-low)", fontStyle: "italic", margin: 0 }}>Sin resumen todavía.</p>
              )}
            </div>

            {/* NPCs */}
            {session.npcs.length > 0 && (
              <div className="lo-card" style={{ padding: 20, marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, marginBottom: 10 }}>NPCs presentes</h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {session.npcs.map(n => (
                    <span key={n} className="lo-chip" style={{ fontSize: 12 }}>{n}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Loot */}
            {session.loot && (
              <div className="lo-card" style={{ padding: 20, marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, marginBottom: 10 }}>Loot / Recompensas</h2>
                <p style={{ fontSize: 14, color: "var(--text-mid)", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>{session.loot}</p>
              </div>
            )}

            {/* XP */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              <div className="lo-card-elev" style={{ padding: 20 }}>
                <div style={{ fontSize: 11, color: "var(--text-low)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>XP otorgados</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--quest-gold-hi)" }}>{session.xpAwarded}</div>
              </div>
              <div className="lo-card-elev" style={{ padding: 20 }}>
                <div style={{ fontSize: 11, color: "var(--text-low)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Decisiones</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--text-hi)" }}>{session.decisions.length}</div>
              </div>
            </div>
          </>
        )}

        <div style={{ marginTop: 20 }}>
          <Link href={`/campaigns/${campaign.id}/sessions`} className="lo-btn lo-btn-ghost">
            <span style={{ display: "inline-flex", transform: "rotate(180deg)" }}><Ico name="arrow" size={13}/></span> Volver a sesiones
          </Link>
        </div>
      </div>
    </main>
  );
}
