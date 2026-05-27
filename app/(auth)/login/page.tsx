"use client";
import { useState } from "react";
import Link from "next/link";
import { LvlLogo, Ico } from "@/components/ui/icons";
import { useApp } from "@/lib/store";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_EMAIL = 254;
const MAX_PWD = 128;

export default function LoginPage() {
  const { dispatch } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!EMAIL_RE.test(email)) { setErr("Email no válido."); return; }
    if (pwd.length < 1) { setErr("Introduce tu contraseña."); return; }
    if (pwd.length > MAX_PWD) { setErr("Contraseña demasiado larga."); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pwd });
      if (error) {
        if (error.message?.toLowerCase().includes("email not confirmed")) {
          setErr("Cuenta no confirmada. Revisa tu correo y haz clic en el enlace de activación.");
        } else {
          setErr(error.message);
        }
        setLoading(false);
        return;
      }
      const user = data.user;
      if (!user) { setErr("Error al iniciar sesión."); setLoading(false); return; }
      const username = user.user_metadata?.username ?? email.split("@")[0];
      dispatch({ type: "LOGIN", user: { id: user.id, username, email } });
      setLoading(false);
      router.push("/dashboard");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error de conexión.");
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!EMAIL_RE.test(email)) { setErr("Introduce un email válido primero."); return; }
    setLoading(true);
    try {
      const client = createClient();
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) { setErr(error.message); setLoading(false); return; }
      setResetSent(true);
      setLoading(false);
    } catch {
      setErr("Error de conexión.");
      setLoading(false);
    }
  }

  return (
    <div className="lo lo-darkframe" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 32, position: "relative" }}>
      <div className="lo-grain" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}/>
      <Link href="/" style={{ position: "absolute", top: 24, left: 32, display: "flex", alignItems: "center", gap: 8, color: "var(--text-mid)", fontSize: 13, textDecoration: "none" }}>
        <Ico name="arrowLeft" size={14}/> Volver
      </Link>
      {resetSent ? (
        <div className="lo-card-elev" style={{ width: 420, padding: 36, textAlign: "center" }}>
          <h2 style={{ fontSize: 22, marginBottom: 10 }}>Revisa tu correo</h2>
          <p style={{ color: "var(--text-mid)", fontSize: 14, lineHeight: 1.6, marginBottom: 4 }}>
            Te enviamos un enlace para restablecer tu contraseña a <strong style={{ color: "var(--text-hi)" }}>{email}</strong>.
          </p>
          <p style={{ color: "var(--text-low)", fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
            Haz clic en el enlace para crear una nueva contraseña.
          </p>
          <button onClick={() => setResetSent(false)} className="lo-btn lo-btn-ghost" style={{ padding: "10px 20px", justifyContent: "center" }}>
            Volver a iniciar sesión
          </button>
        </div>
      ) : (
      <form onSubmit={submit} className="lo-card-elev" style={{ width: 420, padding: 36, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <LvlLogo size={22}/> <span style={{ fontFamily: "var(--font-display)", letterSpacing: "0.18em", fontSize: 13 }}>LVL ONE</span>
        </div>
        <h2 style={{ fontSize: 24, marginBottom: 6 }}>Iniciar sesión</h2>
        <p style={{ color: "var(--text-mid)", fontSize: 13, marginBottom: 24 }}>Vuelve a tu cuenta y continúa tu progreso.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 16 }}>
          <div>
            <label htmlFor="login-email" className="lo-label" style={{ marginBottom: 6 }}>Email</label>
            <input id="login-email" className="lo-input" type="email" autoComplete="email" placeholder="tu@email.com" value={email} onChange={e => { setEmail(e.target.value); setErr(null); }} maxLength={MAX_EMAIL} autoFocus/>
          </div>
          <div>
            <label htmlFor="login-pwd" className="lo-label" style={{ marginBottom: 6 }}>Contraseña</label>
            <input id="login-pwd" className="lo-input" type="password" autoComplete="current-password" placeholder="••••••••" value={pwd} onChange={e => { setPwd(e.target.value); setErr(null); }} maxLength={MAX_PWD}/>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
          <button type="button" onClick={handleForgotPassword} disabled={loading} style={{ background: "none", border: "none", padding: 0, color: "var(--quest-gold-hi)", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        {err && <p style={{ color: "#E8847A", fontSize: 12, marginBottom: 10 }}>{err}</p>}
        <button type="submit" disabled={loading} className="lo-btn lo-btn-primary" style={{ width: "100%", padding: 12, justifyContent: "center", marginBottom: 12 }}>
          {loading ? "Espera…" : <> Entrar <Ico name="arrow" size={14}/></>}
        </button>
        <p style={{ fontSize: 12, color: "var(--text-low)", textAlign: "center" }}>
          ¿Nuevo aquí? <Link href="/register" style={{ color: "var(--quest-gold-hi)" }}>Crear cuenta gratis</Link>
        </p>
      </form>
      )}
    </div>
  );
}
