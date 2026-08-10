"use client";
import { useState, use } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { newWorldLore, LORE_CATEGORY_LABEL, type LoreCategory } from "@/types/world";

const CATEGORY_COLORS: Record<LoreCategory, string> = {
  history: "var(--quest-gold-hi)",
  religion: "#C28FA3",
  magic: "var(--arcane-blue-hi)",
  geography: "#A3C28F",
  politics: "#C9956A",
  legend: "#A3A3C2",
  other: "var(--text-low)",
};

interface Props { params: Promise<{ id: string }> }
export default function LorePage({ params }: Props) {
  const { id } = use(params);
  const { state, dispatch } = useApp();
  const campaign = state.campaigns.find(c => c.id === id);
  const [filter, setFilter] = useState<LoreCategory | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "", category: "other" as LoreCategory, tags: "" });

  if (!campaign) return null;

  const lore = (campaign.worldLore ?? []).filter(l => filter === "all" || l.category === filter);
  const allLore = campaign.worldLore ?? [];
  const isDm = campaign.dmId === (state.user?.email ?? "local-user");

  const startCreate = () => { setForm({ title: "", content: "", category: "other", tags: "" }); setCreating(true); setEditing(null); };
  const startEdit = (id: string) => {
    const entry = allLore.find(l => l.id === id);
    if (!entry) return;
    setForm({ title: entry.title, content: entry.content, category: entry.category, tags: entry.tags.join(", ") });
    setEditing(id);
    setCreating(false);
  };

  const saveLore = () => {
    if (!form.title.trim()) return;
    if (editing) {
      const entry = allLore.find(l => l.id === editing);
      if (!entry) return;
      dispatch({ type: "WORLD_LORE_SAVE", campaignId: campaign.id, lore: { ...entry, title: form.title.trim(), content: form.content.trim(), category: form.category, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) } });
      setEditing(null);
    } else {
      const entry = newWorldLore(campaign.id, { title: form.title.trim(), content: form.content.trim(), category: form.category, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) });
      dispatch({ type: "WORLD_LORE_SAVE", campaignId: campaign.id, lore: entry });
      setCreating(false);
      setExpanded(entry.id);
    }
  };

  const deleteLore = (id: string) => {
    if (confirm("¿Eliminar esta entrada de lore?")) {
      dispatch({ type: "WORLD_LORE_DELETE", campaignId: campaign.id, loreId: id });
      if (expanded === id) setExpanded(null);
    }
  };

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["LVL ONE", "Campañas", campaign.name || "Detalle", "Mundo", "Lore"]}/>
      <div style={{ padding: "24px 32px 0", maxWidth: 780, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href={`/campaigns/${campaign.id}/world`} className="lo-btn lo-btn-ghost" style={{ padding: "6px 10px" }}>
              <Ico name="arrowLeft" size={14}/>
            </Link>
            <h2 style={{ fontSize: 20, margin: 0 }}>Lore <span style={{ fontSize: 14, color: "var(--text-low)", fontWeight: 400 }}>({allLore.length})</span></h2>
          </div>
          {isDm && <button type="button" className="lo-btn lo-btn-primary" onClick={startCreate}><Ico name="plus" size={13}/> Nueva entrada</button>}
        </div>

        {/* Category filter */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
          <button type="button" onClick={() => setFilter("all")} className="lo-btn lo-btn-ghost" style={{ fontSize: 12, padding: "4px 12px", borderBottom: filter === "all" ? "2px solid var(--quest-gold-hi)" : "2px solid transparent", color: filter === "all" ? "var(--quest-gold-hi)" : "var(--text-mid)" }}>
            Todo ({allLore.length})
          </button>
          {(Object.keys(LORE_CATEGORY_LABEL) as LoreCategory[]).map(cat => {
            const count = allLore.filter(l => l.category === cat).length;
            if (count === 0) return null;
            return (
              <button type="button" key={cat} onClick={() => setFilter(cat)} className="lo-btn lo-btn-ghost" style={{ fontSize: 12, padding: "4px 12px", borderBottom: filter === cat ? `2px solid ${CATEGORY_COLORS[cat]}` : "2px solid transparent", color: filter === cat ? CATEGORY_COLORS[cat] : "var(--text-mid)" }}>
                {LORE_CATEGORY_LABEL[cat]} ({count})
              </button>
            );
          })}
        </div>

        {/* Create form */}
        {creating && (
          <div className="lo-card" style={{ padding: 20, marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px" }}>Nueva entrada</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label htmlFor="lore-new-title" style={{ fontSize: 11, color: "var(--text-low)", display: "block", marginBottom: 4 }}>Título *</label>
                <input id="lore-new-title" className="lo-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ej: La Gran Guerra de los Dioses"/>
              </div>
              <div>
                <label htmlFor="lore-new-category" style={{ fontSize: 11, color: "var(--text-low)", display: "block", marginBottom: 4 }}>Categoría</label>
                <select id="lore-new-category" className="lo-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as LoreCategory }))}>
                  {(Object.keys(LORE_CATEGORY_LABEL) as LoreCategory[]).map(c => <option key={c} value={c}>{LORE_CATEGORY_LABEL[c]}</option>)}
                </select>
              </div>
            </div>
            <label htmlFor="lore-new-content" style={{ fontSize: 11, color: "var(--text-low)", display: "block", marginBottom: 4 }}>Contenido</label>
            <textarea id="lore-new-content" className="lo-input" rows={6} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Contenido de la entrada de lore..." style={{ marginBottom: 12, resize: "vertical" }}/>
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="lore-new-tags" style={{ fontSize: 11, color: "var(--text-low)", display: "block", marginBottom: 4 }}>Etiquetas</label>
              <input id="lore-new-tags" className="lo-input" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="Separadas por coma"/>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="lo-btn lo-btn-ghost" onClick={() => setCreating(false)}>Cancelar</button>
              <button type="button" className="lo-btn lo-btn-primary" onClick={saveLore} disabled={!form.title.trim()}><Ico name="check" size={13}/> Guardar</button>
            </div>
          </div>
        )}

        {/* Lore list */}
        {lore.length === 0 && !creating ? (
          <div className="lo-card" style={{ padding: 40, textAlign: "center" }}>
            <Ico name="scroll" size={32} color="var(--text-low)"/>
            <p style={{ color: "var(--text-mid)", marginTop: 12, marginBottom: 16 }}>
              {filter === "all" ? "No hay entradas de lore todavía." : `No hay entradas en "${LORE_CATEGORY_LABEL[filter as LoreCategory]}".`}
            </p>
            {isDm && filter === "all" && <button type="button" className="lo-btn lo-btn-primary" onClick={startCreate}>Crear primera entrada</button>}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {lore.map(entry => (
              <div key={entry.id} className="lo-card" style={{ padding: 0, overflow: "hidden" }}>
                <button type="button" onClick={() => setExpanded(expanded === entry.id ? null : entry.id)} style={{ width: "100%", background: "none", border: "none", padding: "14px 16px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: CATEGORY_COLORS[entry.category], flexShrink: 0 }}/>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-hi)" }}>{entry.title}</span>
                    <span style={{ fontSize: 11, color: CATEGORY_COLORS[entry.category], fontWeight: 500 }}>{LORE_CATEGORY_LABEL[entry.category]}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {entry.tags.slice(0, 2).map(t => <span key={t} className="lo-chip" style={{ fontSize: 10 }}>{t}</span>)}
                    <Ico name="chevron" size={14} color="var(--text-low)"/>
                  </div>
                </button>

                {expanded === entry.id && (
                  <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border-lo)" }}>
                    {editing === entry.id ? (
                      <div style={{ paddingTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                          <div>
                            <label htmlFor={`lore-edit-title-${entry.id}`} style={{ fontSize: 11, color: "var(--text-low)", display: "block", marginBottom: 4 }}>Título</label>
                            <input id={`lore-edit-title-${entry.id}`} className="lo-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}/>
                          </div>
                          <div>
                            <label htmlFor={`lore-edit-category-${entry.id}`} style={{ fontSize: 11, color: "var(--text-low)", display: "block", marginBottom: 4 }}>Categoría</label>
                            <select id={`lore-edit-category-${entry.id}`} className="lo-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as LoreCategory }))}>
                              {(Object.keys(LORE_CATEGORY_LABEL) as LoreCategory[]).map(c => <option key={c} value={c}>{LORE_CATEGORY_LABEL[c]}</option>)}
                            </select>
                          </div>
                        </div>
                        <label htmlFor={`lore-edit-content-${entry.id}`} style={{ fontSize: 11, color: "var(--text-low)", display: "block", marginBottom: -4 }}>Contenido</label>
                        <textarea id={`lore-edit-content-${entry.id}`} className="lo-input" rows={6} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} style={{ resize: "vertical" }}/>
                        <label htmlFor={`lore-edit-tags-${entry.id}`} style={{ fontSize: 11, color: "var(--text-low)", display: "block", marginBottom: -4 }}>Etiquetas</label>
                        <input id={`lore-edit-tags-${entry.id}`} className="lo-input" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="Separadas por coma"/>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button type="button" className="lo-btn lo-btn-ghost" onClick={() => setEditing(null)}>Cancelar</button>
                          <button type="button" className="lo-btn lo-btn-primary" onClick={saveLore}><Ico name="check" size={13}/> Guardar</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ paddingTop: 14 }}>
                        <p style={{ fontSize: 14, color: "var(--text-mid)", margin: "0 0 12px", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{entry.content || "Sin contenido."}</p>
                        {entry.tags.length > 0 && (
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
                            {entry.tags.map(t => <span key={t} className="lo-chip" style={{ fontSize: 11 }}>{t}</span>)}
                          </div>
                        )}
                        {isDm && (
                          <div style={{ display: "flex", gap: 8 }}>
                            <button type="button" className="lo-btn lo-btn-ghost" onClick={() => startEdit(entry.id)} style={{ fontSize: 12 }}><Ico name="cog" size={12}/> Editar</button>
                            <button type="button" className="lo-btn lo-btn-ghost" onClick={() => deleteLore(entry.id)} style={{ fontSize: 12, color: "#C28F8F" }}><Ico name="trash" size={12}/></button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
