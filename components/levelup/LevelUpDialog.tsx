"use client";
import { useState } from "react";
import type { Character, StatKey } from "@/types/character";
import { STAT_KEYS, STAT_LABELS, hpForLevel, proficiencyBonusForLevel, avgHitDie, levelGrantsASI } from "@/types/character";
import { CLASSES } from "@/data/classes";
import { SUBCLASSES } from "@/data/subclasses";
import { Ico } from "@/components/ui/icons";

interface Props {
  character: Character;
  onClose: () => void;
  onConfirm: (patch: Partial<Character>) => void;
}

export function LevelUpDialog({ character, onClose, onConfirm }: Props) {
  const currentLevel = character.level;
  const nextLevel = currentLevel + 1;
  const maxLevel = 20;

  // Auto-expand ASI when level grants it
  const grantsASI = levelGrantsASI(nextLevel);
  const [asiMode, setAsiMode] = useState<"none" | "plus2" | "plus1plus1">(grantsASI ? "plus2" : "none");
  const [asiPlus2, setAsiPlus2] = useState<StatKey | null>(null);
  const [asiPlus1a, setAsiPlus1a] = useState<StatKey | null>(null);
  const [asiPlus1b, setAsiPlus1b] = useState<StatKey | null>(null);

  // Subclass selection for level 3 (or matching subclassLevel)
  const cls = CLASSES.find(c => c.id === character.classId);
  const subclassLevel = cls?.subclassLevel ?? 3;
  const unlockingSubclass = nextLevel === subclassLevel && !character.subclassId;
  const [selectedSubclass, setSelectedSubclass] = useState<string | null>(character.subclassId ?? null);

  const availableSubclasses = SUBCLASSES.filter(s => s.classId === character.classId);

  if (currentLevel >= maxLevel) {
    return (
      <div className="levelup-overlay" onClick={onClose}>
        <div className="levelup-card" style={{ padding: 28, maxWidth: 400, width: "90%" }} onClick={e => e.stopPropagation()}>
          <h3 style={{ fontSize: 20, marginBottom: 8 }}>Nivel máximo alcanzado</h3>
          <p style={{ fontSize: 13, color: "var(--text-mid)" }}>Este personaje ya está en nivel {maxLevel}, el máximo disponible en LVL ONE.</p>
          <button className="lo-btn lo-btn-primary" style={{ marginTop: 16, width: "100%" }} onClick={onClose}>Entendido</button>
        </div>
      </div>
    );
  }

  const hitDie = cls ? parseInt(cls.hit.slice(1), 10) : 8;
  const conMod = character.mods?.CON ?? 0;

  const hpGain = avgHitDie(hitDie) + conMod;
  const newHp = hpForLevel(hitDie, conMod, nextLevel);
  const currentProf = proficiencyBonusForLevel(currentLevel);
  const newProf = proficiencyBonusForLevel(nextLevel);
  const profChanged = currentProf !== newProf;

  // Features unlocked at next level
  const newFeatures = cls?.classFeatures?.filter(f => f.level === nextLevel) ?? [];

  // Spell slot progression hint
  const spellProg = cls?.spellcastingProgression;
  const spellSlotsHint = (() => {
    if (!spellProg || !cls.spellcaster) return null;
    if (spellProg.type === "pact") {
      const count = nextLevel < 2 ? 1 : nextLevel < 11 ? 2 : nextLevel < 17 ? 3 : 4;
      const slotLvl = nextLevel < 3 ? 1 : nextLevel < 5 ? 2 : nextLevel < 7 ? 3 : nextLevel < 9 ? 4 : nextLevel < 11 ? 5 : 5;
      return `${count} espacio${count > 1 ? "s" : ""} de nivel ${slotLvl}`;
    }
    if (spellProg.type === "full") {
      const t: Record<number, number[]> = {
        1:[2],2:[3],3:[4,2],4:[4,3],5:[4,3,2],6:[4,3,3],7:[4,3,3,1],8:[4,3,3,2],9:[4,3,3,3,1],10:[4,3,3,3,2],
        11:[4,3,3,3,2,1],12:[4,3,3,3,2,1],13:[4,3,3,3,2,1,1],14:[4,3,3,3,2,1,1],15:[4,3,3,3,2,1,1,1],
        16:[4,3,3,3,2,1,1,1],17:[4,3,3,3,2,1,1,1,1],18:[4,3,3,3,2,1,1,1,1],19:[4,3,3,3,2,1,1,1,1],20:[4,3,3,3,2,1,1,1,1],
      };
      const row = t[nextLevel] ?? [];
      if (row.length === 0) return null;
      const parts = row.map((n, i) => `${n}×Nv.${i + 1}`);
      return parts.join(", ");
    }
    if (spellProg.type === "half") {
      const t: Record<number, number[]> = {2:[2],3:[3],4:[3],5:[4,2],6:[4,2],7:[4,3],8:[4,3],9:[4,3,2],10:[4,3,2],11:[4,3,2],12:[4,3,2],13:[4,3,2,1],14:[4,3,2,1],15:[4,3,2,1],16:[4,3,2,1],17:[4,3,2,1],18:[4,3,2,1],19:[4,3,2,1,1],20:[4,3,2,1,1]};
      const row = t[nextLevel] ?? [];
      if (row.length === 0) return null;
      const parts = row.map((n, i) => `${n}×Nv.${i + 1}`);
      return parts.join(", ");
    }
    return null;
  })();

  const canConfirm = (!grantsASI || (
    asiMode === "plus2" && asiPlus2 !== null ||
    asiMode === "plus1plus1" && asiPlus1a !== null && asiPlus1b !== null && asiPlus1a !== asiPlus1b
  )) && (!unlockingSubclass || selectedSubclass !== null);

  const handleConfirm = () => {
    const patch: Partial<Character> = {
      level: nextLevel,
      hpCurrent: newHp,
    };

    if (unlockingSubclass && selectedSubclass) {
      patch.subclassId = selectedSubclass;
      const chosen = SUBCLASSES.find(s => s.id === selectedSubclass);
      if (chosen?.spells?.length) {
        const currentSpells = character.spells ?? [];
        const newSpells = chosen.spells.filter(s => !currentSpells.includes(s));
        if (newSpells.length > 0) {
          patch.spells = [...currentSpells, ...newSpells];
        }
      }
    }

    if (grantsASI) {
      const currentAsi = { ...character.asiBonuses } as Partial<Record<StatKey, number>>;
      if (asiMode === "plus2" && asiPlus2) {
        currentAsi[asiPlus2] = (currentAsi[asiPlus2] ?? 0) + 2;
      } else if (asiMode === "plus1plus1" && asiPlus1a && asiPlus1b && asiPlus1a !== asiPlus1b) {
        currentAsi[asiPlus1a] = (currentAsi[asiPlus1a] ?? 0) + 1;
        currentAsi[asiPlus1b] = (currentAsi[asiPlus1b] ?? 0) + 1;
      }
      patch.asiBonuses = currentAsi;
    }

    onConfirm(patch);
  };

  return (
    <div className="levelup-overlay" onClick={onClose}>
      <div className="levelup-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "linear-gradient(135deg, var(--quest-gold), var(--dragon-red))",
            display: "grid", placeItems: "center"
          }}>
            <span style={{ display: "inline-block", transform: "rotate(-90deg)" }}>
              <Ico name="arrow" size={18} color="#1A130A"/>
            </span>
          </div>
          <div>
            <h3 style={{ fontSize: 22, margin: 0, lineHeight: 1.2 }}>Subir de Nivel</h3>
            <div style={{ fontSize: 12, color: "var(--text-mid)" }}>Nivel {currentLevel} → Nivel {nextLevel}</div>
          </div>
        </div>

        {/* Benefits summary */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
          <div style={{
            textAlign: "center", padding: "12px 8px", borderRadius: 8,
            background: "rgba(214,168,79,0.08)", border: "1px solid rgba(214,168,79,0.2)"
          }}>
            <div style={{ fontSize: 10, color: "var(--text-low)", letterSpacing: "0.08em" }}>PG GANADOS</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--quest-gold-hi)", lineHeight: 1.2 }}>+{hpGain}</div>
            <div style={{ fontSize: 10, color: "var(--text-low)" }}>Nuevo total: {newHp}</div>
          </div>
          <div style={{
            textAlign: "center", padding: "12px 8px", borderRadius: 8,
            background: profChanged ? "rgba(214,168,79,0.08)" : "rgba(244,231,197,0.03)",
            border: `1px solid ${profChanged ? "rgba(214,168,79,0.2)" : "var(--line-strong)"}`
          }}>
            <div style={{ fontSize: 10, color: "var(--text-low)", letterSpacing: "0.08em" }}>BONO PROF.</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: profChanged ? "var(--quest-gold-hi)" : "var(--text-mid)", lineHeight: 1.2 }}>
              {newProf >= 0 ? `+${newProf}` : newProf}
            </div>
            {profChanged && <div style={{ fontSize: 10, color: "var(--quest-gold-hi)" }}>¡Mejora!</div>}
          </div>
          <div style={{
            textAlign: "center", padding: "12px 8px", borderRadius: 8,
            background: grantsASI ? "rgba(92,122,184,0.08)" : unlockingSubclass ? "rgba(139,26,16,0.08)" : "rgba(244,231,197,0.03)",
            border: `1px solid ${grantsASI ? "rgba(92,122,184,0.25)" : unlockingSubclass ? "rgba(139,26,16,0.25)" : "var(--line-strong)"}`
          }}>
            <div style={{ fontSize: 10, color: "var(--text-low)", letterSpacing: "0.08em" }}>
              {grantsASI ? "ASI" : unlockingSubclass ? "SUBCLASE" : "EXTRA"}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: grantsASI ? "var(--arcane-blue-hi)" : unlockingSubclass ? "var(--dragon-red)" : "var(--text-mid)", lineHeight: 1.2 }}>
              {grantsASI ? "SÍ" : unlockingSubclass ? "SÍ" : "—"}
            </div>
            {grantsASI && <div style={{ fontSize: 10, color: "var(--arcane-blue-hi)" }}>Mejora de característica</div>}
            {unlockingSubclass && <div style={{ fontSize: 10, color: "var(--dragon-red)" }}>Elige especialización</div>}
          </div>
        </div>

        {/* Subclass selection */}
        {unlockingSubclass && availableSubclasses.length > 0 && (
          <div style={{
            marginBottom: 20, padding: 16, borderRadius: 10,
            background: "rgba(139,26,16,0.06)", border: "1px solid rgba(139,26,16,0.2)"
          }}>
            <div style={{ fontSize: 14, color: "var(--dragon-red)", marginBottom: 10, fontWeight: 600 }}>
              <Ico name="star" size={14}/> Elige tu especialización
            </div>
            <p style={{ fontSize: 12, color: "var(--text-mid)", marginBottom: 12 }}>
              Tu clase ({cls?.name}) desbloquea su especialización (subclase) en nivel {subclassLevel}.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {availableSubclasses.map(sub => (
                <button key={sub.id} onClick={() => setSelectedSubclass(sub.id)} style={{
                  padding: "10px 12px", borderRadius: 8, textAlign: "left",
                  border: selectedSubclass === sub.id ? "1px solid var(--dragon-red)" : "1px solid var(--line-strong)",
                  background: selectedSubclass === sub.id ? "rgba(139,26,16,0.12)" : "transparent",
                  color: "var(--text)", fontSize: 12, cursor: "pointer"
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{sub.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-low)", lineHeight: 1.4 }}>{sub.summary}</div>
                  {sub.traits.filter(t => t.level === subclassLevel).map(t => (
                    <div key={t.id} style={{ fontSize: 10, color: "var(--text-mid)", marginTop: 4, paddingLeft: 8, borderLeft: "2px solid rgba(139,26,16,0.3)" }}>
                      <strong>{t.name}</strong>: {t.summary}
                    </div>
                  ))}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Class features unlocked */}
        {newFeatures.length > 0 && (
          <div style={{
            marginBottom: 20, padding: 14, borderRadius: 8,
            background: "rgba(244,231,197,0.04)", border: "1px solid var(--line-strong)"
          }}>
            <div style={{ fontSize: 12, color: "var(--text-hi)", marginBottom: 8, fontWeight: 600 }}>
              <Ico name="sword" size={12}/> Rasgos desbloqueados en nivel {nextLevel}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {newFeatures.map(f => (
                <div key={f.id} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <span style={{ color: "var(--quest-gold-hi)", fontSize: "14px", flexShrink: 0, marginTop: 1 }}>▸</span>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-hi)" }}>{f.name}</span>
                    <p style={{ fontSize: 11, color: "var(--text-mid)", margin: "2px 0 0", lineHeight: 1.4 }}>{f.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spell slots */}
        {cls?.spellcaster && spellProg && spellSlotsHint && (
          <div style={{
            marginBottom: 20, padding: 14, borderRadius: 8,
            background: "rgba(92,122,184,0.06)", border: "1px solid rgba(92,122,184,0.15)"
          }}>
            <div style={{ fontSize: 12, color: "var(--arcane-blue-hi)", marginBottom: 6, fontWeight: 600 }}>
              <Ico name="wand" size={12}/> Magia en nivel {nextLevel}
            </div>
            <p style={{ fontSize: 12, color: "var(--text-mid)", margin: 0 }}>
              <strong>Espacios de conjuro:</strong> {spellSlotsHint}
            </p>
            {spellProg.type !== "pact" && nextLevel >= 2 && (
              <p style={{ fontSize: 11, color: "var(--text-low)", margin: "4px 0 0" }}>
                {spellProg.preparesSpells 
                  ? "Puedes preparar conjuros según tu modificador de " + spellProg.ability + " + nivel de " + cls.name + "."
                  : "Consulta cuántos conjuros conoces según la tabla de tu clase."
                }
              </p>
            )}
          </div>
        )}

        {/* ASI section */}
        {grantsASI && (
          <div style={{
            marginBottom: 20, padding: 16, borderRadius: 10,
            background: "rgba(92,122,184,0.06)", border: "1px solid rgba(92,122,184,0.2)"
          }}>
            <div style={{ fontSize: 14, color: "var(--arcane-blue-hi)", marginBottom: 10, fontWeight: 600 }}>
              Mejora de Característica (ASI)
            </div>
            <p style={{ fontSize: 12, color: "var(--text-mid)", marginBottom: 12 }}>
              Elige cómo repartir 2 puntos entre tus características. Ninguna puede superar 20.
            </p>

            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <button onClick={() => { setAsiMode("plus2"); setAsiPlus1a(null); setAsiPlus1b(null); }} style={{
                flex: 1, padding: "10px 12px", borderRadius: 8,
                border: asiMode === "plus2" ? "1px solid var(--arcane-blue)" : "1px solid var(--line-strong)",
                background: asiMode === "plus2" ? "rgba(92,122,184,0.12)" : "transparent",
                color: "var(--text)", fontSize: 12, cursor: "pointer"
              }}>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>+2 a una</div>
                <div style={{ fontSize: 11, color: "var(--text-low)" }}>Subir una característica +2</div>
              </button>
              <button onClick={() => { setAsiMode("plus1plus1"); setAsiPlus2(null); }} style={{
                flex: 1, padding: "10px 12px", borderRadius: 8,
                border: asiMode === "plus1plus1" ? "1px solid var(--arcane-blue)" : "1px solid var(--line-strong)",
                background: asiMode === "plus1plus1" ? "rgba(92,122,184,0.12)" : "transparent",
                color: "var(--text)", fontSize: 12, cursor: "pointer"
              }}>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>+1 y +1</div>
                <div style={{ fontSize: 11, color: "var(--text-low)" }}>Subir dos características +1</div>
              </button>
            </div>

            {asiMode === "plus2" && (
              <div>
                <div style={{ fontSize: 11, color: "var(--text-low)", marginBottom: 6 }}>Selecciona la característica a mejorar:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {STAT_KEYS.map(k => {
                    const currentTotal = (character.stats?.[k] ?? 10) + (character.asiBonuses?.[k] ?? 0);
                    const wouldBe = currentTotal + 2;
                    const disabled = wouldBe > 20;
                    return (
                      <button key={k} onClick={() => setAsiPlus2(k)} disabled={disabled} style={{
                        padding: "6px 12px", borderRadius: 6,
                        border: asiPlus2 === k ? "1px solid var(--arcane-blue)" : "1px solid var(--line-strong)",
                        background: asiPlus2 === k ? "rgba(92,122,184,0.15)" : disabled ? "rgba(0,0,0,0.2)" : "transparent",
                        color: disabled ? "var(--text-low)" : "var(--text)", fontSize: 12,
                        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1
                      }}>
                        {STAT_LABELS[k]} <span style={{ color: "var(--text-low)" }}>({wouldBe})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {asiMode === "plus1plus1" && (
              <div>
                <div style={{ fontSize: 11, color: "var(--text-low)", marginBottom: 6 }}>Selecciona dos características diferentes:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                  {STAT_KEYS.map(k => {
                    const currentTotal = (character.stats?.[k] ?? 10) + (character.asiBonuses?.[k] ?? 0);
                    const disabled = currentTotal >= 20;
                    return (
                      <button key={k} onClick={() => {
                        if (asiPlus1a === k) { setAsiPlus1a(null); return; }
                        if (asiPlus1b === k) { setAsiPlus1b(null); return; }
                        if (!asiPlus1a) setAsiPlus1a(k);
                        else if (!asiPlus1b && k !== asiPlus1a) setAsiPlus1b(k);
                      }} disabled={disabled} style={{
                        padding: "6px 12px", borderRadius: 6,
                        border: (asiPlus1a === k || asiPlus1b === k) ? "1px solid var(--arcane-blue)" : "1px solid var(--line-strong)",
                        background: (asiPlus1a === k || asiPlus1b === k) ? "rgba(92,122,184,0.15)" : disabled ? "rgba(0,0,0,0.2)" : "transparent",
                        color: disabled ? "var(--text-low)" : "var(--text)", fontSize: 12,
                        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1
                      }}>
                        {STAT_LABELS[k]} <span style={{ color: "var(--text-low)" }}>({currentTotal + ((asiPlus1a === k || asiPlus1b === k) ? 1 : 0)})</span>
                      </button>
                    );
                  })}
                </div>
                {asiPlus1a && asiPlus1b && (
                  <div style={{ fontSize: 12, color: "var(--moss-green)" }}>
                    ✓ {STAT_LABELS[asiPlus1a]} +1 y {STAT_LABELS[asiPlus1b]} +1
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="lo-btn lo-btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="lo-btn lo-btn-primary" onClick={handleConfirm} disabled={!canConfirm} style={{ opacity: canConfirm ? 1 : 0.4 }}>
            Confirmar: Nivel {nextLevel} <Ico name="check" size={12}/>
          </button>
        </div>
      </div>
    </div>
  );
}
