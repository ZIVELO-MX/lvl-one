"use client";
import { useState, useRef, use } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { TopBar } from "@/components/layout/AppShell";
import { Ico } from "@/components/ui/icons";
import { LOCATION_TYPE_ICON, LOCATION_TYPE_LABEL } from "@/types/world";
import type { Location } from "@/types/world";

const PIN_COLORS: Record<string, string> = {
  city: "var(--quest-gold-hi)",
  town: "#C9956A",
  village: "#A3C28F",
  dungeon: "#C28F8F",
  wilderness: "#7EC882",
  fortress: "#9E8FC2",
  ruin: "#B0A080",
  temple: "#C28FA3",
  port: "var(--arcane-blue-hi)",
  other: "var(--text-mid)",
};

interface Props { params: Promise<{ id: string }> }
export default function WorldMapPage({ params }: Props) {
  const { id } = use(params);
  const { state, dispatch } = useApp();
  const campaign = state.campaigns.find(c => c.id === id);
  const [placing, setPlacing] = useState<Location | null>(null);
  const [tooltip, setTooltip] = useState<{ loc: Location; x: number; y: number } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  if (!campaign) return null;

  const isDm = campaign.dmId === (state.user?.email ?? "local-user");
  const locations = campaign.locations ?? [];
  const pinned = locations.filter(l => l.pin);
  const unpinned = locations.filter(l => !l.pin);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!placing || !mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    dispatch({ type: "LOCATION_SAVE", campaignId: campaign.id, location: { ...placing, pin: { locationId: placing.id, x, y } } });
    setPlacing(null);
  };

  const removePin = (loc: Location) => {
    dispatch({ type: "LOCATION_SAVE", campaignId: campaign.id, location: { ...loc, pin: undefined } });
  };

  return (
    <main className="lo-page-enter" style={{ padding: "0 0 60px" }}>
      <TopBar crumb={["LVL ONE", "Campañas", campaign.name || "Detalle", "Mundo", "Mapa"]}/>
      <div style={{ padding: "24px 32px 0", maxWidth: 960, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href={`/campaigns/${campaign.id}/world`} className="lo-btn lo-btn-ghost" style={{ padding: "6px 10px" }}>
              <Ico name="arrowLeft" size={14}/>
            </Link>
            <h2 style={{ fontSize: 20, margin: 0 }}>Mapa del mundo</h2>
          </div>
          {placing && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, color: "var(--quest-gold-hi)", fontWeight: 500 }}>
                Colocando: <strong>{placing.name}</strong> — haz clic en el mapa
              </span>
              <button className="lo-btn lo-btn-ghost" onClick={() => setPlacing(null)}>Cancelar</button>
            </div>
          )}
        </div>

        {/* Map canvas */}
        <div
          ref={mapRef}
          onClick={handleMapClick}
          style={{
            position: "relative",
            width: "100%",
            paddingBottom: "56.25%",
            background: "linear-gradient(135deg, #2A2318 0%, #1E1A12 40%, #242019 70%, #1C1810 100%)",
            borderRadius: 12,
            border: "2px solid var(--border-lo)",
            cursor: placing ? "crosshair" : "default",
            overflow: "hidden",
            marginBottom: 20,
          }}
        >
          {/* Parchment texture overlay */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 20% 30%, rgba(180,150,80,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(120,80,40,0.06) 0%, transparent 50%)", pointerEvents: "none" }}/>

          {/* Grid lines */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.07, pointerEvents: "none" }}>
            {Array.from({ length: 10 }, (_, i) => (
              <g key={i}>
                <line x1={`${i * 10}%`} y1="0" x2={`${i * 10}%`} y2="100%" stroke="#D6A84F" strokeWidth="0.5"/>
                <line x1="0" y1={`${i * 10}%`} x2="100%" y2={`${i * 10}%`} stroke="#D6A84F" strokeWidth="0.5"/>
              </g>
            ))}
          </svg>

          {/* Compass rose */}
          <div style={{ position: "absolute", bottom: 16, right: 16, opacity: 0.3, pointerEvents: "none" }}>
            <Ico name="compass" size={40} color="var(--quest-gold-hi)"/>
          </div>

          {/* Empty state */}
          {pinned.length === 0 && !placing && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <Ico name="map" size={36} color="var(--text-low)"/>
              <p style={{ color: "var(--text-low)", fontSize: 13, marginTop: 8 }}>
                {unpinned.length > 0 ? "Selecciona una ubicación para colocarla en el mapa" : "Crea ubicaciones para añadirlas al mapa"}
              </p>
            </div>
          )}

          {/* Pins */}
          {pinned.map(loc => {
            const pin = loc.pin!;
            const color = PIN_COLORS[loc.type] ?? "var(--text-mid)";
            return (
              <div
                key={loc.id}
                style={{ position: "absolute", left: `${pin.x}%`, top: `${pin.y}%`, transform: "translate(-50%, -100%)", zIndex: 10, cursor: "pointer" }}
                onMouseEnter={() => { const rect = mapRef.current?.getBoundingClientRect(); if (rect) setTooltip({ loc, x: pin.x, y: pin.y }); }}
                onMouseLeave={() => setTooltip(null)}
                onClick={(e) => { e.stopPropagation(); if (!placing) window.location.href = `/campaigns/${campaign.id}/world/locations/${loc.id}`; }}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50% 50% 50% 0", background: `${color}dd`, border: `2px solid ${color}`, boxShadow: `0 2px 8px ${color}44`, transform: "rotate(-45deg)", display: "grid", placeItems: "center" }}>
                    <div style={{ transform: "rotate(45deg)" }}>
                      <Ico name={LOCATION_TYPE_ICON[loc.type]} size={13} color="white"/>
                    </div>
                  </div>
                  <span style={{ fontSize: 9, color, fontWeight: 700, textShadow: "0 1px 2px rgba(0,0,0,0.8)", whiteSpace: "nowrap", marginTop: 4 }}>{loc.name}</span>
                </div>
              </div>
            );
          })}

          {/* Tooltip */}
          {tooltip && (
            <div style={{ position: "absolute", left: `${tooltip.x}%`, top: `${tooltip.y}%`, transform: "translate(-50%, calc(-100% - 40px))", zIndex: 20, background: "var(--surface-hi)", border: "1px solid var(--border-lo)", borderRadius: 8, padding: "8px 12px", pointerEvents: "none", maxWidth: 180, boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-hi)", marginBottom: 2 }}>{tooltip.loc.name}</div>
              <div style={{ fontSize: 11, color: PIN_COLORS[tooltip.loc.type] }}>{LOCATION_TYPE_LABEL[tooltip.loc.type]}</div>
              {tooltip.loc.description && <p style={{ fontSize: 11, color: "var(--text-mid)", margin: "4px 0 0", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{tooltip.loc.description}</p>}
            </div>
          )}
        </div>

        {/* Sidebar: unplaced + placed list */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Unplaced */}
          <div className="lo-card" style={{ padding: 16 }}>
            <h3 style={{ fontSize: 12, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
              Sin colocar ({unpinned.length})
            </h3>
            {unpinned.length === 0
              ? <p style={{ fontSize: 13, color: "var(--text-low)", margin: 0 }}>Todas las ubicaciones están en el mapa.</p>
              : unpinned.map(loc => (
                <div key={loc.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid var(--border-lo)" }}>
                  <Ico name={LOCATION_TYPE_ICON[loc.type]} size={13} color={PIN_COLORS[loc.type]}/>
                  <span style={{ flex: 1, fontSize: 13, color: "var(--text-hi)" }}>{loc.name}</span>
                  {isDm && (
                    <button className="lo-btn lo-btn-ghost" onClick={() => setPlacing(loc)} style={{ fontSize: 11, padding: "3px 8px" }}>
                      <Ico name="pin" size={11}/> Colocar
                    </button>
                  )}
                </div>
              ))
            }
            {locations.length === 0 && (
              <Link href={`/campaigns/${campaign.id}/world/locations/new`} className="lo-btn lo-btn-ghost" style={{ fontSize: 12, marginTop: 8 }}>
                <Ico name="plus" size={12}/> Nueva ubicación
              </Link>
            )}
          </div>

          {/* Placed */}
          <div className="lo-card" style={{ padding: 16 }}>
            <h3 style={{ fontSize: 12, color: "var(--text-low)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
              En el mapa ({pinned.length})
            </h3>
            {pinned.length === 0
              ? <p style={{ fontSize: 13, color: "var(--text-low)", margin: 0 }}>Coloca ubicaciones haciendo clic en el mapa.</p>
              : pinned.map(loc => (
                <div key={loc.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid var(--border-lo)" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: PIN_COLORS[loc.type], flexShrink: 0 }}/>
                  <Link href={`/campaigns/${campaign.id}/world/locations/${loc.id}`} style={{ flex: 1, fontSize: 13, color: "var(--text-hi)", textDecoration: "none" }}>{loc.name}</Link>
                  <span style={{ fontSize: 11, color: "var(--text-low)" }}>{Math.round(loc.pin!.x)}%, {Math.round(loc.pin!.y)}%</span>
                  {isDm && (
                    <button onClick={() => removePin(loc)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-low)", padding: "2px 4px" }} title="Quitar del mapa">
                      <Ico name="x" size={12}/>
                    </button>
                  )}
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </main>
  );
}
