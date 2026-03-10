-- Create the generations table
CREATE TABLE IF NOT EXISTS public.generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id), -- Nullable if anonymous
    voice_id TEXT NOT NULL,
    text_snippet TEXT NOT NULL,
    char_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for cache_key lookups
CREATE INDEX IF NOT EXISTS idx_generations_cache_key ON public.generations(cache_key);

-- Enable RLS
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can see their own generations
CREATE POLICY "Users can view their own generations." 
ON public.generations FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Backend service can insert (usually uses service_role, but for ANON if permitted)
-- For now, allow ANON to insert if we aren't enforcing auth strictly on generate
CREATE POLICY "Allow anonymous insertions for tracking."
ON public.generations FOR INSERT
WITH CHECK (true);
