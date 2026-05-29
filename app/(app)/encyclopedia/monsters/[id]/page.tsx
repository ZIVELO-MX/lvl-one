"use client";
import { use } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import Image from "next/image";
import { MONSTERS } from "@/data/monsters";

const TYPE_FOLDER: Record<string, string> = {
  "bestia": "beasts", "humanoides": "humanoids", "no-muerto": "undead",
  "dragón": "dragons", "aberración": "aberrations", "bestia-magica": "monstrosities",
  "constructo": "constructs", "elemental": "elementals", "hada": "fey",
  "demonio": "demons", "monstruosidad": "monstrosities", "limo": "oozes",
  "planta": "plants", "gigante": "giants", "inmortal": "undead",
};
const PORTRAIT_OVERRIDE: Record<string, string> = {
  "gelatinous-cube": "/monsters/oozes/gelatino.png",
  "vampire-spawn": "/monsters/undead/vampire.png",
  "giant-spider":"/monsters/monstrosities/giant-spider.png",
  "griffon":     "/monsters/beasts/griffon.png",
};
function portrait(id: string, type: string) {
  return PORTRAIT_OVERRIDE[id] ?? `/monsters/${TYPE_FOLDER[type] ?? "beasts"}/${id}.png`;
}
function crLabel(cr: number) {
  if (cr === 0.125) return "1/8"; if (cr === 0.25) return "1/4"; if (cr === 0.5) return "1/2";
  return String(cr);
}
function mod(stat: number) {
  const m = Math.floor((stat - 10) / 2);
  return m >= 0 ? `+${m}` : String(m);
}

const STAT_LABELS = ["FUE", "DES", "CON", "INT", "SAB", "CAR"] as const;
const TYPE_LABEL: Record<string, string> = {
  "bestia": "Bestia", "humanoides": "Humanoide", "no-muerto": "No-muerto",
  "dragón": "Dragón", "aberración": "Aberración", "bestia-magica": "Bestia mágica",
  "constructo": "Constructo", "elemental": "Elemental", "hada": "Hada",
  "demonio": "Demonio", "monstruosidad": "Monstruosidad", "limo": "Limo",
  "planta": "Planta", "gigante": "Gigante", "inmortal": "Inmortal",
};
const ALIGN_LABEL: Record<string, string> = {
  "legal-bueno": "Legal Bueno", "legal-neutral": "Legal Neutral", "legal-maligno": "Legal Maligno",
  "neutral-bueno": "Neutral Bueno", "neutral": "Neutral", "neutral-maligno": "Neutral Maligno",
  "caotico-bueno": "Caótico Bueno", "caotico-neutral": "Caótico Neutral", "caotico-maligno": "Caótico Maligno",
  "no-alineado": "Sin alineamiento",
};

