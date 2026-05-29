"use client";
import { use, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/AppShell";
import { CLASSES } from "@/data/classes";
import { classDetailFor } from "@/data/encyclopedia";
import { SUBCLASSES } from "@/data/subclasses";
import { classPortrait } from "@/lib/portraits";
import { getClassSuggestion, STAT_COLORS } from "@/lib/suggestions";

interface Props { params: Promise<{ slug: string }> }

const HIT_COLOR: Record<string, string> = {
  d12: "var(--dragon-red)", d10: "var(--quest-gold)", d8: "var(--arcane-blue-hi)", d6: "var(--moss-green)",
};

function ClassImg({ classId, name }: { classId: string; name: string }) {
  const [err, setErr] = useState(false);
  if (err) return null;
  return (
    <div style={{ width: 180, height: 180, borderRadius: 16, overflow: "hidden", flexShrink: 0, border: "1px solid rgba(214,168,79,0.3)" }}>
      <Image src={classPortrait(classId)} alt={name} width={180} height={180}
        style={{ objectFit: "cover", width: "100%", height: "100%" }} onError={() => setErr(true)} />
    </div>
  );
}

export default function ClassDetailPage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();

  const cls = CLASSES.find(c => c.id === slug);
  if (!cls) {
    router.replace("/encyclopedia/classes");
    return null;
  }

  const subclasses = SUBCLASSES.filter(s => s.classId === cls.id);
  const detail = classDetailFor(cls.id);
  const suggestion = getClassSuggestion(cls.id);

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 80px" }}>
      <TopBar crumb={["Enciclopedia", "Clases", cls.name]} />

      <div className="lo-page-pad" style={{ padding: "24px 32px 0", maxWidth: 780, margin: "0 auto" }}>
        <button type="button"
          className="lo-btn lo-btn-ghost"
          style={{ fontSize: 12, marginBottom: 20 }}
          onClick={() => router.push("/encyclopedia/classes")}
        >
          ← Clases
        </button>

        {/* Header */}
        <div style={{ marginBottom: 28, display: "flex", gap: 24, alignItems: "flex-start" }}>
          <ClassImg classId={cls.id} name={cls.name} />
          <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
            <h1 style={{ fontSize: 28, margin: 0 }}>{cls.name}</h1>
            <span style={{ fontSize: 14, color: HIT_COLOR[cls.hit] ?? "var(--text-mid)", fontWeight: 700 }}>{cls.hit}</span>
            <span style={{ fontSize: 14, color: "var(--arcane-blue-hi)" }}>{cls.role}</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {cls.tags?.map(t => (
              <span key={t} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "rgba(214,168,79,0.08)", color: "var(--quest-gold)", border: "1px solid rgba(214,168,79,0.2)" }}>
                {t}
              </span>
            ))}
            {cls.spellcaster && (
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "rgba(92,122,184,0.08)", color: "var(--arcane-blue-hi)", border: "1px solid rgba(92,122,184,0.2)" }}>
                Lanzador
              </span>
            )}
          </div>
          <p style={{ fontSize: 14, color: "var(--text-mid)", lineHeight: 1.7, margin: "0 0 10px" }}>{cls.desc}</p>
          {suggestion && (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {suggestion.statOrder.split(" > ").map(s => (
                <span key={s} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, fontWeight: 700,
                  background: `${STAT_COLORS[s] ?? "#888"}18`,
                  color: STAT_COLORS[s] ?? "var(--text-hi)",
                  border: `1px solid ${STAT_COLORS[s] ?? "#888"}44` }}>{s}</span>
              ))}
            </div>
          )}
          </div>
        </div>

        {/* Stats */}
        <div className="lo-card-elev" style={{ padding: 20, marginBottom: 16, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 14 }}>
          <div>
            <div className="lo-label" style={{ marginBottom: 4 }}>Dado de golpe</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: HIT_COLOR[cls.hit] ?? "var(--text-hi)" }}>{cls.hit}</div>
          </div>
          <div>
            <div className="lo-label" style={{ marginBottom: 4 }}>Tiradas de salvación</div>
            <div style={{ fontSize: 14, color: "var(--text-hi)" }}>{cls.saves?.join(", ") ?? "—"}</div>
          </div>
          <div>
            <div className="lo-label" style={{ marginBottom: 4 }}>Complejidad</div>
            <div style={{ fontSize: 14, color: "var(--text-hi)" }}>{cls.complexity}</div>
          </div>
          {cls.subclassLevel && (
            <div>
              <div className="lo-label" style={{ marginBottom: 4 }}>Subclase en nivel</div>
              <div style={{ fontSize: 14, color: "var(--text-hi)" }}>{cls.subclassLevel}</div>
            </div>
          )}
          <div style={{ gridColumn: "1 / -1" }}>
            <div className="lo-label" style={{ marginBottom: 4 }}>Competencias</div>
            <div style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.6 }}>{cls.profs?.join(", ")}</div>
          </div>
        </div>

        {/* Role descriptions */}
        <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
          {cls.combat && (
            <div className="lo-card-elev" style={{ padding: "16px 20px", background: "rgba(214,168,79,0.03)", border: "1px solid rgba(214,168,79,0.15)" }}>
              <div className="lo-label" style={{ marginBottom: 6, color: "var(--quest-gold-hi)" }}>En combate</div>
              <p style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.7, margin: 0 }}>{cls.combat}</p>
            </div>
          )}
          {cls.outside && (
            <div className="lo-card-elev" style={{ padding: "16px 20px" }}>
              <div className="lo-label" style={{ marginBottom: 6 }}>Fuera de combate</div>
              <p style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.7, margin: 0 }}>{cls.outside}</p>
            </div>
          )}
          {cls.spellcasting && (
            <div className="lo-card-elev" style={{ padding: "16px 20px", background: "rgba(92,122,184,0.04)", border: "1px solid rgba(92,122,184,0.15)" }}>
              <div className="lo-label" style={{ marginBottom: 6, color: "var(--arcane-blue-hi)" }}>Magia</div>
              <p style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.7, margin: 0 }}>{cls.spellcasting}</p>
            </div>
          )}
        </div>

        {detail && (
          <div className="lo-card-elev" style={{ padding: 20, marginBottom: 20 }}>
            <div className="lo-label" style={{ marginBottom: 12 }}>Guía para jugar esta clase</div>
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-hi)", marginBottom: 4 }}>Fantasía de clase</div>
                <p style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.7, margin: 0 }}>{detail.fantasy}</p>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-hi)", marginBottom: 4 }}>Rol en mesa</div>
                <p style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.7, margin: 0 }}>{detail.tableRole}</p>
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
                  <div className="lo-label" style={{ marginBottom: 8 }}>Bucle de nivel 1</div>
                  <ol style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 5 }}>
                    {detail.levelOneLoop.map(step => (
                      <li key={step} style={{ fontSize: 12.5, color: "var(--text-mid)", lineHeight: 1.5 }}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Class features */}
        {cls.classFeatures && cls.classFeatures.length > 0 && (
          <div className="lo-card-elev" style={{ padding: 20, marginBottom: 20 }}>
            <div className="lo-label" style={{ marginBottom: 12 }}>Rasgos de clase (nivel 1)</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {cls.classFeatures.map(f => (
                <div key={f.id} style={{ paddingBottom: 12, borderBottom: "1px solid rgba(244,231,197,0.06)" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-hi)" }}>{f.name}</span>
                    {f.level && f.level > 1 && (
                      <span style={{ fontSize: 10, color: "var(--text-low)" }}>Niv. {f.level}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.6 }}>{f.summary}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended races */}
        {cls.recommendedFor && cls.recommendedFor.length > 0 && (
          <div className="lo-card-elev" style={{ padding: 18, marginBottom: 24 }}>
            <div className="lo-label" style={{ marginBottom: 8 }}>Razas recomendadas</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {cls.recommendedFor.map(r => (
                <span key={r} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 999, background: "rgba(76,175,80,0.08)", color: "var(--moss-green)", border: "1px solid rgba(76,175,80,0.2)" }}>
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Subclasses */}
        {subclasses.length > 0 && (
          <>
            <h2 style={{ fontSize: 18, marginBottom: 14 }}>Subclases</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {subclasses.map(sub => (
                <div key={sub.id} className="lo-card-elev" style={{ padding: "18px 20px", border: "1px solid var(--line-strong)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-hi)", marginBottom: 2 }}>{sub.name}</div>
                      <div style={{ fontSize: 12, color: "var(--arcane-blue-hi)" }}>{sub.role}</div>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: "rgba(244,231,197,0.06)", color: "var(--text-low)", border: "1px solid var(--line-strong)" }}>
                        Niv. {sub.level}
                      </span>
                      {sub.complexity && (
                        <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: "rgba(244,231,197,0.06)", color: "var(--text-low)", border: "1px solid var(--line-strong)" }}>
                          {sub.complexity}
                        </span>
                      )}
                    </div>
                  </div>
                  {sub.summary && (
                    <p style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.6, margin: "0 0 10px" }}>{sub.summary}</p>
                  )}
                  {sub.traits && sub.traits.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {sub.traits.map(t => (
                        <div key={t.id} style={{ fontSize: 12, color: "var(--text-low)" }}>
                          <span style={{ color: "var(--text-mid)", fontWeight: 600 }}>{t.name}</span>
                          {t.level && t.level > (sub.level ?? 1) && <span style={{ color: "var(--text-low)" }}> (Niv. {t.level})</span>}
                          : {t.summary}
                        </div>
                      ))}
                    </div>
                  )}
                  {sub.tags && sub.tags.length > 0 && (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 10 }}>
                      {sub.tags.map(t => (
                        <span key={t} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: "rgba(214,168,79,0.07)", color: "var(--quest-gold)", border: "1px solid rgba(214,168,79,0.2)" }}>
                          {t}
                        </span>
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
