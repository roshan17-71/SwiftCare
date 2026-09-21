import { supabase } from '../lib/supabaseClient';

/**
 * Fetch all slots for a specific doctor on a specific date.
 */
export async function getSlotsForDoctorAndDate(doctorId, slotDate) {
  if (!doctorId || !slotDate) return [];

  const { data, error } = await supabase
    .from('appointment_slots')
    .select('*')
    .eq('doctor_id', doctorId)
    .eq('slot_date', slotDate)
    .order('start_time', { ascending: true });

  if (error) {
    throw error;
  }
  return data || [];
}

/**
 * Bulk create slots for a doctor on a specific date.
 *
 * @param {Array<{doctor_id: string, slot_date: string, start_time: string, end_time: string, is_booked: boolean}>} slots
 */
export async function createSlots(slots) {
  if (!slots || slots.length === 0) return [];

  const { data, error } = await supabase
    .from('appointment_slots')
    .insert(slots)
    .select();

  if (error) {
    // 23505 is PostgreSQL error code for unique_violation
    if (error.code === '23505') {
      throw new Error(
        'One or more of these time slots already exist for this doctor on this date. Please check the existing slots.'
      );
    }
    throw error;
  }

  return data;
}

/**
 * Delete an unbooked slot.
 */
export async function deleteSlot(slotId) {
  const { error } = await supabase
    .from('appointment_slots')
    .delete()
    .eq('id', slotId)
    .eq('is_booked', false);

  if (error) {
    throw error;
  }
  return true;
}

