"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { MONSTERS } from "@/data/monsters";
import type { Monster } from "@/types/monster";
import {
  newCombatant, newCombatState, resolveCombatantLife,
  sortCombatantsByInitiative, addCondition, removeCondition, tickConditionDurations,
  CONDITION_LABEL, CONDITION_COLOR, CONDITION_ICON, CONDITION_TYPES,
  type Combatant, type CombatState, type CombatantType, type ConditionType,
} from "@/types/combat";

// ── Helpers ──────────────────────────────────────────────────
const TYPE_COLOR: Record<CombatantType, string> = {
  player: "var(--arcane-blue-hi)", monster: "#C28F8F",
  npc: "var(--quest-gold-hi)", custom: "var(--text-mid)",
};
const TYPE_LABEL: Record<CombatantType, string> = {
  player: "PJ", monster: "Monstruo", npc: "NPC", custom: "Custom",
};

function hpPct(c: Combatant) { return c.maxHp > 0 ? Math.round((c.hp / c.maxHp) * 100) : 0; }
function hpColor(pct: number) {
  if (pct > 60) return "#A3C28F";
  if (pct > 30) return "var(--quest-gold-hi)";
  return "#C28F8F";
}
function crLabel(cr: number) {
  if (cr === 0.125) return "1/8"; if (cr === 0.25) return "1/4"; if (cr === 0.5) return "1/2";
  return String(cr);
}
function rollD20(bonus = 0) { return Math.floor(Math.random() * 20) + 1 + bonus; }

