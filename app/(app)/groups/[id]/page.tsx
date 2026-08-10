"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import Image from "next/image";
import { useApp } from "@/lib/store";

interface MemberProfile {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface Member {
  user_id: string;
  role: string;
  joined_at: string;
  profile: MemberProfile | null;
}

interface GroupDetail {
  id: string;
  name: string;
  description: string;
  dm_id: string;
  is_public: boolean;
  max_players: number;
  memberCount: number;
  created_at: string;
  members: Member[];
}

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { state } = useApp();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetch(`/api/groups/${id}`)
      .then(r => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json();
      })
      .then(d => { if (d) setGroup(d); })
      .catch(() => setLoadError("No se pudo cargar el grupo. Inténtalo de nuevo."))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleLeave() {
    await fetch(`/api/groups/${id}/members`, { method: "DELETE" });
    router.push("/groups");
  }

  async function handleJoin() {
    if (joining) return;
    setJoining(true);
    try {
      const res = await fetch(`/api/groups/${id}/members`, { method: "POST" });
      if (!res.ok) return;
      const refreshed = await fetch(`/api/groups/${id}`);
      if (!refreshed.ok) return;
      setGroup(await refreshed.json());
    } finally {
      setJoining(false);
    }
  }

  if (loading) return (
    <main style={{ padding: "0 0 80px" }}>
      <TopBar crumb={["Comunidad", "Grupos", "…"]}/>
      <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, border: "2px solid var(--quest-gold-hi)", borderTopColor: "transparent", animation: "lo-spin .8s linear infinite" }}/>
      </div>
    </main>
  );

  if (notFound || !group) return (
    <main style={{ padding: "0 0 80px" }}>
      <TopBar crumb={["Comunidad", "Grupos", "No encontrado"]}/>
      <div style={{ padding: "40px 32px", textAlign: "center", color: "var(--text-low)" }}>
        <Ico name="users" size={40} color="var(--text-low)"/>
        <p style={{ marginTop: 12 }}>{loadError ?? "Este grupo no existe o no tienes acceso."}</p>
        <Link href="/groups" className="lo-btn lo-btn-ghost" style={{ marginTop: 16 }}>← Volver a grupos</Link>
      </div>
    </main>
  );

  const isDM = group.dm_id === state.user?.id;
  const isMember = group.members.some(m => m.user_id === state.user?.id);
  const isFull = group.memberCount >= group.max_players;

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 80px" }}>
      <TopBar crumb={["Comunidad", "Grupos", group.name]}/>

      <div style={{ padding: "20px 32px 0", maxWidth: 860, margin: "0 auto" }}>
        {/* Back */}
        <Link href="/groups" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-low)", marginBottom: 20, textDecoration: "none" }}>
          <Ico name="arrow" size={12} color="var(--text-low)"/> Todos los grupos
        </Link>

        {/* Header card */}
        <div className="lo-card-elev" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: "rgba(214,168,79,0.1)", border: "1px solid rgba(214,168,79,0.2)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Ico name="users" size={22} color="var(--quest-gold-hi)"/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <h1 style={{ fontSize: 22, margin: 0 }}>{group.name}</h1>
                {!group.is_public && <span className="lo-chip" style={{ fontSize: 10 }}><Ico name="lock" size={9}/> Privado</span>}
                {isDM && <span className="lo-chip lo-chip-gold" style={{ fontSize: 10 }}>DM</span>}
              </div>
              {group.description && (
                <p style={{ fontSize: 14, color: "var(--text-mid)", margin: "0 0 12px", lineHeight: 1.5 }}>{group.description}</p>
              )}
              <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text-low)" }}>
                <span><Ico name="users" size={12}/> {group.memberCount}/{group.max_players} jugadores</span>
                <span>Creado {new Date(group.created_at).toLocaleDateString("es-ES")}</span>
              </div>
            </div>
            {!isDM && !isMember && (
              <button type="button" onClick={handleJoin} disabled={isFull || joining} className="lo-btn lo-btn-primary" style={{ padding: "8px 16px", fontSize: 13, flexShrink: 0 }}>
                <Ico name="user-plus" size={13}/> Unirse
              </button>
            )}
            {!isDM && isMember && (
              <button type="button" onClick={handleLeave} className="lo-btn lo-btn-ghost" style={{ padding: "8px 16px", fontSize: 13, flexShrink: 0 }}>
                Salir del grupo
              </button>
            )}
          </div>
        </div>

        {/* Members */}
        <h2 style={{ fontSize: 14, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
          Miembros ({group.members.length})
        </h2>

        {group.members.length === 0 ? (
          <div style={{ padding: "32px 0", textAlign: "center", color: "var(--text-low)" }}>
            <p>No hay miembros aún.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {group.members.map(m => {
              const username = m.profile?.username ?? m.user_id.slice(0, 8);
              const initial = username[0]?.toUpperCase() ?? "?";
              const isDMmember = m.user_id === group.dm_id;

              return (
                <Link
                  key={m.user_id}
                  href={`/profile/${username}`}
                  style={{ textDecoration: "none" }}
                >
                  <div className="lo-card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, transition: "border-color .12s", cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(214,168,79,0.35)")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--line)")}>
                    {m.profile?.avatar_url ? (
                      <Image src={m.profile.avatar_url} alt={username} width={38} height={38} style={{ borderRadius: 999, objectFit: "cover", flexShrink: 0 }}/>
                    ) : (
                      <div style={{ width: 38, height: 38, borderRadius: 999, background: "linear-gradient(135deg, var(--quest-gold-lo), var(--arcane-blue))", display: "grid", placeItems: "center", fontSize: 16, fontWeight: 700, color: "var(--text-hi)", flexShrink: 0 }}>
                        {initial}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-hi)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{username}</div>
                      <div style={{ fontSize: 11, color: "var(--text-low)", marginTop: 2 }}>
                        {isDMmember ? "Dungeon Master" : "Jugador"}
                      </div>
                    </div>
                    <Ico name="arrow" size={12} color="var(--text-low)"/>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
