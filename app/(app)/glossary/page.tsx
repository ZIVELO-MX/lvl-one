"use client";
import { useState } from "react";
import { TopBar } from "@/components/layout/AppShell";
import { GLOSSARY_TERMS } from "@/data/glossary";

// Sólo fija el orden de los filtros; las categorías que existen de verdad
// salen de los datos, así que añadir términos nuevos no obliga a tocar esto.
const CATEGORIES = [
  "Todas", "Mesa", "Mecánicas", "Combate", "Condición", "Personaje", "Ficha",
  "Características", "Progresión", "Magia", "Equipo", "Descanso",
];

const CAT_COLOR: Record<string, string> = {
  Mesa: "var(--quest-gold)",
  Mecánicas: "var(--arcane-blue-hi)",
  Combate: "var(--dragon-red)",
  Condición: "#e879a5",
  Personaje: "var(--moss-green)",
  Ficha: "var(--quest-gold-hi)",
  Características: "#8fb996",
  Progresión: "#f0a868",
  Magia: "#c084fc",
  Equipo: "#b8a189",
  Descanso: "#67e8f9",
};

export default function GlossaryPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todas");
  const [expanded, setExpanded] = useState<string | null>(null);

  const availableCats = new Set(GLOSSARY_TERMS.map(t => t.cat));
  const visibleCats = [
    "Todas",
    ...CATEGORIES.filter(c => c !== "Todas" && availableCats.has(c)),
    ...[...availableCats].filter(c => !CATEGORIES.includes(c)),
  ];

  const filtered = GLOSSARY_TERMS.filter(t => {
    if (cat !== "Todas" && t.cat !== cat) return false;
    if (q && !t.t.toLowerCase().includes(q.toLowerCase()) && !t.def.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }).sort((a, b) => a.t.localeCompare(b.t));

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 80px" }}>
      <TopBar crumb={["Glosario"]} />

      <div className="lo-page-pad" style={{ padding: "24px 32px 0", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, marginBottom: 6 }}>Glosario D&D</h1>
          <p style={{ fontSize: 13, color: "var(--text-low)" }}>
            {GLOSSARY_TERMS.length} términos · Todo lo que necesitas saber en menos de 3 líneas.
          </p>
        </div>

        {/* Search */}
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Buscar término…"
          style={{
            width: "100%", padding: "10px 14px", borderRadius: 8, fontSize: 14, marginBottom: 14,
            background: "rgba(244,231,197,0.04)", border: "1px solid var(--line-strong)",
            color: "var(--text)", outline: "none", boxSizing: "border-box",
          }}
        />

        {/* Category filter */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
          {visibleCats.map(c => (
            <button type="button"
              key={c}
              onClick={() => setCat(c)}
              style={{
                padding: "5px 12px", borderRadius: 999, fontSize: 11, cursor: "pointer",
                border: cat === c ? `1px solid ${CAT_COLOR[c] ?? "var(--arcane-blue)"}` : "1px solid var(--line-strong)",
                background: cat === c ? `${CAT_COLOR[c] ?? "var(--arcane-blue)"}18` : "rgba(244,231,197,0.03)",
                color: cat === c ? (CAT_COLOR[c] ?? "var(--arcane-blue-hi)") : "var(--text-low)",
                transition: "all .12s",
              }}
            >
              {c}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 11, color: "var(--text-low)", marginBottom: 12 }}>
          {filtered.length} términos
        </div>

        {/* Terms list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map(term => {
            const isOpen = expanded === term.id;
            return (
              <div
                key={term.id}
                className="lo-card-elev"
                style={{ border: "1px solid var(--line-strong)", overflow: "hidden" }}
              >
                <button type="button"
                  onClick={() => setExpanded(isOpen ? null : term.id)}
                  style={{
                    width: "100%", padding: "14px 18px", textAlign: "left", cursor: "pointer",
                    background: "none", border: "none", display: "flex", alignItems: "center", gap: 10,
                  }}
                >
                  <span style={{
                    fontSize: 10, padding: "2px 8px", borderRadius: 999, flexShrink: 0,
                    background: `${CAT_COLOR[term.cat] ?? "var(--arcane-blue)"}18`,
                    color: CAT_COLOR[term.cat] ?? "var(--arcane-blue-hi)",
                    border: `1px solid ${CAT_COLOR[term.cat] ?? "var(--arcane-blue)"}40`,
                  }}>
                    {term.cat}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-hi)", flex: 1 }}>{term.t}</span>
                  <span style={{ fontSize: 12, color: "var(--text-low)", flexShrink: 0, transition: "transform .15s", transform: isOpen ? "rotate(90deg)" : "none" }}>›</span>
                </button>

                {!isOpen && (
                  <div style={{ padding: "0 18px 12px", fontSize: 12, color: "var(--text-low)", lineHeight: 1.6 }}>
                    {term.def.length > 90 ? term.def.slice(0, 87) + "…" : term.def}
                  </div>
                )}

                {isOpen && (
                  <div style={{ padding: "0 18px 16px" }}>
                    <p style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.7, margin: "0 0 10px" }}>{term.def}</p>
                    {term.ex && (
                      <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(214,168,79,0.04)", borderLeft: "3px solid var(--quest-gold)", marginBottom: 10 }}>
                        <span style={{ fontSize: 11, color: "var(--quest-gold)", fontWeight: 600, marginRight: 6 }}>Ejemplo:</span>
                        <span style={{ fontSize: 12, color: "var(--text-mid)", fontStyle: "italic" }}>{term.ex}</span>
                      </div>
                    )}
                    {term.relates && term.relates.length > 0 && (
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: "var(--text-low)" }}>Ver también:</span>
                        {term.relates.map(r => {
                          const rel = GLOSSARY_TERMS.find(t => t.t === r || t.id === r);
                          return (
                            <button type="button"
                              key={r}
                              onClick={() => rel && setExpanded(rel.id)}
                              style={{
                                fontSize: 11, padding: "2px 8px", borderRadius: 999,
                                background: "rgba(92,122,184,0.07)", color: "var(--arcane-blue-hi)",
                                border: "1px solid rgba(92,122,184,0.2)", cursor: rel ? "pointer" : "default",
                              }}
                            >
                              {r}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-low)", fontSize: 14 }}>
            Ningún término coincide.
          </div>
        )}
      </div>
    </main>
  );
}