// ── Component ─────────────────────────────────────────────────
export default function CombatTrackerPage() {
  const [combat, setCombat] = useState<CombatState>(newCombatState());
  const [showAdd, setShowAdd] = useState(false);
  const [addTab, setAddTab] = useState<"manual" | "monster">("manual");
  const [manualForm, setManualForm] = useState({ name: "", initiative: "", hp: "", ac: "10", type: "custom" as CombatantType });
  const [monsterSearch, setMonsterSearch] = useState("");
  const [condOpen, setCondOpen] = useState<string | null>(null);
  const [dmgInputs, setDmgInputs] = useState<Record<string, string>>({});
  const [logOpen, setLogOpen] = useState(false);

  // Load encounter from encounter builder
  useEffect(() => {
    const raw = sessionStorage.getItem("lo-pending-encounter");
    if (!raw) return;
    try {
      const entries = JSON.parse(raw) as { monsterId: string; count: number }[];
      const combatants = entries.flatMap(({ monsterId, count }) => {
        const m = MONSTERS.find(x => x.id === monsterId);
        if (!m) return [];
        return Array.from({ length: count }, (_, i) => {
          const init = rollD20(Math.floor((m.stats.DES - 10) / 2));
          return newCombatant({ name: count > 1 ? `${m.name} ${i + 1}` : m.name, initiative: init, hp: m.hp, maxHp: m.hp, ac: m.ac, type: "monster", monsterId: m.id });
        });
      });
      if (combatants.length > 0) {
        const timer = window.setTimeout(() => {
          setCombat(prev => ({ ...prev, combatants: sortCombatantsByInitiative([...prev.combatants, ...combatants]) }));
          sessionStorage.removeItem("lo-pending-encounter");
        }, 0);
        return () => window.clearTimeout(timer);
      }
    } catch { /* ignore */ }
  }, []);

  const appendLog = useCallback((msg: string) => {
    setCombat(prev => ({ ...prev, log: [`R${prev.round}: ${msg}`, ...prev.log].slice(0, 100) }));
  }, []);

  // ── Actions ──────────────────────────────────────────────────
  const addManual = () => {
    const name = manualForm.name.trim();
    if (!name) return;
    const initiative = parseInt(manualForm.initiative) || 0;
    const hp = Math.max(1, parseInt(manualForm.hp) || 1);
    const ac = Math.max(0, parseInt(manualForm.ac) || 10);
    const c = newCombatant({ name, initiative, hp, maxHp: hp, ac, type: manualForm.type });
    setCombat(prev => ({ ...prev, combatants: sortCombatantsByInitiative([...prev.combatants, c]) }));
    appendLog(`${name} se unió al combate`);
    setManualForm({ name: "", initiative: "", hp: "", ac: "10", type: "custom" });
    setShowAdd(false);
  };

  const addMonsterEntry = (m: Monster) => {
    const init = rollD20(Math.floor((m.stats.DES - 10) / 2));
    const c = newCombatant({ name: m.name, initiative: init, hp: m.hp, maxHp: m.hp, ac: m.ac, type: "monster", monsterId: m.id });
    setCombat(prev => ({ ...prev, combatants: sortCombatantsByInitiative([...prev.combatants, c]) }));
    appendLog(`${m.name} entró al combate (init ${init})`);
    setShowAdd(false);
  };

  const startCombat = () => {
    setCombat(prev => ({ ...prev, combatants: sortCombatantsByInitiative(prev.combatants), isRunning: true, activeIndex: 0 }));
    appendLog("⚔ Combate iniciado");
  };

  const nextTurn = () => {
    setCombat(prev => {
      if (prev.combatants.length === 0) return prev;
      const combatants = prev.combatants.map((c, i) => i === prev.activeIndex ? tickConditionDurations(c) : c);
      let next = (prev.activeIndex + 1) % combatants.length;
      let loops = 0;
      while (!combatants[next]?.isAlive && loops < combatants.length) { next = (next + 1) % combatants.length; loops++; }
      const nextRound = next <= prev.activeIndex ? prev.round + 1 : prev.round;
      const roundEntry = next <= prev.activeIndex ? [`R${nextRound}: ⏱ Ronda ${nextRound}`] : [];
      return {
        ...prev, combatants, activeIndex: next, round: nextRound,
        log: [...roundEntry, `R${next <= prev.activeIndex ? nextRound : prev.round}: Turno → ${combatants[next]?.name ?? "?"}`, ...prev.log].slice(0, 100),
      };
    });
  };

  const prevTurn = () => {
    setCombat(prev => {
      if (prev.combatants.length === 0) return prev;
      const prevIdx = (prev.activeIndex - 1 + prev.combatants.length) % prev.combatants.length;
      const prevRound = prevIdx >= prev.activeIndex ? Math.max(1, prev.round - 1) : prev.round;
      return { ...prev, activeIndex: prevIdx, round: prevRound };
    });
  };

  const applyDmg = (id: string, delta: number) => {
    setCombat(prev => ({
      ...prev,
      combatants: prev.combatants.map(c => {
        if (c.id !== id) return c;
        if (delta < 0) {
          const dmg = -delta;
          let { tempHp, hp } = c;
          if (tempHp > 0) { const ft = Math.min(tempHp, dmg); tempHp -= ft; hp = Math.max(0, hp - (dmg - ft)); }
          else hp = Math.max(0, hp - dmg);
          return resolveCombatantLife({ ...c, hp, tempHp });
        }
        return resolveCombatantLife({ ...c, hp: Math.min(c.maxHp, c.hp + delta), deathSaves: { successes: 0, failures: 0 } });
      }),
    }));
    const name = combat.combatants.find(c => c.id === id)?.name ?? "?";
    appendLog(delta < 0 ? `${name} recibe ${-delta} de daño` : `${name} cura ${delta} HP`);
  };

  const handleDmgInput = (id: string, isDmg: boolean) => {
    const val = parseInt(dmgInputs[id] || "0");
    if (!val || val <= 0) return;
    applyDmg(id, isDmg ? -val : val);
    setDmgInputs(prev => ({ ...prev, [id]: "" }));
  };

  const toggleCondition = (id: string, type: ConditionType) => {
    setCombat(prev => ({
      ...prev,
      combatants: prev.combatants.map(c => {
        if (c.id !== id) return c;
        const has = c.conditions.some(cond => cond.type === type);
        return has ? removeCondition(c, type) : addCondition(c, { type });
      }),
    }));
  };

  const updateDeathSave = (id: string, key: "successes" | "failures", val: number) => {
    setCombat(prev => ({
      ...prev,
      combatants: prev.combatants.map(c => {
        if (c.id !== id) return c;
        const deathSaves = { ...c.deathSaves, [key]: Math.min(3, Math.max(0, val)) };
        return resolveCombatantLife({ ...c, deathSaves });
      }),
    }));
  };

  const removeCombatant = (id: string) => {
    setCombat(prev => {
      const idx = prev.combatants.findIndex(c => c.id === id);
      const next = prev.combatants.filter(c => c.id !== id);
      const newActive = Math.min(idx <= prev.activeIndex ? Math.max(0, prev.activeIndex - 1) : prev.activeIndex, Math.max(0, next.length - 1));
      return { ...prev, combatants: next, activeIndex: newActive };
    });
  };

  const endCombat = () => {
    if (confirm("¿Finalizar combate? Se borrarán todos los combatientes.")) {
      setCombat(newCombatState());
    }
  };

  const filteredMonsters = useMemo(() => {
    const q = monsterSearch.toLowerCase();
    if (!q) return MONSTERS;
    return MONSTERS.filter(m => m.name.toLowerCase().includes(q) || m.type.includes(q));
  }, [monsterSearch]);

  const activeCombatant = combat.combatants[combat.activeIndex];

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 80px" }}>
      <TopBar crumb={["LVL ONE", "Combat Tracker"]}/>
      <div style={{ padding: "16px 24px 0", maxWidth: 860, margin: "0 auto" }}>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ fontVariantNumeric: "tabular-nums", fontSize: 20, fontWeight: 800, color: "var(--quest-gold-hi)", minWidth: 90 }}>
            Ronda {combat.round}
          </div>
          <div style={{ display: "flex", gap: 6, flex: 1, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="lo-btn lo-btn-ghost" onClick={prevTurn} disabled={!combat.isRunning || combat.combatants.length === 0} style={{ padding: "6px 12px" }}>
              <Ico name="arrowLeft" size={13}/> Prev
            </button>
            {!combat.isRunning ? (
              <button className="lo-btn lo-btn-primary" onClick={startCombat} disabled={combat.combatants.length === 0}>
                <Ico name="sword" size={13}/> Iniciar combate
              </button>
            ) : (
              <button className="lo-btn lo-btn-primary" onClick={nextTurn} style={{ minWidth: 150 }}>
                Siguiente turno <Ico name="arrow" size={13}/>
              </button>
            )}
            <button className="lo-btn lo-btn-ghost" onClick={endCombat} style={{ color: "#C28F8F", padding: "6px 12px" }}>
              <Ico name="x" size={13}/> Terminar
            </button>
          </div>
          <button className="lo-btn lo-btn-ghost" onClick={() => setShowAdd(true)} style={{ flexShrink: 0 }}>
            <Ico name="plus" size={13}/> Añadir
          </button>
        </div>

        {/* Active combatant banner */}
        {combat.isRunning && activeCombatant && (
          <div style={{ marginBottom: 14, padding: "10px 16px", background: "rgba(214,168,79,0.08)", border: "1px solid rgba(214,168,79,0.4)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, color: "var(--quest-gold-hi)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>▶ Turno activo</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-hi)" }}>{activeCombatant.name}</span>
            <span style={{ fontSize: 12, color: TYPE_COLOR[activeCombatant.type] }}>{TYPE_LABEL[activeCombatant.type]}</span>
            <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--quest-gold-hi)", fontWeight: 600 }}>{activeCombatant.hp}/{activeCombatant.maxHp} HP · CA {activeCombatant.ac}</span>
          </div>
        )}

        {/* Combatant list */}
        {combat.combatants.length === 0 ? (
          <div className="lo-card" style={{ padding: 48, textAlign: "center" }}>
            <Ico name="sword" size={32} color="var(--text-low)"/>
            <p style={{ color: "var(--text-mid)", margin: "14px 0 20px" }}>Sin combatientes. Añade personajes o monstruos para empezar.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button className="lo-btn lo-btn-primary" onClick={() => setShowAdd(true)}><Ico name="plus" size={13}/> Añadir combatiente</button>
              <Link href="/encounter-builder" className="lo-btn lo-btn-ghost"><Ico name="search" size={13}/> Encounter Builder</Link>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {combat.combatants.map((c, idx) => {
              const isActive = idx === combat.activeIndex && combat.isRunning;
              const pct = hpPct(c);
              const hcol = hpColor(pct);
              const showDS = c.type === "player" && c.hp === 0 && c.isAlive;
              return (
                <div key={c.id} style={{ borderRadius: 10, border: `1px solid ${isActive ? "rgba(214,168,79,0.6)" : c.isAlive ? "var(--border-lo)" : "rgba(194,143,143,0.2)"}`, background: isActive ? "rgba(214,168,79,0.05)" : c.isAlive ? "var(--card)" : "rgba(0,0,0,0.15)", opacity: c.isAlive ? 1 : 0.55, padding: "10px 14px", transition: "border-color .15s, background .15s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

                    {/* Initiative badge */}
                    <div style={{ textAlign: "center", flexShrink: 0, minWidth: 36 }}>
                      {isActive && <div style={{ fontSize: 8, color: "var(--quest-gold-hi)", fontWeight: 700, letterSpacing: "0.1em" }}>▶ ACT</div>}
                      <div style={{ fontSize: 16, fontWeight: 800, color: isActive ? "var(--quest-gold-hi)" : "var(--text-hi)" }}>{c.initiative}</div>
                      <div style={{ fontSize: 9, color: "var(--text-low)" }}>INIT</div>
                    </div>

                    {/* Name + HP */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: c.isAlive ? "var(--text-hi)" : "var(--text-low)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                        <span style={{ fontSize: 10, color: TYPE_COLOR[c.type], padding: "1px 5px", border: `1px solid ${TYPE_COLOR[c.type]}44`, borderRadius: 3, flexShrink: 0 }}>{TYPE_LABEL[c.type]}</span>
                        {!c.isAlive && <span style={{ fontSize: 10, color: "#C28F8F", fontWeight: 700, flexShrink: 0 }}>MUERTO</span>}
                        {c.concentration && <span style={{ fontSize: 10, color: "var(--arcane-blue-hi)", flexShrink: 0 }}>CONC</span>}
                      </div>
                      {c.isAlive && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: hcol, borderRadius: 3, transition: "width .2s" }}/>
                          </div>
                          <span style={{ fontSize: 11, color: hcol, fontWeight: 600, minWidth: 52, textAlign: "right" }}>{c.hp}/{c.maxHp}</span>
                          {c.tempHp > 0 && <span style={{ fontSize: 10, color: "var(--arcane-blue-hi)" }}>+{c.tempHp}t</span>}
                        </div>
                      )}
                      {/* Conditions */}
                      {c.conditions.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 4 }}>
                          {c.conditions.map(cond => (
                            <button key={cond.type} onClick={() => toggleCondition(c.id, cond.type)} title={`Quitar ${CONDITION_LABEL[cond.type]}`} style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, border: `1px solid ${CONDITION_COLOR[cond.type]}66`, background: `${CONDITION_COLOR[cond.type]}20`, color: CONDITION_COLOR[cond.type], cursor: "pointer", display: "flex", alignItems: "center", gap: 2 }}>
                              <Ico name={CONDITION_ICON[cond.type]} size={8}/> {CONDITION_LABEL[cond.type]} ×
                            </button>
                          ))}
                        </div>
                      )}
                      {/* Death saves */}
                      {showDS && (
                        <div style={{ display: "flex", gap: 14, marginTop: 5 }}>
                          {(["successes", "failures"] as const).map(key => (
                            <div key={key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <span style={{ fontSize: 9, color: key === "successes" ? "#A3C28F" : "#C28F8F" }}>{key === "successes" ? "Éxitos" : "Fallos"}:</span>
                              {[1, 2, 3].map(n => (
                                <button key={n} onClick={() => updateDeathSave(c.id, key, c.deathSaves[key] >= n ? n - 1 : n)} style={{ width: 13, height: 13, borderRadius: "50%", border: `1px solid ${key === "successes" ? "#A3C28F" : "#C28F8F"}`, background: c.deathSaves[key] >= n ? (key === "successes" ? "#A3C28F" : "#C28F8F") : "transparent", cursor: "pointer" }}/>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* AC */}
                    <div style={{ textAlign: "center", flexShrink: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-hi)" }}>{c.ac}</div>
                      <div style={{ fontSize: 9, color: "var(--text-low)" }}>CA</div>
                    </div>

                    {/* Damage/heal */}
                    {c.isAlive && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                        <input type="number" min="0" value={dmgInputs[c.id] ?? ""} onChange={e => setDmgInputs(p => ({ ...p, [c.id]: e.target.value }))} placeholder="0" style={{ width: 44, background: "var(--input-bg, rgba(255,255,255,0.05))", border: "1px solid var(--border-lo)", borderRadius: 5, padding: "3px 5px", color: "var(--text-hi)", fontSize: 12, textAlign: "center" }}/>
                        <button onClick={() => handleDmgInput(c.id, true)} title="Daño" style={{ padding: "4px 7px", borderRadius: 5, border: "1px solid rgba(194,143,143,0.5)", background: "rgba(194,143,143,0.1)", color: "#C28F8F", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>-HP</button>
                        <button onClick={() => handleDmgInput(c.id, false)} title="Curar" style={{ padding: "4px 7px", borderRadius: 5, border: "1px solid rgba(163,194,143,0.5)", background: "rgba(163,194,143,0.1)", color: "#A3C28F", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>+HP</button>
                      </div>
                    )}

                    {/* Condition toggle + remove */}
                    <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
                      <button onClick={() => setCondOpen(condOpen === c.id ? null : c.id)} title="Condiciones" style={{ padding: "4px 7px", borderRadius: 5, border: "1px solid var(--border-lo)", background: condOpen === c.id ? "rgba(214,168,79,0.12)" : "transparent", color: condOpen === c.id ? "var(--quest-gold-hi)" : "var(--text-low)", cursor: "pointer" }}>
                        <Ico name="zap" size={12}/>
                      </button>
                      <button onClick={() => removeCombatant(c.id)} title="Eliminar" style={{ padding: "4px 5px", background: "none", border: "none", color: "var(--text-low)", cursor: "pointer" }}>
                        <Ico name="x" size={12}/>
                      </button>
                    </div>
                  </div>

                  {/* Condition picker */}
                  {condOpen === c.id && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border-lo)", display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {CONDITION_TYPES.map(type => {
                        const has = c.conditions.some(cd => cd.type === type);
                        return (
                          <button key={type} onClick={() => toggleCondition(c.id, type)} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, border: `1px solid ${has ? CONDITION_COLOR[type] : "var(--border-lo)"}`, background: has ? `${CONDITION_COLOR[type]}22` : "transparent", color: has ? CONDITION_COLOR[type] : "var(--text-low)", cursor: "pointer", transition: "all .1s" }}>
                            {CONDITION_LABEL[type]}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Log */}
        {combat.log.length > 0 && (
          <div className="lo-card" style={{ padding: 14, marginTop: 16 }}>
            <button onClick={() => setLogOpen(v => !v)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "var(--text-low)", fontSize: 12, width: "100%" }}>
              <Ico name="scroll" size={13}/> Registro ({combat.log.length})
              <span style={{ marginLeft: "auto" }}>{logOpen ? "▲" : "▼"}</span>
            </button>
            {logOpen && (
              <div style={{ marginTop: 10, maxHeight: 160, overflowY: "auto" }}>
                {combat.log.map((entry, i) => (
                  <div key={i} style={{ fontSize: 11, color: "var(--text-mid)", padding: "3px 0", borderBottom: "1px solid var(--border-lo)" }}>{entry}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer links */}
        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
          <Link href="/encounter-builder" className="lo-btn lo-btn-ghost" style={{ fontSize: 12 }}><Ico name="search" size={12}/> Encounter Builder</Link>
          <Link href="/campaigns" className="lo-btn lo-btn-ghost" style={{ fontSize: 12 }}><Ico name="shield" size={12}/> Campañas</Link>
        </div>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div onClick={e => e.target === e.currentTarget && setShowAdd(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
          <div className="lo-card" style={{ padding: 24, width: "100%", maxWidth: 500, maxHeight: "88vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>Añadir combatiente</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-low)" }}><Ico name="x" size={16}/></button>
            </div>
            <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
              {(["manual", "monster"] as const).map(tab => (
                <button key={tab} onClick={() => setAddTab(tab)} className={addTab === tab ? "lo-btn lo-btn-primary" : "lo-btn lo-btn-ghost"} style={{ flex: 1, fontSize: 12 }}>
                  {tab === "manual" ? "Manual" : "Bestiario"}
                </button>
              ))}
            </div>

            {addTab === "manual" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: "var(--text-low)", display: "block", marginBottom: 4 }}>Nombre *</label>
                  <input className="lo-input" value={manualForm.name} onChange={e => setManualForm(f => ({ ...f, name: e.target.value }))} onKeyDown={e => e.key === "Enter" && addManual()} placeholder="Ej: Aragorn, Araña Gigante" autoFocus/>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {[["Iniciativa", "initiative", "10"], ["HP máx", "hp", "10"], ["CA", "ac", "10"]].map(([lbl, key, ph]) => (
                    <div key={key}>
                      <label style={{ fontSize: 11, color: "var(--text-low)", display: "block", marginBottom: 4 }}>{lbl}</label>
                      <input className="lo-input" type="number" value={(manualForm as Record<string, string>)[key]} onChange={e => setManualForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph} style={{ fontSize: 13 }}/>
                    </div>
                  ))}
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "var(--text-low)", display: "block", marginBottom: 4 }}>Tipo</label>
                  <select className="lo-input" value={manualForm.type} onChange={e => setManualForm(f => ({ ...f, type: e.target.value as CombatantType }))}>
                    <option value="player">Personaje (PJ)</option>
                    <option value="monster">Monstruo</option>
                    <option value="npc">NPC</option>
                    <option value="custom">Personalizado</option>
                  </select>
                </div>
                <button className="lo-btn lo-btn-primary" onClick={addManual} disabled={!manualForm.name.trim()}>
                  <Ico name="plus" size={13}/> Añadir al combate
                </button>
              </div>
            )}

            {addTab === "monster" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input className="lo-input" value={monsterSearch} onChange={e => setMonsterSearch(e.target.value)} placeholder="Buscar monstruo..." autoFocus/>
                <div style={{ maxHeight: 340, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                  {filteredMonsters.map(m => (
                    <button key={m.id} onClick={() => addMonsterEntry(m)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "var(--card)", border: "1px solid var(--border-lo)", borderRadius: 8, cursor: "pointer", textAlign: "left", transition: "border-color .1s" }}>
                      <div style={{ minWidth: 38 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--quest-gold-hi)" }}>CR {crLabel(m.cr)}</div>
                        <div style={{ fontSize: 9, color: "var(--text-low)" }}>{m.xp} XP</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-hi)" }}>{m.name}</div>
                        <div style={{ fontSize: 10, color: "var(--text-low)" }}>CA {m.ac} · {m.hp} HP</div>
                      </div>
                      <Ico name="plus" size={13} color="var(--text-low)"/>
                    </button>
                  ))}
                  {filteredMonsters.length === 0 && <p style={{ color: "var(--text-low)", fontSize: 12, textAlign: "center", padding: 16 }}>Sin resultados.</p>}
                </div>
                <p style={{ fontSize: 11, color: "var(--text-low)", margin: 0 }}>Se lanza 1d20 + mod DES automáticamente</p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
