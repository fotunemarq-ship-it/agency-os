-- Fix has_website column to allow explicit inserts
-- This migration fixes the has_website column to allow non-DEFAULT values and NULL

DO $$
BEGIN
    -- Check if has_website column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'has_website'
    ) THEN
        -- Remove any NOT NULL constraint and set default to NULL
        ALTER TABLE public.leads 
        ALTER COLUMN has_website DROP NOT NULL,
        ALTER COLUMN has_website DROP DEFAULT,
        ALTER COLUMN has_website SET DEFAULT NULL;
        
        RAISE NOTICE 'has_website column updated to allow NULL and explicit values';
    ELSE
        -- Create the column if it doesn't exist
        ALTER TABLE public.leads
        ADD COLUMN has_website BOOLEAN DEFAULT NULL;
        
        COMMENT ON COLUMN public.leads.has_website IS 'Boolean flag indicating if the lead has a website (true/false)';
        
        RAISE NOTICE 'has_website column created';
    END IF;
END $$;


DO $$
BEGIN
    -- Check if has_website column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'has_website'
    ) THEN
        -- Remove any NOT NULL constraint and set default to NULL
        ALTER TABLE public.leads 
        ALTER COLUMN has_website DROP NOT NULL,
        ALTER COLUMN has_website DROP DEFAULT,
        ALTER COLUMN has_website SET DEFAULT NULL;
        
        RAISE NOTICE 'has_website column updated to allow NULL and explicit values';
    ELSE
        -- Create the column if it doesn't exist
        ALTER TABLE public.leads
        ADD COLUMN has_website BOOLEAN DEFAULT NULL;
        
        COMMENT ON COLUMN public.leads.has_website IS 'Boolean flag indicating if the lead has a website (true/false)';
        
        RAISE NOTICE 'has_website column created';
    END IF;
END $$;


DO $$
BEGIN
    -- Check if has_website column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'has_website'
    ) THEN
        -- Remove any NOT NULL constraint and set default to NULL
        ALTER TABLE public.leads 
        ALTER COLUMN has_website DROP NOT NULL,
        ALTER COLUMN has_website DROP DEFAULT,
        ALTER COLUMN has_website SET DEFAULT NULL;
        
        RAISE NOTICE 'has_website column updated to allow NULL and explicit values';
    ELSE
        -- Create the column if it doesn't exist
        ALTER TABLE public.leads
        ADD COLUMN has_website BOOLEAN DEFAULT NULL;
        
        COMMENT ON COLUMN public.leads.has_website IS 'Boolean flag indicating if the lead has a website (true/false)';
        
        RAISE NOTICE 'has_website column created';
    END IF;
END $$;


DO $$
BEGIN
    -- Check if has_website column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'has_website'
    ) THEN
        -- Remove any NOT NULL constraint and set default to NULL
        ALTER TABLE public.leads 
        ALTER COLUMN has_website DROP NOT NULL,
        ALTER COLUMN has_website DROP DEFAULT,
        ALTER COLUMN has_website SET DEFAULT NULL;
        
        RAISE NOTICE 'has_website column updated to allow NULL and explicit values';
    ELSE
        -- Create the column if it doesn't exist
        ALTER TABLE public.leads
        ADD COLUMN has_website BOOLEAN DEFAULT NULL;
        
        COMMENT ON COLUMN public.leads.has_website IS 'Boolean flag indicating if the lead has a website (true/false)';
        
        RAISE NOTICE 'has_website column created';
    END IF;
END $$;


DO $$
BEGIN
    -- Check if has_website column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'has_website'
    ) THEN
        -- Remove any NOT NULL constraint and set default to NULL
        ALTER TABLE public.leads 
        ALTER COLUMN has_website DROP NOT NULL,
        ALTER COLUMN has_website DROP DEFAULT,
        ALTER COLUMN has_website SET DEFAULT NULL;
        
        RAISE NOTICE 'has_website column updated to allow NULL and explicit values';
    ELSE
        -- Create the column if it doesn't exist
        ALTER TABLE public.leads
        ADD COLUMN has_website BOOLEAN DEFAULT NULL;
        
        COMMENT ON COLUMN public.leads.has_website IS 'Boolean flag indicating if the lead has a website (true/false)';
        
        RAISE NOTICE 'has_website column created';
    END IF;
END $$;


DO $$
BEGIN
    -- Check if has_website column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'has_website'
    ) THEN
        -- Remove any NOT NULL constraint and set default to NULL
        ALTER TABLE public.leads 
        ALTER COLUMN has_website DROP NOT NULL,
        ALTER COLUMN has_website DROP DEFAULT,
        ALTER COLUMN has_website SET DEFAULT NULL;
        
        RAISE NOTICE 'has_website column updated to allow NULL and explicit values';
    ELSE
        -- Create the column if it doesn't exist
        ALTER TABLE public.leads
        ADD COLUMN has_website BOOLEAN DEFAULT NULL;
        
        COMMENT ON COLUMN public.leads.has_website IS 'Boolean flag indicating if the lead has a website (true/false)';
        
        RAISE NOTICE 'has_website column created';
    END IF;
END $$;
