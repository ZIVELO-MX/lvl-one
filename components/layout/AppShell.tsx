"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { useApp } from "@/lib/store";
import { Ico } from "@/components/ui/icons";
import { DiceWidget } from "@/components/ui/DiceWidget";
import { useMounted } from "@/lib/mounted";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const mounted = useMounted();

  useEffect(() => {
    if (mounted && !state.isLoading && !state.user) router.replace("/login");
  }, [mounted, state.isLoading, state.user, router]);

  if (!mounted || state.isLoading) return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--obsidian)" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 999, border: "2px solid var(--quest-gold-hi)", borderTopColor: "transparent", animation: "lo-spin .8s linear infinite" }}/>
        <span style={{ fontSize: 12, color: "var(--text-low)" }}>Cargando…</span>
      </div>
    </div>
  );
  if (!state.user) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--obsidian)" }}>
      <Sidebar/>
      <div className="lo-main-content" style={{ flex: 1, minWidth: 0, position: "relative" }}>
        {children}
      </div>
      {state.ui.limitModalOpen && <LimitModal/>}
      {state.ui.toast && <Toast msg={state.ui.toast} onDone={() => dispatch({ type: "TOAST_CLEAR" })}/>}
      <DiceWidget/>
    </div>
  );
}

export function TopBar({ crumb }: { crumb: string[] }) {
  return (
    <div className="lo-topbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 32px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--text-low)", fontSize: 12 }}>
        {crumb.map((c, i) => (
          <span key={`${i}-${c}`} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {i > 0 && <Ico name="chevron" size={12}/>}
            <span style={{ color: i === crumb.length - 1 ? "var(--text-hi)" : undefined }}>{c}</span>
          </span>
        ))}
      </div>
      <span style={{ fontSize: 11, color: "var(--text-low)", display: "inline-flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--moss-green)", display: "inline-block" }}/>
        Sincronizado
      </span>
    </div>
  );
}

function LimitModal() {
  const { dispatch } = useApp();
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 50, display: "grid", placeItems: "center" }} onClick={() => dispatch({ type: "LIMIT_CLOSE" })}>
      <div className="lo-card-elev lo-pop-in" style={{ width: 420, padding: 32, textAlign: "center" }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 48, height: 48, borderRadius: 999, background: "rgba(180,58,46,0.15)", border: "1px solid rgba(180,58,46,0.4)", display: "grid", placeItems: "center", margin: "0 auto 16px", color: "var(--dragon-red)" }}>
          <Ico name="lock" size={20}/>
        </div>
        <h3 style={{ fontSize: 22, marginBottom: 8 }}>Cofre de fichas lleno</h3>
        <p style={{ color: "var(--text-mid)", fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
          Tu grimorio ya contiene 2 aventureros — el límite del plan gratuito. Archiva uno para abrir espacio, o desbloquea fichas ilimitadas con LVL ONE Pro.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button type="button" className="lo-btn lo-btn-ghost" onClick={() => dispatch({ type: "LIMIT_CLOSE" })}>Entendido</button>
          <button type="button" className="lo-btn lo-btn-primary" onClick={() => dispatch({ type: "LIMIT_CLOSE" })}>Ver Pro <Ico name="arrow" size={13}/></button>
        </div>
      </div>
    </div>
  );
}

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 28, left: "50%",
      transform: "translateX(-50%)",
      background: "var(--ink-3)", border: "1px solid var(--line-strong)",
      borderRadius: 999, padding: "10px 20px",
      fontSize: 13, color: "var(--text-hi)",
      zIndex: 100, animation: "lo-toast .2s ease-out",
      display: "flex", alignItems: "center", gap: 8,
      boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
    }}>
      <Ico name="check" size={14} color="var(--quest-gold-hi)"/>
      {msg}
    </div>
  );
}
