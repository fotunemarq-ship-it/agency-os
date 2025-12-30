-- Migration: Add has_website and website_link columns to leads table
-- These columns track whether a lead has a website and store the website URL

-- Add has_website column if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'leads'
        AND column_name = 'has_website'
    ) THEN
        ALTER TABLE public.leads
        ADD COLUMN has_website BOOLEAN DEFAULT false;
        
        COMMENT ON COLUMN public.leads.has_website IS 'Boolean flag indicating if the lead has a website (true/false)';
    ELSE
        RAISE NOTICE 'Column has_website already exists in leads table';
    END IF;
END $$;

-- Add website_link column if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'leads'
        AND column_name = 'website_link'
    ) THEN
        ALTER TABLE public.leads
        ADD COLUMN website_link TEXT;
        
        COMMENT ON COLUMN public.leads.website_link IS 'URL of the lead website (if has_website is true)';
    ELSE
        RAISE NOTICE 'Column website_link already exists in leads table';
    END IF;
END $$;

-- These columns track whether a lead has a website and store the website URL

-- Add has_website column if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'leads'
        AND column_name = 'has_website'
    ) THEN
        ALTER TABLE public.leads
        ADD COLUMN has_website BOOLEAN DEFAULT false;
        
        COMMENT ON COLUMN public.leads.has_website IS 'Boolean flag indicating if the lead has a website (true/false)';
    ELSE
        RAISE NOTICE 'Column has_website already exists in leads table';
    END IF;
END $$;

-- Add website_link column if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'leads'
        AND column_name = 'website_link'
    ) THEN
        ALTER TABLE public.leads
        ADD COLUMN website_link TEXT;
        
        COMMENT ON COLUMN public.leads.website_link IS 'URL of the lead website (if has_website is true)';
    ELSE
        RAISE NOTICE 'Column website_link already exists in leads table';
    END IF;
END $$;




-- These columns track whether a lead has a website and store the website URL

-- Add has_website column if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'leads'
        AND column_name = 'has_website'
    ) THEN
        ALTER TABLE public.leads
        ADD COLUMN has_website BOOLEAN DEFAULT false;
        
        COMMENT ON COLUMN public.leads.has_website IS 'Boolean flag indicating if the lead has a website (true/false)';
    ELSE
        RAISE NOTICE 'Column has_website already exists in leads table';
    END IF;
END $$;

-- Add website_link column if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'leads'
        AND column_name = 'website_link'
    ) THEN
        ALTER TABLE public.leads
        ADD COLUMN website_link TEXT;
        
        COMMENT ON COLUMN public.leads.website_link IS 'URL of the lead website (if has_website is true)';
    ELSE
        RAISE NOTICE 'Column website_link already exists in leads table';
    END IF;
END $$;

-- These columns track whether a lead has a website and store the website URL

-- Add has_website column if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'leads'
        AND column_name = 'has_website'
    ) THEN
        ALTER TABLE public.leads
        ADD COLUMN has_website BOOLEAN DEFAULT false;
        
        COMMENT ON COLUMN public.leads.has_website IS 'Boolean flag indicating if the lead has a website (true/false)';
    ELSE
        RAISE NOTICE 'Column has_website already exists in leads table';
    END IF;
END $$;

-- Add website_link column if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'leads'
        AND column_name = 'website_link'
    ) THEN
        ALTER TABLE public.leads
        ADD COLUMN website_link TEXT;
        
        COMMENT ON COLUMN public.leads.website_link IS 'URL of the lead website (if has_website is true)';
    ELSE
        RAISE NOTICE 'Column website_link already exists in leads table';
    END IF;
END $$;




-- These columns track whether a lead has a website and store the website URL

-- Add has_website column if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'leads'
        AND column_name = 'has_website'
    ) THEN
        ALTER TABLE public.leads
        ADD COLUMN has_website BOOLEAN DEFAULT false;
        
        COMMENT ON COLUMN public.leads.has_website IS 'Boolean flag indicating if the lead has a website (true/false)';
    ELSE
        RAISE NOTICE 'Column has_website already exists in leads table';
    END IF;
END $$;

-- Add website_link column if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'leads'
        AND column_name = 'website_link'
    ) THEN
        ALTER TABLE public.leads
        ADD COLUMN website_link TEXT;
        
        COMMENT ON COLUMN public.leads.website_link IS 'URL of the lead website (if has_website is true)';
    ELSE
        RAISE NOTICE 'Column website_link already exists in leads table';
    END IF;
END $$;

-- These columns track whether a lead has a website and store the website URL

-- Add has_website column if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'leads'
        AND column_name = 'has_website'
    ) THEN
        ALTER TABLE public.leads
        ADD COLUMN has_website BOOLEAN DEFAULT false;
        
        COMMENT ON COLUMN public.leads.has_website IS 'Boolean flag indicating if the lead has a website (true/false)';
    ELSE
        RAISE NOTICE 'Column has_website already exists in leads table';
    END IF;
END $$;

-- Add website_link column if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'leads'
        AND column_name = 'website_link'
    ) THEN
        ALTER TABLE public.leads
        ADD COLUMN website_link TEXT;
        
        COMMENT ON COLUMN public.leads.website_link IS 'URL of the lead website (if has_website is true)';
    ELSE
        RAISE NOTICE 'Column website_link already exists in leads table';
    END IF;
END $$;















