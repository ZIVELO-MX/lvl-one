"use client";
import { useState, useCallback } from "react";
import { rollDice } from "@/lib/random";

interface MiniRoll {
  formula: string;
  total: number;
  rolls: number[];
}

const QUICK_DICE = [4, 6, 8, 10, 12, 20] as const;

export function DiceWidget() {
  const [open, setOpen] = useState(false);
  const [mod, setMod] = useState(0);
  const [last, setLast] = useState<MiniRoll | null>(null);
  const [rolling, setRolling] = useState(false);

  const quickRoll = useCallback((faces: number) => {
    setRolling(true);
    setTimeout(() => {
      const r = rollDice(faces, 1, mod);
      setLast({ formula: r.formula, total: r.total, rolls: r.rolls });
      setRolling(false);
    }, 180);
  }, [mod]);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: "fixed", bottom: 20, right: 20, zIndex: 40,
          width: 48, height: 48, borderRadius: "50%", border: "none",
          background: "rgba(212,168,67,0.15)", outline: "2px solid rgba(212,168,67,0.4)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--quest-gold-hi)", fontSize: 22, transition: "all .15s",
          boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
        }}
        title="Lanzar dado"
      >
        ⬡
      </button>

      {/* Mini panel */}
      {open && (
        <div
          style={{
            position: "fixed", bottom: 80, right: 20, zIndex: 40,
            width: 240, background: "var(--surface-hi)", border: "1px solid var(--border-lo)",
            borderRadius: 12, padding: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--quest-gold-hi)" }}>Dado rápido</span>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-low)", fontSize: 16, lineHeight: 1, padding: 2 }}>×</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5, marginBottom: 10 }}>
            {QUICK_DICE.map(d => (
              <button key={d} onClick={() => quickRoll(d)} disabled={rolling} style={{
                padding: "7px 4px", borderRadius: 6, border: "none", cursor: "pointer",
                background: "rgba(255,255,255,0.04)", color: "var(--text-mid)",
                fontSize: 13, fontWeight: 700, transition: "background .1s",
              }}>
                d{d}
              </button>
            ))}
          </div>

          {/* Modifier */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "var(--text-low)" }}>Mod</span>
            <button onClick={() => setMod(m => m - 1)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-mid)", fontSize: 14 }}>−</button>
            <span style={{ fontSize: 13, fontWeight: 700, color: mod >= 0 ? "#A3C28F" : "#C28F8F", minWidth: 28, textAlign: "center" }}>{mod >= 0 ? `+${mod}` : mod}</span>
            <button onClick={() => setMod(m => m + 1)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-mid)", fontSize: 14 }}>+</button>
            {mod !== 0 && <button onClick={() => setMod(0)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-low)", fontSize: 10, marginLeft: "auto" }}>reset</button>}
          </div>

          {/* Last result */}
          {last && (
            <div style={{ textAlign: "center", padding: "8px 0 2px", borderTop: "1px solid var(--border-lo)" }}>
              <div style={{ fontSize: 11, color: "var(--text-low)", marginBottom: 2 }}>{last.formula}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--quest-gold-hi)", lineHeight: 1 }}>{last.total}</div>
              {last.rolls.length > 1 && <div style={{ fontSize: 11, color: "var(--text-low)" }}>[{last.rolls.join(", ")}]</div>}
            </div>
          )}
        </div>
      )}
    </>
  );
}
