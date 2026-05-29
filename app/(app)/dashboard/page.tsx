"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp, newDraft } from "@/lib/store";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { MODULES, LESSONS } from "@/data/modules";
import { MAX_FREE_CHARACTERS } from "@/types/character";
import { CharCard } from "@/components/characters/CharCard";

export default function DashboardPage() {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const totalLessons = Object.values(LESSONS).reduce((a, b) => a + b.length, 0);
  const doneLessons = Object.values(state.progress).reduce((a, p) => a + p.completedLessons.length, 0);
  const learnPct = Math.round((doneLessons / totalLessons) * 100);
  const isLimit = state.characters.length >= MAX_FREE_CHARACTERS;
  const name = state.user?.username ?? "aventurero";

  function startNew() {
    if (isLimit) { dispatch({ type: "LIMIT_OPEN" }); return; }
    const d = newDraft();
    dispatch({ type: "DRAFT_INIT", draft: d });
    router.push(`/characters/${d.id}/edit/1`);
  }

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["Inicio"]}/>
      <div style={{ padding: "16px 32px 0", maxWidth: 1100, margin: "0 auto" }}>

        {/* Welcome */}
        <div style={{ margin: "16px 0 28px" }}>
          <div className="lo-chip lo-chip-gold" style={{ marginBottom: 10 }}>
            <Ico name="sparkle" size={10}/>
            {state.characters.length === 0
              ? "El escriba aguarda tu primera ficha"
              : isLimit
              ? "Cofre de fichas lleno"
              : "La partida continúa"}
          </div>
          <h1 style={{ fontSize: 36, lineHeight: 1.05 }}>
            Hola, <span style={{ color: "var(--quest-gold-hi)", fontFamily: "var(--font-display)" }}>{name}</span>.
          </h1>
          <p style={{ color: "var(--text-mid)", marginTop: 6, fontSize: 14 }}>
            {state.characters.length === 0
              ? "Elige tu clase, tira tus dados y empieza la aventura."
              : isLimit
              ? "Tu grimorio está lleno. Archiva una ficha para abrir espacio."
              : "La mesa te espera donde la dejaste."}
          </p>
          <button type="button" className={isLimit ? "lo-btn lo-btn-ghost" : "lo-btn lo-btn-primary"} onClick={startNew} style={{ marginTop: 16 }}>
            <Ico name="plus" size={14}/> Nuevo personaje
          </button>
        </div>

        {/* Stats row — 2 columns, sin upsell mezclado */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
          <div className="lo-card-elev lo-stagger-1" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-low)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Fichas activas</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--text-hi)" }}>
                  {state.characters.length}<span style={{ fontSize: 16, color: "var(--text-low)" }}>/{MAX_FREE_CHARACTERS}</span>
                </div>
              </div>
              <div className={`lo-chip ${isLimit ? "lo-chip-red" : "lo-chip-green"}`}>
                {isLimit ? "Completo" : "Disponible"}
              </div>
            </div>
            <div className="lo-pbar"><div style={{ width: `${(state.characters.length / MAX_FREE_CHARACTERS) * 100}%` }}/></div>
          </div>
          <div className="lo-card-elev lo-stagger-2" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, color: "var(--text-low)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Conocimiento arcano</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--text-hi)", marginBottom: 10 }}>{learnPct}%</div>
            <div className="lo-pbar"><div style={{ width: `${learnPct}%` }}/></div>
            <div style={{ fontSize: 11, color: "var(--text-low)", marginTop: 6 }}>{doneLessons} de {totalLessons} tratados estudiados</div>
          </div>
        </div>

        {/* Aventureros */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h2 style={{ fontSize: 20 }}>Tus aventureros</h2>
          <Link href="/characters" style={{ fontSize: 12, color: "var(--quest-gold-hi)", textDecoration: "none" }}>Ver grimorio →</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 32 }}>
          {state.characters.map(c => <CharCard key={c.id} character={c}/>)}
          {state.characters.length < MAX_FREE_CHARACTERS && (
            <button type="button" onClick={startNew} className="lo-card lo-pressable" style={{ minHeight: 180, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, borderStyle: "dashed" }}>
              <div style={{ width: 40, height: 40, borderRadius: 999, background: "rgba(214,168,79,0.10)", display: "grid", placeItems: "center", color: "var(--quest-gold-hi)" }}>
                <Ico name="plus" size={18}/>
              </div>
              <span style={{ fontSize: 13, color: "var(--text-mid)" }}>Convocar aventurero</span>
            </button>
          )}
        </div>

        {/* Pro upsell — separado del stats row */}
        <div className="lo-card" style={{ padding: "14px 20px", marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, borderColor: "rgba(214,168,79,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(214,168,79,0.1)", display: "grid", placeItems: "center", color: "var(--quest-gold-hi)", flexShrink: 0 }}>
              <Ico name="crown" size={14}/>
            </div>
            <div>
              <div style={{ fontSize: 13, color: "var(--text-hi)", fontWeight: 600 }}>LVL ONE Pro — Próximamente</div>
              <div style={{ fontSize: 12, color: "var(--text-low)" }}>Fichas ilimitadas, pergaminos PDF, campañas y AI DM Assistant.</div>
            </div>
          </div>
          <button type="button" className="lo-btn lo-btn-ghost" style={{ padding: "6px 14px", fontSize: 12, flexShrink: 0 }} disabled>
            Notificarme
          </button>
        </div>

        {/* Tratados de reglas */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h2 style={{ fontSize: 20 }}>Tratados de reglas</h2>
          <Link href="/learn" style={{ fontSize: 12, color: "var(--quest-gold-hi)", textDecoration: "none" }}>Abrir scriptorium →</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {MODULES.slice(0, 3).map((m, idx) => {
            const prog = state.progress[m.id];
            const pct = prog?.pct ?? 0;
            const status = pct === 100 ? "done" : pct > 0 ? "current" : "open";
            const stagger = ["lo-stagger-1", "lo-stagger-2", "lo-stagger-3"][idx] ?? "";
            return (
              <Link key={m.id} href={`/learn/${m.id}/l1`} style={{ textDecoration: "none" }}>
                <div className={`lo-card-elev lo-pressable ${stagger}`} style={{ padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, display: "grid", placeItems: "center", background: status === "done" ? "rgba(91,122,74,0.2)" : status === "current" ? "rgba(214,168,79,0.15)" : "rgba(244,231,197,0.06)", color: status === "done" ? "#A3C28F" : status === "current" ? "var(--quest-gold-hi)" : "var(--arcane-blue-hi)" }}>
                      <Ico name={m.icon} size={16}/>
                    </div>
                    <span style={{ fontSize: 10, color: status === "done" ? "#A3C28F" : status === "current" ? "var(--quest-gold-hi)" : "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                      {status === "done" ? "Dominado" : status === "current" ? "Estudiando" : "Sin leer"}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 14, lineHeight: 1.3, marginBottom: 4 }}>{m.title}</h3>
                  <p style={{ fontSize: 11, color: "var(--text-low)", margin: 0 }}>{m.time} · {m.lessons.length} lecciones</p>
                  {pct > 0 && pct < 100 && <div className="lo-pbar" style={{ marginTop: 10 }}><div style={{ width: `${pct}%` }}/></div>}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
