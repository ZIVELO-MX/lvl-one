"use client";
import { use, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/AppShell";
import { raceDetailFor } from "@/data/encyclopedia";
import { RACES } from "@/data/races";
import { SUBRACES } from "@/data/subraces";
import { racePortrait } from "@/lib/portraits";
import { formatSpeed } from "@/lib/units";

interface Props { params: Promise<{ slug: string }> }

const STAT_LABEL: Record<string, string> = {
  FUE: "FUE", DES: "DES", CON: "CON", INT: "INT", SAB: "SAB", CAR: "CAR",
};

function RaceImg({ raceId, name }: { raceId: string; name: string }) {
  const [err, setErr] = useState(false);
  if (err) return null;
  return (
    <div style={{ width: 180, height: 180, borderRadius: 16, overflow: "hidden", flexShrink: 0, border: "1px solid rgba(214,168,79,0.3)" }}>
      <Image src={racePortrait(raceId)} alt={name} width={180} height={180}
        style={{ objectFit: "cover", width: "100%", height: "100%" }} onError={() => setErr(true)} />
    </div>
  );
}

function AsiLine({ asi }: { asi: Record<string, unknown> }) {
  if (asi.all) return <span>+{String(asi.all)} a todas las características</span>;
  const parts: string[] = [];
  for (const [k, v] of Object.entries(asi)) {
    if (k === "choices") continue;
    parts.push(`+${v} ${STAT_LABEL[k] ?? k}`);
  }
  if (asi.choices) parts.push("(elecciones adicionales)");
  return <span>{parts.join(", ")}</span>;
}

export default function RaceDetailPage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();

  const race = RACES.find(r => r.id === slug);
  if (!race) {
    router.replace("/encyclopedia/races");
    return null;
  }

  const subraces = SUBRACES.filter(s => (race.subraceIds ?? []).includes(s.id));
  const detail = raceDetailFor(race.id);

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 80px" }}>
      <TopBar crumb={["Enciclopedia", "Razas", race.name]} />

      <div className="lo-page-pad" style={{ padding: "24px 32px 0", maxWidth: 780, margin: "0 auto" }}>
        <button
          className="lo-btn lo-btn-ghost"
          style={{ fontSize: 12, marginBottom: 20 }}
          onClick={() => router.push("/encyclopedia/races")}
        >
          ← Razas
        </button>

        {/* Header */}
        <div style={{ marginBottom: 28, display: "flex", gap: 24, alignItems: "flex-start" }}>
          <RaceImg raceId={race.id} name={race.name} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
              <h1 style={{ fontSize: 28, margin: 0 }}>{race.name}</h1>
              <span style={{ fontSize: 14, color: "var(--quest-gold-hi)", fontWeight: 600 }}>{race.short}</span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {race.tags.map(t => (
                <span key={t} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "rgba(214,168,79,0.08)", color: "var(--quest-gold)", border: "1px solid rgba(214,168,79,0.2)" }}>
                  {t}
                </span>
              ))}
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "rgba(244,231,197,0.06)", color: "var(--text-low)", border: "1px solid var(--line-strong)" }}>
                {race.sourceTag}
              </span>
            </div>
            <p style={{ fontSize: 14, color: "var(--text-mid)", lineHeight: 1.7, margin: 0 }}>{race.fantasy}</p>
          </div>
        </div>

        {/* Stats block */}
        <div className="lo-card-elev" style={{ padding: 20, marginBottom: 16, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
          <div>
            <div className="lo-label" style={{ marginBottom: 4 }}>Bonif. características</div>
            <div style={{ fontSize: 14, color: "var(--text-hi)" }}>
              <AsiLine asi={race.asi as Record<string, unknown>} />
            </div>
          </div>
          <div>
            <div className="lo-label" style={{ marginBottom: 4 }}>Velocidad</div>
            <div style={{ fontSize: 14, color: "var(--text-hi)" }}>{formatSpeed(race.speed)}</div>
          </div>
          <div>
            <div className="lo-label" style={{ marginBottom: 4 }}>Tamaño</div>
            <div style={{ fontSize: 14, color: "var(--text-hi)" }}>{race.size}</div>
          </div>
          <div>
            <div className="lo-label" style={{ marginBottom: 4 }}>Complejidad</div>
            <div style={{ fontSize: 14, color: "var(--text-hi)" }}>{race.complexity}</div>
          </div>
          <div>
            <div className="lo-label" style={{ marginBottom: 4 }}>Idiomas</div>
            <div style={{ fontSize: 14, color: "var(--text-hi)" }}>{race.languages.join(", ")}</div>
          </div>
          {race.age && (
            <div style={{ gridColumn: "1 / -1" }}>
              <div className="lo-label" style={{ marginBottom: 4 }}>Edad</div>
              <div style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.6 }}>{race.age}</div>
            </div>
          )}
        </div>

        {/* Fantasy flavor */}
        {race.alignmentHint && (
          <div style={{ padding: "12px 16px", borderRadius: 8, marginBottom: 16, borderLeft: "3px solid var(--quest-gold)", background: "rgba(214,168,79,0.04)" }}>
            <p style={{ fontSize: 13, color: "var(--text-mid)", fontStyle: "italic", margin: 0, lineHeight: 1.6 }}>{race.alignmentHint}</p>
          </div>
        )}

        {detail && (
          <div className="lo-card-elev" style={{ padding: 20, marginBottom: 16 }}>
            <div className="lo-label" style={{ marginBottom: 12 }}>Guía para jugar esta raza</div>
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-hi)", marginBottom: 4 }}>Fantasía y lugar en el mundo</div>
                <p style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.7, margin: 0 }}>{detail.lore}</p>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-hi)", marginBottom: 4 }}>Cómo se juega</div>
                <p style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.7, margin: 0 }}>{detail.playstyle}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <div className="lo-label" style={{ marginBottom: 8 }}>Consejos de principiante</div>
                  <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 5 }}>
                    {detail.beginnerTips.map(tip => (
                      <li key={tip} style={{ fontSize: 12.5, color: "var(--text-mid)", lineHeight: 1.5 }}>{tip}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="lo-label" style={{ marginBottom: 8 }}>Ganchos de rol</div>
                  <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 5 }}>
                    {detail.roleplayHooks.map(hook => (
                      <li key={hook} style={{ fontSize: 12.5, color: "var(--text-mid)", lineHeight: 1.5 }}>{hook}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Racial traits */}
        {race.traitDetails && race.traitDetails.length > 0 && (
          <div className="lo-card-elev" style={{ padding: 20, marginBottom: 16 }}>
            <div className="lo-label" style={{ marginBottom: 12 }}>Rasgos raciales</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {race.traitDetails.map(td => (
                <div key={td.id} style={{ paddingBottom: 12, borderBottom: "1px solid rgba(244,231,197,0.06)" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-hi)", marginBottom: 3 }}>{td.name}</div>
                  <div style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.6 }}>{td.summary}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended classes */}
        {race.recommendedFor && race.recommendedFor.length > 0 && (
          <div className="lo-card-elev" style={{ padding: 18, marginBottom: 20 }}>
            <div className="lo-label" style={{ marginBottom: 8 }}>Clases recomendadas</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {race.recommendedFor.map(c => (
                <span key={c} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 999, background: "rgba(92,122,184,0.08)", color: "var(--arcane-blue-hi)", border: "1px solid rgba(92,122,184,0.2)" }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Subraces */}
        {subraces.length > 0 && (
          <>
            <h2 style={{ fontSize: 18, marginBottom: 14 }}>Subrazas</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {subraces.map(sub => (
                <div key={sub.id} className="lo-card-elev" style={{ padding: "18px 20px", border: "1px solid var(--line-strong)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-hi)", marginBottom: 2 }}>{sub.name}</div>
                      <div style={{ fontSize: 12, color: "var(--quest-gold-hi)" }}>{sub.short}</div>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {sub.tags?.map(t => (
                        <span key={t} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: "rgba(244,231,197,0.06)", color: "var(--text-low)", border: "1px solid var(--line-strong)" }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  {sub.beginnerSummary && (
                    <p style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.6, margin: "0 0 10px" }}>{sub.beginnerSummary}</p>
                  )}
                  {sub.traits && sub.traits.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {sub.traits.map(t => (
                        <div key={t.id} style={{ fontSize: 12, color: "var(--text-low)" }}>
                          <span style={{ color: "var(--text-mid)", fontWeight: 600 }}>{t.name}:</span> {t.summary}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
