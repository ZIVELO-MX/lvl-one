"use client";
import { proficiencyBonusForLevel, hpForLevel, avgHitDie, levelGrantsASI } from "@/types/character";
import type { Character } from "@/types/character";
import { CLASSES } from "@/data/classes";
import { Ico } from "@/components/ui/icons";

interface Props {
  character: Character;
}

export function LevelBenefitsPanel({ character }: Props) {
  const cls = CLASSES.find(c => c.id === character.classId);
  const hitDie = cls ? parseInt(cls.hit.slice(1), 10) : 8;
  const conMod = character.mods?.CON ?? 0;
  const currentLevel = character.level;
  const maxLevel = 20;

  const levels = Array.from({ length: maxLevel }, (_, i) => i + 1);

  return (
    <div className="lo-card-elev" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Ico name="star" size={16} color="var(--quest-gold-hi)"/>
        <h3 style={{ fontSize: 16, margin: 0, color: "var(--text-hi)" }}>Progresión por Nivel</h3>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {levels.map(lvl => {
          const isCurrent = lvl === currentLevel;
          const isPast = lvl < currentLevel;
          const isFuture = lvl > currentLevel;
          const hpAtLevel = hpForLevel(hitDie, conMod, lvl);
          const prof = proficiencyBonusForLevel(lvl);
          const grantsAsi = levelGrantsASI(lvl);
          const hpGain = lvl === 1 ? hitDie + conMod : avgHitDie(hitDie) + conMod;

          return (
            <div key={lvl} style={{
              display: "grid", gridTemplateColumns: "48px 1fr 80px", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 8,
              background: isCurrent ? "rgba(214,168,79,0.08)" : isPast ? "rgba(76,175,80,0.04)" : "rgba(244,231,197,0.02)",
              border: isCurrent ? "1px solid rgba(214,168,79,0.25)" : "1px solid var(--line-strong)",
              opacity: isFuture ? 0.6 : 1
            }}>
              {/* Level badge */}
              <div style={{
                width: 36, height: 36, borderRadius: 999, display: "grid", placeItems: "center",
                background: isCurrent ? "var(--quest-gold)" : isPast ? "var(--moss-green)" : "rgba(244,231,197,0.06)",
                color: isCurrent || isPast ? "#1A130A" : "var(--text-low)",
                fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600
              }}>
                {isPast ? "✓" : lvl}
              </div>

              {/* Info */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: isCurrent ? "var(--quest-gold-hi)" : "var(--text)" }}>
                  Nivel {lvl}
                  {isCurrent && <span style={{ marginLeft: 6, fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "var(--quest-gold)", color: "#1A130A" }}>Actual</span>}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-mid)", marginTop: 2 }}>
                  {lvl === 1 ? (
                    <>PG máximos: <strong style={{ color: "var(--text-hi)" }}>{hpAtLevel}</strong> · Bono prof.: <strong>+{prof}</strong></>
                  ) : (
                    <>
                      +<strong style={{ color: "var(--text-hi)" }}>{hpGain}</strong> PG · Total: <strong>{hpAtLevel}</strong> · Prof. +{prof}
                      {grantsAsi && <span style={{ marginLeft: 8, color: "var(--arcane-blue-hi)" }}>· ASI disponible</span>}
                    </>
                  )}
                </div>
                {grantsAsi && (
                  <div style={{ fontSize: 10, color: "var(--arcane-blue)", marginTop: 2 }}>
                    Puedes subir +2 a una característica o +1 a dos diferentes.
                  </div>
                )}
                {lvl === cls?.subclassLevel && (
                  <div style={{ fontSize: 10, color: "var(--dragon-red)", marginTop: 2 }}>
                    Subclase disponible.
                  </div>
                )}
                {cls?.classFeatures?.filter(f => f.level === lvl).map(f => (
                  <div key={f.id} style={{ fontSize: 10, color: "var(--text-mid)", marginTop: 2 }}>
                    <strong style={{ color: "var(--quest-gold-hi)" }}>{f.name}</strong>
                  </div>
                ))}
              </div>

              {/* Prof badge */}
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 18, fontFamily: "var(--font-display)", color: prof !== proficiencyBonusForLevel(Math.max(1, lvl - 1)) ? "var(--quest-gold-hi)" : "var(--text-mid)" }}>
                  +{prof}
                </div>
                <div style={{ fontSize: 9, color: "var(--text-low)" }}>prof.</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 14, padding: 10, borderRadius: 6, background: "rgba(244,231,197,0.04)", border: "1px solid var(--line-strong)" }}>
        <div style={{ fontSize: 11, color: "var(--text-low)" }}>
          <strong style={{ color: "var(--text-mid)" }}>Nota:</strong> En LVL ONE el máximo es nivel 20. Los rasgos de clase mostrados son los del Manual del Jugador básico.
        </div>
      </div>
    </div>
  );
}
