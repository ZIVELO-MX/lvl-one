"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp, buildCharacter } from "@/lib/store";
import { createCharacter } from "@/lib/character-api";
import { WizardShell } from "../WizardShell";
import { LivePreview } from "../LivePreview";
import { defaultEquipmentFor, EQUIPMENT_ITEMS } from "@/data/equipment";
import { SPELLS } from "@/data/spells";
import { CLASSES } from "@/data/classes";
import { STAT_KEYS, STAT_LABELS, fmtMod } from "@/types/character";
import type { CharacterDraft } from "@/types/character";

export function Step8Review({ draft, id }: { draft: CharacterDraft; id: string }) {
  const { dispatch } = useApp();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const built = buildCharacter(draft);

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const charToSave: CharacterDraft = { ...built, status: "ready" };
      if (draft.hpCurrent !== undefined && draft.hpCurrent < built.hp) {
        charToSave.hpCurrent = built.hp;
      }
      const saved = await createCharacter(charToSave);
      dispatch({ type: "CHARACTER_SAVE", character: saved });
      router.push("/characters");
    } catch {
      dispatch({ type: "TOAST", toast: "Error al guardar el personaje" });
    } finally {
      setSaving(false);
    }
  };

  const items: string[] = draft.classId
    ? defaultEquipmentFor(draft.classId).map(id => EQUIPMENT_ITEMS.find(e => e.id === id)?.name ?? id)
    : [];
  const cls = CLASSES.find(c => c.id === draft.classId);
  const selectedSpellObjects = SPELLS.filter(s => (draft.spells ?? []).includes(s.id));

  return (
    <WizardShell id={id} step={8} title="Revisa tu personaje"
      sub="Todo se ve bien. Guarda para finalizar la creación o vuelve a cualquier paso para editar."
      preview={<LivePreview draft={draft} currentStep={8}/>}
      canProceed={!!draft.name.trim() && !!draft.raceId && !!draft.classId}
      onSave={save}>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

        {/* identity + stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {/* identity */}
          <div className="lo-card-elev" style={{ padding: 20 }}>
            <div className="lo-label" style={{ marginBottom: 12 }}>Identidad</div>
            <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: 12,
                background: "linear-gradient(135deg,var(--arcane-blue),var(--quest-gold-lo))",
                display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontSize: 24, color: "white", flexShrink: 0 }}>
                {(draft.name?.[0] ?? "?").toUpperCase()}
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--text-hi)", marginBottom: 2 }}>{draft.name || "Sin nombre"}</div>
                <div style={{ fontSize: 12, color: "var(--text-mid)" }}>
                  {built.race?.name ?? "—"}{built.subrace ? ` · ${built.subrace.name}` : ""} · {built.class?.name ?? "—"} · Nivel {draft.level}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-mid)" }}>
                  {draft.age && <span>{draft.age}</span>}
                  {draft.backgroundId && <span>{draft.age ? " · " : ""}{built.background?.name ?? ""}</span>}
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {([["PG", String(built.hp)], ["CA", String(built.ac)], ["INI", fmtMod(built.initiative)], ["PROF", `+${built.proficiencyBonus}`]] as [string,string][]).map(([k, v]) => (
                <div key={k} style={{ textAlign: "center", padding: "10px 6px", borderRadius: 8,
                  background: "rgba(214,168,79,0.06)", border: "1px solid rgba(214,168,79,0.15)" }}>
                  <div style={{ fontSize: 9, color: "var(--text-low)", letterSpacing: "0.1em" }}>{k}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--quest-gold-hi)", lineHeight: 1 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* stats */}
          <div className="lo-card-elev" style={{ padding: 20 }}>
            <div className="lo-label" style={{ marginBottom: 12 }}>Características</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {STAT_KEYS.map(k => {
                const total = built.stats[k] ?? 10;
                const m = built.mods[k] ?? 0;
                return (
                  <div key={k} className="lo-stat" style={{ padding: "8px 4px 6px" }}>
                    <div className="lo-stat-label" style={{ fontSize: 8 }}>{STAT_LABELS[k].toUpperCase().slice(0,3)}</div>
                    <div className="lo-stat-value" style={{ fontSize: 22 }}>{total}</div>
                    <div className="lo-stat-mod" style={{ fontSize: 10 }}>{fmtMod(m)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* skills + equipment row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {/* skills */}
          <div className="lo-card-elev" style={{ padding: 20 }}>
            <div className="lo-label" style={{ marginBottom: 10 }}>Habilidades</div>
            {draft.selectedSkills.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {[...(built.background?.skills ?? []), ...draft.selectedSkills].map((s, i) => (
                  <span key={i} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6,
                    background: "rgba(214,168,79,0.08)", color: "var(--quest-gold-hi)",
                    border: "1px solid rgba(214,168,79,0.2)" }}>{s}</span>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 12, color: "var(--text-low)" }}>No hay habilidades seleccionadas.</p>
            )}
          </div>

          {/* equipment */}
          <div className="lo-card-elev" style={{ padding: 20 }}>
            <div className="lo-label" style={{ marginBottom: 10 }}>Equipo inicial</div>
            {items.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                {items.map((item: string, i: number) => (
                  <li key={i} style={{ fontSize: 12, color: "var(--text-mid)", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 4, height: 4, borderRadius: 999, background: "var(--quest-gold)", flexShrink: 0 }}/>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: 12, color: "var(--text-low)" }}>Sin equipo (selecciona una clase).</p>
            )}
          </div>
        </div>

        {/* story */}
        {(draft.story || draft.alignment) && (
          <div className="lo-card-elev" style={{ padding: 20 }}>
            <div className="lo-label" style={{ marginBottom: 10 }}>Historia</div>
            <div style={{ display: "grid", gridTemplateColumns: draft.story ? "2fr 1fr" : "1fr", gap: 16 }}>
              {draft.story && (
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-low)", marginBottom: 4 }}>Historia personal</div>
                  <p style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.6 }}>{draft.story}</p>
                </div>
              )}
              {draft.alignment && (
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-low)", marginBottom: 4 }}>Alineamiento</div>
                  <div style={{ fontSize: 14, color: "var(--quest-gold-hi)", fontFamily: "var(--font-display)" }}>{draft.alignment}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* spells (spellcasters only) */}
        {cls?.spellcaster && selectedSpellObjects.length > 0 && (
          <div className="lo-card-elev" style={{ padding: 20 }}>
            <div className="lo-label" style={{ marginBottom: 10 }}>Hechizos iniciales</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {selectedSpellObjects.map(spell => (
                <span key={spell.id} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6,
                  background: spell.level === 0 ? "rgba(214,168,79,0.08)" : "rgba(92,122,184,0.10)",
                  color: spell.level === 0 ? "var(--quest-gold-hi)" : "var(--arcane-blue-hi)",
                  border: `1px solid ${spell.level === 0 ? "rgba(214,168,79,0.2)" : "rgba(92,122,184,0.3)"}` }}>
                  {spell.name}
                  <span style={{ marginLeft: 4, fontSize: 9, opacity: 0.7 }}>{spell.level === 0 ? "truco" : `Nv.${spell.level}`}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* completeness check */}
        <div className="lo-card-elev" style={{ padding: 16 }}>
          <div className="lo-label" style={{ marginBottom: 8 }}>Completado</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {([
              ["Nombre", !!draft.name.trim()],
              ["Raza", !!draft.raceId],
              ["Clase", !!draft.classId],
              ["Stats", Object.keys(draft.baseStats).length >= 6],
              ["Trasfondo", !!draft.backgroundId],
              ["Historia", !!draft.story],
              ...(cls?.spellcaster ? [["Hechizos", (draft.spells ?? []).length > 0] as [string, boolean]] : []),
            ] as [string, boolean][]).map(([label, ok]) => (
              <span key={label} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6,
                background: ok ? "rgba(76,175,80,0.1)" : "rgba(244,231,197,0.04)",
                color: ok ? "var(--moss-green)" : "var(--text-low)",
                border: `1px solid ${ok ? "rgba(76,175,80,0.3)" : "var(--line-strong)"}` }}>
                {ok ? "✓" : "○"} {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </WizardShell>
  );
}
