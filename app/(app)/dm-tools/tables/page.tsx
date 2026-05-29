"use client";
import { useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { WEATHER_TABLE, REACTION_TABLE, EVENTS_TABLE } from "@/data/generators/tables";

interface RollTableProps {
  title: string;
  glyph: string;
  color: string;
  table: string[];
}

function RollTable({ title, glyph, color, table }: RollTableProps) {
  const [rolled, setRolled] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);

  const roll = () => {
    setRolling(true);
    setTimeout(() => {
      const r = Math.floor(Math.random() * 20);
      setRolled(r);
      setRolling(false);
    }, 220);
  };

  return (
    <div className="lo-card" style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, color, fontWeight: 700, margin: 0 }}>{glyph} {title}</h3>
        <button type="button" onClick={roll} disabled={rolling} className="lo-btn lo-btn-ghost" style={{ fontSize: 12, padding: "5px 12px" }}>
          <Ico name="dice" size={12}/> {rolling ? "..." : "Tirar d20"}
        </button>
      </div>

      {rolled !== null && (
        <div style={{
          marginBottom: 14, padding: "10px 14px", borderRadius: 8,
          background: `${color}12`, border: `1px solid ${color}40`,
          display: "flex", gap: 12, alignItems: "center",
        }}>
          <span style={{ fontSize: 22, fontWeight: 800, color }}>d20 = {rolled + 1}</span>
          <span style={{ fontSize: 14, color: "var(--text-hi)", fontWeight: 600 }}>{table[rolled]}</span>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {table.map((entry, i) => (
          <div
            key={`${i}-${entry}`}
            onClick={() => setRolled(i)}
            style={{
              display: "flex", gap: 10, padding: "5px 8px", borderRadius: 5, cursor: "pointer",
              background: rolled === i ? `${color}10` : "transparent",
              outline: rolled === i ? `1px solid ${color}40` : "1px solid transparent",
              transition: "background .1s",
            }}
          >
            <span style={{ fontSize: 11, color, fontWeight: 700, minWidth: 22, textAlign: "right" }}>{i + 1}</span>
            <span style={{ fontSize: 12, color: rolled === i ? "var(--text-hi)" : "var(--text-mid)" }}>{entry}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TablesPage() {
  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["LVL ONE", "DM Tools", "Tablas de Tirada"]}/>
      <div style={{ padding: "24px 32px 0", maxWidth: 900, margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <Link href="/dm-tools" className="lo-btn lo-btn-ghost" style={{ padding: "6px 10px" }}>
            <Ico name="arrowLeft" size={14}/>
          </Link>
          <div>
            <h1 style={{ fontSize: 22, margin: 0 }}>Tablas de Tirada Aleatoria</h1>
            <p style={{ fontSize: 12, color: "var(--text-low)", margin: 0 }}>Tira d20 o haz clic en una fila para seleccionar el resultado.</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          <RollTable
            title="Clima"
            glyph="🌦"
            color="var(--arcane-blue-hi)"
            table={WEATHER_TABLE}
          />
          <RollTable
            title="Reacciones de PNJ"
            glyph="💬"
            color="var(--quest-gold-hi)"
            table={REACTION_TABLE}
          />
          <RollTable
            title="Eventos Aleatorios"
            glyph="⚡"
            color="#C9956A"
            table={EVENTS_TABLE}
          />
        </div>
      </div>
    </main>
  );
}
