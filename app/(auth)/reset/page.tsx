"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LvlLogo, Ico } from "@/components/ui/icons";
import { createClient } from "@/lib/supabaseClient";

const MIN_PWD = 8;
const MAX_PWD = 128;

type Status = "checking" | "invalid" | "ready" | "done";

export default function ResetPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // El enlace del correo puede llegar de tres formas y hay que cubrirlas todas:
  //   #access_token=…&refresh_token=…  plantilla por defecto de Supabase
  //   ?token_hash=…&type=recovery      plantilla con {{ .TokenHash }}
  //   ?code=…                          PKCE, ya canjeado por el cliente
  // La primera hay que montarla a mano con setSession: @supabase/ssr fuerza
  // flowType pkce y no reconoce el fragmento del flujo implícito.
  useEffect(() => {
    (async () => {
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      const tokenHash = new URLSearchParams(window.location.search).get("token_hash");

      // La URL se limpia ANTES de crear el cliente, no después: al construirse
      // con un fragmento de flujo implícito, el cliente pkce de @supabase/ssr
      // falla por dentro y se queda inservible para el resto de la página.
      // De paso, el token deja de estar en la barra de direcciones.
      if (accessToken || tokenHash) window.history.replaceState(null, "", "/reset");

      const supabase = createClient();

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) { setStatus("invalid"); return; }
      } else if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
        if (error) { setStatus("invalid"); return; }
      } else {
        const { data } = await supabase.auth.getSession();
        if (!data.session) { setStatus("invalid"); return; }
      }

      // El replaceState de arriba protege al cliente, pero el router de Next
      // vuelve a poner la URL original en la barra: hay que pedírselo a él.
      if (accessToken || tokenHash) router.replace("/reset");
      setStatus("ready");
    })();
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (pwd.length < MIN_PWD) { setErr(`La contraseña debe tener al menos ${MIN_PWD} caracteres.`); return; }
    if (pwd.length > MAX_PWD) { setErr("Contraseña demasiado larga."); return; }
    if (pwd !== confirmPwd) { setErr("Las contraseñas no coinciden."); return; }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: pwd });
      if (error) { setErr(error.message); setLoading(false); return; }

      // Se cierra la sesión de recuperación a propósito: quien entra lo hace
      // ya con la contraseña nueva, y así /login decide si toca /setup.
      await supabase.auth.signOut();
      setStatus("done");
      setTimeout(() => router.push("/login"), 2000);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error de conexión.");
      setLoading(false);
    }
  }

  const frame = (children: React.ReactNode) => (
    <div className="lo lo-darkframe" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 32, position: "relative" }}>
      <div className="lo-grain" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}/>
      {children}
    </div>
  );

  if (status === "checking") {
    return frame(<div style={{ color: "var(--text-low)", fontSize: 13 }}>Verificando enlace…</div>);
  }

  if (status === "invalid") {
    return frame(
      <div className="lo-card-elev" style={{ width: 420, padding: 36, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 24 }}>
          <LvlLogo size={22}/>
          <span style={{ fontFamily: "var(--font-display)", letterSpacing: "0.18em", fontSize: 13 }}>LVL ONE</span>
        </div>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(232,132,122,0.12)", display: "grid", placeItems: "center", margin: "0 auto 20px" }}>
          <Ico name="ban" size={24} color="#E8847A"/>
        </div>
        <h2 style={{ fontSize: 22, marginBottom: 10 }}>Enlace no válido</h2>
        <p style={{ color: "var(--text-mid)", fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
          Este enlace ya se usó o caducó. Pide uno nuevo y vuelve a intentarlo.
        </p>
        <Link href="/forgot" className="lo-btn lo-btn-primary" style={{ padding: "12px 24px", justifyContent: "center", width: "100%" }}>
          Pedir enlace nuevo <Ico name="arrow" size={14}/>
        </Link>
      </div>,
    );
  }

  if (status === "done") {
    return frame(
      <div className="lo-card-elev" style={{ width: 420, padding: 36, textAlign: "center" }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(214,168,79,0.12)", display: "grid", placeItems: "center", margin: "0 auto 20px" }}>
          <Ico name="check" size={24} color="var(--quest-gold-hi)"/>
        </div>
        <h2 style={{ fontSize: 22, marginBottom: 10 }}>Contraseña actualizada</h2>
        <p style={{ color: "var(--text-mid)", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          Ya puedes entrar con tu contraseña nueva.
        </p>
        <Link href="/login" className="lo-btn lo-btn-primary" style={{ padding: "12px 24px", justifyContent: "center", width: "100%" }}>
          Iniciar sesión <Ico name="arrow" size={14}/>
        </Link>
      </div>,
    );
  }

  return frame(
    <form onSubmit={submit} className="lo-card-elev" style={{ width: 420, padding: 36, position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <LvlLogo size={22}/>
        <span style={{ fontFamily: "var(--font-display)", letterSpacing: "0.18em", fontSize: 13 }}>LVL ONE</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(214,168,79,0.12)", display: "grid", placeItems: "center" }}>
          <Ico name="lock" size={18} color="var(--quest-gold-hi)"/>
        </div>
        <h2 style={{ fontSize: 22, margin: 0 }}>Nueva contraseña</h2>
      </div>
      <p style={{ color: "var(--text-mid)", fontSize: 13, marginBottom: 24, lineHeight: 1.5, marginLeft: 46 }}>
        Elige una contraseña de al menos {MIN_PWD} caracteres.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
        <div>
          <label htmlFor="reset-pwd" className="lo-label" style={{ marginBottom: 6 }}>Contraseña</label>
          <input
            id="reset-pwd"
            className="lo-input"
            type="password"
            autoComplete="new-password"
            placeholder={`Mínimo ${MIN_PWD} caracteres`}
            value={pwd}
            onChange={e => { setPwd(e.target.value); setErr(null); }}
            maxLength={MAX_PWD}
            autoFocus
          />
        </div>
        <div>
          <label htmlFor="reset-confirm" className="lo-label" style={{ marginBottom: 6 }}>Confirmar contraseña</label>
          <input
            id="reset-confirm"
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
        {loading ? "Guardando…" : <> Guardar contraseña <Ico name="arrow" size={14}/></>}
      </button>
    </form>,
  );
}
