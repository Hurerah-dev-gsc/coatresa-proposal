import { getSupabase } from "@/lib/supabase";

interface Participant {
  id: string;
  submission_id: string;
  nombre: string;
  rol: string;
}

interface FileRow {
  id: string;
  submission_id: string;
  titulo: string;
  file_name: string;
  cloudinary_url: string;
  area_id: string | null;
}

interface Area {
  id: string;
  submission_id: string;
  nombre: string;
  como_trabaja: string;
  herramientas: string;
  coordina: string;
  tareas: string;
  ia_ayuda: string;
}

interface Submission {
  id: string;
  relacion_areas: string;
  sistemas_herramientas: string;
  expectativas_ia: string;
  created_at: string;
}

interface Reservation {
  id: string;
  day: string;
  slot: string;
  created_at: string;
}

async function getData() {
  const supabase = getSupabase();

  const [subsRes, partsRes, areasRes, filesRes, reservRes] = await Promise.all([
    supabase.from("submissions").select("*").order("created_at", { ascending: false }),
    supabase.from("participants").select("*"),
    supabase.from("areas").select("*"),
    supabase.from("files").select("*"),
    supabase.from("reservations").select("*").order("created_at", { ascending: false }),
  ]);

  return {
    submissions: (subsRes.data || []) as Submission[],
    participants: (partsRes.data || []) as Participant[],
    areas: (areasRes.data || []) as Area[],
    files: (filesRes.data || []) as FileRow[],
    reservations: (reservRes.data || []) as Reservation[],
  };
}

export const dynamic = "force-dynamic";

