"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { MONSTERS } from "@/data/monsters";
import { crToXp } from "@/types/monster";
import { difficultyThresholds } from "@/types/combat";
import type { EncounterDifficulty } from "@/types/combat";
import type { Monster, MonsterType } from "@/types/monster";
import { useRouter } from "next/navigation";

// ── Helpers ──────────────────────────────────────────────────
function crLabel(cr: number): string {
  if (cr === 0.125) return "1/8";
  if (cr === 0.25)  return "1/4";
  if (cr === 0.5)   return "1/2";
  return String(cr);
}

function xpMultiplier(count: number): number {
  if (count === 1) return 1;
  if (count === 2) return 1.5;
  if (count <= 6)  return 2;
  if (count <= 10) return 2.5;
  if (count <= 14) return 3;
  return 4;
}

const DIFFICULTY_CONFIG = {
  facil:   { label: "Fácil",   color: "#A3C28F", bg: "rgba(163,194,143,0.12)" },
  medio:   { label: "Medio",   color: "var(--quest-gold-hi)", bg: "rgba(214,168,79,0.12)" },
  dificil: { label: "Difícil", color: "#C9956A", bg: "rgba(201,149,106,0.12)" },
  mortal:  { label: "Mortal",  color: "#C28F8F", bg: "rgba(194,143,143,0.12)" },
} as const;

const TYPE_LABEL: Record<MonsterType, string> = {
  "bestia":        "Bestia",
  "humanoides":    "Humanoide",
  "no-muerto":     "No-muerto",
  "dragón":        "Dragón",
  "aberración":    "Aberración",
  "bestia-magica": "Bestia mágica",
  "constructo":    "Constructo",
  "elemental":     "Elemental",
  "hada":          "Hada",
  "demonio":       "Demonio",
  "monstruosidad": "Monstruosidad",
  "limo":          "Limo",
  "planta":        "Planta",
  "gigante":       "Gigante",
  "inmortal":      "Inmortal",
};

const ALL_ENVS = [...new Set(MONSTERS.flatMap(m => m.environment))].toSorted();
const ALL_TYPES = [...new Set(MONSTERS.map(m => m.type))].toSorted() as MonsterType[];
const ALL_CRS   = [...new Set(MONSTERS.map(m => m.cr))].toSorted((a, b) => a - b);

interface EncounterEntry { monster: Monster; count: number; }

