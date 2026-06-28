"use client";

import { useState, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Participant {
  id: number;
  nombre: string;
  rol: string;
}

interface AreaFile {
  id: number;
  titulo: string;
  fileName: string;
  file: File | null;
  url?: string;
}

interface Area {
  id: number;
  nombre: string;
  comoTrabaja: string;
  herramientas: string;
  coordina: string;
  tareas: string;
  iaAyuda: string;
  files: AreaFile[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

let _uid = 100;
const nid = () => ++_uid;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function FormularioPage() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* Section 01 state */
  const [relacion, setRelacion] = useState("");
  const [sistemas, setSistemas] = useState("");
  const [expectativas, setExpectativas] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([
    { id: 1, nombre: "", rol: "" },
  ]);

  /* Section 02 state */
  const [areas, setAreas] = useState<Area[]>([
    { id: 2, nombre: "", comoTrabaja: "", herramientas: "", coordina: "", tareas: "", iaAyuda: "", files: [] },
  ]);

  /* Section 03 state */
  const [adicFiles, setAdicFiles] = useState<AreaFile[]>([]);

  /* ---- Participant helpers ---- */
  const addParticipant = () =>
    setParticipants((ps) => [...ps, { id: nid(), nombre: "", rol: "" }]);
  const removeParticipant = (id: number) =>
    setParticipants((ps) => ps.filter((p) => p.id !== id));
  const setParticipantField = (id: number, field: "nombre" | "rol", val: string) =>
    setParticipants((ps) => ps.map((p) => (p.id === id ? { ...p, [field]: val } : p)));

  /* ---- Area helpers ---- */
  const addArea = () =>
    setAreas((as) => [...as, { id: nid(), nombre: "", comoTrabaja: "", herramientas: "", coordina: "", tareas: "", iaAyuda: "", files: [] }]);
  const removeArea = (id: number) =>
    setAreas((as) => as.filter((a) => a.id !== id));
  const setAreaField = (id: number, field: string, val: string) =>
    setAreas((as) => as.map((a) => (a.id === id ? { ...a, [field]: val } : a)));
  const addAreaFile = (aid: number) =>
    setAreas((as) => as.map((a) => (a.id === aid ? { ...a, files: [...a.files, { id: nid(), titulo: "", fileName: "", file: null }] } : a)));
  const removeAreaFile = (aid: number, fid: number) =>
    setAreas((as) => as.map((a) => (a.id === aid ? { ...a, files: a.files.filter((f) => f.id !== fid) } : a)));
  const setAreaFileField = (aid: number, fid: number, field: string, val: string | File | null) =>
    setAreas((as) => as.map((a) => (a.id === aid ? { ...a, files: a.files.map((f) => (f.id === fid ? { ...f, [field]: val } : f)) } : a)));

  /* ---- Adic file helpers ---- */
  const addAdicFile = () =>
    setAdicFiles((fs) => [...fs, { id: nid(), titulo: "", fileName: "", file: null }]);
  const removeAdicFile = (id: number) =>
    setAdicFiles((fs) => fs.filter((f) => f.id !== id));
  const setAdicFileField = (id: number, field: string, val: string | File | null) =>
    setAdicFiles((fs) => fs.map((f) => (f.id === id ? { ...f, [field]: val } : f)));

  /* ---- Upload & Submit ---- */
  const uploadFile = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json();
    return json.url;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const uploadedAreas = await Promise.all(
        areas.map(async (area) => {
          const uploadedFiles = await Promise.all(
            area.files
              .filter((f) => f.file)
              .map(async (f) => ({ title: f.titulo, url: await uploadFile(f.file!) }))
          );
          return {
            nombre: area.nombre,
            comoTrabaja: area.comoTrabaja,
            herramientas: area.herramientas,
            otrasAreas: area.coordina,
            tareasRepetitivas: area.tareas,
            dondeIA: area.iaAyuda,
            files: uploadedFiles,
          };
        })
      );

      const uploadedAdic = await Promise.all(
        adicFiles
          .filter((f) => f.file)
          .map(async (f) => ({ title: f.titulo, url: await uploadFile(f.file!) }))
      );

      const payload = {
        generalQuestions: { relacion, sistemas, expectativas },
        participants: participants.map(({ nombre, rol }) => ({ nombre, rol })),
        areas: uploadedAreas,
        archivosAdicionales: uploadedAdic,
      };

      await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setSent(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      alert("Hubo un error al enviar el formulario. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---- Focus style helper ---- */
  const focusStyle = {
    borderColor: "#0025FF",
    boxShadow: "0 0 0 3px rgba(0,37,255,.12)",
    outline: "none",
  };
  const onFocus = (e: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    Object.assign(e.currentTarget.style, focusStyle);
  };
  const onBlurTextarea = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = "rgba(18,20,27,.18)";
    e.currentTarget.style.boxShadow = "none";
  };
  const onBlurInput = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "rgba(18,20,27,.18)";
    e.currentTarget.style.boxShadow = "none";
  };

  /* ---- Render ---- */

  return (
    <div style={{ minHeight: "100vh", background: "#F5F1E9", color: "#12141B", fontFamily: "'Inter',system-ui,sans-serif", WebkitFontSmoothing: "antialiased", padding: "56px 24px 90px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>

        {/* ===== HEADER ===== */}
        <header style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
            <span style={{ width: 30, height: 2, background: "#0025FF" }} />
            <span style={{ fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".26em", color: "#0025FF", fontWeight: 600 }}>Genai Sapiens &middot; Workshop de IA</span>
          </div>
          <h1 style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: "clamp(2.2rem,6vw,3.4rem)", lineHeight: 1.05, letterSpacing: "-.02em", margin: 0 }}>Preparaci&oacute;n del Workshop</h1>
          <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "rgba(18,20,27,.72)", margin: "20px 0 0", maxWidth: "62ch" }}>
            Este formulario nos ayuda a entender c&oacute;mo trabaja la empresa antes de la sesi&oacute;n, para llegar con propuestas concretas. Primero unas preguntas generales y despu&eacute;s un bloque por cada &aacute;rea, no solo marketing y comercial. No hay respuestas correctas: cuanto m&aacute;s real, mejor.
          </p>
        </header>

        <div style={{ height: 1, background: "rgba(18,20,27,.14)", margin: "40px 0" }} />

        {/* ===== SECTION 01 — Visión general ===== */}
        <section style={{ marginBottom: 18 }}>
          <div style={{ fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".2em", color: "#0025FF", fontWeight: 600, marginBottom: 10 }}>01 &middot; Visi&oacute;n general</div>
          <h2 style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: "1.7rem", lineHeight: 1.15, letterSpacing: "-.01em", margin: "0 0 26px" }}>Preguntas generales</h2>

          {/* Q1 - Relación áreas */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: ".95rem", marginBottom: 7 }}>&iquest;C&oacute;mo se relacionan las &aacute;reas entre s&iacute;?</label>
            <span style={{ display: "block", fontSize: ".82rem", color: "rgba(18,20,27,.55)", margin: "-1px 0 10px", lineHeight: 1.45 }}>Un mapa simple de c&oacute;mo trabajan juntas.</span>
            <textarea
              placeholder="Escriban aquí…"
              value={relacion}
              onChange={(e) => setRelacion(e.target.value)}
              onFocus={onFocus}
              onBlur={onBlurTextarea}
              style={{ width: "100%", border: "1px solid rgba(18,20,27,.18)", borderRadius: 12, padding: "13px 15px", fontSize: ".95rem", background: "#FCFAF5", color: "#12141B", minHeight: 96, resize: "vertical", lineHeight: 1.55, fontFamily: "inherit", boxSizing: "border-box" }}
            />
          </div>

          {/* Q2 - Sistemas */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: ".95rem", marginBottom: 7 }}>Sistemas y herramientas principales (a nivel de empresa)</label>
            <span style={{ display: "block", fontSize: ".82rem", color: "rgba(18,20,27,.55)", margin: "-1px 0 10px", lineHeight: 1.45 }}>CRM, ERP, carpetas, correo, software propio… Solo nombrarlos, sin accesos.</span>
            <textarea
              placeholder="Escriban aquí…"
              value={sistemas}
              onChange={(e) => setSistemas(e.target.value)}
              onFocus={onFocus}
              onBlur={onBlurTextarea}
              style={{ width: "100%", border: "1px solid rgba(18,20,27,.18)", borderRadius: 12, padding: "13px 15px", fontSize: ".95rem", background: "#FCFAF5", color: "#12141B", minHeight: 96, resize: "vertical", lineHeight: 1.55, fontFamily: "inherit", boxSizing: "border-box" }}
            />
          </div>

          {/* Q3 - Participants */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: ".95rem", marginBottom: 7 }}>&iquest;Qui&eacute;n participar&aacute; en el Workshop?</label>
            <span style={{ display: "block", fontSize: ".82rem", color: "rgba(18,20,27,.55)", margin: "-1px 0 12px", lineHeight: 1.45 }}>Incluyan a alguien que pueda priorizar y decidir.</span>
            {participants.map((p) => (
              <div key={p.id} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
                <input
                  type="text"
                  placeholder="Nombre"
                  value={p.nombre}
                  onChange={(e) => setParticipantField(p.id, "nombre", e.target.value)}
                  onFocus={onFocus}
                  onBlur={onBlurInput}
                  style={{ flex: 1, minWidth: 160, border: "1px solid rgba(18,20,27,.18)", borderRadius: 11, padding: "12px 14px", fontSize: ".95rem", background: "#FCFAF5", color: "#12141B", fontFamily: "inherit", boxSizing: "border-box" }}
                />
                <input
                  type="text"
                  placeholder="Rol"
                  value={p.rol}
                  onChange={(e) => setParticipantField(p.id, "rol", e.target.value)}
                  onFocus={onFocus}
                  onBlur={onBlurInput}
                  style={{ flex: 1, minWidth: 160, border: "1px solid rgba(18,20,27,.18)", borderRadius: 11, padding: "12px 14px", fontSize: ".95rem", background: "#FCFAF5", color: "#12141B", fontFamily: "inherit", boxSizing: "border-box" }}
                />
                {participants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeParticipant(p.id)}
                    title="Eliminar"
                    style={{ flex: "none", width: 42, height: 42, borderRadius: 10, border: "1px solid rgba(18,20,27,.16)", background: "#fff", color: "rgba(18,20,27,.55)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#d23b3b"; e.currentTarget.style.color = "#d23b3b"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(18,20,27,.16)"; e.currentTarget.style.color = "rgba(18,20,27,.55)"; }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addParticipant}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1.5px dashed rgba(0,37,255,.45)", color: "#0025FF", background: "rgba(0,37,255,.04)", borderRadius: 11, padding: "11px 18px", fontWeight: 600, fontSize: ".92rem", cursor: "pointer", marginTop: 4 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,37,255,.09)"; e.currentTarget.style.borderColor = "#0025FF"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,37,255,.04)"; e.currentTarget.style.borderColor = "rgba(0,37,255,.45)"; }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
              A&ntilde;adir participante
            </button>
          </div>

          {/* Q4 - Expectativas IA */}
          <div style={{ marginBottom: 4 }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: ".95rem", marginBottom: 7 }}>&iquest;Qu&eacute; esperan conseguir con la IA a nivel global de empresa?</label>
            <textarea
              placeholder="Escriban aquí…"
              value={expectativas}
              onChange={(e) => setExpectativas(e.target.value)}
              onFocus={onFocus}
              onBlur={onBlurTextarea}
              style={{ width: "100%", border: "1px solid rgba(18,20,27,.18)", borderRadius: 12, padding: "13px 15px", fontSize: ".95rem", background: "#FCFAF5", color: "#12141B", minHeight: 96, resize: "vertical", lineHeight: 1.55, fontFamily: "inherit", boxSizing: "border-box" }}
            />
          </div>
        </section>

        <div style={{ height: 1, background: "rgba(18,20,27,.14)", margin: "40px 0" }} />

        {/* ===== SECTION 02 — Por áreas ===== */}
        <section style={{ marginBottom: 18 }}>
          <div style={{ fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".2em", color: "#0025FF", fontWeight: 600, marginBottom: 10 }}>02 &middot; Por &aacute;reas</div>
          <h2 style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: "1.7rem", lineHeight: 1.15, letterSpacing: "-.01em", margin: "0 0 6px" }}>Un bloque por cada &aacute;rea</h2>
          <p style={{ fontSize: ".95rem", lineHeight: 1.6, color: "rgba(18,20,27,.6)", margin: "0 0 24px", maxWidth: "60ch" }}>A&ntilde;adan tantas &aacute;reas como tengan: compras, producci&oacute;n, administraci&oacute;n, atenci&oacute;n al cliente, log&iacute;stica…</p>

          {areas.map((area, idx) => (
            <div key={area.id} className="gs-area-card" style={{ position: "relative", background: "#FCFAF5", border: "1px solid rgba(18,20,27,.12)", borderRadius: 18, padding: "26px 26px 24px", marginBottom: 16 }}>
              {/* Area header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: 34, height: 34, borderRadius: 9, background: "#0025FF", color: "#fff", fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: "1rem", padding: "0 8px" }}>{idx + 1}</span>
                  <span style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: "1.3rem", color: "#12141B" }}>{"Área " + (idx + 1)}</span>
                </div>
                {areas.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArea(area.id)}
                    title="Eliminar área"
                    style={{ flex: "none", width: 34, height: 34, borderRadius: 9, border: "1px solid rgba(18,20,27,.16)", background: "#fff", color: "rgba(18,20,27,.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#d23b3b"; e.currentTarget.style.color = "#d23b3b"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(18,20,27,.16)"; e.currentTarget.style.color = "rgba(18,20,27,.5)"; }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                  </button>
                )}
              </div>

              {/* Nombre del área */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontWeight: 600, fontSize: ".92rem", marginBottom: 7 }}>Nombre del &aacute;rea</label>
                <input
                  type="text"
                  placeholder="Ej. Compras, Producción, Administración…"
                  value={area.nombre}
                  onChange={(e) => setAreaField(area.id, "nombre", e.target.value)}
                  onFocus={onFocus}
                  onBlur={onBlurInput}
                  style={{ width: "100%", border: "1px solid rgba(18,20,27,.18)", borderRadius: 11, padding: "12px 14px", fontSize: ".95rem", background: "#fff", color: "#12141B", fontFamily: "inherit", boxSizing: "border-box" }}
                />
              </div>

              {/* ¿Cómo trabaja? */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontWeight: 600, fontSize: ".92rem", marginBottom: 7 }}>&iquest;C&oacute;mo trabaja el &aacute;rea?</label>
                <textarea
                  placeholder="Escriban aquí…"
                  value={area.comoTrabaja}
                  onChange={(e) => setAreaField(area.id, "comoTrabaja", e.target.value)}
                  onFocus={onFocus}
                  onBlur={onBlurTextarea}
                  style={{ width: "100%", border: "1px solid rgba(18,20,27,.18)", borderRadius: 12, padding: "13px 15px", fontSize: ".95rem", background: "#fff", color: "#12141B", minHeight: 84, resize: "vertical", lineHeight: 1.55, fontFamily: "inherit", boxSizing: "border-box" }}
                />
              </div>

              {/* Herramientas */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontWeight: 600, fontSize: ".92rem", marginBottom: 7 }}>&iquest;Qu&eacute; herramientas o programas usan?</label>
                <textarea
                  placeholder="Escriban aquí…"
                  value={area.herramientas}
                  onChange={(e) => setAreaField(area.id, "herramientas", e.target.value)}
                  onFocus={onFocus}
                  onBlur={onBlurTextarea}
                  style={{ width: "100%", border: "1px solid rgba(18,20,27,.18)", borderRadius: 12, padding: "13px 15px", fontSize: ".95rem", background: "#fff", color: "#12141B", minHeight: 84, resize: "vertical", lineHeight: 1.55, fontFamily: "inherit", boxSizing: "border-box" }}
                />
              </div>

              {/* Coordinación */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontWeight: 600, fontSize: ".92rem", marginBottom: 7 }}>&iquest;Con qu&eacute; otras &aacute;reas trabajan o se coordinan?</label>
                <textarea
                  placeholder="Escriban aquí…"
                  value={area.coordina}
                  onChange={(e) => setAreaField(area.id, "coordina", e.target.value)}
                  onFocus={onFocus}
                  onBlur={onBlurTextarea}
                  style={{ width: "100%", border: "1px solid rgba(18,20,27,.18)", borderRadius: 12, padding: "13px 15px", fontSize: ".95rem", background: "#fff", color: "#12141B", minHeight: 84, resize: "vertical", lineHeight: 1.55, fontFamily: "inherit", boxSizing: "border-box" }}
                />
              </div>

              {/* Tareas repetitivas */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontWeight: 600, fontSize: ".92rem", marginBottom: 7 }}>Tareas repetitivas que m&aacute;s tiempo les quitan</label>
                <textarea
                  placeholder="Escriban aquí…"
                  value={area.tareas}
                  onChange={(e) => setAreaField(area.id, "tareas", e.target.value)}
                  onFocus={onFocus}
                  onBlur={onBlurTextarea}
                  style={{ width: "100%", border: "1px solid rgba(18,20,27,.18)", borderRadius: 12, padding: "13px 15px", fontSize: ".95rem", background: "#fff", color: "#12141B", minHeight: 84, resize: "vertical", lineHeight: 1.55, fontFamily: "inherit", boxSizing: "border-box" }}
                />
              </div>

              {/* IA */}
              <div style={{ marginBottom: 2 }}>
                <label style={{ display: "block", fontWeight: 600, fontSize: ".92rem", marginBottom: 7 }}>&iquest;D&oacute;nde creen que la IA podr&iacute;a ayudar?</label>
                <textarea
                  placeholder="Escriban aquí…"
                  value={area.iaAyuda}
                  onChange={(e) => setAreaField(area.id, "iaAyuda", e.target.value)}
                  onFocus={onFocus}
                  onBlur={onBlurTextarea}
                  style={{ width: "100%", border: "1px solid rgba(18,20,27,.18)", borderRadius: 12, padding: "13px 15px", fontSize: ".95rem", background: "#fff", color: "#12141B", minHeight: 84, resize: "vertical", lineHeight: 1.55, fontFamily: "inherit", boxSizing: "border-box" }}
                />
              </div>

              {/* Area files */}
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px dashed rgba(18,20,27,.18)" }}>
                <label style={{ display: "block", fontWeight: 600, fontSize: ".92rem", marginBottom: 5 }}>Archivos de esta &aacute;rea</label>
                <span style={{ display: "block", fontSize: ".82rem", color: "rgba(18,20,27,.55)", marginBottom: 12, lineHeight: 1.45 }}>Suban lo que ayude a entender el &aacute;rea. Pongan un t&iacute;tulo a cada archivo.</span>

                {area.files.map((file) => (
                  <div key={file.id} style={{ display: "flex", gap: 9, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
                    <input
                      type="text"
                      placeholder="¿Qué es este archivo?"
                      value={file.titulo}
                      onChange={(e) => setAreaFileField(area.id, file.id, "titulo", e.target.value)}
                      onFocus={onFocus}
                      onBlur={onBlurInput}
                      style={{ flex: 1, minWidth: 190, border: "1px solid rgba(18,20,27,.18)", borderRadius: 10, padding: "11px 13px", fontSize: ".9rem", background: "#fff", color: "#12141B", fontFamily: "inherit", boxSizing: "border-box" }}
                    />
                    <label
                      style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "1px solid rgba(18,20,27,.2)", background: "#fff", borderRadius: 10, padding: "10px 14px", fontWeight: 600, fontSize: ".86rem", color: "#12141B", cursor: "pointer" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#0025FF"; e.currentTarget.style.color = "#0025FF"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(18,20,27,.2)"; e.currentTarget.style.color = "#12141B"; }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
                      Elegir archivo
                      <input
                        type="file"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const f = e.target.files && e.target.files[0];
                          if (f) {
                            setAreaFileField(area.id, file.id, "fileName", f.name);
                            setAreaFileField(area.id, file.id, "file", f);
                          }
                        }}
                      />
                    </label>
                    <span style={{ fontSize: ".8rem", color: "rgba(18,20,27,.5)", maxWidth: 170, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.fileName || "Ningún archivo"}</span>
                    <button
                      type="button"
                      onClick={() => removeAreaFile(area.id, file.id)}
                      title="Quitar archivo"
                      style={{ flex: "none", width: 38, height: 38, borderRadius: 9, border: "1px solid rgba(18,20,27,.16)", background: "#fff", color: "rgba(18,20,27,.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#d23b3b"; e.currentTarget.style.color = "#d23b3b"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(18,20,27,.16)"; e.currentTarget.style.color = "rgba(18,20,27,.5)"; }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addAreaFile(area.id)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "1.5px dashed rgba(0,37,255,.4)", color: "#0025FF", background: "rgba(0,37,255,.04)", borderRadius: 10, padding: "9px 15px", fontWeight: 600, fontSize: ".86rem", cursor: "pointer", marginTop: 2 }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,37,255,.09)"; e.currentTarget.style.borderColor = "#0025FF"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,37,255,.04)"; e.currentTarget.style.borderColor = "rgba(0,37,255,.4)"; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                  A&ntilde;adir archivo
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addArea}
            style={{ width: "100%", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: 9, border: "1.5px dashed rgba(0,37,255,.5)", color: "#0025FF", background: "rgba(0,37,255,.05)", borderRadius: 14, padding: 16, fontWeight: 600, fontSize: "1rem", cursor: "pointer", marginTop: 4 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,37,255,.1)"; e.currentTarget.style.borderColor = "#0025FF"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,37,255,.05)"; e.currentTarget.style.borderColor = "rgba(0,37,255,.5)"; }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            A&ntilde;adir &aacute;rea
          </button>
        </section>

        <div style={{ height: 1, background: "rgba(18,20,27,.14)", margin: "40px 0" }} />

        {/* ===== SECTION 03 — Extra ===== */}
        <section>
          <div style={{ fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".2em", color: "#0025FF", fontWeight: 600, marginBottom: 10 }}>03 &middot; Extra</div>
          <h2 style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: "1.7rem", lineHeight: 1.15, letterSpacing: "-.01em", margin: "0 0 6px" }}>Archivos adicionales</h2>
          <p style={{ fontSize: ".95rem", lineHeight: 1.6, color: "rgba(18,20,27,.6)", margin: "0 0 20px", maxWidth: "60ch" }}>Cualquier cosa que quieran compartir a nivel general. Pongan un t&iacute;tulo a cada archivo.</p>

          {adicFiles.map((file) => (
            <div key={file.id} style={{ display: "flex", gap: 9, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
              <input
                type="text"
                placeholder="¿Qué es este archivo?"
                value={file.titulo}
                onChange={(e) => setAdicFileField(file.id, "titulo", e.target.value)}
                onFocus={onFocus}
                onBlur={onBlurInput}
                style={{ flex: 1, minWidth: 190, border: "1px solid rgba(18,20,27,.18)", borderRadius: 10, padding: "11px 13px", fontSize: ".9rem", background: "#FCFAF5", color: "#12141B", fontFamily: "inherit", boxSizing: "border-box" }}
              />
              <label
                style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "1px solid rgba(18,20,27,.2)", background: "#FCFAF5", borderRadius: 10, padding: "10px 14px", fontWeight: 600, fontSize: ".86rem", color: "#12141B", cursor: "pointer" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#0025FF"; e.currentTarget.style.color = "#0025FF"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(18,20,27,.2)"; e.currentTarget.style.color = "#12141B"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
                Elegir archivo
                <input
                  type="file"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files && e.target.files[0];
                    if (f) {
                      setAdicFileField(file.id, "fileName", f.name);
                      setAdicFileField(file.id, "file", f);
                    }
                  }}
                />
              </label>
              <span style={{ fontSize: ".8rem", color: "rgba(18,20,27,.5)", maxWidth: 170, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.fileName || "Ningún archivo"}</span>
              <button
                type="button"
                onClick={() => removeAdicFile(file.id)}
                title="Quitar archivo"
                style={{ flex: "none", width: 38, height: 38, borderRadius: 9, border: "1px solid rgba(18,20,27,.16)", background: "#fff", color: "rgba(18,20,27,.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#d23b3b"; e.currentTarget.style.color = "#d23b3b"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(18,20,27,.16)"; e.currentTarget.style.color = "rgba(18,20,27,.5)"; }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addAdicFile}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1.5px dashed rgba(0,37,255,.45)", color: "#0025FF", background: "rgba(0,37,255,.04)", borderRadius: 11, padding: "11px 18px", fontWeight: 600, fontSize: ".92rem", cursor: "pointer", marginTop: 2 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,37,255,.09)"; e.currentTarget.style.borderColor = "#0025FF"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,37,255,.04)"; e.currentTarget.style.borderColor = "rgba(0,37,255,.45)"; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            A&ntilde;adir archivo
          </button>
        </section>

        {/* ===== SUBMIT ===== */}
        <div style={{ marginTop: 44 }}>
          {!sent ? (
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                style={{ border: "none", background: "#0025FF", color: "#fff", borderRadius: 12, padding: "15px 32px", fontWeight: 600, fontSize: "1rem", cursor: submitting ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: 9, opacity: submitting ? 0.7 : 1 }}
                onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = "#0a1fd0"; }}
                onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = "#0025FF"; }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                {submitting ? "Enviando…" : "Enviar formulario"}
              </button>
              <span style={{ fontSize: ".84rem", color: "rgba(18,20,27,.5)", fontStyle: "italic", fontFamily: "'Fraunces',serif" }}>Se enviar&aacute; a Genai Sapiens Consulting</span>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 14, background: "#0025FF", color: "#fff", borderRadius: 16, padding: "22px 26px" }}>
              <span style={{ flex: "none", width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 6" /></svg>
              </span>
              <span>
                <span style={{ display: "block", fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: "1.15rem" }}>&iexcl;Gracias!</span>
                <span style={{ display: "block", fontSize: ".92rem", color: "rgba(255,255,255,.8)", marginTop: 3 }}>Hemos recibido la informaci&oacute;n. Nos vemos en el Workshop.</span>
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
