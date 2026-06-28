import { NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase';

interface FilePayload {
  title: string;
  url: string;
}

interface AreaPayload {
  nombre: string;
  comoTrabaja: string;
  herramientas: string;
  tareasRepetitivas: string;
  dondeIA: string;
  files: FilePayload[];
  audios: FilePayload[];
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await request.json();

    const { generalQuestions, participants, areas, archivosAdicionales } = body;

    // Insert the main submission
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .insert({
        relacion_areas: generalQuestions.relacion,
        sistemas_herramientas: generalQuestions.sistemas,
        expectativas_ia: generalQuestions.expectativas,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (submissionError) {
      console.error('Submission error:', submissionError);
      return Response.json({ error: 'Failed to save submission' }, { status: 500 });
    }

    const submissionId = submission.id;

    // Insert participants
    if (participants?.length) {
      const participantRows = participants.map((p: { nombre: string; rol: string }) => ({
        submission_id: submissionId,
        nombre: p.nombre,
        rol: p.rol,
      }));

      const { error: partError } = await supabase
        .from('participants')
        .insert(participantRows);

      if (partError) console.error('Participants error:', partError);
    }

    // Insert areas with their files and audios
    if (areas?.length) {
      for (const area of areas as AreaPayload[]) {
        const { data: areaData, error: areaError } = await supabase
          .from('areas')
          .insert({
            submission_id: submissionId,
            nombre: area.nombre,
            como_trabaja: area.comoTrabaja,
            herramientas: area.herramientas,
            tareas: area.tareasRepetitivas,
            ia_ayuda: area.dondeIA,
          })
          .select()
          .single();

        if (areaError) {
          console.error('Area error:', areaError);
          continue;
        }

        // Insert area files
        const allFiles = [
          ...(area.files || []).filter((f) => f.url).map((f) => ({
            area_id: areaData.id,
            submission_id: submissionId,
            titulo: f.title,
            file_name: f.title,
            cloudinary_url: f.url,
            file_type: 'document',
          })),
          ...(area.audios || []).filter((f) => f.url).map((f) => ({
            area_id: areaData.id,
            submission_id: submissionId,
            titulo: f.title,
            file_name: f.title,
            cloudinary_url: f.url,
            file_type: 'audio',
          })),
        ];

        if (allFiles.length) {
          const { error: fileError } = await supabase
            .from('files')
            .insert(allFiles);

          if (fileError) console.error('Area files error:', fileError);
        }
      }
    }

    // Insert additional files
    if (archivosAdicionales?.length) {
      const adicFileRows = (archivosAdicionales as FilePayload[])
        .filter((f) => f.url)
        .map((f) => ({
          submission_id: submissionId,
          area_id: null,
          titulo: f.title,
          file_name: f.title,
          cloudinary_url: f.url,
          file_type: 'document',
        }));

      if (adicFileRows.length) {
        const { error: adicError } = await supabase
          .from('files')
          .insert(adicFileRows);

        if (adicError) console.error('Additional files error:', adicError);
      }
    }

    return Response.json({ success: true, submissionId });
  } catch (error) {
    console.error('Submit error:', error);
    return Response.json({ error: 'Submission failed' }, { status: 500 });
  }
}
