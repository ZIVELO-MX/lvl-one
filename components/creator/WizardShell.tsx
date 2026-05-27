"use client";
import { useRouter } from "next/navigation";
import { Ico } from "@/components/ui/icons";

const LABELS = ["Identidad","Raza","Clase","Stats","Trasfondo","Equipo","Historia","Ficha"];

interface Props {
  id: string; step: number; title: string; sub?: string;
  children: React.ReactNode; preview: React.ReactNode;
  canProceed?: boolean; onSave?: () => void;
}

export function WizardShell({ id, step, title, sub, children, preview, canProceed = true, onSave }: Props) {
  const router = useRouter();
  const back = () => step === 1 ? router.push("/characters") : router.push(`/characters/${id}/edit/${step - 1}`);
  const next = () => { if (onSave) { onSave(); return; } router.push(`/characters/${id}/edit/${step + 1}`); };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <main style={{ flex: 1, position: "relative", padding: "26px 32px 100px", overflowY: "auto" }}>
        {/* breadcrumb + autosave */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-low)", fontSize: 12 }}>
            <span>Personajes</span><Ico name="chevron" size={12}/><span>Nuevo</span><Ico name="chevron" size={12}/>
            <span style={{ color: "var(--text-hi)" }}>{title}</span>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "var(--text-low)", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--moss-green)" }}/> Guardado automático
            </span>
            <button className="lo-btn lo-btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => router.push("/characters")}>Salir</button>
          </div>
        </div>

        {/* stepper */}
        <div style={{ display: "flex", gap: 6, marginBottom: 22, alignItems: "center" }}>
          {LABELS.map((l, i) => {
            const n = i + 1;
            const done = n < step; const cur = n === step;
            return (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={() => done && router.push(`/characters/${id}/edit/${n}`)}
                  style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: done ? "pointer" : "default", padding: 0 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 999, fontSize: 10, fontWeight: 600, display: "grid", placeItems: "center",
                    background: done ? "var(--quest-gold)" : cur ? "rgba(214,168,79,0.2)" : "rgba(244,231,197,0.06)",
                    border: cur ? "1px solid var(--quest-gold)" : "1px solid transparent",
                    color: done ? "#1A130A" : cur ? "var(--quest-gold-hi)" : "var(--text-low)" }}>
                    {done ? <Ico name="check" size={10}/> : n}
                  </span>
                  <span style={{ fontSize: 11, color: cur ? "var(--quest-gold-hi)" : done ? "var(--text-mid)" : "var(--text-low)" }}>{l}</span>
                </button>
                {i < LABELS.length - 1 && <span style={{ width: 16, height: 1, background: "var(--line-strong)" }}/>}
              </div>
            );
          })}
        </div>

        {/* heading */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, color: "var(--quest-gold-hi)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Paso {step} de 8</div>
          <h1 style={{ fontSize: 36, lineHeight: 1.05, marginBottom: 6 }}>{title}</h1>
          {sub && <p style={{ color: "var(--text-mid)", fontSize: 14, maxWidth: 620 }}>{sub}</p>}
        </div>

        {children}

        {/* footer */}
        <div style={{ position: "sticky", bottom: 24, marginTop: 32,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "14px 18px", background: "rgba(15,13,11,0.92)", backdropFilter: "blur(10px)",
          border: "1px solid var(--line-strong)", borderRadius: 12 }}>
          <button className="lo-btn lo-btn-ghost" onClick={back}><Ico name="arrowLeft" size={14}/> Atrás</button>
          <span style={{ fontSize: 11, color: "var(--text-low)" }}>Puedes volver sin perder lo elegido.</span>
          <button className="lo-btn lo-btn-primary" onClick={next} disabled={!canProceed} style={{ opacity: canProceed ? 1 : 0.4 }}>
            {step < 8 ? <>Continuar a {LABELS[step]} <Ico name="arrow" size={14}/></> : <>Guardar personaje <Ico name="check" size={14}/></>}
          </button>
        </div>
      </main>

      {/* preview aside */}
      <aside style={{ width: 300, borderLeft: "1px solid var(--line)", background: "rgba(0,0,0,0.25)", padding: 22, position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        {preview}
      </aside>
    </div>
  );
}
