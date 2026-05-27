"use client";
import { useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { CONDITION_TYPES, CONDITION_LABEL, CONDITION_COLOR, CONDITION_ICON } from "@/types/combat";
import type { ConditionType } from "@/types/combat";

interface ConditionDetail {
  effect: string;
  mechanical: string[];
  causes: string;
  endsWhen: string;
}

const CONDITION_DATA: Record<ConditionType, ConditionDetail> = {
  blinded: {
    effect: "No puedes ver. Tus ataques y tiradas de salvación sufren penalizaciones severas.",
    mechanical: [
      "Pierdes las tiradas de ataque (con desventaja)",
      "Los ataques contra ti tienen ventaja",
      "Fallas automáticamente las pruebas que requieren vista",
    ],
    causes: "Hechizos: Oscuridad, Ceguera/Sordera. Venenos, arena en los ojos, magia de ilusión.",
    endsWhen: "Al restaurar la vista (curar magia, terminar el efecto que la causó).",
  },
  charmed: {
    effect: "Ves al causante como un amigo querido. No puedes atacarlo y él tiene ventaja para interactuar contigo.",
    mechanical: [
      "No puedes atacar ni usar habilidades dañinas contra quien te hechizó",
      "El causante tiene ventaja en pruebas de Carisma contra ti",
    ],
    causes: "Hechizos: Encantar persona, Sugestión, Dominar persona. Feromonas de hadas, canciones de bardos.",
    endsWhen: "Al terminar el hechizo o cuando el causante te daña.",
  },
  deafened: {
    effect: "No puedes escuchar. Los hechizos con componente verbal son difíciles de detectar.",
    mechanical: [
      "Fallas automáticamente las pruebas que requieren oído",
      "No puedes escuchar comunicación verbal",
    ],
    causes: "Hechizos: Ceguera/Sordera. Explosiones cercanas, algunos venenos.",
    endsWhen: "Al restaurar el oído o terminar el efecto que la causó.",
  },
  exhaustion: {
    effect: "Acumulás niveles de cansancio (1–6). Cada nivel impone penalizaciones mayores hasta la muerte.",
    mechanical: [
      "Nv 1: Desventaja en pruebas de característica",
      "Nv 2: Velocidad reducida a la mitad",
      "Nv 3: Desventaja en ataques y tiradas de salvación",
      "Nv 4: HP máximos reducidos a la mitad",
      "Nv 5: Velocidad reducida a 0",
      "Nv 6: Muerte",
    ],
    causes: "Viajar sin descanso, aguantar hambre/sed, algunos monstruos (Succubus, Shadow), hechizos.",
    endsWhen: "Cada descanso largo elimina 1 nivel. Curación como Restauración mayor elimina todos.",
  },
  frightened: {
    effect: "Tenés miedo de la fuente. No podés acercarte voluntariamente y sufres desventaja en su presencia.",
    mechanical: [
      "Desventaja en pruebas de característica y ataques mientras la fuente esté en tu línea de visión",
      "No podés moverte voluntariamente hacia la fuente del miedo",
    ],
    causes: "Rugido del Dragón, hechizo Causar miedo, mirada de la Medusa, rasgo Presencia aterradora.",
    endsWhen: "Al perder la línea de visión con la fuente, o al terminar el efecto.",
  },
  grappled: {
    effect: "Alguien te tiene agarrado. Tu velocidad cae a 0.",
    mechanical: [
      "Velocidad reducida a 0",
      "La condición termina si el agarrador queda incapacitado",
      "Puedes intentar escapar con Atletismo o Acrobacias (CD = prueba de Atletismo del agarrador)",
    ],
    causes: "Acción Agarrar (Atletismo vs Atletismo/Acrobacias). Tentáculos de monstruos, hechizos de atadura.",
    endsWhen: "Al escapar con éxito, si el agarrador se aleja demasiado, o si queda incapacitado.",
  },
  incapacitated: {
    effect: "No podés hacer acciones ni reacciones.",
    mechanical: [
      "Sin acciones ni reacciones en tu turno",
    ],
    causes: "Componente de varias condiciones (paralizado, aturdido, inconsciente). Hechizo Tasha's Risa.",
    endsWhen: "Al terminar el efecto que la causó.",
  },
  invisible: {
    effect: "Sos invisible a simple vista. Ventaja en ataques, desventaja de tus enemigos para atacarte.",
    mechanical: [
      "Imposible de ver sin magia o sentidos especiales",
      "Ventaja en todas tus tiradas de ataque",
      "Los ataques contra vos tienen desventaja",
      "Seguís haciendo ruido y dejando rastros",
    ],
    causes: "Hechizos: Invisibilidad, Invisibilidad superior. Rasgo Paso élfico, algunos objetos mágicos.",
    endsWhen: "Al atacar, lanzar un hechizo (invisibilidad básica), o terminar la duración.",
  },
  paralyzed: {
    effect: "Completamente inmóvil e incapaz de actuar. Los golpes cuerpo a cuerpo son automáticamente críticos.",
    mechanical: [
      "Incapacitado (sin acciones ni reacciones)",
      "No te podés mover ni hablar",
      "Fallas automáticamente tiradas de salvación de FUE y DES",
      "Los ataques contra vos tienen ventaja",
      "Cualquier ataque cuerpo a cuerpo que impacte es un crítico automático",
    ],
    causes: "Hechizos: Paralizar persona/monstruo. Veneno de Ghoul. Mirada de Basilisco.",
    endsWhen: "Al terminar la duración del hechizo o efecto. Curar veneno si aplica.",
  },
  petrified: {
    effect: "Te convertís en piedra. Resistencia a todo el daño, pero completamente indefenso.",
    mechanical: [
      "Transformado en piedra con todos los objetos que portabas",
      "Incapacitado, sin movimiento ni habla",
      "Resistencia a todo el daño",
      "Inmune a veneno y enfermedad (suspendido, no curado)",
      "Fallas automáticamente FUE y DES",
      "Los ataques tienen ventaja contra vos",
    ],
    causes: "Mirada de Medusa, Cocatriz, Basilisco. Hechizo Carne a piedra.",
    endsWhen: "Hechizo Revertir piedra a carne o Deseo.",
  },
  poisoned: {
    effect: "El veneno afecta tus acciones. Desventaja en ataques y pruebas de característica.",
    mechanical: [
      "Desventaja en tiradas de ataque",
      "Desventaja en pruebas de característica",
    ],
    causes: "Veneno de serpiente/araña, armas envenenadas, hechizos de veneno, comida/bebida contaminada.",
    endsWhen: "Hechizo Curar veneno, al terminar la duración del veneno, o descanso largo (algunos venenos).",
  },
  prone: {
    effect: "Estás en el suelo. Los ataques cuerpo a cuerpo tienen ventaja contra vos; los a distancia, desventaja.",
    mechanical: [
      "Desventaja en tiradas de ataque",
      "Los ataques cuerpo a cuerpo tienen ventaja contra vos",
      "Los ataques a distancia tienen desventaja contra vos",
      "Levantarse cuesta la mitad de tu velocidad",
    ],
    causes: "Ser empujado (acción Embestir), hechizos de golpe, caídas, algunos ataques de monstruos.",
    endsWhen: "Al levantarte (costar la mitad de tu velocidad).",
  },
  restrained: {
    effect: "Quedás atrapado en el lugar. Velocidad 0 y penalizaciones en combate.",
    mechanical: [
      "Velocidad reducida a 0",
      "Desventaja en tiradas de ataque",
      "Los ataques contra vos tienen ventaja",
      "Desventaja en tiradas de salvación de DES",
    ],
    causes: "Telaraña (hechizo y monstruo araña), Apresamiento de planta, Atar, esposas mágicas.",
    endsWhen: "Al liberarse del efecto que restringe (romper la telaraña, escapar de las ataduras).",
  },
  stunned: {
    effect: "Quedás aturdido. Incapacitado, sin movimiento y vulnerable a ataques.",
    mechanical: [
      "Incapacitado (sin acciones ni reacciones)",
      "No te podés mover",
      "Solo podés hablar con dificultad",
      "Fallas automáticamente FUE y DES",
      "Los ataques tienen ventaja contra vos",
    ],
    causes: "Golpe de Monjes (Ataque impactante), hechizos. Algunos monstruos como Mindflayers.",
    endsWhen: "Al terminar la duración del efecto.",
  },
  unconscious: {
    effect: "Inconsciente y en el suelo. Los ataques cuerpo a cuerpo que impacten son críticos automáticos.",
    mechanical: [
      "Incapacitado, sin movimiento ni habla",
      "No sos consciente de tu entorno",
      "Caes al suelo (condición: derribado)",
      "Fallas automáticamente FUE y DES",
      "Los ataques tienen ventaja contra vos",
      "Los ataques cuerpo a cuerpo a 5 pies que impacten son críticos automáticos",
    ],
    causes: "HP a 0 (muerte o estabilización), hechizos como Sueño o Dormir.",
    endsWhen: "Al recuperar HP, al ser estabilizado y descansar, o al terminar la magia.",
  },
};

export default function ConditionsPage() {
  const [selected, setSelected] = useState<ConditionType | null>(null);

  const active = selected ? CONDITION_DATA[selected] : null;

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 80px" }}>
      <TopBar crumb={["LVL ONE", "Enciclopedia", "Condiciones"]} />

      <div style={{ padding: "24px 32px 0", maxWidth: 1000, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <Link href="/encyclopedia" className="lo-btn lo-btn-ghost" style={{ padding: "6px 10px" }}>
            <Ico name="arrowLeft" size={14} />
          </Link>
          <div>
            <h1 style={{ fontSize: 22, margin: 0 }}>Condiciones de Combate</h1>
            <p style={{ fontSize: 12, color: "var(--text-low)", margin: 0 }}>
              {CONDITION_TYPES.length} condiciones — efectos mecánicos y cómo terminarlas
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1fr" : "1fr", gap: 20 }}>
          {/* Grid de condiciones */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10, alignContent: "start" }}>
            {CONDITION_TYPES.map(ct => {
              const isActive = selected === ct;
              return (
                <button
                  key={ct}
                  onClick={() => setSelected(isActive ? null : ct)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    padding: "16px 12px",
                    background: isActive ? `${CONDITION_COLOR[ct]}18` : "var(--surface-low)",
                    border: `1px solid ${isActive ? CONDITION_COLOR[ct] : "var(--line)"}`,
                    borderRadius: 10,
                    cursor: "pointer",
                    transition: "border-color .15s, background .15s",
                    textAlign: "center",
                  }}
                >
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: `${CONDITION_COLOR[ct]}22`,
                    display: "grid",
                    placeItems: "center",
                    color: CONDITION_COLOR[ct],
                    flexShrink: 0,
                  }}>
                    <Ico name={CONDITION_ICON[ct] as Parameters<typeof Ico>[0]["name"]} size={18} color={CONDITION_COLOR[ct]} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: isActive ? CONDITION_COLOR[ct] : "var(--text-hi)", lineHeight: 1.2 }}>
                    {CONDITION_LABEL[ct]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Panel de detalle */}
          {selected && active && (
            <div className="lo-card" style={{ padding: "20px 22px", alignSelf: "start", borderColor: CONDITION_COLOR[selected] }}>
              {/* Title */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: `${CONDITION_COLOR[selected]}22`,
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}>
                  <Ico name={CONDITION_ICON[selected] as Parameters<typeof Ico>[0]["name"]} size={22} color={CONDITION_COLOR[selected]} />
                </div>
                <div>
                  <h2 style={{ fontSize: 20, margin: 0, color: CONDITION_COLOR[selected] }}>{CONDITION_LABEL[selected]}</h2>
                  <p style={{ fontSize: 12, color: "var(--text-low)", margin: 0, textTransform: "capitalize" }}>{selected}</p>
                </div>
              </div>

              {/* Efecto */}
              <p style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.6, marginBottom: 16 }}>
                {active.effect}
              </p>

              {/* Efectos mecánicos */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>
                  Efectos mecánicos
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                  {active.mechanical.map((m, i) => (
                    <li key={i} style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.5 }}>{m}</li>
                  ))}
                </ul>
              </div>

              {/* Causas */}
              <div style={{ marginBottom: 12, padding: "10px 12px", background: "var(--surface-mid)", borderRadius: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>
                  Causas comunes
                </div>
                <p style={{ fontSize: 12, color: "var(--text-mid)", margin: 0, lineHeight: 1.5 }}>{active.causes}</p>
              </div>

              {/* Termina cuando */}
              <div style={{ padding: "10px 12px", background: `${CONDITION_COLOR[selected]}0d`, borderRadius: 8, borderLeft: `3px solid ${CONDITION_COLOR[selected]}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: CONDITION_COLOR[selected], textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>
                  Termina cuando
                </div>
                <p style={{ fontSize: 12, color: "var(--text-mid)", margin: 0, lineHeight: 1.5 }}>{active.endsWhen}</p>
              </div>
            </div>
          )}
        </div>

        {!selected && (
          <p style={{ fontSize: 12, color: "var(--text-low)", marginTop: 16, textAlign: "center" }}>
            Seleccioná una condición para ver sus efectos mecánicos.
          </p>
        )}
      </div>
    </main>
  );
}
