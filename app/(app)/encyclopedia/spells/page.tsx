"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/AppShell";
import { SPELLS } from "@/data/spells";
import { CLASSES } from "@/data/classes";

const SCHOOLS = ["Todas", "Abjuración", "Adivinación", "Conjuración", "Encantamiento", "Evocación", "Ilusión", "Nigromancia", "Transmutación"];
const LEVELS = ["Todos", "0", "1", "2", "3"];
const SCHOOL_COLOR: Record<string, string> = {
  Evocación: "var(--dragon-red)", Abjuración: "var(--arcane-blue-hi)", Conjuración: "var(--moss-green)",
  Encantamiento: "#c084fc", Ilusión: "#67e8f9", Nigromancia: "#94a3b8", Transmutación: "var(--quest-gold)", Adivinación: "#fbbf24",
};
const LEVEL_LABEL: Record<string, string> = { "0": "Truco", "1": "Niv. 1", "2": "Niv. 2", "3": "Niv. 3" };

export default function SpellsPage() {
  const router = useRouter();
  const [school, setSchool] = useState("Todas");
  const [level, setLevel] = useState("Todos");
  const [classFilter, setClassFilter] = useState("all");
  const [q, setQ] = useState("");

  const casterClasses = CLASSES.filter(c => c.spellcaster);

  const filtered = SPELLS.filter(s => {
    if (school !== "Todas" && s.school !== school) return false;
    if (level !== "Todos" && s.level !== Number(level)) return false;
    if (classFilter !== "all" && !s.classes?.includes(classFilter)) return false;
    if (q && !s.name.toLowerCase().includes(q.toLowerCase()) && !s.school.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 80px" }}>
      <TopBar crumb={["Enciclopedia", "Hechizos"]} />

      <div className="lo-page-pad" style={{ padding: "24px 32px 0", maxWidth: 960, margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 26, marginBottom: 6 }}>Hechizos</h1>
          <p style={{ fontSize: 13, color: "var(--text-low)" }}>
            {SPELLS.length} hechizos · Trucos y niveles 1–3 del PHB.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Buscar hechizo…"
            style={{
              width: "100%", padding: "8px 12px", borderRadius: 8, fontSize: 13,
              background: "rgba(244,231,197,0.04)", border: "1px solid var(--line-strong)",
              color: "var(--text)", outline: "none", boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "var(--text-low)", alignSelf: "center", marginRight: 2 }}>Nivel:</span>
            {LEVELS.map(l => (
              <button type="button"
                key={l}
                onClick={() => setLevel(l)}
                style={{
                  padding: "5px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer",
                  border: level === l ? "1px solid var(--quest-gold)" : "1px solid var(--line-strong)",
                  background: level === l ? "rgba(214,168,79,0.12)" : "rgba(244,231,197,0.03)",
                  color: level === l ? "var(--quest-gold-hi)" : "var(--text-low)",
                  transition: "all .12s",
                }}
              >
                {l === "Todos" ? "Todos" : LEVEL_LABEL[l]}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "var(--text-low)", alignSelf: "center", marginRight: 2 }}>Escuela:</span>
            {SCHOOLS.map(sc => (
              <button type="button"
                key={sc}
                onClick={() => setSchool(sc)}
                style={{
                  padding: "5px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer",
                  border: school === sc ? `1px solid ${SCHOOL_COLOR[sc] ?? "var(--arcane-blue)"}` : "1px solid var(--line-strong)",
                  background: school === sc ? `${SCHOOL_COLOR[sc] ?? "var(--arcane-blue)"}18` : "rgba(244,231,197,0.03)",
                  color: school === sc ? (SCHOOL_COLOR[sc] ?? "var(--arcane-blue-hi)") : "var(--text-low)",
                  transition: "all .12s",
                }}
              >
                {sc}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "var(--text-low)", alignSelf: "center", marginRight: 2 }}>Clase:</span>
            <button type="button"
              onClick={() => setClassFilter("all")}
              style={{
                padding: "5px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer",
                border: classFilter === "all" ? "1px solid var(--arcane-blue)" : "1px solid var(--line-strong)",
                background: classFilter === "all" ? "rgba(92,122,184,0.12)" : "rgba(244,231,197,0.03)",
                color: classFilter === "all" ? "var(--arcane-blue-hi)" : "var(--text-low)",
                transition: "all .12s",
              }}
            >
              Todas
            </button>
            {casterClasses.map(c => (
              <button type="button"
                key={c.id}
                onClick={() => setClassFilter(c.id)}
                style={{
                  padding: "5px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer",
                  border: classFilter === c.id ? "1px solid var(--arcane-blue)" : "1px solid var(--line-strong)",
                  background: classFilter === c.id ? "rgba(92,122,184,0.12)" : "rgba(244,231,197,0.03)",
                  color: classFilter === c.id ? "var(--arcane-blue-hi)" : "var(--text-low)",
                  transition: "all .12s",
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 11, color: "var(--text-low)", marginBottom: 12 }}>{filtered.length} hechizos</div>

        {/* Spell list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(spell => (
            <div
              key={spell.id}
              className="lo-card-elev"
              onClick={() => router.push(`/encyclopedia/spells/${spell.id}`)}
              style={{ padding: "14px 18px", cursor: "pointer", border: "1px solid var(--line-strong)", transition: "border-color .15s" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {/* Level badge */}
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: spell.level === 0 ? "rgba(92,122,184,0.1)" : "rgba(214,168,79,0.1)",
                  border: `1px solid ${spell.level === 0 ? "rgba(92,122,184,0.2)" : "rgba(214,168,79,0.2)"}`,
                  display: "grid", placeItems: "center",
                  fontSize: 11, fontWeight: 700,
                  color: spell.level === 0 ? "var(--arcane-blue-hi)" : "var(--quest-gold-hi)",
                }}>
                  {spell.level === 0 ? "0" : `N${spell.level}`}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-hi)" }}>{spell.name}</span>
                    <span style={{ fontSize: 11, color: SCHOOL_COLOR[spell.school] ?? "var(--text-low)" }}>{spell.school}</span>
                    {spell.ritual && <span style={{ fontSize: 10, color: "var(--moss-green)" }}>Ritual</span>}
                    {spell.concentration && <span style={{ fontSize: 10, color: "var(--quest-gold)" }}>Concentración</span>}
                  </div>
                  {spell.beginnerSummary && (
                    <div style={{ fontSize: 12, color: "var(--text-low)", marginTop: 2 }}>{spell.beginnerSummary}</div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8, flexShrink: 0, fontSize: 11, color: "var(--text-low)" }}>
                  <span>{spell.castingTime}</span>
                  <span>·</span>
                  <span>{spell.range}</span>
                  <span>·</span>
                  <span>{spell.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-low)", fontSize: 14 }}>
            Ningún hechizo coincide con los filtros.
          </div>
        )}
      </div>
    </main>
  );
}
