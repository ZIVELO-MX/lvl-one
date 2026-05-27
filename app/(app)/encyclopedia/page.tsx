"use client";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { RACES } from "@/data/races";
import { CLASSES } from "@/data/classes";
import { SPELLS } from "@/data/spells";
import { BACKGROUNDS } from "@/data/backgrounds";
import { EQUIPMENT_ITEMS } from "@/data/equipment";

interface Section {
  href: string;
  label: string;
  desc: string;
  count: number;
  color: string;
  glyph: string;
  available: boolean;
}

const PLAYER_SECTIONS: Section[] = [
  {
    href: "/encyclopedia/races",
    label: "Razas",
    desc: "Las 10 razas del Manual del Jugador: bonificaciones, rasgos y subrazas.",
    count: RACES.length,
    color: "var(--moss-green)",
    glyph: "🌿",
    available: true,
  },
  {
    href: "/encyclopedia/classes",
    label: "Clases",
    desc: "12 clases con dados de golpe, habilidades de nivel 1 y subclases.",
    count: CLASSES.length,
    color: "var(--quest-gold)",
    glyph: "⚔",
    available: true,
  },
  {
    href: "/encyclopedia/spells",
    label: "Hechizos",
    desc: "Compendio de trucos y hechizos de nivel 1–3 con filtros por escuela y clase.",
    count: SPELLS.length,
    color: "var(--arcane-blue-hi)",
    glyph: "✦",
    available: true,
  },
  {
    href: "/encyclopedia/backgrounds",
    label: "Trasfondos",
    desc: "8 trasfondos con habilidades, herramientas, equipo inicial y rasgo especial.",
    count: BACKGROUNDS.length,
    color: "var(--quest-gold)",
    glyph: "🎒",
    available: true,
  },
  {
    href: "/encyclopedia/equipment",
    label: "Equipo",
    desc: "Armas, armaduras, focos, herramientas y paquetes de aventurero.",
    count: EQUIPMENT_ITEMS.length,
    color: "var(--stone-gray)",
    glyph: "🛡",
    available: true,
  },
  {
    href: "/encyclopedia/conditions",
    label: "Condiciones",
    desc: "15 condiciones de combate: efectos mecánicos, causas y cómo terminarlas.",
    count: 15,
    color: "#C28F8F",
    glyph: "⚡",
    available: true,
  },
  {
    href: "/encyclopedia/feats",
    label: "Dotes",
    desc: "45 dotes SRD con prerequisitos y efectos. Se eligen en los niveles de ASI.",
    count: 45,
    color: "var(--quest-gold-hi)",
    glyph: "✦",
    available: true,
  },
  {
    href: "/encyclopedia/items",
    label: "Objetos Mágicos",
    desc: "24 objetos mágicos SRD por rareza, tipo y attunement.",
    count: 24,
    color: "#9C27B0",
    glyph: "💎",
    available: true,
  },
  {
    href: "/glossary",
    label: "Glosario",
    desc: "Términos, mecánicas y conceptos explicados en menos de 3 líneas.",
    count: 40,
    color: "var(--arcane-blue-hi)",
    glyph: "📖",
    available: true,
  },
];

const DM_SECTIONS: Section[] = [
  {
    href: "/encyclopedia/monsters",
    label: "Bestiario",
    desc: "57 monstruos SRD por CR, tipo y entorno. Stats, acciones y retratos.",
    count: 57,
    color: "#C28F8F",
    glyph: "🐉",
    available: true,
  },
  {
    href: "/encyclopedia/npcs",
    label: "NPCs",
    desc: "Personalidades, motivaciones, tablas de rasgos y ganchos de rol.",
    count: 0,
    color: "var(--stone-gray)",
    glyph: "👤",
    available: false,
  },
  {
    href: "/dm-tools/generators",
    label: "Generadores",
    desc: "Nombres, tabernas, tesoros, quests y encuentros aleatorios.",
    count: 0,
    color: "var(--quest-gold)",
    glyph: "🎲",
    available: false,
  },
  {
    href: "/dm-tools/tables",
    label: "Tablas",
    desc: "Tablas de tirada aleatoria: weather, rumores, reacciones de NPC.",
    count: 0,
    color: "var(--moss-green)",
    glyph: "📜",
    available: false,
  },
];

function SectionCard({ s }: { s: Section }) {
  const router = useRouter();
  return (
    <div
      key={s.href}
      className={`lo-card-elev ${s.available ? "" : "lo-card-disabled"}`}
      onClick={() => s.available && router.push(s.href)}
      style={{
        padding: "24px 22px",
        cursor: s.available ? "pointer" : "default",
        border: "1px solid var(--line-strong)",
        transition: "border-color .15s",
        opacity: s.available ? 1 : 0.5,
        position: "relative",
      }}
    >
      {!s.available && (
        <div style={{
          position: "absolute",
          top: 12,
          right: 12,
          fontSize: 10,
          padding: "2px 8px",
          borderRadius: 999,
          background: "rgba(244,231,197,0.06)",
          color: "var(--text-low)",
          border: "1px solid var(--line-strong)",
        }}>
          Próximamente
        </div>
      )}
      <div style={{ fontSize: 28, marginBottom: 12 }}>{s.glyph}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.label}</span>
        {s.available && s.count > 0 && (
          <span style={{ fontSize: 11, color: "var(--text-low)" }}>{s.count} entradas</span>
        )}
      </div>
      <p style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
      {s.available && (
        <div style={{ marginTop: 16, fontSize: 12, color: s.color }}>Ver todas →</div>
      )}
    </div>
  );
}

export default function EncyclopediaPage() {
  return (
    <main className="lo-page-enter" style={{ padding: "0 0 80px" }}>
      <TopBar crumb={["Enciclopedia"]} />

      <div className="lo-page-pad" style={{ padding: "24px 32px 0", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, lineHeight: 1.1, marginBottom: 6 }}>Enciclopedia</h1>
          <p style={{ fontSize: 14, color: "var(--text-low)", lineHeight: 1.5 }}>
            Todo el contenido de D&D 5e organizado por rol: jugador o Dungeon Master.
          </p>
        </div>

        {/* Player sections */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(91,122,74,0.15)", display: "grid", placeItems: "center" }}>
              <Ico name="user" size={18} color="#A3C28F"/>
            </div>
            <div>
              <h2 style={{ fontSize: 18, margin: 0 }}>Para Jugadores</h2>
              <p style={{ fontSize: 12, color: "var(--text-low)", margin: 0 }}>Crea y juega tu personaje</p>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 40 }}>
          {PLAYER_SECTIONS.map(s => <SectionCard key={s.href} s={s}/>)}
        </div>

        {/* DM sections */}
        <div style={{ marginBottom: 8, borderTop: "1px solid var(--line)", paddingTop: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(180,58,46,0.15)", display: "grid", placeItems: "center" }}>
              <Ico name="scroll" size={18} color="#D66B5F"/>
            </div>
            <div>
              <h2 style={{ fontSize: 18, margin: 0 }}>Para Dungeon Masters</h2>
              <p style={{ fontSize: 12, color: "var(--text-low)", margin: 0 }}>Dirige campañas, construye encuentros y gestiona el mundo</p>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 40 }}>
          {DM_SECTIONS.map(s => <SectionCard key={s.href} s={s}/>)}
        </div>
      </div>
    </main>
  );
}
