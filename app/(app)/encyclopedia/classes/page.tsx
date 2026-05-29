"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/AppShell";
import { CLASSES } from "@/data/classes";

const COMPLEXITY_COLOR: Record<string, string> = {
  Baja: "var(--moss-green)", Media: "var(--quest-gold)", Alta: "var(--dragon-red)",
};
const HIT_COLOR: Record<string, string> = {
  d12: "var(--dragon-red)", d10: "var(--quest-gold)", d8: "var(--arcane-blue-hi)", d6: "var(--moss-green)",
};

export default function ClassesPage() {
  const router = useRouter();
  const [spellFilter, setSpellFilter] = useState<"all" | "caster" | "noncaster">("all");
  const [q, setQ] = useState("");

  const filtered = CLASSES.filter(c => {
    if (spellFilter === "caster" && !c.spellcaster) return false;
    if (spellFilter === "noncaster" && c.spellcaster) return false;
    if (q && !c.name.toLowerCase().includes(q.toLowerCase()) && !c.role.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 80px" }}>
      <TopBar crumb={["Enciclopedia", "Clases"]} />

      <div className="lo-page-pad" style={{ padding: "24px 32px 0", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, marginBottom: 6 }}>Clases</h1>
          <p style={{ fontSize: 13, color: "var(--text-low)" }}>
            {CLASSES.length} clases · Elige tu rol en la mesa.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Buscar clase…"
            style={{
              flex: 1, minWidth: 180, padding: "8px 12px", borderRadius: 8, fontSize: 13,
              background: "rgba(244,231,197,0.04)", border: "1px solid var(--line-strong)",
              color: "var(--text)", outline: "none",
            }}
          />
          {(["all", "caster", "noncaster"] as const).map(f => (
            <button
              type="button"
              key={f}
              onClick={() => setSpellFilter(f)}
              style={{
                padding: "7px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer",
                border: spellFilter === f ? "1px solid var(--arcane-blue)" : "1px solid var(--line-strong)",
                background: spellFilter === f ? "rgba(92,122,184,0.15)" : "rgba(244,231,197,0.03)",
                color: spellFilter === f ? "var(--arcane-blue-hi)" : "var(--text-low)",
                transition: "all .12s",
              }}
            >
              {f === "all" ? "Todas" : f === "caster" ? "Lanzadoras" : "No-mágicas"}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 12 }}>
          {filtered.map(cls => (
            <div
              key={cls.id}
              className="lo-card-elev"
              onClick={() => router.push(`/encyclopedia/classes/${cls.id}`)}
              style={{ padding: "18px 20px", cursor: "pointer", border: "1px solid var(--line-strong)", transition: "border-color .15s" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-hi)", marginBottom: 2 }}>{cls.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-low)" }}>{cls.short}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: HIT_COLOR[cls.hit] ?? "var(--text-mid)" }}>{cls.hit}</span>
                  <span style={{ fontSize: 10, color: COMPLEXITY_COLOR[cls.complexity ?? "Media"] }}>
                    {cls.complexity}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--arcane-blue-hi)", marginBottom: 8 }}>{cls.role}</div>
              <p style={{ fontSize: 12, color: "var(--text-mid)", lineHeight: 1.6, margin: "0 0 10px" }}>{cls.combat}</p>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {cls.tags?.map(t => (
                  <span key={t} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: "rgba(214,168,79,0.07)", color: "var(--quest-gold)", border: "1px solid rgba(214,168,79,0.2)" }}>
                    {t}
                  </span>
                ))}
                {cls.spellcaster && (
                  <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: "rgba(92,122,184,0.07)", color: "var(--arcane-blue-hi)", border: "1px solid rgba(92,122,184,0.2)" }}>
                    Lanzador
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-low)", fontSize: 14 }}>
            Ninguna clase coincide.
          </div>
        )}
      </div>
    </main>
  );
}
