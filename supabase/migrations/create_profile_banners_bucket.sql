-- Create storage bucket for profile banners
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-banners', 'profile-banners', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for public read access to profile-banners
CREATE POLICY "Public read access to profile-banners"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-banners');

-- Create policy for authenticated users to upload their own banner
CREATE POLICY "Authenticated users can upload to profile-banners"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-banners' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy for users to update their own banner
CREATE POLICY "Users can update their own profile-banner"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-banners' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'profile-banners' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy for users to delete their own banner
CREATE POLICY "Users can delete their own profile-banner"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-banners' AND auth.uid()::text = (storage.foldername(name))[1]);
