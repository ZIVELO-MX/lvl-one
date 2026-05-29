"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { FEATS } from "@/data/feats";
import type { FeatType } from "@/data/feats";

const TYPE_LABEL: Record<FeatType, string> = {
  combat: "Combate",
  magic: "Magia",
  general: "General",
  racial: "Racial",
};
const TYPE_COLOR: Record<FeatType, string> = {
  combat: "#C28F8F",
  magic: "var(--arcane-blue-hi)",
  general: "var(--moss-green)",
  racial: "var(--quest-gold-hi)",
};

const ALL_TYPES = [...new Set(FEATS.map(f => f.type))] as FeatType[];

export default function FeatsPage() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FeatType | "">("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return FEATS.filter(f => {
      if (q && !f.name.toLowerCase().includes(q) && !f.description.toLowerCase().includes(q)) return false;
      if (filterType && f.type !== filterType) return false;
      return true;
    });
  }, [search, filterType]);

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["LVL ONE", "Enciclopedia", "Dotes"]} />
      <div style={{ padding: "24px 32px 0", maxWidth: 900, margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <Link href="/encyclopedia" className="lo-btn lo-btn-ghost" style={{ padding: "6px 10px" }}>
            <Ico name="arrowLeft" size={14} />
          </Link>
          <div>
            <h1 style={{ fontSize: 22, margin: 0 }}>Dotes</h1>
            <p style={{ fontSize: 12, color: "var(--text-low)", margin: 0 }}>
              {FEATS.length} dotes SRD — se eligen en los niveles de ASI (4/8/12/16/19)
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 180px" }}>
            <input className="lo-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar dote..." style={{ fontSize: 13 }} />
          </div>
          <select className="lo-input" value={filterType} onChange={e => setFilterType(e.target.value as FeatType | "")} style={{ fontSize: 12, flex: "0 0 auto" }}>
            <option value="">Todos los tipos</option>
            {ALL_TYPES.map(t => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
          </select>
          {(search || filterType) && (
            <button type="button" className="lo-btn lo-btn-ghost" onClick={() => { setSearch(""); setFilterType(""); }} style={{ fontSize: 12, padding: "6px 10px" }}>
              <Ico name="x" size={12} /> Limpiar
            </button>
          )}
          <span style={{ fontSize: 12, color: "var(--text-low)", marginLeft: "auto" }}>{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(feat => (
            <div key={feat.id} className="lo-card" style={{ padding: "14px 16px", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                background: `${TYPE_COLOR[feat.type]}18`,
                display: "grid", placeItems: "center",
                color: TYPE_COLOR[feat.type], fontSize: 12, fontWeight: 700,
              }}>
                {feat.type === "combat" && <Ico name="sword" size={16} color={TYPE_COLOR[feat.type]} />}
                {feat.type === "magic" && <Ico name="sparkle" size={16} color={TYPE_COLOR[feat.type]} />}
                {feat.type === "general" && <Ico name="star" size={16} color={TYPE_COLOR[feat.type]} />}
                {feat.type === "racial" && <Ico name="leaf" size={16} color={TYPE_COLOR[feat.type]} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-hi)" }}>{feat.name}</span>
                  <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 999, background: `${TYPE_COLOR[feat.type]}18`, color: TYPE_COLOR[feat.type], border: `1px solid ${TYPE_COLOR[feat.type]}44` }}>
                    {TYPE_LABEL[feat.type]}
                  </span>
                  {feat.prerequisite && (
                    <span style={{ fontSize: 11, color: "var(--text-low)" }}>
                      {feat.prerequisite.minLevel ? `Nv. ${feat.prerequisite.minLevel}+` : ""}
                      {feat.prerequisite.minStat ? `${feat.prerequisite.minStat.stat} ${feat.prerequisite.minStat.value}+` : ""}
                      {feat.prerequisite.class ? `Clase: ${feat.prerequisite.class}` : ""}
                      {feat.prerequisite.race ? `Raza: ${feat.prerequisite.race}` : ""}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: "var(--text-mid)", margin: 0, lineHeight: 1.5 }}>{feat.description}</p>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: 48, textAlign: "center" }}>
              <p style={{ color: "var(--text-low)" }}>Sin resultados para los filtros actuales.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
