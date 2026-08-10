"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { MONSTERS } from "@/data/monsters";
import type { MonsterType } from "@/types/monster";

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
function crColor(cr: number) {
  if (cr <= 0.5) return "#A3C28F";
  if (cr <= 3) return "var(--quest-gold-hi)";
  if (cr <= 8) return "#C9956A";
  return "#C28F8F";
}

const TYPE_LABEL: Record<MonsterType, string> = {
  "bestia": "Bestia", "humanoides": "Humanoide", "no-muerto": "No-muerto",
  "dragón": "Dragón", "aberración": "Aberración", "bestia-magica": "Bestia mágica",
  "constructo": "Constructo", "elemental": "Elemental", "hada": "Hada",
  "demonio": "Demonio", "monstruosidad": "Monstruosidad", "limo": "Limo",
  "planta": "Planta", "gigante": "Gigante", "inmortal": "Inmortal",
};
const ALL_TYPES = [...new Set(MONSTERS.map(m => m.type))].toSorted() as MonsterType[];
const ALL_CRS = [...new Set(MONSTERS.map(m => m.cr))].toSorted((a, b) => a - b);

export default function MonstersPage() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<MonsterType | "">("");
  const [filterCr, setFilterCr] = useState<number | "">("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return MONSTERS.filter(m => {
      if (q && !m.name.toLowerCase().includes(q) && !m.short.toLowerCase().includes(q)) return false;
      if (filterType && m.type !== filterType) return false;
      if (filterCr !== "" && m.cr !== filterCr) return false;
      return true;
    });
  }, [search, filterType, filterCr]);

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["LVL ONE", "Enciclopedia", "Bestiario"]}/>
      <div style={{ padding: "24px 32px 0", maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <Link href="/encyclopedia" className="lo-btn lo-btn-ghost" style={{ padding: "6px 10px" }}>
            <Ico name="arrowLeft" size={14}/>
          </Link>
          <div>
            <h1 style={{ fontSize: 22, margin: 0 }}>Bestiario</h1>
            <p style={{ fontSize: 12, color: "var(--text-low)", margin: 0 }}>SRD 5.1 — {MONSTERS.length} monstruos</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 180px" }}>
            <input id="monsters-search" aria-label="Buscar monstruo" className="lo-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar monstruo..." style={{ fontSize: 13 }}/>
          </div>
          <div style={{ flex: "0 0 auto" }}>
            <select id="monsters-type" aria-label="Filtrar por tipo de monstruo" className="lo-input" value={filterType} onChange={e => setFilterType(e.target.value as MonsterType | "")} style={{ fontSize: 12 }}>
              <option value="">Todos los tipos</option>
              {ALL_TYPES.map(t => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
            </select>
          </div>
          <div style={{ flex: "0 0 auto" }}>
            <select id="monsters-cr" aria-label="Filtrar por nivel de desafío" className="lo-input" value={filterCr} onChange={e => setFilterCr(e.target.value === "" ? "" : Number(e.target.value))} style={{ fontSize: 12, width: 90 }}>
              <option value="">Todo CR</option>
              {ALL_CRS.map(cr => <option key={cr} value={cr}>CR {crLabel(cr)}</option>)}
            </select>
          </div>
          {(search || filterType || filterCr !== "") && (
            <button type="button" className="lo-btn lo-btn-ghost" onClick={() => { setSearch(""); setFilterType(""); setFilterCr(""); }} style={{ fontSize: 12, padding: "6px 10px" }}>
              <Ico name="x" size={12}/> Limpiar
            </button>
          )}
          <span style={{ fontSize: 12, color: "var(--text-low)", marginLeft: "auto" }}>{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
          {filtered.map(m => (
            <Link key={m.id} href={`/encyclopedia/monsters/${m.id}`} style={{ textDecoration: "none" }}>
              <div className="lo-card" style={{ overflow: "hidden", cursor: "pointer", transition: "border-color .15s" }}>
                {/* Portrait */}
                <div style={{ height: 140, background: "rgba(15,13,11,0.85)", overflow: "hidden", position: "relative" }}>
                  <Image
                    src={portrait(m.id, m.type)}
                    alt={m.name}
                    fill
                    sizes="200px"
                    style={{ objectFit: "cover" }}
                    onError={e => {
                      const el = e.target as HTMLImageElement;
                      el.style.display = "none";
                      const ghost = document.createElement("div");
                      ghost.style.cssText = "position:absolute;inset:0;display:grid;place-items:center;font-size:42px;opacity:0.08;pointer-events:none";
                      ghost.textContent = "👾";
                      el.parentElement?.appendChild(ghost);
                    }}
                  />
                  <div style={{ position: "absolute", top: 8, left: 8, padding: "2px 7px", background: "rgba(0,0,0,0.7)", borderRadius: 4, fontSize: 11, fontWeight: 700, color: crColor(m.cr) }}>
                    CR {crLabel(m.cr)}
                  </div>
                </div>
                {/* Info */}
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-hi)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-low)", marginBottom: 6 }}>{TYPE_LABEL[m.type]} · {m.size}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                    <span style={{ color: "var(--text-mid)" }}>CA {m.ac}</span>
                    <span style={{ color: "var(--text-mid)" }}>{m.hp} HP</span>
                    <span style={{ color: "var(--quest-gold-hi)", fontWeight: 600 }}>{m.xp} XP</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1/-1", padding: 48, textAlign: "center" }}>
              <p style={{ color: "var(--text-low)" }}>Sin resultados para los filtros actuales.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
