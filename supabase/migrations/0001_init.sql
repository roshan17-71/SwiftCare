-- 1. Create the profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'admin')),
  created_at timestamptz DEFAULT now()
);

-- 2. Create the doctors table
CREATE TABLE doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  photo_url text,
  specialization text NOT NULL,
  qualification text,
  experience_years int,
  department text,
  about text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 3. Create the appointment_slots table
CREATE TABLE appointment_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  slot_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_booked boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CHECK (end_time > start_time)
);

-- Ensure no duplicate slots can be created for the same doctor at the same time on the same day
CREATE UNIQUE INDEX idx_unique_doctor_slot ON appointment_slots (doctor_id, slot_date, start_time);

-- 4. Create the appointments table
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id uuid NOT NULL UNIQUE REFERENCES appointment_slots(id) ON DELETE RESTRICT,
  patient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'booked' CHECK (status IN ('booked', 'cancelled', 'completed')),
  created_at timestamptz DEFAULT now()
);

