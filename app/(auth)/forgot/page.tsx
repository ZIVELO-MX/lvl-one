"use client";
import { useState } from "react";
import Link from "next/link";
import { LvlLogo, Ico } from "@/components/ui/icons";
import { createClient } from "@/lib/supabaseClient";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_EMAIL = 254;

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!EMAIL_RE.test(email)) { setErr("Email no válido."); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset`,
      });
      // Nunca se distingue "email existe" de "no existe": eso permitiría
      // averiguar quién está en la beta probando direcciones. El único error
      // que sí se muestra es el de rate limit, porque el usuario puede actuar.
      if (error && /rate limit|too many/i.test(error.message)) {
        setErr("Demasiados intentos. Espera unos minutos antes de volver a probar.");
      } else {
        setSent(true);
      }
    } catch {
      setErr("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="lo lo-darkframe" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 32, position: "relative" }}>
      <div className="lo-grain" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}/>
      <Link href="/login" style={{ position: "absolute", top: 24, left: 32, display: "flex", alignItems: "center", gap: 8, color: "var(--text-mid)", fontSize: 13, textDecoration: "none" }}>
        <Ico name="arrowLeft" size={14}/> Volver
      </Link>

      {sent ? (
        <div className="lo-card-elev" style={{ width: 420, padding: 36, textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 24 }}>
            <LvlLogo size={22}/>
            <span style={{ fontFamily: "var(--font-display)", letterSpacing: "0.18em", fontSize: 13 }}>LVL ONE</span>
          </div>

          <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(214,168,79,0.12)", display: "grid", placeItems: "center", margin: "0 auto 20px" }}>
            <Ico name="message" size={24} color="var(--quest-gold-hi)"/>
          </div>

          <h2 style={{ fontSize: 22, marginBottom: 10 }}>Revisa tu correo</h2>
          <p style={{ color: "var(--text-mid)", fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>
            Si <strong style={{ color: "var(--text-hi)" }}>{email}</strong> tiene una cuenta, te enviamos un enlace para
            elegir una contraseña nueva.
          </p>
          <p style={{ color: "var(--text-low)", fontSize: 13, lineHeight: 1.6, marginBottom: 28 }}>
            El enlace caduca en una hora. Si no lo ves, mira en spam.
          </p>

          <Link href="/login" className="lo-btn lo-btn-primary" style={{ padding: "12px 24px", justifyContent: "center", width: "100%" }}>
            Volver a iniciar sesión <Ico name="arrow" size={14}/>
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="lo-card-elev" style={{ width: 420, padding: 36, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <LvlLogo size={22}/>
            <span style={{ fontFamily: "var(--font-display)", letterSpacing: "0.18em", fontSize: 13 }}>LVL ONE</span>
          </div>

          <h2 style={{ fontSize: 24, marginBottom: 6 }}>Recuperar acceso</h2>
          <p style={{ color: "var(--text-mid)", fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
            Escribe tu email y te enviamos un enlace para crear una contraseña nueva.
          </p>

          <div style={{ marginBottom: 20 }}>
            <label htmlFor="forgot-email" className="lo-label" style={{ marginBottom: 6 }}>Email</label>
            <input
              id="forgot-email"
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

          {err && (
            <p style={{ color: "#E8847A", fontSize: 12, marginBottom: 14, lineHeight: 1.4 }}>{err}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="lo-btn lo-btn-primary"
            style={{ width: "100%", padding: 12, justifyContent: "center" }}
          >
            {loading ? "Enviando…" : <> Enviar enlace <Ico name="arrow" size={14}/></>}
          </button>
        </form>
      )}
    </div>
  );
}
