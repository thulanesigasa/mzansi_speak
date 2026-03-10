-- Enable RLS on the storage bucket and generations table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Storage Bucket Policies: mzansi-audio
-- ---------------------------------------------------------------------------

-- Policy: Allow users to insert their own audio files
CREATE POLICY "Users can upload their own audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'mzansi-audio' AND 
    auth.uid() = owner
);

-- Policy: Allow users to select/read only their own audio files
CREATE POLICY "Users can read their own audio"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'mzansi-audio' AND 
    auth.uid() = owner
);

-- Policy: Allow public read access to audio files (if intended, else remove)
-- Note: Assuming audio files could be publicly readable for playback without auth
CREATE POLICY "Public read access for audio files"
ON storage.objects FOR SELECT
TO public
USING (
    bucket_id = 'mzansi-audio'
);

-- ---------------------------------------------------------------------------
-- Generations Table Policies
-- ---------------------------------------------------------------------------

-- Policy: Allow users to insert their own generation metadata
CREATE POLICY "Users can insert their own generations"
ON public.generations FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id
);

-- Policy: Allow users to see only their own generation history
CREATE POLICY "Users can read their own generations"
ON public.generations FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id
);

-- Allow public inserts for unauthenticated users if your app functions without login
CREATE POLICY "Public can insert generations"
ON public.generations FOR INSERT
TO public
WITH CHECK (true);

-- Allow public selects for unauthenticated users
CREATE POLICY "Public can read all generations"
ON public.generations FOR SELECT
TO public
USING (true);
