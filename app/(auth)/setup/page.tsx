"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LvlLogo, Ico } from "@/components/ui/icons";
import { useApp } from "@/lib/store";
import { createClient } from "@/lib/supabaseClient";

const MAX_NAME = 50;
const MAX_PWD = 128;

export default function SetupPage() {
  const { dispatch } = useApp();
  const router = useRouter();
  const [name, setName] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Guard: si el usuario no está autenticado o no necesita setup, redirigir
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (!user) {
        router.replace("/login");
        return;
      }
      if (user.user_metadata?.needs_setup !== true) {
        router.replace("/dashboard");
        return;
      }
      setChecking(false);
    });
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const trimmed = name.trim();
    if (trimmed.length < 2) { setErr("El nombre debe tener al menos 2 caracteres."); return; }
    if (trimmed.length > MAX_NAME) { setErr("Nombre demasiado largo."); return; }
    if (pwd.length < 8) { setErr("La contraseña debe tener al menos 8 caracteres."); return; }
    if (pwd.length > MAX_PWD) { setErr("Contraseña demasiado larga."); return; }
    if (pwd !== confirmPwd) { setErr("Las contraseñas no coinciden."); return; }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.updateUser({
        password: pwd,
        data: { username: trimmed, needs_setup: false },
      });

      if (error) { setErr(error.message); setLoading(false); return; }

      const user = data.user;
      if (!user) { setErr("Error al guardar los datos."); setLoading(false); return; }

      dispatch({ type: "LOGIN", user: { id: user.id, username: trimmed, email: user.email ?? "" } });
      router.push("/onboarding");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error de conexión.");
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="lo lo-darkframe" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <div style={{ color: "var(--text-low)", fontSize: 13 }}>Verificando acceso…</div>
      </div>
    );
  }

  return (
    <div className="lo lo-darkframe" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 32, position: "relative" }}>
      <div className="lo-grain" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}/>

      <form onSubmit={submit} className="lo-card-elev" style={{ width: 440, padding: 36, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <LvlLogo size={22}/>
          <span style={{ fontFamily: "var(--font-display)", letterSpacing: "0.18em", fontSize: 13 }}>LVL ONE</span>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(214,168,79,0.12)", display: "grid", placeItems: "center" }}>
              <Ico name="sword" size={18} color="var(--quest-gold-hi)"/>
            </div>
            <h2 style={{ fontSize: 22, margin: 0 }}>Configura tu cuenta</h2>
          </div>
          <p style={{ color: "var(--text-mid)", fontSize: 13, lineHeight: 1.5, marginLeft: 46 }}>
            Elige tu nombre de aventurero y una contraseña permanente para continuar.
          </p>
        </div>

        {/* Progress indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, padding: "10px 14px", borderRadius: 8, background: "rgba(214,168,79,0.06)", border: "1px solid rgba(214,168,79,0.15)" }}>
          <Ico name="check" size={13} color="var(--quest-gold-hi)"/>
          <span style={{ fontSize: 12, color: "var(--text-mid)" }}>Acceso verificado — un paso más para empezar</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
          <div>
            <label htmlFor="setup-name" className="lo-label" style={{ marginBottom: 6 }}>
              Nombre de aventurero
            </label>
            <input
              id="setup-name"
              className="lo-input"
              type="text"
              autoComplete="name"
              placeholder="ej. Kael, Lyra, Thorgan…"
              value={name}
              onChange={e => { setName(e.target.value); setErr(null); }}
              maxLength={MAX_NAME}
              autoFocus
            />
            <p style={{ fontSize: 11, color: "var(--text-low)", marginTop: 4 }}>
              Este nombre aparecerá en tu perfil y personajes.
            </p>
          </div>

          <div>
            <label htmlFor="setup-pwd" className="lo-label" style={{ marginBottom: 6 }}>
              Nueva contraseña
            </label>
            <input
              id="setup-pwd"
              className="lo-input"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              value={pwd}
              onChange={e => { setPwd(e.target.value); setErr(null); }}
              maxLength={MAX_PWD}
            />
          </div>

          <div>
            <label htmlFor="setup-confirm" className="lo-label" style={{ marginBottom: 6 }}>
              Confirmar contraseña
            </label>
            <input
              id="setup-confirm"
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
          style={{ width: "100%", padding: 12, justifyContent: "center" }}
        >
          {loading ? "Guardando…" : <> Empezar mi aventura <Ico name="arrow" size={14}/></>}
        </button>
      </form>
    </div>
  );
}
