"use client";
import { useState } from "react";
import Link from "next/link";
import { LvlLogo, Ico } from "@/components/ui/icons";
import { createClient } from "@/lib/supabaseClient";
import { checkUsername, MAX_USERNAME } from "@/lib/username";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_EMAIL = 254;
const MIN_PWD = 8;
const MAX_PWD = 128;

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const trimmed = name.trim();
    if (!EMAIL_RE.test(email)) { setErr("Email no válido."); return; }
    if (pwd.length < MIN_PWD) { setErr(`La contraseña debe tener al menos ${MIN_PWD} caracteres.`); return; }
    if (pwd.length > MAX_PWD) { setErr("Contraseña demasiado larga."); return; }
    if (pwd !== confirmPwd) { setErr("Las contraseñas no coinciden."); return; }

    setLoading(true);
    try {
      const nameErr = await checkUsername(trimmed);
      if (nameErr) { setErr(nameErr); setLoading(false); return; }

      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pwd,
        options: {
          // onboarded: false manda a /onboarding en el primer inicio de sesión.
          // needs_setup se queda fuera a propósito: eso es para los invitados,
          // que llegan con contraseña provisional y sin nombre elegido.
          data: { username: trimmed, onboarded: false },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        if (/already registered|already exists/i.test(error.message)) {
          setErr("Ya hay una cuenta con ese email. Prueba a iniciar sesión.");
        } else {
          setErr(error.message);
        }
        setLoading(false);
        return;
      }

      // Con confirmación de email activada no llega sesión: hay que ir al correo.
      if (data.session) { window.location.assign("/onboarding"); return; }
      setSent(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="lo lo-darkframe" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 32, position: "relative" }}>
      <div className="lo-grain" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}/>
      <Link href="/" style={{ position: "absolute", top: 24, left: 32, display: "flex", alignItems: "center", gap: 8, color: "var(--text-mid)", fontSize: 13, textDecoration: "none" }}>
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
          <h2 style={{ fontSize: 22, marginBottom: 10 }}>Confirma tu correo</h2>
          <p style={{ color: "var(--text-mid)", fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>
            Te enviamos un enlace a <strong style={{ color: "var(--text-hi)" }}>{email}</strong>. Ábrelo y tu
            cuenta queda lista.
          </p>
          <p style={{ color: "var(--text-low)", fontSize: 13, lineHeight: 1.6, marginBottom: 28 }}>
            Si no lo ves en unos minutos, mira en spam.
          </p>
          <Link href="/login" className="lo-btn lo-btn-primary" style={{ padding: "12px 24px", justifyContent: "center", width: "100%" }}>
            Ir a iniciar sesión <Ico name="arrow" size={14}/>
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="lo-card-elev" style={{ width: 440, padding: 36, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <LvlLogo size={22}/>
            <span style={{ fontFamily: "var(--font-display)", letterSpacing: "0.18em", fontSize: 13 }}>LVL ONE</span>
          </div>

          <h2 style={{ fontSize: 24, marginBottom: 6 }}>Crea tu cuenta</h2>
          <p style={{ color: "var(--text-mid)", fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
            Gratis. Dos personajes y una campaña para empezar a jugar.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
            <div>
              <label htmlFor="register-name" className="lo-label" style={{ marginBottom: 6 }}>Nombre de aventurero</label>
              <input
                id="register-name"
                className="lo-input"
                type="text"
                autoComplete="nickname"
                placeholder="ej. Kael, Lyra, Thorgan…"
                value={name}
                onChange={e => { setName(e.target.value); setErr(null); }}
                maxLength={MAX_USERNAME}
              />
              <p style={{ fontSize: 11, color: "var(--text-low)", marginTop: 4 }}>
                Así te verán en tu perfil y en las mesas.
              </p>
            </div>

            <div>
              <label htmlFor="register-email" className="lo-label" style={{ marginBottom: 6 }}>Email</label>
              <input
                id="register-email"
                className="lo-input"
                type="email"
                autoComplete="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setErr(null); }}
                maxLength={MAX_EMAIL}
              />
            </div>

            <div>
              <label htmlFor="register-pwd" className="lo-label" style={{ marginBottom: 6 }}>Contraseña</label>
              <input
                id="register-pwd"
                className="lo-input"
                type="password"
                autoComplete="new-password"
                placeholder={`Mínimo ${MIN_PWD} caracteres`}
                value={pwd}
                onChange={e => { setPwd(e.target.value); setErr(null); }}
                maxLength={MAX_PWD}
              />
            </div>

            <div>
              <label htmlFor="register-confirm" className="lo-label" style={{ marginBottom: 6 }}>Confirmar contraseña</label>
              <input
                id="register-confirm"
                className="lo-input"
                type="password"
                autoComplete="new-password"
                placeholder="Repite la contraseña"
                value={confirmPwd}
                onChange={e => { setConfirmPwd(e.target.value); setErr(null); }}
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
            {loading ? "Creando cuenta…" : <> Empezar mi aventura <Ico name="arrow" size={14}/></>}
          </button>

          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16, textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "var(--text-low)", lineHeight: 1.5 }}>
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" style={{ color: "var(--quest-gold-hi)" }}>Inicia sesión</Link>
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
