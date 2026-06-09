"use client";
import { useState, useMemo } from "react";
import { WizardShell } from "../WizardShell";
import { LivePreview } from "../LivePreview";
import { startingEquipmentForClass, EQUIPMENT_ITEMS } from "@/data/equipment";
import { CLASSES } from "@/data/classes";
import { Ico } from "@/components/ui/icons";
import type { CharacterDraft, EquipmentChoice } from "@/types/character";

function iconFor(id: string): string {
  const cat = EQUIPMENT_ITEMS.find(e => e.id === id)?.category;
  if (!cat) return "bolt";
  if (cat === "armor" || cat === "shield") return "shield";
  if (cat === "weapon") return "sword";
  if (cat === "focus" || cat === "tool") return "sparkle";
  return "bolt";
}

function nameFor(id: string): string {
  return EQUIPMENT_ITEMS.find(e => e.id === id)?.name ?? id;
}

export function Step6Equipment({ draft, id }: { draft: CharacterDraft; id: string }) {
  const cls = CLASSES.find(c => c.id === draft.classId);
  const eq = draft.classId ? startingEquipmentForClass(draft.classId) : undefined;

  const { mandatory, choiceDefaults, canUse } = useMemo(() => {
    const canUse = (itemId: string, choice: EquipmentChoice): boolean => {
      if (!choice.requires || !choice.requires[itemId]) return true;
      return choice.requires[itemId].includes(draft.subclassId ?? "");
    };
    if (!eq) return { mandatory: [], choiceDefaults: {} as Record<number, string>, canUse };
    const inChoices = new Set(eq.choices.flatMap(c => c.from));
    const mandatory = eq.beginnerLoadout.filter(item => !inChoices.has(item));
    const choiceDefaults: Record<number, string> = {};
    const taken = new Set<string>();
    eq.choices.forEach((choice, ci) => {
      const found = eq.beginnerLoadout.find(item => choice.from.includes(item) && !taken.has(item) && canUse(item, choice));
      choiceDefaults[ci] = found ?? choice.from.find(item => canUse(item, choice)) ?? choice.from[0];
      if (found) taken.add(found);
    });
    return { mandatory, choiceDefaults, canUse };
  }, [eq, draft.subclassId]);

  const [selections, setSelections] = useState<Record<number, string>>(() => choiceDefaults);

  if (!eq) {
    return (
      <WizardShell id={id} step={6} title="Equipo inicial"
        sub="Este equipo lo obtienes gratis al comenzar."
        preview={<LivePreview draft={draft} currentStep={6}/>} canProceed>
        <div style={{ maxWidth: 640 }}>
          <div style={{ padding: 24, textAlign: "center", color: "var(--text-low)", fontSize: 13 }}>
            Selecciona una clase primero para ver el equipo inicial.
          </div>
        </div>
      </WizardShell>
    );
  }

  return (
    <WizardShell id={id} step={6} title="Equipo inicial"
      sub="Elige una opción de cada grupo. El resto del equipo es fijo."
      preview={<LivePreview draft={draft} currentStep={6}/>} canProceed>

      <div style={{ maxWidth: 640 }}>
        <div className="lo-label" style={{ marginBottom: 16 }}>
          Equipo de {cls?.name ?? "tu clase"}
        </div>

        {/* Choice groups */}
        {eq.choices.map((choice, ci) => (
          <div key={ci} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "var(--text-low)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <Ico name="arrow" size={10} color="var(--quest-gold-hi)"/>
              Elige {choice.choose} de {choice.from.length}
              {choice.note && <span style={{ color: "var(--text-mid)" }}>— {choice.note}</span>}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {choice.from.map(optId => {
                const active = selections[ci] === optId;
                const usable = canUse(optId, choice);
                return (
                  <button type="button" key={optId} onClick={() => {
                    if (usable) setSelections(prev => ({ ...prev, [ci]: optId }));
                  }} style={{
                    padding: "8px 14px", borderRadius: 8, cursor: usable ? "pointer" : "not-allowed", fontSize: 12,
                    border: active ? "1px solid var(--quest-gold-hi)" : usable ? "1px solid var(--line-strong)" : "1px dashed rgba(200,100,100,0.25)",
                    background: active ? "rgba(214,168,79,0.1)" : usable ? "transparent" : "rgba(200,100,100,0.04)",
                    color: active ? "var(--quest-gold-hi)" : usable ? "var(--text-mid)" : "rgba(200,100,100,0.5)",
                    fontWeight: active ? 600 : 400,
                    display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s",
                    opacity: usable ? 1 : 0.5,
                    position: "relative" as const,
                  }}
                  title={!usable ? "Requiere un dominio específico (elige el dominio antes en el paso de subclase)" : undefined}
                  >
                    <div style={{ width: 16, height: 16, borderRadius: "50%",
                      border: active ? "4px solid var(--quest-gold-hi)" : usable ? "2px solid var(--line-strong)" : "2px dashed rgba(200,100,100,0.3)",
                      transition: "all 0.15s" }} />
                    <span>{nameFor(optId)}</span>
                    {!usable && <span style={{ fontSize: 8, color: "rgba(200,100,100,0.5)", fontFamily: "Arial", textTransform: "uppercase", letterSpacing: "0.08em" }}>bloqueado</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Mandatory items */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "var(--text-low)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <Ico name="shield" size={10} color="var(--moss-green)"/>
            Equipo fijo
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {mandatory.map((itemId, idx) => (
              <div key={`${itemId}-${idx}`} style={{
                padding: "8px 14px", borderRadius: 8, fontSize: 12,
                border: "1px solid rgba(100,180,100,0.2)",
                background: "rgba(100,180,100,0.06)",
                color: "var(--text-hi)",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <Ico name={iconFor(itemId)} size={14} color="var(--moss-green)"/>
                {nameFor(itemId)}
                <span style={{ fontSize: 10, color: "var(--moss-green)", fontWeight: 500 }}>fijo</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lo-card-elev" style={{ padding: 14, marginTop: 12 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <Ico name="sparkle" size={14} color="var(--arcane-blue)"/>
            <p style={{ fontSize: 12, color: "var(--text-mid)", lineHeight: 1.5, margin: 0 }}>
              En M3 podrás gestionar tu inventario completo, añadir oro, comprar equipo y marcar objetos equipados.
            </p>
          </div>
        </div>
      </div>
    </WizardShell>
  );
}
