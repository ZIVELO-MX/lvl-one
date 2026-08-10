"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { BACKGROUNDS } from "@/data/backgrounds";

export default function BackgroundsPage() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return BACKGROUNDS.filter(b =>
      !q || b.name.toLowerCase().includes(q) || b.short.toLowerCase().includes(q) ||
      b.skills.some(s => s.toLowerCase().includes(q))
    );
  }, [search]);

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["LVL ONE", "Enciclopedia", "Trasfondos"]}/>
      <div style={{ padding: "24px 32px 0", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <Link href="/encyclopedia" className="lo-btn lo-btn-ghost" style={{ padding: "6px 10px" }}>
            <Ico name="arrowLeft" size={14}/>
          </Link>
          <div>
            <h1 style={{ fontSize: 22, margin: 0 }}>Trasfondos</h1>
            <p style={{ fontSize: 12, color: "var(--text-low)", margin: 0 }}>SRD 5.1 — {BACKGROUNDS.length} trasfondos</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 200px" }}>
            <input id="backgrounds-search" aria-label="Buscar trasfondo" className="lo-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar trasfondo..." style={{ fontSize: 13 }}/>
          </div>
          {search && (
            <button type="button" className="lo-btn lo-btn-ghost" onClick={() => setSearch("")} style={{ fontSize: 12, padding: "6px 10px" }}>
              <Ico name="x" size={12}/> Limpiar
            </button>
          )}
          <span style={{ fontSize: 12, color: "var(--text-low)", marginLeft: "auto" }}>{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {filtered.map(b => (
            <Link key={b.id} href={`/encyclopedia/backgrounds/${b.id}`} style={{ textDecoration: "none" }}>
              <div className="lo-card" style={{ padding: "18px 20px", cursor: "pointer", height: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "var(--quest-gold-hi)" }}>{b.name}</span>
                    {b.tags.includes("Recomendado") && (
                      <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "rgba(212,175,55,0.15)", color: "var(--quest-gold-hi)", border: "1px solid rgba(212,175,55,0.3)" }}>✓ Recomendado</span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-low)", margin: 0 }}>{b.short}</p>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {b.skills.map(s => <span key={s} className="lo-chip" style={{ fontSize: 11 }}>{s}</span>)}
                </div>

                <p style={{ fontSize: 12, color: "var(--text-mid)", margin: 0, lineHeight: 1.5, flex: 1 }}>{b.feature}</p>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1/-1", padding: 48, textAlign: "center" }}>
              <p style={{ color: "var(--text-low)" }}>Sin resultados para la búsqueda actual.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
