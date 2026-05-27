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
  { href: `/campaigns/${id}/notes`, label: "Notas", icon: "scroll" as const },
];

interface Props { params: Promise<{ id: string }> }
export default function WorldHubPage({ params }: Props) {
  const { id } = use(params);
  const { state } = useApp();
  const campaign = state.campaigns.find(c => c.id === id);

  if (!campaign) {
    return (
      <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
        <TopBar crumb={["LVL ONE", "Campañas", "No encontrada"]}/>
        <div style={{ padding: "40px 32px", textAlign: "center" }}>
          <p style={{ color: "var(--text-mid)" }}>Campaña no encontrada.</p>
          <Link href="/campaigns" className="lo-btn lo-btn-primary" style={{ marginTop: 16 }}>Volver</Link>
        </div>
      </main>
    );
  }

  const tabs = CAMPAIGN_TABS(campaign.id);
  const locations = campaign.locations ?? [];
  const factions = campaign.factions ?? [];
  const lore = campaign.worldLore ?? [];
  const pinsCount = locations.filter(l => l.pin).length;

  const sections = [
    {
      href: `/campaigns/${campaign.id}/world/locations`,
      label: "Ubicaciones",
      count: locations.length,
      icon: "compass" as const,
      description: "Ciudades, mazmorras, ruinas y más",
      color: "var(--arcane-blue-hi)",
    },
    {
      href: `/campaigns/${campaign.id}/world/factions`,
      label: "Facciones",
      count: factions.length,
      icon: "flag" as const,
      description: "Gremios, reinos, cultos y organizaciones",
      color: "var(--quest-gold-hi)",
    },
    {
      href: `/campaigns/${campaign.id}/world/lore`,
      label: "Lore",
      count: lore.length,
      icon: "scroll" as const,
      description: "Historia, religión, leyendas y magia",
      color: "#A3C28F",
    },
    {
      href: `/campaigns/${campaign.id}/world/map`,
      label: "Mapa",
      count: pinsCount,
      icon: "map" as const,
      description: `${pinsCount} ubicación${pinsCount !== 1 ? "es" : ""} en el mapa`,
      color: "#C28FA3",
    },
  ];

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["LVL ONE", "Campañas", campaign.name || "Detalle", "Mundo"]}/>
      <div style={{ padding: "16px 32px 0", maxWidth: 900, margin: "0 auto" }}>
        {/* Campaign tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 28, borderBottom: "1px solid var(--border-lo)", paddingBottom: 0, overflowX: "auto" }}>
          {tabs.map(tab => (
            <Link key={tab.href} href={tab.href} className="lo-btn lo-btn-ghost" style={{ padding: "8px 14px", fontSize: 13, borderRadius: "6px 6px 0 0", borderBottom: tab.href === `/campaigns/${campaign.id}/world` ? "2px solid var(--quest-gold-hi)" : "2px solid transparent", color: tab.href === `/campaigns/${campaign.id}/world` ? "var(--quest-gold-hi)" : "var(--text-mid)", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
              <Ico name={tab.icon} size={13}/> {tab.label}
            </Link>
          ))}
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Ico name="globe" size={22} color="var(--quest-gold-hi)"/>
            <div>
              <h2 style={{ fontSize: 22, margin: 0 }}>Mundo</h2>
              <p style={{ fontSize: 13, color: "var(--text-low)", margin: 0 }}>{campaign.setting || "Sin ambientación definida"}</p>
            </div>
          </div>
        </div>

        {/* Section cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
          {sections.map(s => (
            <Link key={s.href} href={s.href} style={{ textDecoration: "none" }}>
              <div className="lo-card" style={{ padding: 20, cursor: "pointer", transition: "border-color 0.15s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `${s.color}18`, display: "grid", placeItems: "center", border: `1px solid ${s.color}44` }}>
                    <Ico name={s.icon} size={18} color={s.color}/>
                  </div>
                  <span style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.count}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-hi)", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: "var(--text-low)" }}>{s.description}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href={`/campaigns/${campaign.id}/world/locations/new`} className="lo-btn lo-btn-ghost" style={{ fontSize: 13 }}>
            <Ico name="plus" size={13}/> Nueva ubicación
          </Link>
          <Link href={`/campaigns/${campaign.id}/world/factions/new`} className="lo-btn lo-btn-ghost" style={{ fontSize: 13 }}>
            <Ico name="plus" size={13}/> Nueva facción
          </Link>
          <Link href={`/campaigns/${campaign.id}/world/lore`} className="lo-btn lo-btn-ghost" style={{ fontSize: 13 }}>
            <Ico name="plus" size={13}/> Nueva entrada de lore
          </Link>
        </div>
      </div>
    </main>
  );
}
