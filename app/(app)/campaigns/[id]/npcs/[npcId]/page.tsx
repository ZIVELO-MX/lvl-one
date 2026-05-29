"use client";
import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { createNPC, updateNPC, deleteNPCFromAPI } from "@/lib/campaign-api";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { rememberNPC } from "@/data/npcStore";
import { DISPOSITION_LABEL, ALIGNMENT_LABEL, type NPCDisposition } from "@/types/npc";

const DISPOSITION_COLOR: Record<NPCDisposition, string> = {
  friendly: "#A3C28F",
  neutral: "var(--text-mid)",
  hostile: "#C28F8F",
  unknown: "var(--text-low)",
};

interface Props { params: Promise<{ id: string; npcId: string }> }
export default function NpcDetailPage({ params }: Props) {
  const { id, npcId } = use(params);
  const router = useRouter();
  const { state, dispatch } = useApp();
  const campaign = state.campaigns.find(c => c.id === id);
  const npc = campaign?.npcs?.find(n => n.id === npcId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(npc ?? null);
  const [memText, setMemText] = useState("");
  const [memSessionId, setMemSessionId] = useState("");

  if (!campaign || !npc || !draft) {
    return (
      <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
        <TopBar crumb={["LVL ONE", "Campañas", "NPC no encontrado"]}/>
        <div style={{ padding: "40px 32px", textAlign: "center" }}>
          <p style={{ color: "var(--text-mid)", marginBottom: 16 }}>NPC no encontrado.</p>
          <Link href={`/campaigns/${id}/npcs`} className="lo-btn lo-btn-primary">Volver a NPCs</Link>
        </div>
      </main>
    );
  }

  const isDm = campaign.dmId === (state.user?.email ?? "local-user");

  const saveEdits = () => {
    dispatch({ type: "NPC_SAVE", campaignId: campaign.id, npc: draft });
    setEditing(false);
  };

  const addMemory = () => {
    const text = memText.trim();
    if (!text) return;
    dispatch({
      type: "NPC_SAVE",
      campaignId: campaign.id,
      npc: rememberNPC(npc, { text, sessionId: memSessionId || undefined }),
    });
    setMemText("");
    setMemSessionId("");
  };

  const deleteMemory = (memId: string) => {
    dispatch({ type: "NPC_SAVE", campaignId: campaign.id, npc: { ...npc, memory: npc.memory.filter(m => m.id !== memId) } });
  };

  const deleteNpc = () => {
    if (confirm(`¿Eliminar a ${npc.name}?`)) {
      dispatch({ type: "NPC_DELETE", campaignId: campaign.id, npcId: npc.id });
      router.push(`/campaigns/${campaign.id}/npcs`);
    }
  };

  const field = (label: string, value: string | undefined, editNode?: React.ReactNode) => (
    value || editing ? (
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
        {editing && editNode ? editNode : <p style={{ fontSize: 14, color: "var(--text-hi)", margin: 0, lineHeight: 1.5 }}>{value || "—"}</p>}
      </div>
    ) : null
  );

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["LVL ONE", "Campañas", campaign.name || "Detalle", "NPCs", npc.name]}/>
      <div style={{ padding: "24px 32px 0", maxWidth: 780, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 28 }}>
          <Link href={`/campaigns/${campaign.id}/npcs`} className="lo-btn lo-btn-ghost" style={{ padding: "6px 10px", flexShrink: 0 }}>
            <Ico name="arrowLeft" size={14}/>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
            <div style={{ width: 56, height: 56, borderRadius: 999, background: `${DISPOSITION_COLOR[npc.disposition]}22`, display: "grid", placeItems: "center", border: `2px solid ${DISPOSITION_COLOR[npc.disposition]}66`, flexShrink: 0 }}>
              <Ico name="user" size={24} color={DISPOSITION_COLOR[npc.disposition]}/>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <h1 style={{ fontSize: 24, margin: 0 }}>{npc.name}</h1>
                {!npc.isAlive && <span className="lo-chip lo-chip-red" style={{ fontSize: 10 }}>Muerto</span>}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: DISPOSITION_COLOR[npc.disposition], fontWeight: 600 }}>{DISPOSITION_LABEL[npc.disposition]}</span>
                {npc.race && <span style={{ fontSize: 12, color: "var(--text-low)" }}>· {npc.race}</span>}
                {npc.occupation && <span style={{ fontSize: 12, color: "var(--text-low)" }}>· {npc.occupation}</span>}
                {npc.alignment && <span style={{ fontSize: 12, color: "var(--text-low)" }}>· {ALIGNMENT_LABEL[npc.alignment]}</span>}
              </div>
            </div>
          </div>
          {isDm && (
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              {editing ? (
                <>
                  <button type="button" className="lo-btn lo-btn-ghost" onClick={() => { setDraft(npc); setEditing(false); }}>Cancelar</button>
                  <button type="button" className="lo-btn lo-btn-primary" onClick={saveEdits}><Ico name="check" size={13}/> Guardar</button>
                </>
              ) : (
                <>
                  <button type="button" className="lo-btn lo-btn-ghost" onClick={() => { setDraft({ ...npc }); setEditing(true); }}>
                    <Ico name="cog" size={13}/> Editar
                  </button>
                  <button type="button" className="lo-btn lo-btn-ghost" onClick={() => dispatch({ type: "NPC_SAVE", campaignId: campaign.id, npc: { ...npc, isAlive: !npc.isAlive } })} style={{ fontSize: 12, color: "var(--text-low)" }}>
                    {npc.isAlive ? "Marcar muerto" : "Marcar vivo"}
                  </button>
                  <button type="button" className="lo-btn lo-btn-ghost" onClick={deleteNpc} style={{ color: "#C28F8F", padding: "6px 10px" }} title="Eliminar NPC">
                    <Ico name="trash" size={14}/>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Location */}
        {(npc.location || editing) && (
          <div className="lo-card" style={{ padding: "10px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <Ico name="compass" size={13} color="var(--text-low)"/>
            {editing ? (
              <input className="lo-input" value={draft.location ?? ""} onChange={e => setDraft(d => d ? { ...d, location: e.target.value } : d)} placeholder="Ubicación habitual" style={{ flex: 1 }}/>
            ) : (
              <span style={{ fontSize: 13, color: "var(--text-mid)" }}>{npc.location}</span>
            )}
          </div>
        )}

        {/* Main content */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
          <div className="lo-card" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 13, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Personalidad</h3>
            {editing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  ["Apariencia", "appearance"],
                  ["Personalidad", "personality"],
                  ["Ideales", "ideals"],
                  ["Vínculos", "bonds"],
                  ["Defectos", "flaws"],
                ].map(([lbl, key]) => (
                  <div key={key}>
                    <label style={{ fontSize: 11, color: "var(--text-low)", display: "block", marginBottom: 2 }}>{lbl}</label>
                    <textarea className="lo-input" rows={2} value={(draft as unknown as Record<string, string>)[key] ?? ""} onChange={e => setDraft(d => d ? { ...d, [key]: e.target.value } : d)} style={{ resize: "vertical", fontSize: 12 }}/>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {field("Apariencia", npc.appearance)}
                {field("Personalidad", npc.personality)}
                {field("Ideales", npc.ideals)}
                {field("Vínculos", npc.bonds)}
                {field("Defectos", npc.flaws)}
                {!npc.appearance && !npc.personality && !npc.ideals && !npc.bonds && !npc.flaws && (
                  <p style={{ color: "var(--text-low)", fontSize: 13 }}>Sin datos de personalidad.</p>
                )}
              </>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {isDm && (
              <div className="lo-card" style={{ padding: 18, borderColor: "rgba(194,143,143,0.3)" }}>
                <h3 style={{ fontSize: 13, color: "#C28F8F", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                  <Ico name="lock" size={12}/> Secretos (solo DM)
                </h3>
                {editing ? (
                  <textarea className="lo-input" rows={4} value={draft.secrets ?? ""} onChange={e => setDraft(d => d ? { ...d, secrets: e.target.value } : d)} style={{ resize: "vertical", fontSize: 13 }}/>
                ) : (
                  <p style={{ fontSize: 13, color: "var(--text-mid)", margin: 0, lineHeight: 1.5 }}>{npc.secrets || "Sin secretos definidos."}</p>
                )}
              </div>
            )}

            <div className="lo-card" style={{ padding: 18 }}>
              <h3 style={{ fontSize: 13, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Etiquetas</h3>
              {editing ? (
                <input className="lo-input" value={draft.tags.join(", ")} onChange={e => setDraft(d => d ? { ...d, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) } : d)} placeholder="Ej: aliado, comerciante"/>
              ) : npc.tags.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {npc.tags.map(tag => <span key={tag} className="lo-chip" style={{ fontSize: 11 }}>{tag}</span>)}
                </div>
              ) : (
                <p style={{ color: "var(--text-low)", fontSize: 13, margin: 0 }}>Sin etiquetas.</p>
              )}
            </div>
          </div>
        </div>

        {/* Backstory */}
        {(npc.backstory || editing) && (
          <div className="lo-card" style={{ padding: 18, marginBottom: 20 }}>
            <h3 style={{ fontSize: 13, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Historia</h3>
            {editing ? (
              <textarea className="lo-input" rows={5} value={draft.backstory ?? ""} onChange={e => setDraft(d => d ? { ...d, backstory: e.target.value } : d)} style={{ resize: "vertical" }}/>
            ) : (
              <p style={{ fontSize: 14, color: "var(--text-mid)", margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{npc.backstory}</p>
            )}
          </div>
        )}

        {/* Sessions appeared */}
        {npc.sessionIds.length > 0 && (
          <div className="lo-card" style={{ padding: 18, marginBottom: 20 }}>
            <h3 style={{ fontSize: 13, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
              <Ico name="calendar" size={12}/> Sesiones
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {npc.sessionIds.map(sid => {
                const s = campaign.sessions.find(x => x.id === sid);
                return s ? (
                  <Link key={sid} href={`/campaigns/${campaign.id}/sessions/${sid}`} className="lo-chip" style={{ textDecoration: "none" }}>
                    Sesión #{s.number}
                  </Link>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Memory */}
        <div className="lo-card" style={{ padding: 18, marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
            <Ico name="scroll" size={12}/> Memoria
          </h3>

          {/* Add memory form */}
          {isDm && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: npc.memory.length > 0 ? 18 : 0 }}>
              <textarea
                className="lo-input"
                rows={2}
                value={memText}
                onChange={e => setMemText(e.target.value)}
                placeholder="¿Qué recuerda este NPC? (acciones, promesas, ofensas...)"
                style={{ resize: "vertical", fontSize: 13 }}
              />
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {campaign.sessions.length > 0 && (
                  <select className="lo-input" value={memSessionId} onChange={e => setMemSessionId(e.target.value)} style={{ fontSize: 12, flex: 1 }}>
                    <option value="">Sin sesión asociada</option>
                    {campaign.sessions.map(s => (
                      <option key={s.id} value={s.id}>Sesión #{s.number}{s.title ? ` — ${s.title}` : ""}</option>
                    ))}
                  </select>
                )}
                <button type="button" className="lo-btn lo-btn-primary" onClick={addMemory} disabled={!memText.trim()} style={{ whiteSpace: "nowrap" }}>
                  <Ico name="plus" size={12}/> Agregar
                </button>
              </div>
            </div>
          )}

          {/* Memory list */}
          {npc.memory.length === 0 ? (
            <p style={{ color: "var(--text-low)", fontSize: 13, margin: 0 }}>Sin recuerdos registrados.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[...npc.memory].reverse().map(mem => {
                const session = mem.sessionId ? campaign.sessions.find(s => s.id === mem.sessionId) : null;
                return (
                  <div key={mem.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", background: "var(--surface-lo)", borderRadius: 8, borderLeft: "3px solid var(--arcane-blue-lo)" }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, color: "var(--text-hi)", margin: "0 0 4px", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{mem.text}</p>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {session && (
                          <Link href={`/campaigns/${campaign.id}/sessions/${session.id}`} className="lo-chip" style={{ fontSize: 10, textDecoration: "none" }}>
                            Sesión #{session.number}
                          </Link>
                        )}
                        <span style={{ fontSize: 11, color: "var(--text-low)" }}>
                          {new Date(mem.createdAt).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                    {isDm && (
                      <button type="button" onClick={() => deleteMemory(mem.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-low)", padding: "2px 4px", flexShrink: 0 }} title="Eliminar recuerdo">
                        <Ico name="trash" size={13}/>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
