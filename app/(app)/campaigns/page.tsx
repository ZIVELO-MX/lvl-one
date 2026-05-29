"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { campaignToSummary, type CampaignStatus } from "@/types/campaign";

function statusLabel(s: CampaignStatus) {
  switch (s) {
    case "planning": return "Planificación";
    case "active": return "Activa";
    case "paused": return "Pausada";
    case "completed": return "Completada";
    case "archived": return "Archivada";
  }
}

function statusChip(s: CampaignStatus) {
  switch (s) {
    case "planning": return "lo-chip";
    case "active": return "lo-chip lo-chip-green";
    case "paused": return "lo-chip lo-chip-gold";
    case "completed": return "lo-chip";
    case "archived": return "lo-chip";
  }
}

export default function CampaignsPage() {
  const { state } = useApp();
  const router = useRouter();
  const summaries = state.campaigns.map(campaignToSummary).sort((a, b) => (b.lastSessionAt ?? b.createdAt) - (a.lastSessionAt ?? a.createdAt));

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["LVL ONE", "Campañas"]}/>
      <div style={{ padding: "16px 32px 0", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", margin: "16px 0 24px" }}>
          <div>
            <h1 style={{ fontSize: 32, lineHeight: 1.1, marginBottom: 4 }}>Tus campañas</h1>
            <p style={{ color: "var(--text-mid)", fontSize: 14 }}>
              {state.campaigns.length === 0 ? "Crea tu primera campaña y reúne a tu grupo." : `${state.campaigns.length} campaña${state.campaigns.length === 1 ? "" : "s"} en curso.`}
            </p>
          </div>
          <Link href="/campaigns/new" className="lo-btn lo-btn-primary">
            <Ico name="plus" size={14}/> Nueva campaña
          </Link>
        </div>

        {summaries.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 16, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(214,168,79,0.10)", display: "grid", placeItems: "center" }}>
              <Ico name="map" size={28} color="var(--quest-gold-hi)"/>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--text-hi)", marginBottom: 6 }}>
                Aún no tienes campañas
              </div>
              <p style={{ fontSize: 14, color: "var(--text-low)", maxWidth: 320 }}>
                Crea una campaña, invita jugadores y empieza a contar tu historia.
              </p>
            </div>
            <Link href="/campaigns/new" className="lo-btn lo-btn-primary">
              <Ico name="plus" size={14}/> Crear mi primera campaña
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {summaries.map(s => (
              <Link key={s.id} href={`/campaigns/${s.id}`} style={{ textDecoration: "none" }}>
                <div className="lo-card-elev" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 0, cursor: "pointer", transition: "border-color .12s", borderColor: "transparent" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <span className={statusChip(s.status)}>{statusLabel(s.status)}</span>
                    <span style={{ fontSize: 11, color: "var(--text-low)" }}>{s.sessionCount} sesión{s.sessionCount === 1 ? "" : "es"}</span>
                  </div>
                  <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: s.coverColor, display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontSize: 22, color: "white", flexShrink: 0 }}>
                      {(s.name?.[0] ?? "?").toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 17, color: "var(--text-hi)", marginBottom: 2 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-mid)" }}>{s.setting || "Sin ambientación"} · {s.playerCount} jugador{s.playerCount === 1 ? "" : "es"}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" className="lo-btn lo-btn-primary" style={{ flex: 1, justifyContent: "center", padding: "8px 0", fontSize: 13 }} onClick={(e) => { e.preventDefault(); router.push(`/campaigns/${s.id}`); }}>
                      Ver campaña <Ico name="arrow" size={13}/>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
            <Link href="/campaigns/new" className="lo-card" style={{ minHeight: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, cursor: "pointer", borderStyle: "dashed", textDecoration: "none" }}>
              <div style={{ width: 44, height: 44, borderRadius: 999, background: "rgba(214,168,79,0.10)", display: "grid", placeItems: "center" }}>
                <Ico name="plus" size={20} color="var(--quest-gold-hi)"/>
              </div>
              <span style={{ fontSize: 13, color: "var(--text-mid)" }}>Nueva campaña</span>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
