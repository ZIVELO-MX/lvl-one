"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { TopBar } from "@/components/layout/AppShell";
import { MODULES, LESSONS } from "@/data/modules";

interface Props { params: Promise<{ moduleId: string; lessonId: string }> }

function D20({ onRoll }: { onRoll: (n: number) => void }) {
  const [val, setVal] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    let ticks = 0;
    const interval = setInterval(() => {
      const n = Math.floor(Math.random() * 20) + 1;
      setVal(n);
      ticks++;
      if (ticks >= 10) {
        clearInterval(interval);
        setRolling(false);
        onRoll(n);
      }
    }, 60);
  };

  const color = val === null ? "var(--text-low)"
    : val >= 18 ? "var(--moss-green)"
    : val >= 10 ? "var(--quest-gold-hi)"
    : "var(--dragon-red)";

  return (
    <div style={{ textAlign: "center" }}>
      <button
        onClick={roll}
        style={{
          width: 96, height: 96, borderRadius: "50%", cursor: "pointer",
          border: "3px solid var(--arcane-blue)",
          background: rolling ? "rgba(92,122,184,0.2)" : "rgba(92,122,184,0.08)",
          display: "grid", placeItems: "center",
          transition: "all 0.15s",
        }}
      >
        <span style={{ fontFamily: "var(--font-display)", fontSize: 36, color, lineHeight: 1 }}>
          {val ?? "?"}
        </span>
      </button>
      <div style={{ fontSize: 11, color: "var(--text-low)", marginTop: 8 }}>
        {rolling ? "Tirando…" : val === null ? "Click para tirar d20" : val >= 18 ? "¡Crítico!" : val === 1 ? "Pifia" : `Resultado: ${val}`}
      </div>
    </div>
  );
}

