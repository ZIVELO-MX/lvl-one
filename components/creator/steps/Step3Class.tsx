"use client";
import { useState } from "react";
import Image from "next/image";
import { useApp } from "@/lib/store";
import { WizardShell } from "../WizardShell";
import { LivePreview } from "../LivePreview";
import { RACES } from "@/data/races";
import { CLASSES } from "@/data/classes";
import { SUBCLASSES } from "@/data/subclasses";
import { Ico } from "@/components/ui/icons";
import { classPortrait } from "@/lib/portraits";
import { getClassSuggestion, getCombinedTip, getRaceSynergy, STAT_COLORS } from "@/lib/suggestions";
import type { CharacterDraft } from "@/types/character";
import type { Gender } from "@/lib/portraits";

function ClassPortrait({ classId, gender }: { classId: string; gender: Gender }) {
  const [err, setErr] = useState(false);
  if (err) return null;
  return (
    <div style={{ width: 120, height: 120, borderRadius: 12, overflow: "hidden", flexShrink: 0, border: "1px solid rgba(214,168,79,0.3)" }}>
      <Image src={classPortrait(classId, gender)} alt={classId} width={120} height={120}
        style={{ objectFit: "cover", width: "100%", height: "100%" }}
        onError={() => setErr(true)} />
    </div>
  );
}


