"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { BookmarkButton } from "@/components/social/BookmarkButton";

interface PublicCharacter {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  ownerUsername: string;
}

interface PublicCampaign {
  id: string;
  name: string;
  description: string;
  sessionCount: number;
  dmUsername: string;
}

interface ExploreData {
  characters: PublicCharacter[];
  campaigns: PublicCampaign[];
}

type Tab = "campaigns" | "characters";

export default function ExplorePage() {
  const [data, setData] = useState<ExploreData>({ characters: [], campaigns: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("campaigns");
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/campaigns?public=true").then(r => r.ok ? r.json() : { campaigns: [] }),
      fetch("/api/characters?public=true").then(r => r.ok ? r.json() : { characters: [] }),
    ]).then(([camps, chars]) => {
      setData({
        campaigns: camps.campaigns ?? camps ?? [],
        characters: chars.characters ?? chars ?? [],
      });
    }).finally(() => setLoading(false));
  }, []);

  const filteredCampaigns = data.campaigns.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredChars = data.characters.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.race?.toLowerCase().includes(search.toLowerCase()) ||
    c.class?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 80px" }}>
      <TopBar crumb={["Comunidad", "Explorar"]}/>

      <div style={{ padding: "20px 32px 0", maxWidth: 1000, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div className="lo-chip lo-chip-gold" style={{ marginBottom: 10 }}>
            <Ico name="globe" size={10}/> Comunidad
          </div>
          <h1 style={{ fontSize: 28, marginBottom: 6 }}>Explorar</h1>
          <p style={{ color: "var(--text-low)", fontSize: 14 }}>Descubre campañas y personajes de la comunidad LVL ONE.</p>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <Ico name="search" size={14} color="var(--text-low)"/>
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar campañas, personajes..."
            style={{
              width: "100%", padding: "10px 12px 10px 36px", borderRadius: 8,
              background: "rgba(255,255,255,0.04)", border: "1px solid var(--line)",
              color: "var(--text-hi)", fontSize: 13, outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid var(--line)", paddingBottom: 0 }}>
          {([["campaigns", "Campañas", "book"], ["characters", "Personajes", "scroll"]] as const).map(([id, label, icon]) => (
            <button type="button"
              key={id}
              onClick={() => setTab(id)}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "10px 16px",
                background: "none", border: "none", cursor: "pointer", fontSize: 13,
                color: tab === id ? "var(--quest-gold-hi)" : "var(--text-low)",
                borderBottom: tab === id ? "2px solid var(--quest-gold-hi)" : "2px solid transparent",
                marginBottom: -1, transition: "color .12s",
              }}
            >
              <Ico name={icon} size={13}/>
              {label}
              <span style={{ fontSize: 11, background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "1px 7px", color: "var(--text-low)" }}>
                {id === "campaigns" ? filteredCampaigns.length : filteredChars.length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
            {[1,2,3,4,5,6].map(i => <div key={`skel-${i}`} className="lo-skeleton" style={{ height: 110, borderRadius: 10 }}/>)}
          </div>
        ) : tab === "campaigns" ? (
          filteredCampaigns.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-low)" }}>
              <Ico name="book" size={32} color="var(--text-low)"/>
              <p style={{ marginTop: 10 }}>No hay campañas públicas todavía.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
              {filteredCampaigns.map(camp => (
                <div key={camp.id} className="lo-card-elev" style={{ padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: "var(--text-hi)" }}>{camp.name}</h3>
                    <BookmarkButton targetType="campaign" targetId={camp.id}/>
                  </div>
                  {camp.description && (
                    <p style={{ fontSize: 12, color: "var(--text-low)", margin: "0 0 10px", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {camp.description}
                    </p>
                  )}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Link href={`/profile/${camp.dmUsername}`} style={{ fontSize: 11, color: "var(--text-low)", textDecoration: "none" }}>
                      por @{camp.dmUsername}
                    </Link>
                    <span style={{ fontSize: 11, color: "var(--text-low)" }}>
                      {camp.sessionCount ?? 0} sesiones
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          filteredChars.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-low)" }}>
              <Ico name="scroll" size={32} color="var(--text-low)"/>
              <p style={{ marginTop: 10 }}>No hay personajes públicos todavía.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
              {filteredChars.map(char => (
                <div key={char.id} className="lo-card-elev" style={{ padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: "var(--text-hi)" }}>{char.name}</h3>
                    <BookmarkButton targetType="character" targetId={char.id}/>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-low)", marginBottom: 8 }}>
                    {char.race} · {char.class} · Nv {char.level}
                  </div>
                  <Link href={`/profile/${char.ownerUsername}`} style={{ fontSize: 11, color: "var(--text-low)", textDecoration: "none" }}>
                    por @{char.ownerUsername}
                  </Link>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </main>
  );
}
