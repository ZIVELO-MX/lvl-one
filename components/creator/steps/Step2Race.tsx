"use client";
import { useState } from "react";
import Image from "next/image";
import { useApp } from "@/lib/store";
import { WizardShell } from "../WizardShell";
import { LivePreview } from "../LivePreview";
import { RACES } from "@/data/races";
import { CLASSES } from "@/data/classes";
import { subracesForRace } from "@/data/subraces";
import { Ico } from "@/components/ui/icons";
import { racePortrait, subracePortrait } from "@/lib/portraits";
import { getRaceSynergy, getCombinedTip } from "@/lib/suggestions";
import type { CharacterDraft, Subrace } from "@/types/character";
import type { Gender } from "@/lib/portraits";

type Tab = "standard" | "dm";

function Portrait({ src, alt, size = 120 }: { src: string; alt: string; size?: number }) {
  const [err, setErr] = useState(false);
  if (err) return null;
  return (
    <div style={{ width: size, height: size, borderRadius: 12, overflow: "hidden", flexShrink: 0, border: "1px solid rgba(214,168,79,0.3)" }}>
      <Image src={src} alt={alt} width={size} height={size}
        style={{ objectFit: "cover", width: "100%", height: "100%" }}
        onError={() => setErr(true)} />
    </div>
  );
}

function GenderToggle({ gender, onChange }: { gender: Gender; onChange: (g: Gender) => void }) {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {(["male", "female"] as Gender[]).map(g => (
        <button key={g} onClick={() => onChange(g)} style={{
          padding: "4px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer",
          border: gender === g ? "1px solid var(--quest-gold)" : "1px solid var(--line-strong)",
          background: gender === g ? "rgba(214,168,79,0.15)" : "rgba(244,231,197,0.03)",
          color: gender === g ? "var(--quest-gold-hi)" : "var(--text-low)",
        }}>
          {g === "male" ? "♂ Masculino" : "♀ Femenino"}
        </button>
      ))}
    </div>
  );
}

