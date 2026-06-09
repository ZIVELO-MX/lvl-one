"use client";
import { use, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useApp, buildCharacter } from "@/lib/store";
import { SPELLS } from "@/data/spells";
import { STAT_KEYS, STAT_LABELS, SKILLS_BY_STAT, fmtMod, modOf } from "@/types/character";
import type { StatKey } from "@/types/character";
import { EQUIPMENT_ITEMS, startingEquipmentForClass } from "@/data/equipment";
import { racePortrait } from "@/lib/portraits";
import { STAT_COLORS } from "@/lib/suggestions";
import { formatSpeed } from "@/lib/units";
import { useMounted } from "@/lib/mounted";

const S = {
  page: `
    * { box-sizing: border-box; }
    @page { size: A4; margin: 0; }
    @media print {
      html, body { margin: 0; padding: 0; background: white !important; }
      .np { display: none !important; }
      .pp { box-shadow: none !important; margin: 0 !important; }
    }
    @media screen {
      body { background: #181008 !important; padding: 24px; }
      .pp { margin: 0 auto 24px; box-shadow: 0 8px 40px rgba(0,0,0,0.7); }
    }
    .pp {
      width: 210mm; min-height: 297mm;
      background: #FEFCF8; color: #1A120A;
      font-family: Georgia, 'Times New Roman', serif;
      position: relative;
      print-color-adjust: exact; -webkit-print-color-adjust: exact;
    }
    .in { padding: 24mm 10mm 10mm; display: flex; flex-direction: column; gap: 2mm; }
    .sl {
      font-size: 4.2pt; letter-spacing: 0.2em; text-transform: uppercase;
      color: #9A8A6A; font-family: Arial, sans-serif; font-weight: 700;
    }
    .orn { display: flex; align-items: center; gap: 2mm; }
    .orn::before, .orn::after {
      content: ''; flex: 1; height: 0.15mm;
      background: linear-gradient(to right, transparent, rgba(122,78,16,0.2), transparent);
    }
    .mono { font-family: 'Courier New', Courier, monospace; }
    .df { display: inline-block; width: 3.2px; height: 3.2px; border-radius: 50%; background: #7A4E10; flex-shrink: 0; }
    .de { display: inline-block; width: 3.2px; height: 3.2px; border-radius: 50%; border: 0.6px solid #9A8A70; flex-shrink: 0; }
  `,
};

function getWeaponAttacks(classId: string | null, stats: Record<string, number>, profBonus: number) {
  if (!classId) return [];
  const loadout = startingEquipmentForClass(classId)?.beginnerLoadout ?? [];
  const seen = new Set<string>();
  const out: { name: string; bonus: string; dice: string; type: string }[] = [];
  for (const entry of loadout) {
    const item = EQUIPMENT_ITEMS.find(
      e => e.category === "weapon" && entry.toLowerCase().includes(e.name.toLowerCase())
    );
    if (!item || seen.has(item.id)) continue;
    seen.add(item.id);
    const props = item.properties ?? [];
    const isFinesse = props.includes("Fina");
    const isRanged = props.some(p => p === "Munición" || p === "Arrojadiza" || p.startsWith("Munición"));
    const fueMod = modOf(stats.FUE ?? 10);
    const desMod = modOf(stats.DES ?? 10);
    const statMod = isFinesse ? Math.max(fueMod, desMod) : isRanged ? desMod : fueMod;
    out.push({
      name: item.name,
      bonus: fmtMod(statMod + profBonus),
      dice: statMod !== 0 ? `${item.damage ?? "1"} ${fmtMod(statMod)}` : (item.damage ?? "1"),
      type: item.damageType ?? "",
    });
  }
  return out;
}

