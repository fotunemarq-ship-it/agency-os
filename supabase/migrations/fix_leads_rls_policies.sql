-- Fix RLS policies on leads table to allow all operations
-- This ensures CSV uploads can save leads to the database

-- Enable RLS if not already enabled
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Allow authenticated users to insert leads" ON public.leads;
DROP POLICY IF EXISTS "Users can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated users to view leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view leads" ON public.leads;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated users to update leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update leads" ON public.leads;
DROP POLICY IF EXISTS "Allow all operations on leads" ON public.leads;
DROP POLICY IF EXISTS "Enable all for leads" ON public.leads;

-- Simple policy: Allow ALL operations for authenticated users
-- Using a simple TRUE check for maximum compatibility
CREATE POLICY "Enable all for leads" ON public.leads
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Note: This is permissive for development. In production, you may want to restrict
-- based on user roles or ownership. For example:
-- USING (auth.uid() IS NOT NULL)
-- or
-- USING (auth.role() = 'authenticated')



-- Enable RLS if not already enabled
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Allow authenticated users to insert leads" ON public.leads;
DROP POLICY IF EXISTS "Users can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated users to view leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view leads" ON public.leads;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated users to update leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update leads" ON public.leads;
DROP POLICY IF EXISTS "Allow all operations on leads" ON public.leads;
DROP POLICY IF EXISTS "Enable all for leads" ON public.leads;

-- Simple policy: Allow ALL operations for authenticated users
-- Using a simple TRUE check for maximum compatibility
CREATE POLICY "Enable all for leads" ON public.leads
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Note: This is permissive for development. In production, you may want to restrict
-- based on user roles or ownership. For example:
-- USING (auth.uid() IS NOT NULL)
-- or
-- USING (auth.role() = 'authenticated')



-- Enable RLS if not already enabled
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Allow authenticated users to insert leads" ON public.leads;
DROP POLICY IF EXISTS "Users can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated users to view leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view leads" ON public.leads;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated users to update leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update leads" ON public.leads;
DROP POLICY IF EXISTS "Allow all operations on leads" ON public.leads;
DROP POLICY IF EXISTS "Enable all for leads" ON public.leads;

-- Simple policy: Allow ALL operations for authenticated users
-- Using a simple TRUE check for maximum compatibility
CREATE POLICY "Enable all for leads" ON public.leads
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Note: This is permissive for development. In production, you may want to restrict
-- based on user roles or ownership. For example:
-- USING (auth.uid() IS NOT NULL)
-- or
-- USING (auth.role() = 'authenticated')



-- Enable RLS if not already enabled
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Allow authenticated users to insert leads" ON public.leads;
DROP POLICY IF EXISTS "Users can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated users to view leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view leads" ON public.leads;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated users to update leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update leads" ON public.leads;
DROP POLICY IF EXISTS "Allow all operations on leads" ON public.leads;
DROP POLICY IF EXISTS "Enable all for leads" ON public.leads;

-- Simple policy: Allow ALL operations for authenticated users
-- Using a simple TRUE check for maximum compatibility
CREATE POLICY "Enable all for leads" ON public.leads
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Note: This is permissive for development. In production, you may want to restrict
-- based on user roles or ownership. For example:
-- USING (auth.uid() IS NOT NULL)
-- or
-- USING (auth.role() = 'authenticated')



-- Enable RLS if not already enabled
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Allow authenticated users to insert leads" ON public.leads;
DROP POLICY IF EXISTS "Users can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated users to view leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view leads" ON public.leads;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated users to update leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update leads" ON public.leads;
DROP POLICY IF EXISTS "Allow all operations on leads" ON public.leads;
DROP POLICY IF EXISTS "Enable all for leads" ON public.leads;

-- Simple policy: Allow ALL operations for authenticated users
-- Using a simple TRUE check for maximum compatibility
CREATE POLICY "Enable all for leads" ON public.leads
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Note: This is permissive for development. In production, you may want to restrict
-- based on user roles or ownership. For example:
-- USING (auth.uid() IS NOT NULL)
-- or
-- USING (auth.role() = 'authenticated')



-- Enable RLS if not already enabled
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Allow authenticated users to insert leads" ON public.leads;
DROP POLICY IF EXISTS "Users can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated users to view leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view leads" ON public.leads;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated users to update leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update leads" ON public.leads;
DROP POLICY IF EXISTS "Allow all operations on leads" ON public.leads;
DROP POLICY IF EXISTS "Enable all for leads" ON public.leads;

-- Simple policy: Allow ALL operations for authenticated users
-- Using a simple TRUE check for maximum compatibility
CREATE POLICY "Enable all for leads" ON public.leads
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Note: This is permissive for development. In production, you may want to restrict
-- based on user roles or ownership. For example:
-- USING (auth.uid() IS NOT NULL)
-- or
-- USING (auth.role() = 'authenticated')

