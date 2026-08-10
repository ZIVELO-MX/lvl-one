"use client";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { newFaction } from "@/types/world";

interface Props { params: Promise<{ id: string }> }
export default function NewFactionPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { state, dispatch } = useApp();
  const campaign = state.campaigns.find(c => c.id === id);

  const [form, setForm] = useState({
    name: "",
    description: "",
    goals: "",
    symbol: "",
    tags: "",
  });

  if (!campaign) return null;

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const save = () => {
    if (!form.name.trim()) return;
    const faction = newFaction(campaign.id, {
      name: form.name.trim(),
      description: form.description.trim(),
      goals: form.goals.trim() || undefined,
      symbol: form.symbol.trim() || undefined,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
    });
    dispatch({ type: "FACTION_SAVE", campaignId: campaign.id, faction });
    router.push(`/campaigns/${campaign.id}/world/factions/${faction.id}`);
  };

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["LVL ONE", "Campañas", campaign.name || "Detalle", "Mundo", "Nueva Facción"]}/>
      <div style={{ padding: "24px 32px 0", maxWidth: 640, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <Link href={`/campaigns/${campaign.id}/world/factions`} className="lo-btn lo-btn-ghost" style={{ padding: "6px 10px" }}>
            <Ico name="arrowLeft" size={14}/>
          </Link>
          <h2 style={{ fontSize: 20, margin: 0 }}>Nueva Facción</h2>
        </div>

        <div className="lo-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label htmlFor="faction-name" style={{ fontSize: 12, color: "var(--text-low)", display: "block", marginBottom: 4 }}>Nombre *</label>
            <input id="faction-name" className="lo-input" value={form.name} onChange={set("name")} placeholder="Ej: La Orden del Fénix"/>
          </div>
          <div>
            <label htmlFor="faction-description" style={{ fontSize: 12, color: "var(--text-low)", display: "block", marginBottom: 4 }}>Descripción</label>
            <textarea id="faction-description" className="lo-input" rows={3} value={form.description} onChange={set("description")} placeholder="¿Quiénes son? ¿Qué representan?" style={{ resize: "vertical" }}/>
          </div>
          <div>
            <label htmlFor="faction-goals" style={{ fontSize: 12, color: "var(--text-low)", display: "block", marginBottom: 4 }}>Objetivos</label>
            <textarea id="faction-goals" className="lo-input" rows={2} value={form.goals} onChange={set("goals")} placeholder="¿Qué quieren lograr?" style={{ resize: "vertical" }}/>
          </div>
          <div>
            <label htmlFor="faction-symbol" style={{ fontSize: 12, color: "var(--text-low)", display: "block", marginBottom: 4 }}>Símbolo / Emblema</label>
            <input id="faction-symbol" className="lo-input" value={form.symbol} onChange={set("symbol")} placeholder="Descripción del símbolo visual"/>
          </div>
          <div>
            <label htmlFor="faction-tags" style={{ fontSize: 12, color: "var(--text-low)", display: "block", marginBottom: 4 }}>Etiquetas (separadas por coma)</label>
            <input id="faction-tags" className="lo-input" value={form.tags} onChange={set("tags")} placeholder="Ej: gremio, comercio, secreta"/>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
          <Link href={`/campaigns/${campaign.id}/world/factions`} className="lo-btn lo-btn-ghost">Cancelar</Link>
          <button type="button" className="lo-btn lo-btn-primary" onClick={save} disabled={!form.name.trim()}>
            <Ico name="check" size={13}/> Crear facción
          </button>
        </div>
      </div>
    </main>
  );
}
