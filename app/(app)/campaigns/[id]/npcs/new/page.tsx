"use client";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { newNPC, DISPOSITION_LABEL, ALIGNMENT_LABEL, type NPCDisposition, type NPCAlignment } from "@/types/npc";

const DISPOSITIONS: NPCDisposition[] = ["friendly", "neutral", "hostile", "unknown"];
const ALIGNMENTS: NPCAlignment[] = ["lg", "ng", "cg", "ln", "tn", "cn", "le", "ne", "ce"];

interface Props { params: Promise<{ id: string }> }
export default function NewNpcPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { state, dispatch } = useApp();
  const campaign = state.campaigns.find(c => c.id === id);

  const [name, setName] = useState("");
  const [race, setRace] = useState("");
  const [occupation, setOccupation] = useState("");
  const [location, setLocation] = useState("");
  const [disposition, setDisposition] = useState<NPCDisposition>("neutral");
  const [alignment, setAlignment] = useState<NPCAlignment | "">("");
  const [appearance, setAppearance] = useState("");
  const [personality, setPersonality] = useState("");
  const [ideals, setIdeals] = useState("");
  const [bonds, setBonds] = useState("");
  const [flaws, setFlaws] = useState("");
  const [secrets, setSecrets] = useState("");
  const [backstory, setBackstory] = useState("");
  const [tags, setTags] = useState("");

  if (!campaign) {
    return (
      <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
        <TopBar crumb={["LVL ONE", "Campañas", "No encontrada"]}/>
        <div style={{ padding: "40px 32px", textAlign: "center" }}>
          <Link href="/campaigns" className="lo-btn lo-btn-primary">Volver</Link>
        </div>
      </main>
    );
  }

  const save = () => {
    if (!name.trim()) return;
    const npc = newNPC(campaign.id, {
      name: name.trim(),
      race: race.trim() || undefined,
      occupation: occupation.trim() || undefined,
      location: location.trim() || undefined,
      disposition,
      alignment: alignment || undefined,
      appearance: appearance.trim() || undefined,
      personality: personality.trim() || undefined,
      ideals: ideals.trim() || undefined,
      bonds: bonds.trim() || undefined,
      flaws: flaws.trim() || undefined,
      secrets: secrets.trim() || undefined,
      backstory: backstory.trim() || undefined,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
    });
    dispatch({ type: "NPC_SAVE", campaignId: campaign.id, npc });
    router.push(`/campaigns/${campaign.id}/npcs/${npc.id}`);
  };

  const field = (label: string, node: React.ReactNode) => (
    <div>
      <label style={{ display: "block", fontSize: 11, color: "var(--text-mid)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
      {node}
    </div>
  );

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["LVL ONE", "Campañas", campaign.name || "Detalle", "NPCs", "Nuevo"]}/>
      <div style={{ padding: "24px 32px 0", maxWidth: 780, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <Link href={`/campaigns/${campaign.id}/npcs`} className="lo-btn lo-btn-ghost" style={{ padding: "6px 10px" }}>
            <Ico name="arrowLeft" size={14}/>
          </Link>
          <h1 style={{ fontSize: 22, margin: 0 }}>Nuevo NPC</h1>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {field("Nombre *", <input className="lo-input" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Enna la tabernera"/>)}
            {field("Raza", <input className="lo-input" value={race} onChange={e => setRace(e.target.value)} placeholder="Ej: Halfling"/>)}
            {field("Ocupación", <input className="lo-input" value={occupation} onChange={e => setOccupation(e.target.value)} placeholder="Ej: Tabernera, Mercader"/>)}
            {field("Ubicación habitual", <input className="lo-input" value={location} onChange={e => setLocation(e.target.value)} placeholder="Ej: La Espada Rota, Neverwinter"/>)}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {field("Disposición", (
              <select className="lo-input" value={disposition} onChange={e => setDisposition(e.target.value as NPCDisposition)}>
                {DISPOSITIONS.map(d => <option key={d} value={d}>{DISPOSITION_LABEL[d]}</option>)}
              </select>
            ))}
            {field("Alineamiento", (
              <select className="lo-input" value={alignment} onChange={e => setAlignment(e.target.value as NPCAlignment | "")}>
                <option value="">Sin definir</option>
                {ALIGNMENTS.map(a => <option key={a} value={a}>{ALIGNMENT_LABEL[a]}</option>)}
              </select>
            ))}
          </div>

          {field("Apariencia", <textarea className="lo-input" value={appearance} onChange={e => setAppearance(e.target.value)} rows={2} placeholder="Descripción física breve" style={{ resize: "vertical" }}/>)}
          {field("Personalidad", <textarea className="lo-input" value={personality} onChange={e => setPersonality(e.target.value)} rows={2} placeholder="Rasgos de personalidad" style={{ resize: "vertical" }}/>)}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            {field("Ideales", <input className="lo-input" value={ideals} onChange={e => setIdeals(e.target.value)} placeholder="Lo que lo motiva"/>)}
            {field("Vínculos", <input className="lo-input" value={bonds} onChange={e => setBonds(e.target.value)} placeholder="Lo que le importa"/>)}
            {field("Defectos", <input className="lo-input" value={flaws} onChange={e => setFlaws(e.target.value)} placeholder="Su debilidad"/>)}
          </div>

          {field("Secretos (solo DM)", <textarea className="lo-input" value={secrets} onChange={e => setSecrets(e.target.value)} rows={2} placeholder="Secretos que los jugadores no conocen" style={{ resize: "vertical" }}/>)}
          {field("Historia", <textarea className="lo-input" value={backstory} onChange={e => setBackstory(e.target.value)} rows={3} placeholder="Trasfondo e historia del NPC" style={{ resize: "vertical" }}/>)}
          {field("Etiquetas (separadas por coma)", <input className="lo-input" value={tags} onChange={e => setTags(e.target.value)} placeholder="Ej: aliado, comerciante, sospechoso"/>)}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <Link href={`/campaigns/${campaign.id}/npcs`} className="lo-btn lo-btn-ghost">Cancelar</Link>
            <button className="lo-btn lo-btn-primary" onClick={save} disabled={!name.trim()}>
              <Ico name="plus" size={14}/> Crear NPC
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
