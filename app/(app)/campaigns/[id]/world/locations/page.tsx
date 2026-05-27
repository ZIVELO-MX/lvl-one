"use client";
import { use } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { LOCATION_TYPE_LABEL, LOCATION_TYPE_ICON } from "@/types/world";

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
export default function LocationsPage({ params }: Props) {
  const { id } = use(params);
  const { state } = useApp();
  const campaign = state.campaigns.find(c => c.id === id);

  if (!campaign) return null;

  const tabs = CAMPAIGN_TABS(campaign.id);
  const locations = campaign.locations ?? [];

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["LVL ONE", "Campañas", campaign.name || "Detalle", "Mundo", "Ubicaciones"]}/>
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
            <h2 style={{ fontSize: 20, margin: 0 }}>Ubicaciones <span style={{ fontSize: 14, color: "var(--text-low)", fontWeight: 400 }}>({locations.length})</span></h2>
          </div>
          <Link href={`/campaigns/${campaign.id}/world/locations/new`} className="lo-btn lo-btn-primary">
            <Ico name="plus" size={13}/> Nueva ubicación
          </Link>
        </div>

        {locations.length === 0 ? (
          <div className="lo-card" style={{ padding: 40, textAlign: "center" }}>
            <Ico name="compass" size={32} color="var(--text-low)"/>
            <p style={{ color: "var(--text-mid)", marginTop: 12, marginBottom: 16 }}>No hay ubicaciones todavía.</p>
            <Link href={`/campaigns/${campaign.id}/world/locations/new`} className="lo-btn lo-btn-primary">Crear primera ubicación</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {locations.map(loc => (
              <Link key={loc.id} href={`/campaigns/${campaign.id}/world/locations/${loc.id}`} style={{ textDecoration: "none" }}>
                <div className="lo-card" style={{ padding: 16, cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--arcane-blue-lo)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                      <Ico name={LOCATION_TYPE_ICON[loc.type]} size={18} color="var(--arcane-blue-hi)"/>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-hi)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{loc.name || "Sin nombre"}</div>
                      <div style={{ fontSize: 11, color: "var(--arcane-blue-hi)", fontWeight: 500 }}>{LOCATION_TYPE_LABEL[loc.type]}</div>
                    </div>
                    {loc.pin && <Ico name="pin" size={12} color="#A3C28F"/>}
                  </div>
                  {loc.description && (
                    <p style={{ fontSize: 12, color: "var(--text-mid)", margin: "0 0 8px", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{loc.description}</p>
                  )}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {loc.npcIds.length > 0 && <span className="lo-chip" style={{ fontSize: 10 }}>{loc.npcIds.length} NPC{loc.npcIds.length !== 1 ? "s" : ""}</span>}
                    {loc.questIds.length > 0 && <span className="lo-chip" style={{ fontSize: 10 }}>{loc.questIds.length} quest{loc.questIds.length !== 1 ? "s" : ""}</span>}
                    {loc.factionIds.length > 0 && <span className="lo-chip" style={{ fontSize: 10 }}>{loc.factionIds.length} facción</span>}
                    {loc.tags.slice(0, 2).map(t => <span key={t} className="lo-chip" style={{ fontSize: 10 }}>{t}</span>)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