interface Props { params: Promise<{ id: string }> }
export default function MonsterDetailPage({ params }: Props) {
  const { id } = use(params);
  const monster = MONSTERS.find(m => m.id === id);

  if (!monster) {
    return (
      <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
        <TopBar crumb={["LVL ONE", "Enciclopedia", "Bestiario", "No encontrado"]}/>
        <div style={{ padding: "40px 32px", textAlign: "center" }}>
          <p style={{ color: "var(--text-mid)", marginBottom: 16 }}>Monstruo no encontrado.</p>
          <Link href="/encyclopedia/monsters" className="lo-btn lo-btn-primary">Volver al bestiario</Link>
        </div>
      </main>
    );
  }

  const m = monster;
  const stats = m.stats;
  const crColor = m.cr <= 0.5 ? "#A3C28F" : m.cr <= 3 ? "var(--quest-gold-hi)" : m.cr <= 8 ? "#C9956A" : "#C28F8F";

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["LVL ONE", "Enciclopedia", "Bestiario", m.name]}/>
      <div style={{ padding: "24px 32px 0", maxWidth: 840, margin: "0 auto" }}>

        {/* Back */}
        <Link href="/encyclopedia/monsters" className="lo-btn lo-btn-ghost" style={{ padding: "6px 10px", marginBottom: 20, display: "inline-flex" }}>
          <Ico name="arrowLeft" size={14}/> Bestiario
        </Link>

        {/* Hero */}
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, marginBottom: 20 }}>
          {/* Portrait */}
          <div style={{ borderRadius: 12, overflow: "hidden", background: "rgba(0,0,0,0.4)", aspectRatio: "1", border: "1px solid var(--border-lo)", position: "relative" }}>
            <Image
              src={portrait(m.id, m.type)}
              alt={m.name}
              fill
              sizes="280px"
              style={{ objectFit: "cover" }}
              onError={e => {
                const el = e.target as HTMLImageElement;
                el.style.display = "none";
                const parent = el.parentElement?.parentElement;
                if (parent) {
                  parent.style.display = "grid";
                  parent.style.placeItems = "center";
                  parent.innerHTML = `<div style="font-size:64px;opacity:0.2">👾</div>`;
                }
              }}
            />
          </div>

          {/* Quick stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 26, margin: "0 0 4px" }}>{m.name}</h1>
              <p style={{ fontSize: 13, color: "var(--text-low)", margin: 0 }}>{m.size} {TYPE_LABEL[m.type]} · {ALIGN_LABEL[m.alignment] ?? m.alignment}</p>
            </div>

            {/* CR badge */}
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ padding: "6px 16px", background: `${crColor}18`, border: `1px solid ${crColor}55`, borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: crColor }}>CR {crLabel(m.cr)}</div>
                <div style={{ fontSize: 11, color: "var(--text-low)" }}>{m.xp.toLocaleString()} XP</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ fontSize: 13, color: "var(--text-mid)" }}>
                  <span style={{ color: "var(--text-low)", marginRight: 6 }}>Clase de Armadura</span>
                  <strong style={{ color: "var(--text-hi)" }}>{m.ac}</strong>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-mid)" }}>
                  <span style={{ color: "var(--text-low)", marginRight: 6 }}>Puntos de Golpe</span>
                  <strong style={{ color: "var(--text-hi)" }}>{m.hp}</strong>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-mid)" }}>
                  <span style={{ color: "var(--text-low)", marginRight: 6 }}>Velocidad</span>
                  <strong style={{ color: "var(--text-hi)" }}>{m.speed}</strong>
                </div>
              </div>
            </div>

            {/* Stats block */}
            <div className="lo-card" style={{ padding: "12px 16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4, textAlign: "center" }}>
                {STAT_LABELS.map(key => (
                  <div key={key}>
                    <div style={{ fontSize: 10, color: "var(--text-low)", textTransform: "uppercase", marginBottom: 2 }}>{key}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-hi)" }}>{stats[key]}</div>
                    <div style={{ fontSize: 11, color: "var(--arcane-blue-hi)" }}>{mod(stats[key])}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Senses / Languages */}
            <div style={{ fontSize: 12, color: "var(--text-low)", display: "flex", flexDirection: "column", gap: 3 }}>
              {m.senses && <div><span style={{ color: "var(--text-low)", fontWeight: 600 }}>Sentidos: </span><span style={{ color: "var(--text-mid)" }}>{m.senses}</span></div>}
              {m.languages && <div><span style={{ color: "var(--text-low)", fontWeight: 600 }}>Idiomas: </span><span style={{ color: "var(--text-mid)" }}>{m.languages}</span></div>}
            </div>
          </div>
        </div>

        {/* Traits */}
        {m.traits && m.traits.length > 0 && (
          <div className="lo-card" style={{ padding: 18, marginBottom: 14 }}>
            <h3 style={{ fontSize: 12, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Rasgos</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {m.traits.map((t, i) => (
                <div key={`trait-${i}-${t.name}`}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-hi)", fontStyle: "italic" }}>{t.name}. </span>
                  <span style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.5 }}>{t.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spellcasting */}
        {m.spellcasting && (
          <div className="lo-card" style={{ padding: 18, marginBottom: 14 }}>
            <h3 style={{ fontSize: 12, color: "var(--arcane-blue-hi)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Lanzamiento de conjuros</h3>
            <p style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.5, margin: 0 }}>
              {m.spellcasting.desc}
            </p>
            {(m.spellcasting.saveDC || m.spellcasting.attackBonus) && (
              <div style={{ marginTop: 8, display: "flex", gap: 10 }}>
                {m.spellcasting.saveDC && <span className="lo-chip" style={{ fontSize: 11 }}>CD salvación {m.spellcasting.saveDC}</span>}
                {m.spellcasting.attackBonus !== undefined && <span className="lo-chip" style={{ fontSize: 11 }}>Ataque de conjuro +{m.spellcasting.attackBonus}</span>}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="lo-card" style={{ padding: 18, marginBottom: 14 }}>
          <h3 style={{ fontSize: 12, color: "#C28F8F", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Acciones</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {m.actions.map((a, i) => (
              <div key={`action-${i}-${a.name}`} style={{ paddingBottom: 10, borderBottom: i < m.actions.length - 1 ? "1px solid var(--border-lo)" : "none" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-hi)", fontStyle: "italic" }}>{a.name}. </span>
                <span style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.5 }}>{a.desc}</span>
                {(a.damage || a.attackBonus !== undefined) && (
                  <div style={{ marginTop: 4, display: "flex", gap: 10 }}>
                    {a.attackBonus !== undefined && <span className="lo-chip" style={{ fontSize: 11 }}>Ataque {a.attackBonus >= 0 ? "+" : ""}{a.attackBonus}</span>}
                    {a.damage && <span className="lo-chip" style={{ fontSize: 11 }}>{a.damage} {a.damageType}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Reactions */}
        {m.reactions && m.reactions.length > 0 && (
          <div className="lo-card" style={{ padding: 18, marginBottom: 14 }}>
            <h3 style={{ fontSize: 12, color: "var(--quest-gold-hi)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Reacciones</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {m.reactions.map((r, i) => (
                <div key={`reaction-${i}-${r.name}`}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-hi)", fontStyle: "italic" }}>{r.name}. </span>
                  <span style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.5 }}>{r.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legendary Actions */}
        {m.legendaryActions && m.legendaryActions.length > 0 && (
          <div className="lo-card" style={{ padding: 18, marginBottom: 14 }}>
            <h3 style={{ fontSize: 12, color: "#C28F8F", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
              Acciones legendarias{m.legendaryActionsPerRound ? ` (${m.legendaryActionsPerRound} por ronda)` : ""}
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-low)", marginBottom: 10, lineHeight: 1.4 }}>
              El monstruo puede gastar sus acciones legendarias entre turnos de otras criaturas. Solo puede usar una acción legendaria a la vez y recupera todas al inicio de su turno.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {m.legendaryActions.map((la, i) => (
                <div key={`legendary-${i}-${la.name}`}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-hi)", fontStyle: "italic" }}>{la.name}. </span>
                  <span style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.5 }}>{la.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Environments & Tags */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="lo-card" style={{ padding: 16 }}>
            <h3 style={{ fontSize: 12, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Entornos</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {m.environment.map(e => (
                <span key={e} className="lo-chip" style={{ fontSize: 11, textTransform: "capitalize" }}>{e}</span>
              ))}
            </div>
          </div>
          {m.tags.length > 0 && (
            <div className="lo-card" style={{ padding: 16 }}>
              <h3 style={{ fontSize: 12, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Etiquetas</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {m.tags.map(t => <span key={t} className="lo-chip" style={{ fontSize: 11 }}>{t}</span>)}
              </div>
            </div>
          )}
        </div>

        {/* Add to encounter CTA */}
        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <Link href="/encounter-builder" className="lo-btn lo-btn-ghost" style={{ fontSize: 13 }}>
            <Ico name="sword" size={13}/> Usar en Encounter Builder
          </Link>
          <Link href="/encyclopedia/monsters" className="lo-btn lo-btn-ghost" style={{ fontSize: 13 }}>
            Volver al bestiario
          </Link>
        </div>
      </div>
    </main>
  );
}
