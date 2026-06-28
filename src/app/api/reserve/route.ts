import { NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { day, slot } = await request.json();

    if (!day || !slot) {
      return Response.json({ error: 'Missing day or slot' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('reservations')
      .insert({
        day,
        slot,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Reservation error:', error);
      return Response.json({ error: 'Failed to save reservation' }, { status: 500 });
    }

    return Response.json({ success: true, reservationId: data.id });
  } catch (error) {
    console.error('Reserve error:', error);
    return Response.json({ error: 'Reservation failed' }, { status: 500 });
  }
}
