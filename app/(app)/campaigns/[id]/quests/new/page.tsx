"use client";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { newQuest, QUEST_TYPE_LABEL, type QuestType } from "@/types/quest";
import { uid } from "@/lib/uid";

const QUEST_TYPES: QuestType[] = ["main", "side", "faction", "personal", "bounty"];

interface Props { params: Promise<{ id: string }> }
export default function NewQuestPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { state, dispatch } = useApp();
  const campaign = state.campaigns.find(c => c.id === id);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<QuestType>("side");
  const [description, setDescription] = useState("");
  const [reward, setReward] = useState("");
  const [consequences, setConsequences] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [objectives, setObjectives] = useState<string[]>([""]);

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

  const addObjective = () => setObjectives(o => [...o, ""]);
  const updateObjective = (i: number, val: string) => setObjectives(o => o.map((x, idx) => idx === i ? val : x));
  const removeObjective = (i: number) => setObjectives(o => o.filter((_, idx) => idx !== i));

  const save = () => {
    if (!title.trim()) return;
    const quest = newQuest(campaign.id, {
      title: title.trim(),
      type,
      description: description.trim(),
      reward: reward.trim(),
      consequences: consequences.trim(),
      timeLimit: timeLimit.trim() || undefined,
      objectives: objectives
        .filter(o => o.trim())
        .map(o => ({ id: uid(), description: o.trim(), completed: false })),
    });
    dispatch({ type: "QUEST_SAVE", campaignId: campaign.id, quest });
    router.push(`/campaigns/${campaign.id}/quests/${quest.id}`);
  };

  const field = (label: string, node: React.ReactNode) => (
    <div>
      <label style={{ display: "block", fontSize: 11, color: "var(--text-mid)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
      {node}
    </div>
  );

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["LVL ONE", "Campañas", campaign.name || "Detalle", "Quests", "Nueva"]}/>
      <div style={{ padding: "24px 32px 0", maxWidth: 780, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <Link href={`/campaigns/${campaign.id}/quests`} className="lo-btn lo-btn-ghost" style={{ padding: "6px 10px" }}>
            <Ico name="arrowLeft" size={14}/>
          </Link>
          <h1 style={{ fontSize: 22, margin: 0 }}>Nueva Quest</h1>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {field("Título *", <input className="lo-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Rescatar a los aldeanos"/>)}
            {field("Tipo", (
              <select className="lo-input" value={type} onChange={e => setType(e.target.value as QuestType)}>
                {QUEST_TYPES.map(t => <option key={t} value={t}>{QUEST_TYPE_LABEL[t]}</option>)}
              </select>
            ))}
          </div>

          {field("Descripción", (
            <textarea className="lo-input" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="¿De qué trata esta quest?" style={{ resize: "vertical" }}/>
          ))}

          <div>
            <label style={{ display: "block", fontSize: 11, color: "var(--text-mid)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Objetivos</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {objectives.map((obj, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ color: "var(--text-low)", fontSize: 13, width: 20, textAlign: "right" }}>{i + 1}.</span>
                  <input className="lo-input" value={obj} onChange={e => updateObjective(i, e.target.value)} placeholder={`Objetivo ${i + 1}`} style={{ flex: 1 }}/>
                  {objectives.length > 1 && (
                    <button onClick={() => removeObjective(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-low)", padding: 4 }} aria-label="Eliminar objetivo">
                      <Ico name="close" size={12}/>
                    </button>
                  )}
                </div>
              ))}
              <button className="lo-btn lo-btn-ghost" onClick={addObjective} style={{ alignSelf: "flex-start", fontSize: 12 }}>
                <Ico name="plus" size={12}/> Agregar objetivo
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {field("Recompensa", <input className="lo-input" value={reward} onChange={e => setReward(e.target.value)} placeholder="Ej: 500 PO, espada mágica"/>)}
            {field("Límite de tiempo", <input className="lo-input" value={timeLimit} onChange={e => setTimeLimit(e.target.value)} placeholder="Ej: 3 días, próxima luna llena"/>)}
          </div>

          {field("Consecuencias si falla", (
            <textarea className="lo-input" value={consequences} onChange={e => setConsequences(e.target.value)} rows={2} placeholder="¿Qué pasa si los jugadores fallan o ignoran esta quest?" style={{ resize: "vertical" }}/>
          ))}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <Link href={`/campaigns/${campaign.id}/quests`} className="lo-btn lo-btn-ghost">Cancelar</Link>
            <button className="lo-btn lo-btn-primary" onClick={save} disabled={!title.trim()}>
              <Ico name="plus" size={14}/> Crear quest
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
