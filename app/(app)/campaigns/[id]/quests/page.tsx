"use client";
import { use } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { QUEST_TYPE_LABEL, QUEST_STATUS_LABEL, QUEST_TYPE_COLOR, type QuestStatus, type QuestType } from "@/types/quest";

const STATUS_COLUMNS: { status: QuestStatus; label: string; color: string }[] = [
  { status: "available", label: "Disponible", color: "var(--arcane-blue-hi)" },
  { status: "active",    label: "Activa",      color: "var(--quest-gold-hi)" },
  { status: "completed", label: "Completada",  color: "#A3C28F" },
  { status: "failed",    label: "Fallida",     color: "#C28F8F" },
];

const CAMPAIGN_TABS = (id: string) => [
  { href: `/campaigns/${id}`, label: "Resumen", icon: "book" as const },
  { href: `/campaigns/${id}/players`, label: "Jugadores", icon: "users" as const },
  { href: `/campaigns/${id}/sessions`, label: "Sesiones", icon: "calendar" as const },
  { href: `/campaigns/${id}/npcs`, label: "NPCs", icon: "user" as const },
  { href: `/campaigns/${id}/quests`, label: "Quests", icon: "sword" as const },
  { href: `/campaigns/${id}/world`, label: "Mundo", icon: "globe" as const },
  { href: `/campaigns/${id}/combat`, label: "Combate", icon: "sword" as const },
    { href: `/campaigns/${id}/notes`, label: "Notas", icon: "scroll" as const },
];

interface Props { params: Promise<{ id: string }> }
export default function CampaignQuestsPage({ params }: Props) {
  const { id } = use(params);
  const { state, dispatch } = useApp();
  const campaign = state.campaigns.find(c => c.id === id);

  if (!campaign) {
    return (
      <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
        <TopBar crumb={["LVL ONE", "Campañas", "No encontrada"]}/>
        <div style={{ padding: "40px 32px", textAlign: "center" }}>
          <Link href="/campaigns" className="lo-btn lo-btn-primary">Volver</Link>
        </div>
      </main>
    );
  }

  const isDm = campaign.dmId === (state.user?.email ?? "local-user");
  const quests = campaign.quests ?? [];
  const tabs = CAMPAIGN_TABS(campaign.id);

  const moveStatus = (questId: string, status: QuestStatus) => {
    dispatch({ type: "QUEST_PATCH", campaignId: campaign.id, questId, patch: { status } });
  };

  const deleteQuest = (questId: string) => {
    const q = quests.find(x => x.id === questId);
    if (!q) return;
    if (confirm(`¿Eliminar la quest "${q.title}"?`)) {
      dispatch({ type: "QUEST_DELETE", campaignId: campaign.id, questId });
    }
  };

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["LVL ONE", "Campañas", campaign.name || "Detalle", "Quests"]}/>
      <div style={{ padding: "16px 32px 0", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: campaign.coverColor, display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontSize: 22, color: "white", flexShrink: 0 }}>
            {(campaign.name?.[0] ?? "?").toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22, margin: 0 }}>{campaign.name || "Campaña sin nombre"}</h1>
            <p style={{ color: "var(--text-mid)", fontSize: 13, margin: 0 }}>{campaign.setting || "Sin ambientación"}</p>
          </div>
          {isDm && (
            <Link href={`/campaigns/${campaign.id}/quests/new`} className="lo-btn lo-btn-primary">
              <Ico name="plus" size={14}/> Nueva quest
            </Link>
          )}
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid rgba(244,231,197,0.08)" }}>
          {tabs.map(t => {
            const active = t.href === `/campaigns/${campaign.id}/quests`;
            return (
              <Link key={t.label} href={t.href} style={{ textDecoration: "none" }}>
                <div style={{ padding: "10px 16px", fontSize: 13, color: active ? "var(--text-hi)" : "var(--text-low)", borderBottom: active ? "2px solid var(--quest-gold-hi)" : "2px solid transparent", display: "flex", alignItems: "center", gap: 6 }}>
                  <Ico name={t.icon} size={13}/> {t.label}
                </div>
              </Link>
            );
          })}
        </div>

        {quests.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Ico name="sword" size={36} color="var(--text-low)"/>
            <p style={{ color: "var(--text-mid)", marginTop: 12 }}>No hay quests en esta campaña.</p>
            {isDm && <p style={{ color: "var(--text-low)", fontSize: 13 }}>Crea la primera quest para empezar la aventura.</p>}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, alignItems: "start" }}>
            {STATUS_COLUMNS.map(col => {
              const colQuests = quests.filter(q => q.status === col.status);
              return (
                <div key={col.status}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, padding: "6px 0" }}>
                    <div style={{ width: 8, height: 8, borderRadius: 999, background: col.color, flexShrink: 0 }}/>
                    <span style={{ fontSize: 12, color: col.color, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {col.label}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-low)", marginLeft: "auto" }}>{colQuests.length}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {colQuests.map(q => (
                      <div key={q.id} className="lo-card" style={{ padding: 14, position: "relative" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6, gap: 8 }}>
                          <div>
                            <Link href={`/campaigns/${campaign.id}/quests/${q.id}`} style={{ textDecoration: "none" }}>
                              <span style={{ fontSize: 14, color: "var(--text-hi)", lineHeight: 1.3 }}>{q.title}</span>
                            </Link>
                            <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                              <span style={{ fontSize: 10, color: QUEST_TYPE_COLOR[q.type as QuestType], fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                {QUEST_TYPE_LABEL[q.type as QuestType]}
                              </span>
                            </div>
                          </div>
                          {isDm && (
                            <button
                              onClick={() => deleteQuest(q.id)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-low)", padding: 2, flexShrink: 0 }}
                              title="Eliminar"
                              aria-label={`Eliminar ${q.title}`}
                            >
                              <Ico name="close" size={11}/>
                            </button>
                          )}
                        </div>
                        {q.description && (
                          <p style={{ fontSize: 12, color: "var(--text-low)", margin: "0 0 8px", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>
                            {q.description}
                          </p>
                        )}
                        {q.objectives.length > 0 && (
                          <div style={{ fontSize: 11, color: "var(--text-low)", marginBottom: 8 }}>
                            {q.objectives.filter(o => o.completed).length}/{q.objectives.length} objetivos
                          </div>
                        )}
                        {isDm && (
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {STATUS_COLUMNS.filter(s => s.status !== col.status).map(s => (
                              <button key={s.status} onClick={() => moveStatus(q.id, s.status)} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(244,231,197,0.08)", color: s.color, cursor: "pointer" }}>
                                → {QUEST_STATUS_LABEL[s.status]}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
