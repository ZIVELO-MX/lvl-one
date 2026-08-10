"use client";
import { useState, useCallback } from "react";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { rollDice } from "@/lib/random";

const DICE = [4, 6, 8, 10, 12, 20, 100] as const;
type DiceFaces = typeof DICE[number];

interface RollEntry {
  id: number;
  formula: string;
  rolls: number[];
  total: number;
  mod: number;
  advantage: "none" | "advantage" | "disadvantage";
  timestamp: number;
}

const DIE_COLORS: Record<number, string> = {
  4: "#A3C28F",
  6: "var(--quest-gold-hi)",
  8: "#C9956A",
  10: "#7BA7BC",
  12: "#B48EAD",
  20: "#C28F8F",
  100: "#8F8FC2",
};

export default function DicePage() {
  const [selected, setSelected] = useState<DiceFaces>(20);
  const [count, setCount] = useState(1);
  const [mod, setMod] = useState(0);
  const [adv, setAdv] = useState<"none" | "advantage" | "disadvantage">("none");
  const [history, setHistory] = useState<RollEntry[]>([]);
  const [rolling, setRolling] = useState(false);
  const [lastResult, setLastResult] = useState<RollEntry | null>(null);

  const roll = useCallback(() => {
    setRolling(true);
    setTimeout(() => {
      let result: RollEntry;

      if (adv !== "none" && selected === 20 && count === 1) {
        const r1 = rollDice(20, 1, mod);
        const r2 = rollDice(20, 1, mod);
        const winner = adv === "advantage"
          ? (r1.rolls[0] >= r2.rolls[0] ? r1 : r2)
          : (r1.rolls[0] <= r2.rolls[0] ? r1 : r2);
        const loser = winner === r1 ? r2 : r1;
        result = {
          id: Date.now(),
          formula: `d20 (${adv === "advantage" ? "ventaja" : "desventaja"})${mod !== 0 ? (mod > 0 ? `+${mod}` : mod) : ""}`,
          rolls: [winner.rolls[0], loser.rolls[0]],
          total: winner.total,
          mod,
          advantage: adv,
          timestamp: Date.now(),
        };
      } else {
        const r = rollDice(selected, count, mod);
        result = {
          id: Date.now(),
          formula: r.formula,
          rolls: r.rolls,
          total: r.total,
          mod,
          advantage: "none",
          timestamp: Date.now(),
        };
      }

      setLastResult(result);
      setHistory(prev => [result, ...prev].slice(0, 30));
      setRolling(false);
    }, 280);
  }, [selected, count, mod, adv]);

  const color = DIE_COLORS[selected];
  const isAdv = adv !== "none" && selected === 20 && count === 1;

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["LVL ONE", "Dados"]}/>
      <div style={{ padding: "24px 32px 0", maxWidth: 800, margin: "0 auto" }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, margin: "0 0 4px" }}>Lanzador de Dados</h1>
          <p style={{ fontSize: 12, color: "var(--text-low)", margin: 0 }}>d4 · d6 · d8 · d10 · d12 · d20 · d100</p>
        </div>

        {/* Die selector */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {DICE.map(d => (
            <button
              type="button"
              key={d}
              onClick={() => { setSelected(d); if (d !== 20) setAdv("none"); }}
              style={{
                padding: "10px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                background: selected === d ? `${DIE_COLORS[d]}22` : "rgba(255,255,255,0.04)",
                outline: selected === d ? `2px solid ${DIE_COLORS[d]}` : "2px solid transparent",
                color: selected === d ? DIE_COLORS[d] : "var(--text-mid)",
                fontSize: 15, fontWeight: 700, transition: "all .15s",
              }}
            >
              d{d}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="lo-card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
            {/* Count */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span id="dice-count-label" style={{ fontSize: 11, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Cantidad</span>
              <div role="group" aria-labelledby="dice-count-label" style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <button type="button" aria-label="Un dado menos" onClick={() => setCount(c => Math.max(1, c - 1))} className="lo-btn lo-btn-ghost" style={{ padding: "4px 10px", fontSize: 16 }}>−</button>
                <span aria-live="polite" style={{ fontSize: 18, fontWeight: 700, color: "var(--text-hi)", minWidth: 28, textAlign: "center" }}>{count}</span>
                <button type="button" aria-label="Un dado más" onClick={() => setCount(c => Math.min(10, c + 1))} className="lo-btn lo-btn-ghost" style={{ padding: "4px 10px", fontSize: 16 }}>+</button>
              </div>
            </div>

            {/* Modifier */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span id="dice-mod-label" style={{ fontSize: 11, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Modificador</span>
              <div role="group" aria-labelledby="dice-mod-label" style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <button type="button" aria-label="Bajar el modificador" onClick={() => setMod(m => m - 1)} className="lo-btn lo-btn-ghost" style={{ padding: "4px 10px", fontSize: 16 }}>−</button>
                <span aria-live="polite" style={{ fontSize: 18, fontWeight: 700, color: mod >= 0 ? "#A3C28F" : "#C28F8F", minWidth: 36, textAlign: "center" }}>{mod >= 0 ? `+${mod}` : mod}</span>
                <button type="button" aria-label="Subir el modificador" onClick={() => setMod(m => m + 1)} className="lo-btn lo-btn-ghost" style={{ padding: "4px 10px", fontSize: 16 }}>+</button>
              </div>
            </div>

            {/* Advantage (only for d20 × 1) */}
            {selected === 20 && count === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span id="dice-adv-label" style={{ fontSize: 11, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Ventaja</span>
                <div role="group" aria-labelledby="dice-adv-label" style={{ display: "flex", gap: 4 }}>
                  {(["none", "advantage", "disadvantage"] as const).map(v => (
                    <button type="button" key={v} onClick={() => setAdv(v)} aria-pressed={adv === v} style={{
                      padding: "5px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11,
                      background: adv === v ? (v === "advantage" ? "rgba(163,194,143,0.2)" : v === "disadvantage" ? "rgba(194,143,143,0.2)" : "rgba(255,255,255,0.08)") : "rgba(255,255,255,0.04)",
                      outline: adv === v ? `1px solid ${v === "advantage" ? "#A3C28F" : v === "disadvantage" ? "#C28F8F" : "var(--border-lo)"}` : "1px solid transparent",
                      color: adv === v ? (v === "advantage" ? "#A3C28F" : v === "disadvantage" ? "#C28F8F" : "var(--text-hi)") : "var(--text-low)",
                    }}>
                      {v === "none" ? "Normal" : v === "advantage" ? "Ventaja" : "Desventaja"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reset */}
            <button type="button" onClick={() => { setCount(1); setMod(0); setAdv("none"); }} className="lo-btn lo-btn-ghost" style={{ fontSize: 12, marginLeft: "auto", alignSelf: "flex-end" }}>
              Resetear
            </button>
          </div>
        </div>

        {/* Roll button + result */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, alignItems: "stretch" }}>
          <button
            type="button"
            onClick={roll}
            disabled={rolling}
            style={{
              flex: "0 0 auto", padding: "18px 32px", borderRadius: 12, border: "none", cursor: rolling ? "not-allowed" : "pointer",
              background: `${color}22`, outline: `2px solid ${color}55`,
              color, fontSize: 18, fontWeight: 700, transition: "all .15s",
              transform: rolling ? "scale(0.95)" : "scale(1)",
            }}
          >
            {rolling ? "..." : `Tirar ${count > 1 ? `${count}` : ""}d${selected}${isAdv ? ` (${adv === "advantage" ? "V" : "D"})` : ""}${mod !== 0 ? (mod > 0 ? `+${mod}` : mod) : ""}`}
          </button>

          {lastResult && (
            <div className="lo-card" style={{ flex: 1, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 11, color: "var(--text-low)" }}>{lastResult.formula}</div>
              <div style={{ fontSize: 36, fontWeight: 800, color, lineHeight: 1 }}>{lastResult.total}</div>
              {lastResult.rolls.length > 1 && (
                <div style={{ fontSize: 12, color: "var(--text-mid)" }}>
                  {lastResult.advantage !== "none"
                    ? `[${lastResult.rolls[0]} ✓, ${lastResult.rolls[1]} ✗]`
                    : `[${lastResult.rolls.join(", ")}]${lastResult.mod !== 0 ? ` ${lastResult.mod >= 0 ? "+" : ""}${lastResult.mod}` : ""}`}
                </div>
              )}
              {lastResult.advantage !== "none" && lastResult.rolls.length === 2 && (
                <div style={{ fontSize: 11, color: "var(--text-low)" }}>
                  Toma el {lastResult.advantage === "advantage" ? "mayor" : "menor"}
                </div>
              )}
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h3 style={{ fontSize: 12, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Historial de la sesión</h3>
              <button type="button" onClick={() => { setHistory([]); setLastResult(null); }} className="lo-btn lo-btn-ghost" style={{ fontSize: 11, padding: "3px 8px" }}>
                <Ico name="trash" size={11}/> Limpiar
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {history.map((e, i) => (
                <div key={e.id} className="lo-card" style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: 10, opacity: i === 0 ? 1 : Math.max(0.4, 1 - i * 0.06) }}>
                  <span style={{ fontSize: 11, color: "var(--text-low)", minWidth: 120 }}>{e.formula}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: DIE_COLORS[e.rolls.length === 1 || e.advantage !== "none" ? 20 : e.rolls[0]] ?? "var(--text-hi)" }}>{e.total}</span>
                  {e.rolls.length > 1 && e.advantage === "none" && (
                    <span style={{ fontSize: 11, color: "var(--text-low)" }}>[{e.rolls.join(", ")}]{e.mod !== 0 ? ` ${e.mod >= 0 ? "+" : ""}${e.mod}` : ""}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
