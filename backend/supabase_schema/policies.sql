-- ---------------------------------------------------------------------------
-- 1. Create Tables
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.generations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    cache_key TEXT UNIQUE NOT NULL,
    text_snippet TEXT,
    voice_id TEXT NOT NULL,
    char_count INTEGER NOT NULL,
    user_id UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.voices (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    gender TEXT NOT NULL,
    accent_region TEXT NOT NULL,
    description TEXT,
    recommended_speed NUMERIC DEFAULT 1.0
);

-- Voices are seeded via seed_voices.sql

-- ---------------------------------------------------------------------------
-- 3. Create Storage Bucket
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) 
VALUES ('mzansi-audio', 'mzansi-audio', true)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 4. Enable RLS on the generations table
-- ---------------------------------------------------------------------------
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Storage Bucket Policies: mzansi-audio
-- ---------------------------------------------------------------------------

-- Policy: Allow users/backend to insert audio files
CREATE POLICY "Public can upload audio"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
    bucket_id = 'mzansi-audio'
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
