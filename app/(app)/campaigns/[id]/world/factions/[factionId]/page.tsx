"use client";
import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { FACTION_RELATION_LABEL, type FactionRelationType } from "@/types/world";

const REP_LABELS = [
  { min: 4, label: "Aliados incondicionales", color: "#A3C28F" },
  { min: 2, label: "Amistosos", color: "#7EC882" },
  { min: 0, label: "Neutrales", color: "var(--quest-gold-hi)" },
  { min: -2, label: "Hostiles", color: "#C9956A" },
  { min: -5, label: "Enemigos jurados", color: "#C28F8F" },
];
function repLabel(v: number) { return REP_LABELS.find(r => v >= r.min) ?? REP_LABELS[REP_LABELS.length - 1]; }

interface Props { params: Promise<{ id: string; factionId: string }> }
export default function FactionDetailPage({ params }: Props) {
  const { id, factionId } = use(params);
  const router = useRouter();
  const { state, dispatch } = useApp();
  const campaign = state.campaigns.find(c => c.id === id);
  const faction = campaign?.factions?.find(f => f.id === factionId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(faction ?? null);
  const [newRelTarget, setNewRelTarget] = useState("");
  const [newRelType, setNewRelType] = useState<FactionRelationType>("neutral");

  if (!campaign || !faction || !draft) {
    return (
      <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
        <TopBar crumb={["LVL ONE", "Campañas", "Facción no encontrada"]}/>
        <div style={{ padding: "40px 32px", textAlign: "center" }}>
          <p style={{ color: "var(--text-mid)", marginBottom: 16 }}>Facción no encontrada.</p>
          <Link href={`/campaigns/${id}/world/factions`} className="lo-btn lo-btn-primary">Volver</Link>
        </div>
      </main>
    );
  }

  const isDm = campaign.dmId === (state.user?.email ?? "local-user");
  const rep = repLabel(faction.playerReputation);
  const linkedNpcs = (campaign.npcs ?? []).filter(n => faction.npcIds.includes(n.id));
  const otherFactions = (campaign.factions ?? []).filter(f => f.id !== faction.id);

  const save = () => {
    dispatch({ type: "FACTION_SAVE", campaignId: campaign.id, faction: draft });
    setEditing(false);
  };

  const del = () => {
    if (confirm(`¿Eliminar "${faction.name}"?`)) {
      dispatch({ type: "FACTION_DELETE", campaignId: campaign.id, factionId: faction.id });
      router.push(`/campaigns/${campaign.id}/world/factions`);
    }
  };

  const setRep = (v: number) => {
    const updated = { ...faction, playerReputation: v };
    dispatch({ type: "FACTION_SAVE", campaignId: campaign.id, faction: updated });
  };

  const addRelation = () => {
    if (!newRelTarget) return;
    const updated = {
      ...faction,
      relations: faction.relations.some(r => r.targetFactionId === newRelTarget)
        ? faction.relations.map(r => r.targetFactionId === newRelTarget ? { ...r, type: newRelType } : r)
        : [...faction.relations, { targetFactionId: newRelTarget, type: newRelType }],
    };
    dispatch({ type: "FACTION_SAVE", campaignId: campaign.id, faction: updated });
    setNewRelTarget("");
  };

  const removeRelation = (targetId: string) => {
    dispatch({ type: "FACTION_SAVE", campaignId: campaign.id, faction: { ...faction, relations: faction.relations.filter(r => r.targetFactionId !== targetId) } });
  };

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["LVL ONE", "Campañas", campaign.name || "Detalle", "Mundo", "Facciones", faction.name]}/>
      <div style={{ padding: "24px 32px 0", maxWidth: 780, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
          <Link href={`/campaigns/${campaign.id}/world/factions`} className="lo-btn lo-btn-ghost" style={{ padding: "6px 10px", flexShrink: 0 }}>
            <Ico name="arrowLeft" size={14}/>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: "rgba(214,168,79,0.12)", display: "grid", placeItems: "center", flexShrink: 0, border: "1px solid rgba(214,168,79,0.3)" }}>
              <Ico name="flag" size={22} color="var(--quest-gold-hi)"/>
            </div>
            <div style={{ flex: 1 }}>
              {editing
                ? <input className="lo-input" value={draft.name} onChange={e => setDraft(d => d ? { ...d, name: e.target.value } : d)} style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}/>
                : <h1 style={{ fontSize: 22, margin: "0 0 4px" }}>{faction.name || "Sin nombre"}</h1>
              }
              {faction.symbol && <p style={{ fontSize: 12, color: "var(--text-low)", margin: 0 }}>Símbolo: {faction.symbol}</p>}
            </div>
          </div>
          {isDm && (
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              {editing ? (
                <>
                  <button className="lo-btn lo-btn-ghost" onClick={() => { setDraft(faction); setEditing(false); }}>Cancelar</button>
                  <button className="lo-btn lo-btn-primary" onClick={save}><Ico name="check" size={13}/> Guardar</button>
                </>
              ) : (
                <>
                  <button className="lo-btn lo-btn-ghost" onClick={() => { setDraft({ ...faction }); setEditing(true); }}><Ico name="cog" size={13}/> Editar</button>
                  <button className="lo-btn lo-btn-ghost" onClick={del} style={{ color: "#C28F8F", padding: "6px 10px" }}><Ico name="trash" size={14}/></button>
                </>
              )}
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {/* Description + Goals */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="lo-card" style={{ padding: 18 }}>
              <h3 style={{ fontSize: 12, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Descripción</h3>
              {editing
                ? <textarea className="lo-input" rows={4} value={draft.description} onChange={e => setDraft(d => d ? { ...d, description: e.target.value } : d)} style={{ resize: "vertical" }}/>
                : <p style={{ fontSize: 14, color: "var(--text-mid)", margin: 0, lineHeight: 1.6 }}>{faction.description || "Sin descripción."}</p>
              }
            </div>
            <div className="lo-card" style={{ padding: 18 }}>
              <h3 style={{ fontSize: 12, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Objetivos</h3>
              {editing
                ? <textarea className="lo-input" rows={3} value={draft.goals ?? ""} onChange={e => setDraft(d => d ? { ...d, goals: e.target.value } : d)} style={{ resize: "vertical" }}/>
                : <p style={{ fontSize: 14, color: "var(--text-mid)", margin: 0, lineHeight: 1.5 }}>{faction.goals || "Sin objetivos definidos."}</p>
              }
            </div>
          </div>

          {/* Reputation + DM secrets */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="lo-card" style={{ padding: 18 }}>
              <h3 style={{ fontSize: 12, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Reputación del grupo</h3>
              <div style={{ textAlign: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: rep.color }}>{faction.playerReputation > 0 ? "+" : ""}{faction.playerReputation}</span>
                <p style={{ fontSize: 12, color: rep.color, margin: "2px 0 0", fontWeight: 500 }}>{rep.label}</p>
              </div>
              {isDm && (
                <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap" }}>
                  {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map(v => (
                    <button key={v} onClick={() => setRep(v)} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${faction.playerReputation === v ? rep.color : "var(--border-lo)"}`, background: faction.playerReputation === v ? `${rep.color}22` : "transparent", color: faction.playerReputation === v ? rep.color : "var(--text-mid)", fontSize: 11, cursor: "pointer", fontWeight: faction.playerReputation === v ? 700 : 400 }}>
                      {v > 0 ? `+${v}` : v}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {isDm && (
              <div className="lo-card" style={{ padding: 18, borderColor: "rgba(194,143,143,0.3)" }}>
                <h3 style={{ fontSize: 12, color: "#C28F8F", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                  <Ico name="lock" size={12}/> Secretos (solo DM)
                </h3>
                {editing
                  ? <textarea className="lo-input" rows={3} value={draft.secrets ?? ""} onChange={e => setDraft(d => d ? { ...d, secrets: e.target.value } : d)} style={{ resize: "vertical" }}/>
                  : <p style={{ fontSize: 13, color: "var(--text-mid)", margin: 0, lineHeight: 1.5 }}>{faction.secrets || "Sin secretos."}</p>
                }
              </div>
            )}
          </div>
        </div>

        {/* Relations */}
        <div className="lo-card" style={{ padding: 18, marginBottom: 16 }}>
          <h3 style={{ fontSize: 12, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
            Relaciones con otras facciones
          </h3>
          {faction.relations.length === 0 && <p style={{ fontSize: 13, color: "var(--text-low)", margin: "0 0 14px" }}>Sin relaciones definidas.</p>}
          {faction.relations.map(rel => {
            const target = campaign.factions?.find(f => f.id === rel.targetFactionId);
            if (!target) return null;
            const relRep = repLabel(target.playerReputation);
            return (
              <div key={rel.targetFactionId} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border-lo)" }}>
                <Ico name="flag" size={13} color="var(--quest-gold-hi)"/>
                <Link href={`/campaigns/${campaign.id}/world/factions/${target.id}`} style={{ flex: 1, fontSize: 14, color: "var(--text-hi)", textDecoration: "none", fontWeight: 500 }}>{target.name}</Link>
                <span style={{ fontSize: 12, color: relRep.color, fontWeight: 600, padding: "2px 8px", background: `${relRep.color}18`, borderRadius: 4 }}>{FACTION_RELATION_LABEL[rel.type]}</span>
                {isDm && (
                  <button onClick={() => removeRelation(rel.targetFactionId)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-low)", padding: "2px 4px" }}>
                    <Ico name="x" size={13}/>
                  </button>
                )}
              </div>
            );
          })}
          {isDm && otherFactions.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <select className="lo-input" value={newRelTarget} onChange={e => setNewRelTarget(e.target.value)} style={{ flex: 1, fontSize: 13 }}>
                <option value="">Seleccionar facción...</option>
                {otherFactions.filter(f => !faction.relations.some(r => r.targetFactionId === f.id)).map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              <select className="lo-input" value={newRelType} onChange={e => setNewRelType(e.target.value as FactionRelationType)} style={{ fontSize: 13 }}>
                {(Object.keys(FACTION_RELATION_LABEL) as FactionRelationType[]).map(t => (
                  <option key={t} value={t}>{FACTION_RELATION_LABEL[t]}</option>
                ))}
              </select>
              <button className="lo-btn lo-btn-ghost" onClick={addRelation} disabled={!newRelTarget}>
                <Ico name="plus" size={13}/>
              </button>
            </div>
          )}
        </div>

        {/* Linked NPCs */}
        {linkedNpcs.length > 0 && (
          <div className="lo-card" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 12, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>NPCs de esta facción</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {linkedNpcs.map(n => (
                <Link key={n.id} href={`/campaigns/${campaign.id}/npcs/${n.id}`} className="lo-chip" style={{ textDecoration: "none", fontSize: 12 }}>
                  <Ico name="user" size={11}/> {n.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
