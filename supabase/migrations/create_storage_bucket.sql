-- Create policy for public read access to profile-images
CREATE POLICY "Public read access to profile-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-images');

-- Create policy for authenticated users to upload their own avatar
CREATE POLICY "Authenticated users can upload to profile-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy for users to update their own avatar
CREATE POLICY "Users can update their own profile-image"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy for users to delete their own avatar
CREATE POLICY "Users can delete their own profile-image"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);
