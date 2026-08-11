"use client";
import { useApp } from "@/lib/store";
import { WizardShell } from "../WizardShell";
import { LivePreview } from "../LivePreview";
import { BACKGROUNDS } from "@/data/backgrounds";
import { CLASSES } from "@/data/classes";
import { RACES } from "@/data/races";
import { SUBRACES } from "@/data/subraces";
import { SKILLS_BY_STAT, type CharacterDraft } from "@/types/character";

const ALL_SKILLS = Object.values(SKILLS_BY_STAT).flat().sort((a, b) => a.localeCompare(b));

export function Step5Background({ draft, id }: { draft: CharacterDraft; id: string }) {
  const { dispatch } = useApp();
  const up = (patch: Partial<CharacterDraft>) => dispatch({ type: "DRAFT_UPDATE", patch });

  const cls = CLASSES.find(c => c.id === draft.classId);
  const selected = BACKGROUNDS.find(b => b.id === draft.backgroundId);

  const toggleSkill = (skill: string) => {
    const current = draft.selectedSkills ?? [];
    const maxSkills = cls?.skillChoices?.count ?? 2;
    if (current.includes(skill)) {
      up({ selectedSkills: current.filter(s => s !== skill) });
    } else if (current.length < maxSkills) {
      up({ selectedSkills: [...current, skill] });
    }
  };

  const classSkills = cls?.skillChoices?.options ?? [];
  const maxSkills = cls?.skillChoices?.count ?? 2;
  const bgSkills = selected?.skills ?? [];

  // Habilidades que concede la raza por elección (el semielfo escoge dos
  // cualesquiera). Van en su propia lista para no gastar los huecos de clase.
  const race = RACES.find(r => r.id === draft.raceId);
  const subrace = SUBRACES.find(s => s.id === draft.subraceId);
  // El semielfo elige dos por raza; el humano variante, una por subraza. Se
  // suman: si algún día una raza tuviera ambas, no se perdería ninguna.
  const totalRaceChoices = (race?.skillChoices?.count ?? 0) + (subrace?.skillChoices?.count ?? 0);
  const raceChoice = totalRaceChoices
    ? { count: totalRaceChoices, from: race?.skillChoices?.from ?? subrace?.skillChoices?.from }
    : undefined;
  const raceSkills = draft.raceSkills ?? [];
  const raceOptions = raceChoice?.from ?? ALL_SKILLS;
  // Ya competente por clase o trasfondo: elegirla otra vez no daría nada.
  const yaCompetente = new Set([
    ...bgSkills, ...(draft.selectedSkills ?? []),
    ...(race?.skillProficiencies ?? []), ...(subrace?.skillProficiencies ?? []),
  ]);

  const toggleRaceSkill = (skill: string) => {
    if (raceSkills.includes(skill)) {
      up({ raceSkills: raceSkills.filter(s => s !== skill) });
    } else if (raceSkills.length < (raceChoice?.count ?? 0)) {
      up({ raceSkills: [...raceSkills, skill] });
    }
  };

  return (
    <WizardShell id={id} step={5} title="Elige tu trasfondo"
      sub="El trasfondo define quién eras antes de aventurarte. Te da habilidades, herramientas y un rasgo especial."
      preview={<LivePreview draft={draft} currentStep={5}/>}
      canProceed={!!draft.backgroundId}>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        {/* background grid */}
        <div>
          <div className="lo-label" style={{ marginBottom: 10 }}>Trasfondo</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {BACKGROUNDS.map(bg => {
              const picked = draft.backgroundId === bg.id;
              return (
                <button type="button" key={bg.id} onClick={() => up({ backgroundId: bg.id })} style={{
                  padding: "14px 16px", borderRadius: 10, textAlign: "left", cursor: "pointer",
                  border: picked ? "1px solid var(--quest-gold)" : "1px solid var(--line-strong)",
                  background: picked ? "rgba(214,168,79,0.10)" : "rgba(244,231,197,0.03)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 14, color: picked ? "var(--quest-gold-hi)" : "var(--text-hi)" }}>{bg.name}</span>
                    <span style={{ fontSize: 10, color: "var(--text-low)" }}>{bg.short}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {bg.skills.map(s => (
                      <span key={s} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 999,
                        background: "rgba(244,231,197,0.06)", color: "var(--text-low)" }}>{s}</span>
                    ))}
                  </div>
                  {picked && (
                    <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-mid)", lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 600, color: "var(--quest-gold-hi)" }}>Rasgo: </span>{bg.feature}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* skill choices */}
        <div>
          <div className="lo-label" style={{ marginBottom: 4 }}>Habilidades de clase</div>
          <p style={{ fontSize: 12, color: "var(--text-low)", marginBottom: 10 }}>
            Elige {maxSkills} habilidades de tu clase {cls?.name ?? ""}.
            {" "}<span style={{ color: draft.selectedSkills.length >= maxSkills ? "var(--moss-green)" : "var(--quest-gold-hi)" }}>
              {draft.selectedSkills.length}/{maxSkills} elegidas
            </span>
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {classSkills.map(skill => {
              const isFromBg = bgSkills.includes(skill);
              const isPicked = draft.selectedSkills.includes(skill);
              const disabled = isFromBg;
              return (
                <button type="button" key={skill} onClick={() => !disabled && toggleSkill(skill)} style={{
                  padding: "9px 14px", borderRadius: 8, textAlign: "left", cursor: disabled ? "default" : "pointer",
                  border: isPicked || isFromBg ? "1px solid var(--quest-gold)" : "1px solid var(--line-strong)",
                  background: isPicked || isFromBg ? "rgba(214,168,79,0.08)" : "transparent",
                  display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: isPicked || isFromBg ? "var(--quest-gold-hi)" : "var(--text-mid)" }}>{skill}</span>
                  {isFromBg && (
                    <span style={{ fontSize: 9, color: "var(--text-low)" }}>trasfondo</span>
                  )}
                </button>
              );
            })}
          </div>

          {raceChoice && (
            <div style={{ marginTop: 20 }}>
              <div className="lo-label" style={{ marginBottom: 4 }}>
                Habilidades de {subrace?.skillChoices ? subrace.name : race?.name}
              </div>
              <p style={{ fontSize: 12, color: "var(--text-low)", marginBottom: 10 }}>
                Tu herencia te deja elegir {raceChoice.count} habilidad{raceChoice.count === 1 ? "" : "es"} más,
                {raceChoice.from ? " de esta lista." : " la que quieras."}
                {" "}<span style={{ color: raceSkills.length >= raceChoice.count ? "var(--moss-green)" : "var(--quest-gold-hi)" }}>
                  {raceSkills.length}/{raceChoice.count} elegidas
                </span>
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 6 }}>
                {raceOptions.map(skill => {
                  const isPicked = raceSkills.includes(skill);
                  const repetida = yaCompetente.has(skill) && !isPicked;
                  const lleno = raceSkills.length >= raceChoice.count && !isPicked;
                  const disabled = repetida || lleno;
                  return (
                    <button type="button" key={skill} onClick={() => !disabled && toggleRaceSkill(skill)}
                      title={repetida ? "Ya eres competente por clase o trasfondo" : undefined}
                      style={{
                        padding: "8px 12px", borderRadius: 8, textAlign: "left",
                        cursor: disabled ? "default" : "pointer", opacity: disabled && !isPicked ? 0.4 : 1,
                        border: isPicked ? "1px solid var(--quest-gold)" : "1px solid var(--line-strong)",
                        background: isPicked ? "rgba(214,168,79,0.08)" : "transparent",
                        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12, color: isPicked ? "var(--quest-gold-hi)" : "var(--text-mid)" }}>{skill}</span>
                      {repetida && <span style={{ fontSize: 9, color: "var(--text-low)" }}>ya la tienes</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selected && (
            <div className="lo-card-elev" style={{ padding: 14, marginTop: 16 }}>
              <div className="lo-label" style={{ marginBottom: 6 }}>Equipo inicial del trasfondo</div>
              <p style={{ fontSize: 12, color: "var(--text-mid)", lineHeight: 1.5 }}>{selected.equipment}</p>
            </div>
          )}
        </div>
      </div>
    </WizardShell>
  );
}
