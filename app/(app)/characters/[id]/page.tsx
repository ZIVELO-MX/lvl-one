"use client";
import { use, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useApp, buildCharacter } from "@/lib/store";
import { updateCharacter } from "@/lib/character-api";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { EQUIPMENT_ITEMS, startingEquipmentForClass } from "@/data/equipment";
import { SPELLS } from "@/data/spells";
import { STAT_KEYS, STAT_LABELS, ALL_SKILLS, SKILLS_BY_STAT, fmtMod, modOf } from "@/types/character";
import type { CharacterDraft, StatKey } from "@/types/character";
import { racePortrait, classPortrait } from "@/lib/portraits";
import { STAT_COLORS } from "@/lib/suggestions";
import { LevelUpDialog } from "@/components/levelup/LevelUpDialog";
import { LevelBenefitsPanel } from "@/components/levelup/LevelBenefitsPanel";

function CharacterPortrait({ raceId, classId, name, gender }: { raceId: string | null; classId: string | null; name: string; gender?: "male" | "female" }) {
  const [err, setErr] = useState(false);
  const g = gender ?? "male";
  const src = raceId ? racePortrait(raceId, g) : (classId ? classPortrait(classId, g) : null);
  if (!src || err) {
    return (
      <div style={{ width: 80, height: 80, borderRadius: 16, flexShrink: 0,
        background: "linear-gradient(135deg,var(--arcane-blue),var(--quest-gold-lo))",
        display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontSize: 32, color: "white" }}>
        {(name?.[0] ?? "?").toUpperCase()}
      </div>
    );
  }
  return (
    <div style={{ width: 80, height: 80, borderRadius: 16, overflow: "hidden", flexShrink: 0, border: "1px solid rgba(214,168,79,0.3)" }}>
      <Image src={src} alt={name} width={80} height={80}
        style={{ objectFit: "cover", width: "100%", height: "100%" }}
        onError={() => setErr(true)} />
    </div>
  );
}

function getSpellSlots(progressionType: string, level: number): Record<number, number> {
  if (progressionType === "full") {
    const t: Record<number, number[]> = {
      1:[2],2:[3],3:[4,2],4:[4,3],5:[4,3,2],6:[4,3,3],7:[4,3,3,1],8:[4,3,3,2],9:[4,3,3,3,1],10:[4,3,3,3,2],
      11:[4,3,3,3,2,1],12:[4,3,3,3,2,1],13:[4,3,3,3,2,1,1],14:[4,3,3,3,2,1,1],15:[4,3,3,3,2,1,1,1],
      16:[4,3,3,3,2,1,1,1],17:[4,3,3,3,2,1,1,1,1],18:[4,3,3,3,2,1,1,1,1],19:[4,3,3,3,2,1,1,1,1],20:[4,3,3,3,2,1,1,1,1],
    };
    const row = t[Math.min(level, 20)] ?? t[20];
    return Object.fromEntries((row ?? []).map((n, i) => [i + 1, n]));
  }
  if (progressionType === "pact") {
    const count = level < 2 ? 1 : level < 11 ? 2 : level < 17 ? 3 : 4;
    const slotLvl = level < 3 ? 1 : level < 5 ? 2 : level < 7 ? 3 : level < 9 ? 4 : 5;
    return { [slotLvl]: count };
  }
  if (progressionType === "half") {
    if (level < 2) return {};
    const t: Record<number, number[]> = {
      2:[2],3:[3],4:[3],5:[4,2],6:[4,2],7:[4,3],8:[4,3],9:[4,3,2],10:[4,3,2],
      11:[4,3,2],12:[4,3,2],13:[4,3,2,1],14:[4,3,2,1],15:[4,3,2,1],16:[4,3,2,1],17:[4,3,2,1],18:[4,3,2,1],19:[4,3,2,1,1],20:[4,3,2,1,1],
    };
    const row = t[Math.min(level, 20)] ?? [];
    return Object.fromEntries((row ?? []).map((n, i) => [i + 1, n]));
  }
  return {};
}

