"use client";
import { useState } from "react";
import { Ico } from "@/components/ui/icons";
import type { BookmarkTargetType } from "@/types/social";

interface Props {
  targetType: BookmarkTargetType;
  targetId: string;
  initialBookmarked?: boolean;
}

export function BookmarkButton({ targetType, targetId, initialBookmarked = false }: Props) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      if (bookmarked) {
        const res = await fetch(`/api/bookmarks?targetType=${targetType}&targetId=${targetId}`, { method: "DELETE" });
        if (res.ok) setBookmarked(false);
      } else {
        const res = await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetType, targetId }),
        });
        if (res.ok) setBookmarked(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={bookmarked ? "Quitar de favoritos" : "Guardar en favoritos"}
      style={{
        background: "none", border: "none", cursor: loading ? "default" : "pointer",
        color: bookmarked ? "var(--quest-gold-hi)" : "var(--text-low)",
        display: "flex", alignItems: "center", gap: 5, padding: "6px 10px",
        borderRadius: 8, transition: "color .12s",
        fontSize: 12,
      }}
    >
      <Ico name={bookmarked ? "bookmark-fill" : "bookmark"} size={15}/>
      {bookmarked ? "Guardado" : "Guardar"}
    </button>
  );
}