export function Step3Class({ draft, id }: { draft: CharacterDraft; id: string }) {
  const { dispatch } = useApp();
  const [filter, setFilter] = useState<"all" | "magic" | "nomagic">("all");
  const up = (patch: Partial<CharacterDraft>) => dispatch({ type: "DRAFT_UPDATE", patch });

  const gender: Gender = draft.gender ?? "male";
  const filtered = CLASSES.filter(c => {
    if (filter === "magic") return c.spellcaster;
    if (filter === "nomagic") return !c.spellcaster;
    return true;
  });
  const selected = CLASSES.find(c => c.id === draft.classId);
  const level1Subclasses = draft.classId
    ? SUBCLASSES.filter(s => s.classId === draft.classId && s.level === 1)
    : [];
  const raceSyn = draft.raceId ? getRaceSynergy(draft.raceId) : null;
  const suggestion = draft.classId ? getClassSuggestion(draft.classId) : null;
  const combinedTip = draft.raceId && draft.classId ? getCombinedTip(draft.classId, draft.raceId) : null;

  const ROLE_COLORS: Record<string, string> = {
    "Daño / Tanque": "var(--quest-gold)",
    "Daño / Control": "var(--arcane-blue)",
    "Daño / Rol": "var(--dragon-red)",
    "Daño / Exploración": "var(--arcane-blue-hi)",
    "Daño / Movilidad": "var(--arcane-blue)",
    "Daño / Utilidad": "var(--dragon-red-soft)",
    "Curación / Apoyo": "var(--moss-green)",
    "Exploración / Daño": "var(--moss-green)",
    "Soporte / Utilidad": "var(--arcane-blue)",
    "Soporte / Curación": "var(--moss-green)",
    "Soporte / Magia": "var(--arcane-blue-hi)",
    "Soporte / Control": "var(--arcane-blue)",
    "Tanque / Apoyo": "var(--quest-gold)",
    "Tanque / Daño": "var(--quest-gold)",
    "Marcial / soporte": "var(--quest-gold)",
  };

  return (
    <WizardShell id={id} step={3} title="¿Qué clase jugará?"
      sub="La clase define tus habilidades, conjuros y cómo te comportas en combate."
      preview={<LivePreview draft={draft} currentStep={3}/>}
      canProceed={!!draft.classId && (level1Subclasses.length === 0 || !!draft.subclassId)}>

      {/* filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {(["all","magic","nomagic"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer",
            background: filter === f ? "rgba(214,168,79,0.15)" : "transparent",
            border: filter === f ? "1px solid var(--quest-gold)" : "1px solid var(--line-strong)",
            color: filter === f ? "var(--quest-gold-hi)" : "var(--text-mid)" }}>
            {f === "all" ? "Todas" : f === "magic" ? "Casters" : "Sin magia"}
          </button>
        ))}
      </div>

      {/* race synergy suggestion */}
      {draft.raceId && !draft.classId && (() => {
        const synergy = getRaceSynergy(draft.raceId);
        if (!synergy) return null;
        return (
          <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 8, background: "rgba(92,122,184,0.08)", borderLeft: "3px solid var(--arcane-blue)" }}>
            <div style={{ fontSize: 11, color: "var(--text-low)", marginBottom: 4 }}>
              <Ico name="sparkle" size={11} color="var(--arcane-blue-hi)"/>
              <span style={{ marginLeft: 4 }}>Tu raza encaja bien con</span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {synergy.bestFor.map(clsName => {
                const cls = CLASSES.find(c => c.name === clsName);
                return cls ? (
                  <span key={cls.id} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 6,
                    background: "rgba(214,168,79,0.08)", color: "var(--quest-gold-hi)", border: "1px solid rgba(214,168,79,0.2)" }}>
                    <Ico name={cls.glyph} size={12} color="var(--quest-gold-hi)"/>
                    <span style={{ marginLeft: 4 }}>{cls.name}</span>
                  </span>
                ) : null;
              })}
            </div>
          </div>
        );
      })()}

      {/* class grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
        {filtered.map(c => {
          const picked = draft.classId === c.id;
          return (
              <button key={c.id} onClick={() => up({ classId: c.id, subclassId: null })} style={{
                padding: "14px 12px", borderRadius: 10, textAlign: "left", cursor: "pointer",
                border: picked ? "1px solid var(--quest-gold)" : raceSyn?.bestFor.includes(c.name) ? "1px solid var(--arcane-blue)" : "1px solid var(--line-strong)",
                background: picked ? "rgba(214,168,79,0.10)" : raceSyn?.bestFor.includes(c.name) ? "rgba(92,122,184,0.06)" : "rgba(244,231,197,0.03)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Ico name={c.glyph} size={18} color={picked ? "var(--quest-gold-hi)" : "var(--text-mid)"}/>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 14, color: picked ? "var(--quest-gold-hi)" : "var(--text-hi)" }}>{c.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999,
                  background: "rgba(244,231,197,0.06)", color: ROLE_COLORS[c.role] ?? "var(--text-low)",
                  border: `1px solid ${ROLE_COLORS[c.role] ?? "var(--line-strong)"}20` }}>{c.role}</span>
                <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-low)" }}>d{c.hit.replace("d","")}</span>
              </div>
              <div style={{ fontSize: 10.5, color: "var(--text-low)", lineHeight: 1.4 }}>{c.short}</div>
            </button>
          );
        })}
      </div>

      {/* class detail */}
      {selected && (
        <div className="lo-card-elev" style={{ padding: 20, marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
            <ClassPortrait classId={selected.id} gender={gender} />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 18, marginBottom: 4, color: "var(--quest-gold-hi)" }}>{selected.name}</h3>
              <div style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.6, marginBottom: 10 }}>{selected.combat}</div>
              {suggestion && (
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: "var(--text-low)" }}>Stats clave:</span>
                  {suggestion.statOrder.split(" > ").map(s => (
                    <span key={s} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, fontWeight: 700,
                      background: `${STAT_COLORS[s] ?? "#888"}18`,
                      color: STAT_COLORS[s] ?? "var(--text-hi)",
                      border: `1px solid ${STAT_COLORS[s] ?? "#888"}40` }}>{s}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <div>
              <div className="lo-label" style={{ marginBottom: 6 }}>Fuera de combate</div>
              <p style={{ fontSize: 12, color: "var(--text-mid)", lineHeight: 1.5 }}>{selected.outside}</p>
            </div>
            <div>
              <div className="lo-label" style={{ marginBottom: 6 }}>Rasgos hasta nivel {draft.level}</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                {selected.classFeatures?.filter(f => f.level <= draft.level).map(f => (
                  <li key={f.id} style={{ fontSize: 11, color: "var(--text-mid)" }}>
                    <span style={{ color: f.level > 1 ? "var(--arcane-blue-hi)" : "var(--quest-gold-hi)", fontWeight: 600 }}>{f.level > 1 && `Nv${f.level} `}{f.name}:</span> {f.summary}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 10 }}>
                <div className="lo-label" style={{ marginBottom: 4, fontSize: 10 }}>Tiradas salvadoras</div>
                <div style={{ display: "flex", gap: 4 }}>
                  {selected.saves.map(s => (
                    <span key={s} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6,
                      background: `${STAT_COLORS[s] ?? "rgba(214,168,79,0.08)"}22`,
                      color: STAT_COLORS[s] ?? "var(--quest-gold-hi)",
                      border: `1px solid ${STAT_COLORS[s] ?? "rgba(214,168,79,0.2)"}44` }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
            {suggestion && (
              <div>
                <div className="lo-label" style={{ marginBottom: 6 }}>Sugerencias</div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 10, color: "var(--text-low)", marginBottom: 4 }}>Habilidades recomendadas</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {suggestion.skills.slice(0,4).map(s => (
                      <span key={s} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999,
                        background: "rgba(76,175,80,0.08)", color: "var(--moss-green)", border: "1px solid rgba(76,175,80,0.2)" }}>{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--text-low)", marginBottom: 4 }}>Armas sugeridas</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {suggestion.weapons.map(w => (
                      <span key={w} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999,
                        background: "rgba(180,58,46,0.08)", color: "var(--dragon-red)", border: "1px solid rgba(180,58,46,0.2)" }}>{w}</span>
                    ))}
                  </div>
                </div>
                <div style={{ marginTop: 8, padding: "6px 10px", borderRadius: 6, background: "rgba(244,231,197,0.04)", fontSize: 10, color: "var(--text-low)", lineHeight: 1.5 }}>
                  {suggestion.tip}
                </div>
              </div>
            )}
          </div>

          {combinedTip && (
            <div style={{ marginTop: 12, padding: "8px 12px", borderRadius: 8, background: "rgba(76,175,80,0.08)", borderLeft: "3px solid var(--moss-green)" }}>
              <div style={{ fontSize: 11, color: "var(--moss-green)", marginBottom: 2 }}>Sinergia raza + clase</div>
              <div style={{ fontSize: 12, color: "var(--text-mid)" }}>{combinedTip}</div>
            </div>
          )}

          {level1Subclasses.length > 0 && (
            <div style={{ marginTop: 16, padding: 16, borderRadius: 10, border: "1px solid var(--line-strong)", background: "rgba(244,231,197,0.03)" }}>
              <div style={{ fontSize: 11, color: "var(--text-low)", marginBottom: 12, letterSpacing: "0.04em", fontWeight: 600 }}>
                {selected?.id === "cleric" ? "Elige tu dominio sagrado" :
                 selected?.id === "sorcerer" ? "Elige tu origen mágico" :
                 selected?.id === "warlock" ? "Elige tu patrón sobrenatural" :
                 "Elige tu subclase"}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {level1Subclasses.map(sc => {
                  const picked = draft.subclassId === sc.id;
                  return (
                    <button key={sc.id} onClick={() => up({ subclassId: sc.id })}
                      style={{
                        padding: "12px 16px", borderRadius: 10, cursor: "pointer", fontSize: 13, textAlign: "left",
                        border: picked ? "1px solid var(--quest-gold)" : "1px solid var(--line-strong)",
                        background: picked ? "rgba(214,168,79,0.1)" : "transparent",
                        color: picked ? "var(--quest-gold-hi)" : "var(--text-mid)",
                        flex: 1, minWidth: 200,
                        transition: "all 0.15s",
                      }}>
                      <div style={{ fontWeight: 600, marginBottom: 2, fontSize: 14 }}>{sc.name}</div>
                      <div style={{ fontSize: 11, opacity: 0.7, lineHeight: 1.4 }}>{sc.summary}</div>
                      {sc.complexity && (
                        <div style={{ marginTop: 6, fontSize: 10, color: "var(--text-low)" }}>
                          <span style={{ opacity: 0.6 }}>Complejidad: </span>
                          <span>{sc.complexity}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </WizardShell>
  );
}