export default async function ResponsesPage() {
  const { submissions, participants, areas, files, reservations } = await getData();

  return (
    <div style={{ minHeight: "100vh", background: "#F5F1E9", color: "#12141B", fontFamily: "'Inter',system-ui,sans-serif", padding: "56px 24px 90px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
          <span style={{ width: 30, height: 2, background: "#0025FF" }} />
          <span style={{ fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".26em", color: "#0025FF", fontWeight: 600 }}>Panel de respuestas</span>
        </div>
        <h1 style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: "clamp(2rem,5vw,3rem)", lineHeight: 1.08, letterSpacing: "-.02em", margin: "0 0 12px" }}>Respuestas del Workshop</h1>
        <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "rgba(18,20,27,.6)", margin: "0 0 40px" }}>
          Todas las reservas y formularios recibidos.
        </p>

        {/* ===== RESERVATIONS ===== */}
        <div style={{ fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".2em", color: "#0025FF", fontWeight: 600, marginBottom: 14 }}>Reservas de franja</div>

        {reservations.length === 0 ? (
          <div style={{ background: "#FCFAF5", border: "1px solid rgba(18,20,27,.12)", borderRadius: 14, padding: "20px 24px", marginBottom: 40, fontSize: ".95rem", color: "rgba(18,20,27,.5)" }}>
            Ninguna reserva todavía.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 40 }}>
            {reservations.map((r) => (
              <div key={r.id} style={{ background: "#FCFAF5", border: "1px solid rgba(18,20,27,.12)", borderRadius: 14, padding: "18px 24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 10, background: "#0025FF", flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: ".98rem" }}>{r.day} — {r.slot}</div>
                  <div style={{ fontSize: ".8rem", color: "rgba(18,20,27,.45)", marginTop: 2 }}>{new Date(r.created_at).toLocaleString("es-ES")}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== FORM SUBMISSIONS ===== */}
        <div style={{ fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".2em", color: "#0025FF", fontWeight: 600, marginBottom: 14 }}>Formularios recibidos</div>

        {submissions.length === 0 ? (
          <div style={{ background: "#FCFAF5", border: "1px solid rgba(18,20,27,.12)", borderRadius: 14, padding: "20px 24px", fontSize: ".95rem", color: "rgba(18,20,27,.5)" }}>
            Ningún formulario recibido todavía.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {submissions.map((sub) => {
              const subParticipants = participants.filter((p) => p.submission_id === sub.id);
              const subAreas = areas.filter((a) => a.submission_id === sub.id);
              const subFiles = files.filter((f) => f.submission_id === sub.id);

              return (
                <div key={sub.id} style={{ background: "#FCFAF5", border: "1px solid rgba(18,20,27,.12)", borderRadius: 18, padding: "28px 28px 24px", overflow: "hidden", wordBreak: "break-word", overflowWrap: "break-word" }}>
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
                    <div style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: "1.2rem" }}>Formulario</div>
                    <div style={{ fontSize: ".78rem", color: "rgba(18,20,27,.45)", background: "#EFE9DC", borderRadius: 8, padding: "5px 12px" }}>
                      {new Date(sub.created_at).toLocaleString("es-ES")}
                    </div>
                  </div>

                  {/* General questions */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: ".68rem", textTransform: "uppercase", letterSpacing: ".14em", color: "#0025FF", fontWeight: 700, marginBottom: 10 }}>01 · Visión general</div>

                    {sub.relacion_areas && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontWeight: 600, fontSize: ".88rem", marginBottom: 4 }}>Relación entre áreas</div>
                        <div style={{ fontSize: ".9rem", color: "rgba(18,20,27,.7)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{sub.relacion_areas}</div>
                      </div>
                    )}
                    {sub.sistemas_herramientas && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontWeight: 600, fontSize: ".88rem", marginBottom: 4 }}>Sistemas y herramientas</div>
                        <div style={{ fontSize: ".9rem", color: "rgba(18,20,27,.7)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{sub.sistemas_herramientas}</div>
                      </div>
                    )}
                    {sub.expectativas_ia && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontWeight: 600, fontSize: ".88rem", marginBottom: 4 }}>Expectativas con IA</div>
                        <div style={{ fontSize: ".9rem", color: "rgba(18,20,27,.7)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{sub.expectativas_ia}</div>
                      </div>
                    )}
                  </div>

                  {/* Participants */}
                  {subParticipants.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontWeight: 600, fontSize: ".88rem", marginBottom: 8 }}>Participantes</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {subParticipants.map((p) => (
                          <span key={p.id} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#EFE9DC", border: "1px solid rgba(18,20,27,.1)", borderRadius: 9, padding: "7px 14px", fontSize: ".86rem" }}>
                            <strong>{p.nombre}</strong>
                            {p.rol && <span style={{ color: "rgba(18,20,27,.5)" }}>— {p.rol}</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Areas */}
                  {subAreas.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: ".68rem", textTransform: "uppercase", letterSpacing: ".14em", color: "#0025FF", fontWeight: 700, marginBottom: 12 }}>02 · Áreas</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {subAreas.map((area, idx) => {
                          const areaFiles = subFiles.filter((f) => f.area_id === area.id);
                          return (
                            <div key={area.id} style={{ background: "#fff", border: "1px solid rgba(18,20,27,.1)", borderRadius: 14, padding: "20px 22px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: 28, height: 28, borderRadius: 7, background: "#0025FF", color: "#fff", fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: ".85rem", padding: "0 6px" }}>{idx + 1}</span>
                                <span style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: "1.05rem" }}>{area.nombre || "Área " + (idx + 1)}</span>
                              </div>

                              {[
                                { label: "Cómo trabaja", val: area.como_trabaja },
                                { label: "Herramientas", val: area.herramientas },
                                { label: "Coordinación", val: area.coordina },
                                { label: "Tareas repetitivas", val: area.tareas },
                                { label: "IA podría ayudar", val: area.ia_ayuda },
                              ].filter((f) => f.val).map((f) => (
                                <div key={f.label} style={{ marginBottom: 10 }}>
                                  <div style={{ fontWeight: 600, fontSize: ".82rem", color: "rgba(18,20,27,.5)", marginBottom: 3 }}>{f.label}</div>
                                  <div style={{ fontSize: ".88rem", color: "rgba(18,20,27,.7)", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{f.val}</div>
                                </div>
                              ))}

                              {areaFiles.length > 0 && (
                                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed rgba(18,20,27,.12)" }}>
                                  <div style={{ fontWeight: 600, fontSize: ".82rem", color: "rgba(18,20,27,.5)", marginBottom: 6 }}>Archivos</div>
                                  {areaFiles.map((f) => (
                                    <a key={f.id} href={f.cloudinary_url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#EFE9DC", borderRadius: 8, padding: "6px 12px", fontSize: ".82rem", color: "#0025FF", fontWeight: 600, textDecoration: "none", marginRight: 8, marginBottom: 6 }}>
                                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                                      {f.titulo || f.file_name}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Additional files */}
                  {subFiles.filter((f) => !f.area_id).length > 0 && (
                    <div>
                      <div style={{ fontSize: ".68rem", textTransform: "uppercase", letterSpacing: ".14em", color: "#0025FF", fontWeight: 700, marginBottom: 8 }}>03 · Archivos adicionales</div>
                      {subFiles.filter((f) => !f.area_id).map((f) => (
                        <a key={f.id} href={f.cloudinary_url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#EFE9DC", borderRadius: 8, padding: "6px 12px", fontSize: ".82rem", color: "#0025FF", fontWeight: 600, textDecoration: "none", marginRight: 8, marginBottom: 6 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                          {f.titulo || f.file_name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
