"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LvlLogo } from "@/components/ui/icons";
import { useApp } from "@/lib/store";

const QUESTIONS = [
  { id: "exp",   t: "¿Ya has jugado rol antes?",             opts: ["Nunca", "Un poco", "Bastante", "Soy veterano"] },
  { id: "goal",  t: "¿Qué quieres hacer primero?",           opts: ["Crear un personaje", "Aprender las reglas", "Las dos cosas"] },
  { id: "role",  t: "¿Serás jugador o Dungeon Master?",      opts: ["Jugador", "Dungeon Master", "Aún no lo sé"] },
  { id: "pace",  t: "¿Cómo prefieres aprender?",             opts: ["Rápida (5 min)", "Paso a paso (15 min)"] },
];

export default function OnboardingPage() {
  const { dispatch } = useApp();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const cur = QUESTIONS[step];

  function choose(i: number) {
    const next = { ...answers, [cur.id]: i };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      setTimeout(() => setStep(s => s + 1), 200);
    } else {
      dispatch({ type: "ONBOARDING_DONE", answers: next });
      setTimeout(() => router.push("/dashboard"), 350);
    }
  }

  return (
    <div className="lo lo-darkframe" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 32, position: "relative" }}>
      <div className="lo-grain" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}/>
      <div className="lo-card-elev lo-fade-in" key={step} style={{ width: 480, padding: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <LvlLogo size={22}/>
          <div style={{ flex: 1, height: 3, borderRadius: 999, background: "rgba(244,231,197,0.08)" }}>
            <div style={{ height: "100%", borderRadius: 999, background: "linear-gradient(90deg, var(--quest-gold-lo), var(--quest-gold-hi))", width: `${((step + 1) / QUESTIONS.length) * 100}%`, transition: "width .3s" }}/>
          </div>
          <span style={{ fontSize: 11, color: "var(--text-low)" }}>{step + 1}/{QUESTIONS.length}</span>
        </div>
        <h2 style={{ fontSize: 26, marginBottom: 24, lineHeight: 1.2 }}>{cur.t}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {cur.opts.map((o, i) => (
            <button key={i} onClick={() => choose(i)} className="lo-card" style={{
              padding: "14px 18px", textAlign: "left", fontSize: 14, cursor: "pointer",
              color: "var(--text-hi)", transition: "background .12s, border-color .12s",
              border: answers[cur.id] === i ? "1px solid var(--quest-gold)" : undefined,
              background: answers[cur.id] === i ? "rgba(214,168,79,0.10)" : undefined,
            }}>
              {o}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
