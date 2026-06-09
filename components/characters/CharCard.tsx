"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { uid } from "@/lib/uid";
import { createCharacter, deleteCharacter as apiDeleteCharacter } from "@/lib/character-api";
import { Ico } from "@/components/ui/icons";
import { RACES } from "@/data/races";
import { CLASSES } from "@/data/classes";
import type { CharacterDraft } from "@/types/character";

function formatAgo(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 60) return `hace ${m || 1} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

export function CharCard({ character, compact }: { character: CharacterDraft; compact?: boolean }) {
  const router = useRouter();
  const { dispatch } = useApp();
  const race = RACES.find(r => r.id === character.raceId);
  const cls = CLASSES.find(c => c.id === character.classId);
  const isDraft = character.status === "draft";
  const [busy, setBusy] = useState(false);

  const open = () => {
    if (isDraft) {
      dispatch({ type: "DRAFT_INIT", draft: character });
      router.push(`/characters/${character.id}/edit/1`);
    } else {
      router.push(`/characters/${character.id}`);
    }
  };

  const del = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (busy || !confirm(`¿Eliminar a ${character.name || "este personaje"}?`)) return;
    setBusy(true);
    try {
      await apiDeleteCharacter(character.id);
      dispatch({ type: "CHARACTER_DELETE", id: character.id });
    } catch {
      dispatch({ type: "TOAST", toast: "Error al eliminar" });
    } finally {
      setBusy(false);
    }
  };

  const dup = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (busy) return;
    const src = character;
    if (!src || src.status !== "ready") {
      dispatch({ type: "TOAST", toast: "Solo se pueden duplicar personajes completados" });
      return;
    }
    setBusy(true);
    try {
      const copy: CharacterDraft = {
        ...src,
        id: uid(),
        name: src.name + " (copia)",
        status: "draft",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const saved = await createCharacter(copy);
      dispatch({ type: "CHARACTER_SAVE", character: saved });
    } catch {
      dispatch({ type: "TOAST", toast: "Error al duplicar" });
    } finally {
      setBusy(false);
    }
  };

  const avatarSize = compact ? 40 : 48;
  const fontSize = compact ? 16 : 17;

  return (
    <div className="lo-card-elev" style={{ padding: compact ? 18 : 20, display: "flex", flexDirection: "column", gap: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: compact ? 12 : 14 }}>
        <span className={`lo-chip ${isDraft ? "" : "lo-chip-green"}`}>{isDraft ? "Borrador" : "Listo"}</span>
        <span style={{ fontSize: 11, color: "var(--text-low)" }}>{formatAgo(character.updatedAt)}</span>
      </div>
      <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: compact ? 14 : 16 }}>
        <div style={{ width: avatarSize, height: avatarSize, borderRadius: compact ? 10 : 12,
          background: "linear-gradient(135deg,var(--arcane-blue),var(--quest-gold-lo))",
          display: "grid", placeItems: "center", fontFamily: "var(--font-display)",
          fontSize: compact ? 18 : 22, color: "white", flexShrink: 0 }}>
          {(character.name?.[0] ?? "?").toUpperCase()}
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize, color: "var(--text-hi)", marginBottom: 2 }}>
            {character.name || "Sin nombre"}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-mid)" }}>
            {race?.name ?? "—"} · {cls?.name ?? "—"} · Nv.{character.level}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" className="lo-btn lo-btn-primary" onClick={open} style={{ flex: 1, justifyContent: "center", padding: "8px 0", fontSize: 13 }}>
          {isDraft ? "Continuar" : "Ver ficha"} <Ico name="arrow" size={13}/>
        </button>
        <button type="button" className="lo-btn lo-btn-ghost" onClick={dup} style={{ padding: "8px 10px" }} title="Duplicar" aria-label="Duplicar personaje">
          <Ico name="plus" size={13}/>
        </button>
        <button type="button" className="lo-btn lo-btn-ghost" onClick={del} style={{ padding: "8px 10px", color: "var(--text-low)" }} title="Eliminar" aria-label="Eliminar personaje">
          <Ico name="close" size={13}/>
        </button>
      </div>
    </div>
  );
}