export default function LessonPage({ params }: Props) {
  const { moduleId, lessonId } = use(params);
  const { state, dispatch } = useApp();
  const router = useRouter();

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [d20Result, setD20Result] = useState<number | null>(null);

  const mod = MODULES.find(m => m.id === moduleId);
  const lessons = LESSONS[moduleId] ?? [];
  const lessonIdx = lessons.findIndex(l => l.id === lessonId);
  const lesson = lessons[lessonIdx];

  if (!mod || !lesson) {
    router.replace("/learn");
    return null;
  }

  const completed = state.progress[moduleId]?.completedLessons ?? [];
  const isCompleted = completed.includes(lessonId);
  const prevLesson = lessonIdx > 0 ? lessons[lessonIdx - 1] : null;
  const nextLesson = lessonIdx < lessons.length - 1 ? lessons[lessonIdx + 1] : null;

  const allModuleIdx = MODULES.findIndex(m => m.id === moduleId);
  const nextModule = allModuleIdx < MODULES.length - 1 ? MODULES[allModuleIdx + 1] : null;

  const markComplete = () => {
    dispatch({ type: "LESSON_COMPLETE", moduleId, lessonId });
    if (nextLesson) {
      router.push(`/learn/${moduleId}/${nextLesson.id}`);
    } else if (nextModule) {
      router.push(`/learn/${nextModule.id}/l1`);
    } else {
      router.push("/learn");
    }
  };

  const isCorrect = typeof lesson.activityAnswer === "number"
    ? selectedOption === lesson.activityAnswer
    : false;

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 80px" }}>
      <TopBar crumb={["Aprender", mod.title, lesson.title]} />

      <div className="lo-page-pad" style={{ padding: "24px 32px 0", maxWidth: 760, margin: "0 auto" }}>

        {/* Progress indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          {lessons.map((l, i) => (
            <div
              key={l.id}
              onClick={() => router.push(`/learn/${moduleId}/${l.id}`)}
              style={{
                height: 4, flex: 1, borderRadius: 999, cursor: "pointer",
                background: completed.includes(l.id)
                  ? "var(--quest-gold)"
                  : l.id === lessonId
                    ? "var(--arcane-blue)"
                    : "rgba(244,231,197,0.12)",
                transition: "background 0.3s",
              }}
              title={`Lección ${i + 1}: ${l.title}`}
            />
          ))}
          <span style={{ fontSize: 11, color: "var(--text-low)", whiteSpace: "nowrap", marginLeft: 4 }}>
            {lessonIdx + 1}/{lessons.length}
          </span>
        </div>

        {/* Lesson header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: "var(--arcane-blue-hi)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
            {mod.title} · {lesson.time ?? ""}
          </div>
          <h1 style={{ fontSize: 26, lineHeight: 1.2, marginBottom: 0 }}>{lesson.title}</h1>
        </div>

        {/* Hook */}
        {lesson.hook && (
          <div style={{ padding: "14px 18px", borderRadius: 10, marginBottom: 20,
            background: "rgba(92,122,184,0.07)", borderLeft: "3px solid var(--arcane-blue)" }}>
            <p style={{ fontSize: 15, color: "var(--text)", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>
              {lesson.hook}
            </p>
          </div>
        )}

        {/* Core */}
        <div className="lo-card-elev" style={{ padding: 20, marginBottom: 16 }}>
          <div className="lo-label" style={{ marginBottom: 8 }}>Concepto clave</div>
          <p style={{ fontSize: 14, color: "var(--text-mid)", lineHeight: 1.7, margin: 0 }}>{lesson.core}</p>
        </div>

        {/* Explanation */}
        {lesson.explanation && (
          <div className="lo-card-elev" style={{ padding: 20, marginBottom: 16 }}>
            <div className="lo-label" style={{ marginBottom: 8 }}>Cómo funciona</div>
            <p style={{ fontSize: 14, color: "var(--text-mid)", lineHeight: 1.7, margin: 0 }}>{lesson.explanation}</p>
          </div>
        )}

        {/* Example */}
        <div className="lo-card-elev" style={{ padding: 20, marginBottom: 16,
          background: "rgba(214,168,79,0.04)", border: "1px solid rgba(214,168,79,0.18)" }}>
          <div className="lo-label" style={{ marginBottom: 8, color: "var(--quest-gold-hi)" }}>Ejemplo en mesa</div>
          <p style={{ fontSize: 14, color: "var(--text-mid)", lineHeight: 1.7, margin: 0 }}>{lesson.example}</p>
        </div>

        {/* Character application */}
        {lesson.characterApplication && (
          <div className="lo-card-elev" style={{ padding: 20, marginBottom: 20 }}>
            <div className="lo-label" style={{ marginBottom: 8 }}>En tu ficha</div>
            <p style={{ fontSize: 14, color: "var(--text-mid)", lineHeight: 1.7, margin: 0 }}>{lesson.characterApplication}</p>
          </div>
        )}

        {/* D20 Simulator */}
        <div className="lo-card-elev" style={{ padding: 24, marginBottom: 20, textAlign: "center" }}>
          <div className="lo-label" style={{ marginBottom: 16 }}>Simulador de d20</div>
          <D20 onRoll={setD20Result} />
          {d20Result !== null && (
            <p style={{ fontSize: 13, color: "var(--text-low)", marginTop: 12, lineHeight: 1.5 }}>
              {d20Result >= 18
                ? "¡Éxito crítico! El resultado supera casi cualquier dificultad."
                : d20Result >= 10
                  ? "Resultado sólido. Suma tu modificador para saber si superas la CD."
                  : "Resultado bajo. Puede que el modificador no sea suficiente."}
            </p>
          )}
        </div>

        {/* Activity */}
        {lesson.activityOptions && lesson.activityType === "quiz" && (
          <div className="lo-card-elev" style={{ padding: 20, marginBottom: 24 }}>
            <div className="lo-label" style={{ marginBottom: 12 }}>Actividad</div>
            <p style={{ fontSize: 14, color: "var(--text)", marginBottom: 14, lineHeight: 1.6 }}>{lesson.activity}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {lesson.activityOptions.map((opt, i) => {
                const isSelected = selectedOption === i;
                const showResult = submitted;
                const correct = i === lesson.activityAnswer;
                const bg = !showResult
                  ? isSelected ? "rgba(92,122,184,0.15)" : "rgba(244,231,197,0.03)"
                  : correct ? "rgba(76,175,80,0.12)" : isSelected ? "rgba(229,57,53,0.08)" : "rgba(244,231,197,0.03)";
                const border = !showResult
                  ? isSelected ? "1px solid var(--arcane-blue)" : "1px solid var(--line-strong)"
                  : correct ? "1px solid rgba(76,175,80,0.5)" : isSelected ? "1px solid rgba(229,57,53,0.4)" : "1px solid var(--line-strong)";

                return (
                  <button
                    key={i}
                    onClick={() => !submitted && setSelectedOption(i)}
                    style={{
                      padding: "11px 14px", borderRadius: 8, border, background: bg,
                      textAlign: "left", cursor: submitted ? "default" : "pointer",
                      fontSize: 13, color: "var(--text-mid)", lineHeight: 1.5,
                      transition: "all 0.15s",
                    }}
                  >
                    {opt}
                    {showResult && correct && <span style={{ marginLeft: 8, color: "var(--moss-green)" }}>✓</span>}
                  </button>
                );
              })}
            </div>
            {!submitted ? (
              <button
                className="lo-btn lo-btn-primary"
                style={{ marginTop: 14, fontSize: 13 }}
                disabled={selectedOption === null}
                onClick={() => setSubmitted(true)}
              >
                Comprobar
              </button>
            ) : (
              <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8,
                background: isCorrect ? "rgba(76,175,80,0.08)" : "rgba(229,57,53,0.06)",
                border: `1px solid ${isCorrect ? "rgba(76,175,80,0.3)" : "rgba(229,57,53,0.25)"}` }}>
                <p style={{ fontSize: 13, color: isCorrect ? "var(--moss-green)" : "var(--dragon-red)", margin: 0, lineHeight: 1.5 }}>
                  {isCorrect ? "¡Correcto! " : "No exactamente. "}
                  {lesson.unlockedSummary}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <button
            className="lo-btn lo-btn-ghost"
            style={{ fontSize: 13 }}
            onClick={() => prevLesson
              ? router.push(`/learn/${moduleId}/${prevLesson.id}`)
              : router.push("/learn")}
          >
            ← {prevLesson ? prevLesson.title : "Índice"}
          </button>

          {isCompleted ? (
            <button
              className="lo-btn lo-btn-ghost"
              style={{ fontSize: 13, color: "var(--quest-gold-hi)" }}
              onClick={() => nextLesson
                ? router.push(`/learn/${moduleId}/${nextLesson.id}`)
                : nextModule
                  ? router.push(`/learn/${nextModule.id}/l1`)
                  : router.push("/learn")}
            >
              {nextLesson ? `${nextLesson.title} →` : nextModule ? `${nextModule.title} →` : "Ver índice"}
            </button>
          ) : (
            <button className="lo-btn lo-btn-primary" style={{ fontSize: 13 }} onClick={markComplete}>
              Marcar como completado →
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
