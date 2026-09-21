import { supabase } from '../lib/supabaseClient';

/**
 * Fetch available (unbooked) slots for a specific doctor on a specific date.
 */
export async function getAvailableSlots(doctorId, slotDate) {
  if (!doctorId || !slotDate) return [];

  const { data, error } = await supabase
    .from('appointment_slots')
    .select('*')
    .eq('doctor_id', doctorId)
    .eq('slot_date', slotDate)
    .eq('is_booked', false)
    .order('start_time', { ascending: true });

  if (error) {
    throw error;
  }
  return data || [];
}

/**
 * Book a specific slot atomically via database RPC.
 */
export async function bookSlot(slotId) {
  if (!slotId) {
    throw new Error('No slot ID provided.');
  }

  const { data, error } = await supabase.rpc('book_slot', {
    p_slot_id: slotId,
  });

  if (error) {
    throw error;
  }
  return data;
}

