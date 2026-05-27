"use client";
import { useState } from "react";
import { Ico } from "@/components/ui/icons";

interface Props {
  targetUserId: string;
  initialFollowing?: boolean;
  onToggle?: (following: boolean) => void;
}

export function FollowButton({ targetUserId, initialFollowing = false, onToggle }: Props) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const method = following ? "DELETE" : "POST";
      const res = await fetch("/api/follow", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });
      if (res.ok) {
        setFollowing(f => !f);
        onToggle?.(!following);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={following ? "lo-btn lo-btn-ghost" : "lo-btn lo-btn-primary"}
      style={{ padding: "7px 16px", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}
    >
      <Ico name={following ? "user-check" : "user-plus"} size={13}/>
      {following ? "Siguiendo" : "Seguir"}
    </button>
  );
}
