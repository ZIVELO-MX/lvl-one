"use client";
import { use } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";

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

function ReputationBar({ value }: { value: number }) {
  const pct = ((value + 5) / 10) * 100;
  const color = value >= 3 ? "#A3C28F" : value >= 0 ? "var(--quest-gold-hi)" : "#C28F8F";
  const label = value >= 3 ? "Aliados" : value >= 1 ? "Amistosos" : value === 0 ? "Neutrales" : value >= -2 ? "Hostiles" : "Enemigos";
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 10, color: "var(--text-low)" }}>Reputación del grupo</span>
        <span style={{ fontSize: 10, color, fontWeight: 600 }}>{label} ({value > 0 ? "+" : ""}{value})</span>
      </div>
      <div style={{ height: 4, background: "var(--surface-lo)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.3s" }}/>
      </div>
    </div>
  );
}

interface Props { params: Promise<{ id: string }> }
export default function FactionsPage({ params }: Props) {
  const { id } = use(params);
  const { state } = useApp();
  const campaign = state.campaigns.find(c => c.id === id);

  if (!campaign) return null;

  const tabs = CAMPAIGN_TABS(campaign.id);
  const factions = campaign.factions ?? [];

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["LVL ONE", "Campañas", campaign.name || "Detalle", "Mundo", "Facciones"]}/>
      <div style={{ padding: "16px 32px 0", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 28, borderBottom: "1px solid var(--border-lo)", overflowX: "auto" }}>
          {tabs.map(tab => (
            <Link key={tab.href} href={tab.href} className="lo-btn lo-btn-ghost" style={{ padding: "8px 14px", fontSize: 13, borderRadius: "6px 6px 0 0", borderBottom: tab.href === `/campaigns/${campaign.id}/world` ? "2px solid var(--quest-gold-hi)" : "2px solid transparent", color: tab.href === `/campaigns/${campaign.id}/world` ? "var(--quest-gold-hi)" : "var(--text-mid)", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
              <Ico name={tab.icon} size={13}/> {tab.label}
            </Link>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href={`/campaigns/${campaign.id}/world`} className="lo-btn lo-btn-ghost" style={{ padding: "6px 10px" }}>
              <Ico name="arrowLeft" size={14}/>
            </Link>
            <h2 style={{ fontSize: 20, margin: 0 }}>Facciones <span style={{ fontSize: 14, color: "var(--text-low)", fontWeight: 400 }}>({factions.length})</span></h2>
          </div>
          <Link href={`/campaigns/${campaign.id}/world/factions/new`} className="lo-btn lo-btn-primary">
            <Ico name="plus" size={13}/> Nueva facción
          </Link>
        </div>

        {factions.length === 0 ? (
          <div className="lo-card" style={{ padding: 40, textAlign: "center" }}>
            <Ico name="flag" size={32} color="var(--text-low)"/>
            <p style={{ color: "var(--text-mid)", marginTop: 12, marginBottom: 16 }}>No hay facciones todavía.</p>
            <Link href={`/campaigns/${campaign.id}/world/factions/new`} className="lo-btn lo-btn-primary">Crear primera facción</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {factions.map(f => (
              <Link key={f.id} href={`/campaigns/${campaign.id}/world/factions/${f.id}`} style={{ textDecoration: "none" }}>
                <div className="lo-card" style={{ padding: 16, cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(214,168,79,0.1)", display: "grid", placeItems: "center", flexShrink: 0, border: "1px solid rgba(214,168,79,0.3)" }}>
                      <Ico name="flag" size={18} color="var(--quest-gold-hi)"/>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-hi)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name || "Sin nombre"}</div>
                      <div style={{ fontSize: 11, color: "var(--text-low)" }}>{f.relations.length} relaciones · {f.npcIds.length} NPCs</div>
                    </div>
                  </div>
                  {f.description && (
                    <p style={{ fontSize: 12, color: "var(--text-mid)", margin: "0 0 8px", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{f.description}</p>
                  )}
                  <ReputationBar value={f.playerReputation}/>
                  {f.tags.length > 0 && (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
                      {f.tags.slice(0, 3).map(t => <span key={t} className="lo-chip" style={{ fontSize: 10 }}>{t}</span>)}
                    </div>
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
