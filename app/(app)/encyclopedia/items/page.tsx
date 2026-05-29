"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";

type Rarity = "común" | "infrecuente" | "rara" | "muy rara" | "legendaria";
type ItemType = "arma" | "armadura" | "varita" | "anillo" | "poción" | "pergamino" | "báculo" | "objeto maravilloso";

interface MagicItem { id: string; name: string; rarity: Rarity; type: ItemType; attunement: boolean; description: string; }

const RARITY_COLOR: Record<Rarity, string> = {
  "común": "#9E9E9E", "infrecuente": "#4CAF50", "rara": "#2196F3",
  "muy rara": "#9C27B0", "legendaria": "#FF9800",
};

const ITEMS: MagicItem[] = [
  { id: "bag-holding", name: "Bolsa de Contención", rarity: "infrecuente", type: "objeto maravilloso", attunement: false, description: "Espacio extradimensional que contiene hasta 500 lb / 64 pies³. Pesa siempre 15 lb." },
  { id: "cloak-protection", name: "Capa de Protección", rarity: "infrecuente", type: "objeto maravilloso", attunement: true, description: "+1 a CA y a tiradas de salvación mientras se lleva puesta." },
  { id: "boots-speed", name: "Botas de Velocidad", rarity: "rara", type: "objeto maravilloso", attunement: true, description: "Doblan tu velocidad. Puedes usar Esquivar como acción adicional. 10 min/día." },
  { id: "helm-telepathy", name: "Yelmo de Telepatía", rarity: "infrecuente", type: "objeto maravilloso", attunement: true, description: "Lanzas Detectar pensamientos (CD 13). Puedes comunicarte telepáticamente a 30 pies." },
  { id: "ring-protection", name: "Anillo de Protección", rarity: "rara", type: "anillo", attunement: true, description: "+1 a CA y tiradas de salvación." },
  { id: "ring-invisibility", name: "Anillo de Invisibilidad", rarity: "legendaria", type: "anillo", attunement: true, description: "Volverse invisible a voluntad. La invisibilidad termina si atacas o lanzas un hechizo." },
  { id: "wand-fireballs", name: "Varita de Bolas de Fuego", rarity: "rara", type: "varita", attunement: true, description: "7 cargas. Usa 1-3 cargas para lanzar Bola de fuego (CD 15). Recupera 1d6+1 cargas al amanecer." },
  { id: "wand-magic-missiles", name: "Varita de Misiles Mágicos", rarity: "infrecuente", type: "varita", attunement: false, description: "7 cargas. Usa 1-7 cargas para lanzar Misil Mágico (1 carga = nivel 1). Recupera 1d6+1/día." },
  { id: "staff-power", name: "Bastón de Poder", rarity: "muy rara", type: "báculo", attunement: true, description: "+2 a ataques y tiradas de salvación con hechizos. 20 cargas con múltiples hechizos." },
  { id: "sword-flame", name: "Espada Llameante", rarity: "rara", type: "arma", attunement: true, description: "+1 a ataques. Al activarla, emite llamas: 2d6 daño de fuego extra. Luz brillante 40 pies." },
  { id: "sword-sharpness", name: "Espada de la Nitidez", rarity: "muy rara", type: "arma", attunement: true, description: "+3 a ataques y daño. Con 20 natural, cercena un miembro o mata al instante." },
  { id: "vorpal-sword", name: "Espada Vorpal", rarity: "legendaria", type: "arma", attunement: true, description: "+3 a ataques y daño. Ignora resistencias a cortante. Con 20 natural, decapita." },
  { id: "armor-invulnerability", name: "Armadura de Invulnerabilidad", rarity: "legendaria", type: "armadura", attunement: true, description: "Resistencia a daño no mágico. 1/día: inmunidad al daño no mágico durante 10 minutos." },
  { id: "mithral-armor", name: "Armadura de Mitral", rarity: "infrecuente", type: "armadura", attunement: false, description: "Armadura metálica sin desventaja en Sigilo. Sin requisito de fuerza para cota de mallas." },
  { id: "potion-healing", name: "Poción de Curación", rarity: "común", type: "poción", attunement: false, description: "Recupera 2d4+2 PG al beberla. Acción para beber o administrar a otro." },
  { id: "potion-greater-healing", name: "Poción de Curación Superior", rarity: "infrecuente", type: "poción", attunement: false, description: "Recupera 4d4+4 PG al beberla." },
  { id: "potion-flying", name: "Poción de Vuelo", rarity: "muy rara", type: "poción", attunement: false, description: "Velocidad de vuelo de 60 pies durante 1 hora." },
  { id: "potion-gaseous", name: "Poción Gaseosa", rarity: "rara", type: "poción", attunement: false, description: "Te conviertes en gas durante 1 hora. Inmune a daño no mágico. Velocidad vuelo 10 pies." },
  { id: "scroll-fireball", name: "Pergamino de Bola de Fuego", rarity: "rara", type: "pergamino", attunement: false, description: "Lanza Bola de fuego (nivel 3) una vez. Se destruye al usarlo. Requiere ser lanzador." },
  { id: "ioun-stone", name: "Piedra Ioun (Reserva)", rarity: "rara", type: "objeto maravilloso", attunement: true, description: "Orbita tu cabeza. +2 a una puntuación de característica (según variedad)." },
  { id: "rope-climbing", name: "Cuerda de Escalada", rarity: "infrecuente", type: "objeto maravilloso", attunement: false, description: "Cuerda animada de 60 pies. Responde a comandos verbales. Ate, escape y trepe." },
  { id: "goggles-night", name: "Gafas de la Noche", rarity: "infrecuente", type: "objeto maravilloso", attunement: false, description: "Visión en la oscuridad hasta 60 pies mientras se llevan puestas." },
  { id: "amulet-health", name: "Amuleto de Salud", rarity: "rara", type: "objeto maravilloso", attunement: true, description: "Fija tu puntuación de Constitución en 19 mientras lo llevas." },
  { id: "gauntlets-strength", name: "Guanteletes de Fuerza de Ogro", rarity: "rara", type: "objeto maravilloso", attunement: true, description: "Fijan tu puntuación de Fuerza en 19 mientras se llevan." },
];

