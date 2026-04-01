-- Drop all previous storage policies and recreate with simpler rules
DROP POLICY IF EXISTS "Anyone can view merchant assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload merchant assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own merchant assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own merchant assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view dish images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload dish images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own dish images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own dish images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;

-- Simple policies: public read, authenticated write
CREATE POLICY "Public read for all buckets"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('merchant-assets', 'dish-images', 'avatars'));

CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('merchant-assets', 'dish-images', 'avatars'));

CREATE POLICY "Authenticated users can update own uploads"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id IN ('merchant-assets', 'dish-images', 'avatars') AND owner_id = auth.uid()::text);

CREATE POLICY "Authenticated users can delete own uploads"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id IN ('merchant-assets', 'dish-images', 'avatars') AND owner_id = auth.uid()::text);
