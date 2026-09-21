-- Create 'doctor-photos' storage bucket for doctor profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('doctor-photos', 'doctor-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 1. Anyone (including anonymous visitors and patients) can view doctor photos
CREATE POLICY "Public read on doctor-photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'doctor-photos');

-- 2. Only authenticated admins can upload doctor photos
CREATE POLICY "Admin insert on doctor-photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'doctor-photos'
  AND is_admin()
);

-- 3. Only authenticated admins can update doctor photos
CREATE POLICY "Admin update on doctor-photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'doctor-photos'
  AND is_admin()
);

-- 4. Only authenticated admins can delete doctor photos
CREATE POLICY "Admin delete on doctor-photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'doctor-photos'
  AND is_admin()
);

