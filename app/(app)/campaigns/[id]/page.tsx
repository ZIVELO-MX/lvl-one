"use client";
import { use } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { updateCampaign } from "@/lib/campaign-api";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { type CampaignStatus } from "@/types/campaign";

function statusLabel(s: CampaignStatus) {
  switch (s) {
    case "planning": return "Planificación";
    case "active": return "Activa";
    case "paused": return "Pausada";
    case "completed": return "Completada";
    case "archived": return "Archivada";
  }
}

interface Props { params: Promise<{ id: string }> }
export default function CampaignDetailPage({ params }: Props) {
  const { id } = use(params);
  const { state, dispatch } = useApp();
  const campaign = state.campaigns.find(c => c.id === id);

  if (!campaign) {
    return (
      <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
        <TopBar crumb={["LVL ONE", "Campañas", "No encontrada"]}/>
        <div style={{ padding: "40px 32px", textAlign: "center" }}>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>Campaña no encontrada</h1>
          <p style={{ color: "var(--text-mid)", marginBottom: 20 }}>La campaña que buscas no existe o fue eliminada.</p>
          <Link href="/campaigns" className="lo-btn lo-btn-primary">Volver a campañas</Link>
        </div>
      </main>
    );
  }

  const isDm = campaign.dmId === (state.user?.email ?? "local-user");
  const completedSessions = campaign.sessions.filter(s => s.status === "completed").length;
  const nextSession = campaign.sessions.filter(s => s.status === "scheduled").sort((a, b) => a.number - b.number)[0];
  const totalXp = campaign.sessions.reduce((a, s) => a + s.xpAwarded, 0);

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
      <TopBar crumb={["LVL ONE", "Campañas", campaign.name || "Detalle"]}/>
      <div style={{ padding: "16px 32px 0", maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 14, background: campaign.coverColor, display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontSize: 32, color: "white", flexShrink: 0 }}>
            {(campaign.name?.[0] ?? "?").toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <h1 style={{ fontSize: 28, lineHeight: 1.1, margin: 0 }}>{campaign.name || "Campaña sin nombre"}</h1>
              <span className="lo-chip lo-chip-gold">{statusLabel(campaign.status)}</span>
            </div>
            <p style={{ color: "var(--text-mid)", fontSize: 14, margin: 0 }}>{campaign.setting || "Sin ambientación"}</p>
            {campaign.description && <p style={{ color: "var(--text-low)", fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>{campaign.description}</p>}
          </div>
          {isDm && (
            <button className="lo-btn lo-btn-ghost" onClick={() => {
              const newStatus = campaign.status === "active" ? "paused" : "active";
              dispatch({ type: "CAMPAIGN_PATCH", id: campaign.id, patch: { status: newStatus } });
              updateCampaign(campaign.id, { status: newStatus }).catch(() => {});
            }} style={{ fontSize: 12 }}>
              {campaign.status === "active" ? "Pausar" : "Activar"}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid rgba(244,231,197,0.08)", paddingBottom: 0 }}>
          {tabs.map(t => {
            const active = t.href === `/campaigns/${campaign.id}`;
            return (
              <Link key={t.label} href={t.href} style={{ textDecoration: "none" }}>
                <div style={{ padding: "10px 16px", fontSize: 13, color: active ? "var(--text-hi)" : "var(--text-low)", borderBottom: active ? "2px solid var(--quest-gold-hi)" : "2px solid transparent", display: "flex", alignItems: "center", gap: 6, transition: "color .12s" }}>
                  <Ico name={t.icon} size={13}/> {t.label}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Overview grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
          <div className="lo-card-elev" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, color: "var(--text-low)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Jugadores</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--text-hi)" }}>{campaign.players.length}</div>
          </div>
          <div className="lo-card-elev" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, color: "var(--text-low)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Sesiones completadas</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--text-hi)" }}>{completedSessions}</div>
          </div>
          <div className="lo-card-elev" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, color: "var(--text-low)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>XP total otorgada</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--text-hi)" }}>{totalXp}</div>
          </div>
          <div className="lo-card-elev" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, color: "var(--text-low)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Siguiente sesión</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--text-hi)" }}>
              {nextSession ? `Sesión ${nextSession.number}` : "Sin planificar"}
            </div>
            {nextSession && <div style={{ fontSize: 11, color: "var(--text-low)", marginTop: 4 }}>{nextSession.date}</div>}
          </div>
        </div>

        {/* Quick actions */}
        <h2 style={{ fontSize: 18, marginBottom: 14 }}>Acciones rápidas</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 32 }}>
          <Link href={`/campaigns/${campaign.id}/sessions`} style={{ textDecoration: "none" }}>
            <div className="lo-card-elev" style={{ padding: 18, cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(214,168,79,0.12)", display: "grid", placeItems: "center", color: "var(--quest-gold-hi)" }}>
                  <Ico name="calendar" size={16}/>
                </div>
                <span style={{ fontSize: 14, color: "var(--text-hi)" }}>Gestionar sesiones</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-low)", margin: 0 }}>Planifica, juega y archiva las sesiones de tu grupo.</p>
            </div>
          </Link>
          <Link href={`/campaigns/${campaign.id}/players`} style={{ textDecoration: "none" }}>
            <div className="lo-card-elev" style={{ padding: 18, cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(91,122,74,0.2)", display: "grid", placeItems: "center", color: "#A3C28F" }}>
                  <Ico name="users" size={16}/>
                </div>
                <span style={{ fontSize: 14, color: "var(--text-hi)" }}>Jugadores y personajes</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-low)", margin: 0 }}>Invita jugadores y vincula sus personajes.</p>
            </div>
          </Link>
          <Link href={`/campaigns/${campaign.id}/notes`} style={{ textDecoration: "none" }}>
            <div className="lo-card-elev" style={{ padding: 18, cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(116,159,194,0.15)", display: "grid", placeItems: "center", color: "var(--arcane-blue-hi)" }}>
                  <Ico name="scroll" size={16}/>
                </div>
                <span style={{ fontSize: 14, color: "var(--text-hi)" }}>Notas del DM</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-low)", margin: 0 }}>Secretos, tramas y recuerdos de la campaña.</p>
            </div>
          </Link>
        </div>

        {/* Rules summary */}
        <h2 style={{ fontSize: 18, marginBottom: 14 }}>Reglas de la campaña</h2>
        <div className="lo-card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-low)", marginBottom: 2 }}>Multiclase</div>
              <div style={{ fontSize: 14, color: "var(--text-hi)" }}>{campaign.rules.allowMulticlass ? "Permitida" : "No permitida"}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-low)", marginBottom: 2 }}>Feats</div>
              <div style={{ fontSize: 14, color: "var(--text-hi)" }}>{campaign.rules.allowFeats ? "Permitidos" : "No permitidos"}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-low)", marginBottom: 2 }}>Homebrew</div>
              <div style={{ fontSize: 14, color: "var(--text-hi)" }}>{campaign.rules.allowHomebrew ? "Permitido" : "No permitido"}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-low)", marginBottom: 2 }}>Nivel inicial</div>
              <div style={{ fontSize: 14, color: "var(--text-hi)" }}>{campaign.rules.startingLevel}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-low)", marginBottom: 2 }}>Stats</div>
              <div style={{ fontSize: 14, color: "var(--text-hi)" }}>
                {campaign.rules.statGeneration === "standard" ? "Array estándar" : campaign.rules.statGeneration === "roll" ? "Tirar dados" : "Compra de puntos"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
