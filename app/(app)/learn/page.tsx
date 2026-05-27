"use client";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { TopBar } from "@/components/layout/AppShell";
import { MODULES, LESSONS, MODULE_REQ } from "@/data/modules";
import type { ModuleLevel } from "@/types/learning";

const LEVEL_CONFIG: Record<ModuleLevel, { label: string; icon: string; desc: string; color: string }> = {
  principiante: { label: "Principiante", icon: "★", desc: "Para jugadores nuevos. Reglas básicas, tu personaje y tu primera sesión.", color: "var(--moss-green)" },
  intermedio:   { label: "Intermedio",   icon: "★★", desc: "Para jugadores con experiencia. Táctica, personalización y objetos mágicos.", color: "var(--arcane-blue-hi)" },
  veterano:     { label: "Veterano",     icon: "★★★", desc: "Para DMs y veteranos. Creación de mundos, homebrew y dirección de juego.", color: "var(--quest-gold)" },
};

const LEVEL_ORDER: ModuleLevel[] = ["principiante", "intermedio", "veterano"];

export default function LearnPage() {
  const { state } = useApp();
  const router = useRouter();

  const isUnlocked = (moduleId: string): boolean => {
    const reqs = MODULE_REQ[moduleId] ?? [];
    return reqs.every(req => (state.progress[req]?.pct ?? 0) >= 100);
  };

  const getModuleStatus = (moduleId: string) => {
    const pct = state.progress[moduleId]?.pct ?? 0;
    if (!isUnlocked(moduleId)) return "locked";
    if (pct >= 100) return "completed";
    if (pct > 0) return "in_progress";
    return "not_started";
  };

  const getFirstLesson = (moduleId: string): string => {
    const lessons = LESSONS[moduleId] ?? [];
    const completed = state.progress[moduleId]?.completedLessons ?? [];
    const next = lessons.find(l => !completed.includes(l.id));
    return (next ?? lessons[0])?.id ?? "l1";
  };

  const grouped = LEVEL_ORDER.map(level => ({
    level,
    config: LEVEL_CONFIG[level],
    modules: MODULES.filter(m => m.level === level),
  }));

  const LEVEL_BADGE: Record<string, { label: string; color: string }> = {
    principiante: { label: "Principiante", color: "var(--moss-green)" },
    intermedio: { label: "Intermedio", color: "var(--arcane-blue-hi)" },
    veterano: { label: "Veterano", color: "var(--quest-gold)" },
  };

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["Aprender"]} />

      <div className="lo-page-pad" style={{ padding: "24px 32px 0", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, lineHeight: 1.1, marginBottom: 6 }}>Sistema educativo</h1>
          <p style={{ fontSize: 14, color: "var(--text-low)", lineHeight: 1.5 }}>
            Aprende D&D a tu ritmo. Los módulos están organizados por nivel: empieza por Principiante y avanza hasta Veterano.
          </p>
        </div>

        {grouped.map(({ level, config, modules }) => (
          <div key={level} style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: config.color, fontWeight: 700, letterSpacing: "0.06em" }}>
                {config.icon}
              </span>
              <h2 style={{ fontSize: 18, margin: 0, color: config.color }}>{config.label}</h2>
              <span style={{ fontSize: 12, color: "var(--text-low)", marginLeft: "auto" }}>
                {modules.length} {modules.length === 1 ? "módulo" : "módulos"}
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--text-mid)", margin: "0 0 14px", lineHeight: 1.4 }}>
              {config.desc}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {modules.map(mod => {
                const status = getModuleStatus(mod.id);
                const pct = state.progress[mod.id]?.pct ?? 0;
                const locked = status === "locked";
                const done = status === "completed";
                const lessonCount = (LESSONS[mod.id] ?? []).length;
                const badge = LEVEL_BADGE[mod.level];

                return (
                  <div
                    key={mod.id}
                    className="lo-card-elev"
                    style={{
                      padding: "18px 22px",
                      opacity: locked ? 0.45 : 1,
                      cursor: locked ? "default" : "pointer",
                      border: done ? "1px solid rgba(214,168,79,0.35)" : "1px solid var(--line-strong)",
                      transition: "border-color 0.2s",
                    }}
                    onClick={() => !locked && router.push(`/learn/${mod.id}/${getFirstLesson(mod.id)}`)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                        background: done
                          ? "linear-gradient(135deg,var(--quest-gold-lo),var(--quest-gold))"
                          : locked
                            ? "rgba(244,231,197,0.04)"
                            : "linear-gradient(135deg,var(--arcane-blue),#3a5a9a)",
                        display: "grid", placeItems: "center",
                        fontSize: 16, color: "white",
                        border: locked ? "1px solid var(--line-strong)" : "none",
                        opacity: locked ? 0.7 : 1,
                      }}>
                        {locked ? "🔒" : done ? "✓" : "►"}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                          <span style={{ fontSize: 15, fontWeight: 600, color: done ? "var(--quest-gold-hi)" : "var(--text)" }}>
                            {mod.title}
                          </span>
                          <span className="lo-chip" style={{
                            fontSize: 9, padding: "1px 7px", borderRadius: 999,
                            background: badge.color + "18",
                            color: badge.color,
                            border: `1px solid ${badge.color}44`,
                          }}>
                            {badge.label}
                          </span>
                        </div>
                        <div style={{ fontSize: 12.5, color: "var(--text-mid)", marginBottom: 8 }}>{mod.short}</div>

                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ flex: 1, height: 3, borderRadius: 999, background: "rgba(244,231,197,0.08)" }}>
                            <div style={{
                              height: 3, borderRadius: 999,
                              background: done ? "var(--quest-gold)" : badge.color,
                              width: `${pct}%`,
                              transition: "width 0.4s",
                            }} />
                          </div>
                          <span style={{ fontSize: 10, color: "var(--text-low)", whiteSpace: "nowrap" }}>
                            {mod.time} · {lessonCount} {lessonCount === 1 ? "lección" : "lecciones"}
                          </span>
                        </div>
                      </div>

                      {!locked && (
                        <div style={{
                          padding: "6px 16px", borderRadius: 8, fontSize: 12.5, fontWeight: 600,
                          background: done ? "rgba(214,168,79,0.08)" : "rgba(92,122,184,0.12)",
                          color: done ? "var(--quest-gold-hi)" : badge.color,
                          border: `1px solid ${done ? "rgba(214,168,79,0.25)" : `${badge.color}44`}`,
                          whiteSpace: "nowrap",
                        }}>
                          {done ? "Repasar" : pct > 0 ? "Continuar →" : "Empezar →"}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
