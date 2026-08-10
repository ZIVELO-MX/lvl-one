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

const FIELD_LABEL_STYLE: React.CSSProperties = { display: "block", fontSize: 11, color: "var(--text-mid)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" };

const field = (htmlFor: string, label: string, node: React.ReactNode) => (
  <div>
    <label htmlFor={htmlFor} style={FIELD_LABEL_STYLE}>{label}</label>
    {node}
  </div>
);

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
            {field("npc-name", "Nombre *", <input id="npc-name" className="lo-input" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Enna la tabernera"/>)}
            {field("npc-race", "Raza", <input id="npc-race" className="lo-input" value={race} onChange={e => setRace(e.target.value)} placeholder="Ej: Halfling"/>)}
            {field("npc-occupation", "Ocupación", <input id="npc-occupation" className="lo-input" value={occupation} onChange={e => setOccupation(e.target.value)} placeholder="Ej: Tabernera, Mercader"/>)}
            {field("npc-location", "Ubicación habitual", <input id="npc-location" className="lo-input" value={location} onChange={e => setLocation(e.target.value)} placeholder="Ej: La Espada Rota, Neverwinter"/>)}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {field("npc-disposition", "Disposición", (
              <select id="npc-disposition" className="lo-input" value={disposition} onChange={e => setDisposition(e.target.value as NPCDisposition)}>
                {DISPOSITIONS.map(d => <option key={d} value={d}>{DISPOSITION_LABEL[d]}</option>)}
              </select>
            ))}
            {field("npc-alignment", "Alineamiento", (
              <select id="npc-alignment" className="lo-input" value={alignment} onChange={e => setAlignment(e.target.value as NPCAlignment | "")}>
                <option value="">Sin definir</option>
                {ALIGNMENTS.map(a => <option key={a} value={a}>{ALIGNMENT_LABEL[a]}</option>)}
              </select>
            ))}
          </div>

          {field("npc-appearance", "Apariencia", <textarea id="npc-appearance" className="lo-input" value={appearance} onChange={e => setAppearance(e.target.value)} rows={2} placeholder="Descripción física breve" style={{ resize: "vertical" }}/>)}
          {field("npc-personality", "Personalidad", <textarea id="npc-personality" className="lo-input" value={personality} onChange={e => setPersonality(e.target.value)} rows={2} placeholder="Rasgos de personalidad" style={{ resize: "vertical" }}/>)}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            {field("npc-ideals", "Ideales", <input id="npc-ideals" className="lo-input" value={ideals} onChange={e => setIdeals(e.target.value)} placeholder="Lo que lo motiva"/>)}
            {field("npc-bonds", "Vínculos", <input id="npc-bonds" className="lo-input" value={bonds} onChange={e => setBonds(e.target.value)} placeholder="Lo que le importa"/>)}
            {field("npc-flaws", "Defectos", <input id="npc-flaws" className="lo-input" value={flaws} onChange={e => setFlaws(e.target.value)} placeholder="Su debilidad"/>)}
          </div>

          {field("npc-secrets", "Secretos (solo DM)", <textarea id="npc-secrets" className="lo-input" value={secrets} onChange={e => setSecrets(e.target.value)} rows={2} placeholder="Secretos que los jugadores no conocen" style={{ resize: "vertical" }}/>)}
          {field("npc-backstory", "Historia", <textarea id="npc-backstory" className="lo-input" value={backstory} onChange={e => setBackstory(e.target.value)} rows={3} placeholder="Trasfondo e historia del NPC" style={{ resize: "vertical" }}/>)}
          {field("npc-tags", "Etiquetas (separadas por coma)", <input id="npc-tags" className="lo-input" value={tags} onChange={e => setTags(e.target.value)} placeholder="Ej: aliado, comerciante, sospechoso"/>)}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <Link href={`/campaigns/${campaign.id}/npcs`} className="lo-btn lo-btn-ghost">Cancelar</Link>
            <button type="button" className="lo-btn lo-btn-primary" onClick={save} disabled={!name.trim()}>
              <Ico name="plus" size={14}/> Crear NPC
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
