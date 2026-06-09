"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { useApp } from "@/lib/store";
import Image from "next/image";
import { createClient } from "@/lib/supabaseClient";

const MIN_PWD = 8;

export default function AccountPage() {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const user = state.user;
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [pwd, setPwd] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    (async () => {
      try {
        const { data } = await supabase.from("profiles").select("avatar_url, is_public").eq("id", user.id).single();
        if (data) {
          setAvatarUrl(data.avatar_url ?? "");
          setIsPublic(data.is_public ?? false);
        }
      } catch { /* noop */ }
      setLoadingProfile(false);
    })();
  }, [user]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;
    setSaving(true);
    setMsg(null);
    try {
      const supabase = createClient();
      const updates: Record<string, string> = {};
      if (email !== user?.email) updates.email = email;
      if (Object.keys(updates).length > 0 || username !== user?.username) {
        const { error } = await supabase.auth.updateUser({
          ...updates,
          data: { username: username.trim() },
        });
        if (error) throw error;
      }
      if (user?.id) {
        await supabase.from("profiles").update({
          username: username.trim(),
          email,
          is_public: isPublic,
        }).eq("id", user.id);
      }
      dispatch({ type: "LOGIN", user: { id: user!.id, username: username.trim(), email } });
      setMsg({ text: "Perfil actualizado.", ok: true });
    } catch (e: unknown) {
      setMsg({ text: e instanceof Error ? e.message : "Error al guardar.", ok: false });
    } finally { setSaving(false); }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwd.length < MIN_PWD) { setMsg({ text: `La contraseña debe tener al menos ${MIN_PWD} caracteres.`, ok: false }); return; }
    if (pwd !== pwdConfirm) { setMsg({ text: "Las contraseñas no coinciden.", ok: false }); return; }
    setSaving(true);
    setMsg(null);
    try {
      const { error } = await createClient().auth.updateUser({ password: pwd });
      if (error) throw error;
      setPwd(""); setPwdConfirm("");
      setMsg({ text: "Contraseña actualizada.", ok: true });
    } catch (e: unknown) {
      setMsg({ text: e instanceof Error ? e.message : "Error al cambiar contraseña.", ok: false });
    } finally { setSaving(false); }
  }

  if (!user) { router.replace("/login"); return null; }

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 80px" }}>
      <TopBar crumb={["Mi cuenta"]} />
      <div style={{ padding: "24px 32px 0", maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <Link href="/dashboard" className="lo-btn lo-btn-ghost" style={{ padding: "6px 10px" }}>
            <Ico name="arrowLeft" size={14} />
          </Link>
          <div>
            <h1 style={{ fontSize: 22, margin: 0 }}>Mi cuenta</h1>
            <p style={{ fontSize: 12, color: "var(--text-low)", margin: 0 }}>Gestiona tu nombre, email y contraseña</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, padding: "16px 20px", borderRadius: 12, background: "var(--ink-2)", border: "1px solid var(--line)" }}>
          {avatarUrl ? (
            <Image src={avatarUrl} alt="" width={52} height={52} style={{ borderRadius: 999, objectFit: "cover", flexShrink: 0 }} />
          ) : (
            <div style={{ width: 52, height: 52, borderRadius: 999, background: "linear-gradient(135deg, var(--quest-gold-lo), var(--arcane-blue))", display: "grid", placeItems: "center", fontSize: 22, fontWeight: 700, color: "var(--text-hi)", flexShrink: 0 }}>
              {username[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-hi)" }}>{username || "Sin nombre"}</div>
            <div style={{ fontSize: 12, color: "var(--text-low)" }}>{user?.email} · Plan Free</div>
          </div>
        </div>

        {msg && (
          <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 8, fontSize: 13, background: msg.ok ? "rgba(91,122,74,0.15)" : "rgba(180,58,46,0.15)", color: msg.ok ? "var(--moss-green)" : "#E8847A", border: `1px solid ${msg.ok ? "rgba(91,122,74,0.3)" : "rgba(180,58,46,0.3)"}` }}>
            {msg.text}
          </div>
        )}

        <form onSubmit={saveProfile} className="lo-card" style={{ padding: "20px 24px", marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Información del perfil</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
            <div>
              <div className="lo-label" style={{ marginBottom: 6 }}>Nombre de jugador</div>
              <input className="lo-input" value={username} onChange={e => setUsername(e.target.value)} placeholder="Tu nombre" style={{ fontSize: 14 }} maxLength={50} />
            </div>
            <div>
              <div className="lo-label" style={{ marginBottom: 6 }}>Email</div>
              <input className="lo-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" style={{ fontSize: 14 }} maxLength={254} />
              {email !== user?.email && <p style={{ fontSize: 11, color: "var(--text-low)", marginTop: 4 }}>Recibirás un email de confirmación al nuevo correo.</p>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid var(--line)" }}>
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={e => setIsPublic(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "var(--quest-gold-hi)", cursor: "pointer" }}
              />
              <div>
                <label htmlFor="isPublic" style={{ fontSize: 13, color: "var(--text-hi)", cursor: "pointer", fontWeight: 600 }}>
                  Perfil público
                </label>
                <p style={{ fontSize: 11, color: "var(--text-low)", margin: "2px 0 0" }}>
                  Tu perfil y personajes marcados como públicos serán visibles para otros jugadores.
                </p>
              </div>
            </div>
          </div>
          <button type="submit" disabled={saving || loadingProfile} className="lo-btn lo-btn-primary" style={{ padding: "9px 20px" }}>
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </form>

        <form onSubmit={savePassword} className="lo-card" style={{ padding: "20px 24px" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Cambiar contraseña</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
            <div>
              <div className="lo-label" style={{ marginBottom: 6 }}>Nueva contraseña</div>
              <input className="lo-input" type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder={`Mínimo ${MIN_PWD} caracteres`} style={{ fontSize: 14 }} maxLength={128} />
            </div>
            <div>
              <div className="lo-label" style={{ marginBottom: 6 }}>Confirmar contraseña</div>
              <input className="lo-input" type="password" value={pwdConfirm} onChange={e => setPwdConfirm(e.target.value)} placeholder="Repite la contraseña" style={{ fontSize: 14 }} maxLength={128} />
            </div>
          </div>
          <button type="submit" disabled={saving || !pwd} className="lo-btn lo-btn-ghost" style={{ padding: "9px 20px" }}>
            {saving ? "Cambiando…" : "Cambiar contraseña"}
          </button>
        </form>
      </div>
    </main>
  );
}
