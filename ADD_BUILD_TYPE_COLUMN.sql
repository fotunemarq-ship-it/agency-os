-- Quick SQL to add build_type column to projects table
-- Copy and paste this into Supabase SQL Editor

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS build_type TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN public.projects.build_type IS 'Website build type: wordpress, custom, or ecommerce. Only applicable for web_dev and web_design service types.';

-- Copy and paste this into Supabase SQL Editor

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS build_type TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN public.projects.build_type IS 'Website build type: wordpress, custom, or ecommerce. Only applicable for web_dev and web_design service types.';















