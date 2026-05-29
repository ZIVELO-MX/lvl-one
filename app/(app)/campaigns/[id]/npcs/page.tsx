"use client";
import { use } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { deleteNPCFromAPI } from "@/lib/campaign-api";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { DISPOSITION_LABEL, type NPCDisposition } from "@/types/npc";

const DISPOSITION_COLOR: Record<NPCDisposition, string> = {
  friendly: "#A3C28F",
  neutral: "var(--text-mid)",
  hostile: "#C28F8F",
  unknown: "var(--text-low)",
};

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
export default function CampaignNpcsPage({ params }: Props) {
  const { id } = use(params);
  const { state, dispatch } = useApp();
  const campaign = state.campaigns.find(c => c.id === id);

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
  const npcs = campaign.npcs ?? [];
  const tabs = CAMPAIGN_TABS(campaign.id);

  const deleteNpc = (npcId: string) => {
    const npc = npcs.find(n => n.id === npcId);
    if (!npc) return;
    if (confirm(`¿Eliminar a ${npc.name}?`)) {
      dispatch({ type: "NPC_DELETE", campaignId: campaign.id, npcId });
    }
  };

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["LVL ONE", "Campañas", campaign.name || "Detalle", "NPCs"]}/>
      <div style={{ padding: "16px 32px 0", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: campaign.coverColor, display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontSize: 22, color: "white", flexShrink: 0 }}>
            {(campaign.name?.[0] ?? "?").toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22, margin: 0 }}>{campaign.name || "Campaña sin nombre"}</h1>
            <p style={{ color: "var(--text-mid)", fontSize: 13, margin: 0 }}>{campaign.setting || "Sin ambientación"}</p>
          </div>
          {isDm && (
            <Link href={`/campaigns/${campaign.id}/npcs/new`} className="lo-btn lo-btn-primary">
              <Ico name="plus" size={14}/> Nuevo NPC
            </Link>
          )}
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid rgba(244,231,197,0.08)" }}>
          {tabs.map(t => {
            const active = t.href === `/campaigns/${campaign.id}/npcs`;
            return (
              <Link key={t.label} href={t.href} style={{ textDecoration: "none" }}>
                <div style={{ padding: "10px 16px", fontSize: 13, color: active ? "var(--text-hi)" : "var(--text-low)", borderBottom: active ? "2px solid var(--quest-gold-hi)" : "2px solid transparent", display: "flex", alignItems: "center", gap: 6 }}>
                  <Ico name={t.icon} size={13}/> {t.label}
                </div>
              </Link>
            );
          })}
        </div>

        {npcs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Ico name="user" size={36} color="var(--text-low)"/>
            <p style={{ color: "var(--text-mid)", marginTop: 12 }}>No hay NPCs en esta campaña.</p>
            {isDm && <p style={{ color: "var(--text-low)", fontSize: 13 }}>Crea el primer NPC para darle vida al mundo.</p>}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {npcs.map(npc => (
              <Link key={npc.id} href={`/campaigns/${campaign.id}/npcs/${npc.id}`} style={{ textDecoration: "none" }}>
                <div className="lo-card-elev" style={{ padding: 18, cursor: "pointer", position: "relative" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 999, background: `${DISPOSITION_COLOR[npc.disposition]}22`, display: "grid", placeItems: "center", flexShrink: 0, border: `1px solid ${DISPOSITION_COLOR[npc.disposition]}44` }}>
                      <Ico name="user" size={18} color={DISPOSITION_COLOR[npc.disposition]}/>
                    </div>
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <span style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "var(--text-hi)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{npc.name || "Sin nombre"}</span>
                        {!npc.isAlive && <span className="lo-chip lo-chip-red" style={{ fontSize: 9, flexShrink: 0 }}>Muerto</span>}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-low)" }}>
                        {[npc.race, npc.occupation].filter(Boolean).join(" · ") || "Sin definir"}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: DISPOSITION_COLOR[npc.disposition], fontWeight: 600, letterSpacing: "0.04em" }}>
                      {DISPOSITION_LABEL[npc.disposition]}
                    </span>
                    {npc.location && (
                      <span style={{ fontSize: 11, color: "var(--text-low)" }}>
                        <Ico name="compass" size={10}/> {npc.location}
                      </span>
                    )}
                  </div>
                  {npc.tags.length > 0 && (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
                      {npc.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="lo-chip" style={{ fontSize: 9 }}>{tag}</span>
                      ))}
                    </div>
                  )}
                  {isDm && (
                    <button type="button"
                      onClick={e => { e.preventDefault(); deleteNpc(npc.id); }}
                      style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", cursor: "pointer", color: "var(--text-low)", padding: 4 }}
                      title="Eliminar NPC"
                      aria-label={`Eliminar ${npc.name}`}
                    >
                      <Ico name="close" size={12}/>
                    </button>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
