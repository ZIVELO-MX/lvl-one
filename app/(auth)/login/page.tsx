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
        if (error.message?.toLowerCase().includes("invalid login credentials")) {
          setErr("Credenciales incorrectas. Verifica el email y la contraseña de acceso que recibiste.");
        } else {
          setErr(error.message);
        }
        setLoading(false);
        return;
      }
      const user = data.user;
      if (!user) { setErr("Error al iniciar sesión."); setLoading(false); return; }

      // Invitado con contraseña provisional: aún tiene que elegir nombre y clave.
      if (user.user_metadata?.needs_setup === true) {
        router.push("/setup");
        return;
      }

      const username = user.user_metadata?.username ?? email.split("@")[0];
      dispatch({ type: "LOGIN", user: { id: user.id, username, email } });
      setLoading(false);

      // Sólo el false explícito manda al onboarding: las cuentas antiguas no
      // llevan la marca y no queremos repetírselo a quien ya lleva meses.
      router.push(user.user_metadata?.onboarded === false ? "/onboarding" : "/dashboard");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error de conexión.");
      setLoading(false);
    }
  }

  return (
    <div className="lo lo-darkframe" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 32, position: "relative" }}>
      <div className="lo-grain" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}/>
      <Link href="/" style={{ position: "absolute", top: 24, left: 32, display: "flex", alignItems: "center", gap: 8, color: "var(--text-mid)", fontSize: 13, textDecoration: "none" }}>
        <Ico name="arrowLeft" size={14}/> Volver
      </Link>

      <form onSubmit={submit} className="lo-card-elev" style={{ width: 420, padding: 36, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <LvlLogo size={22}/>
          <span style={{ fontFamily: "var(--font-display)", letterSpacing: "0.18em", fontSize: 13 }}>LVL ONE</span>
        </div>

        <h2 style={{ fontSize: 24, marginBottom: 6 }}>Bienvenido de vuelta</h2>
        <p style={{ color: "var(--text-mid)", fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
          Entra con tu email y tu contraseña.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
          <div>
            <label htmlFor="login-email" className="lo-label" style={{ marginBottom: 6 }}>Email</label>
            <input
              id="login-email"
              className="lo-input"
              type="email"
              autoComplete="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setErr(null); }}
              maxLength={MAX_EMAIL}
              autoFocus
            />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
              <label htmlFor="login-pwd" className="lo-label" style={{ marginBottom: 0 }}>Contraseña</label>
              <Link href="/forgot" style={{ fontSize: 12, color: "var(--text-low)", textDecoration: "none" }}>
                ¿La olvidaste?
              </Link>
            </div>
            <input
              id="login-pwd"
              className="lo-input"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={pwd}
              onChange={e => { setPwd(e.target.value); setErr(null); }}
              maxLength={MAX_PWD}
            />
          </div>
        </div>

        {err && (
          <p style={{ color: "#E8847A", fontSize: 12, marginBottom: 14, lineHeight: 1.4 }}>{err}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="lo-btn lo-btn-primary"
          style={{ width: "100%", padding: 12, justifyContent: "center", marginBottom: 16 }}
        >
          {loading ? "Verificando…" : <> Entrar <Ico name="arrow" size={14}/></>}
        </button>

        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "var(--text-low)", lineHeight: 1.5 }}>
            ¿Todavía no tienes cuenta?{" "}
            <Link href="/register" style={{ color: "var(--quest-gold-hi)" }}>Créala gratis</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