export function Step2Race({ draft, id }: { draft: CharacterDraft; id: string }) {
  const { dispatch } = useApp();
  const [tab, setTab] = useState<Tab>("standard");
  const gender: Gender = draft.gender ?? "male";
  const up = (patch: Partial<CharacterDraft>) => dispatch({ type: "DRAFT_UPDATE", patch });

  const filtered = RACES.filter(r => tab === "dm" ? !!r.requiresDMApproval : !r.requiresDMApproval);
  const selected = RACES.find(r => r.id === draft.raceId);
  const subraces = draft.raceId ? subracesForRace(draft.raceId) : [];

  const raceSynergy = draft.raceId ? getRaceSynergy(draft.raceId) : null;
  const combinedTip = draft.raceId && draft.classId ? getCombinedTip(draft.classId, draft.raceId) : null;

  // Show subrace portrait when a subrace is selected, otherwise race portrait
  const activePortraitSrc = (() => {
    if (draft.subraceId) {
      const src = subracePortrait(draft.subraceId, gender);
      if (src) return src;
    }
    if (draft.raceId) return racePortrait(draft.raceId, gender);
    return null;
  })();

  const pickRace = (raceId: string) => {
    if (draft.raceId === raceId) return;
    const patch: Partial<CharacterDraft> = { raceId, subraceId: null };
    if (!draft.classId) {
      const synergy = getRaceSynergy(raceId);
      if (synergy?.bestFor.length) {
        const cls = CLASSES.find(c => c.name === synergy.bestFor[0]);
        if (cls) patch.classId = cls.id;
      }
    }
    up(patch);
  };

  const TAB_LABELS: Record<Tab, string> = { standard: "Estándar", dm: "Requieren DM" };

  return (
    <WizardShell id={id} step={2} title="¿De qué raza será?"
      sub="Tu raza define rasgos pasivos, bonificaciones a características y habilidades innatas."
      preview={<LivePreview draft={draft} currentStep={2}/>}
      canProceed={!!draft.raceId}>

      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {(["standard", "dm"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer",
            background: tab === t ? "rgba(214,168,79,0.15)" : "transparent",
            border: tab === t ? "1px solid var(--quest-gold)" : "1px solid var(--line-strong)",
            color: tab === t ? "var(--quest-gold-hi)" : "var(--text-mid)" }}>
            {TAB_LABELS[t]}
            {t === "dm" && <span style={{ marginLeft: 6, fontSize: 10, color: "var(--text-low)" }}>consulta a tu DM</span>}
          </button>
        ))}
        <div style={{ marginLeft: "auto" }}>
          <GenderToggle gender={gender} onChange={g => up({ gender: g })} />
        </div>
      </div>

      {/* race grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
        {filtered.map(r => {
          const picked = draft.raceId === r.id;
          return (
            <button key={r.id} onClick={() => pickRace(r.id)} style={{
              padding: "14px 12px", borderRadius: 10, textAlign: "left", cursor: "pointer",
              border: picked ? "1px solid var(--quest-gold)" : "1px solid var(--line-strong)",
              background: picked ? "rgba(214,168,79,0.10)" : "rgba(244,231,197,0.03)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Ico name={r.glyph} size={18} color={picked ? "var(--quest-gold-hi)" : "var(--text-mid)"}/>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 14, color: picked ? "var(--quest-gold-hi)" : "var(--text-hi)" }}>{r.name}</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--arcane-blue)", marginBottom: 4 }}>{r.short}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {r.tags.map(tag => (
                  <span key={tag} style={{ fontSize: 9, padding: "2px 6px", borderRadius: 999,
                    background: "rgba(244,231,197,0.06)", color: "var(--text-low)" }}>{tag}</span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* race detail panel */}
      {selected && (
        <div className="lo-card-elev" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
            {activePortraitSrc && <Portrait src={activePortraitSrc} alt={selected.name} size={120} />}
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 18, marginBottom: 4, color: "var(--quest-gold-hi)" }}>{selected.name}</h3>
              <p style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.6, marginBottom: 10 }}>{selected.fantasy}</p>
              {raceSynergy && (
                <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(92,122,184,0.08)", borderLeft: "3px solid var(--arcane-blue)", marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: "var(--text-low)", marginBottom: 2 }}>Mejor con</div>
                  <div style={{ fontSize: 12, color: "var(--arcane-blue-hi)", fontWeight: 600 }}>{raceSynergy.bestFor.join(", ")}</div>
                  <div style={{ fontSize: 11, color: "var(--text-mid)", marginTop: 4 }}>{raceSynergy.tip}</div>
                </div>
              )}
              {combinedTip && (
                <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(76,175,80,0.08)", borderLeft: "3px solid var(--moss-green)" }}>
                  <div style={{ fontSize: 11, color: "var(--moss-green)", marginBottom: 2 }}>Sinergia con tu clase</div>
                  <div style={{ fontSize: 12, color: "var(--text-mid)" }}>{combinedTip}</div>
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div className="lo-label" style={{ marginBottom: 6 }}>Qué cambia en tu hoja</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                {selected.traitDetails?.map(t => (
                  <li key={t.id} style={{ fontSize: 11, color: "var(--text-mid)" }}>
                    <span style={{ color: "var(--quest-gold-hi)", fontWeight: 600 }}>{t.name}:</span> {t.summary}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="lo-label" style={{ marginBottom: 6 }}>Recomendado para</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {selected.recommendedFor?.map(c => (
                  <span key={c} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6,
                    background: "rgba(214,168,79,0.08)", color: "var(--quest-gold-hi)", border: "1px solid rgba(214,168,79,0.2)" }}>{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* subrace picker */}
      {subraces.length > 0 && (
        <div>
          <div className="lo-label" style={{ marginBottom: 8 }}>Subraza</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
            {subraces.map((s: Subrace) => {
              const picked = draft.subraceId === s.id;
              const subSrc = subracePortrait(s.id, gender);
              return (
                <button key={s.id} onClick={() => up({ subraceId: s.id })} style={{
                  padding: "12px 10px", borderRadius: 8, textAlign: "left", cursor: "pointer",
                  border: picked ? "1px solid var(--quest-gold)" : "1px solid var(--line-strong)",
                  background: picked ? "rgba(214,168,79,0.10)" : "rgba(244,231,197,0.03)" }}>
                  {subSrc && (
                    <div style={{ marginBottom: 8 }}>
                      <Portrait src={subSrc} alt={s.name} size={56} />
                    </div>
                  )}
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 13, color: picked ? "var(--quest-gold-hi)" : "var(--text-hi)", marginBottom: 4 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: "var(--arcane-blue)", marginBottom: 4 }}>{s.short}</div>
                  <div style={{ fontSize: 10, color: "var(--text-low)", lineHeight: 1.4 }}>{s.beginnerSummary}</div>
                  {s.requiresDMApproval && (
                    <div style={{ marginTop: 6, fontSize: 9, color: "var(--text-low)" }}>Requiere DM</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </WizardShell>
  );
}
