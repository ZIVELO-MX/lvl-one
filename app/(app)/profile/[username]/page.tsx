"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { FollowButton } from "@/components/social/FollowButton";
import { XPBar } from "@/components/social/XPBar";
import { BadgeGrid } from "@/components/social/BadgeGrid";
import { useApp } from "@/lib/store";
import { xpToLevel } from "@/types/gamification";
import type { Achievement } from "@/types/gamification";
import type { PublicUser } from "@/types/social";

interface PublicCharacter {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
}

interface PublicCampaign {
  id: string;
  name: string;
  description: string;
}

interface ProfileData {
  user: PublicUser & { followersCount: number; followingCount: number };
  characters: PublicCharacter[];
  campaigns: PublicCampaign[];
  isFollowing: boolean;
  xp?: { total: number };
  achievements?: Achievement[];
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { state } = useApp();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isOwnProfile = state.user?.username === username;

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setLoadError(null);
    fetch(`/api/users/${username}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.ok ? r.json() : null;
      })
      .then(d => { if (d) setData(d); })
      .catch(() => setLoadError("No se pudo cargar el perfil. Inténtalo de nuevo."))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <main style={{ padding: "0 0 60px" }}>
        <TopBar crumb={["Comunidad", "Perfil"]}/>
        <div style={{ padding: "32px", maxWidth: 800, margin: "0 auto" }}>
          <div className="lo-skeleton" style={{ height: 140, borderRadius: 12, marginBottom: 20 }}/>
          <div className="lo-skeleton" style={{ height: 80, borderRadius: 10 }}/>
        </div>
      </main>
    );
  }

  if (notFound || !data) {
    return (
      <main style={{ padding: "0 0 60px" }}>
        <TopBar crumb={["Comunidad", "Perfil"]}/>
        <div style={{ padding: "60px 32px", textAlign: "center", color: "var(--text-low)" }}>
          <Ico name="user" size={40} color="var(--text-low)"/>
          <p style={{ marginTop: 12, fontSize: 15 }}>{loadError ?? `Usuario @${username} no encontrado.`}</p>
        </div>
      </main>
    );
  }

  const level = data.xp ? xpToLevel(data.xp.total) : 1;

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 80px" }}>
      <TopBar crumb={["Comunidad", `@${username}`]}/>

      <div style={{ padding: "20px 32px 0", maxWidth: 860, margin: "0 auto" }}>
        {/* Profile header */}
        <div className="lo-card-elev" style={{ padding: 24, marginBottom: 20, display: "flex", gap: 20, alignItems: "flex-start" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, var(--quest-gold-lo), var(--arcane-blue))",
            display: "grid", placeItems: "center", fontSize: 24, fontWeight: 700, color: "var(--text-hi)",
          }}>
            {username[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 22, margin: 0 }}>@{username}</h1>
              <span className="lo-chip lo-chip-gold" style={{ fontSize: 10 }}>Nv {level}</span>
            </div>
            <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: "var(--text-low)" }}>
                <strong style={{ color: "var(--text-mid)" }}>{data.user.followersCount ?? 0}</strong> seguidores
              </span>
              <span style={{ fontSize: 12, color: "var(--text-low)" }}>
                <strong style={{ color: "var(--text-mid)" }}>{data.user.followingCount ?? 0}</strong> siguiendo
              </span>
              <span style={{ fontSize: 12, color: "var(--text-low)" }}>
                <strong style={{ color: "var(--text-mid)" }}>{data.characters.length}</strong> personajes
              </span>
            </div>
            {data.xp && (
              <div style={{ maxWidth: 300 }}>
                <XPBar compact/>
              </div>
            )}
          </div>
          {!isOwnProfile && state.user && (
            <FollowButton targetUserId={data.user.id} initialFollowing={data.isFollowing}/>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Characters */}
          <div>
            <h2 style={{ fontSize: 16, marginBottom: 12, display: "flex", alignItems: "center", gap: 7 }}>
              <Ico name="scroll" size={14} color="var(--quest-gold-hi)"/>
              Personajes
            </h2>
            {data.characters.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-low)" }}>Sin personajes públicos.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.characters.map(char => (
                  <div key={char.id} className="lo-card-elev" style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-hi)", marginBottom: 3 }}>{char.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-low)" }}>
                      {char.race} · {char.class} · Nv {char.level}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Campaigns */}
          <div>
            <h2 style={{ fontSize: 16, marginBottom: 12, display: "flex", alignItems: "center", gap: 7 }}>
              <Ico name="book" size={14} color="var(--arcane-blue)"/>
              Campañas
            </h2>
            {data.campaigns.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-low)" }}>Sin campañas públicas.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.campaigns.map(camp => (
                  <div key={camp.id} className="lo-card-elev" style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-hi)", marginBottom: 3 }}>{camp.name}</div>
                    {camp.description && (
                      <div style={{ fontSize: 12, color: "var(--text-low)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{camp.description}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Badges */}
        {data.achievements && data.achievements.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 16, marginBottom: 12, display: "flex", alignItems: "center", gap: 7 }}>
              <Ico name="trophy" size={14} color="var(--quest-gold-hi)"/>
              Logros
            </h2>
            <div className="lo-card-elev" style={{ padding: 16 }}>
              <BadgeGrid achievements={data.achievements}/>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
