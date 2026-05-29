"use client";
import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { LOCATION_TYPE_LABEL, LOCATION_TYPE_ICON, type LocationType } from "@/types/world";

interface Props { params: Promise<{ id: string; locationId: string }> }
export default function LocationDetailPage({ params }: Props) {
  const { id, locationId } = use(params);
  const router = useRouter();
  const { state, dispatch } = useApp();
  const campaign = state.campaigns.find(c => c.id === id);
  const loc = campaign?.locations?.find(l => l.id === locationId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(loc ?? null);

  if (!campaign || !loc || !draft) {
    return (
      <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
        <TopBar crumb={["LVL ONE", "Campañas", "Ubicación no encontrada"]}/>
        <div style={{ padding: "40px 32px", textAlign: "center" }}>
          <p style={{ color: "var(--text-mid)", marginBottom: 16 }}>Ubicación no encontrada.</p>
          <Link href={`/campaigns/${id}/world/locations`} className="lo-btn lo-btn-primary">Volver</Link>
        </div>
      </main>
    );
  }

  const isDm = campaign.dmId === (state.user?.email ?? "local-user");
  const linkedNpcs = (campaign.npcs ?? []).filter(n => loc.npcIds.includes(n.id));
  const linkedQuests = (campaign.quests ?? []).filter(q => loc.questIds.includes(q.id));
  const linkedFactions = (campaign.factions ?? []).filter(f => loc.factionIds.includes(f.id));

  const save = () => {
    dispatch({ type: "LOCATION_SAVE", campaignId: campaign.id, location: draft });
    setEditing(false);
  };

  const del = () => {
    if (confirm(`¿Eliminar "${loc.name}"?`)) {
      dispatch({ type: "LOCATION_DELETE", campaignId: campaign.id, locationId: loc.id });
      router.push(`/campaigns/${campaign.id}/world/locations`);
    }
  };

  const tf = (label: string, key: string, rows?: number) => (
    <div>
      <label style={{ fontSize: 11, color: "var(--text-low)", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
      {editing
        ? rows
          ? <textarea className="lo-input" rows={rows} value={(draft as unknown as Record<string, string>)[key] ?? ""} onChange={e => setDraft(d => d ? { ...d, [key]: e.target.value } : d)} style={{ resize: "vertical", fontSize: 13 }}/>
          : <input className="lo-input" value={(draft as unknown as Record<string, string>)[key] ?? ""} onChange={e => setDraft(d => d ? { ...d, [key]: e.target.value } : d)} style={{ fontSize: 13 }}/>
        : <p style={{ fontSize: 14, color: "var(--text-hi)", margin: 0, lineHeight: 1.5 }}>{(loc as unknown as Record<string, string>)[key] || "—"}</p>
      }
    </div>
  );

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["LVL ONE", "Campañas", campaign.name || "Detalle", "Mundo", "Ubicaciones", loc.name]}/>
      <div style={{ padding: "24px 32px 0", maxWidth: 780, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
          <Link href={`/campaigns/${campaign.id}/world/locations`} className="lo-btn lo-btn-ghost" style={{ padding: "6px 10px", flexShrink: 0 }}>
            <Ico name="arrowLeft" size={14}/>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: "var(--arcane-blue-lo)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Ico name={LOCATION_TYPE_ICON[loc.type]} size={22} color="var(--arcane-blue-hi)"/>
            </div>
            <div>
              <h1 style={{ fontSize: 22, margin: "0 0 4px" }}>{loc.name || "Sin nombre"}</h1>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {editing ? (
                  <select className="lo-input" value={draft.type} onChange={e => setDraft(d => d ? { ...d, type: e.target.value as LocationType } : d)} style={{ fontSize: 12, padding: "2px 6px" }}>
                    {(Object.keys(LOCATION_TYPE_LABEL) as LocationType[]).map(t => (
                      <option key={t} value={t}>{LOCATION_TYPE_LABEL[t]}</option>
                    ))}
                  </select>
                ) : (
                  <span style={{ fontSize: 12, color: "var(--arcane-blue-hi)", fontWeight: 600 }}>{LOCATION_TYPE_LABEL[loc.type]}</span>
                )}
                {loc.pin && <span style={{ fontSize: 11, color: "var(--text-low)" }}>· En el mapa</span>}
              </div>
            </div>
          </div>
          {isDm && (
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              {editing ? (
                <>
                  <button type="button" className="lo-btn lo-btn-ghost" onClick={() => { setDraft(loc); setEditing(false); }}>Cancelar</button>
                  <button type="button" className="lo-btn lo-btn-primary" onClick={save}><Ico name="check" size={13}/> Guardar</button>
                </>
              ) : (
                <>
                  <button type="button" className="lo-btn lo-btn-ghost" onClick={() => { setDraft({ ...loc }); setEditing(true); }}>
                    <Ico name="cog" size={13}/> Editar
                  </button>
                  <button type="button" className="lo-btn lo-btn-ghost" onClick={del} style={{ color: "#C28F8F", padding: "6px 10px" }}>
                    <Ico name="trash" size={14}/>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Name edit */}
        {editing && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: "var(--text-low)", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Nombre</label>
            <input className="lo-input" value={draft.name} onChange={e => setDraft(d => d ? { ...d, name: e.target.value } : d)} style={{ fontSize: 15, fontWeight: 600 }}/>
          </div>
        )}

        {/* Description */}
        <div className="lo-card" style={{ padding: 18, marginBottom: 16 }}>
          <h3 style={{ fontSize: 12, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Descripción</h3>
          {editing
            ? <textarea className="lo-input" rows={4} value={draft.description} onChange={e => setDraft(d => d ? { ...d, description: e.target.value } : d)} style={{ resize: "vertical" }}/>
            : <p style={{ fontSize: 14, color: "var(--text-mid)", margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{loc.description || "Sin descripción."}</p>
          }
        </div>

        {/* Details grid */}
        <div className="lo-card" style={{ padding: 18, marginBottom: 16 }}>
          <h3 style={{ fontSize: 12, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Detalles</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {tf("Clima / Entorno", "climate")}
            {tf("Gobierno / Autoridad", "government")}
            {tf("Economía", "economy")}
            {tf("Población", "population")}
          </div>
        </div>

        {/* Tags */}
        <div className="lo-card" style={{ padding: 18, marginBottom: 16 }}>
          <h3 style={{ fontSize: 12, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Etiquetas</h3>
          {editing
            ? <input className="lo-input" value={draft.tags.join(", ")} onChange={e => setDraft(d => d ? { ...d, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) } : d)} placeholder="Separadas por coma"/>
            : loc.tags.length > 0
              ? <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{loc.tags.map(t => <span key={t} className="lo-chip" style={{ fontSize: 11 }}>{t}</span>)}</div>
              : <p style={{ color: "var(--text-low)", fontSize: 13, margin: 0 }}>Sin etiquetas.</p>
          }
        </div>

        {/* DM notes */}
        {isDm && (
          <div className="lo-card" style={{ padding: 18, marginBottom: 16, borderColor: "rgba(194,143,143,0.3)" }}>
            <h3 style={{ fontSize: 12, color: "#C28F8F", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
              <Ico name="lock" size={12}/> Notas del DM
            </h3>
            {editing
              ? <textarea className="lo-input" rows={3} value={draft.notes ?? ""} onChange={e => setDraft(d => d ? { ...d, notes: e.target.value } : d)} style={{ resize: "vertical" }}/>
              : <p style={{ fontSize: 13, color: "var(--text-mid)", margin: 0, lineHeight: 1.5 }}>{loc.notes || "Sin notas."}</p>
            }
          </div>
        )}

        {/* Linked entities */}
        {(linkedNpcs.length > 0 || linkedQuests.length > 0 || linkedFactions.length > 0) && (
          <div className="lo-card" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 12, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Vinculados</h3>
            {linkedNpcs.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: "var(--text-low)", marginBottom: 6 }}>NPCs</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {linkedNpcs.map(n => (
                    <Link key={n.id} href={`/campaigns/${campaign.id}/npcs/${n.id}`} className="lo-chip" style={{ textDecoration: "none", fontSize: 12 }}>
                      <Ico name="user" size={11}/> {n.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {linkedQuests.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: "var(--text-low)", marginBottom: 6 }}>Quests</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {linkedQuests.map(q => (
                    <Link key={q.id} href={`/campaigns/${campaign.id}/quests/${q.id}`} className="lo-chip" style={{ textDecoration: "none", fontSize: 12 }}>
                      <Ico name="sword" size={11}/> {q.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {linkedFactions.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: "var(--text-low)", marginBottom: 6 }}>Facciones</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {linkedFactions.map(f => (
                    <Link key={f.id} href={`/campaigns/${campaign.id}/world/factions/${f.id}`} className="lo-chip" style={{ textDecoration: "none", fontSize: 12 }}>
                      <Ico name="flag" size={11}/> {f.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
