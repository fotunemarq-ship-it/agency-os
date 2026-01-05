-- Migration: Add build_type column to projects table
-- This column stores the website build type for web development/design projects
-- Values: 'wordpress', 'custom', 'ecommerce', or NULL for non-web projects

-- Check if build_type column already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'projects' 
        AND column_name = 'build_type'
    ) THEN
        -- Add the build_type column as TEXT (nullable)
        ALTER TABLE public.projects 
        ADD COLUMN build_type TEXT;
        
        -- Add a comment to document the column
        COMMENT ON COLUMN public.projects.build_type IS 'Website build type: wordpress, custom, or ecommerce. Only applicable for web_dev and web_design service types.';
    ELSE
        RAISE NOTICE 'Column build_type already exists in projects table';
    END IF;
END $$;

-- This column stores the website build type for web development/design projects
-- Values: 'wordpress', 'custom', 'ecommerce', or NULL for non-web projects

-- Check if build_type column already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'projects' 
        AND column_name = 'build_type'
    ) THEN
        -- Add the build_type column as TEXT (nullable)
        ALTER TABLE public.projects 
        ADD COLUMN build_type TEXT;
        
        -- Add a comment to document the column
        COMMENT ON COLUMN public.projects.build_type IS 'Website build type: wordpress, custom, or ecommerce. Only applicable for web_dev and web_design service types.';
    ELSE
        RAISE NOTICE 'Column build_type already exists in projects table';
    END IF;
END $$;




-- This column stores the website build type for web development/design projects
-- Values: 'wordpress', 'custom', 'ecommerce', or NULL for non-web projects

-- Check if build_type column already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'projects' 
        AND column_name = 'build_type'
    ) THEN
        -- Add the build_type column as TEXT (nullable)
        ALTER TABLE public.projects 
        ADD COLUMN build_type TEXT;
        
        -- Add a comment to document the column
        COMMENT ON COLUMN public.projects.build_type IS 'Website build type: wordpress, custom, or ecommerce. Only applicable for web_dev and web_design service types.';
    ELSE
        RAISE NOTICE 'Column build_type already exists in projects table';
    END IF;
END $$;

-- This column stores the website build type for web development/design projects
-- Values: 'wordpress', 'custom', 'ecommerce', or NULL for non-web projects

-- Check if build_type column already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'projects' 
        AND column_name = 'build_type'
    ) THEN
        -- Add the build_type column as TEXT (nullable)
        ALTER TABLE public.projects 
        ADD COLUMN build_type TEXT;
        
        -- Add a comment to document the column
        COMMENT ON COLUMN public.projects.build_type IS 'Website build type: wordpress, custom, or ecommerce. Only applicable for web_dev and web_design service types.';
    ELSE
        RAISE NOTICE 'Column build_type already exists in projects table';
    END IF;
END $$;




-- This column stores the website build type for web development/design projects
-- Values: 'wordpress', 'custom', 'ecommerce', or NULL for non-web projects

-- Check if build_type column already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'projects' 
        AND column_name = 'build_type'
    ) THEN
        -- Add the build_type column as TEXT (nullable)
        ALTER TABLE public.projects 
        ADD COLUMN build_type TEXT;
        
        -- Add a comment to document the column
        COMMENT ON COLUMN public.projects.build_type IS 'Website build type: wordpress, custom, or ecommerce. Only applicable for web_dev and web_design service types.';
    ELSE
        RAISE NOTICE 'Column build_type already exists in projects table';
    END IF;
END $$;

-- This column stores the website build type for web development/design projects
-- Values: 'wordpress', 'custom', 'ecommerce', or NULL for non-web projects

-- Check if build_type column already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'projects' 
        AND column_name = 'build_type'
    ) THEN
        -- Add the build_type column as TEXT (nullable)
        ALTER TABLE public.projects 
        ADD COLUMN build_type TEXT;
        
        -- Add a comment to document the column
        COMMENT ON COLUMN public.projects.build_type IS 'Website build type: wordpress, custom, or ecommerce. Only applicable for web_dev and web_design service types.';
    ELSE
        RAISE NOTICE 'Column build_type already exists in projects table';
    END IF;
END $$;
















