"use client";
import Link from "next/link";
import { useEffect } from "react";
import { Ico, LvlLogo } from "@/components/ui/icons";

export default function LandingPage() {
  useEffect(() => {
    // Always start at the top of the page
    window.scrollTo(0, 0);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".lo-reveal, .lo-reveal-left, .lo-reveal-right").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="lo lo-darkframe lo-landing-page" style={{ position: "relative", minHeight: "100vh", overflowX: "hidden" }}>
      <div className="lo-grain" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}></div>
      {/* Nav */}
      <header className="lo-landing-header" style={{ position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 48px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LvlLogo size={26}/>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "var(--text-hi)", letterSpacing: "0.18em" }}>LVL ONE</span>
          <span style={{ fontSize: 10, color: "var(--text-low)", border: "1px solid var(--line-strong)", padding: "2px 7px", borderRadius: 999, marginLeft: 4 }}>BETA</span>
        </div>
        <nav className="lo-landing-nav-links">
          <a href="#features">Funcionalidades</a>
          <a href="#pricing">Precios</a>
        </nav>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/login" className="lo-btn lo-btn-ghost" style={{ padding: "7px 14px", fontSize: 13 }}>Entrar</Link>
          <Link href="/register" className="lo-btn lo-btn-primary" style={{ padding: "7px 14px", fontSize: 13 }}>Crear cuenta</Link>
        </div>
      </header>

      {/* Beta banner */}
      <div style={{ background: "rgba(214,168,79,0.07)", borderBottom: "1px solid rgba(214,168,79,0.18)", padding: "10px 48px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 13, color: "var(--text-mid)" }}>
        <span className="lo-chip lo-chip-gold" style={{ fontSize: 10, padding: "2px 8px", flexShrink: 0 }}>BETA</span>
        <span>Character creator, encyclopedia, aprendizaje, grupos y herramientas DM disponibles ahora.</span>
        <span style={{ color: "var(--text-low)", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <Ico name="sparkle" size={11} color="var(--quest-gold-hi)"/> Campañas y más, próximamente.
        </span>
      </div>

      {/* Hero */}
      <section style={{ position: "relative", padding: "80px 56px 60px" }}>
        <div className="lo-hero-glow" aria-hidden="true" />
        <div className="lo-landing-hero-grid">
          <div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              <div className="lo-hero-chip lo-chip lo-chip-gold">
                <Ico name="sparkle" size={11}/> D&D 5e en español · Sin manuales de 600 páginas
              </div>
              <div className="lo-chip" style={{ background: "rgba(214,168,79,0.08)", border: "1px solid rgba(214,168,79,0.25)", color: "var(--quest-gold-hi)", fontSize: 11 }}>
                <Ico name="shield" size={10}/> Beta pública — acceso gratuito
              </div>
            </div>
            <h1 className="lo-hero-title lo-landing-hero-title">
              D&D 5e<br/>
              en <span className="lo-gradient-text">español</span>.<br/>
              Sin los manuales.
            </h1>
            <p className="lo-hero-desc" style={{ fontSize: 17, color: "var(--text-mid)", maxWidth: 520, marginBottom: 28, lineHeight: 1.6 }}>
              Crea personajes, aprende las reglas y guarda tu progreso — todo en español, diseñado para quienes se sienten perdidos en D&D.
            </p>
            <div className="lo-hero-btns" style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <Link href="/register" className="lo-btn lo-btn-primary" style={{ padding: "13px 22px", fontSize: 15 }}>
                Empezar gratis <Ico name="arrow" size={15}/>
              </Link>
              <a href="#problem" className="lo-btn lo-btn-ghost" style={{ padding: "13px 22px", fontSize: 15 }}>
                <Ico name="eye" size={15}/> Ver el problema
              </a>
            </div>
            <div className="lo-hero-tags" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-low)", fontSize: 12 }}>
                <div style={{ display: "flex" }}>
                  {[35, 50, 42, 28, 38].map((l, i) => (
                    <div key={i} style={{ width: 26, height: 26, borderRadius: 999, background: `hsl(${l}, 45%, 38%)`, border: "2px solid var(--obsidian)", marginLeft: i > 0 ? -9 : 0, zIndex: 5 - i }} />
                  ))}
                </div>
                <span>Beta activa — únete a los primeros aventureros</span>
              </div>
              <div style={{ display: "flex", gap: 20, color: "var(--text-low)", fontSize: 12 }}>
                {["Sin tarjeta", "2 personajes gratis", "Sin manuales", "En español"].map(t => (
                  <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <Ico name="check" size={13} color="var(--quest-gold-hi)"/> {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Hero card mock */}
          <div className="lo-hero-card lo-landing-hero-card lo-animate-float lo-card-elev" style={{ padding: 22, borderColor: "var(--line-gold)" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "linear-gradient(135deg, var(--arcane-blue), var(--quest-gold-lo))", display: "grid", placeItems: "center" }}>
                <Ico name="sword" size={20} color="white"/>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--text-hi)" }}>Kael Ironfist</div>
                <div style={{ fontSize: 12, color: "var(--text-mid)" }}>Semiorco · Bárbaro · Nv. 1</div>
              </div>
              <span className="lo-chip lo-chip-green" style={{ marginLeft: "auto" }}>Listo</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 14 }}>
              {[["FUE", 17, "+3"], ["DES", 12, "+1"], ["CON", 15, "+2"], ["INT", 8, "−1"], ["SAB", 10, "+0"], ["CAR", 11, "+0"]].map(([k, v, m]) => (
                <div key={String(k)} className="lo-stat">
                  <div className="lo-stat-label">{k}</div>
                  <div className="lo-stat-value">{v}</div>
                  <div className="lo-stat-mod">{m}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, fontSize: 12 }}>
              {[["PG", "15"], ["CA", "14"], ["Inic.", "+1"]].map(([k, v]) => (
                <div key={String(k)} style={{ textAlign: "center", padding: "8px 4px", borderRadius: 8, background: "rgba(244,231,197,0.04)", border: "1px solid var(--line)" }}>
                  <div style={{ color: "var(--text-low)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>{k}</div>
                  <div style={{ color: "var(--quest-gold-hi)", fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Pain */}
      <section id="problem" style={{ padding: "70px 56px", borderTop: "1px solid var(--line)", maxWidth: 960, margin: "0 auto" }}>
        <div className="lo-reveal lo-chip lo-chip-gold" style={{ marginBottom: 16 }}>El problema</div>
        <h2 className="lo-reveal lo-stagger-1" style={{ fontSize: 40, marginBottom: 14 }}>Lo que todos sienten al empezar.</h2>
        <p className="lo-reveal lo-stagger-2" style={{ color: "var(--text-mid)", marginBottom: 48, maxWidth: 560, fontSize: 15 }}>
          600 páginas. Todo en inglés. Y la sensación de que hay algo que nunca vas a entender. LVL ONE existe para que eso no pase.
        </p>
        <div className="lo-landing-2col">
          {[
            { icon: "x", t: "Sin LVL ONE", d: "Abres el manual. Hay 12 clases, 40 razas y 300 hechizos. ¿Por dónde empiezo? Te atascas en la primera decisión y cierras la pestaña." },
            { icon: "check", t: "Con LVL ONE", d: "Un wizard de 8 pasos te guía por cada decisión. Cada pantalla explica qué estás eligiendo y por qué importa. Personaje listo en 15 minutos." },
            { icon: "x", t: "Sin LVL ONE", d: "Buscas \"hechizo rayo\" en Google. Encuentras 5 versiones distintas. ¿Cuál es la oficial? ¿Funciona con mi clase? No hay forma de saberlo." },
            { icon: "check", t: "Con LVL ONE", d: "Encyclopedia filtrada por clase: solo ves los hechizos que puedes lanzar, con descripciones claras en español — sin jargon legal ni wikis desactualizadas." },
          ].map((item, i) => (
            <div key={i} className={`lo-card ${i % 2 === 0 ? 'lo-reveal-left' : 'lo-reveal-right'} lo-stagger-${(i % 4) + 1}`} style={{ padding: 22, borderColor: item.icon === "check" ? "rgba(91,122,74,0.3)" : "rgba(142,44,36,0.3)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: item.icon === "check" ? "rgba(91,122,74,0.2)" : "rgba(142,44,36,0.2)", display: "grid", placeItems: "center", color: item.icon === "check" ? "#A3C28F" : "#D66B5F" }}>
                  <Ico name={item.icon} size={14}/>
                </div>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--text-hi)" }}>{item.t}</span>
              </div>
              <p style={{ color: "var(--text-mid)", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: "70px 56px", borderTop: "1px solid var(--line)", maxWidth: 960, margin: "0 auto" }}>
        <h2 className="lo-reveal" style={{ fontSize: 44, marginBottom: 12 }}>Disponible ahora en beta.</h2>
        <p className="lo-reveal lo-stagger-1" style={{ color: "var(--text-mid)", marginBottom: 48, maxWidth: 560, fontSize: 15 }}>
          Crea personajes, aprende las reglas y juega con tu grupo — sin manuales, sin inglés, sin fricciones.
        </p>
        <div className="lo-landing-3col">
          {[
            { icon: "user", t: "Character Creator", d: "Wizard de 8 pasos con explicaciones en cada decisión: raza, subraza, clase, estadísticas, trasfondo y equipo.", badge: null },
            { icon: "shield", t: "Hoja de Personaje", d: "Stats, modificadores, HP tracker, CA, iniciativa, tiradas de salvación, habilidades, hechizos e inventario completo.", badge: null },
            { icon: "book", t: "Encyclopedia", d: "Razas, clases, hechizos y glosario con filtros, descripciones detalladas y explicaciones para principiantes.", badge: null },
            { icon: "compass", t: "Aprendizaje", d: "15 módulos interactivos que explican combate, magia, tiradas y mecánicas con ejemplos reales de mesa.", badge: null },
            { icon: "users", t: "Comunidad", d: "Crea o únete a mesas de juego, encuentra otros jugadores y comparte personajes con tu grupo.", badge: null },
            { icon: "scroll", t: "Campañas y más", d: "Gestión de campañas, combat tracker, generadores de NPCs y AI DM Assistant — en desarrollo para LVL ONE Pro.", badge: "Próximamente" },
          ].map((f, i) => (
            <div key={f.t} className={`lo-reveal lo-stagger-${i + 1} lo-card-elev`} style={{ padding: 22, opacity: f.badge ? 0.7 : 1 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(214,168,79,0.12)", display: "grid", placeItems: "center", color: "var(--quest-gold-hi)" }}>
                  <Ico name={f.icon} size={18}/>
                </div>
                {f.badge && <span className="lo-chip" style={{ fontSize: 10 }}>{f.badge}</span>}
              </div>
              <h3 style={{ fontSize: 17, marginBottom: 8 }}>{f.t}</h3>
              <p style={{ color: "var(--text-mid)", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Audience */}
      <section id="audience" style={{ padding: "70px 56px", borderTop: "1px solid var(--line)", maxWidth: 960, margin: "0 auto" }}>
        <div className="lo-reveal lo-chip lo-chip-gold" style={{ marginBottom: 16 }}>Para quién es</div>
        <h2 className="lo-reveal lo-stagger-1" style={{ fontSize: 40, marginBottom: 14 }}>Para los tres tipos de aventurero.</h2>
        <p className="lo-reveal lo-stagger-2" style={{ color: "var(--text-mid)", marginBottom: 48, maxWidth: 560, fontSize: 15 }}>
          Seas el que nunca ha tirado un dado, el que quiere dirigir, o el grupo que lleva meses sin arrancar — LVL ONE es el punto de partida.
        </p>
        <div className="lo-landing-3col-lg">
          {[
            { icon: "user", t: "Jugador nuevo", d: "Nunca has jugado D&D. No sabes qué es un \"tirada de salvación\". Nuestro wizard te explica cada decisión como si fuera tu primera partida." },
            { icon: "scroll", t: "Dungeon Master primerizo", d: "Quieres dirigir tu primera campaña pero no sabes cómo organizar sesiones, XP o notas. LVL ONE te da la estructura para no quemarte." },
            { icon: "dice", t: "Grupo de amigos", d: "Queréis empezar a jugar los viernes pero nadie quiere leerse el manual. Con LVL ONE todos pueden crear personaje y aprender en paralelo." },
          ].map((a, i) => (
            <div key={a.t} className={`lo-reveal lo-stagger-${i + 1} lo-card-elev`} style={{ padding: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(214,168,79,0.12)", display: "grid", placeItems: "center", color: "var(--quest-gold-hi)", marginBottom: 14 }}>
                <Ico name={a.icon} size={20}/>
              </div>
              <h3 style={{ fontSize: 18, marginBottom: 10 }}>{a.t}</h3>
              <p style={{ color: "var(--text-mid)", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{a.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={{ padding: "70px 56px", borderTop: "1px solid var(--line)", maxWidth: 960, margin: "0 auto", textAlign: "center" }}>
        <div className="lo-reveal lo-chip lo-chip-gold" style={{ marginBottom: 16 }}>Cómo funciona</div>
        <h2 className="lo-reveal lo-stagger-1" style={{ fontSize: 40, marginBottom: 14 }}>De cero a aventurero en tres pasos.</h2>
        <p className="lo-reveal lo-stagger-2" style={{ color: "var(--text-mid)", marginBottom: 48, maxWidth: 480, fontSize: 15, margin: "0 auto 48px" }}>Sin descargar nada. Sin leer manuales. Solo seguir el flujo.</p>
        <div className="lo-landing-3col-lg">
          {[
            { n: "01", icon: "user", t: "Crea tu personaje", d: "Un wizard de 8 pasos te lleva por raza, clase, estadísticas y trasfondo. Con explicaciones en cada decisión." },
            { n: "02", icon: "book", t: "Aprende las reglas", d: "15 módulos interactivos que explican PG, CA, hechizos y combate con ejemplos reales de mesa." },
            { n: "03", icon: "users", t: "Juega con tu grupo", d: "Crea o únete a una mesa de juego, comparte personajes y practica con el encounter builder y los dados integrados." },
          ].map((s, i) => (
            <div key={s.n} className={`lo-reveal lo-stagger-${i + 1} lo-card-elev`} style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 40, color: "rgba(214,168,79,0.2)", fontWeight: 700, lineHeight: 1 }}>{s.n}</span>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(214,168,79,0.12)", display: "grid", placeItems: "center", color: "var(--quest-gold-hi)" }}>
                  <Ico name={s.icon} size={18}/>
                </div>
              </div>
              <h3 style={{ fontSize: 19, marginBottom: 8 }}>{s.t}</h3>
              <p style={{ color: "var(--text-mid)", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Beta stats + community */}
      <section style={{ padding: "70px 56px", borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div className="lo-reveal" style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, marginBottom: 10 }}>Lo que te espera en la beta.</h2>
            <p style={{ color: "var(--text-mid)", fontSize: 15, maxWidth: 480, margin: "0 auto" }}>Acceso gratuito. Sin lista de espera. Empieza hoy mismo.</p>
          </div>
          <div className="lo-reveal lo-stagger-1" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderRadius: 14, overflow: "hidden", border: "1px solid var(--line-strong)" }}>
            {[
              { n: "2", label: "personajes gratis", sub: "sin tarjeta de crédito" },
              { n: "15", label: "módulos de aprendizaje", sub: "desde absoluto cero" },
              { n: "100%", label: "en español", sub: "razas, clases, hechizos" },
              { n: "0", label: "manuales necesarios", sub: "todo está explicado" },
            ].map((s, i) => (
              <div key={i} style={{ padding: "32px 20px", textAlign: "center", background: "var(--bg-elev-1)", borderRight: i < 3 ? "1px solid var(--line-strong)" : "none" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 44, color: "var(--quest-gold-hi)", fontWeight: 700, lineHeight: 1, marginBottom: 8 }}>{s.n}</div>
                <div style={{ fontSize: 13, color: "var(--text-hi)", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "var(--text-low)" }}>{s.sub}</div>
              </div>
            ))}
          </div>
          <div className="lo-reveal lo-stagger-2" style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 40, flexWrap: "wrap" }}>
            <Link href="/register" className="lo-btn lo-btn-primary" style={{ padding: "13px 24px", fontSize: 15 }}>
              Unirme a la beta — es gratis <Ico name="arrow" size={15}/>
            </Link>
            <a href="https://discord.gg/nwQ8pPVc6f" target="_blank" rel="noopener noreferrer" className="lo-btn lo-btn-ghost" style={{ padding: "13px 24px", fontSize: 15 }}>
              <Ico name="discord" size={15}/> Comunidad en Discord
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "70px 56px", borderTop: "1px solid var(--line)", maxWidth: 760, margin: "0 auto" }}>
        <div className="lo-reveal lo-chip lo-chip-gold" style={{ marginBottom: 16 }}>FAQ</div>
        <h2 className="lo-reveal lo-stagger-1" style={{ fontSize: 32, marginBottom: 32 }}>Preguntas frecuentes.</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { q: "¿Es gratuito?", a: "Sí. En la beta puedes crear hasta 2 personajes, acceder a toda la encyclopedia, los 15 módulos de aprendizaje, usar los dados, las herramientas de DM y unirte a grupos de juego — sin coste." },
            { q: "¿Necesito saber jugar D&D?", a: "No. LVL ONE está diseñado para principiantes. Cada pantalla explica lo que estás eligiendo y por qué importa." },
            { q: "¿Está en español?", a: "Sí, todo el contenido está en español: razas, clases, hechizos, glosario y módulos de aprendizaje." },
            { q: "¿Puedo usarlo en el móvil?", a: "Sí. LVL ONE es una app web responsive. Funciona en móvil, tablet y escritorio." },
            { q: "¿Es oficial de Wizards of the Coast?", a: "No. LVL ONE es un producto independiente. No está afiliado con Wizards of the Coast." },
            { q: "¿Qué diferencia a LVL ONE de D&D Beyond?", a: "D&D Beyond está en inglés y asume que ya conoces las reglas. LVL ONE explica todo en español y te guía paso a paso." },
          ].map((item, i) => (
            <details key={item.q} className={`lo-faq-item lo-reveal lo-stagger-${(i % 4) + 1}`}>
              <summary className="lo-faq-summary">{item.q}</summary>
              <div className="lo-faq-body-grid">
                <p className="lo-faq-body-text">{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="lo-reveal" style={{ padding: "70px 56px", borderTop: "1px solid var(--line)", textAlign: "center", maxWidth: 680, margin: "0 auto" }}>
        <h2 style={{ fontSize: 40, marginBottom: 12 }}>Empieza esta semana.</h2>
        <p style={{ color: "var(--text-mid)", fontSize: 16, marginBottom: 28, lineHeight: 1.6 }}>
          No necesitas saber nada de D&D. No necesitas tarjeta. Solo 15 minutos y querer jugar.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/register" className="lo-btn lo-btn-primary lo-animate-glow" style={{ padding: "14px 28px", fontSize: 16 }}>
            Crear mi primer personaje <Ico name="arrow" size={16}/>
          </Link>
          <a href="https://discord.gg/nwQ8pPVc6f" target="_blank" rel="noopener noreferrer" className="lo-btn lo-btn-ghost" style={{ padding: "14px 24px", fontSize: 15 }}>
            <Ico name="discord" size={15}/> Discord
          </a>
        </div>
        <p style={{ color: "var(--text-low)", fontSize: 12, marginTop: 16 }}>Sin tarjeta de crédito. Sin compromiso.</p>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: "70px 56px", borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 40, marginBottom: 14 }}>Simple y gratuito para empezar.</h2>
          <p style={{ color: "var(--text-mid)", marginBottom: 48, fontSize: 15 }}>Crea personajes, aprende las reglas y explora el mundo de D&D — sin coste.</p>
          <div className="lo-landing-2col">
            <div className="lo-card-elev" style={{ padding: 28, textAlign: "left" }}>
              <div className="lo-chip" style={{ marginBottom: 14 }}>Free</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 40, color: "var(--text-hi)", marginBottom: 4 }}>$0</div>
              <p style={{ color: "var(--text-low)", fontSize: 12, marginBottom: 20 }}>Para siempre</p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  "Hasta 2 personajes",
                  "Character Creator completo",
                  "Hoja de personaje editable",
                  "Encyclopedia (razas, clases, hechizos)",
                  "15 módulos de aprendizaje",
                  "Glosario completo",
                  "Dados + DM Tools",
                  "Perfiles y comunidad",
                ].map(f => (
                  <li key={f} style={{ display: "flex", gap: 9, fontSize: 13, alignItems: "center" }}>
                    <Ico name="check" size={14} color="var(--moss-green)"/> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="lo-btn lo-btn-ghost" style={{ width: "100%", justifyContent: "center" }}>Empezar gratis</Link>
            </div>
            <div className="lo-card-elev" style={{ padding: 28, textAlign: "left", borderColor: "var(--line-gold)" }}>
              <div className="lo-chip lo-chip-gold" style={{ marginBottom: 14 }}>Pro · Próximamente</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 40, color: "var(--quest-gold-hi)", marginBottom: 4, display: "flex", alignItems: "center", gap: 10 }}>
                <span className="lo-skeleton" style={{ width: 70, height: 32 }} />
              </div>
              <p style={{ color: "var(--text-low)", fontSize: 12, marginBottom: 20, opacity: 0.5 }}>por determinar</p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  "Personajes ilimitados",
                  "PDF de hoja de personaje",
                  "Campañas y gestión de sesiones",
                  "Combat tracker + encounter builder",
                  "Generadores de NPCs, tabernas y tesoros",
                  "AI DM Assistant",
                  "Mapas interactivos",
                  "Módulos avanzados",
                ].map(f => (
                  <li key={f} style={{ display: "flex", gap: 9, fontSize: 13, alignItems: "center" }}>
                    <Ico name="check" size={14} color="var(--quest-gold-hi)"/> {f}
                  </li>
                ))}
              </ul>
              <button className="lo-btn lo-btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled>Próximamente</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="lo-landing-footer" style={{ borderTop: "1px solid var(--line)", padding: "28px 56px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-low)", fontSize: 12, flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LvlLogo size={20}/>
          <span>LVL ONE © 2026 · ZIVELO</span>
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <a href="#features" style={{ color: "var(--text-low)", textDecoration: "none" }}>Funcionalidades</a>
          <a href="#pricing" style={{ color: "var(--text-low)", textDecoration: "none" }}>Precios</a>
          <a href="https://discord.gg/nwQ8pPVc6f" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-low)", textDecoration: "none" }}>Discord</a>
        </div>
        <p style={{ margin: 0, maxWidth: 400, textAlign: "right", lineHeight: 1.5 }}>
          Producto no oficial. D&D 5e es propiedad de Wizards of the Coast LLC.
        </p>
      </footer>
    </main>
  );
}
