"use client";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { newLocation, LOCATION_TYPE_LABEL, type LocationType } from "@/types/world";

interface Props { params: Promise<{ id: string }> }
export default function NewLocationPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { state, dispatch } = useApp();
  const campaign = state.campaigns.find(c => c.id === id);

  const [form, setForm] = useState({
    name: "",
    type: "other" as LocationType,
    description: "",
    climate: "",
    government: "",
    economy: "",
    population: "",
    notes: "",
    tags: "",
  });

  if (!campaign) return null;

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const save = () => {
    if (!form.name.trim()) return;
    const loc = newLocation(campaign.id, {
      name: form.name.trim(),
      type: form.type,
      description: form.description.trim(),
      climate: form.climate.trim() || undefined,
      government: form.government.trim() || undefined,
      economy: form.economy.trim() || undefined,
      population: form.population.trim() || undefined,
      notes: form.notes.trim() || undefined,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
    });
    dispatch({ type: "LOCATION_SAVE", campaignId: campaign.id, location: loc });
    router.push(`/campaigns/${campaign.id}/world/locations/${loc.id}`);
  };

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["LVL ONE", "Campañas", campaign.name || "Detalle", "Mundo", "Nueva Ubicación"]}/>
      <div style={{ padding: "24px 32px 0", maxWidth: 680, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <Link href={`/campaigns/${campaign.id}/world/locations`} className="lo-btn lo-btn-ghost" style={{ padding: "6px 10px" }}>
            <Ico name="arrowLeft" size={14}/>
          </Link>
          <h2 style={{ fontSize: 20, margin: 0 }}>Nueva Ubicación</h2>
        </div>

        <div className="lo-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-low)", display: "block", marginBottom: 4 }}>Nombre *</label>
              <input className="lo-input" value={form.name} onChange={set("name")} placeholder="Ej: Ciudad de Waterdeep" autoFocus/>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-low)", display: "block", marginBottom: 4 }}>Tipo</label>
              <select className="lo-input" value={form.type} onChange={set("type")}>
                {(Object.keys(LOCATION_TYPE_LABEL) as LocationType[]).map(t => (
                  <option key={t} value={t}>{LOCATION_TYPE_LABEL[t]}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: "var(--text-low)", display: "block", marginBottom: 4 }}>Descripción</label>
            <textarea className="lo-input" rows={3} value={form.description} onChange={set("description")} placeholder="Describe brevemente este lugar..." style={{ resize: "vertical" }}/>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              ["Clima / Entorno", "climate", "Ej: Frío, montañoso, costero"],
              ["Gobierno / Autoridad", "government", "Ej: Oligarquía de magos"],
              ["Economía / Comercio", "economy", "Ej: Comercio marítimo, pesca"],
              ["Población", "population", "Ej: ~50.000 habitantes"],
            ].map(([lbl, key, ph]) => (
              <div key={key}>
                <label style={{ fontSize: 12, color: "var(--text-low)", display: "block", marginBottom: 4 }}>{lbl}</label>
                <input className="lo-input" value={(form as Record<string, string>)[key]} onChange={set(key)} placeholder={ph} style={{ fontSize: 13 }}/>
              </div>
            ))}
          </div>

          <div>
            <label style={{ fontSize: 12, color: "var(--text-low)", display: "block", marginBottom: 4 }}>Notas del DM</label>
            <textarea className="lo-input" rows={3} value={form.notes} onChange={set("notes")} placeholder="Información privada, ganchos de trama, secretos..." style={{ resize: "vertical" }}/>
          </div>

          <div>
            <label style={{ fontSize: 12, color: "var(--text-low)", display: "block", marginBottom: 4 }}>Etiquetas (separadas por coma)</label>
            <input className="lo-input" value={form.tags} onChange={set("tags")} placeholder="Ej: capital, segura, comercio"/>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
          <Link href={`/campaigns/${campaign.id}/world/locations`} className="lo-btn lo-btn-ghost">Cancelar</Link>
          <button className="lo-btn lo-btn-primary" onClick={save} disabled={!form.name.trim()}>
            <Ico name="check" size={13}/> Crear ubicación
          </button>
        </div>
      </div>
    </main>
  );
}
