"use client";
import type { CharacterDraft } from "@/types/character";
import { RACES } from "@/data/races";
import { CLASSES } from "@/data/classes";
import { SUBRACES } from "@/data/subraces";
import { modOf, fmtMod, STAT_KEYS, hpForLevel, proficiencyBonusForLevel } from "@/types/character";

const STEP_LABELS = ["Identidad","Raza","Clase","Stats","Trasfondo","Equipo","Historia","Ficha"];

export function LivePreview({ draft, currentStep }: { draft: CharacterDraft; currentStep: number }) {
  const race = RACES.find(r => r.id === draft.raceId);
  const subrace = SUBRACES.find(s => s.id === draft.subraceId);
  const cls = CLASSES.find(c => c.id === draft.classId);

  return (
    <div>
      <div className="lo-label" style={{ marginBottom: 10 }}>Vista en vivo</div>
      <div className="lo-card-elev" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,var(--arcane-blue),var(--quest-gold-lo))", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontSize: 18, color: "white", flexShrink: 0 }}>
            {(draft.name?.[0] ?? "?").toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--text-hi)" }}>{draft.name || "Sin nombre"}</div>
            <div style={{ fontSize: 11, color: "var(--text-mid)" }}>{race?.name ?? "—"}{subrace ? ` · ${subrace.name}` : ""} · {cls?.name ?? "—"} · Nv.{draft.level}</div>
          </div>
        </div>
        {Object.keys(draft.baseStats).length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 4 }}>
            {STAT_KEYS.map(k => {
              const base = draft.baseStats[k] ?? 10;
              const raceAsi = race?.asi ?? {};
              const subAsi = subrace?.asi ?? {};
              const total = base + (("all" in raceAsi ? raceAsi.all ?? 0 : 0)) + ((raceAsi as Record<string,number>)[k] ?? 0) + ((subAsi as Record<string,number>)[k] ?? 0);
              const m = modOf(total);
              return (
                <div key={k} className="lo-stat" style={{ padding: "6px 4px 4px" }}>
                  <div className="lo-stat-label" style={{ fontSize: 8 }}>{k}</div>
                  <div className="lo-stat-value" style={{ fontSize: 18 }}>{total}</div>
                  <div className="lo-stat-mod" style={{ fontSize: 9 }}>{fmtMod(m)}</div>
                </div>
              );
            })}
          </div>
        )}
        {cls && draft.level && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 4, marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--line)" }}>
            {(() => {
              const conMod = modOf((draft.baseStats.CON ?? 10) + ((race?.asi && "all" in race.asi ? race.asi.all ?? 0 : 0) + ((race?.asi as Record<string,number>)?.CON ?? 0) + ((subrace?.asi && "all" in subrace.asi ? subrace.asi.all ?? 0 : 0) + ((subrace?.asi as Record<string,number>)?.CON ?? 0))));
              const dexMod = modOf((draft.baseStats.DES ?? 10) + ((race?.asi && "all" in race.asi ? race.asi.all ?? 0 : 0) + ((race?.asi as Record<string,number>)?.DES ?? 0) + ((subrace?.asi && "all" in subrace.asi ? subrace.asi.all ?? 0 : 0) + ((subrace?.asi as Record<string,number>)?.DES ?? 0))));
              const hitDie = parseInt(cls.hit.slice(1), 10);
              const hp = hpForLevel(hitDie, conMod, draft.level);
              const prof = proficiencyBonusForLevel(draft.level);
              const ac = (() => {
                switch (cls.id) {
                  case "fighter": case "paladin": return 18;
                  case "cleric": return 16 + Math.min(dexMod, 2);
                  case "barbarian": return 10 + dexMod + conMod;
                  case "monk": return 10 + dexMod + modOf((draft.baseStats.SAB ?? 10) + ((race?.asi && "all" in race.asi ? race.asi.all ?? 0 : 0) + ((race?.asi as Record<string,number>)?.SAB ?? 0) + ((subrace?.asi && "all" in subrace.asi ? subrace.asi.all ?? 0 : 0) + ((subrace?.asi as Record<string,number>)?.SAB ?? 0))));
                  case "druid": return 13 + dexMod;
                  case "ranger": return 14 + Math.min(dexMod, 2);
                  case "bard": case "rogue": case "warlock": return 11 + dexMod;
                  default: return 10 + dexMod;
                }
              })();
              return [
                { label: "PG", value: hp },
                { label: "CA", value: ac },
                { label: "PROF", value: `+${prof}` },
              ].map(({ label, value }) => (
                <div key={label} style={{ textAlign: "center", padding: "4px 2px" }}>
                  <div style={{ fontSize: 8, color: "var(--text-low)", letterSpacing: "0.1em" }}>{label}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--quest-gold-hi)", lineHeight: 1.1 }}>{value}</div>
                </div>
              ));
            })()}
          </div>
        )}
      </div>

      <div className="lo-label" style={{ marginBottom: 8 }}>Pasos</div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        {STEP_LABELS.map((l, i) => {
          const n = i + 1; const done = n < currentStep; const cur = n === currentStep;
          return (
            <li key={l} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", borderRadius: 6, fontSize: 11.5,
              color: cur ? "var(--quest-gold-hi)" : done ? "var(--text-mid)" : "var(--text-low)",
              background: cur ? "rgba(214,168,79,0.08)" : "transparent" }}>
              <span style={{ width: 16, height: 16, borderRadius: 999, fontSize: 9,
                background: done ? "var(--quest-gold)" : "rgba(244,231,197,0.06)",
                color: done ? "#1A130A" : "var(--text-low)",
                display: "grid", placeItems: "center", fontWeight: 600 }}>
                {done ? "✓" : n}
              </span>
              {l}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
