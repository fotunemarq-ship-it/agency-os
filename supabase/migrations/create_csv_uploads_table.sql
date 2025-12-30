-- Migration: Create csv_uploads table to track CSV file uploads
-- This table stores metadata about each CSV upload for viewing history

CREATE TABLE IF NOT EXISTS public.csv_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id),
    leads_count INTEGER NOT NULL DEFAULT 0,
    industry TEXT,
    city TEXT,
    lead_type TEXT,
    source TEXT,
    has_market_data BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    import_batch_id TEXT
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_csv_uploads_created_at ON public.csv_uploads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_csv_uploads_uploaded_by ON public.csv_uploads(uploaded_by);

-- Add comment
COMMENT ON TABLE public.csv_uploads IS 'Tracks CSV file uploads with metadata for viewing upload history';

-- Enable RLS
ALTER TABLE public.csv_uploads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own uploads" ON public.csv_uploads;
DROP POLICY IF EXISTS "Users can insert their own uploads" ON public.csv_uploads;

-- Create policy to allow users to view their own uploads and admins to view all
CREATE POLICY "Users can view their own uploads" ON public.csv_uploads
    FOR SELECT
    USING (auth.uid() = uploaded_by OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ));

-- Allow authenticated users to insert their own uploads
CREATE POLICY "Users can insert their own uploads" ON public.csv_uploads
    FOR INSERT
    WITH CHECK (auth.uid() = uploaded_by);



CREATE TABLE IF NOT EXISTS public.csv_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id),
    leads_count INTEGER NOT NULL DEFAULT 0,
    industry TEXT,
    city TEXT,
    lead_type TEXT,
    source TEXT,
    has_market_data BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    import_batch_id TEXT
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_csv_uploads_created_at ON public.csv_uploads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_csv_uploads_uploaded_by ON public.csv_uploads(uploaded_by);

-- Add comment
COMMENT ON TABLE public.csv_uploads IS 'Tracks CSV file uploads with metadata for viewing upload history';

-- Enable RLS
ALTER TABLE public.csv_uploads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own uploads" ON public.csv_uploads;
DROP POLICY IF EXISTS "Users can insert their own uploads" ON public.csv_uploads;

-- Create policy to allow users to view their own uploads and admins to view all
CREATE POLICY "Users can view their own uploads" ON public.csv_uploads
    FOR SELECT
    USING (auth.uid() = uploaded_by OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ));

-- Allow authenticated users to insert their own uploads
CREATE POLICY "Users can insert their own uploads" ON public.csv_uploads
    FOR INSERT
    WITH CHECK (auth.uid() = uploaded_by);



CREATE TABLE IF NOT EXISTS public.csv_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id),
    leads_count INTEGER NOT NULL DEFAULT 0,
    industry TEXT,
    city TEXT,
    lead_type TEXT,
    source TEXT,
    has_market_data BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    import_batch_id TEXT
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_csv_uploads_created_at ON public.csv_uploads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_csv_uploads_uploaded_by ON public.csv_uploads(uploaded_by);

-- Add comment
COMMENT ON TABLE public.csv_uploads IS 'Tracks CSV file uploads with metadata for viewing upload history';

-- Enable RLS
ALTER TABLE public.csv_uploads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own uploads" ON public.csv_uploads;
DROP POLICY IF EXISTS "Users can insert their own uploads" ON public.csv_uploads;

-- Create policy to allow users to view their own uploads and admins to view all
CREATE POLICY "Users can view their own uploads" ON public.csv_uploads
    FOR SELECT
    USING (auth.uid() = uploaded_by OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ));

-- Allow authenticated users to insert their own uploads
CREATE POLICY "Users can insert their own uploads" ON public.csv_uploads
    FOR INSERT
    WITH CHECK (auth.uid() = uploaded_by);



CREATE TABLE IF NOT EXISTS public.csv_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id),
    leads_count INTEGER NOT NULL DEFAULT 0,
    industry TEXT,
    city TEXT,
    lead_type TEXT,
    source TEXT,
    has_market_data BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    import_batch_id TEXT
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_csv_uploads_created_at ON public.csv_uploads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_csv_uploads_uploaded_by ON public.csv_uploads(uploaded_by);

-- Add comment
COMMENT ON TABLE public.csv_uploads IS 'Tracks CSV file uploads with metadata for viewing upload history';

-- Enable RLS
ALTER TABLE public.csv_uploads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own uploads" ON public.csv_uploads;
DROP POLICY IF EXISTS "Users can insert their own uploads" ON public.csv_uploads;

-- Create policy to allow users to view their own uploads and admins to view all
CREATE POLICY "Users can view their own uploads" ON public.csv_uploads
    FOR SELECT
    USING (auth.uid() = uploaded_by OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ));

-- Allow authenticated users to insert their own uploads
CREATE POLICY "Users can insert their own uploads" ON public.csv_uploads
    FOR INSERT
    WITH CHECK (auth.uid() = uploaded_by);



CREATE TABLE IF NOT EXISTS public.csv_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id),
    leads_count INTEGER NOT NULL DEFAULT 0,
    industry TEXT,
    city TEXT,
    lead_type TEXT,
    source TEXT,
    has_market_data BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    import_batch_id TEXT
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_csv_uploads_created_at ON public.csv_uploads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_csv_uploads_uploaded_by ON public.csv_uploads(uploaded_by);

-- Add comment
COMMENT ON TABLE public.csv_uploads IS 'Tracks CSV file uploads with metadata for viewing upload history';

-- Enable RLS
ALTER TABLE public.csv_uploads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own uploads" ON public.csv_uploads;
DROP POLICY IF EXISTS "Users can insert their own uploads" ON public.csv_uploads;

-- Create policy to allow users to view their own uploads and admins to view all
CREATE POLICY "Users can view their own uploads" ON public.csv_uploads
    FOR SELECT
    USING (auth.uid() = uploaded_by OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ));

-- Allow authenticated users to insert their own uploads
CREATE POLICY "Users can insert their own uploads" ON public.csv_uploads
    FOR INSERT
    WITH CHECK (auth.uid() = uploaded_by);



CREATE TABLE IF NOT EXISTS public.csv_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id),
    leads_count INTEGER NOT NULL DEFAULT 0,
    industry TEXT,
    city TEXT,
    lead_type TEXT,
    source TEXT,
    has_market_data BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    import_batch_id TEXT
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_csv_uploads_created_at ON public.csv_uploads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_csv_uploads_uploaded_by ON public.csv_uploads(uploaded_by);

-- Add comment
COMMENT ON TABLE public.csv_uploads IS 'Tracks CSV file uploads with metadata for viewing upload history';

-- Enable RLS
ALTER TABLE public.csv_uploads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own uploads" ON public.csv_uploads;
DROP POLICY IF EXISTS "Users can insert their own uploads" ON public.csv_uploads;

-- Create policy to allow users to view their own uploads and admins to view all
CREATE POLICY "Users can view their own uploads" ON public.csv_uploads
    FOR SELECT
    USING (auth.uid() = uploaded_by OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ));

-- Allow authenticated users to insert their own uploads
CREATE POLICY "Users can insert their own uploads" ON public.csv_uploads
    FOR INSERT
    WITH CHECK (auth.uid() = uploaded_by);

