"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/AppShell";

const TOOLS = [
  {
    href: "/dice",
    label: "Dados",
    desc: "Lanzador completo: d4 al d100, modificadores, ventaja y historial de sesión.",
    glyph: "⬡",
    color: "var(--quest-gold-hi)",
    available: true,
  },
  {
    href: "/encounter-builder",
    label: "Encounter Builder",
    desc: "Construye encuentros por CR, calcula XP total y dificultad para tu grupo.",
    glyph: "⚔",
    color: "#C28F8F",
    available: true,
  },
  {
    href: "/dm-tools/generators",
    label: "Generadores",
    desc: "Nombres, tabernas, NPCs rápidos, tesoros, encuentros aleatorios y rumores.",
    glyph: "🎲",
    color: "var(--moss-green)",
    available: true,
  },
  {
    href: "/dm-tools/tables",
    label: "Tablas de Tirada",
    desc: "Tira d20 y consulta tablas de clima, reacciones de PNJ y eventos aleatorios.",
    glyph: "📜",
    color: "var(--arcane-blue-hi)",
    available: true,
  },
];

export default function DmToolsPage() {
  const router = useRouter();
  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["LVL ONE", "DM Tools"]}/>
      <div style={{ padding: "24px 32px 0", maxWidth: 900, margin: "0 auto" }}>

        {/* Banner */}
        <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", marginBottom: 28, height: 160 }}>
          <Image
            src="/dm-tools/banner.svg"
            alt="DM Tools"
            fill
            unoptimized
            style={{ objectFit: "cover" }}
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div style={{
            position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(15,13,11,0.85) 40%, rgba(15,13,11,0.2))",
            display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 28px",
          }}>
            <h1 style={{ fontSize: 28, margin: "0 0 6px", color: "var(--quest-gold-hi)" }}>DM Tools</h1>
            <p style={{ fontSize: 14, color: "var(--text-low)", margin: 0 }}>Herramientas para el Dungeon Master — en la mesa, en tiempo real.</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
          {TOOLS.map(t => (
            <div
              key={t.href}
              className="lo-card-elev"
              onClick={() => t.available && router.push(t.href)}
              style={{
                padding: "22px 20px", cursor: "pointer", border: "1px solid var(--line-strong)",
                transition: "border-color .15s", position: "relative",
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 10 }}>{t.glyph}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 17, fontWeight: 700, color: t.color }}>{t.label}</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.6, margin: "0 0 14px" }}>{t.desc}</p>
              <div style={{ fontSize: 12, color: t.color }}>Abrir →</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
