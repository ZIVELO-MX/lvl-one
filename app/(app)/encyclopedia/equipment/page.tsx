"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { EQUIPMENT_ITEMS } from "@/data/equipment";
import type { EquipmentCategory } from "@/types/character";

type Category = EquipmentCategory;

const CATEGORY_LABEL: Record<Category, string> = {
  weapon: "Armas",
  armor: "Armaduras",
  shield: "Escudos",
  focus: "Focos mágicos",
  tool: "Herramientas",
  adventuringGear: "Equipo de aventurero",
  pack: "Paquetes",
  treasure: "Tesoros",
};

const CATEGORY_ORDER: Category[] = ["weapon", "armor", "shield", "focus", "tool", "adventuringGear", "pack", "treasure"];

const CATEGORY_COLOR: Record<Category, string> = {
  weapon: "#C28F8F",
  armor: "#C9956A",
  shield: "var(--quest-gold-hi)",
  focus: "var(--arcane-blue-hi)",
  tool: "#A3C28F",
  adventuringGear: "var(--text-mid)",
  pack: "var(--moss-green)",
  treasure: "var(--quest-gold-hi)",
};

export default function EquipmentPage() {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<Category | "">("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return EQUIPMENT_ITEMS.filter(e => {
      if (filterCat && e.category !== filterCat) return false;
      if (q && !e.name.toLowerCase().includes(q) && !(e.summary ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, filterCat]);

  const grouped = useMemo(() => {
    const cats = filterCat ? [filterCat as Category] : CATEGORY_ORDER;
    return cats.map(cat => ({
      cat,
      items: filtered.filter(e => e.category === cat),
    })).filter(g => g.items.length > 0);
  }, [filtered, filterCat]);

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["LVL ONE", "Enciclopedia", "Equipo"]}/>
      <div style={{ padding: "24px 32px 0", maxWidth: 960, margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <Link href="/encyclopedia" className="lo-btn lo-btn-ghost" style={{ padding: "6px 10px" }}>
            <Ico name="arrowLeft" size={14}/>
          </Link>
          <div>
            <h1 style={{ fontSize: 22, margin: 0 }}>Equipo</h1>
            <p style={{ fontSize: 12, color: "var(--text-low)", margin: 0 }}>SRD 5.1 — {EQUIPMENT_ITEMS.length} objetos</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 180px" }}>
            <input className="lo-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar equipo..." style={{ fontSize: 13 }}/>
          </div>
          <div style={{ flex: "0 0 auto" }}>
            <select className="lo-input" value={filterCat} onChange={e => setFilterCat(e.target.value as Category | "")} style={{ fontSize: 12 }}>
              <option value="">Todas las categorías</option>
              {CATEGORY_ORDER.map(c => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
            </select>
          </div>
          {(search || filterCat) && (
            <button className="lo-btn lo-btn-ghost" onClick={() => { setSearch(""); setFilterCat(""); }} style={{ fontSize: 12, padding: "6px 10px" }}>
              <Ico name="x" size={12}/> Limpiar
            </button>
          )}
          <span style={{ fontSize: 12, color: "var(--text-low)", marginLeft: "auto" }}>{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {grouped.map(({ cat, items }) => (
          <div key={cat} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 13, color: CATEGORY_COLOR[cat], textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10, paddingBottom: 6, borderBottom: `1px solid var(--border-lo)` }}>
              {CATEGORY_LABEL[cat]} <span style={{ color: "var(--text-low)", fontWeight: 400 }}>({items.length})</span>
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
              {items.map(item => (
                <div key={item.id} className="lo-card" style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-hi)" }}>{item.name}</span>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      {item.damage && (
                        <span className="lo-chip" style={{ fontSize: 11, color: "#C28F8F" }}>{item.damage} {item.damageType}</span>
                      )}
                      {item.armorClass && (
                        <span className="lo-chip" style={{ fontSize: 11, color: "#C9956A" }}>CA {item.armorClass}</span>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-mid)", margin: 0, lineHeight: 1.5 }}>{item.summary}</p>
                  {item.properties && item.properties.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 6 }}>
                      {item.properties.map(p => <span key={p} className="lo-chip" style={{ fontSize: 10 }}>{p}</span>)}
                    </div>
                  )}
                  {item.strengthRequirement && (
                    <div style={{ fontSize: 11, color: "var(--text-low)", marginTop: 4 }}>Requiere FUE {item.strengthRequirement}+</div>
                  )}
                  {item.stealthDisadvantage && (
                    <div style={{ fontSize: 11, color: "var(--text-low)", marginTop: 2 }}>Desventaja en sigilo</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ padding: 48, textAlign: "center" }}>
            <p style={{ color: "var(--text-low)" }}>Sin resultados para los filtros actuales.</p>
          </div>
        )}
      </div>
    </main>
  );
}
