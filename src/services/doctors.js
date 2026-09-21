import { supabase } from '../lib/supabaseClient';

/**
 * Fetch all doctors (for admin view, includes both active and inactive).
 */
export async function getDoctors() {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }
  return data;
}

/**
 * Fetch a single doctor by their UUID.
 */
export async function getDoctorById(id) {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }
  return data;
}

/**
 * Create a new doctor.
 */
export async function createDoctor(doctorData) {
  const { data, error } = await supabase
    .from('doctors')
    .insert([doctorData])
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
}

/**
 * Update an existing doctor.
 */
export async function updateDoctor(id, doctorData) {
  const { data, error } = await supabase
    .from('doctors')
    .update(doctorData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
}

/**
 * Deactivate or activate a doctor (soft delete).
 */
export async function deactivateDoctor(id, isActive = false) {
  const { data, error } = await supabase
    .from('doctors')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
}

/**
 * Upload a doctor photo to Supabase Storage and return its public URL.
 */
export async function uploadDoctorPhoto(file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `photos/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('doctor-photos')
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('doctor-photos')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

