"use client";
import { useState } from "react";
import Link from "next/link";
import { LvlLogo, Ico } from "@/components/ui/icons";
import { useApp } from "@/lib/store";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { MAX_FREE_CHARACTERS } from "@/lib/characterMath";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_NAME = 50;
const MAX_EMAIL = 254;
const MAX_PWD = 128;

export default function RegisterPage() {
  const { dispatch } = useApp();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const trimmedName = name.trim();
    if (trimmedName.length < 2) { setErr("Nombre de al menos 2 caracteres."); return; }
    if (trimmedName.length > MAX_NAME) { setErr("Nombre demasiado largo."); return; }
    if (!EMAIL_RE.test(email)) { setErr("Email no válido."); return; }
    if (pwd.length < 8) { setErr("La contraseña debe tener al menos 8 caracteres."); return; }
    if (pwd.length > MAX_PWD) { setErr("Contraseña demasiado larga."); return; }
    if (pwd !== confirmPwd) { setErr("Las contraseñas no coinciden."); return; }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pwd,
        options: { data: { username: trimmedName } },
      });
      if (error) { setErr(error.message); setLoading(false); return; }
      if (!data.session) {
        setConfirmed(true);
        setLoading(false);
        return;
      }
      const user = data.user;
      if (!user) { setErr("Error al crear la cuenta."); setLoading(false); return; }
      dispatch({ type: "LOGIN", user: { id: user.id, username: trimmedName, email } });
      router.push("/dashboard");
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
      {confirmed ? (
        <div className="lo-card-elev" style={{ width: 420, padding: 36, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
          <h2 style={{ fontSize: 22, marginBottom: 10 }}>Revisa tu correo</h2>
          <p style={{ color: "var(--text-mid)", fontSize: 14, lineHeight: 1.6, marginBottom: 4 }}>
            Te enviamos un enlace de confirmación a <strong style={{ color: "var(--text-hi)" }}>{email}</strong>.
          </p>
          <p style={{ color: "var(--text-low)", fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
            Haz clic en el enlace para activar tu cuenta y luego inicia sesión.
          </p>
          <Link href="/login" className="lo-btn lo-btn-primary" style={{ padding: "12px 28px", justifyContent: "center" }}>
            Ir a iniciar sesión
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="lo-card-elev" style={{ width: 420, padding: 36, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <LvlLogo size={22}/> <span style={{ fontFamily: "var(--font-display)", letterSpacing: "0.18em", fontSize: 13 }}>LVL ONE</span>
          </div>
          <h2 style={{ fontSize: 24, marginBottom: 6 }}>Crear cuenta</h2>
          <p style={{ color: "var(--text-mid)", fontSize: 13, marginBottom: 24 }}>Empieza gratis. Hasta {MAX_FREE_CHARACTERS} personajes incluidos.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 16 }}>
            <div>
              <label htmlFor="reg-name" className="lo-label" style={{ marginBottom: 6 }}>Nombre de jugador</label>
              <input id="reg-name" className="lo-input" type="text" autoComplete="name" placeholder="ej. Kael" value={name} onChange={e => { setName(e.target.value); setErr(null); }} maxLength={MAX_NAME} autoFocus/>
            </div>
            <div>
              <label htmlFor="reg-email" className="lo-label" style={{ marginBottom: 6 }}>Email</label>
              <input id="reg-email" className="lo-input" type="email" autoComplete="email" placeholder="tu@email.com" value={email} onChange={e => { setEmail(e.target.value); setErr(null); }} maxLength={MAX_EMAIL}/>
            </div>
            <div>
              <label htmlFor="reg-pwd" className="lo-label" style={{ marginBottom: 6 }}>Contraseña</label>
              <input id="reg-pwd" className="lo-input" type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres" value={pwd} onChange={e => { setPwd(e.target.value); setErr(null); }} maxLength={MAX_PWD}/>
            </div>
            <div>
              <label htmlFor="reg-confirm-pwd" className="lo-label" style={{ marginBottom: 6 }}>Confirmar contraseña</label>
              <input id="reg-confirm-pwd" className="lo-input" type="password" autoComplete="new-password" placeholder="Repite la contraseña" value={confirmPwd} onChange={e => { setConfirmPwd(e.target.value); setErr(null); }} maxLength={MAX_PWD}/>
            </div>
          </div>
          {err && <p style={{ color: "#E8847A", fontSize: 12, marginBottom: 10 }}>{err}</p>}
          <button type="submit" disabled={loading} className="lo-btn lo-btn-primary" style={{ width: "100%", padding: 12, justifyContent: "center", marginBottom: 14 }}>
            {loading ? "Espera…" : <> Crear mi cuenta <Ico name="arrow" size={14}/></>}
          </button>
          <p style={{ fontSize: 12, color: "var(--text-low)", textAlign: "center" }}>
            ¿Ya tienes cuenta? <Link href="/login" style={{ color: "var(--quest-gold-hi)" }}>Inicia sesión</Link>
          </p>
        </form>
      )}
    </div>
  );
}
