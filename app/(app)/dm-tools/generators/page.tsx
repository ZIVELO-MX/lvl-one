"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { CULTURES, generateName } from "@/data/generators/names";
import { generateTavern } from "@/data/generators/taverns";
import { generateQuickNPC } from "@/data/generators/npcs";
import { generateTreasure } from "@/data/generators/treasures";
import { BIOMES, generateEncounter } from "@/data/generators/encounters";
import { generateRumor, generateHook } from "@/data/generators/rumors";
import type { NameGender } from "@/data/generators/names";
import type { TavernResult } from "@/data/generators/taverns";
import type { QuickNPC } from "@/data/generators/npcs";
import type { LootEntry } from "@/data/generators/treasures";

type Tab = "nombres" | "tabernas" | "npcs" | "tesoros" | "encuentros" | "rumores";

const TABS: { id: Tab; label: string; glyph: string }[] = [
  { id: "nombres",    label: "Nombres",    glyph: "🧝" },
  { id: "tabernas",   label: "Tabernas",   glyph: "🍺" },
  { id: "npcs",       label: "NPCs",       glyph: "👤" },
  { id: "tesoros",    label: "Tesoros",    glyph: "💰" },
  { id: "encuentros", label: "Encuentros", glyph: "🐉" },
  { id: "rumores",    label: "Rumores",    glyph: "📣" },
];

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="lo-btn lo-btn-ghost" style={{ fontSize: 11, padding: "3px 8px" }}
    >
      <Ico name="copy" size={11}/> {copied ? "¡Copiado!" : "Copiar"}
    </button>
  );
}

