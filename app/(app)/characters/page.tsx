"use client";
import { useRouter } from "next/navigation";
import { useApp, newDraft } from "@/lib/store";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { MAX_FREE_CHARACTERS } from "@/types/character";
import { CharCard } from "@/components/characters/CharCard";

export default function CharactersPage() {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const isLimit = state.characters.length >= MAX_FREE_CHARACTERS;

  const startNew = () => {
    if (isLimit) { dispatch({ type: "LIMIT_OPEN" }); return; }
    const d = newDraft();
    dispatch({ type: "DRAFT_INIT", draft: d });
    router.push(`/characters/${d.id}/edit/1`);
  };

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["LVL ONE", "Personajes"]}/>
      <div style={{ padding: "16px 32px 0", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", margin: "16px 0 24px" }}>
          <div>
            <h1 style={{ fontSize: 32, lineHeight: 1.1, marginBottom: 4 }}>Tus personajes</h1>
            <p style={{ color: "var(--text-mid)", fontSize: 14 }}>
              {state.characters.length} de {MAX_FREE_CHARACTERS} personajes gratuitos.
            </p>
          </div>
          <button type="button" className={isLimit ? "lo-btn lo-btn-ghost" : "lo-btn lo-btn-primary"} onClick={startNew} disabled={isLimit}>
            <Ico name="plus" size={14}/> Nuevo personaje
          </button>
        </div>

        {state.characters.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            minHeight: 320, gap: 16, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(214,168,79,0.10)",
              display: "grid", placeItems: "center" }}>
              <Ico name="user" size={28} color="var(--quest-gold-hi)"/>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--text-hi)", marginBottom: 6 }}>
                Aún no tienes personajes
              </div>
              <p style={{ fontSize: 14, color: "var(--text-low)", maxWidth: 320 }}>
                Crea tu primer personaje y empieza tu aventura en D&D 5e.
              </p>
            </div>
            <button type="button" className="lo-btn lo-btn-primary" onClick={startNew}>
              <Ico name="plus" size={14}/> Crear mi primer personaje
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {state.characters.map(c => <CharCard key={c.id} character={c}/>)}
            {!isLimit && (
              <button type="button" onClick={startNew} className="lo-card" style={{ minHeight: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, cursor: "pointer", borderStyle: "dashed" }}>
                <div style={{ width: 44, height: 44, borderRadius: 999, background: "rgba(214,168,79,0.10)", display: "grid", placeItems: "center" }}>
                  <Ico name="plus" size={20} color="var(--quest-gold-hi)"/>
                </div>
                <span style={{ fontSize: 13, color: "var(--text-mid)" }}>Nuevo personaje</span>
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
