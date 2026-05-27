"use client";
import { use } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { BACKGROUNDS } from "@/data/backgrounds";

interface Props { params: Promise<{ id: string }> }
export default function BackgroundDetailPage({ params }: Props) {
  const { id } = use(params);
  const bg = BACKGROUNDS.find(b => b.id === id);

  if (!bg) {
    return (
      <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
        <TopBar crumb={["LVL ONE", "Enciclopedia", "Trasfondos", "No encontrado"]}/>
        <div style={{ padding: "40px 32px", textAlign: "center" }}>
          <p style={{ color: "var(--text-mid)", marginBottom: 16 }}>Trasfondo no encontrado.</p>
          <Link href="/encyclopedia/backgrounds" className="lo-btn lo-btn-primary">Volver a trasfondos</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["LVL ONE", "Enciclopedia", "Trasfondos", bg.name]}/>
      <div style={{ padding: "24px 32px 0", maxWidth: 680, margin: "0 auto" }}>

        <Link href="/encyclopedia/backgrounds" className="lo-btn lo-btn-ghost" style={{ padding: "6px 10px", marginBottom: 20, display: "inline-flex" }}>
          <Ico name="arrowLeft" size={14}/> Trasfondos
        </Link>

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 28, margin: 0, color: "var(--quest-gold-hi)" }}>{bg.name}</h1>
            {bg.tags.includes("Recomendado") && (
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "rgba(212,175,55,0.15)", color: "var(--quest-gold-hi)", border: "1px solid rgba(212,175,55,0.3)" }}>✓ Recomendado</span>
            )}
          </div>
          <p style={{ fontSize: 14, color: "var(--text-low)", margin: 0 }}>{bg.short}</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Habilidades */}
          <div className="lo-card" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 11, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Habilidades</h3>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {bg.skills.map(s => <span key={s} className="lo-chip" style={{ fontSize: 12 }}>{s}</span>)}
            </div>
          </div>

          {/* Herramientas */}
          {bg.tools.length > 0 && (
            <div className="lo-card" style={{ padding: 18 }}>
              <h3 style={{ fontSize: 11, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Competencias con herramientas</h3>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {bg.tools.map(t => <span key={t} className="lo-chip" style={{ fontSize: 12 }}>{t}</span>)}
              </div>
            </div>
          )}

          {/* Rasgo */}
          <div className="lo-card" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 11, color: "var(--quest-gold-hi)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Rasgo de trasfondo</h3>
            <p style={{ fontSize: 14, color: "var(--text-mid)", margin: 0, lineHeight: 1.6 }}>{bg.feature}</p>
          </div>

          {/* Equipo inicial */}
          <div className="lo-card" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 11, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Equipo inicial</h3>
            <p style={{ fontSize: 13, color: "var(--text-mid)", margin: 0, lineHeight: 1.6 }}>{bg.equipment}</p>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <Link href="/encyclopedia/backgrounds" className="lo-btn lo-btn-ghost" style={{ fontSize: 13 }}>
            Volver a trasfondos
          </Link>
        </div>
      </div>
    </main>
  );
}
