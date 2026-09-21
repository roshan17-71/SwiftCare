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

/**
 * Fetch all appointments belonging to the currently authenticated patient.
 */
export async function getMyAppointments() {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      status,
      created_at,
      slot_id,
      doctor_id,
      patient_id,
      doctors (
        id,
        full_name,
        specialization,
        department,
        photo_url
      ),
      appointment_slots (
        id,
        slot_date,
        start_time,
        end_time
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }
  return data || [];
}

/**
 * Fetch details of a single appointment by its ID.
 */
export async function getAppointmentById(id) {
  if (!id) {
    throw new Error('No appointment ID provided.');
  }

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      status,
      created_at,
      slot_id,
      doctor_id,
      patient_id,
      doctors (
        id,
        full_name,
        specialization,
        department,
        photo_url,
        qualification
      ),
      appointment_slots (
        id,
        slot_date,
        start_time,
        end_time
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }
  return data;
}

/**
 * Cancel an appointment atomically via database RPC.
 */
export async function cancelAppointment(appointmentId) {
  if (!appointmentId) {
    throw new Error('No appointment ID provided.');
  }

  const { data, error } = await supabase.rpc('cancel_appointment', {
    p_appointment_id: appointmentId,
  });

  if (error) {
    throw error;
  }
  return data;
}
