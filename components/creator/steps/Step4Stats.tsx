"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { WizardShell } from "../WizardShell";
import { LivePreview } from "../LivePreview";
import { CLASSES } from "@/data/classes";
import { RACES } from "@/data/races";
import { SUBRACES } from "@/data/subraces";
import { STAT_KEYS, STAT_LABELS, STANDARD_ARRAY, modOf, fmtMod } from "@/types/character";
import type { CharacterDraft, StatKey } from "@/types/character";

export function Step4Stats({ draft, id }: { draft: CharacterDraft; id: string }) {
  const { dispatch } = useApp();
  const [swapFrom, setSwapFrom] = useState<StatKey | null>(null);
  const up = (patch: Partial<CharacterDraft>) => dispatch({ type: "DRAFT_UPDATE", patch });

  const cls = CLASSES.find(c => c.id === draft.classId);
  const race = RACES.find(r => r.id === draft.raceId);
  const subrace = SUBRACES.find(s => s.id === draft.subraceId);

  const getRaceBonus = (k: StatKey): number => {
    if (!race) return 0;
    const asi = race.asi ?? {};
    return (("all" in asi ? asi.all ?? 0 : 0)) + ((asi as Record<string, number>)[k] ?? 0);
  };
  const getSubraceBonus = (k: StatKey): number => {
    if (!subrace) return 0;
    const asi = (subrace.asi ?? {}) as Record<string, number>;
    return asi[k] ?? 0;
  };

  const handleStatClick = (k: StatKey) => {
    if (!swapFrom) {
      setSwapFrom(k);
      return;
    }
    if (swapFrom === k) {
      setSwapFrom(null);
      return;
    }
    const a = draft.baseStats[swapFrom] ?? 10;
    const b = draft.baseStats[k] ?? 10;
    up({ baseStats: { ...draft.baseStats, [swapFrom]: b, [k]: a } });
    setSwapFrom(null);
  };

  const STAT_COLOR: Record<string, string> = {
    FUE: "#e57373", DES: "#81c784", CON: "#ffb74d",
    INT: "#64b5f6", SAB: "#ce93d8", CAR: "#f48fb1",
  };

  return (
    <WizardShell id={id} step={4} title="Distribuye tus estadísticas"
      sub="Los valores del array estándar ya están asignados. Toca dos stats para intercambiarlos. Las bonificaciones de raza se aplican automáticamente."
      preview={<LivePreview draft={draft} currentStep={4}/>}
      canProceed>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 22, alignItems: "start" }}>

        {/* stat cards */}
        <div>
          {swapFrom && (
            <div style={{ marginBottom: 12, padding: "8px 14px", borderRadius: 8, fontSize: 12,
              background: "rgba(214,168,79,0.10)", border: "1px solid var(--quest-gold)",
              color: "var(--quest-gold-hi)" }}>
              {STAT_LABELS[swapFrom]} seleccionado — toca otro stat para intercambiar valores.
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {STAT_KEYS.map(k => {
              const base = draft.baseStats[k] ?? 10;
              const raceB = getRaceBonus(k);
              const subB = getSubraceBonus(k);
              const total = base + raceB + subB;
              const m = modOf(total);
              const isPrimary = cls?.primary?.includes(k);
              const isSelected = swapFrom === k;

              return (
                <div key={k} onClick={() => handleStatClick(k)} style={{
                  padding: "18px 14px", borderRadius: 12, textAlign: "center", cursor: "pointer",
                  border: isSelected ? "2px solid var(--quest-gold)" : "1px solid var(--line-strong)",
                  background: isSelected ? "rgba(214,168,79,0.12)" : "rgba(244,231,197,0.04)",
                  position: "relative", transition: "border-color 0.15s" }}>
                  {isPrimary && (
                    <span style={{ position: "absolute", top: 6, right: 6, fontSize: 8, padding: "2px 5px",
                      borderRadius: 999, background: "rgba(214,168,79,0.15)", color: "var(--quest-gold-hi)" }}>
                      Principal
                    </span>
                  )}
                  {isSelected && (
                    <span style={{ position: "absolute", top: 6, left: 6, fontSize: 8, padding: "2px 5px",
                      borderRadius: 999, background: "rgba(214,168,79,0.25)", color: "var(--quest-gold-hi)" }}>
                      ✓
                    </span>
                  )}
                  <div style={{ fontSize: 10, color: "var(--text-low)", letterSpacing: "0.1em", marginBottom: 4 }}>
                    {STAT_LABELS[k].toUpperCase()}
                  </div>
                  <div style={{ fontSize: 48, fontFamily: "var(--font-display)", lineHeight: 1,
                    color: STAT_COLOR[k] ?? "var(--text-hi)" }}>
                    {total}
                  </div>
                  <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--text-mid)", marginTop: 2 }}>
                    {fmtMod(m)}
                  </div>
                  {(raceB + subB) !== 0 && (
                    <div style={{ fontSize: 9, color: "var(--text-low)", marginTop: 4 }}>
                      {base} +{raceB + subB} raza
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* sidebar */}
        <div style={{ width: 200 }}>
          <div className="lo-label" style={{ marginBottom: 8 }}>Array estándar</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 16 }}>
            {STANDARD_ARRAY.map(v => {
              const isUsed = Object.values(draft.baseStats).includes(v);
              return (
                <div key={v} style={{ padding: "6px 10px", borderRadius: 6, textAlign: "center",
                  fontFamily: "var(--font-display)", fontSize: 16,
                  background: "rgba(244,231,197,0.04)",
                  color: isUsed ? "var(--text-low)" : "var(--text-hi)",
                  border: `1px solid ${isUsed ? "var(--line-strong)" : "rgba(214,168,79,0.3)"}` }}>
                  {v}
                </div>
              );
            })}
          </div>
          {cls?.primary && (
            <div>
              <div className="lo-label" style={{ marginBottom: 6 }}>Stats principales</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
                {cls.primary.map(s => (
                  <span key={s} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6,
                    background: "rgba(214,168,79,0.08)", color: "var(--quest-gold-hi)" }}>{s}</span>
                ))}
              </div>
              <p style={{ fontSize: 11, color: "var(--text-low)", lineHeight: 1.5 }}>
                Pon los valores más altos en estos stats.
              </p>
            </div>
          )}
          <div style={{ marginTop: 16, padding: "10px 12px", borderRadius: 8,
            background: "rgba(244,231,197,0.03)", border: "1px solid var(--line-strong)" }}>
            <div style={{ fontSize: 10, color: "var(--text-low)", lineHeight: 1.5 }}>
              Toca un stat y luego otro para intercambiar sus valores.
            </div>
          </div>
        </div>
      </div>
    </WizardShell>
  );
}
