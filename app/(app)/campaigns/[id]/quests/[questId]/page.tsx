"use client";
import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { QUEST_TYPE_LABEL, QUEST_STATUS_LABEL, QUEST_TYPE_COLOR, type QuestStatus, type QuestType } from "@/types/quest";

const STATUS_OPTIONS: { value: QuestStatus; label: string; color: string }[] = [
  { value: "available", label: "Disponible", color: "var(--arcane-blue-hi)" },
  { value: "active",    label: "Activa",     color: "var(--quest-gold-hi)" },
  { value: "completed", label: "Completada", color: "#A3C28F" },
  { value: "failed",    label: "Fallida",    color: "#C28F8F" },
];

const STATUS_CHIP: Record<QuestStatus, string> = {
  available: "lo-chip",
  active: "lo-chip lo-chip-gold",
  completed: "lo-chip lo-chip-green",
  failed: "lo-chip lo-chip-red",
};

interface Props { params: Promise<{ id: string; questId: string }> }
export default function QuestDetailPage({ params }: Props) {
  const { id, questId } = use(params);
  const router = useRouter();
  const { state, dispatch } = useApp();
  const campaign = state.campaigns.find(c => c.id === id);
  const quest = campaign?.quests?.find(q => q.id === questId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(quest ?? null);

  if (!campaign || !quest || !draft) {
    return (
      <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
        <TopBar crumb={["LVL ONE", "Campañas", "Quest no encontrada"]}/>
        <div style={{ padding: "40px 32px", textAlign: "center" }}>
          <p style={{ color: "var(--text-mid)", marginBottom: 16 }}>Quest no encontrada.</p>
          <Link href={`/campaigns/${id}/quests`} className="lo-btn lo-btn-primary">Volver a Quests</Link>
        </div>
      </main>
    );
  }

  const isDm = campaign.dmId === (state.user?.email ?? "local-user");

  const saveEdits = () => {
    dispatch({ type: "QUEST_SAVE", campaignId: campaign.id, quest: draft });
    setEditing(false);
  };

  const toggleObjective = (objId: string) => {
    const updated = {
      ...quest,
      objectives: quest.objectives.map(o => o.id === objId ? { ...o, completed: !o.completed } : o),
    };
    dispatch({ type: "QUEST_SAVE", campaignId: campaign.id, quest: updated });
  };

  const setStatus = (status: QuestStatus) => {
    dispatch({ type: "QUEST_PATCH", campaignId: campaign.id, questId: quest.id, patch: { status } });
  };

  const deleteQuest = () => {
    if (confirm(`¿Eliminar "${quest.title}"?`)) {
      dispatch({ type: "QUEST_DELETE", campaignId: campaign.id, questId: quest.id });
      router.push(`/campaigns/${campaign.id}/quests`);
    }
  };

  const completedCount = quest.objectives.filter(o => o.completed).length;

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["LVL ONE", "Campañas", campaign.name || "Detalle", "Quests", quest.title]}/>
      <div style={{ padding: "24px 32px 0", maxWidth: 820, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
          <Link href={`/campaigns/${campaign.id}/quests`} className="lo-btn lo-btn-ghost" style={{ padding: "6px 10px", flexShrink: 0 }}>
            <Ico name="arrowLeft" size={14}/>
          </Link>
          <div style={{ flex: 1 }}>
            {editing ? (
              <input className="lo-input" value={draft.title} onChange={e => setDraft(d => d ? { ...d, title: e.target.value } : d)} style={{ fontSize: 22, fontFamily: "var(--font-display)", marginBottom: 8 }}/>
            ) : (
              <h1 style={{ fontSize: 24, margin: "0 0 8px" }}>{quest.title}</h1>
            )}
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: QUEST_TYPE_COLOR[quest.type as QuestType], fontWeight: 600 }}>
                {QUEST_TYPE_LABEL[quest.type as QuestType]}
              </span>
              <span className={STATUS_CHIP[quest.status]} style={{ fontSize: 11 }}>{QUEST_STATUS_LABEL[quest.status]}</span>
              {quest.timeLimit && (
                <span style={{ fontSize: 12, color: "var(--text-low)" }}>
                  <Ico name="calendar" size={11}/> {quest.timeLimit}
                </span>
              )}
            </div>
          </div>
          {isDm && (
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              {editing ? (
                <>
                  <button className="lo-btn lo-btn-ghost" onClick={() => { setDraft({ ...quest }); setEditing(false); }}>Cancelar</button>
                  <button className="lo-btn lo-btn-primary" onClick={saveEdits}><Ico name="check" size={13}/> Guardar</button>
                </>
              ) : (
                <>
                  <button className="lo-btn lo-btn-ghost" onClick={() => { setDraft({ ...quest }); setEditing(true); }}>
                    <Ico name="cog" size={13}/> Editar
                  </button>
                  <button className="lo-btn lo-btn-ghost" onClick={deleteQuest} style={{ color: "#C28F8F", padding: "6px 10px" }} title="Eliminar quest">
                    <Ico name="trash" size={14}/>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Status changer */}
        {isDm && !editing && (
          <div className="lo-card" style={{ padding: "10px 16px", marginBottom: 20, display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-low)", marginRight: 4 }}>Estado:</span>
            {STATUS_OPTIONS.map(s => (
              <button key={s.value} onClick={() => setStatus(s.value)} style={{ fontSize: 11, padding: "4px 12px", borderRadius: 20, border: `1px solid ${s.value === quest.status ? s.color : "rgba(244,231,197,0.1)"}`, background: s.value === quest.status ? `${s.color}22` : "transparent", color: s.value === quest.status ? s.color : "var(--text-low)", cursor: "pointer", transition: "all .12s" }}>
                {s.label}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Description */}
            <div className="lo-card" style={{ padding: 18 }}>
              <h3 style={{ fontSize: 13, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Descripción</h3>
              {editing ? (
                <textarea className="lo-input" rows={4} value={draft.description} onChange={e => setDraft(d => d ? { ...d, description: e.target.value } : d)} style={{ resize: "vertical" }}/>
              ) : (
                <p style={{ fontSize: 14, color: "var(--text-mid)", margin: 0, lineHeight: 1.6 }}>{quest.description || "Sin descripción."}</p>
              )}
            </div>

            {/* Objectives */}
            <div className="lo-card" style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontSize: 13, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
                  Objetivos {quest.objectives.length > 0 && `(${completedCount}/${quest.objectives.length})`}
                </h3>
              </div>
              {quest.objectives.length === 0 ? (
                <p style={{ color: "var(--text-low)", fontSize: 13, margin: 0 }}>Sin objetivos definidos.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {quest.objectives.map(obj => (
                    <div key={obj.id} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <input type="checkbox" checked={obj.completed} onChange={() => toggleObjective(obj.id)} style={{ marginTop: 2, accentColor: "var(--quest-gold-hi)", cursor: "pointer", flexShrink: 0 }}/>
                      <span style={{ fontSize: 14, color: obj.completed ? "var(--text-low)" : "var(--text-hi)", textDecoration: obj.completed ? "line-through" : "none", lineHeight: 1.4 }}>
                        {obj.description}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Reward */}
            <div className="lo-card" style={{ padding: 16 }}>
              <h3 style={{ fontSize: 12, color: "var(--quest-gold-hi)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                <Ico name="sparkle" size={11}/> Recompensa
              </h3>
              {editing ? (
                <input className="lo-input" value={draft.reward} onChange={e => setDraft(d => d ? { ...d, reward: e.target.value } : d)} placeholder="Ej: 500 PO, espada mágica"/>
              ) : (
                <p style={{ fontSize: 13, color: "var(--text-hi)", margin: 0 }}>{quest.reward || "Sin definir"}</p>
              )}
            </div>

            {/* Consequences */}
            <div className="lo-card" style={{ padding: 16 }}>
              <h3 style={{ fontSize: 12, color: "#C28F8F", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Consecuencias
              </h3>
              {editing ? (
                <textarea className="lo-input" rows={3} value={draft.consequences} onChange={e => setDraft(d => d ? { ...d, consequences: e.target.value } : d)} style={{ resize: "vertical", fontSize: 13 }}/>
              ) : (
                <p style={{ fontSize: 13, color: "var(--text-mid)", margin: 0, lineHeight: 1.4 }}>{quest.consequences || "Sin consecuencias definidas."}</p>
              )}
            </div>

            {/* Notes */}
            <div className="lo-card" style={{ padding: 16 }}>
              <h3 style={{ fontSize: 12, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Notas DM</h3>
              {editing ? (
                <textarea className="lo-input" rows={4} value={draft.notes} onChange={e => setDraft(d => d ? { ...d, notes: e.target.value } : d)} style={{ resize: "vertical", fontSize: 13 }}/>
              ) : (
                <p style={{ fontSize: 13, color: "var(--text-mid)", margin: 0, lineHeight: 1.4 }}>{quest.notes || "Sin notas."}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