// ── Component ─────────────────────────────────────────────────
export default function EncounterBuilderPage() {
  const router = useRouter();
  // Party config
  const [partySize,  setPartySize]  = useState(4);
  const [partyLevel, setPartyLevel] = useState(3);

  // Filters
  const [search,   setSearch]   = useState("");
  const [filterCrMin, setFilterCrMin] = useState<number | null>(null);
  const [filterCrMax, setFilterCrMax] = useState<number | null>(null);
  const [filterType, setFilterType]   = useState<MonsterType | "">("");
  const [filterEnv,  setFilterEnv]    = useState("");

  // Encounter
  const [encounter, setEncounter] = useState<EncounterEntry[]>([]);

  // Filtered monsters
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return MONSTERS.filter(m => {
      if (q && !m.name.toLowerCase().includes(q) && !m.short.toLowerCase().includes(q)) return false;
      if (filterCrMin !== null && m.cr < filterCrMin) return false;
      if (filterCrMax !== null && m.cr > filterCrMax) return false;
      if (filterType && m.type !== filterType) return false;
      if (filterEnv && !m.environment.includes(filterEnv)) return false;
      return true;
    });
  }, [search, filterCrMin, filterCrMax, filterType, filterEnv]);

  // XP calculations
  const { totalRawXp, totalAdjustedXp, difficulty } = useMemo(() => {
    const totalCount = encounter.reduce((s, e) => s + e.count, 0);
    const rawXp = encounter.reduce((s, e) => s + crToXp(e.monster.cr) * e.count, 0);
    const mult = xpMultiplier(totalCount);
    const adjusted = Math.round(rawXp * mult);
    if (totalCount === 0) return { totalRawXp: 0, totalAdjustedXp: 0, difficulty: null };
    const t = difficultyThresholds(partyLevel);
    const totalFacil = t.facil * partySize;
    const totalMedio = t.medio * partySize;
    const totalDificil = t.dificil * partySize;
    let diff: EncounterDifficulty;
    if (adjusted <= totalFacil) diff = "facil";
    else if (adjusted <= totalMedio) diff = "medio";
    else if (adjusted <= totalDificil) diff = "dificil";
    else diff = "mortal";
    return { totalRawXp: rawXp, totalAdjustedXp: adjusted, difficulty: diff };
  }, [encounter, partySize, partyLevel]);

  const addMonster = (m: Monster) => {
    setEncounter(prev => {
      const existing = prev.find(e => e.monster.id === m.id);
      if (existing) return prev.map(e => e.monster.id === m.id ? { ...e, count: e.count + 1 } : e);
      return [...prev, { monster: m, count: 1 }];
    });
  };

  const setCount = (id: string, count: number) => {
    if (count < 1) {
      setEncounter(prev => prev.filter(e => e.monster.id !== id));
    } else {
      setEncounter(prev => prev.map(e => e.monster.id === id ? { ...e, count } : e));
    }
  };

  const clearEncounter = () => setEncounter([]);

  const diffCfg = difficulty ? DIFFICULTY_CONFIG[difficulty] : null;

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["LVL ONE", "Encuentros"]}/>
      <div style={{ padding: "24px 32px 0", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(194,143,143,0.15)", display: "grid", placeItems: "center", flexShrink: 0, border: "1px solid rgba(194,143,143,0.3)" }}>
            <Ico name="sword" size={20} color="#C28F8F"/>
          </div>
          <div>
            <h1 style={{ fontSize: 22, margin: 0 }}>Encounter Builder</h1>
            <p style={{ fontSize: 12, color: "var(--text-low)", margin: 0 }}>Construye y calibra encuentros para tu partida</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20, alignItems: "start" }}>
          {/* LEFT — Monster browser */}
          <div>
            {/* Party config */}
            <div className="lo-card" style={{ padding: 16, marginBottom: 16, display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ fontSize: 13, color: "var(--text-low)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Partido</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label style={{ fontSize: 12, color: "var(--text-low)" }}>Jugadores</label>
                <div style={{ display: "flex", gap: 4 }}>
                  {[1,2,3,4,5,6,7,8].map(n => (
                    <button type="button" key={n} onClick={() => setPartySize(n)} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${partySize === n ? "var(--quest-gold-hi)" : "var(--border-lo)"}`, background: partySize === n ? "rgba(214,168,79,0.15)" : "transparent", color: partySize === n ? "var(--quest-gold-hi)" : "var(--text-mid)", fontSize: 12, cursor: "pointer", fontWeight: partySize === n ? 700 : 400 }}>{n}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label style={{ fontSize: 12, color: "var(--text-low)" }}>Nivel</label>
                <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
                    <button type="button" key={n} onClick={() => setPartyLevel(n)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${partyLevel === n ? "var(--arcane-blue-hi)" : "var(--border-lo)"}`, background: partyLevel === n ? "var(--arcane-blue-lo)" : "transparent", color: partyLevel === n ? "var(--arcane-blue-hi)" : "var(--text-mid)", fontSize: 11, cursor: "pointer", fontWeight: partyLevel === n ? 700 : 400 }}>{n}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="lo-card" style={{ padding: 16, marginBottom: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ flex: "1 1 160px", minWidth: 160 }}>
                <label style={{ fontSize: 11, color: "var(--text-low)", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Buscar</label>
                <div style={{ position: "relative" }}>
                  <Ico name="search" size={13} color="var(--text-low)"/>
                  <input className="lo-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Nombre del monstruo..." style={{ fontSize: 13, paddingLeft: 28 }}/>
                </div>
              </div>
              <div style={{ flex: "0 0 auto" }}>
                <label style={{ fontSize: 11, color: "var(--text-low)", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>CR mín</label>
                <select className="lo-input" value={filterCrMin ?? ""} onChange={e => setFilterCrMin(e.target.value === "" ? null : Number(e.target.value))} style={{ fontSize: 12, width: 80 }}>
                  <option value="">–</option>
                  {ALL_CRS.map(cr => <option key={cr} value={cr}>{crLabel(cr)}</option>)}
                </select>
              </div>
              <div style={{ flex: "0 0 auto" }}>
                <label style={{ fontSize: 11, color: "var(--text-low)", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>CR máx</label>
                <select className="lo-input" value={filterCrMax ?? ""} onChange={e => setFilterCrMax(e.target.value === "" ? null : Number(e.target.value))} style={{ fontSize: 12, width: 80 }}>
                  <option value="">–</option>
                  {ALL_CRS.map(cr => <option key={cr} value={cr}>{crLabel(cr)}</option>)}
                </select>
              </div>
              <div style={{ flex: "1 1 140px", minWidth: 140 }}>
                <label style={{ fontSize: 11, color: "var(--text-low)", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Tipo</label>
                <select className="lo-input" value={filterType} onChange={e => setFilterType(e.target.value as MonsterType | "")} style={{ fontSize: 12 }}>
                  <option value="">Todos</option>
                  {ALL_TYPES.map(t => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
                </select>
              </div>
              <div style={{ flex: "1 1 140px", minWidth: 140 }}>
                <label style={{ fontSize: 11, color: "var(--text-low)", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Entorno</label>
                <select className="lo-input" value={filterEnv} onChange={e => setFilterEnv(e.target.value)} style={{ fontSize: 12 }}>
                  <option value="">Todos</option>
                  {ALL_ENVS.map(env => <option key={env} value={env} style={{ textTransform: "capitalize" }}>{env.charAt(0).toUpperCase() + env.slice(1)}</option>)}
                </select>
              </div>
              {(search || filterCrMin !== null || filterCrMax !== null || filterType || filterEnv) && (
                <button type="button" className="lo-btn lo-btn-ghost" onClick={() => { setSearch(""); setFilterCrMin(null); setFilterCrMax(null); setFilterType(""); setFilterEnv(""); }} style={{ fontSize: 12, padding: "6px 10px", alignSelf: "flex-end" }}>
                  <Ico name="x" size={12}/> Limpiar
                </button>
              )}
            </div>

            {/* Monster list */}
            <div style={{ fontSize: 12, color: "var(--text-low)", marginBottom: 10 }}>
              {filtered.length} monstruo{filtered.length !== 1 ? "s" : ""} · Haz clic para agregar al encuentro
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {filtered.map(m => {
                const inEncounter = encounter.find(e => e.monster.id === m.id);
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => addMonster(m)}
                    style={{ display: "grid", gridTemplateColumns: "48px 1fr auto auto auto", alignItems: "center", gap: 10, padding: "10px 14px", background: inEncounter ? "rgba(214,168,79,0.06)" : "var(--card)", border: `1px solid ${inEncounter ? "rgba(214,168,79,0.3)" : "var(--border-lo)"}`, borderRadius: 8, cursor: "pointer", textAlign: "left", transition: "border-color .12s, background .12s" }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--quest-gold-hi)" }}>CR {crLabel(m.cr)}</div>
                      <div style={{ fontSize: 10, color: "var(--text-low)" }}>{m.xp} XP</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-hi)" }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-low)" }}>{TYPE_LABEL[m.type]} · {m.size} · CA {m.ac} · {m.hp} HP</div>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-low)", maxWidth: 120, textAlign: "right", lineHeight: 1.3 }}>
                      {m.environment.slice(0, 2).map(e => e.charAt(0).toUpperCase() + e.slice(1)).join(", ")}
                    </div>
                    {inEncounter && (
                      <div style={{ fontSize: 12, color: "var(--quest-gold-hi)", fontWeight: 700, background: "rgba(214,168,79,0.15)", borderRadius: 4, padding: "2px 8px" }}>×{inEncounter.count}</div>
                    )}
                    <Ico name="plus" size={14} color={inEncounter ? "var(--quest-gold-hi)" : "var(--text-low)"}/>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="lo-card" style={{ padding: 32, textAlign: "center" }}>
                  <Ico name="search" size={24} color="var(--text-low)"/>
                  <p style={{ color: "var(--text-low)", margin: "10px 0 0" }}>Sin resultados para los filtros actuales.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Encounter summary */}
          <div style={{ position: "sticky", top: 20 }}>
            {/* Difficulty card */}
            <div className="lo-card" style={{ padding: 20, marginBottom: 16, borderColor: diffCfg ? `${diffCfg.color}44` : "var(--border-lo)" }}>
              <h3 style={{ fontSize: 12, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>Calibración del encuentro</h3>

              {encounter.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--text-low)", textAlign: "center", padding: "16px 0" }}>
                  Agrega monstruos del bestiario para calcular la dificultad.
                </p>
              ) : (
                <>
                  <div style={{ textAlign: "center", padding: "12px 0 16px", borderBottom: "1px solid var(--border-lo)", marginBottom: 16 }}>
                    {diffCfg && (
                      <>
                        <div style={{ fontSize: 28, fontWeight: 800, color: diffCfg.color, letterSpacing: "0.04em" }}>{diffCfg.label.toUpperCase()}</div>
                        <div style={{ fontSize: 12, color: "var(--text-low)", marginTop: 4 }}>Dificultad estimada</div>
                      </>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                    {[
                      ["XP base", totalRawXp.toLocaleString()],
                      ["Multiplicador", `×${xpMultiplier(encounter.reduce((s,e) => s + e.count, 0))}`],
                      ["XP ajustado", totalAdjustedXp.toLocaleString()],
                      ["Monstruos", encounter.reduce((s,e) => s + e.count, 0).toString()],
                    ].map(([label, value]) => (
                      <div key={label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 6, padding: "8px 10px" }}>
                        <div style={{ fontSize: 10, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-hi)", marginTop: 2 }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Encounter list */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                    {encounter.map(entry => (
                      <div key={entry.monster.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid var(--border-lo)" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-hi)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.monster.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-low)" }}>CR {crLabel(entry.monster.cr)} · {(crToXp(entry.monster.cr) * entry.count).toLocaleString()} XP</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                          <button type="button" onClick={() => setCount(entry.monster.id, entry.count - 1)} style={{ width: 22, height: 22, borderRadius: 4, border: "1px solid var(--border-lo)", background: "transparent", color: "var(--text-mid)", fontSize: 14, cursor: "pointer", display: "grid", placeItems: "center" }}>−</button>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-hi)", minWidth: 18, textAlign: "center" }}>{entry.count}</span>
                          <button type="button" onClick={() => setCount(entry.monster.id, entry.count + 1)} style={{ width: 22, height: 22, borderRadius: 4, border: "1px solid var(--border-lo)", background: "transparent", color: "var(--text-mid)", fontSize: 14, cursor: "pointer", display: "grid", placeItems: "center" }}>+</button>
                        </div>
                        <button type="button" onClick={() => setCount(entry.monster.id, 0)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-low)", padding: 2 }}>
                          <Ico name="x" size={13}/>
                        </button>
                      </div>
                    ))}
                  </div>

                  <button type="button" className="lo-btn lo-btn-ghost" onClick={clearEncounter} style={{ width: "100%", fontSize: 12, color: "#C28F8F" }}>
                    <Ico name="trash" size={12}/> Limpiar encuentro
                  </button>
                </>
              )}
            </div>

            {/* Launch to combat tracker */}
            <button
              type="button"
              className="lo-btn lo-btn-primary"
              disabled={encounter.length === 0}
              onClick={() => {
                const data = encounter.map(e => ({ monsterId: e.monster.id, count: e.count }));
                sessionStorage.setItem("lo-pending-encounter", JSON.stringify(data));
                router.push("/combat");
              }}
              style={{ width: "100%", opacity: encounter.length === 0 ? 0.4 : 1 }}
            >
              <Ico name="sword" size={14}/> Lanzar al Combat Tracker
            </button>

            {/* Quick links */}
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
              <Link href="/campaigns" className="lo-btn lo-btn-ghost" style={{ fontSize: 12, justifyContent: "center" }}>
                <Ico name="shield" size={13}/> Ir a Campañas
              </Link>
              <Link href="/encyclopedia" className="lo-btn lo-btn-ghost" style={{ fontSize: 12, justifyContent: "center" }}>
                <Ico name="eye" size={13}/> Enciclopedia
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
