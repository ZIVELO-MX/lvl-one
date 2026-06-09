"use client";
import { useApp } from "@/lib/store";
import { WizardShell } from "../WizardShell";
import { LivePreview } from "../LivePreview";
import { ALIGNMENTS } from "@/data/backgrounds";
import { CLASSES } from "@/data/classes";
import { SPELLS } from "@/data/spells";
import type { CharacterDraft } from "@/types/character";

const TEXTAREA_STYLE: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: 8, resize: "vertical",
  background: "rgba(244,231,197,0.03)", border: "1px solid var(--line-strong)",
  color: "var(--text)", fontSize: 13, lineHeight: 1.6, fontFamily: "inherit",
  minHeight: 80, boxSizing: "border-box",
};

const SPELL_LIMITS: Record<string, { cantrips: number; spells: number }> = {
  wizard:   { cantrips: 3, spells: 6 },
  sorcerer: { cantrips: 4, spells: 2 },
  bard:     { cantrips: 2, spells: 4 },
  warlock:  { cantrips: 2, spells: 2 },
  cleric:   { cantrips: 3, spells: 0 },
  druid:    { cantrips: 2, spells: 0 },
  paladin:  { cantrips: 0, spells: 2 },
  ranger:   { cantrips: 0, spells: 2 },
};

const SCHOOL_COLORS: Record<string, string> = {
  Evocación: "var(--dragon-red)", Conjuración: "var(--arcane-blue)",
  Abjuración: "var(--moss-green)", Ilusión: "var(--arcane-blue-hi)",
  Transmutación: "var(--quest-gold)", Necromancia: "#9b59b6",
  Adivinación: "var(--quest-gold-hi)", Encantamiento: "var(--moss-green)",
};