// ── NOMBRES ──────────────────────────────────────────────────────────────────
function NombresTab() {
  const [culture, setCulture] = useState(CULTURES[0]);
  const [gender, setGender] = useState<NameGender>("male");
  const [names, setNames] = useState<string[]>([]);

  const generate = useCallback(() => {
    setNames(Array.from({ length: 6 }, () => generateName(culture, gender)));
  }, [culture, gender]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <select className="lo-input" value={culture} onChange={e => setCulture(e.target.value)} style={{ fontSize: 12, flex: "1 1 160px" }}>
          {CULTURES.map(c => <option key={c} value={c} style={{ textTransform: "capitalize" }}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
        <div style={{ display: "flex", gap: 4 }}>
          {(["male", "female"] as NameGender[]).map(g => (
            <button type="button" key={g} onClick={() => setGender(g)} style={{
              padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12,
              background: gender === g ? "rgba(163,194,143,0.15)" : "rgba(255,255,255,0.04)",
              outline: gender === g ? "1px solid #A3C28F" : "1px solid transparent",
              color: gender === g ? "#A3C28F" : "var(--text-low)",
            }}>
              {g === "male" ? "Masculino" : "Femenino"}
            </button>
          ))}
        </div>
        <button type="button" onClick={generate} className="lo-btn lo-btn-ghost" style={{ fontSize: 13 }}>
          <Ico name="dice" size={13}/> Generar
        </button>
      </div>
      {names.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {names.map((n, i) => (
            <div key={`${i}-${n}`} className="lo-card" style={{ padding: "8px 14px", display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-hi)" }}>{n}</span>
              <CopyBtn text={n}/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── TABERNAS ─────────────────────────────────────────────────────────────────
function TabernasTab() {
  const [result, setResult] = useState<TavernResult | null>(null);
  const generate = () => setResult(generateTavern());

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <button type="button" onClick={generate} className="lo-btn lo-btn-ghost" style={{ width: "fit-content", fontSize: 13 }}>
        <Ico name="dice" size={13}/> Generar taberna
      </button>
      {result && (
        <div className="lo-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--quest-gold-hi)", margin: 0 }}>{result.name}</h2>
            <CopyBtn text={`${result.name}\n${result.vibe}\n${result.desc}\nRumor: ${result.rumor}`}/>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <span className="lo-chip" style={{ fontSize: 11 }}>{result.vibe}</span>
          </div>
          <p style={{ fontSize: 14, color: "var(--text-mid)", lineHeight: 1.6, margin: "0 0 10px" }}>{result.desc}</p>
          <p style={{ fontSize: 12, color: "var(--text-low)", margin: 0, fontStyle: "italic" }}>💬 Rumor: {result.rumor}</p>
        </div>
      )}
    </div>
  );
}

// ── NPCS ─────────────────────────────────────────────────────────────────────
function NpcsTab() {
  const [result, setResult] = useState<QuickNPC | null>(null);
  const generate = () => setResult(generateQuickNPC());

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <button type="button" onClick={generate} className="lo-btn lo-btn-ghost" style={{ width: "fit-content", fontSize: 13 }}>
        <Ico name="dice" size={13}/> Generar NPC
      </button>
      {result && (
        <div className="lo-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-hi)", margin: 0 }}>{result.name}</h2>
            <CopyBtn text={`${result.name} (${result.race})\nPersonalidad: ${result.personality}\nMotivación: ${result.motivation}\nDefecto: ${result.flaw}\nQuirk: ${result.quirk}`}/>
          </div>
          <span className="lo-chip" style={{ fontSize: 11, marginBottom: 10, display: "inline-block" }}>{result.race}</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { label: "Personalidad", value: result.personality, color: "var(--quest-gold-hi)" },
              { label: "Motivación", value: result.motivation, color: "#A3C28F" },
              { label: "Defecto", value: result.flaw, color: "#C28F8F" },
              { label: "Peculiaridad", value: result.quirk, color: "var(--arcane-blue-hi)" },
            ].map(r => (
              <div key={r.label} style={{ fontSize: 13 }}>
                <span style={{ color: r.color, fontWeight: 600, marginRight: 6 }}>{r.label}:</span>
                <span style={{ color: "var(--text-mid)" }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── TESOROS ───────────────────────────────────────────────────────────────────
function TesorosTab() {
  const [cr, setCr] = useState(1);
  const [result, setResult] = useState<LootEntry | null>(null);
  const generate = () => setResult(generateTreasure(cr));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em" }}>CR del monstruo</label>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <button type="button" onClick={() => setCr(c => Math.max(0, c - 1))} className="lo-btn lo-btn-ghost" style={{ padding: "4px 10px" }}>−</button>
            <span style={{ fontSize: 16, fontWeight: 700, color: "var(--quest-gold-hi)", minWidth: 32, textAlign: "center" }}>CR {cr}</span>
            <button type="button" onClick={() => setCr(c => Math.min(30, c + 1))} className="lo-btn lo-btn-ghost" style={{ padding: "4px 10px" }}>+</button>
          </div>
        </div>
        <button type="button" onClick={generate} className="lo-btn lo-btn-ghost" style={{ fontSize: 13 }}>
          <Ico name="dice" size={13}/> Generar
        </button>
      </div>
      {result && (
        <div className="lo-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: "var(--text-low)" }}>Tesoro para CR {cr}</span>
            <CopyBtn text={`Oro: ${result.gold} po\nObjetos: ${result.items.join(", ")}`}/>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--quest-gold-hi)", marginBottom: 10 }}>
            💰 {result.gold} po
          </div>
          {result.items.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {result.items.map((item, i) => <span key={`${i}-${item}`} className="lo-chip" style={{ fontSize: 12 }}>{item}</span>)}
            </div>
          )}
          {result.items.length === 0 && <p style={{ fontSize: 13, color: "var(--text-low)", margin: 0 }}>Solo monedas — sin objetos notables.</p>}
        </div>
      )}
    </div>
  );
}

// ── ENCUENTROS ────────────────────────────────────────────────────────────────
function EncuentrosTab() {
  const [biome, setBiome] = useState(BIOMES[0]);
  const [level, setLevel] = useState(1);
  const [result, setResult] = useState<{ description: string; monsters: string[]; note: string } | null>(null);
  const generate = () => setResult(generateEncounter(biome, level));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Bioma</label>
          <select className="lo-input" value={biome} onChange={e => setBiome(e.target.value)} style={{ fontSize: 12 }}>
            {BIOMES.map(b => <option key={b} value={b} style={{ textTransform: "capitalize" }}>{b.charAt(0).toUpperCase() + b.slice(1)}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Nivel del grupo</label>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <button type="button" onClick={() => setLevel(l => Math.max(1, l - 1))} className="lo-btn lo-btn-ghost" style={{ padding: "4px 10px" }}>−</button>
            <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-hi)", minWidth: 24, textAlign: "center" }}>{level}</span>
            <button type="button" onClick={() => setLevel(l => Math.min(20, l + 1))} className="lo-btn lo-btn-ghost" style={{ padding: "4px 10px" }}>+</button>
          </div>
        </div>
        <button type="button" onClick={generate} className="lo-btn lo-btn-ghost" style={{ fontSize: 13 }}>
          <Ico name="dice" size={13}/> Generar
        </button>
      </div>
      {result && (
        <div className="lo-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: "var(--text-low)" }}>{biome} · Nivel {level}</span>
            <CopyBtn text={`${result.description}\nMonstruos: ${result.monsters.join(", ")}\nNota: ${result.note}`}/>
          </div>
          <p style={{ fontSize: 14, color: "var(--text-hi)", lineHeight: 1.6, margin: "0 0 10px", fontWeight: 600 }}>{result.description}</p>
          {result.monsters.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              {result.monsters.map((m, i) => <span key={`${i}-${m}`} className="lo-chip" style={{ fontSize: 11, color: "#C28F8F" }}>{m}</span>)}
            </div>
          )}
          <p style={{ fontSize: 12, color: "var(--text-low)", margin: 0, fontStyle: "italic" }}>💡 {result.note}</p>
        </div>
      )}
    </div>
  );
}

// ── RUMORES ───────────────────────────────────────────────────────────────────
function RumoresTab() {
  const [rumor, setRumor] = useState<string | null>(null);
  const [hook, setHook] = useState<{ premise: string; goal: string; twist: string } | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={() => { setRumor(generateRumor()); setHook(null); }} className="lo-btn lo-btn-ghost" style={{ fontSize: 13 }}>
          <Ico name="dice" size={13}/> Rumor
        </button>
        <button type="button" onClick={() => { setHook(generateHook()); setRumor(null); }} className="lo-btn lo-btn-ghost" style={{ fontSize: 13 }}>
          <Ico name="dice" size={13}/> Gancho de aventura
        </button>
      </div>
      {rumor && (
        <div className="lo-card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Rumor</span>
            <CopyBtn text={rumor}/>
          </div>
          <p style={{ fontSize: 14, color: "var(--text-mid)", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>&ldquo;{rumor}&rdquo;</p>
        </div>
      )}
      {hook && (
        <div className="lo-card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 11, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Gancho de aventura</span>
            <CopyBtn text={`Premisa: ${hook.premise}\nObjetivo: ${hook.goal}\nGiro: ${hook.twist}`}/>
          </div>
          {[
            { label: "Premisa", value: hook.premise, color: "var(--quest-gold-hi)" },
            { label: "Objetivo", value: hook.goal, color: "#A3C28F" },
            { label: "Giro", value: hook.twist, color: "#C28F8F" },
          ].map(r => (
            <div key={r.label} style={{ fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: r.color, fontWeight: 600, marginRight: 6 }}>{r.label}:</span>
              <span style={{ color: "var(--text-mid)" }}>{r.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function GeneratorsPage() {
  const [tab, setTab] = useState<Tab>("nombres");

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["LVL ONE", "DM Tools", "Generadores"]}/>
      <div style={{ padding: "24px 32px 0", maxWidth: 860, margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <Link href="/dm-tools" className="lo-btn lo-btn-ghost" style={{ padding: "6px 10px" }}>
            <Ico name="arrowLeft" size={14}/>
          </Link>
          <div>
            <h1 style={{ fontSize: 22, margin: 0 }}>Generadores Procedurales</h1>
            <p style={{ fontSize: 12, color: "var(--text-low)", margin: 0 }}>Contenido aleatorio para tu sesión — seed-based, reproducible.</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, flexWrap: "wrap" }}>
          {TABS.map(t => (
            <button type="button" key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13,
              background: tab === t.id ? "rgba(163,194,143,0.12)" : "rgba(255,255,255,0.04)",
              outline: tab === t.id ? "1px solid rgba(163,194,143,0.4)" : "1px solid transparent",
              color: tab === t.id ? "#A3C28F" : "var(--text-low)",
              fontWeight: tab === t.id ? 600 : 400,
            }}>
              {t.glyph} {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="lo-card" style={{ padding: 20 }}>
          {tab === "nombres"    && <NombresTab/>}
          {tab === "tabernas"   && <TabernasTab/>}
          {tab === "npcs"       && <NpcsTab/>}
          {tab === "tesoros"    && <TesorosTab/>}
          {tab === "encuentros" && <EncuentrosTab/>}
          {tab === "rumores"    && <RumoresTab/>}
        </div>
      </div>
    </main>
  );
}
