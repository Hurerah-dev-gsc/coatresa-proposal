"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ───── helper: animate count-up ───── */
function animateCounter(el: HTMLElement, target: number, suffix = "", duration = 1500) {
  const t0 = performance.now();
  const step = (now: number) => {
    const p = Math.min((now - t0) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target + suffix;
  };
  requestAnimationFrame(step);
}

/* ───── data ───── */
const NAV_ITEMS = [
  { href: "#portada", label: "Introducción" },
  { href: "#workshop", label: "El Workshop" },
  { href: "#recorrido", label: "Recorrido" },
  { href: "#propuesta", label: "Propuesta" },
  { href: "#contacto", label: "Agenda el workshop y rellena el formulario" },
];

const DINAMICAS = [
  { n: "0", title: "Formulario inteligente", desc: "La IA recoge sistemas, fuentes y fricciones por área, y genera los borradores.", result: null },
  { n: "1", title: "Radiografía actual", desc: "Validamos el inventario del formulario previo.", result: "Mapa de sistemas y datos confirmado" },
  { n: "2", title: "Fricciones por departamento", desc: "Completamos el mapa con todas las áreas.", result: "Inventario de fricciones y casos por área" },
  { n: "3", title: "Matriz Impacto × Viabilidad", desc: "En vivo: situamos cada caso y acordamos por dónde empezar.", result: "Casos priorizados y primer ciclo definido" },
  { n: "4", title: "Semáforo de datos", desc: "Clasificamos qué se puede compartir: verde, ámbar, rojo.", result: "Base para política de datos y accesos por rol" },
];

const FASES = [
  { id: "00", title: "Workshop transversal", desc: "Mapeo y priorización en toda la empresa. Punto de entrada, descontable.", border: "#0025FF" },
  { id: "01", title: "Fundamentos", desc: "Ordenamos las fuentes y montamos la infraestructura base.", border: "rgba(18,20,27,.16)" },
  { id: "02", title: "Base de conocimiento", desc: "Catálogo, procedimientos e histórico, consultables por la IA.", border: "rgba(18,20,27,.16)" },
  { id: "03", title: "Configuración por departamento", desc: "Cada área con su espacio, conectores y usuarios.", border: "rgba(18,20,27,.16)" },
  { id: "04", title: "Casos en producción", desc: "Casos reales funcionando, con adopción medida.", border: "rgba(18,20,27,.16)" },
  { id: "05", title: "Agentes autónomos por rol", desc: "Evolución a agentes cuando los casos básicos funcionan.", border: "rgba(18,20,27,.16)" },
  { id: "06", title: "Acompañamiento continuo", desc: "Formación, ajustes y transferencia de autonomía.", border: "#92D15C" },
];

const GANTT_WEEKS = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9"];

const PILLS = [
  "Líder español en recubrimientos técnicos PTFE, con reconocimiento europeo",
  "Una de las plantas más automatizadas de Europa",
  "Recubrimiento propio: Testrong® (panificación y bollería industrial)",
  "Licensed Industrial Applicator (LIA) de Teflon® by Chemours · Whitford Recommended Coater",
  "Certificación ISO 9001 · Laboratorio de I+D propio",
  "Sede en Santa Perpètua de Mogoda (Barcelona)",
  "Sectores: panificación, automoción, química y petroquímica, menaje, embalaje, textil, gráfico, engomado de cilindros",
];

const MATRIX_DOTS = [
  { left: "60%", top: "12%", w: 16, bg: "#0025FF", shadow: "0 0 0 6px rgba(0,37,255,.16)", anim: "gsFloat 3.9s ease-in-out 0.9s infinite", popCls: "gs-pop--l gs-pop--down", label: "Iniciativa A", impact: "Alto", viable: "Alta" },
  { left: "75%", top: "18%", w: 14, bg: "#0025FF", shadow: "0 0 0 5px rgba(0,37,255,.16)", anim: "gsFloat 5.2s ease-in-out 0.6s infinite", popCls: "gs-pop--r gs-pop--down", label: "Iniciativa B", impact: "Alto", viable: "Alta" },
  { left: "88%", top: "11%", w: 12, bg: "#92D15C", shadow: "0 0 0 5px rgba(146,209,92,.24)", anim: "gsFloat 4.4s ease-in-out 0.3s infinite", popCls: "gs-pop--r gs-pop--down", label: "Iniciativa C", impact: "Medio", viable: "Alta" },
  { left: "92%", top: "21%", w: 11, bg: "#0025FF", shadow: "0 0 0 4px rgba(0,37,255,.16)", anim: "gsFloat 4.4s ease-in-out 0.2s infinite", popCls: "gs-pop--r gs-pop--down", label: "Iniciativa D", impact: "Medio", viable: "Alta" },
  { left: "18%", top: "13%", w: 16, bg: "#92D15C", shadow: "0 0 0 6px rgba(146,209,92,.24)", anim: "gsFloat 5.4s ease-in-out 0.4s infinite", popCls: "gs-pop--l gs-pop--down", label: "Iniciativa E", impact: "Alto", viable: "Por construir" },
  { left: "34%", top: "19%", w: 13, bg: "#E0922A", shadow: "0 0 0 5px rgba(224,146,42,.20)", anim: "gsFloat 4.3s ease-in-out 0.2s infinite", popCls: "gs-pop--l gs-pop--down", label: "Iniciativa F", impact: "Alto", viable: "Media" },
  { left: "70%", top: "60%", w: 13, bg: "#E0922A", shadow: "0 0 0 5px rgba(224,146,42,.20)", anim: "gsFloat 4.6s ease-in-out 0.6s infinite", popCls: "gs-pop--r", label: "Iniciativa G", impact: "Medio", viable: "Alta" },
  { left: "87%", top: "67%", w: 12, bg: "rgba(18,20,27,.4)", shadow: "0 0 0 5px rgba(18,20,27,.10)", anim: "gsFloat 4.6s ease-in-out 0.3s infinite", popCls: "gs-pop--r", label: "Iniciativa H", impact: "Bajo", viable: "Alta" },
  { left: "24%", top: "62%", w: 11, bg: "rgba(18,20,27,.4)", shadow: "0 0 0 4px rgba(18,20,27,.10)", anim: "gsFloat 3.9s ease-in-out 0.7s infinite", popCls: "gs-pop--l", label: "Iniciativa I", impact: "Bajo", viable: "Baja" },
  { left: "37%", top: "69%", w: 10, bg: "rgba(18,20,27,.4)", shadow: "0 0 0 4px rgba(18,20,27,.10)", anim: "gsFloat 4.9s ease-in-out 0.2s infinite", popCls: "gs-pop--l", label: "Iniciativa J", impact: "Bajo", viable: "Baja" },
];

const GOVERNANCE = [
  {
    num: "1 · Residencia",
    title: "Dónde viven y se procesan los datos",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0025FF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg>,
    bullets: [
      "Residencia en la UE por defecto: almacenamiento y procesamiento.",
      "Sin transferencias internacionales por diseño para su contenido.",
      "Transferencias residuales cubiertas con Cláusulas Contractuales Tipo (CCT).",
    ],
    detail: "Las bases de conocimiento, los embeddings e índices vectoriales, los repositorios de documentos y los logs se alojan en una región de la UE (p. ej. Azure West/North Europe, AWS eu-central-1 / eu-west-1, Google Vertex europe-west). La inferencia queda fijada a esa misma región de la UE: los prompts y el contexto recuperado se procesan allí, no solo se almacenan.",
  },
  {
    num: "2 · Entrenamiento",
    title: "Uso de sus datos para entrenar y garantías contractuales",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0025FF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 3v5c0 5-3.4 8-8 10-4.6-2-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/></svg>,
    bullets: [
      "Cero entrenamiento: sus prompts, documentos y resultados no entrenan ningún modelo.",
      "Exigible por el tier empresarial de las grandes plataformas.",
      "DPA firmado + evidencia de certificaciones.",
    ],
    detail: "Sus prompts, documentos y resultados no se usan para entrenar, ajustar (fine-tune) ni mejorar ningún modelo, ni el nuestro ni el del proveedor subyacente.",
  },
  {
    num: "3 · Accesos",
    title: "Accesos por rol a conectores y datos",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0025FF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="15" r="4"/><path d="M10.8 12.2L20 3M16 7l3 3M14 9l2 2"/></svg>,
    bullets: [
      "Control de acceso por roles (RBAC) ligado a su proveedor de identidad (SSO/SCIM).",
      "Dos capas: a nivel de conector y a nivel de documento o registro.",
      "La IA no es una puerta trasera para escalar privilegios.",
    ],
    detail: "El acceso se rige por RBAC vinculado a su proveedor de identidad (Entra ID, Okta o Google Workspace vía SSO/SCIM).",
  },
  {
    num: "4 · Cumplimiento",
    title: "Cumplimiento del AI Act",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0025FF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M5 7h14M5 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z"/></svg>,
    bullets: [
      "Clasificación de riesgo de cada caso de uso.",
      "Política de uso y formación a las personas usuarias.",
      "Trazabilidad y supervisión humana documentadas.",
    ],
    detail: "El Reglamento Europeo de IA (AI Act) clasifica cada sistema por nivel de riesgo y exige obligaciones proporcionales.",
  },
];

export default function Home() {
  const mainRef = useRef<HTMLElement>(null);
  const [activeNav, setActiveNav] = useState("#portada");
  const [selectedDay, setSelectedDay] = useState("02"); // "02" = Jueves, "03" = Viernes
  const [selectedSlot, setSelectedSlot] = useState("17:00");
  const [reserving, setReserving] = useState(false);
  const [reserved, setReserved] = useState(false);

  useEffect(() => {
    // Prevent body from scrolling — only <main> should scroll
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.documentElement.style.height = "100vh";
    document.body.style.height = "100vh";

    const mainEl = mainRef.current;
    if (!mainEl) return;

    /* ── reveal: all visible immediately (no hidden-but-space-occupying elements) ── */
    mainEl.querySelectorAll(".gs-reveal").forEach((el) => el.classList.add("gs-in"));

    /* ── counter observer ── */
    const counters = mainEl.querySelectorAll(".gs-count");
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            const target = parseFloat(el.dataset.target || "0");
            const suffix = el.dataset.suffix || "";
            animateCounter(el, target, suffix);
            cio.unobserve(el);
          }
        });
      },
      { root: mainEl, threshold: 0.5 }
    );
    counters.forEach((c) => cio.observe(c));

    /* ── scroll-spy ── */
    const sections = Array.from(mainEl.querySelectorAll("section[id], footer[id]"));
    const spyObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setActiveNav("#" + e.target.id);
          }
        });
      },
      { root: mainEl, threshold: 0, rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => spyObs.observe(s));

    return () => {
      cio.disconnect();
      spyObs.disconnect();
      // Restore body scroll for other pages
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.documentElement.style.height = "";
      document.body.style.height = "";
    };
  }, []);

  const scrollTo = (href: string) => {
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    const scrollerEl = mainRef.current;
    if (el && scrollerEl) {
      scrollerEl.scrollTo({ top: el.offsetTop - 24, behavior: "smooth" });
      setActiveNav(href);
    }
  };

  return (
    <div style={{ height: "100vh", overflow: "hidden", background: "#F5F1E9", color: "#12141B", fontFamily: "'Inter',system-ui,sans-serif", WebkitFontSmoothing: "antialiased", display: "flex", alignItems: "flex-start" }}>
      {/* ═══════ SIDEBAR ═══════ */}
      <aside
        style={{
          width: 252,
          flexShrink: 0,
          alignSelf: "stretch",
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#EFE9DC",
          borderRight: "1px solid rgba(18,20,27,.12)",
          padding: "34px 22px",
          boxSizing: "border-box",
        }}
      >
        {/* logo */}
        <img src="/logo.png" alt="Genai Sapiens Consulting" style={{ width: "100%", height: "auto", display: "block" }} />
        <div style={{ fontSize: ".6rem", textTransform: "uppercase", letterSpacing: ".2em", color: "rgba(18,20,27,.45)", fontWeight: 600, marginTop: 18 }}>
          Propuesta &middot; Confidencial
        </div>

        {/* nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 32 }}>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                scrollTo(item.href);
              }}
              style={{
                display: "block",
                fontSize: ".84rem",
                color: activeNav === item.href ? "#0025FF" : "rgba(18,20,27,.62)",
                fontWeight: activeNav === item.href ? 600 : 500,
                padding: "9px 12px",
                borderRadius: 8,
                borderLeft: `2px solid ${activeNav === item.href ? "#0025FF" : "transparent"}`,
                textDecoration: "none",
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* footer */}
        <div style={{ marginTop: "auto", paddingTop: 24, borderTop: "1px solid rgba(18,20,27,.12)", fontSize: ".68rem", color: "rgba(18,20,27,.42)", lineHeight: 1.55 }}>
          Genai Sapiens Consulting<br />Tarragona &middot; 2026
        </div>
      </aside>

      {/* ═══════ MAIN ═══════ */}
      <main
        ref={mainRef}
        style={{ flex: 1, minWidth: 0, height: "100vh", overflowY: "auto" }}
      >
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 56px" }}>

          {/* ────── 01 PORTADA ────── */}
          <section id="portada" style={{ position: "relative", overflow: "hidden", padding: "64px 0 64px", borderBottom: "1px solid rgba(18,20,27,.14)" }}>
            {/* decorative blobs */}
            <span style={{ position: "absolute", top: -70, right: -30, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,37,255,.14),transparent 70%)", animation: "gsBlob 11s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />
            <span style={{ position: "absolute", bottom: -50, right: 150, width: 210, height: 210, borderRadius: "50%", background: "radial-gradient(circle,rgba(146,209,92,.16),transparent 70%)", animation: "gsBlob 14s ease-in-out 1s infinite reverse", pointerEvents: "none", zIndex: 0 }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 30 }}>
                <span style={{ width: 34, height: 2, background: "#0025FF" }} />
                <span style={{ fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".26em", color: "#0025FF", fontWeight: 600 }}>Julio 2026</span>
              </div>
              <h1 style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: "clamp(1.5rem,calc((100vw - 360px) / 13),4rem)", lineHeight: 1.04, letterSpacing: "-.02em", margin: 0, whiteSpace: "nowrap" }}>
                Propuesta GSC x COATRESA
              </h1>
              <p style={{ fontFamily: "'Inter'", fontSize: "1.15rem", lineHeight: 1.6, color: "rgba(18,20,27,.66)", margin: "30px 0 0", maxWidth: "60ch" }}>
                Una colaboración para mapear, con datos reales de toda la empresa, las oportunidades de IA y la colaboración que las hace realidad.
              </p>

              {/* video boxes */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 44 }}>
                <div>
                  <div className="gs-lift" style={{ position: "relative", aspectRatio: "16/9", borderRadius: 16, overflow: "hidden", background: "#12141B", border: "1px solid rgba(18,20,27,.14)" }}>
                    <video controls playsInline style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}>
                      <source src="https://res.cloudinary.com/dqmpbfpqw/video/upload/v1782607800/WhatsApp_Video_2026-06-27_at_19.58.56_xkfujl.mp4" type="video/mp4" />
                    </video>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: "1rem", marginTop: 14, fontFamily: "'Fraunces',serif" }}>¿Qué es GSC?</div>
                </div>
                <div>
                  <div className="gs-lift" style={{ position: "relative", aspectRatio: "16/9", borderRadius: 16, overflow: "hidden", background: "#12141B", border: "1px solid rgba(18,20,27,.14)" }}>
                    <video controls playsInline style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}>
                      <source src="https://res.cloudinary.com/dqmpbfpqw/video/upload/v1782607782/WhatsApp_Video_2026-06-27_at_19.58.56_1_wqhbxs.mp4" type="video/mp4" />
                    </video>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: "1rem", marginTop: 14, fontFamily: "'Fraunces',serif" }}>GSC x COATRESA</div>
                </div>
              </div>
            </div>
          </section>

          {/* ────── BANDA · CONOCEMOS COATRESA ────── */}
          <section style={{ margin: "8px 0 4px" }}>
            <div style={{ position: "relative", overflow: "hidden", background: "#FCFAF5", border: "1px solid rgba(18,20,27,.12)", borderRadius: 22, padding: "40px 42px", boxShadow: "0 10px 30px rgba(18,20,27,.05)" }}>
              <span style={{ position: "absolute", top: -80, right: -50, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,37,255,.10),transparent 70%)", animation: "gsBlob 13s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
                  <span style={{ width: 30, height: 2, background: "#0025FF" }} />
                  <span style={{ fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".22em", color: "#0025FF", fontWeight: 600 }}>Punto de partida</span>
                </div>
                <h2 style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: "clamp(1.9rem,3.6vw,2.7rem)", lineHeight: 1.08, letterSpacing: "-.015em", margin: "0 0 28px" }}>COATRESA</h2>

                {/* 4 stat cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
                  {/* 1983 */}
                  <div className="gs-reveal" style={{ transitionDelay: "0s" }}>
                    <div className="gs-lift" style={{ background: "#F5F1E9", border: "1px solid rgba(18,20,27,.12)", borderRadius: 16, padding: "22px 20px 20px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 14 }}>
                      <span style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(0,37,255,.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0025FF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>
                      </span>
                      <div>
                        <div style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: "clamp(2.3rem,4.6vw,3.2rem)", lineHeight: 1, color: "#0025FF", letterSpacing: "-.01em" }}>
                          <span className="gs-count" data-target="1983" data-suffix="">0</span>
                        </div>
                        <div style={{ fontSize: ".85rem", color: "rgba(18,20,27,.6)", marginTop: 9, lineHeight: 1.35, fontWeight: 500 }}>Año de fundación</div>
                      </div>
                    </div>
                  </div>
                  {/* 84% */}
                  <div className="gs-reveal" style={{ transitionDelay: ".08s" }}>
                    <div className="gs-lift" style={{ background: "#0025FF", border: "1px solid #0025FF", borderRadius: 16, padding: "22px 20px 20px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 14 }}>
                      <span style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(255,255,255,.16)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>
                      </span>
                      <div>
                        <div style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: "clamp(2.3rem,4.6vw,3.2rem)", lineHeight: 1, color: "#fff", letterSpacing: "-.01em" }}>
                          <span className="gs-count" data-target="84" data-suffix="%">0%</span>
                        </div>
                        <div style={{ fontSize: ".85rem", color: "rgba(255,255,255,.82)", marginTop: 9, lineHeight: 1.35, fontWeight: 500 }}>Ventas a exportación</div>
                      </div>
                    </div>
                  </div>
                  {/* 6 idiomas */}
                  <div className="gs-reveal" style={{ transitionDelay: ".16s" }}>
                    <div className="gs-lift" style={{ background: "#F5F1E9", border: "1px solid rgba(18,20,27,.12)", borderRadius: 16, padding: "22px 20px 20px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 14 }}>
                      <span style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(0,37,255,.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0025FF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      </span>
                      <div>
                        <div style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: "clamp(2.3rem,4.6vw,3.2rem)", lineHeight: 1, color: "#0025FF", letterSpacing: "-.01em" }}>
                          <span className="gs-count" data-target="6" data-suffix="">0</span>
                        </div>
                        <div style={{ fontSize: ".85rem", color: "rgba(18,20,27,.6)", marginTop: 9, lineHeight: 1.35, fontWeight: 500 }}>Idiomas</div>
                      </div>
                    </div>
                  </div>
                  {/* 3 centros */}
                  <div className="gs-reveal" style={{ transitionDelay: ".24s" }}>
                    <div className="gs-lift" style={{ background: "#F5F1E9", border: "1px solid rgba(18,20,27,.12)", borderRadius: 16, padding: "22px 20px 20px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 14 }}>
                      <span style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(0,37,255,.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0025FF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      </span>
                      <div>
                        <div style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: "clamp(2.3rem,4.6vw,3.2rem)", lineHeight: 1, color: "#0025FF", letterSpacing: "-.01em" }}>
                          <span className="gs-count" data-target="3" data-suffix="">0</span>
                        </div>
                        <div style={{ fontSize: ".85rem", color: "rgba(18,20,27,.6)", marginTop: 9, lineHeight: 1.35, fontWeight: 500 }}>Centros &middot; España, Brasil, Colombia</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* divider */}
                <div style={{ height: 1, background: "rgba(18,20,27,.12)", margin: "32px 0 24px" }} />

                {/* pills */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {PILLS.map((t, i) => (
                    <span
                      key={i}
                      className="gs-reveal gs-lift"
                      style={{
                        transitionDelay: `${(i * 0.05).toFixed(2)}s`,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 9,
                        background: "#F5F1E9",
                        border: "1px solid rgba(18,20,27,.14)",
                        borderRadius: 9999,
                        padding: "9px 16px",
                        fontSize: ".88rem",
                        color: "rgba(18,20,27,.74)",
                        lineHeight: 1.3,
                        cursor: "default",
                      }}
                    >
                      <span style={{ flex: "none", width: 6, height: 6, borderRadius: "50%", background: "#0025FF" }} />
                      {t}
                    </span>
                  ))}
                </div>

                <p style={{ fontSize: ".95rem", color: "rgba(18,20,27,.6)", margin: "26px 0 0", fontStyle: "italic", fontFamily: "'Fraunces',serif" }}>
                  No partimos de cero: partimos de quiénes son ustedes.
                </p>
              </div>
            </div>
          </section>

          {/* ────── 02 EL WORKSHOP ────── */}
          <section id="workshop" style={{ padding: "72px 0", borderBottom: "1px solid rgba(18,20,27,.14)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 40, alignItems: "start" }}>
              <div style={{ position: "sticky", top: 40 }}>
                <div style={{ fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".2em", color: "rgba(18,20,27,.5)", fontWeight: 600, marginTop: 10 }}>El Workshop</div>
              </div>
              <div>
                <h2 style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: "clamp(1.8rem,3.4vw,2.6rem)", lineHeight: 1.1, letterSpacing: "-.015em", margin: 0 }}>La Fase 0 del programa</h2>

                {/* 3 step cards */}
                <div className="gs-flow" style={{ marginTop: 30, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, position: "relative" }}>
                  {/* connecting line */}
                  <div style={{ position: "absolute", left: "8%", right: "8%", top: 34, height: 2, background: "rgba(18,20,27,.12)", transformOrigin: "left", animation: "gsDraw 1.1s .15s cubic-bezier(.22,.8,.3,1) both", zIndex: 0 }} />

                  {/* 01 Conocer */}
                  <div className="gs-step" style={{ animationDelay: ".15s", position: "relative", zIndex: 1 }}>
                    <div className="gs-card" style={{ background: "#FCFAF5", border: "1px solid rgba(18,20,27,.12)", borderRadius: 16, padding: "22px 20px", height: "100%", boxSizing: "border-box" }}>
                      <div style={{ width: 54, height: 54, borderRadius: "50%", background: "#EFE9DC", border: "1px solid rgba(18,20,27,.14)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0025FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
                      </div>
                      <div style={{ textAlign: "center", fontSize: ".66rem", textTransform: "uppercase", letterSpacing: ".16em", color: "#0025FF", fontWeight: 700, marginTop: 16 }}>01 &middot; Conocer</div>
                      <div style={{ textAlign: "center", fontWeight: 600, fontSize: "1.05rem", fontFamily: "'Fraunces',serif", marginTop: 6 }}>COATRESA por dentro</div>
                      <p style={{ textAlign: "center", fontSize: ".86rem", lineHeight: 1.5, color: "rgba(18,20,27,.62)", margin: "8px 0 0" }}>Mapeamos áreas, operación y dónde la IA puede aportar, en toda la organización.</p>
                    </div>
                  </div>

                  {/* 02 Priorizar */}
                  <div className="gs-step" style={{ animationDelay: ".45s", position: "relative", zIndex: 1 }}>
                    <div className="gs-card" style={{ background: "#FCFAF5", border: "1px solid rgba(18,20,27,.12)", borderRadius: 16, padding: "22px 20px", height: "100%", boxSizing: "border-box" }}>
                      <div style={{ width: 54, height: 54, borderRadius: "50%", background: "#EFE9DC", border: "1px solid rgba(18,20,27,.14)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0025FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="15" y2="12"/><line x1="4" y1="17" x2="10" y2="17"/></svg>
                      </div>
                      <div style={{ textAlign: "center", fontSize: ".66rem", textTransform: "uppercase", letterSpacing: ".16em", color: "#0025FF", fontWeight: 700, marginTop: 16 }}>02 &middot; Priorizar</div>
                      <div style={{ textAlign: "center", fontWeight: 600, fontSize: "1.05rem", fontFamily: "'Fraunces',serif", marginTop: 6 }}>No partimos de cero</div>
                      <p style={{ textAlign: "center", fontSize: ".86rem", lineHeight: 1.5, color: "rgba(18,20,27,.62)", margin: "8px 0 0" }}>Estructuramos, validamos y priorizamos su realidad para definir qué soluciones ofrecemos.</p>
                    </div>
                  </div>

                  {/* 03 Decidir */}
                  <div className="gs-step" style={{ animationDelay: ".75s", position: "relative", zIndex: 1 }}>
                    <div className="gs-card" style={{ background: "#0025FF", border: "1px solid #0025FF", borderRadius: 16, padding: "22px 20px", height: "100%", boxSizing: "border-box" }}>
                      <div style={{ width: 54, height: 54, borderRadius: "50%", background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", animation: "gsPulse 2.6s ease-in-out infinite" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L4.5 13H11l-1 9 8.5-11H12z"/></svg>
                      </div>
                      <div style={{ textAlign: "center", fontSize: ".66rem", textTransform: "uppercase", letterSpacing: ".16em", color: "#9ED1FF", fontWeight: 700, marginTop: 16 }}>03 &middot; Decidir</div>
                      <div style={{ textAlign: "center", fontWeight: 600, fontSize: "1.05rem", fontFamily: "'Fraunces',serif", marginTop: 6, color: "#fff" }}>En directo, juntos</div>
                      <p style={{ textAlign: "center", fontSize: ".86rem", lineHeight: 1.5, color: "rgba(255,255,255,.82)", margin: "8px 0 0" }}>La IA adelanta el trabajo con un formulario por departamento; en vivo validamos y decidimos.</p>
                    </div>
                  </div>
                </div>

                {/* session info bar */}
                <div className="gs-step" style={{ animationDelay: "1s", display: "flex", alignItems: "center", gap: 14, background: "#EFE9DC", border: "1px solid rgba(18,20,27,.12)", borderRadius: 14, padding: "14px 18px", marginTop: 14 }}>
                  <div style={{ position: "relative", width: 88, height: 18, flex: "none", overflow: "hidden" }}>
                    <span style={{ position: "absolute", top: 6, left: 0, width: 7, height: 7, borderRadius: "50%", background: "#0025FF", animation: "gsDot 2.4s linear infinite" } as React.CSSProperties} />
                    <span style={{ position: "absolute", top: 6, left: 0, width: 7, height: 7, borderRadius: "50%", background: "#92D15C", animation: "gsDot 2.4s linear 1.2s infinite" } as React.CSSProperties} />
                    <span style={{ position: "absolute", top: 3, left: 0, fontSize: ".6rem", color: "rgba(18,20,27,.45)", fontWeight: 700 }}>IA</span>
                    <span style={{ position: "absolute", top: 3, right: 0, fontSize: ".6rem", color: "rgba(18,20,27,.45)", fontWeight: 700 }}>&middot;</span>
                  </div>
                  <p style={{ fontSize: ".9rem", lineHeight: 1.5, color: "rgba(18,20,27,.72)", margin: 0 }}>
                    <strong style={{ color: "#12141B" }}>Sesión semiautomática.</strong> La IA trabaja antes de la reunión; las decisiones se toman en directo, con criterio humano.
                  </p>
                </div>

                {/* La sesión */}
                <div style={{ fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".2em", color: "rgba(18,20,27,.5)", fontWeight: 600, margin: "38px 0 16px" }}>La sesión</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#EFE9DC", border: "1px solid rgba(18,20,27,.12)", borderRadius: 12, padding: "14px 18px" }}>
                  <span style={{ flex: "none", width: 34, height: 34, borderRadius: "50%", background: "#FCFAF5", border: "1px solid rgba(18,20,27,.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0025FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                  </span>
                  <span style={{ fontSize: ".92rem", lineHeight: 1.45, color: "rgba(18,20,27,.72)" }}>
                    <strong style={{ color: "#12141B" }}>Sesión online de 2h30 a 3h.</strong> Horarios y bloques se cierran al confirmar la sesión.
                  </span>
                </div>

                {/* Dinámicas */}
                <div style={{ fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".2em", color: "rgba(18,20,27,.5)", fontWeight: 600, margin: "38px 0 16px" }}>Dinámicas</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {DINAMICAS.map((d) => (
                    <div key={d.n} style={{ background: "#FCFAF5", border: "1px solid rgba(18,20,27,.12)", borderRadius: 14, padding: "20px 22px" }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                        <span style={{ fontFamily: "'Fraunces',serif", fontSize: "1.25rem", fontWeight: 600, color: "#0025FF" }}>{d.n}</span>
                        <span style={{ fontWeight: 600, fontSize: "1.05rem" }}>{d.title}</span>
                      </div>
                      <p style={{ fontSize: ".92rem", color: "rgba(18,20,27,.66)", margin: "9px 0 0", lineHeight: 1.55 }}>{d.desc}</p>
                      {d.result && (
                        <div style={{ marginTop: 11, display: "flex", gap: 8, alignItems: "baseline" }}>
                          <span style={{ fontSize: ".68rem", textTransform: "uppercase", letterSpacing: ".14em", color: "#92D15C", fontWeight: 700 }}>Resultado</span>
                          <span style={{ fontSize: ".9rem", color: "rgba(18,20,27,.78)", fontWeight: 500 }}>{d.result}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Matriz Impacto × Viabilidad */}
                <div style={{ fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".2em", color: "rgba(18,20,27,.5)", fontWeight: 600, margin: "44px 0 16px" }}>Matriz Impacto &times; Viabilidad</div>
                <div style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 12, alignItems: "stretch" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: ".7rem", textTransform: "uppercase", letterSpacing: ".18em", color: "rgba(18,20,27,.5)", fontWeight: 600 }}>Impacto</span>
                  </div>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 12 }}>
                      <div style={{ border: "1px solid rgba(18,20,27,.16)", background: "#FCFAF5", borderRadius: 12, padding: "16px 16px", display: "flex", flexDirection: "column", justifyContent: "flex-end", minHeight: 120 }}>
                        <div style={{ fontWeight: 700, fontSize: ".98rem", color: "#12141B", fontFamily: "'Fraunces',serif" }}>Apuestas estratégicas</div>
                        <div style={{ fontSize: ".8rem", color: "rgba(18,20,27,.58)", marginTop: 5, lineHeight: 1.4 }}>Alto impacto, viabilidad por construir.</div>
                      </div>
                      <div style={{ border: "1px solid #0025FF", background: "rgba(0,37,255,.05)", borderRadius: 12, padding: "16px 16px", display: "flex", flexDirection: "column", justifyContent: "flex-end", minHeight: 120 }}>
                        <div style={{ fontWeight: 700, fontSize: ".98rem", color: "#0025FF", fontFamily: "'Fraunces',serif" }}>Quick wins</div>
                        <div style={{ fontSize: ".8rem", color: "rgba(18,20,27,.58)", marginTop: 5, lineHeight: 1.4 }}>Alto impacto y alta viabilidad. Empezamos aquí.</div>
                      </div>
                      <div style={{ border: "1px solid rgba(18,20,27,.16)", background: "#FCFAF5", borderRadius: 12, padding: "16px 16px", display: "flex", flexDirection: "column", justifyContent: "flex-end", minHeight: 120 }}>
                        <div style={{ fontWeight: 700, fontSize: ".98rem", color: "#12141B", fontFamily: "'Fraunces',serif" }}>Aparcar o descartar</div>
                        <div style={{ fontSize: ".8rem", color: "rgba(18,20,27,.58)", marginTop: 5, lineHeight: 1.4 }}>Bajo impacto y baja viabilidad.</div>
                      </div>
                      <div style={{ border: "1px solid rgba(18,20,27,.16)", background: "#FCFAF5", borderRadius: 12, padding: "16px 16px", display: "flex", flexDirection: "column", justifyContent: "flex-end", minHeight: 120 }}>
                        <div style={{ fontWeight: 700, fontSize: ".98rem", color: "#12141B", fontFamily: "'Fraunces',serif" }}>Mejoras incrementales</div>
                        <div style={{ fontSize: ".8rem", color: "rgba(18,20,27,.58)", marginTop: 5, lineHeight: 1.4 }}>Buena viabilidad, impacto acotado.</div>
                      </div>

                      {/* floating dots */}
                      {MATRIX_DOTS.map((dot, i) => (
                        <span key={i} className="gs-dot" style={{ left: dot.left, top: dot.top, width: dot.w, height: dot.w, background: dot.bg, boxShadow: dot.shadow, animation: dot.anim }}>
                          <span className={`gs-pop ${dot.popCls}`}>
                            <span style={{ display: "block", background: "#12141B", border: "1px solid rgba(255,255,255,.1)", borderRadius: 13, padding: "13px 15px", boxShadow: "0 16px 40px rgba(18,20,27,.3)" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot.bg, flex: "none" }} />
                                <span style={{ fontSize: ".58rem", textTransform: "uppercase", letterSpacing: ".14em", color: "rgba(255,255,255,.55)", fontWeight: 700 }}>Departamento</span>
                              </span>
                              <span style={{ display: "block", fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: ".98rem", color: "#fff", lineHeight: 1.2, marginTop: 7 }}>{dot.label}</span>
                              <span style={{ display: "block", fontSize: ".76rem", lineHeight: 1.45, color: "rgba(255,255,255,.68)", marginTop: 6 }}>Texto de ejemplo sobre la acción. Contenido provisional.</span>
                              <span style={{ display: "flex", gap: 16, marginTop: 11, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,.12)" }}>
                                <span style={{ fontSize: ".6rem", letterSpacing: ".04em", color: "rgba(255,255,255,.55)" }}>Impacto <b style={{ color: "#fff", fontWeight: 700 }}>{dot.impact}</b></span>
                                <span style={{ fontSize: ".6rem", letterSpacing: ".04em", color: "rgba(255,255,255,.55)" }}>Viabilidad <b style={{ color: "#fff", fontWeight: 700 }}>{dot.viable}</b></span>
                              </span>
                            </span>
                          </span>
                        </span>
                      ))}
                    </div>
                    <div style={{ textAlign: "center", fontSize: ".7rem", textTransform: "uppercase", letterSpacing: ".18em", color: "rgba(18,20,27,.5)", fontWeight: 600, marginTop: 12 }}>Viabilidad</div>
                  </div>
                </div>

                {/* Qué se llevan */}
                <div style={{ fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".2em", color: "rgba(18,20,27,.5)", fontWeight: 600, margin: "38px 0 16px" }}>Qué se llevan</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                  {[
                    { n: "01", title: "Mapa de oportunidades", desc: "Priorizado en todos los departamentos." },
                    { n: "02", title: "Primer ciclo de trabajo", desc: "El primer ciclo acordado: por dónde se empieza." },
                    { n: "03", title: "Recorrido y colaboración", desc: "El recorrido por fases y la base de la colaboración: alcance, plazo e inversión." },
                  ].map((item) => (
                    <div key={item.n} style={{ background: "#FCFAF5", border: "1px solid rgba(18,20,27,.12)", borderRadius: 14, padding: 22 }}>
                      <div style={{ fontFamily: "'Fraunces',serif", fontSize: "1.6rem", fontWeight: 600, color: "#0025FF" }}>{item.n}</div>
                      <div style={{ fontWeight: 600, fontSize: "1rem", marginTop: 12 }}>{item.title}</div>
                      <p style={{ fontSize: ".88rem", lineHeight: 1.55, color: "rgba(18,20,27,.6)", margin: "7px 0 0" }}>{item.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Entregables del Workshop */}
                <div style={{ fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".2em", color: "rgba(18,20,27,.5)", fontWeight: 600, margin: "38px 0 16px" }}>Entregables del Workshop</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
                  {[
                    "Estado actual",
                    "Oportunidades por departamento",
                    "Matriz con primer ciclo",
                    "Borrador de roadmap (00 a 06)",
                    "Notas de gobernanza",
                    "Base de la colaboración",
                  ].map((item) => (
                    <div key={item} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                      <span style={{ flex: "none", width: 20, height: 20, borderRadius: 6, background: "#92D15C", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#16310a" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 6" /></svg>
                      </span>
                      <span style={{ fontSize: ".95rem", lineHeight: 1.5, color: "rgba(18,20,27,.78)" }}>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Blue pricing banner */}
                <div style={{ position: "relative", overflow: "hidden", background: "#0025FF", color: "#fff", borderRadius: 16, padding: "26px 28px", marginTop: 28 }}>
                  <span style={{ position: "absolute", inset: 0, background: "linear-gradient(110deg,transparent 35%,rgba(255,255,255,.16) 50%,transparent 65%)", backgroundSize: "200% 100%", animation: "gsShine 3.8s linear infinite", pointerEvents: "none" }} />
                  <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
                    <div style={{ fontFamily: "'Fraunces',serif", fontSize: "1.9rem", fontWeight: 600, lineHeight: 1 }}>Workshop: 5.000 &euro; + IVA</div>
                  </div>
                  <p style={{ fontSize: ".98rem", lineHeight: 1.6, margin: "12px 0 0", color: "rgba(255,255,255,.86)", maxWidth: "64ch" }}>
                    El precio y el plazo de la colaboración se definen en base a lo que acordemos en el Workshop, y esos 5.000 &euro; se descuentan de ese total si deciden continuar.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ────── 03 RECORRIDO ────── */}
          <section id="recorrido" style={{ padding: "72px 0", borderBottom: "1px solid rgba(18,20,27,.14)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 40, alignItems: "start" }}>
              <div style={{ position: "sticky", top: 40 }}>
                <div style={{ fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".2em", color: "rgba(18,20,27,.5)", fontWeight: 600, marginTop: 10 }}>Recorrido</div>
              </div>
              <div>
                <h2 style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: "clamp(1.8rem,3.4vw,2.6rem)", lineHeight: 1.1, letterSpacing: "-.015em", margin: 0 }}>El recorrido por fases</h2>
                <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "rgba(18,20,27,.72)", margin: "20px 0 0", maxWidth: "62ch" }}>
                  El Workshop es el punto de entrada. Cada fase se concreta y presupuesta a partir de él.
                </p>

                {/* Phase list */}
                <div style={{ marginTop: 36 }}>
                  {FASES.map((f) => (
                    <div key={f.id} className="gs-phase" style={{ padding: "18px 0 18px", borderTop: `2px solid ${f.border}` }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
                        <span style={{ fontSize: ".66rem", color: "rgba(18,20,27,.5)", fontWeight: 600, letterSpacing: ".04em", minWidth: 64 }}>Fase {f.id}</span>
                        <span style={{ fontWeight: 600, fontSize: "1.05rem", fontFamily: "'Fraunces',serif" }}>{f.title}</span>
                      </div>
                      <p style={{ fontSize: ".92rem", color: "rgba(18,20,27,.62)", margin: "8px 0 0 78px", lineHeight: 1.55, maxWidth: "60ch" }}>{f.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Gantt timeline */}
                <div style={{ fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".2em", color: "rgba(18,20,27,.5)", fontWeight: 600, margin: "44px 0 16px" }}>Hoja de ruta orientativa</div>
                <div style={{ fontSize: ".7rem", textTransform: "uppercase", letterSpacing: ".14em", color: "rgba(18,20,27,.45)", fontWeight: 600, margin: "-4px 0 14px" }}>Secuencia opción B &middot; 3 casos &middot; 9 semanas</div>
                <div style={{ overflowX: "auto" }}>
                  <div style={{ minWidth: 660, border: "1px solid rgba(18,20,27,.14)", borderRadius: 16, overflow: "hidden", background: "#FCFAF5" }}>
                    {/* Header */}
                    <div style={{ display: "grid", gridTemplateColumns: "150px repeat(9,1fr)", background: "#EFE9DC", borderBottom: "1px solid rgba(18,20,27,.12)" }}>
                      <div style={{ padding: "11px 16px", fontSize: ".62rem", textTransform: "uppercase", letterSpacing: ".14em", color: "rgba(18,20,27,.5)", fontWeight: 700 }}>Fase</div>
                      {GANTT_WEEKS.map((w) => (
                        <div key={w} style={{ padding: "11px 4px", textAlign: "center", fontSize: ".68rem", color: "rgba(18,20,27,.5)", fontWeight: 600, borderLeft: "1px solid rgba(18,20,27,.1)" }}>{w}</div>
                      ))}
                    </div>
                    {/* Workshop row */}
                    <div style={{ display: "grid", gridTemplateColumns: "150px repeat(9,1fr)", borderTop: "1px solid rgba(18,20,27,.1)", alignItems: "center", minHeight: 70 }}>
                      <div style={{ padding: "10px 16px", fontWeight: 600, fontSize: ".92rem" }}>Workshop</div>
                      <div style={{ gridColumn: "2 / 4", margin: "10px 6px", background: "#92D15C", borderRadius: 9, padding: "9px 12px", transformOrigin: "left", animation: "gsGrow .8s .1s cubic-bezier(.22,.8,.3,1) both" }}>
                        <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#16310a" }}>Preparación + ejecución</div>
                        <div style={{ fontSize: ".66rem", color: "rgba(22,49,10,.78)", marginTop: 2, lineHeight: 1.3 }}>Identificar oportunidades &middot; priorizar casos</div>
                      </div>
                    </div>
                    {/* Desarrollo row */}
                    <div style={{ display: "grid", gridTemplateColumns: "150px repeat(9,1fr)", borderTop: "1px solid rgba(18,20,27,.1)", alignItems: "center", minHeight: 70 }}>
                      <div style={{ padding: "10px 16px", fontWeight: 600, fontSize: ".92rem" }}>Desarrollo de casos</div>
                      <div style={{ gridColumn: "3 / 7", margin: "10px 6px", background: "#0025FF", borderRadius: 9, padding: "9px 12px", transformOrigin: "left", animation: "gsGrow .8s .3s cubic-bezier(.22,.8,.3,1) both" }}>
                        <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#fff" }}>Prototipar &rarr; piloto &rarr; producción</div>
                        <div style={{ fontSize: ".66rem", color: "rgba(255,255,255,.82)", marginTop: 2, lineHeight: 1.3 }}>3 casos en paralelo</div>
                      </div>
                    </div>
                    {/* Adopción row */}
                    <div style={{ display: "grid", gridTemplateColumns: "150px repeat(9,1fr)", borderTop: "1px solid rgba(18,20,27,.1)", alignItems: "center", minHeight: 70 }}>
                      <div style={{ padding: "10px 16px", fontWeight: 600, fontSize: ".92rem" }}>Adopción + monitoreo</div>
                      <div style={{ gridColumn: "4 / 11", margin: "10px 6px", border: "1.5px dashed #0025FF", borderRadius: 9, padding: "9px 12px", transformOrigin: "left", animation: "gsGrow .8s .5s cubic-bezier(.22,.8,.3,1) both" }}>
                        <div style={{ fontSize: ".7rem", fontWeight: 600, color: "#0025FF" }}>Seguimiento del uso real en cada caso desplegado</div>
                      </div>
                    </div>
                    {/* Refinamiento row */}
                    <div style={{ display: "grid", gridTemplateColumns: "150px repeat(9,1fr)", borderTop: "1px solid rgba(18,20,27,.1)", alignItems: "center", minHeight: 70 }}>
                      <div style={{ padding: "10px 16px", fontWeight: 600, fontSize: ".92rem" }}>Refinamiento + cambio</div>
                      <div style={{ gridColumn: "7 / 11", margin: "10px 6px", background: "#0025FF", borderRadius: 9, padding: "9px 12px", transformOrigin: "left", animation: "gsGrow .8s .7s cubic-bezier(.22,.8,.3,1) both" }}>
                        <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#fff" }}>Pulir + transferir autonomía</div>
                        <div style={{ fontSize: ".66rem", color: "rgba(255,255,255,.82)", marginTop: 2, lineHeight: 1.3 }}>Acompañar la adopción &middot; iterar sobre feedback</div>
                      </div>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: ".9rem", color: "rgba(18,20,27,.6)", margin: "14px 0 0", fontStyle: "italic", fontFamily: "'Fraunces',serif" }}>
                  La fase <strong style={{ fontStyle: "normal" }}>Desarrollo de casos</strong> es donde se construye el grueso de los resultados.
                </p>

                {/* Después del programa */}
                <div style={{ fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".2em", color: "rgba(18,20,27,.5)", fontWeight: 600, margin: "40px 0 16px" }}>Después del programa</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  {[
                    "COATRESA podría operar los casos con su equipo interno de forma autónoma.",
                    "Cartera de oportunidades identificadas, disponible para decidir siguientes rondas.",
                    "Opción de contratar una nueva ronda sobre nuevos casos o evolucionar hacia la Fábrica de IA.",
                  ].map((item) => (
                    <div key={item} className="gs-reveal" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span style={{ flex: "none", width: 22, height: 22, borderRadius: 7, background: "rgba(0,37,255,.1)", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0025FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                      </span>
                      <span style={{ fontSize: ".95rem", lineHeight: 1.55, color: "rgba(18,20,27,.78)" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ────── 04 PROPUESTA ────── */}
          <section id="propuesta" style={{ padding: "72px 0", borderBottom: "1px solid rgba(18,20,27,.14)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 40, alignItems: "start" }}>
              <div style={{ position: "sticky", top: 40 }}>
                <div style={{ fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".2em", color: "rgba(18,20,27,.5)", fontWeight: 600, marginTop: 10 }}>Propuesta</div>
              </div>
              <div>
                <h2 style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: "clamp(1.8rem,3.4vw,2.6rem)", lineHeight: 1.1, letterSpacing: "-.015em", margin: 0 }}>
                  Cómo trabajamos juntos
                </h2>
                <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "rgba(18,20,27,.72)", margin: "20px 0 0", maxWidth: "62ch" }}>
                  Sprints de dos semanas con ritmo fijo, comunicación continua y todo el trabajo en una carpeta de Drive compartida.
                </p>

                {/* El ciclo semanal */}
                <div style={{ fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".2em", color: "rgba(18,20,27,.5)", fontWeight: 600, margin: "38px 0 16px" }}>El ciclo semanal</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", alignItems: "stretch", gap: 12 }}>
                  <div style={{ background: "#FCFAF5", border: "1px solid rgba(18,20,27,.12)", borderRadius: 16, padding: 22 }}>
                    <div style={{ fontSize: ".7rem", textTransform: "uppercase", letterSpacing: ".16em", color: "#0025FF", fontWeight: 700 }}>Lunes &middot; Reporting</div>
                    <p style={{ fontSize: ".9rem", lineHeight: 1.55, color: "rgba(18,20,27,.66)", margin: "10px 0 0" }}>Prioridades, objetivos, acciones, lo que necesitamos de su parte, calendario y enlace a la carpeta.</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", color: "rgba(18,20,27,.3)", fontSize: "1.4rem" }}>&rarr;</div>
                  <div style={{ background: "#FCFAF5", border: "1px solid rgba(18,20,27,.12)", borderRadius: 16, padding: 22 }}>
                    <div style={{ fontSize: ".7rem", textTransform: "uppercase", letterSpacing: ".16em", color: "#0025FF", fontWeight: 700 }}>Viernes &middot; Avance</div>
                    <p style={{ fontSize: ".9rem", lineHeight: 1.55, color: "rgba(18,20,27,.66)", margin: "10px 0 0" }}>Avance semanal con vídeo demo o walkthrough del progreso.</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", color: "rgba(18,20,27,.3)", fontSize: "1.4rem" }}>&rarr;</div>
                  <div style={{ background: "#12141B", color: "#F5F1E9", borderRadius: 16, padding: 22 }}>
                    <div style={{ fontSize: ".7rem", textTransform: "uppercase", letterSpacing: ".16em", color: "#92D15C", fontWeight: 700 }}>Cada 2 semanas</div>
                    <p style={{ fontSize: ".9rem", lineHeight: 1.55, color: "rgba(245,241,233,.8)", margin: "10px 0 0" }}>Cierre de sprint: revisamos lo entregado y planificamos el siguiente.</p>
                  </div>
                </div>

                {/* 3 info cards */}
                <div className="gs-reveal" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 18 }}>
                  {[
                    { title: "Cockpit en Drive", sub: "Estado y acciones por fechas", icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0025FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg> },
                    { title: "Comunicación continua", sub: "Siempre al día del avance", icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0025FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z"/></svg> },
                    { title: "Todo en Drive", sub: "Una carpeta compartida", icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0025FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> },
                  ].map((c, i) => (
                    <div key={i} className="gs-lift" style={{ display: "flex", alignItems: "center", gap: 12, background: "#FCFAF5", border: "1px solid rgba(18,20,27,.12)", borderRadius: 14, padding: "14px 16px" }}>
                      <span style={{ flex: "none", width: 36, height: 36, borderRadius: 9, background: "rgba(0,37,255,.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>{c.icon}</span>
                      <div style={{ fontSize: ".84rem", fontWeight: 600, lineHeight: 1.3 }}>{c.title}<span style={{ display: "block", fontSize: ".72rem", fontWeight: 400, color: "rgba(18,20,27,.55)" }}>{c.sub}</span></div>
                    </div>
                  ))}
                </div>

                {/* Fases e inversión */}
                <div style={{ fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".2em", color: "rgba(18,20,27,.5)", fontWeight: 600, margin: "44px 0 16px" }}>Fases e inversión</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                  <div style={{ background: "#FCFAF5", border: "1px solid #0025FF", borderRadius: 16, padding: 24 }}>
                    <div style={{ fontSize: ".7rem", textTransform: "uppercase", letterSpacing: ".14em", color: "#0025FF", fontWeight: 700 }}>Fase 00 &middot; Workshop</div>
                    <div style={{ fontFamily: "'Fraunces',serif", fontSize: "1.5rem", fontWeight: 600, marginTop: 12 }}>5.000 &euro; + IVA</div>
                    <p style={{ fontSize: ".88rem", color: "rgba(18,20,27,.62)", margin: "8px 0 0", lineHeight: 1.5 }}>Descontable de la colaboración.</p>
                  </div>
                  <div style={{ background: "#FCFAF5", border: "1px solid rgba(18,20,27,.12)", borderRadius: 16, padding: 24 }}>
                    <div style={{ fontSize: ".7rem", textTransform: "uppercase", letterSpacing: ".14em", color: "rgba(18,20,27,.5)", fontWeight: 700 }}>Fases 01 a 05 &middot; Implementación</div>
                    <div style={{ fontFamily: "'Fraunces',serif", fontSize: "1.5rem", fontWeight: 600, marginTop: 12 }}>A medida</div>
                    <p style={{ fontSize: ".88rem", color: "rgba(18,20,27,.62)", margin: "8px 0 0", lineHeight: 1.5 }}>Presupuestadas a partir del Workshop.</p>
                  </div>
                  <div style={{ background: "#FCFAF5", border: "1px solid rgba(18,20,27,.12)", borderRadius: 16, padding: 24 }}>
                    <div style={{ fontSize: ".7rem", textTransform: "uppercase", letterSpacing: ".14em", color: "rgba(18,20,27,.5)", fontWeight: 700 }}>Fase 06 &middot; Acompañamiento</div>
                    <div style={{ fontFamily: "'Fraunces',serif", fontSize: "1.5rem", fontWeight: 600, marginTop: 12 }}>Cuota mensual</div>
                    <p style={{ fontSize: ".88rem", color: "rgba(18,20,27,.62)", margin: "8px 0 0", lineHeight: 1.5 }}>Formación, ajustes y transferencia.</p>
                  </div>
                </div>

                {/* Gobernanza de datos */}
                <div style={{ fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".2em", color: "rgba(18,20,27,.5)", fontWeight: 600, margin: "44px 0 16px" }}>Gobernanza de datos</div>
                <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "rgba(18,20,27,.72)", margin: "20px 0 0", maxWidth: "62ch" }}>
                  Antes de conectar cualquier sistema dejamos por escrito dónde viven sus datos, quién accede y bajo qué garantías. Los titulares de un vistazo; el detalle, dentro de cada bloque.
                </p>

                {/* 3 blue governance cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginTop: 26 }}>
                  {[
                    { title: "Residencia de datos en la UE", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg> },
                    { title: "Cero entrenamiento con sus datos", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><line x1="5.6" y1="5.6" x2="18.4" y2="18.4"/></svg> },
                    { title: "DPA + ISO 27001 / 42001 · SOC 2 Tipo II", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="9" r="6"/><path d="M9 14.5L8 22l4-2.2L16 22l-1-7.5"/></svg> },
                  ].map((c, i) => (
                    <div key={i} className="gs-lift" style={{ background: "#0025FF", color: "#fff", borderRadius: 16, padding: "22px 20px", display: "flex", flexDirection: "column", gap: 14, minHeight: 148 }}>
                      <span style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.28)", display: "flex", alignItems: "center", justifyContent: "center" }}>{c.icon}</span>
                      <div style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: "1.08rem", lineHeight: 1.25 }}>{c.title}</div>
                    </div>
                  ))}
                </div>

                {/* Confidentiality card */}
                <div className="gs-lift" style={{ display: "flex", alignItems: "flex-start", gap: 16, marginTop: 14, background: "#12141B", borderRadius: 16, padding: "22px 24px" }}>
                  <span style={{ flex: "none", width: 42, height: 42, borderRadius: 11, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
                  </span>
                  <span style={{ fontSize: ".95rem", lineHeight: 1.65, color: "rgba(255,255,255,.78)" }}>
                    <strong style={{ color: "#fff" }}>Compromiso de confidencialidad.</strong> La información que compartáis para preparar el Workshop se trata de forma segura y se usa solo para esa sesión. Se elimina después de la reunión y, si no llegamos a un acuerdo, no almacenaremos nada.
                  </span>
                </div>

                {/* Governance detail sections */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 30 }}>
                  {GOVERNANCE.map((d, i) => (
                    <div key={i} className="gs-reveal gs-lift" style={{ background: "#FCFAF5", border: "1px solid rgba(18,20,27,.12)", borderRadius: 16, padding: "24px 26px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                        <span style={{ flex: "none", width: 42, height: 42, borderRadius: 11, background: "#EFE9DC", border: "1px solid rgba(18,20,27,.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {d.icon}
                        </span>
                        <div>
                          <div style={{ fontSize: ".66rem", textTransform: "uppercase", letterSpacing: ".16em", color: "#0025FF", fontWeight: 700 }}>{d.num}</div>
                          <div style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: "1.18rem", lineHeight: 1.25, marginTop: 3 }}>{d.title}</div>
                        </div>
                      </div>
                      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 9 }}>
                        {d.bullets.map((b, bi) => (
                          <div key={bi} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                            <span style={{ flex: "none", color: "#0025FF", fontWeight: 700, lineHeight: 1.5 }}>&middot;</span>
                            <span style={{ fontSize: ".92rem", lineHeight: 1.5, color: "rgba(18,20,27,.74)" }}>{b}</span>
                          </div>
                        ))}
                      </div>
                      <details style={{ marginTop: 16, borderTop: "1px solid rgba(18,20,27,.1)", paddingTop: 12 }}>
                        <summary style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".78rem", fontWeight: 700, letterSpacing: ".04em", color: "#0025FF" }}>
                          <span className="gs-chev" style={{ display: "inline-flex" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0025FF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
                          </span>
                          Ver detalle
                        </summary>
                        <div className="gs-detail" style={{ marginTop: 14, maxWidth: "70ch" }}>
                          <p style={{ fontSize: ".9rem", lineHeight: 1.65, color: "rgba(18,20,27,.7)", margin: 0 }}>{d.detail}</p>
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ────── 08 CONTACTO ────── */}
          <footer id="contacto" style={{ padding: "64px 0 72px" }}>
            <div style={{ fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".2em", color: "#0025FF", fontWeight: 600, marginBottom: 14 }}>Agenda</div>
            <h2 style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: "clamp(1.8rem,3.4vw,2.6rem)", lineHeight: 1.1, letterSpacing: "-.015em", margin: 0 }}>Elijamos cuándo hacer el Workshop</h2>
            <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "rgba(18,20,27,.72)", margin: "18px 0 0", maxWidth: "60ch" }}>
              Estas son nuestras franjas disponibles. Coged el hueco que mejor os venga y lo bloqueamos al instante.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 16, fontSize: ".84rem", color: "rgba(18,20,27,.6)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0025FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
              Sesión online &middot; 2h30 a 3h
            </div>

            {/* Day + slot picker */}
            <div className="gs-lift" style={{ marginTop: 26, background: "#FCFAF5", border: "1px solid rgba(18,20,27,.12)", borderRadius: 20, padding: 26, display: "grid", gridTemplateColumns: "300px 1fr", gap: 30 }}>
              <div>
                <div style={{ fontSize: ".66rem", textTransform: "uppercase", letterSpacing: ".16em", color: "rgba(18,20,27,.5)", fontWeight: 700, marginBottom: 14 }}>Días disponibles &middot; julio 2026</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { num: "02", dow: "Jueves", slots: "17:00 – 24:00" },
                    { num: "03", dow: "Viernes", slots: "12:00 – 24:00" },
                  ].map((d, i) => (
                    <label key={d.num} className="ws-day" onClick={() => { setSelectedDay(d.num); setSelectedSlot(d.num === "02" ? "17:00" : "12:00"); setReserved(false); }}>
                      <input type="radio" name="ws-day" defaultChecked={i === 0} />
                      <span className="ws-day-card" style={{ display: "flex", alignItems: "center", gap: 14, border: "1px solid rgba(18,20,27,.16)", background: "#FCFAF5", borderRadius: 13, padding: "13px 16px" }}>
                        <span style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: 46, height: 46, borderRadius: 10, background: "#EFE9DC", flex: "none" }}>
                          <span style={{ fontFamily: "'Fraunces',serif", fontSize: "1.3rem", fontWeight: 600, lineHeight: 1, color: "#12141B" }}>{d.num}</span>
                          <span style={{ fontSize: ".54rem", textTransform: "uppercase", letterSpacing: ".1em", color: "rgba(18,20,27,.5)", fontWeight: 700, marginTop: 2 }}>JUL</span>
                        </span>
                        <span style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontWeight: 600, fontSize: ".96rem", color: "#12141B" }}>{d.dow}</span>
                          <span style={{ fontSize: ".78rem", color: "rgba(18,20,27,.55)", marginTop: 1 }}>{d.slots}</span>
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: ".66rem", textTransform: "uppercase", letterSpacing: ".16em", color: "rgba(18,20,27,.5)", fontWeight: 700, marginBottom: 14 }}>Franjas de inicio</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                  {(selectedDay === "02"
                    ? ["17:00","17:30","18:00","18:30","19:00","19:30","20:00","20:30","21:00","21:30","22:00","22:30","23:00","23:30"]
                    : ["12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30","20:00","20:30","21:00","21:30","22:00","22:30","23:00","23:30"]
                  ).map((t) => (
                    <label key={t} className="ws-slot">
                      <input type="radio" name="ws-slot" checked={selectedSlot === t} onChange={() => setSelectedSlot(t)} />
                      <span className="ws-slot-pill" style={{ display: "block", textAlign: "center", border: selectedSlot === t ? "1px solid #0025FF" : "1px solid rgba(18,20,27,.18)", background: selectedSlot === t ? "#0025FF" : "#FCFAF5", borderRadius: 10, padding: "11px 6px", fontWeight: 600, fontSize: ".92rem", color: selectedSlot === t ? "#fff" : "#12141B", cursor: "pointer" }}>{t}</span>
                    </label>
                  ))}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, marginTop: "auto", paddingTop: 22 }}>
                  {!reserved ? (
                    <>
                      <button
                        disabled={reserving}
                        onClick={async () => {
                          setReserving(true);
                          try {
                            const dayLabel = selectedDay === "02" ? "Jueves 2 julio" : "Viernes 3 julio";
                            await fetch("/api/reserve", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ day: dayLabel, slot: selectedSlot }),
                            });
                            setReserved(true);
                          } catch (err) {
                            console.error(err);
                            alert("Error al reservar. Inténtalo de nuevo.");
                          } finally {
                            setReserving(false);
                          }
                        }}
                        style={{ border: "none", background: "#0025FF", color: "#fff", borderRadius: 11, padding: "13px 26px", fontWeight: 600, fontSize: ".95rem", fontFamily: "'Inter',sans-serif", cursor: reserving ? "wait" : "pointer", display: "inline-flex", alignItems: "center", gap: 9, opacity: reserving ? 0.7 : 1 }}
                      >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 6" /></svg>
                        {reserving ? "Reservando…" : "Reservar esta franja"}
                      </button>
                      <span style={{ fontSize: ".8rem", color: "rgba(18,20,27,.45)", fontStyle: "italic", fontFamily: "'Fraunces',serif" }}>
                        {selectedDay === "02" ? "Jueves 2 julio" : "Viernes 3 julio"} a las {selectedSlot}
                      </span>
                    </>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#92D15C", borderRadius: 11, padding: "13px 22px" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16310a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 6" /></svg>
                      <span style={{ fontWeight: 600, fontSize: ".95rem", color: "#16310a" }}>
                        Reservado: {selectedDay === "02" ? "Jueves 2 julio" : "Viernes 3 julio"} a las {selectedSlot}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Formulario link */}
            <Link href="/formulario" className="gs-lift" style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", marginTop: 16, background: "#12141B", borderRadius: 18, padding: "24px 28px", textDecoration: "none" }}>
              <span style={{ flex: "none", width: 48, height: 48, borderRadius: 13, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 13l2 2 4-4"/></svg>
              </span>
              <span style={{ flex: 1, minWidth: 200 }}>
                <span style={{ display: "block", fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: "1.18rem", color: "#fff", lineHeight: 1.2 }}>Formulario</span>
                <span style={{ display: "block", fontSize: ".9rem", lineHeight: 1.5, color: "rgba(255,255,255,.62)", marginTop: 6 }}>Un formulario corto por departamento. Nos deja preparar la sesión por adelantado.</span>
              </span>
              <span style={{ flex: "none", display: "inline-flex", alignItems: "center", gap: 9, background: "#0025FF", color: "#fff", borderRadius: 11, padding: "13px 24px", fontWeight: 600, fontSize: ".95rem" }}>
                Abrir
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </span>
            </Link>

            {/* divider */}
            <div style={{ height: 1, background: "rgba(18,20,27,.12)", margin: "48px 0 40px" }} />

            {/* Contact info */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 30 }}>
              <div>
                <div style={{ fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".2em", color: "#0025FF", fontWeight: 600, marginBottom: 18 }}>Contacto</div>
                <p style={{ fontSize: ".95rem", color: "rgba(18,20,27,.6)", margin: 0, lineHeight: 1.7 }}>
                  Genai Sapiens Consulting &middot; Tarragona, España<br />
                  Higini Moré &middot; higini@genaisapiens.com<br />
                  +34 682 656 056 &middot; genaisapiens.com
                </p>
              </div>
              <img src="/logo.png" alt="Genai Sapiens Consulting" style={{ height: 48, width: "auto", opacity: 0.95 }} />
            </div>
          </footer>

        </div>
      </main>
    </div>
  );
}
