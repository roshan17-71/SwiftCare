-- 1. Remove the rigid blanket unique constraint
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_slot_id_key;

-- 2. Add the smart partial unique index (only for active bookings)
CREATE UNIQUE INDEX idx_unique_active_appointment_slot 
ON appointments (slot_id) 
WHERE status = 'booked';