export function Step7Story({ draft, id }: { draft: CharacterDraft; id: string }) {
  const { dispatch } = useApp();
  const up = (patch: Partial<CharacterDraft>) => dispatch({ type: "DRAFT_UPDATE", patch });

  const cls = CLASSES.find(c => c.id === draft.classId);
  const isSpellcaster = !!cls?.spellcaster;
  const limits = draft.classId ? (SPELL_LIMITS[draft.classId] ?? { cantrips: 0, spells: 0 }) : { cantrips: 0, spells: 0 };

  const classSpells = SPELLS.filter(s => draft.classId && s.classes.includes(draft.classId));
  const cantrips = classSpells.filter(s => s.level === 0);
  const level1Spells = classSpells.filter(s => s.level === 1);

  const selectedSpells: string[] = draft.spells ?? [];
  const selectedCantrips = cantrips.filter(s => selectedSpells.includes(s.id));
  const selectedL1 = level1Spells.filter(s => selectedSpells.includes(s.id));

  const toggleSpell = (spellId: string, type: "cantrip" | "spell") => {
    const max = type === "cantrip" ? limits.cantrips : limits.spells;
    const group = type === "cantrip" ? cantrips : level1Spells;
    const selectedInGroup = group.filter(s => selectedSpells.includes(s.id));
    if (selectedSpells.includes(spellId)) {
      up({ spells: selectedSpells.filter(id => id !== spellId) });
    } else if (selectedInGroup.length < max) {
      up({ spells: [...selectedSpells, spellId] });
    }
  };

  const ALIGNMENT_TIPS: Record<string, string> = {
    LB: "Orden y bondad. Hace lo que la ley y la moral dictan.", NB: "Hace el bien sin atarse a reglas.",
    CB: "Libertad y bondad. Sigue su corazón.", LN: "Sigue las reglas sin juicios morales.",
    N: "Equilibrio entre fuerzas. Evita extremos.", CN: "Actúa por impulso, sin atarse a convenciones.",
    LM: "Orden al servicio del mal. Calculador y frío.", NM: "Evil sin restricciones, solo por interés propio.",
    CM: "Caos y maldad. Violencia e impulso sin límite.",
  };

  const title = isSpellcaster ? "Hechizos e Historia" : "Historia y personalidad";
  const sub = isSpellcaster
    ? "Elige tus hechizos iniciales y, si quieres, agrega historia y personalidad a tu personaje."
    : "Esta información es opcional pero enriquece muchísimo el roleplay. Todo se puede editar en tu ficha.";

  return (
    <WizardShell id={id} step={7} title={title} sub={sub}
      preview={<LivePreview draft={draft} currentStep={7}/>}
      canProceed>

      {/* ── SPELLS SECTION (spellcasters only) ── */}
      {isSpellcaster && (
        <div style={{ marginBottom: 28 }}>

          {/* Cantrips */}
          {limits.cantrips > 0 && cantrips.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
                <div className="lo-label">Trucos (Cantrips)</div>
                <span style={{ fontSize: 11, color: selectedCantrips.length >= limits.cantrips ? "var(--moss-green)" : "var(--quest-gold-hi)" }}>
                  {selectedCantrips.length}/{limits.cantrips} elegidos
                </span>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-low)", marginBottom: 10 }}>
                Los trucos no gastan espacios de conjuro — puedes lanzarlos sin límite.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {cantrips.map(spell => {
                  const picked = selectedSpells.includes(spell.id);
                  const inGroupCount = selectedCantrips.length;
                  const disabled = !picked && inGroupCount >= limits.cantrips;
                  return (
                    <button type="button" key={spell.id} onClick={() => !disabled && toggleSpell(spell.id, "cantrip")}
                      style={{
                        padding: "12px 10px", borderRadius: 10, textAlign: "left",
                        cursor: disabled ? "default" : "pointer",
                        border: picked ? "1px solid var(--quest-gold)" : "1px solid var(--line-strong)",
                        background: picked ? "rgba(214,168,79,0.10)" : "rgba(244,231,197,0.03)",
                        opacity: disabled ? 0.35 : 1, transition: "opacity 0.15s",
                      }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontFamily: "var(--font-display)", fontSize: 12.5, color: picked ? "var(--quest-gold-hi)" : "var(--text-hi)" }}>
                          {spell.name}
                        </span>
                        <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 999,
                          background: "rgba(244,231,197,0.06)",
                          color: SCHOOL_COLORS[spell.school] ?? "var(--text-low)" }}>
                          {spell.school}
                        </span>
                      </div>
                      {spell.damage && (
                        <div style={{ fontSize: 10, color: "var(--dragon-red)", marginBottom: 3 }}>{spell.damage}</div>
                      )}
                      <div style={{ fontSize: 10.5, color: "var(--text-low)", lineHeight: 1.4 }}>
                        {spell.beginnerSummary}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Level 1 spells */}
          {limits.spells > 0 && level1Spells.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
                <div className="lo-label">Hechizos de Nivel 1</div>
                <span style={{ fontSize: 11, color: selectedL1.length >= limits.spells ? "var(--moss-green)" : "var(--quest-gold-hi)" }}>
                  {selectedL1.length}/{limits.spells} elegidos
                </span>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-low)", marginBottom: 10 }}>
                Los hechizos de nivel 1 gastan espacios de conjuro.
                {cls?.id === "wizard" && " El Mago los copia en su grimorio — puedes aprender más durante la aventura."}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {level1Spells.map(spell => {
                  const picked = selectedSpells.includes(spell.id);
                  const inGroupCount = selectedL1.length;
                  const disabled = !picked && inGroupCount >= limits.spells;
                  return (
                    <button type="button" key={spell.id} onClick={() => !disabled && toggleSpell(spell.id, "spell")}
                      style={{
                        padding: "12px 10px", borderRadius: 10, textAlign: "left",
                        cursor: disabled ? "default" : "pointer",
                        border: picked ? "1px solid var(--arcane-blue-hi)" : "1px solid var(--line-strong)",
                        background: picked ? "rgba(92,122,184,0.12)" : "rgba(244,231,197,0.03)",
                        opacity: disabled ? 0.35 : 1, transition: "opacity 0.15s",
                      }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontFamily: "var(--font-display)", fontSize: 12.5, color: picked ? "var(--arcane-blue-hi)" : "var(--text-hi)" }}>
                          {spell.name}
                        </span>
                        <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 999,
                          background: "rgba(244,231,197,0.06)",
                          color: SCHOOL_COLORS[spell.school] ?? "var(--text-low)" }}>
                          {spell.school}
                        </span>
                      </div>
                      {spell.damage && (
                        <div style={{ fontSize: 10, color: "var(--dragon-red)", marginBottom: 3 }}>{spell.damage}</div>
                      )}
                      {spell.heal && (
                        <div style={{ fontSize: 10, color: "var(--moss-green)", marginBottom: 3 }}>{spell.heal}</div>
                      )}
                      {spell.concentration && (
                        <div style={{ fontSize: 9, color: "var(--text-low)", marginBottom: 3 }}>Concentración</div>
                      )}
                      <div style={{ fontSize: 10.5, color: "var(--text-low)", lineHeight: 1.4 }}>
                        {spell.beginnerSummary}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cleric/Druid: prepares from full list */}
          {limits.cantrips > 0 && limits.spells === 0 && (
            <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(52,78,134,0.10)", border: "1px solid rgba(52,78,134,0.3)", marginTop: 4 }}>
              <p style={{ fontSize: 12, color: "var(--text-mid)", margin: 0, lineHeight: 1.5 }}>
                <span style={{ color: "var(--arcane-blue-hi)", fontWeight: 600 }}>{cls?.name} </span>
                prepara sus hechizos diariamente desde la lista completa de su clase. No necesitas elegir ahora — lo harás antes de cada aventura.
              </p>
            </div>
          )}

          <div style={{ height: 1, background: "var(--line-strong)", margin: "24px 0" }}/>
        </div>
      )}

      {/* ── STORY SECTION ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        {/* alignment */}
        <div>
          <div className="lo-label" style={{ marginBottom: 8 }}>Alineamiento</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 8 }}>
            {ALIGNMENTS.map(([code, label]) => {
              const picked = draft.alignment === code;
              return (
                <button type="button" key={code} onClick={() => up({ alignment: code })} style={{
                  padding: "10px 6px", borderRadius: 8, fontSize: 11, cursor: "pointer", textAlign: "center",
                  border: picked ? "1px solid var(--quest-gold)" : "1px solid var(--line-strong)",
                  background: picked ? "rgba(214,168,79,0.10)" : "transparent",
                  color: picked ? "var(--quest-gold-hi)" : "var(--text-mid)" }}>
                  {label}
                </button>
              );
            })}
          </div>
          {draft.alignment && (
            <p style={{ fontSize: 11, color: "var(--text-low)", lineHeight: 1.5 }}>
              {ALIGNMENT_TIPS[draft.alignment]}
            </p>
          )}
        </div>

        {/* personality fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { key: "story", label: "Historia personal", placeholder: "¿De dónde viene tu personaje? ¿Qué lo llevó a aventurarse?", maxLength: 1000 },
            { key: "ideals", label: "Ideales", placeholder: "¿Qué principios guían sus decisiones?", maxLength: 500 },
            { key: "bonds", label: "Vínculos", placeholder: "¿A quién o qué protege? ¿Qué no puede abandonar?", maxLength: 500 },
            { key: "flaws", label: "Defectos", placeholder: "¿Cuál es su punto débil o vicio que complica las cosas?", maxLength: 500 },
          ].map(({ key, label, placeholder, maxLength }) => (
            <div key={key}>
              <label htmlFor={`field-${key}`} className="lo-label" style={{ display: "block", marginBottom: 5 }}>{label}</label>
              <textarea
                id={`field-${key}`}
                style={TEXTAREA_STYLE}
                placeholder={placeholder}
                maxLength={maxLength}
                value={(draft as unknown as Record<string, string>)[key] ?? ""}
                onChange={e => up({ [key]: e.target.value })}
              />
            </div>
          ))}
        </div>
      </div>
    </WizardShell>
  );
}
