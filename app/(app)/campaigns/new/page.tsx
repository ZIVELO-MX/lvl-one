"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { createCampaign } from "@/lib/campaign-api";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { newCampaign, type CampaignStatus } from "@/types/campaign";

const COVER_COLORS = [
  "#4A5D78", "#5B7A4A", "#7A4A4A", "#6A4A7A", "#4A7A6A",
  "#8B6F4E", "#3D5A73", "#734A3D", "#5A4A73", "#4A735A",
];

export default function NewCampaignPage() {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [setting, setSetting] = useState("");
  const [coverColor, setCoverColor] = useState(COVER_COLORS[0]);
  const [status, setStatus] = useState<CampaignStatus>("planning");
  const [allowMulticlass, setAllowMulticlass] = useState(true);
  const [allowFeats, setAllowFeats] = useState(true);
  const [allowHomebrew, setAllowHomebrew] = useState(false);
  const [startingLevel, setStartingLevel] = useState(1);
  const [statGeneration, setStatGeneration] = useState<"standard" | "roll" | "point-buy">("standard");
  const [saving, setSaving] = useState(false);

  const dmId = state.user?.email ?? "local-user";

  const save = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      const local = newCampaign(dmId, {
        name: name.trim(),
        description: description.trim(),
        setting: setting.trim(),
        coverColor,
        status,
        rules: { allowMulticlass, allowFeats, allowHomebrew, startingLevel, statGeneration },
      });
      const api = await createCampaign(local);
      const merged = { ...local, ...api };
      dispatch({ type: "CAMPAIGN_SAVE", campaign: merged });
      router.push(`/campaigns/${local.id}`);
    } catch {
      dispatch({ type: "TOAST", toast: "Error al crear la campaña" });
      setSaving(false);
    }
  };

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["LVL ONE", "Campañas", "Nueva"]}/>
      <div style={{ padding: "16px 32px 0", maxWidth: 720, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, marginBottom: 4 }}>Nueva campaña</h1>
        <p style={{ color: "var(--text-mid)", fontSize: 14, marginBottom: 24 }}>Configura los detalles básicos de tu nueva aventura.</p>

        <div className="lo-card" style={{ padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, marginBottom: 16 }}>Información general</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--text-mid)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Nombre de la campaña</label>
              <input className="lo-input" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: La Sombra del Dragón" autoFocus/>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--text-mid)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Ambientación</label>
              <input className="lo-input" value={setting} onChange={e => setSetting(e.target.value)} placeholder="Ej: Forgotten Realms, Eberron, mundo casero..."/>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--text-mid)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Descripción</label>
              <textarea className="lo-input" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe la premisa de tu campaña..." style={{ resize: "vertical" }}/>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--text-mid)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Color de portada</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {COVER_COLORS.map(c => (
                  <button type="button" key={c} onClick={() => setCoverColor(c)} style={{ width: 32, height: 32, borderRadius: 8, background: c, border: coverColor === c ? "2px solid white" : "2px solid transparent", outline: coverColor === c ? "2px solid var(--quest-gold-hi)" : "none", cursor: "pointer" }} aria-label={`Color ${c}`}/>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--text-mid)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Estado</label>
              <div style={{ display: "flex", gap: 8 }}>
                {(["planning", "active", "paused"] as CampaignStatus[]).map(s => (
                  <button type="button" key={s} onClick={() => setStatus(s)} className={`lo-btn ${status === s ? "lo-btn-primary" : "lo-btn-ghost"}`} style={{ padding: "6px 12px", fontSize: 12 }}>
                    {s === "planning" ? "Planificación" : s === "active" ? "Activa" : "Pausada"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lo-card" style={{ padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, marginBottom: 16 }}>Reglas de la campaña</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14 }}>Multiclase permitida</span>
              <button type="button" onClick={() => setAllowMulticlass(!allowMulticlass)} className={`lo-btn ${allowMulticlass ? "lo-btn-primary" : "lo-btn-ghost"}`} style={{ padding: "6px 14px", fontSize: 12 }}>
                {allowMulticlass ? "Sí" : "No"}
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14 }}>Feats permitidos</span>
              <button type="button" onClick={() => setAllowFeats(!allowFeats)} className={`lo-btn ${allowFeats ? "lo-btn-primary" : "lo-btn-ghost"}`} style={{ padding: "6px 14px", fontSize: 12 }}>
                {allowFeats ? "Sí" : "No"}
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14 }}>Homebrew permitido</span>
              <button type="button" onClick={() => setAllowHomebrew(!allowHomebrew)} className={`lo-btn ${allowHomebrew ? "lo-btn-primary" : "lo-btn-ghost"}`} style={{ padding: "6px 14px", fontSize: 12 }}>
                {allowHomebrew ? "Sí" : "No"}
              </button>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--text-mid)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Nivel inicial</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input type="range" min={1} max={20} value={startingLevel} onChange={e => setStartingLevel(Number(e.target.value))} style={{ flex: 1 }}/>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 20, minWidth: 32 }}>{startingLevel}</span>
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--text-mid)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Generación de stats</label>
              <div style={{ display: "flex", gap: 8 }}>
                {(["standard", "roll", "point-buy"] as const).map(m => (
                  <button type="button" key={m} onClick={() => setStatGeneration(m)} className={`lo-btn ${statGeneration === m ? "lo-btn-primary" : "lo-btn-ghost"}`} style={{ padding: "6px 12px", fontSize: 12 }}>
                    {m === "standard" ? "Array estándar" : m === "roll" ? "Tirar dados" : "Compra de puntos"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button type="button" className="lo-btn lo-btn-ghost" onClick={() => router.push("/campaigns")}>Cancelar</button>
          <button type="button" className="lo-btn lo-btn-primary" onClick={save} disabled={!name.trim() || saving}>
            <Ico name="save" size={14}/> {saving ? "Guardando..." : "Crear campaña"}
          </button>
        </div>
      </div>
    </main>
  );
}