function PrintPortrait({ size, name, raceId, gender }: { size: number; name: string; raceId: string | null; gender?: "male" | "female" }) {
  const [err, setErr] = useState(false);
  const src = raceId ? racePortrait(raceId, gender ?? "male") : null;
  const inner = (!src || err)
    ? <div style={{ width: size, height: size, borderRadius: 5, background: "linear-gradient(135deg,#344E86,#8B5A1A)", display: "grid", placeItems: "center", fontSize: Math.round(size * 0.35), color: "white", fontFamily: "Georgia", fontWeight: 700 }}>{(name?.[0] ?? "?").toUpperCase()}</div>
    : <div style={{ width: size, height: size, borderRadius: 5, overflow: "hidden" }}><Image src={src} alt={name} width={size} height={size} style={{ objectFit: "cover", width: "100%", height: "100%" }} onError={() => setErr(true)} /></div>;
  return (
    <div style={{ width: size + 5, height: size + 5, flexShrink: 0, borderRadius: 7, padding: 2.5, background: "linear-gradient(135deg,#D6A84F,#7A4E10,#D6A84F)" }}>
      {inner}
    </div>
  );
}

interface Props { params: Promise<{ id: string }> }

export default function CharacterPrintPage({ params }: Props) {
  const { id } = use(params);
  const { state } = useApp();
  const router = useRouter();
  const mounted = useMounted();

  const character = mounted ? state.characters.find(c => c.id === id) : undefined;
  useEffect(() => {
    if (mounted && !character) router.replace("/characters");
  }, [mounted, character, router]);

  useEffect(() => {
    if (!mounted || !character) return;
    const prev = document.title;
    document.title = `${character.name || "Personaje"} - LVL ONE`;
    return () => { document.title = prev; };
  }, [mounted, character]);

  if (!mounted || !character) return null;

  const built = buildCharacter(character);
  const profBonus = built.proficiencyBonus;
  const profSaves = built.class?.saves ?? [] as string[];
  const profSkills = [...(built.background?.skills ?? []), ...(character.selectedSkills ?? [])];
  const saveMod = (k: StatKey) => (built.mods[k] ?? 0) + (profSaves.includes(k) ? profBonus : 0);

  const spellProg = built.class?.spellcastingProgression;
  const canCast = spellProg ? character.level >= (spellProg.startsAtLevel ?? 1) : false;
  const allSpells = canCast ? SPELLS.filter(s => (built.spells ?? []).includes(s.id)) : [];
  const cantrips = allSpells.filter(s => s.level === 0);
  const lvlSpells = allSpells.filter(s => s.level > 0);
  const classItems = character.classId ? startingEquipmentForClass(character.classId)?.beginnerLoadout ?? [] : [];
  const weapons = getWeaponAttacks(character.classId, built.stats, profBonus);
  const raceTraits = built.race?.traitDetails?.slice(0, 5) ?? [];
  const classFeats = built.class?.classFeatures?.filter(f => f.level <= character.level) ?? [];

  function getSpellSlots(type: string, level: number): Record<number, number> {
    if (type === "full") {
      const t: Record<number, number[]> = { 1:[2],2:[3],3:[4,2],4:[4,3],5:[4,3,2],6:[4,3,3],7:[4,3,3,1],8:[4,3,3,2],9:[4,3,3,3,1],10:[4,3,3,3,2],11:[4,3,3,3,2,1],12:[4,3,3,3,2,1],13:[4,3,3,3,2,1,1],14:[4,3,3,3,2,1,1],15:[4,3,3,3,2,1,1,1],16:[4,3,3,3,2,1,1,1],17:[4,3,3,3,2,1,1,1,1],18:[4,3,3,3,2,1,1,1,1],19:[4,3,3,3,2,1,1,1,1],20:[4,3,3,3,2,1,1,1,1] };
      return Object.fromEntries((t[Math.min(level, 20)] ?? t[20]).map((n, i) => [i + 1, n]));
    }
    if (type === "pact") {
      const count = level < 2 ? 1 : level < 11 ? 2 : level < 17 ? 3 : 4;
      return { [level < 3 ? 1 : level < 5 ? 2 : level < 7 ? 3 : level < 9 ? 4 : 5]: count };
    }
    if (type === "half") {
      if (level < 2) return {};
      const t: Record<number, number[]> = { 2:[2],3:[3],4:[3],5:[4,2],6:[4,2],7:[4,3],8:[4,3],9:[4,3,2],10:[4,3,2],11:[4,3,2],12:[4,3,2],13:[4,3,2,1],14:[4,3,2,1],15:[4,3,2,1],16:[4,3,2,1],17:[4,3,2,1],18:[4,3,2,1],19:[4,3,2,1,1],20:[4,3,2,1,1] };
      return Object.fromEntries((t[Math.min(level, 20)] ?? []).map((n, i) => [i + 1, n]));
    }
    return {};
  }
  const slots = canCast && spellProg ? getSpellSlots(spellProg.type, character.level) : {};
  const slotLevels = Object.keys(slots).map(Number).sort();

  const abilityMod = spellProg ? modOf(built.stats[spellProg.ability] ?? 10) + profBonus : 0;

  return (
    <>
      <style>{S.page}</style>

      {/* Controls */}
      <div className="np" style={{ position: "fixed", top: 16, right: 16, display: "flex", gap: 8, zIndex: 200, background: "#1A120A", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(214,168,79,0.3)" }}>
        <button type="button" onClick={() => window.print()} style={{ padding: "8px 18px", borderRadius: 6, background: "#D6A84F", color: "#0F0D0B", fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none" }}>
          Imprimir / PDF
        </button>
        <button type="button" onClick={() => router.back()} style={{ padding: "8px 14px", borderRadius: 6, background: "transparent", color: "#D6A84F", fontSize: 13, cursor: "pointer", border: "1px solid rgba(214,168,79,0.5)" }}>
          ← Volver
        </button>
      </div>

      {/* ════════════════════ PAGE 1 — COMBAT ════════════════════ */}
      <div className="pp">
        <div className="in">

          {/* ── HEADER ── */}
          <div style={{ display: "flex", alignItems: "center", gap: "2.5mm", flexShrink: 0 }}>
            <PrintPortrait size={38} name={character.name} raceId={character.raceId} gender={character.gender} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "2mm", flexWrap: "wrap" }}>
                <span style={{ fontSize: "14pt", fontWeight: 700, color: "#0F0A06", lineHeight: 1.1, letterSpacing: "-0.01em", fontFamily: "Georgia" }}>
                  {character.name || "Sin nombre"}
                </span>
                <span style={{ fontSize: "6.8pt", color: "#3A2810", letterSpacing: "0.02em" }}>
                  <strong>{built.class?.name ?? "—"}</strong> Nv.<strong>{character.level}</strong>
                  {" · "}{built.race?.name ?? "—"}{built.subrace ? ` (${built.subrace.name})` : ""}
                  {built.background ? ` · ${built.background.name}` : ""}
                  {character.alignment ? ` · ${character.alignment}` : ""}
                </span>
              </div>
            </div>
            <div style={{ flexShrink: 0, textAlign: "right", lineHeight: 1.1 }}>
              <div style={{ fontSize: "7pt", fontWeight: 700, color: "#7A4E10", letterSpacing: "0.08em", fontFamily: "Georgia" }}>LVL ONE</div>
              <div style={{ fontSize: "3.8pt", color: "#8A8378", fontFamily: "Arial", textTransform: "uppercase", letterSpacing: "0.14em" }}>Hoja de personaje</div>
            </div>
          </div>

          {/* ── STATS — ultra compact ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "1.2mm", flexShrink: 0 }}>
            {STAT_KEYS.map(k => {
              const total = built.stats[k] ?? 10;
              const m = built.mods[k] ?? 0;
              const accent = STAT_COLORS[k] ?? "#7A4E10";
              return (
                <div key={k} style={{ textAlign: "center", borderRadius: "1.5mm", padding: "0.7mm 0.6mm", border: `0.2mm solid ${accent}30`, borderTop: `0.7mm solid ${accent}`, background: `${accent}06` }}>
                  <div style={{ fontSize: "4.2pt", letterSpacing: "0.14em", color: accent, fontFamily: "Arial", textTransform: "uppercase", fontWeight: 700, lineHeight: 1.2 }}>{STAT_LABELS[k]}</div>
                  <div style={{ fontSize: "14pt", fontWeight: 700, color: "#0F0A06", lineHeight: 1, fontFamily: "Georgia" }}>{total}</div>
                  <div style={{ fontSize: "7.5pt", color: accent, fontFamily: "Courier New", fontWeight: 700, lineHeight: 1 }}>{fmtMod(m)}</div>
                </div>
              );
            })}
          </div>

          {/* ── COMBAT BAR — inline compact ── */}
          <div style={{ display: "flex", flexShrink: 0, border: "0.2mm solid rgba(0,0,0,0.12)", borderRadius: "1.5mm", overflow: "hidden" }}>
            {([
              ["PG", `${character.hpCurrent ?? built.hp}/${built.hp}`, "#8B1A10"],
              ["CA", String(built.ac), "#1E3A7A"],
              ["INI", fmtMod(built.initiative), "#1E5A30"],
              ["VEL", formatSpeed(built.race?.speed ?? 9), "#4A3820"],
              ["PROF", `+${profBonus}`, "#7A4E10"],
              ["IDIOMAS", (built.race?.languages ?? []).slice(0, 2).join(", ") || "—", "#4A2878"],
            ] as const).map(([k, v, accent], i) => (
              <div key={k} style={{ flex: 1, textAlign: "center", padding: "0.8mm 0.3mm", borderRight: i < 5 ? "0.15mm solid rgba(0,0,0,0.06)" : "none" }}>
                <div style={{ fontSize: "3.8pt", letterSpacing: "0.16em", color: accent, fontFamily: "Arial", textTransform: "uppercase", fontWeight: 700 }}>{k}</div>
                <div style={{ fontSize: "8.5pt", fontWeight: 700, color: accent, fontFamily: "Georgia", lineHeight: 1.1 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* ── MAIN GRID: Saves | Skills | Attacks + Traits ── */}
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "28mm 1fr 1fr", gap: "2mm", overflow: "hidden", minHeight: 0 }}>

            {/* Col 1: Saving Throws */}
            <div style={{ border: "0.2mm solid rgba(0,0,0,0.12)", borderRadius: "1.5mm", padding: "1.2mm", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div className="sl" style={{ marginBottom: "0.8mm" }}>Salvaciones</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4mm", flex: 1 }}>
                {STAT_KEYS.map(k => {
                  const prof = profSaves.includes(k);
                  return (
                    <div key={k} style={{ display: "flex", alignItems: "center", gap: "1.2mm", padding: "0.2mm 0.6mm", borderRadius: "0.4mm", background: prof ? "rgba(122,78,16,0.06)" : "transparent" }}>
                      <span className={prof ? "df" : "de"} />
                      <span style={{ fontSize: "6pt", flex: 1, color: "#2A1E10", fontWeight: prof ? 600 : 400 }}>{STAT_LABELS[k]}</span>
                      <span className="mono" style={{ fontSize: "6.5pt", color: prof ? "#7A4E10" : "#6A5438", fontWeight: prof ? 700 : 400 }}>{fmtMod(saveMod(k))}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Col 2: Skills — 2 columns compact */}
            <div style={{ border: "0.2mm solid rgba(0,0,0,0.12)", borderRadius: "1.5mm", padding: "1.2mm", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div className="sl" style={{ marginBottom: "0.6mm" }}>Habilidades</div>
              <div style={{ display: "flex", gap: "1.5mm", flex: 1, overflow: "hidden" }}>
                {([
                  ["FUE", "DES", "CON", "INT"],
                  ["SAB", "CAR"],
                ] as StatKey[][]).map((keys, ci) => (
                  <div key={ci} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "0.3mm" }}>
                    {keys.map(stat => {
                      const skills = (SKILLS_BY_STAT as Record<StatKey, string[]>)[stat] ?? [];
                      if (!skills.length) return null;
                      return (
                        <div key={stat}>
                          {skills.map(skill => {
                            const prof = profSkills.includes(skill);
                            return (
                              <div key={skill} style={{ display: "flex", alignItems: "center", gap: "1mm", padding: "0.15mm 0.4mm", borderRadius: "0.3mm", background: prof ? "rgba(122,78,16,0.04)" : "transparent" }}>
                                <span className={prof ? "df" : "de"} />
                                <span style={{ fontSize: "5.8pt", flex: 1, color: "#2A1E10", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{skill}</span>
                                <span className="mono" style={{ fontSize: "6.2pt", color: prof ? "#7A4E10" : "#6A5438", fontWeight: prof ? 700 : 400, minWidth: "3.5mm", textAlign: "right" }}>{fmtMod(built.mods[stat] + (prof ? profBonus : 0))}</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Col 3: Attacks + Traits stacked */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5mm", overflow: "hidden" }}>
              {/* Attacks */}
              {weapons.length > 0 && (
                <div style={{ border: "0.2mm solid rgba(139,26,16,0.18)", borderRadius: "1.5mm", padding: "1.2mm", flexShrink: 0 }}>
                  <div className="sl" style={{ marginBottom: "0.5mm" }}>Ataques</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5mm" }}>
                    {weapons.map(w => (
                      <div key={w.name} style={{ display: "flex", alignItems: "center", gap: "1.5mm", padding: "0.5mm 1.2mm", borderRadius: "1mm", background: "rgba(139,26,16,0.04)" }}>
                        <span style={{ fontSize: "7pt", fontWeight: 600, color: "#1A120A", flex: 1, fontFamily: "Georgia" }}>{w.name}</span>
                        <span style={{ fontSize: "3.8pt", color: "#9A8A78", fontFamily: "Arial", letterSpacing: "0.12em" }}>ATQ</span>
                        <span className="mono" style={{ fontSize: "7.5pt", color: "#8B1A10", fontWeight: 700, minWidth: "5mm", textAlign: "center" }}>{w.bonus}</span>
                        <span style={{ fontSize: "3.8pt", color: "#9A8A78", fontFamily: "Arial", letterSpacing: "0.12em" }}>DAÑO</span>
                        <span className="mono" style={{ fontSize: "7.5pt", color: "#8B1A10", minWidth: "9mm" }}>{w.dice}</span>
                        {w.type && <span style={{ fontSize: "5.5pt", color: "#6A5438", fontFamily: "Arial" }}>{w.type}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Traits — compact */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.2mm", overflow: "hidden" }}>
                {raceTraits.length > 0 && (
                  <div style={{ border: "0.2mm solid rgba(0,0,0,0.11)", borderRadius: "1.5mm", padding: "1.2mm", flexShrink: 0 }}>
                    <div className="sl" style={{ marginBottom: "0.4mm" }}>{built.race?.name}</div>
                    {raceTraits.map(t => (
                      <div key={t.id} style={{ display: "flex", gap: "0.8mm", marginBottom: "0.4mm" }}>
                        <span style={{ color: "#7A4E10", fontSize: "4.8pt", flexShrink: 0, marginTop: "0.3mm" }}>■</span>
                        <div>
                          <span style={{ fontSize: "5.8pt", fontWeight: 700, color: "#7A4E10" }}>{t.name}</span>
                          {t.summary && <span style={{ fontSize: "5.2pt", color: "#5A4030", lineHeight: 1.3 }}>{" — "}{t.summary}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {classFeats.length > 0 && (
                  <div style={{ flex: 1, border: "0.2mm solid rgba(0,0,0,0.11)", borderRadius: "1.5mm", padding: "1.2mm", overflow: "hidden" }}>
                    <div className="sl" style={{ marginBottom: "0.4mm" }}>{built.class?.name}</div>
                    {classFeats.map(f => (
                      <div key={f.id} style={{ display: "flex", gap: "0.8mm", marginBottom: "0.4mm" }}>
                        <span style={{ color: "#1E3A7A", fontSize: "4.8pt", flexShrink: 0, marginTop: "0.3mm" }}>■</span>
                        <div>
                          <span style={{ fontSize: "5.8pt", fontWeight: 700, color: "#1E3A7A" }}>{f.name}</span>
                          {f.summary && <span style={{ fontSize: "5.2pt", color: "#5A4030", lineHeight: 1.3 }}>{" — "}{f.summary}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ════════════════════ PAGE 2 — LORE ════════════════════ */}
      <div className="pp" style={{ pageBreakBefore: "always", breakBefore: "page" }}>
        <div className="in">

          {/* ── P2 HEADER ── */}
          <div style={{ display: "flex", alignItems: "center", gap: "3mm", flexShrink: 0 }}>
            <PrintPortrait size={48} name={character.name} raceId={character.raceId} gender={character.gender} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "12pt", fontWeight: 700, color: "#0F0A06", fontFamily: "Georgia", lineHeight: 1.1 }}>{character.name}</div>
              <div style={{ fontSize: "6.8pt", color: "#3A2810", marginTop: "0.3mm" }}>
                {built.class?.name} · Nv.{character.level}
                {" · "}{built.race?.name}{built.subrace ? ` (${built.subrace.name})` : ""}
                {built.background ? ` · ${built.background.name}` : ""}
                {character.alignment ? ` · ${character.alignment}` : ""}
              </div>
            </div>
            <span style={{ fontSize: "4pt", color: "#8A8378", fontFamily: "Arial", textTransform: "uppercase", letterSpacing: "0.14em", flexShrink: 0 }}>LVL ONE · p.2</span>
          </div>

          {/* ── STORY ── */}
          {character.story && (
            <div style={{ border: "0.2mm solid rgba(0,0,0,0.1)", borderRadius: "1.5mm", padding: "1.5mm", flexShrink: 0 }}>
              <div className="sl" style={{ marginBottom: "0.6mm" }}>Historia</div>
              <p style={{ fontSize: "7pt", color: "#1A120A", lineHeight: 1.5, margin: 0, fontFamily: "Georgia" }}>{character.story}</p>
            </div>
          )}

          {/* ── IDEALS / BONDS / FLAWS — 3-col ── */}
          {(character.ideals || character.bonds || character.flaws) && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5mm", flexShrink: 0 }}>
              {([
                ["Ideales", character.ideals, "#7A4E10"],
                ["Vínculos", character.bonds, "#1E3A7A"],
                ["Defectos", character.flaws, "#8B1A10"],
              ] as [string, string | undefined, string][]).filter(([, v]) => v).map(([label, val, accent]) => (
                <div key={label} style={{ border: `0.2mm solid ${accent}25`, borderRadius: "1.5mm", padding: "1.5mm", borderLeft: `0.6mm solid ${accent}` }}>
                  <div className="sl" style={{ color: accent, marginBottom: "0.4mm" }}>{label}</div>
                  <p style={{ fontSize: "6.5pt", color: "#1A120A", lineHeight: 1.45, margin: 0, fontStyle: "italic", fontFamily: "Georgia" }}>“{val}”</p>
                </div>
              ))}
            </div>
          )}

          {/* ── EQUIPMENT + COINS ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1.5mm", flexShrink: 0 }}>
            <div style={{ border: "0.2mm solid rgba(0,0,0,0.11)", borderRadius: "1.5mm", padding: "1.5mm" }}>
              <div className="sl" style={{ marginBottom: "0.5mm" }}>Equipo — {built.class?.name}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3mm 2.5mm" }}>
                {classItems.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "1mm" }}>
                    <span style={{ width: 2.5, height: 2.5, borderRadius: "50%", background: "#7A4E10", flexShrink: 0, display: "inline-block" }} />
                    <span style={{ fontSize: "6.5pt", color: "#2A1E10" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ border: "0.2mm solid rgba(0,0,0,0.11)", borderRadius: "1.5mm", padding: "1.2mm 1.5mm", minWidth: "36mm" }}>
              <div className="sl" style={{ marginBottom: "0.6mm" }}>Monedas</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8mm" }}>
                {([
                  ["PP", character.platinum ?? 0, "#4A7898"],
                  ["PO", character.gold ?? 0, "#7A4E10"],
                  ["PE", character.silver ?? 0, "#526070"],
                  ["PC", character.copper ?? 0, "#7A3A10"],
                ] as const).map(([label, val, color]) => (
                  <div key={label} style={{ textAlign: "center", borderRadius: "1mm", padding: "0.6mm", background: `${color}08`, border: `0.2mm solid ${color}35`, borderTop: `0.5mm solid ${color}` }}>
                    <div style={{ fontSize: "4pt", fontFamily: "Arial", color, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>{label}</div>
                    <div style={{ fontSize: "8pt", fontFamily: "Courier New", color, fontWeight: 700, lineHeight: 1.1 }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── SPELLS ── */}
          {built.class?.spellcaster ? (
            <div style={{ flex: 1, border: "0.25mm solid rgba(30,58,122,0.22)", borderRadius: "1.5mm", padding: "1.5mm", overflow: "hidden", background: "rgba(30,58,122,0.015)" }}>
              {canCast ? (
                <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8mm", flexShrink: 0 }}>
                    <div className="sl" style={{ marginBottom: 0, color: "#1E3A7A" }}>Conjuros</div>
                    <span style={{ fontSize: "5pt", color: "#1E3A7A", fontFamily: "Arial" }}>
                      {spellProg?.ability} · ataque {fmtMod(abilityMod)} · CD {8 + abilityMod}
                    </span>
                  </div>
                  {slotLevels.length > 0 && (
                    <div style={{ display: "flex", gap: "2mm", marginBottom: "1mm", flexShrink: 0, flexWrap: "wrap" }}>
                      {slotLevels.map(lvl => (
                        <div key={lvl} style={{ display: "flex", alignItems: "center", gap: "0.8mm" }}>
                          <span style={{ fontSize: "4.5pt", color: "#1E3A7A", fontFamily: "Arial", fontWeight: 700 }}>Nv.{lvl}</span>
                          <div style={{ display: "flex", gap: "0.5mm" }}>
                            {Array.from({ length: slots[lvl] }).map((_, i) => (
                              <span key={i} style={{ display: "inline-block", width: "2.5mm", height: "2.5mm", borderRadius: "50%", border: "0.2mm solid #1E3A7A", background: "rgba(30,58,122,0.08)" }} />
                            ))}
                          </div>
                          <span style={{ fontSize: "4.5pt", color: "#6A5438", fontFamily: "Arial" }}>{slots[lvl]}×</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", gap: "0.8mm" }}>
                    {cantrips.length > 0 && (
                      <div>
                        <div style={{ fontSize: "4pt", color: "#8A8378", fontFamily: "Arial", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "0.4mm" }}>Trucos</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4mm 1mm" }}>
                          {cantrips.map(s => (
                            <span key={s.id} style={{ fontSize: "5.8pt", padding: "0.3mm 1.2mm", borderRadius: "0.6mm", background: "rgba(122,78,16,0.06)", color: "#7A4E10", border: "0.15mm solid rgba(122,78,16,0.25)", fontFamily: "Georgia" }}>{s.name}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {lvlSpells.length > 0 && (
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <div style={{ fontSize: "4pt", color: "#8A8378", fontFamily: "Arial", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "0.4mm" }}>Conjuros</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4mm 1mm", overflow: "hidden" }}>
                          {lvlSpells.map(s => (
                            <span key={s.id} style={{ fontSize: "5.8pt", padding: "0.3mm 1.2mm", borderRadius: "0.6mm", border: "0.15mm solid rgba(30,58,122,0.25)", fontFamily: "Georgia", background: "rgba(30,58,122,0.05)", color: "#1E3A7A" }}>
                              {s.name}{s.concentration ? " (C)" : ""}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {allSpells.length === 0 && (
                      <p style={{ fontSize: "6pt", color: "#8A8378", fontFamily: "Arial", margin: 0 }}>Sin conjuros seleccionados.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <p style={{ fontSize: "6pt", color: "#6A5438", fontFamily: "Arial", margin: 0 }}>
                    Los {built.class?.name}s obtienen conjuros a partir del nivel {spellProg?.startsAtLevel ?? 2}. Nivel actual: {character.level}.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ flex: 1, border: "0.15mm dashed rgba(0,0,0,0.08)", borderRadius: "1.5mm", padding: "1.5mm", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "6pt", color: "#8A8378", fontFamily: "Arial", fontStyle: "italic" }}>Notas</span>
            </div>
          )}

          {/* ── FOOTER ── */}
          <div style={{ borderTop: "0.15mm solid rgba(0,0,0,0.08)", paddingTop: "0.8mm", display: "flex", justifyContent: "space-between", flexShrink: 0 }}>
            <span style={{ fontSize: "4pt", color: "#8A8378", fontFamily: "Arial" }}>LVL ONE · Hoja de Personaje para D&D 5e</span>
            <span style={{ fontSize: "4pt", color: "#8A8378", fontFamily: "Arial" }}>Reglas Básicas · lvl-one.app</span>
          </div>

        </div>
      </div>
    </>
  );
}
