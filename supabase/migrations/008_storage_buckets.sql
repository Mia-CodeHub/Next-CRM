-- 008: Create storage buckets for images
-- Run these in Supabase SQL Editor

-- Create buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;

-- Allow authenticated users to upload to products bucket
CREATE POLICY "products_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'products');

CREATE POLICY "products_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'products');

CREATE POLICY "products_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'products');

-- Allow public read for products
CREATE POLICY "products_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'products');

-- Allow authenticated users to upload to avatars bucket
CREATE POLICY "avatars_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "avatars_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars');

-- Allow public read for avatars
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');
