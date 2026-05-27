"use client";
import { useApp } from "@/lib/store";
import { WizardShell } from "../WizardShell";
import { LivePreview } from "../LivePreview";
import { CONCEPTS } from "@/data/backgrounds";
import { RACES } from "@/data/races";
import { CLASSES } from "@/data/classes";
import { BACKGROUNDS } from "@/data/backgrounds";
import { Ico } from "@/components/ui/icons";
import type { CharacterDraft } from "@/types/character";

export function Step1Identity({ draft, id }: { draft: CharacterDraft; id: string }) {
  const { dispatch } = useApp();
  const up = (patch: Partial<CharacterDraft>) => dispatch({ type: "DRAFT_UPDATE", patch });

  const activeConcept = CONCEPTS.find(c => c.id === draft.conceptId);
  const suggestedRace = activeConcept ? RACES.find(r => r.id === activeConcept.suggests.race) : null;
  const suggestedClass = activeConcept ? CLASSES.find(c => c.id === activeConcept.suggests.cls) : null;
  const suggestedBg = activeConcept ? BACKGROUNDS.find(b => b.id === activeConcept.suggests.bg) : null;

  const applyConcept = (conceptId: string) => {
    const c = CONCEPTS.find(x => x.id === conceptId);
    if (!c) return;
    up({
      conceptId,
      raceId: c.suggests.race,
      classId: c.suggests.cls,
      backgroundId: c.suggests.bg,
    });
  };

  return (
    <WizardShell id={id} step={1} title="¿Quién será tu personaje?"
      sub="Empezamos por lo más simple: un nombre y una idea. Podrás cambiarlo todo más adelante."
      preview={<LivePreview draft={draft} currentStep={1}/>}
      canProceed={!!draft.name.trim()}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        <div className="lo-card-elev" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div className="lo-label" style={{ marginBottom: 6 }}>Nombre del personaje</div>
            <input className="lo-input" placeholder="ej. Kael Stormveil" maxLength={100} value={draft.name} onChange={e => up({ name: e.target.value })}/>
          </div>
          <div>
            <div className="lo-label" style={{ marginBottom: 6 }}>Edad</div>
            <input className="lo-input"
              placeholder={draft.raceId && RACES.find(r => r.id === draft.raceId)?.name
                ? `ej. 20–30 años (${RACES.find(r => r.id === draft.raceId)!.name!} adulto)`
                : "ej. 24 años"}
              maxLength={20} value={draft.age}
              onChange={e => up({ age: e.target.value })}/>
            {draft.raceId && (() => {
              const r = RACES.find(x => x.id === draft.raceId);
              return r?.age ? (
                <div style={{ fontSize: 11, color: "var(--text-low)", marginTop: 5, lineHeight: 1.4 }}>
                  {r.name}: {r.age}
                </div>
              ) : null;
            })()}
          </div>
          <div>
            <div className="lo-label" style={{ marginBottom: 6 }}>Nivel</div>
            {draft.status === "ready" ? (
              <div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "8px 14px", borderRadius: 8, border: "1px solid var(--line-strong)",
                  background: "rgba(244,231,197,0.03)", fontFamily: "var(--font-display)", fontSize: 14, color: "var(--text-mid)"
                }}>
                  <Ico name="lock" size={12} color="var(--text-low)"/> Nv.{draft.level}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-low)", marginTop: 6 }}>
                  Para subir de nivel usa el botón &quot;Subir de Nivel&quot; en la ficha del personaje.
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[1,2,3].map(n => (
                    <button key={n} onClick={() => up({ level: n })} style={{
                      padding: "8px 14px", borderRadius: 8,
                      border: draft.level === n ? "1px solid var(--quest-gold)" : "1px solid var(--line-strong)",
                      background: draft.level === n ? "rgba(214,168,79,0.10)" : "transparent",
                      color: draft.level === n ? "var(--quest-gold-hi)" : "var(--text-mid)",
                      fontFamily: "var(--font-display)", fontSize: 14, cursor: "pointer" }}>
                      {n}
                    </button>
                  ))}
                  {[4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(n => (
                    <button key={n} disabled style={{
                      padding: "8px 10px", borderRadius: 8, border: "1px solid var(--line)",
                      background: "transparent", color: "var(--text-low)",
                      fontFamily: "var(--font-display)", fontSize: 12, cursor: "not-allowed", opacity: 0.4
                    }}>
                      {n}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-low)", marginTop: 6 }}>
                  Personajes nuevos empiezan en nivel 1, 2 o 3. Niveles 4–20 se desbloquean al subir de nivel durante la aventura.
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lo-card-elev" style={{ padding: 22 }}>
          <div className="lo-label" style={{ marginBottom: 8 }}>Quiero ser…</div>
          <p style={{ fontSize: 12, color: "var(--text-low)", marginBottom: 12 }}>Elige un concepto. Te rellenaremos automáticamente raza, clase y trasfondo. Puedes cambiarlos después.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {CONCEPTS.map(c => (
              <button key={c.id} onClick={() => applyConcept(c.id)} style={{
                padding: 12, borderRadius: 10, textAlign: "left",
                border: draft.conceptId === c.id ? "1px solid var(--quest-gold)" : "1px solid var(--line-strong)",
                background: draft.conceptId === c.id ? "rgba(214,168,79,0.10)" : "rgba(244,231,197,0.03)",
                color: "var(--text)", fontSize: 12.5, display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
                <Ico name={c.icon} size={16} color={draft.conceptId === c.id ? "var(--quest-gold-hi)" : "var(--text-mid)"}/>
                {c.t}
              </button>
            ))}
          </div>

          {activeConcept && (
            <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 8, border: "1px solid var(--line-strong)", background: "rgba(244,231,197,0.04)" }}>
              <div style={{ fontSize: 10, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Te sugerimos</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {suggestedRace && (
                  <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, color: "var(--text-mid)" }}>
                    <Ico name={suggestedRace.glyph} size={14} color="var(--arcane-blue-hi)"/>
                    <span style={{ color: "var(--text-hi)" }}>{suggestedRace.name}</span>
                  </div>
                )}
                {suggestedClass && (
                  <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, color: "var(--text-mid)" }}>
                    <Ico name={suggestedClass.glyph} size={14} color="var(--quest-gold-hi)"/>
                    <span style={{ color: "var(--text-hi)" }}>{suggestedClass.name}</span>
                  </div>
                )}
                {suggestedBg && (
                  <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, color: "var(--text-mid)" }}>
                    <Ico name="shield" size={14} color="var(--moss-green)"/>
                    <span style={{ color: "var(--text-hi)" }}>{suggestedBg.name}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </WizardShell>
  );
}
