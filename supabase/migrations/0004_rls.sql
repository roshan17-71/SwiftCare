-- ============================================================
-- Enable Row Level Security on all 4 tables
-- (Policies do NOTHING until RLS is turned on for the table)
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- PROFILES table policies
-- ============================================================

-- A user can view their own profile row; admins can view all rows
CREATE POLICY "Users view own profile"
ON profiles FOR SELECT
USING (id = auth.uid() OR is_admin());

-- A user can update their own profile, but the role column must stay the same
-- (they cannot promote themselves to admin)
CREATE POLICY "Users update own profile"
ON profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid()
  AND role = (SELECT role FROM profiles WHERE id = auth.uid())
);

-- Admins can update any profile (including changing someone's role)
CREATE POLICY "Admins update any profile"
ON profiles FOR UPDATE
USING (is_admin());

-- INSERT is handled by the trigger from Phase 4, not by users directly
-- DELETE is not allowed for regular users; admins only if needed
CREATE POLICY "Admins delete profiles"
ON profiles FOR DELETE
USING (is_admin());


-- ============================================================
-- DOCTORS table policies
-- ============================================================

-- Anyone (even logged-out visitors) can read active doctors
CREATE POLICY "Anyone can view doctors"
ON doctors FOR SELECT
USING (true);

-- Only admins can add, edit, or remove doctors
CREATE POLICY "Admins insert doctors"
ON doctors FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins update doctors"
ON doctors FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins delete doctors"
ON doctors FOR DELETE
USING (is_admin());


-- ============================================================
-- APPOINTMENT_SLOTS table policies
-- ============================================================

-- Logged-in users can view slots (so they can browse availability)
CREATE POLICY "Authenticated users view slots"
ON appointment_slots FOR SELECT
TO authenticated
USING (true);

-- Only admins can create or delete slots
CREATE POLICY "Admins insert slots"
ON appointment_slots FOR INSERT
WITH CHECK (is_admin());

-- Admins can update any slot; the booking RPC function also updates is_booked
-- (the RPC runs as SECURITY DEFINER so it bypasses RLS for that one operation)
CREATE POLICY "Admins update slots"
ON appointment_slots FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins delete slots"
ON appointment_slots FOR DELETE
USING (is_admin());


-- ============================================================
-- APPOINTMENTS table policies
-- ============================================================

-- Patients see only their own appointments; admins see all
CREATE POLICY "Patients view own appointments"
ON appointments FOR SELECT
USING (patient_id = auth.uid());

CREATE POLICY "Admins view all appointments"
ON appointments FOR SELECT
USING (is_admin());

-- A patient can only insert an appointment for themselves
CREATE POLICY "Patients insert own appointments"
ON appointments FOR INSERT
WITH CHECK (patient_id = auth.uid());

-- A patient can only update their own appointment, and only to cancel it
CREATE POLICY "Patients cancel own appointments"
ON appointments FOR UPDATE
USING (patient_id = auth.uid())
WITH CHECK (
  patient_id = auth.uid()
  AND status = 'cancelled'
);

-- Admins can update any appointment (e.g., mark as completed)
CREATE POLICY "Admins update any appointment"
ON appointments FOR UPDATE
USING (is_admin());

-- Delete not allowed for patients; admins only
CREATE POLICY "Admins delete appointments"
ON appointments FOR DELETE
USING (is_admin());

