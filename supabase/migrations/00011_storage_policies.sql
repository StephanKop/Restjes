-- Storage RLS policies for all buckets

-- MERCHANT-ASSETS bucket
CREATE POLICY "Anyone can view merchant assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'merchant-assets');

CREATE POLICY "Authenticated users can upload merchant assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'merchant-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own merchant assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'merchant-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own merchant assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'merchant-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- DISH-IMAGES bucket
CREATE POLICY "Anyone can view dish images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'dish-images');

CREATE POLICY "Authenticated users can upload dish images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'dish-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own dish images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'dish-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own dish images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'dish-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- AVATARS bucket
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatars"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatars"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
