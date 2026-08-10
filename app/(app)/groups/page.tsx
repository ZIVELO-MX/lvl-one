"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { useApp } from "@/lib/store";
import type { Group } from "@/types/social";

interface CreateForm {
  name: string;
  description: string;
  maxPlayers: number;
  isPublic: boolean;
}

export default function GroupsPage() {
  const { state } = useApp();
  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateForm>({ name: "", description: "", maxPlayers: 5, isPublic: true });
  const [search, setSearch] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/groups")
      .then(r => r.ok ? r.json() : { groups: [] })
      .then(d => {
        const list: Group[] = d.groups ?? d ?? [];
        setGroups(list);
        if (state.user) {
          const mine = new Set<string>();
          for (const g of list) {
            if (g.dmId === state.user.id) mine.add(g.id);
          }
          setMyGroups(mine);
        }
      })
      .catch(() => setLoadError("No se pudieron cargar los grupos. Inténtalo de nuevo."))
      .finally(() => setLoading(false));
  }, [state.user]);

  async function createGroup(e: React.FormEvent) {
    e.preventDefault();
    if (creating) return;
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim(), description: form.description.trim(), maxPlayers: form.maxPlayers, isPublic: form.isPublic }),
      });
      if (res.ok) {
        const data = await res.json();
        const newGroup: Group = data.group ?? data;
        setGroups(g => [newGroup, ...g]);
        setMyGroups(s => new Set([...s, newGroup.id]));
        setForm({ name: "", description: "", maxPlayers: 5, isPublic: true });
        setShowForm(false);
      }
    } finally { setCreating(false); }
  }

  async function joinGroup(id: string) {
    const res = await fetch(`/api/groups/${id}/members`, { method: "POST" });
    if (res.ok) {
      setMyGroups(s => new Set([...s, id]));
      setGroups(g => g.map(gr => gr.id === id ? { ...gr, memberCount: gr.memberCount + 1 } : gr));
    }
  }

  async function leaveGroup(id: string) {
    const res = await fetch(`/api/groups/${id}/members`, { method: "DELETE" });
    if (res.ok) {
      setMyGroups(s => { const n = new Set(s); n.delete(id); return n; });
      setGroups(g => g.map(gr => gr.id === id ? { ...gr, memberCount: Math.max(0, gr.memberCount - 1) } : gr));
    }
  }

  const filtered = groups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 80px" }}>
      <TopBar crumb={["Comunidad", "Grupos"]}/>

      <div style={{ padding: "20px 32px 0", maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div className="lo-chip lo-chip-gold" style={{ marginBottom: 10 }}>
              <Ico name="users" size={10}/> Comunidad
            </div>
            <h1 style={{ fontSize: 28, marginBottom: 4 }}>Mesas de juego</h1>
            <p style={{ color: "var(--text-low)", fontSize: 14, margin: 0 }}>Encuentra o crea tu grupo de D&D.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(f => !f)}
            className="lo-btn lo-btn-primary"
          >
            <Ico name="plus" size={14}/> Crear grupo
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <form onSubmit={createGroup} className="lo-card-elev" style={{ padding: 20, marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, marginBottom: 16, color: "var(--text-hi)" }}>Nuevo grupo</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 12 }}>
              <div>
                <label htmlFor="group-name" style={{ fontSize: 12, color: "var(--text-low)", display: "block", marginBottom: 5 }}>Nombre *</label>
                <input
                  id="group-name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Los Caballeros del Dado"
                  required
                  style={{ width: "100%", padding: "8px 10px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--line)", borderRadius: 7, color: "var(--text-hi)", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label htmlFor="group-max-players" style={{ fontSize: 12, color: "var(--text-low)", display: "block", marginBottom: 5 }}>Máximo de jugadores</label>
                <input
                  id="group-max-players"
                  type="number" min={2} max={20}
                  value={form.maxPlayers}
                  onChange={e => setForm(f => ({ ...f, maxPlayers: Number(e.target.value) }))}
                  style={{ width: "100%", padding: "8px 10px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--line)", borderRadius: 7, color: "var(--text-hi)", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="group-description" style={{ fontSize: 12, color: "var(--text-low)", display: "block", marginBottom: 5 }}>Descripción</label>
              <textarea
                id="group-description"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="¿De qué va tu grupo? ¿Qué tipo de campaña buscan?"
                rows={2}
                style={{ width: "100%", resize: "none", padding: "8px 10px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--line)", borderRadius: 7, color: "var(--text-hi)", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <input
                type="checkbox"
                id="isPublic"
                checked={form.isPublic}
                onChange={e => setForm(f => ({ ...f, isPublic: e.target.checked }))}
              />
              <label htmlFor="isPublic" style={{ fontSize: 13, color: "var(--text-mid)", cursor: "pointer" }}>
                Grupo público (visible para todos)
              </label>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" disabled={creating} className="lo-btn lo-btn-primary" style={{ padding: "8px 18px" }}>
                {creating ? "Creando..." : "Crear grupo"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="lo-btn lo-btn-ghost" style={{ padding: "8px 14px" }}>
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <Ico name="search" size={14} color="var(--text-low)"/>
          </div>
          <input
            aria-label="Buscar grupos"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar grupos..."
            style={{
              width: "100%", padding: "9px 12px 9px 36px", borderRadius: 8,
              background: "rgba(255,255,255,0.04)", border: "1px solid var(--line)",
              color: "var(--text-hi)", fontSize: 13, outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {loadError && (
          <div role="alert" style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 8, fontSize: 13, background: "rgba(180,58,46,0.15)", color: "#E8847A", border: "1px solid rgba(180,58,46,0.3)" }}>
            {loadError}
          </div>
        )}

        {/* Groups list */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1,2,3].map(i => <div key={`skel-${i}`} className="lo-skeleton" style={{ height: 80, borderRadius: 10 }}/>)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-low)" }}>
            <Ico name="users" size={36} color="var(--text-low)"/>
            <p style={{ marginTop: 10 }}>No hay grupos todavía. ¡Crea el primero!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(g => {
              const isMine = myGroups.has(g.id);
              const isDM = g.dmId === state.user?.id;
              const isFull = g.memberCount >= g.maxPlayers;
              return (
                <div key={g.id} className="lo-card-elev" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                    background: "rgba(214,168,79,0.1)", border: "1px solid rgba(214,168,79,0.2)",
                    display: "grid", placeItems: "center",
                  }}>
                    <Ico name="users" size={18} color="var(--quest-gold-hi)"/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: "var(--text-hi)" }}>{g.name}</h3>
                      {isDM && <span className="lo-chip lo-chip-gold" style={{ fontSize: 10 }}>DM</span>}
                      {!g.isPublic && <span className="lo-chip" style={{ fontSize: 10 }}><Ico name="lock" size={9}/> Privado</span>}
                    </div>
                    {g.description && (
                      <p style={{ fontSize: 12, color: "var(--text-low)", margin: "0 0 6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.description}</p>
                    )}
                    <div style={{ fontSize: 11, color: "var(--text-low)" }}>
                      {g.memberCount}/{g.maxPlayers} jugadores
                      {isFull && <span style={{ color: "var(--danger)", marginLeft: 8 }}>· Completo</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                    <Link href={`/groups/${g.id}`} className="lo-btn lo-btn-ghost" style={{ padding: "6px 12px", fontSize: 11 }}>
                      <Ico name="eye" size={11}/> Ver
                    </Link>
                    {!isDM && !isMine && (
                      <button
                        type="button"
                        onClick={() => joinGroup(g.id)}
                        disabled={isFull}
                        className="lo-btn lo-btn-primary"
                        style={{ padding: "7px 14px", fontSize: 12 }}
                      >
                        <Ico name="user-plus" size={12}/> Unirse
                      </button>
                    )}
                    {isMine && !isDM && (
                      <button
                        type="button"
                        onClick={() => leaveGroup(g.id)}
                        className="lo-btn lo-btn-ghost"
                        style={{ padding: "7px 14px", fontSize: 12 }}
                      >
                        Salir
                      </button>
                    )}
                    {isDM && (
                      <span style={{ fontSize: 11, color: "var(--text-low)" }}>Tu grupo</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
