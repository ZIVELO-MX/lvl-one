"use client";
import { use, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/AppShell";
import { SPELLS } from "@/data/spells";
import { CLASSES } from "@/data/classes";
import { spellImage, schoolBanner } from "@/lib/portraits";

interface Props { params: Promise<{ slug: string }> }

const SCHOOL_COLOR: Record<string, string> = {
  Evocación: "var(--dragon-red)", Abjuración: "var(--arcane-blue-hi)", Conjuración: "var(--moss-green)",
  Encantamiento: "#c084fc", Ilusión: "#67e8f9", Nigromancia: "#94a3b8", Transmutación: "var(--quest-gold)", Adivinación: "#fbbf24",
};

const COMPONENT_LABEL: Record<string, string> = { V: "Verbal", S: "Somático", M: "Material" };

function SpellImg({ spellId, school, name }: { spellId: string; school: string; name: string }) {
  const [spellErr, setSpellErr] = useState(false);
  const [schoolErr, setSchoolErr] = useState(false);
  const src = !spellErr ? spellImage(spellId) : (!schoolErr ? schoolBanner(school) : null);
  if (!src) return null;
  return (
    <div style={{ width: "100%", height: 180, borderRadius: 12, overflow: "hidden", marginBottom: 20, position: "relative" }}>
      <Image src={src} alt={name} fill style={{ objectFit: "cover" }}
        onError={() => { if (!spellErr) setSpellErr(true); else setSchoolErr(true); }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,13,11,0.8) 0%, transparent 60%)" }} />
      <div style={{ position: "absolute", bottom: 12, left: 16, fontSize: 20, fontFamily: "var(--font-display)", color: "white" }}>{name}</div>
    </div>
  );
}

export default function SpellDetailPage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();

  const spell = SPELLS.find(s => s.id === slug);
  if (!spell) {
    router.replace("/encyclopedia/spells");
    return null;
  }

  const spellClasses = (spell.classes ?? [])
    .map(id => CLASSES.find(c => c.id === id))
    .filter(Boolean);

  const levelLabel = spell.level === 0 ? "Truco" : `Nivel ${spell.level}`;
  const schoolColor = SCHOOL_COLOR[spell.school] ?? "var(--text-mid)";

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 80px" }}>
      <TopBar crumb={["Enciclopedia", "Hechizos", spell.name]} />

      <div className="lo-page-pad" style={{ padding: "24px 32px 0", maxWidth: 740, margin: "0 auto" }}>
        <button
          className="lo-btn lo-btn-ghost"
          style={{ fontSize: 12, marginBottom: 20 }}
          onClick={() => router.push("/encyclopedia/spells")}
        >
          ← Hechizos
        </button>

        <SpellImg spellId={spell.id} school={spell.school} name={spell.name} />

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{
              padding: "4px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
              background: spell.level === 0 ? "rgba(92,122,184,0.12)" : "rgba(214,168,79,0.12)",
              color: spell.level === 0 ? "var(--arcane-blue-hi)" : "var(--quest-gold-hi)",
              border: `1px solid ${spell.level === 0 ? "rgba(92,122,184,0.25)" : "rgba(214,168,79,0.25)"}`,
            }}>
              {levelLabel}
            </div>
            <span style={{ fontSize: 13, color: schoolColor, fontWeight: 600 }}>{spell.school}</span>
          </div>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>{spell.name}</h1>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {spell.ritual && (
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "rgba(76,175,80,0.08)", color: "var(--moss-green)", border: "1px solid rgba(76,175,80,0.2)" }}>
                Ritual
              </span>
            )}
            {spell.concentration && (
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "rgba(214,168,79,0.08)", color: "var(--quest-gold)", border: "1px solid rgba(214,168,79,0.2)" }}>
                Concentración
              </span>
            )}
            {spell.tags?.map(t => (
              <span key={t} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "rgba(244,231,197,0.06)", color: "var(--text-low)", border: "1px solid var(--line-strong)" }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Cast stats */}
        <div className="lo-card-elev" style={{ padding: 20, marginBottom: 16, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
          <div>
            <div className="lo-label" style={{ marginBottom: 4 }}>Tiempo de lanzamiento</div>
            <div style={{ fontSize: 14, color: "var(--text-hi)" }}>{spell.castingTime}</div>
          </div>
          <div>
            <div className="lo-label" style={{ marginBottom: 4 }}>Alcance</div>
            <div style={{ fontSize: 14, color: "var(--text-hi)" }}>{spell.range}</div>
          </div>
          <div>
            <div className="lo-label" style={{ marginBottom: 4 }}>Duración</div>
            <div style={{ fontSize: 14, color: "var(--text-hi)" }}>{spell.duration}</div>
          </div>
          {spell.damage && (
            <div>
              <div className="lo-label" style={{ marginBottom: 4 }}>Daño</div>
              <div style={{ fontSize: 14, color: "var(--dragon-red)", fontWeight: 600 }}>{spell.damage}</div>
            </div>
          )}
          <div>
            <div className="lo-label" style={{ marginBottom: 4 }}>Componentes</div>
            <div style={{ fontSize: 14, color: "var(--text-hi)" }}>
              {spell.components?.map(c => COMPONENT_LABEL[c] ?? c).join(", ")}
            </div>
          </div>
          <div>
            <div className="lo-label" style={{ marginBottom: 4 }}>Fuente</div>
            <div style={{ fontSize: 14, color: "var(--text-hi)" }}>{spell.sourceTag}</div>
          </div>
        </div>

        {/* Beginner summary */}
        {spell.beginnerSummary && (
          <div style={{ padding: "14px 18px", borderRadius: 10, marginBottom: 20, background: "rgba(92,122,184,0.07)", borderLeft: "3px solid var(--arcane-blue)" }}>
            <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.7, margin: 0 }}>{spell.beginnerSummary}</p>
          </div>
        )}

        {/* Classes that can cast */}
        {spellClasses.length > 0 && (
          <div className="lo-card-elev" style={{ padding: 18, marginBottom: 20 }}>
            <div className="lo-label" style={{ marginBottom: 10 }}>Clases que lo usan</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {spellClasses.map(c => c && (
                <button
                  key={c.id}
                  className="lo-btn lo-btn-ghost"
                  style={{ fontSize: 12 }}
                  onClick={() => router.push(`/encyclopedia/classes/${c.id}`)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
