"use client";
import { Ico } from "@/components/ui/icons";
import { ACHIEVEMENT_DEFS } from "@/data/achievements";
import type { Achievement, BadgeType } from "@/types/gamification";

interface Props {
  achievements: Achievement[];
  showEmpty?: boolean;
}

const BADGE_ICONS: Record<string, string> = {
  scroll: "scroll", book: "book", sparkles: "sparkles", trophy: "trophy",
  users: "users", crown: "crown", compass: "compass", star: "star",
};

export function BadgeGrid({ achievements, showEmpty = false }: Props) {
  const earned = new Set(achievements.map(a => a.type));

  const allBadges = Object.entries(ACHIEVEMENT_DEFS) as [BadgeType, typeof ACHIEVEMENT_DEFS[BadgeType]][];
  const display = showEmpty ? allBadges : allBadges.filter(([type]) => earned.has(type));

  if (display.length === 0) {
    return (
      <div style={{ color: "var(--text-low)", fontSize: 13, padding: "16px 0" }}>
        Sin logros todavía. ¡Empieza a jugar!
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {allBadges.map(([type, def]) => {
        const has = earned.has(type);
        if (!showEmpty && !has) return null;
        return (
          <div
            key={type}
            title={`${def.label} — ${def.description}\n+${def.xpReward} XP`}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
              padding: "10px 12px", borderRadius: 10, minWidth: 70, cursor: "default",
              background: has ? "rgba(214,168,79,0.1)" : "rgba(255,255,255,0.03)",
              border: has ? "1px solid rgba(214,168,79,0.25)" : "1px solid rgba(255,255,255,0.06)",
              opacity: has ? 1 : 0.35,
              transition: "opacity .15s",
            }}
          >
            <Ico
              name={BADGE_ICONS[def.icon] ?? "star"}
              size={20}
              color={has ? "var(--quest-gold-hi)" : "var(--text-low)"}
            />
            <span style={{ fontSize: 10, color: has ? "var(--text-mid)" : "var(--text-low)", textAlign: "center", lineHeight: 1.3 }}>
              {def.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
