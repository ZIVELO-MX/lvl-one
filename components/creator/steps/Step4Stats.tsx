"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { WizardShell } from "../WizardShell";
import { LivePreview } from "../LivePreview";
import { CLASSES } from "@/data/classes";
import { RACES } from "@/data/races";
import { SUBRACES } from "@/data/subraces";
import { FEATS, getFeatsByPrerequisite } from "@/data/feats";
import { STAT_KEYS, STAT_LABELS, STANDARD_ARRAY, modOf, fmtMod, POINT_BUY_MIN, POINT_BUY_MAX, pointBuyCost, pointBuyRemaining } from "@/types/character";
import type { CharacterDraft, StatKey } from "@/types/character";

export function Step4Stats({ draft, id }: { draft: CharacterDraft; id: string }) {
  const { dispatch } = useApp();
  const [swapFrom, setSwapFrom] = useState<StatKey | null>(null);
  const up = (patch: Partial<CharacterDraft>) => dispatch({ type: "DRAFT_UPDATE", patch });

  const cls = CLASSES.find(c => c.id === draft.classId);
  const race = RACES.find(r => r.id === draft.raceId);
  const subrace = SUBRACES.find(s => s.id === draft.subraceId);

  const getRaceBonus = (k: StatKey): number => {
    // El humano variante sustituye el aumento del humano, no lo suma.
    if (!race || subrace?.replacesRaceAsi) return 0;
    const asi = race.asi ?? {};
    return (("all" in asi ? asi.all ?? 0 : 0)) + ((asi as Record<string, number>)[k] ?? 0);
  };
  const getSubraceBonus = (k: StatKey): number => {
    if (!subrace) return 0;
    const asi = (subrace.asi ?? {}) as Record<string, number>;
    return asi[k] ?? 0;
  };

  /**
   * Lo que vale la característica de verdad. Las tarjetas sólo sumaban los
   * bonos fijos de raza: si elegías el +1 del semielfo o de una media dote, el
   * número no se movía y parecía que la elección no hacía nada.
   */
  const totalDe = (k: StatKey): number =>
    (draft.baseStats[k] ?? 10) + getRaceBonus(k) + getSubraceBonus(k)
    + (draft.asiBonuses?.[k] ?? 0) + (draft.featBonuses?.[k] ?? 0);

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
              const total = totalDe(k);
              const bonus = total - base;
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
                  {bonus !== 0 && (
                    <div style={{ fontSize: 9, color: "var(--text-low)", marginTop: 4 }}>
                      {base} +{bonus} bonif.
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Dote inicial. El humano variante la promete en su descripción
              desde siempre y no había manera de elegirla: data/feats.ts
              existía sin puerta de entrada. Va en este paso porque los
              requisitos miran tus puntuaciones, y es aquí donde quedan
              fijadas. */}
          {(subrace?.grantsFeat ?? 0) > 0 && (() => {
            const elegidaId = (draft.feats ?? [])[0] ?? "";
            const elegida = FEATS.find(f => f.id === elegidaId);
            // Los requisitos se miran ANTES de aplicar la propia dote: si no,
            // una media dote de +1 FUE podría estar sosteniendo su propio
            // requisito de Fuerza 13.
            const disponibles = getFeatsByPrerequisite({
              level: draft.level ?? 1,
              race: draft.raceId ?? "",
              class: draft.classId ?? "",
              stats: Object.fromEntries(
                STAT_KEYS.map(k => [k, totalDe(k) - (draft.featBonuses?.[k] ?? 0)]),
              ),
              spellcaster: cls?.spellcaster,
              armorProficiencies: cls?.armorProficiencies,
            });
            const subida = elegida?.effects?.abilityIncrease;

            const elegir = (id: string) => {
              const feat = FEATS.find(f => f.id === id);
              const sube = feat?.effects?.abilityIncrease;
              up({
                feats: id ? [id] : [],
                // Si la dote sube una característica concreta se aplica sola;
                // si deja elegir entre varias, espera a que el jugador escoja.
                featBonuses: sube && sube.from.length === 1
                  ? { [sube.from[0]]: sube.amount }
                  : {},
              });
            };

            return (
              <div style={{ marginTop: 20, padding: 16, borderRadius: 12,
                border: "1px solid var(--line-strong)", background: "rgba(244,231,197,0.03)" }}>
                <label htmlFor="dote-inicial" className="lo-label" style={{ display: "block", marginBottom: 6 }}>
                  Dote inicial de {subrace?.name}
                </label>
                <select id="dote-inicial" className="lo-input" value={elegidaId}
                  onChange={e => elegir(e.target.value)} style={{ fontSize: 13, width: "100%" }}>
                  <option value="">Sin dote</option>
                  {disponibles.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>

                {elegida && (
                  <p style={{ fontSize: 12, color: "var(--text-mid)", lineHeight: 1.6, margin: "10px 0 0" }}>
                    {elegida.description}
                  </p>
                )}

                {subida && subida.from.length > 1 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 11, color: "var(--text-low)", marginBottom: 6 }}>
                      Esta dote sube +{subida.amount} a una característica. Elige cuál:
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {subida.from.map(k => {
                        const puesta = (draft.featBonuses?.[k] ?? 0) > 0;
                        return (
                          <button type="button" key={k} aria-pressed={puesta}
                            onClick={() => up({ featBonuses: puesta ? {} : { [k]: subida.amount } })}
                            style={{
                              padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12,
                              border: puesta ? "1px solid var(--quest-gold)" : "1px solid var(--line-strong)",
                              background: puesta ? "rgba(214,168,79,0.08)" : "transparent",
                              color: puesta ? "var(--quest-gold-hi)" : "var(--text-mid)",
                            }}>
                            {k}{puesta ? ` +${subida.amount}` : ""}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <p style={{ fontSize: 10, color: "var(--text-low)", marginTop: 12, lineHeight: 1.5 }}>
                  Sólo aparecen las dotes cuyos requisitos cumples con estas puntuaciones.
                </p>
              </div>
            );
          })()}
        </div>

        {/* sidebar */}
        <div style={{ width: 200 }}>
          {/* Método de puntuación. statsMethod existía en el modelo y este paso
              lo ignoraba: sólo repartía el array estándar. */}
          <div className="lo-label" style={{ marginBottom: 6 }}>Método</div>
          <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
            {([
              { id: "standard", texto: "Array" },
              { id: "point-buy", texto: "Puntos" },
            ] as const).map(m => {
              const activo = (draft.statsMethod ?? "standard") === m.id;
              return (
                <button type="button" key={m.id} aria-pressed={activo}
                  onClick={() => up({
                    statsMethod: m.id,
                    // Cambiar de método reinicia el reparto: mezclarlos daría
                    // puntuaciones imposibles en cualquiera de los dos.
                    baseStats: m.id === "point-buy"
                      ? Object.fromEntries(STAT_KEYS.map(k => [k, POINT_BUY_MIN]))
                      : Object.fromEntries(STAT_KEYS.map((k, i) => [k, STANDARD_ARRAY[i]])),
                  })}
                  style={{
                    flex: 1, padding: "6px 8px", borderRadius: 8, fontSize: 11, cursor: "pointer",
                    border: activo ? "1px solid var(--quest-gold)" : "1px solid var(--line-strong)",
                    background: activo ? "rgba(214,168,79,0.08)" : "transparent",
                    color: activo ? "var(--quest-gold-hi)" : "var(--text-mid)",
                  }}>
                  {m.texto}
                </button>
              );
            })}
          </div>

          {draft.statsMethod === "point-buy" ? (
            <div style={{ marginBottom: 16 }}>
              <div className="lo-label" style={{ marginBottom: 6 }}>Compra de puntos</div>
              {(() => {
                const restante = pointBuyRemaining(draft.baseStats);
                return (
                  <>
                    <div style={{ textAlign: "center", marginBottom: 10 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 26, color: restante < 0 ? "#E8847A" : "var(--text-hi)" }}>
                        {restante}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-low)" }}>puntos sin gastar</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {STAT_KEYS.map(k => {
                        const v = draft.baseStats[k] ?? POINT_BUY_MIN;
                        const subir = () => {
                          if (v >= POINT_BUY_MAX) return;
                          const coste = pointBuyCost(v + 1) - pointBuyCost(v);
                          if (coste > restante) return;
                          up({ baseStats: { ...draft.baseStats, [k]: v + 1 } });
                        };
                        const bajar = () => {
                          if (v <= POINT_BUY_MIN) return;
                          up({ baseStats: { ...draft.baseStats, [k]: v - 1 } });
                        };
                        const costeSubir = v < POINT_BUY_MAX ? pointBuyCost(v + 1) - pointBuyCost(v) : 0;
                        return (
                          <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 11, color: "var(--text-low)", width: 30 }}>{k}</span>
                            <button type="button" aria-label={`Bajar ${k}`} onClick={bajar} disabled={v <= POINT_BUY_MIN}
                              style={{ width: 22, height: 22, borderRadius: 5, border: "1px solid var(--line-strong)", background: "transparent", color: "var(--text-mid)", cursor: v > POINT_BUY_MIN ? "pointer" : "default", opacity: v > POINT_BUY_MIN ? 1 : 0.35 }}>−</button>
                            <span style={{ fontFamily: "var(--font-display)", fontSize: 15, width: 22, textAlign: "center", color: "var(--text-hi)" }}>{v}</span>
                            <button type="button" aria-label={`Subir ${k}`} onClick={subir} disabled={v >= POINT_BUY_MAX || costeSubir > restante}
                              title={costeSubir > restante ? "No te quedan puntos" : undefined}
                              style={{ width: 22, height: 22, borderRadius: 5, border: "1px solid var(--line-strong)", background: "transparent", color: "var(--text-mid)", cursor: v < POINT_BUY_MAX && costeSubir <= restante ? "pointer" : "default", opacity: v < POINT_BUY_MAX && costeSubir <= restante ? 1 : 0.35 }}>+</button>
                            {v < POINT_BUY_MAX && (
                              <span style={{ fontSize: 9, color: "var(--text-low)" }}>+{costeSubir}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <p style={{ fontSize: 10, color: "var(--text-low)", marginTop: 10, lineHeight: 1.5 }}>
                      De 8 a 15. Los dos últimos puntos cuestan el doble.
                    </p>
                  </>
                );
              })()}
            </div>
          ) : (
          <>
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
          </>
          )}
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
          {/* Características a elegir de la raza. El semielfo sube +1 a dos a
              su gusto, y el humano variante igual: hasta ahora las repartía
              buildCharacter por orden alfabético, sin preguntar. */}
          {(() => {
            const reglas = [race?.asi, subrace?.asi]
              .filter((a): a is NonNullable<typeof a> => !!a?.choices)
              .flatMap(a => a.choices ?? []);
            if (!reglas.length) return null;

            const total = reglas.reduce((n, c) => n + c.choose, 0);
            const cantidad = reglas[0].amount;
            // No tiene sentido elegir una que la raza ya sube de fijo.
            const fijas = new Set(STAT_KEYS.filter(k => getRaceBonus(k) > 0 || getSubraceBonus(k) > 0));
            const permitidas = reglas[0].from
              ? STAT_KEYS.filter(k => reglas[0].from!.includes(k))
              : STAT_KEYS;
            const elegidas = STAT_KEYS.filter(k => (draft.asiBonuses?.[k] ?? 0) > 0);

            const alternar = (k: StatKey) => {
              const actual = { ...(draft.asiBonuses ?? {}) };
              if (actual[k]) delete actual[k];
              else if (elegidas.length < total) actual[k] = cantidad;
              up({ asiBonuses: actual });
            };

            return (
              <div style={{ marginTop: 16 }}>
                <div className="lo-label" style={{ marginBottom: 4 }}>Características de {race?.name}</div>
                <p style={{ fontSize: 11, color: "var(--text-low)", marginBottom: 8 }}>
                  Sube +{cantidad} a {total} características a tu elección.{" "}
                  <span style={{ color: elegidas.length >= total ? "var(--moss-green)" : "var(--quest-gold-hi)" }}>
                    {elegidas.length}/{total}
                  </span>
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                  {permitidas.map(k => {
                    const puesta = (draft.asiBonuses?.[k] ?? 0) > 0;
                    const bloqueada = fijas.has(k) && !puesta;
                    const lleno = elegidas.length >= total && !puesta;
                    const disabled = bloqueada || lleno;
                    return (
                      <button type="button" key={k} onClick={() => !disabled && alternar(k)}
                        title={bloqueada ? "Tu raza ya sube esta característica" : undefined}
                        style={{
                          padding: "8px 6px", borderRadius: 8, cursor: disabled ? "default" : "pointer",
                          opacity: disabled && !puesta ? 0.4 : 1,
                          border: puesta ? "1px solid var(--quest-gold)" : "1px solid var(--line-strong)",
                          background: puesta ? "rgba(214,168,79,0.08)" : "transparent",
                          color: puesta ? "var(--quest-gold-hi)" : "var(--text-mid)", fontSize: 12,
                        }}>
                        {k}{puesta ? ` +${cantidad}` : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

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
