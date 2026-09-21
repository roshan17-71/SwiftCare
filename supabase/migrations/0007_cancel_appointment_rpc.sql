-- ============================================================
-- Atomic cancel_appointment RPC Function
-- Sets appointment status = 'cancelled' and frees slot in one transaction
-- ============================================================

CREATE OR REPLACE FUNCTION public.cancel_appointment(p_appointment_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_appointment record;
  v_user_id uuid;
  v_is_admin boolean;
BEGIN
  -- 1. Identify the authenticated caller
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be logged in to cancel an appointment.';
  END IF;

  v_is_admin := is_admin();

  -- 2. Lock the appointment row
  SELECT * INTO v_appointment
  FROM appointments
  WHERE id = p_appointment_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Appointment not found.';
  END IF;

  -- 3. Authorization: Only the patient who booked or an admin can cancel
  IF NOT v_is_admin AND v_appointment.patient_id != v_user_id THEN
    RAISE EXCEPTION 'You are not authorized to cancel this appointment.';
  END IF;

  -- 4. Check status
  IF v_appointment.status = 'cancelled' THEN
    RAISE EXCEPTION 'This appointment has already been cancelled.';
  END IF;

  -- 5. Set status = 'cancelled'
  UPDATE appointments
  SET status = 'cancelled'
  WHERE id = p_appointment_id;

  -- 6. Free up the slot (is_booked = false)
  UPDATE appointment_slots
  SET is_booked = false
  WHERE id = v_appointment.slot_id;

  RETURN json_build_object(
    'appointment_id', p_appointment_id,
    'status', 'cancelled',
    'slot_id', v_appointment.slot_id
  );
END;
$$;

-- Grant execute access to authenticated users
GRANT EXECUTE ON FUNCTION public.cancel_appointment(uuid) TO authenticated;

