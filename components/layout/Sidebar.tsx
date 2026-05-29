"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Ico, LvlLogo } from "@/components/ui/icons";
import { useApp } from "@/lib/store";
import { createClient } from "@/lib/supabaseClient";
import { xpToLevel } from "@/types/gamification";

const NAV = [
  { href: "/dashboard",    label: "Inicio",       icon: "compass" },
  { href: "/characters",   label: "Personajes",   icon: "scroll" },
  { href: "/learn",        label: "Aprender",     icon: "book"    },
  { href: "/encyclopedia", label: "Enciclopedia", icon: "eye"     },
  { href: "/glossary",          label: "Glosario",    icon: "search"  },
  { href: "/groups",            label: "Grupos",      icon: "users"   },
  { href: "/dice",             label: "Dados",        icon: "d20"     },
  { href: "/dm-tools",         label: "DM Tools",     icon: "wand"    },
];

const NAV_MOBILE = NAV.slice(0, 5);

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { state, dispatch } = useApp();
  const [xpData, setXpData] = useState<{ total: number; level: number } | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    if (!state.user) return;
    fetch("/api/xp")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.total != null) setXpData({ total: d.total, level: xpToLevel(d.total) });
      })
      .catch(() => {});
  }, [state.user]);

  async function handleLogout() {
    await createClient().auth.signOut();
    dispatch({ type: "LOGOUT" });
    router.push("/login");
  }

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="lo-sidebar" style={{
        flexShrink: 0,
        borderRight: "1px solid var(--line)",
        background: "rgba(0,0,0,0.3)",
        flexDirection: "column",
        padding: "20px 14px",
        position: "sticky", top: 0,
        overflowY: "auto",
      }}>
        <div className="lo-sidebar-inner" style={{ width: 192, display: "flex", flexDirection: "column", height: "100%" }}>
          <Link href="/dashboard" className="lo-sidebar-logo" style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px 18px", borderBottom: "1px solid var(--line)", marginBottom: 16, textDecoration: "none", flexShrink: 0 }}>
            <LvlLogo size={26}/>
            <div>
              <div style={{ fontFamily: "var(--font-display)", letterSpacing: "0.18em", fontSize: 13, color: "var(--text-hi)", fontWeight: 600 }}>LVL ONE</div>
              <div style={{ fontSize: 10, color: "var(--text-low)" }}>Free · MVP</div>
            </div>
          </Link>

          <nav style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
            {NAV.map(it => (
              <Link key={it.href} href={it.href} style={{
                display: "flex", alignItems: "center", gap: 9,
                padding: "9px 10px", borderRadius: 8, fontSize: 13,
                background: isActive(it.href) ? "rgba(214,168,79,0.12)" : "transparent",
                color: isActive(it.href) ? "var(--quest-gold-hi)" : "var(--text-mid)",
                textDecoration: "none",
                transition: "background .12s, color .12s",
              }}>
                <Ico name={it.icon} size={15}/>
                <span className="lo-sidebar-label">{it.label}</span>
              </Link>
            ))}
          </nav>

          <div className="lo-sidebar-user" style={{ borderTop: "1px solid var(--line)", paddingTop: 14, marginTop: 14, flexShrink: 0 }}>
            <Link href="/account" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, textDecoration: "none", borderRadius: 8, padding: "4px 6px", margin: "0 -6px 8px", background: pathname === "/account" ? "rgba(214,168,79,0.08)" : "transparent", transition: "background .12s" }}>
              <div style={{ width: 30, height: 30, borderRadius: 999, background: "linear-gradient(135deg, var(--quest-gold-lo), var(--arcane-blue))", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600, color: "var(--text-hi)", flexShrink: 0 }}>
                {state.user?.username?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div style={{ overflow: "hidden", flex: 1 }}>
                <div style={{ color: "var(--text-hi)", fontWeight: 600, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{state.user?.username ?? "Invitado"}</div>
                <div style={{ fontSize: 10, color: "var(--text-low)" }}>
                  {xpData ? `Nv ${xpData.level} · ${xpData.total} XP` : `Free · ${state.characters.length}/2`}
                </div>
              </div>
            </Link>
            {xpData && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
                  <div style={{
                    width: `${Math.min(((xpData.total % 500) / 500) * 100, 100)}%`,
                    height: "100%", background: "var(--quest-gold-hi)", borderRadius: 2,
                    transition: "width .4s",
                  }}/>
                </div>
              </div>
            )}
            <button onClick={() => setConfirmLogout(true)} style={{ fontSize: 11, color: "var(--text-low)", cursor: "pointer", padding: 0, background: "none", border: "none" }}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Logout confirmation modal */}
      {confirmLogout && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={() => setConfirmLogout(false)}
        >
          <div
            className="lo-card-elev"
            style={{ width: "100%", maxWidth: 340, padding: 24, borderRadius: 14 }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 38, height: 38, borderRadius: 999, background: "rgba(180,58,46,0.15)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Ico name="x" size={16} color="#E8847A"/>
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "var(--text-hi)" }}>¿Cerrar sesión?</h3>
                <p style={{ fontSize: 12, color: "var(--text-low)", margin: 0, marginTop: 2 }}>Tendrás que volver a iniciar sesión para acceder.</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setConfirmLogout(false)}
                className="lo-btn lo-btn-ghost"
                style={{ flex: 1, justifyContent: "center" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="lo-btn"
                style={{ flex: 1, justifyContent: "center", background: "rgba(180,58,46,0.2)", color: "#E8847A", border: "1px solid rgba(180,58,46,0.35)" }}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <nav className="lo-bottom-nav lo-no-print">
        {NAV_MOBILE.map(it => (
          <Link key={it.href} href={it.href} className={isActive(it.href) ? "active" : ""}>
            <Ico name={it.icon} size={18}/>
            {it.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
