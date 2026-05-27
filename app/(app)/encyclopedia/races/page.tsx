"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/AppShell";
import { RACES } from "@/data/races";

const CATEGORIES = ["Todas", "common", "uncommon", "rare", "exotic"] as const;
const CATEGORY_LABEL: Record<string, string> = {
  Todas: "Todas", common: "Comunes", uncommon: "Poco comunes", rare: "Raras", exotic: "Exóticas",
};

const COMPLEXITY_COLOR: Record<string, string> = {
  Baja: "var(--moss-green)",
  Media: "var(--quest-gold)",
  Alta: "var(--dragon-red)",
};

export default function RacesPage() {
  const router = useRouter();
  const [cat, setCat] = useState<string>("Todas");
  const [q, setQ] = useState("");

  const filtered = RACES.filter(r => {
    if (cat !== "Todas" && r.category !== cat) return false;
    if (q && !r.name.toLowerCase().includes(q.toLowerCase()) && !r.desc.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 80px" }}>
      <TopBar crumb={["Enciclopedia", "Razas"]} />

      <div className="lo-page-pad" style={{ padding: "24px 32px 0", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, marginBottom: 6 }}>Razas</h1>
          <p style={{ fontSize: 13, color: "var(--text-low)" }}>
            {RACES.length} razas disponibles · Click en una para ver detalles y subrazas.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Buscar raza…"
            style={{
              flex: 1, minWidth: 180, padding: "8px 12px", borderRadius: 8, fontSize: 13,
              background: "rgba(244,231,197,0.04)", border: "1px solid var(--line-strong)",
              color: "var(--text)", outline: "none",
            }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCat(c)}
                style={{
                  padding: "7px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer",
                  border: cat === c ? "1px solid var(--arcane-blue)" : "1px solid var(--line-strong)",
                  background: cat === c ? "rgba(92,122,184,0.15)" : "rgba(244,231,197,0.03)",
                  color: cat === c ? "var(--arcane-blue-hi)" : "var(--text-low)",
                  transition: "all .12s",
                }}
              >
                {CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          {filtered.map(race => (
            <div
              key={race.id}
              className="lo-card-elev"
              onClick={() => router.push(`/encyclopedia/races/${race.id}`)}
              style={{ padding: "18px 20px", cursor: "pointer", border: "1px solid var(--line-strong)", transition: "border-color .15s" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-hi)", marginBottom: 2 }}>{race.name}</div>
                  <div style={{ fontSize: 12, color: "var(--quest-gold-hi)", fontWeight: 600 }}>{race.short}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: "rgba(244,231,197,0.06)", color: "var(--text-low)", border: "1px solid var(--line-strong)" }}>
                    {race.sourceTag}
                  </span>
                  <span style={{ fontSize: 10, color: COMPLEXITY_COLOR[race.complexity ?? ""] ?? "var(--text-low)" }}>
                    {race.complexity} complejidad
                  </span>
                </div>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-mid)", lineHeight: 1.6, margin: "0 0 10px" }}>{race.desc}</p>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {race.tags.map(t => (
                  <span key={t} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: "rgba(214,168,79,0.07)", color: "var(--quest-gold)", border: "1px solid rgba(214,168,79,0.2)" }}>
                    {t}
                  </span>
                ))}
                {(race.subraceIds?.length ?? 0) > 0 && (
                  <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: "rgba(92,122,184,0.07)", color: "var(--arcane-blue-hi)", border: "1px solid rgba(92,122,184,0.2)" }}>
                    {race.subraceIds?.length} subrazas
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-low)", fontSize: 14 }}>
            Ninguna raza coincide con los filtros.
          </div>
        )}
      </div>
    </main>
  );
}