const ALL_RARITIES = ["común","infrecuente","rara","muy rara","legendaria"] as Rarity[];
const ALL_TYPES = [...new Set(ITEMS.map(i => i.type))] as ItemType[];

export default function ItemsPage() {
  const [search, setSearch] = useState("");
  const [filterRarity, setFilterRarity] = useState<Rarity | "">("");
  const [filterType, setFilterType] = useState<ItemType | "">("");
  const [filterAttunement, setFilterAttunement] = useState<"" | "yes" | "no">("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return ITEMS.filter(item => {
      if (q && !item.name.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) return false;
      if (filterRarity && item.rarity !== filterRarity) return false;
      if (filterType && item.type !== filterType) return false;
      if (filterAttunement === "yes" && !item.attunement) return false;
      if (filterAttunement === "no" && item.attunement) return false;
      return true;
    });
  }, [search, filterRarity, filterType, filterAttunement]);

  const hasFilters = search || filterRarity || filterType || filterAttunement;

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["LVL ONE", "Enciclopedia", "Objetos Mágicos"]} />
      <div style={{ padding: "24px 32px 0", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <Link href="/encyclopedia" className="lo-btn lo-btn-ghost" style={{ padding: "6px 10px" }}>
            <Ico name="arrowLeft" size={14} />
          </Link>
          <div>
            <h1 style={{ fontSize: 22, margin: 0 }}>Objetos Mágicos</h1>
            <p style={{ fontSize: 12, color: "var(--text-low)", margin: 0 }}>{ITEMS.length} objetos SRD · máx. 3 attunement simultáneos</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <input className="lo-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar objeto..." style={{ fontSize: 13, flex: "1 1 160px" }} />
          <select className="lo-input" value={filterRarity} onChange={e => setFilterRarity(e.target.value as Rarity | "")} style={{ fontSize: 12, flex: "0 0 auto" }}>
            <option value="">Toda rareza</option>
            {ALL_RARITIES.map(r => <option key={r} value={r} style={{ color: RARITY_COLOR[r] }}>{r}</option>)}
          </select>
          <select className="lo-input" value={filterType} onChange={e => setFilterType(e.target.value as ItemType | "")} style={{ fontSize: 12, flex: "0 0 auto" }}>
            <option value="">Todos los tipos</option>
            {ALL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="lo-input" value={filterAttunement} onChange={e => setFilterAttunement(e.target.value as "" | "yes" | "no")} style={{ fontSize: 12, flex: "0 0 auto" }}>
            <option value="">Attunement: todos</option>
            <option value="yes">Requiere attunement</option>
            <option value="no">Sin attunement</option>
          </select>
          {hasFilters && (
            <button type="button" className="lo-btn lo-btn-ghost" onClick={() => { setSearch(""); setFilterRarity(""); setFilterType(""); setFilterAttunement(""); }} style={{ fontSize: 12, padding: "6px 10px" }}>
              <Ico name="x" size={12} /> Limpiar
            </button>
          )}
          <span style={{ fontSize: 12, color: "var(--text-low)", marginLeft: "auto", alignSelf: "center" }}>{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(item => (
            <div key={item.id} className="lo-card" style={{ padding: "14px 16px", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 10, borderRadius: 2, alignSelf: "stretch", background: RARITY_COLOR[item.rarity], flexShrink: 0, minHeight: 36 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-hi)" }}>{item.name}</span>
                  <span style={{ fontSize: 11, color: RARITY_COLOR[item.rarity], fontWeight: 600, textTransform: "capitalize" }}>{item.rarity}</span>
                  <span style={{ fontSize: 11, color: "var(--text-low)", textTransform: "capitalize" }}>{item.type}</span>
                  {item.attunement && (
                    <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 999, background: "rgba(180,140,60,0.12)", color: "var(--quest-gold-hi)", border: "1px solid rgba(180,140,60,0.3)" }}>attunement</span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: "var(--text-mid)", margin: 0, lineHeight: 1.5 }}>{item.description}</p>
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
