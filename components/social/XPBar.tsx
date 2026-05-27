"use client";
import { useEffect, useState } from "react";
import { xpToLevel } from "@/types/gamification";

interface XPData {
  total: number;
  level: number;
}

interface Props {
  compact?: boolean;
}

export function XPBar({ compact = false }: Props) {
  const [xp, setXp] = useState<XPData | null>(null);

  useEffect(() => {
    fetch("/api/xp")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.total != null) {
          setXp({ total: d.total, level: xpToLevel(d.total) });
        }
      })
      .catch(() => {});
  }, []);

  if (!xp) return null;

  const currentLevelXP = (xp.level - 1) * 500;
  const nextLevelXP = xp.level * 500;
  const progress = Math.min(((xp.total - currentLevelXP) / 500) * 100, 100);

  if (compact) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{
          fontSize: 10, fontWeight: 700, color: "var(--quest-gold-hi)",
          background: "rgba(214,168,79,0.15)", borderRadius: 4,
          padding: "2px 5px", letterSpacing: "0.05em",
        }}>
          Nv {xp.level}
        </div>
        <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, minWidth: 50 }}>
          <div style={{ width: `${progress}%`, height: "100%", background: "var(--quest-gold-hi)", borderRadius: 2, transition: "width .4s" }}/>
        </div>
        <div style={{ fontSize: 10, color: "var(--text-low)" }}>{xp.total} XP</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-hi)" }}>Nivel {xp.level}</div>
        <div style={{ fontSize: 11, color: "var(--text-low)" }}>{xp.total} / {nextLevelXP} XP</div>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3 }}>
        <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, var(--quest-gold-lo), var(--quest-gold-hi))", borderRadius: 3, transition: "width .4s" }}/>
      </div>
      <div style={{ fontSize: 10, color: "var(--text-low)", marginTop: 4 }}>
        {nextLevelXP - xp.total} XP para nivel {xp.level + 1}
      </div>
    </div>
  );
}
