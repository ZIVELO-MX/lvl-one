"use client";
import { useEffect, useState, useCallback } from "react";
import { Ico } from "@/components/ui/icons";
import type { ActivityEvent } from "@/types/social";

const ACTIVITY_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  character_created: { label: "creó un personaje", icon: "scroll", color: "var(--quest-gold-hi)" },
  campaign_created:  { label: "creó una campaña",  icon: "book",   color: "var(--arcane-blue)"   },
  session_played:    { label: "jugó una sesión",    icon: "d20",    color: "var(--nature-green)"   },
  level_up:          { label: "subió de nivel",     icon: "sparkles", color: "var(--quest-gold-hi)" },
  achievement_earned:{ label: "ganó un logro",      icon: "trophy", color: "var(--quest-gold-hi)"  },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

interface Props {
  limit?: number;
}

export function ActivityFeed({ limit = 20 }: Props) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/feed?limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events ?? data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[1,2,3].map(i => (
          <div key={i} className="lo-skeleton" style={{ height: 44, borderRadius: 8 }}/>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div style={{ padding: "24px 0", textAlign: "center", color: "var(--text-low)", fontSize: 13 }}>
        <Ico name="activity" size={24} color="var(--text-low)"/>
        <p style={{ marginTop: 8 }}>Sigue a otros aventureros para ver su actividad aquí.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {events.map(ev => {
        const meta = ACTIVITY_LABELS[ev.type] ?? { label: ev.type, icon: "activity", color: "var(--text-mid)" };
        return (
          <div
            key={ev.id}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 14px", borderRadius: 8,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--line)",
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(214,168,79,0.12)", display: "grid", placeItems: "center", flexShrink: 0,
            }}>
              <Ico name={meta.icon} size={14} color={meta.color}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: "var(--text-hi)" }}>
                <span style={{ fontWeight: 600 }}>@{ev.userId.slice(0, 8)}</span>{" "}
                <span style={{ color: "var(--text-mid)" }}>{meta.label}</span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-low)", flexShrink: 0 }}>
              {timeAgo(ev.createdAt)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