type WeaponAttack = { id: string; name: string; attackBonus: string; diceAndMod: string; damageType: string };

function getWeaponAttacks(classId: string | null, stats: Record<string, number>, profBonus: number): WeaponAttack[] {
  if (!classId) return [];
  const loadout = startingEquipmentForClass(classId)?.beginnerLoadout ?? [];
  const seen = new Set<string>();
  const out: WeaponAttack[] = [];

  for (const entry of loadout) {
    const item = EQUIPMENT_ITEMS.find(
      e => e.category === "weapon" && (e.id === entry || entry.toLowerCase().includes(e.name.toLowerCase()))
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
      id: item.id,
      name: item.name,
      attackBonus: fmtMod(statMod + profBonus),
      diceAndMod: statMod !== 0 ? `${item.damage ?? "1"} ${fmtMod(statMod)}` : (item.damage ?? "1"),
      damageType: item.damageType ?? "",
    });
  }
  return out;
}

interface Props { params: Promise<{ id: string }> }

export default function CharacterSheetPage({ params }: Props) {
  const { id } = use(params);
  const { state, dispatch } = useApp();
  const router = useRouter();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const patchAndSync = useCallback((patch: Partial<CharacterDraft>) => {
    dispatch({ type: "CHARACTER_PATCH", id, patch });
    updateCharacter(id, patch).catch(() => {});
  }, [id, dispatch]);

  const character = state.characters.find(c => c.id === id);
  if (!character) { router.replace("/characters"); return null; }

  const built = buildCharacter(character);
  const maxHp = built.hp;
  const hpCurrent = character.hpCurrent ?? maxHp;
  const hpTemp = character.hpTemp ?? 0;
  const hpPct = maxHp > 0 ? (hpCurrent / maxHp) * 100 : 0;
  const hpColor = hpPct > 60 ? "var(--moss-green)" : hpPct > 25 ? "var(--quest-gold)" : "var(--dragon-red)";

  const profBonus = built.proficiencyBonus;
  const proficientSaves: string[] = built.class?.saves ?? [];
  // buildCharacter ya fusiona trasfondo, elegidas y las que concede la raza.
  const proficientSkills = built.skillProficiencies;

  const skillMod = (skill: string): number => {
    const stat = (Object.entries(SKILLS_BY_STAT) as [StatKey, string[]][])
      .find(([, skills]) => skills.includes(skill))?.[0];
    return (stat ? (built.mods[stat] ?? 0) : 0) + (proficientSkills.includes(skill) ? profBonus : 0);
  };

  const saveMod = (k: StatKey): number =>
    (built.mods[k] ?? 0) + (proficientSaves.includes(k) ? profBonus : 0);

  const selectedSpells = SPELLS.filter(s => (built.spells ?? []).includes(s.id));
  const cantrips = selectedSpells.filter(s => s.level === 0);
  const level1Spells = selectedSpells.filter(s => s.level === 1);
  const items = (character.classId ? startingEquipmentForClass(character.classId)?.beginnerLoadout ?? [] : [])
    .map(id => EQUIPMENT_ITEMS.find(e => e.id === id)?.name ?? id);

  const weapons = getWeaponAttacks(character.classId, built.stats, profBonus);

  const spellProg = built.class?.spellcastingProgression;
  const slotTotals = spellProg ? getSpellSlots(spellProg.type, character.level) : {};
  const slotLevels = Object.keys(slotTotals).map(Number).sort();
  const slotsUsed: Record<number, number> = character.spellSlotsUsed ?? {};

  const clickSlot = (slotLevel: number, idx: number) => {
    const used = slotsUsed[slotLevel] ?? 0;
    const total = slotTotals[slotLevel];
    const available = total - used;
    const newUsed = idx < available ? used + 1 : Math.max(0, used - 1);
    patchAndSync({ spellSlotsUsed: { ...slotsUsed, [slotLevel]: Math.min(total, newUsed) } });
  };

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <style>{`
        @media print {
          #char-print { zoom: 0.82; }
          #char-print .lo-card-elev { padding: 10px !important; }
          #char-print h1 { font-size: 22px !important; }
          #char-print img { width: 52px !important; height: 52px !important; }
        }
      `}</style>

      <div data-no-print>
        <TopBar crumb={["Personajes", character.name || "Personaje"]} />
      </div>

      <div id="char-print" style={{ padding: "16px 32px 0", maxWidth: 1200, margin: "0 auto" }}>

        {/* ── HEADER ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", margin: "16px 0 20px" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <CharacterPortrait raceId={character.raceId ?? null} classId={character.classId ?? null} name={character.name} gender={character.gender} />
            <div>
              <h1 style={{ fontSize: 28, lineHeight: 1.1, marginBottom: 4 }}>{character.name}</h1>
              <div style={{ fontSize: 13, color: "var(--text-mid)" }}>
                {built.race?.name ?? "—"}{built.subrace ? ` · ${built.subrace.name}` : ""}
                {" · "}{built.class?.name ?? "—"}{built.subclass ? ` (${built.subclass.name})` : ""}{" · Nivel "}{character.level}
                {built.background ? ` · ${built.background.name}` : ""}
              </div>
              {character.alignment && (
                <div style={{ fontSize: 11, color: "var(--text-low)", marginTop: 2 }}>{character.alignment}</div>
              )}
            </div>
          </div>
          <div data-no-print style={{ display: "flex", gap: 8 }}>
            {character.level < 20 && (
              <button type="button" className="lo-btn lo-btn-primary" style={{ fontSize: 12 }}
                onClick={() => setShowLevelUp(true)}>
                <span style={{ display: "inline-block", transform: "rotate(-90deg)" }}><Ico name="arrow" size={12}/></span> Subir de Nivel
              </button>
            )}
            <button type="button" className="lo-btn lo-btn-ghost" style={{ fontSize: 12 }} onClick={() => router.push(`/characters/${id}/print`)}>
              Ver PDF
            </button>
            <button type="button" className="lo-btn lo-btn-ghost" style={{ fontSize: 12 }}
              onClick={() => { dispatch({ type: "DRAFT_INIT", draft: character }); router.push(`/characters/${id}/edit/1`); }}>
              <Ico name="chevron" size={12} /> Editar
            </button>
            <button type="button" className="lo-btn lo-btn-ghost" style={{ fontSize: 12 }} onClick={() => router.push("/characters")}>
              ← Mis personajes
            </button>
          </div>
        </div>

        {/* ── COMBAT STATS BAR ── */}
        <div className="lo-card-elev" style={{ padding: "18px 24px", marginBottom: 16, display: "flex", gap: 0, alignItems: "stretch" }}>
          {/* HP tracker */}
          <div style={{ flex: "0 0 auto", paddingRight: 28, borderRight: "1px solid var(--line-strong)", marginRight: 28 }}>
            <div className="lo-label" style={{ marginBottom: 8 }}>Puntos de golpe</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <button type="button" aria-label="Restar un punto de golpe" onClick={() => patchAndSync({ hpCurrent: Math.max(0, hpCurrent - 1) })}
                className="lo-btn lo-btn-ghost" style={{ padding: "4px 12px", fontSize: 16, lineHeight: 1 }}>−</button>
              <div style={{ fontSize: 32, fontFamily: "var(--font-display)", color: hpColor, lineHeight: 1, padding: "0 4px" }}>{hpCurrent}</div>
              <button type="button" aria-label="Sumar un punto de golpe" onClick={() => patchAndSync({ hpCurrent: Math.min(maxHp, hpCurrent + 1) })}
                className="lo-btn lo-btn-ghost" style={{ padding: "4px 12px", fontSize: 16, lineHeight: 1 }}>+</button>
              <span style={{ fontSize: 11, color: "var(--text-low)", marginLeft: 4 }}>/ {maxHp}</span>
            </div>
            <div className="lo-label" style={{ marginBottom: 4 }}>Temp</div>
            <input type="number" min={0} value={hpTemp} placeholder="0"
              onChange={e => patchAndSync({ hpTemp: Math.max(0, parseInt(e.target.value) || 0) })}
              style={{ width: 70, padding: "6px 10px", borderRadius: 6, border: "1px solid var(--line-strong)",
                background: "var(--bg-card)", color: "var(--text-hi)", fontSize: 14, fontFamily: "var(--font-display)" }} />
          </div>

          {/* Spell slots */}
          <div style={{ flex: 1 }}>
            <div className="lo-label" style={{ marginBottom: 10 }}>Espacios de conjuro</div>
            {!spellProg ? (
              <p style={{ fontSize: 12, color: "var(--text-low)" }}>Esta clase no lanza conjuros.</p>
            ) : slotLevels.length === 0 ? (
              <p style={{ fontSize: 12, color: "var(--text-low)" }}>Aún no tienes espacios de nivel 1.</p>
            ) : (
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {slotLevels.map(lvl => {
                  const total = slotTotals[lvl];
                  const used = slotsUsed[lvl] ?? 0;
                  const available = total - used;
                  return (
                    <div key={lvl}>
                      <div style={{ fontSize: 10, color: "var(--text-low)", marginBottom: 6 }}>Nivel {lvl}</div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        {Array.from({ length: total }).map((_, i) => (
                          <button type="button" key={`slot-${lvl}-${i}`} onClick={() => clickSlot(lvl, i)}
                            title={i < available ? "Gastar espacio" : "Recuperar espacio"}
                            style={{ width: 20, height: 20, borderRadius: 999, cursor: "pointer",
                              border: "2px solid var(--arcane-blue)",
                              background: i < available ? "var(--arcane-blue)" : "transparent",
                              transition: "all 0.15s" }} />
                        ))}
                        <span style={{ fontSize: 11, color: "var(--text-low)" }}>{available}/{total}</span>
                        {used > 0 && (
                          <button type="button" onClick={() => patchAndSync({ spellSlotsUsed: { ...slotsUsed, [lvl]: 0 } })}
                            className="lo-btn lo-btn-ghost" style={{ padding: "2px 6px", fontSize: 10 }}>Rest</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── COMBAT STATS ──
            CA, iniciativa, velocidad, competencia y percepción pasiva: cinco
            números de la hoja oficial que se calculaban y no se enseñaban. */}
        <div className="lo-card-elev" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))", gap: 12 }}>
            {[
              { etiqueta: "CA", valor: String(built.ac) },
              { etiqueta: "Iniciativa", valor: fmtMod(built.initiative) },
              { etiqueta: "Velocidad", valor: `${built.speed} m` },
              { etiqueta: "Competencia", valor: fmtMod(profBonus) },
              { etiqueta: "Percepción pasiva", valor: String(10 + skillMod("Percepción")) },
              {
                etiqueta: "Carga",
                valor: `${built.carriedKg} / ${built.carryCapacityKg} kg`,
                // Pasado de peso: el manual te deja llevarlo, pero a media velocidad.
                alerta: built.carriedKg > built.carryCapacityKg,
              },
            ].map(({ etiqueta, valor, alerta }) => (
              <div key={etiqueta} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: alerta ? "#E8847A" : "var(--text-hi)" }}>{valor}</div>
                <div style={{ fontSize: 10, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{etiqueta}</div>
              </div>
            ))}
          </div>
          {built.languages.length > 0 && (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
              <div className="lo-label" style={{ marginBottom: 6 }}>Idiomas</div>
              <p style={{ fontSize: 12, color: "var(--text-mid)", margin: 0 }}>{built.languages.join(" · ")}</p>
            </div>
          )}
          {built.derivedProficiencies.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div className="lo-label" style={{ marginBottom: 6 }}>Otras competencias</div>
              <p style={{ fontSize: 12, color: "var(--text-mid)", margin: 0 }}>{built.derivedProficiencies.join(" · ")}</p>
            </div>
          )}
        </div>

        {/* ── RASGOS Y ATRIBUTOS ──
            La casilla de la hoja oficial. Los rasgos raciales, los de clase y
            el del trasfondo estaban en los datos y no se enseñaban en ninguna
            parte: el jugador no sabía qué sabe hacer su personaje. */}
        {(() => {
          // La raza los guarda como cadenas y la subraza como objetos.
          const nombreRasgo = (t: string | { name: string }) => (typeof t === "string" ? t : t.name);
          const rasgosRaza = [
            ...(built.race?.traits ?? []).map(nombreRasgo),
            ...(built.subrace?.traits ?? []).map(nombreRasgo),
          ];
          const rasgosClase = (built.class?.classFeatures ?? [])
            .filter(f => f.level <= character.level)
            .map(f => `${f.name} (nv ${f.level})`);
          const grupos = [
            { titulo: built.race?.name ?? "Raza", items: rasgosRaza },
            { titulo: built.class?.name ?? "Clase", items: rasgosClase },
            { titulo: built.background?.name ?? "Trasfondo", items: built.background?.feature ? [built.background.feature] : [] },
          ].filter(g => g.items.length > 0);

          if (!grupos.length) return null;
          return (
            <div className="lo-card-elev" style={{ padding: 20, marginBottom: 16 }}>
              <div className="lo-label" style={{ marginBottom: 12 }}>Rasgos y atributos</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                {grupos.map(g => (
                  <div key={g.titulo}>
                    <div style={{ fontSize: 11, color: "var(--quest-gold-hi)", marginBottom: 6 }}>{g.titulo}</div>
                    <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
                      {g.items.map(item => (
                        <li key={item} style={{ fontSize: 12, color: "var(--text-mid)", lineHeight: 1.5 }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ── STATS + SKILLS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {/* Stats */}
          <div className="lo-card-elev" style={{ padding: 20 }}>
            <div className="lo-label" style={{ marginBottom: 12 }}>Características</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {STAT_KEYS.map(k => {
                const total = built.stats[k] ?? 10;
                const m = built.mods[k] ?? 0;
                const accent = STAT_COLORS[k] ?? "var(--quest-gold)";
                return (
                  <div key={k} style={{ textAlign: "center", padding: "10px 6px", borderRadius: 8,
                    background: `${accent}08`, border: `1px solid ${accent}20` }}>
                    <div style={{ fontSize: 9, color: "var(--text-low)", letterSpacing: "0.1em", marginBottom: 4 }}>{STAT_LABELS[k].toUpperCase().slice(0, 3)}</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: accent, lineHeight: 1, marginBottom: 2 }}>{total}</div>
                    <div style={{ fontSize: 11, color: "var(--text-mid)" }}>{fmtMod(m)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skills + Saves */}
          <div className="lo-card-elev" style={{ padding: 20 }}>
            <div className="lo-label" style={{ marginBottom: 12 }}>Tiradas de salvación</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 16 }}>
              {STAT_KEYS.map(k => {
                const mod = saveMod(k);
                const prof = proficientSaves.includes(k);
                return (
                  <div key={k} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, padding: "4px 8px", borderRadius: 6,
                    background: prof ? "rgba(214,168,79,0.08)" : "transparent" }}>
                    {prof && <Ico name="circle" size={8} />}
                    <span style={{ color: prof ? "var(--quest-gold-hi)" : "var(--text-mid)", flex: 1 }}>{STAT_LABELS[k]}</span>
                    <span style={{ fontFamily: "var(--font-display)", color: prof ? "var(--quest-gold-hi)" : "var(--text-low)" }}>{fmtMod(mod)}</span>
                  </div>
                );
              })}
            </div>
            <div className="lo-label" style={{ marginBottom: 8 }}>Habilidades</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {ALL_SKILLS.map(skill => {
                const mod = skillMod(skill);
                const proficient = proficientSkills.includes(skill);
                return (
                  <div key={skill} style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 11, padding: "3px 6px", borderRadius: 4,
                    background: proficient ? "rgba(214,168,79,0.06)" : "transparent" }}>
                    {proficient && <Ico name="circle" size={6} />}
                    <span style={{ color: proficient ? "var(--quest-gold-hi)" : "var(--text-low)", flex: 1 }}>{skill}</span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 10, color: proficient ? "var(--quest-gold-hi)" : "var(--text-low)" }}>{fmtMod(mod)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── EQUIPMENT + WEAPONS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div className="lo-card-elev" style={{ padding: 20 }}>
            <div className="lo-label" style={{ marginBottom: 10 }}>Equipo</div>
            {items.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {items.map((item, i) => (
                  <li key={`${i}-${item}`} style={{ fontSize: 12, color: "var(--text-mid)", padding: "4px 0", borderBottom: "1px solid var(--line-subtle)", display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ width: 4, height: 4, borderRadius: 999, background: "var(--quest-gold)" }} />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: 12, color: "var(--text-low)" }}>Sin equipo inicial.</p>
            )}
          </div>

          <div className="lo-card-elev" style={{ padding: 20 }}>
            <div className="lo-label" style={{ marginBottom: 10 }}>Ataques</div>
            {weapons.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {weapons.map(w => (
                  <div key={w.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 8,
                    background: "rgba(214,168,79,0.06)", border: "1px solid rgba(214,168,79,0.15)" }}>
                    <span style={{ fontSize: 13, color: "var(--text-hi)", fontWeight: 600 }}>{w.name}</span>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "var(--quest-gold-hi)" }}>{w.attackBonus}</span>
                      <span style={{ fontSize: 11, color: "var(--text-mid)" }}>{w.diceAndMod}</span>
                      <span style={{ fontSize: 10, color: "var(--text-low)" }}>{w.damageType}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 12, color: "var(--text-low)" }}>Sin armas.</p>
            )}
          </div>
        </div>

        {/* ── SPELLS ── */}
        {built.class?.spellcaster && selectedSpells.length > 0 && (
          <div className="lo-card-elev" style={{ padding: 20, marginBottom: 16 }}>
            <div className="lo-label" style={{ marginBottom: 12 }}>Conjuros</div>
            {cantrips.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: "var(--text-low)", marginBottom: 6, letterSpacing: "0.1em" }}>TRUCOS (∞)</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {cantrips.map(s => (
                    <span key={s.id} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6,
                      background: "rgba(214,168,79,0.08)", color: "var(--quest-gold-hi)",
                      border: "1px solid rgba(214,168,79,0.2)" }}>{s.name}</span>
                  ))}
                </div>
              </div>
            )}
            {level1Spells.length > 0 && (
              <div>
                <div style={{ fontSize: 10, color: "var(--text-low)", marginBottom: 6, letterSpacing: "0.1em" }}>NIVEL 1</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {level1Spells.map(s => (
                    <span key={s.id} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6,
                      background: "rgba(92,122,184,0.10)", color: "var(--arcane-blue-hi)",
                      border: "1px solid rgba(92,122,184,0.3)" }}>
                      {s.name}
                      {s.concentration && <span style={{ fontSize: 9, opacity: 0.6, marginLeft: 4 }}>C</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── LEVEL PROGRESSION ── */}
        <div style={{ marginTop: 20, marginBottom: 32 }}>
          <LevelBenefitsPanel character={built} />
        </div>
      </div>

      {showLevelUp && (
        <LevelUpDialog
          character={built}
          onClose={() => setShowLevelUp(false)}
          onConfirm={(patch) => {
            patchAndSync(patch);
            setShowLevelUp(false);
          }}
        />
      )}
    </main>
  );
}
