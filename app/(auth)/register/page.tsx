import Link from "next/link";
import { LvlLogo, Ico } from "@/components/ui/icons";

export default function RegisterPage() {
  return (
    <div className="lo lo-darkframe" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 32, position: "relative" }}>
      <div className="lo-grain" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}/>
      <Link href="/" style={{ position: "absolute", top: 24, left: 32, display: "flex", alignItems: "center", gap: 8, color: "var(--text-mid)", fontSize: 13, textDecoration: "none" }}>
        <Ico name="arrowLeft" size={14}/> Volver
      </Link>

      <div className="lo-card-elev" style={{ width: 420, padding: 36, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 24 }}>
          <LvlLogo size={22}/>
          <span style={{ fontFamily: "var(--font-display)", letterSpacing: "0.18em", fontSize: 13 }}>LVL ONE</span>
        </div>

        <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(214,168,79,0.12)", display: "grid", placeItems: "center", margin: "0 auto 20px" }}>
          <Ico name="shield" size={24} color="var(--quest-gold-hi)"/>
        </div>

        <h2 style={{ fontSize: 22, marginBottom: 10 }}>Acceso por invitación</h2>
        <p style={{ color: "var(--text-mid)", fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>
          LVL ONE está en <strong style={{ color: "var(--text-hi)" }}>beta cerrada</strong>.
          El registro público abrirá pronto.
        </p>
        <p style={{ color: "var(--text-low)", fontSize: 13, lineHeight: 1.6, marginBottom: 28 }}>
          Si recibiste una invitación, entra directamente con el email y la contraseña provisional que te enviamos.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Link href="/login" className="lo-btn lo-btn-primary" style={{ padding: "12px 24px", justifyContent: "center" }}>
            Tengo una invitación <Ico name="arrow" size={14}/>
          </Link>
          <a
            href="https://discord.gg/nwQ8pPVc6f"
            target="_blank"
            rel="noopener noreferrer"
            className="lo-btn lo-btn-ghost"
            style={{ padding: "12px 24px", justifyContent: "center" }}
          >
            <Ico name="discord" size={14}/> Solicitar acceso en Discord
          </a>
        </div>
      </div>
    </div>
  );
}
