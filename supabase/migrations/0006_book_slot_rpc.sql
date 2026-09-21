-- ============================================================
-- Atomic book_slot RPC Function with Row Locking
-- Prevents double-booking race conditions at the database level
-- ============================================================

CREATE OR REPLACE FUNCTION public.book_slot(p_slot_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_slot record;
  v_patient_id uuid;
  v_appointment_id uuid;
BEGIN
  -- 1. Identify the authenticated caller
  v_patient_id := auth.uid();
  IF v_patient_id IS NULL THEN
    RAISE EXCEPTION 'You must be logged in to book an appointment.';
  END IF;

  -- 2. Lock the target slot row to prevent race conditions
  SELECT * INTO v_slot
  FROM appointment_slots
  WHERE id = p_slot_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Selected time slot was not found.';
  END IF;

  -- 3. Check if already booked
  IF v_slot.is_booked THEN
    RAISE EXCEPTION 'This time slot is no longer available. Please select another slot.';
  END IF;

  -- 4. Insert appointment record
  INSERT INTO appointments (slot_id, patient_id, doctor_id, status)
  VALUES (p_slot_id, v_patient_id, v_slot.doctor_id, 'booked')
  RETURNING id INTO v_appointment_id;

  -- 5. Mark slot as booked
  UPDATE appointment_slots
  SET is_booked = true
  WHERE id = p_slot_id;

  -- 6. Return appointment details
  RETURN json_build_object(
    'appointment_id', v_appointment_id,
    'slot_id', p_slot_id,
    'doctor_id', v_slot.doctor_id,
    'slot_date', v_slot.slot_date,
    'start_time', v_slot.start_time,
    'end_time', v_slot.end_time
  );
END;
$$;

-- Grant execute access to authenticated users
GRANT EXECUTE ON FUNCTION public.book_slot(uuid) TO authenticated;

