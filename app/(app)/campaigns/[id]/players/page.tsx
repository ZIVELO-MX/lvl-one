"use client";
import { useState, use } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { uid } from "@/lib/uid";
import { type CampaignRole } from "@/types/campaign";

const ROLE_LABELS: Record<CampaignRole, string> = {
  dm: "Dungeon Master",
  "co-dm": "Co-DM",
  player: "Jugador",
  spectator: "Espectador",
};

interface Props { params: Promise<{ id: string }> }
export default function CampaignPlayersPage({ params }: Props) {
  const { id } = use(params);
  const { state, dispatch } = useApp();
  const campaign = state.campaigns.find(c => c.id === id);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerRole, setNewPlayerRole] = useState<CampaignRole>("player");

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

  const addPlayer = () => {
    if (!newPlayerName.trim()) return;
    dispatch({
      type: "CAMPAIGN_PLAYER_ADD",
      campaignId: campaign.id,
      player: {
        id: uid(),
        name: newPlayerName.trim(),
        role: newPlayerRole,
      },
    });
    setNewPlayerName("");
  };

  const removePlayer = (playerId: string) => {
    const p = campaign.players.find(x => x.id === playerId);
    if (!p) return;
    if (p.role === "dm") return; // can't remove DM
    if (confirm(`¿Eliminar a ${p.name} de la campaña?`)) {
      dispatch({ type: "CAMPAIGN_PLAYER_REMOVE", campaignId: campaign.id, playerId });
    }
  };

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
      <TopBar crumb={["LVL ONE", "Campañas", campaign.name || "Detalle", "Jugadores"]}/>
      <div style={{ padding: "16px 32px 0", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: campaign.coverColor, display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontSize: 22, color: "white" }}>
            {(campaign.name?.[0] ?? "?").toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: 22, margin: 0 }}>{campaign.name || "Campaña sin nombre"}</h1>
            <p style={{ color: "var(--text-mid)", fontSize: 13, margin: 0 }}>{campaign.setting || "Sin ambientación"}</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid rgba(244,231,197,0.08)" }}>
          {tabs.map(t => {
            const active = t.href === `/campaigns/${campaign.id}/players`;
            return (
              <Link key={t.label} href={t.href} style={{ textDecoration: "none" }}>
                <div style={{ padding: "10px 16px", fontSize: 13, color: active ? "var(--text-hi)" : "var(--text-low)", borderBottom: active ? "2px solid var(--quest-gold-hi)" : "2px solid transparent", display: "flex", alignItems: "center", gap: 6 }}>
                  <Ico name={t.icon} size={13}/> {t.label}
                </div>
              </Link>
            );
          })}
        </div>

        <h2 style={{ fontSize: 18, marginBottom: 14 }}>Jugadores ({campaign.players.length})</h2>

        {isDm && (
          <div className="lo-card" style={{ padding: 18, marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, marginBottom: 12 }}>Agregar jugador</h3>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 11, color: "var(--text-mid)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Nombre</label>
                <input className="lo-input" value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} placeholder="Nombre del jugador" onKeyDown={e => { if (e.key === "Enter") addPlayer(); }}/>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "var(--text-mid)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Rol</label>
                <select className="lo-input" value={newPlayerRole} onChange={e => setNewPlayerRole(e.target.value as CampaignRole)} style={{ padding: "8px 10px" }}>
                  <option value="player">Jugador</option>
                  <option value="co-dm">Co-DM</option>
                  <option value="spectator">Espectador</option>
                </select>
              </div>
              <button type="button" className="lo-btn lo-btn-primary" onClick={addPlayer} disabled={!newPlayerName.trim()}>
                <Ico name="plus" size={14}/> Agregar
              </button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {campaign.players.map(p => (
            <div key={p.id} className="lo-card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, var(--arcane-blue), var(--quest-gold-lo))", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontSize: 18, color: "white" }}>
                {p.name[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, color: "var(--text-hi)", marginBottom: 2 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-mid)" }}>{ROLE_LABELS[p.role]}</div>
              </div>
              {p.characterId && (
                <div className="lo-chip" style={{ fontSize: 11 }}>Personaje vinculado</div>
              )}
              {isDm && p.role !== "dm" && (
                <button type="button" className="lo-btn lo-btn-ghost" onClick={() => removePlayer(p.id)} style={{ padding: "6px 10px", color: "var(--text-low)" }} title="Eliminar" aria-label={`Eliminar a ${p.name}`}>
                  <Ico name="close" size={13}/>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
