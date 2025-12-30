-- Fix has_website column - Convert from generated column to regular column
-- This migration removes the generated column expression and makes it a regular nullable column

DO $$
BEGIN
    -- Check if has_website column exists and is a generated column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'has_website'
        AND is_generated = 'ALWAYS'
    ) THEN
        -- Drop the generated column expression to convert it to a regular column
        ALTER TABLE public.leads 
        ALTER COLUMN has_website DROP EXPRESSION;
        
        -- Make it nullable
        ALTER TABLE public.leads 
        ALTER COLUMN has_website DROP NOT NULL,
        ALTER COLUMN has_website DROP DEFAULT,
        ALTER COLUMN has_website SET DEFAULT NULL;
        
        RAISE NOTICE 'has_website column converted from generated column to regular nullable column';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'has_website'
    ) THEN
        -- Column exists but is not generated, just ensure it's nullable
        ALTER TABLE public.leads 
        ALTER COLUMN has_website DROP NOT NULL,
        ALTER COLUMN has_website DROP DEFAULT,
        ALTER COLUMN has_website SET DEFAULT NULL;
        
        RAISE NOTICE 'has_website column updated to allow NULL values';
    ELSE
        -- Create the column if it doesn't exist
        ALTER TABLE public.leads
        ADD COLUMN has_website BOOLEAN DEFAULT NULL;
        
        COMMENT ON COLUMN public.leads.has_website IS 'Boolean flag indicating if the lead has a website (true/false)';
        
        RAISE NOTICE 'has_website column created';
    END IF;
END $$;

-- This migration removes the generated column expression and makes it a regular nullable column

DO $$
BEGIN
    -- Check if has_website column exists and is a generated column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'has_website'
        AND is_generated = 'ALWAYS'
    ) THEN
        -- Drop the generated column expression to convert it to a regular column
        ALTER TABLE public.leads 
        ALTER COLUMN has_website DROP EXPRESSION;
        
        -- Make it nullable
        ALTER TABLE public.leads 
        ALTER COLUMN has_website DROP NOT NULL,
        ALTER COLUMN has_website DROP DEFAULT,
        ALTER COLUMN has_website SET DEFAULT NULL;
        
        RAISE NOTICE 'has_website column converted from generated column to regular nullable column';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'has_website'
    ) THEN
        -- Column exists but is not generated, just ensure it's nullable
        ALTER TABLE public.leads 
        ALTER COLUMN has_website DROP NOT NULL,
        ALTER COLUMN has_website DROP DEFAULT,
        ALTER COLUMN has_website SET DEFAULT NULL;
        
        RAISE NOTICE 'has_website column updated to allow NULL values';
    ELSE
        -- Create the column if it doesn't exist
        ALTER TABLE public.leads
        ADD COLUMN has_website BOOLEAN DEFAULT NULL;
        
        COMMENT ON COLUMN public.leads.has_website IS 'Boolean flag indicating if the lead has a website (true/false)';
        
        RAISE NOTICE 'has_website column created';
    END IF;
END $$;




-- This migration removes the generated column expression and makes it a regular nullable column

DO $$
BEGIN
    -- Check if has_website column exists and is a generated column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'has_website'
        AND is_generated = 'ALWAYS'
    ) THEN
        -- Drop the generated column expression to convert it to a regular column
        ALTER TABLE public.leads 
        ALTER COLUMN has_website DROP EXPRESSION;
        
        -- Make it nullable
        ALTER TABLE public.leads 
        ALTER COLUMN has_website DROP NOT NULL,
        ALTER COLUMN has_website DROP DEFAULT,
        ALTER COLUMN has_website SET DEFAULT NULL;
        
        RAISE NOTICE 'has_website column converted from generated column to regular nullable column';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'has_website'
    ) THEN
        -- Column exists but is not generated, just ensure it's nullable
        ALTER TABLE public.leads 
        ALTER COLUMN has_website DROP NOT NULL,
        ALTER COLUMN has_website DROP DEFAULT,
        ALTER COLUMN has_website SET DEFAULT NULL;
        
        RAISE NOTICE 'has_website column updated to allow NULL values';
    ELSE
        -- Create the column if it doesn't exist
        ALTER TABLE public.leads
        ADD COLUMN has_website BOOLEAN DEFAULT NULL;
        
        COMMENT ON COLUMN public.leads.has_website IS 'Boolean flag indicating if the lead has a website (true/false)';
        
        RAISE NOTICE 'has_website column created';
    END IF;
END $$;

-- This migration removes the generated column expression and makes it a regular nullable column

DO $$
BEGIN
    -- Check if has_website column exists and is a generated column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'has_website'
        AND is_generated = 'ALWAYS'
    ) THEN
        -- Drop the generated column expression to convert it to a regular column
        ALTER TABLE public.leads 
        ALTER COLUMN has_website DROP EXPRESSION;
        
        -- Make it nullable
        ALTER TABLE public.leads 
        ALTER COLUMN has_website DROP NOT NULL,
        ALTER COLUMN has_website DROP DEFAULT,
        ALTER COLUMN has_website SET DEFAULT NULL;
        
        RAISE NOTICE 'has_website column converted from generated column to regular nullable column';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'has_website'
    ) THEN
        -- Column exists but is not generated, just ensure it's nullable
        ALTER TABLE public.leads 
        ALTER COLUMN has_website DROP NOT NULL,
        ALTER COLUMN has_website DROP DEFAULT,
        ALTER COLUMN has_website SET DEFAULT NULL;
        
        RAISE NOTICE 'has_website column updated to allow NULL values';
    ELSE
        -- Create the column if it doesn't exist
        ALTER TABLE public.leads
        ADD COLUMN has_website BOOLEAN DEFAULT NULL;
        
        COMMENT ON COLUMN public.leads.has_website IS 'Boolean flag indicating if the lead has a website (true/false)';
        
        RAISE NOTICE 'has_website column created';
    END IF;
END $$;




-- This migration removes the generated column expression and makes it a regular nullable column

DO $$
BEGIN
    -- Check if has_website column exists and is a generated column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'has_website'
        AND is_generated = 'ALWAYS'
    ) THEN
        -- Drop the generated column expression to convert it to a regular column
        ALTER TABLE public.leads 
        ALTER COLUMN has_website DROP EXPRESSION;
        
        -- Make it nullable
        ALTER TABLE public.leads 
        ALTER COLUMN has_website DROP NOT NULL,
        ALTER COLUMN has_website DROP DEFAULT,
        ALTER COLUMN has_website SET DEFAULT NULL;
        
        RAISE NOTICE 'has_website column converted from generated column to regular nullable column';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'has_website'
    ) THEN
        -- Column exists but is not generated, just ensure it's nullable
        ALTER TABLE public.leads 
        ALTER COLUMN has_website DROP NOT NULL,
        ALTER COLUMN has_website DROP DEFAULT,
        ALTER COLUMN has_website SET DEFAULT NULL;
        
        RAISE NOTICE 'has_website column updated to allow NULL values';
    ELSE
        -- Create the column if it doesn't exist
        ALTER TABLE public.leads
        ADD COLUMN has_website BOOLEAN DEFAULT NULL;
        
        COMMENT ON COLUMN public.leads.has_website IS 'Boolean flag indicating if the lead has a website (true/false)';
        
        RAISE NOTICE 'has_website column created';
    END IF;
END $$;

-- This migration removes the generated column expression and makes it a regular nullable column

DO $$
BEGIN
    -- Check if has_website column exists and is a generated column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'has_website'
        AND is_generated = 'ALWAYS'
    ) THEN
        -- Drop the generated column expression to convert it to a regular column
        ALTER TABLE public.leads 
        ALTER COLUMN has_website DROP EXPRESSION;
        
        -- Make it nullable
        ALTER TABLE public.leads 
        ALTER COLUMN has_website DROP NOT NULL,
        ALTER COLUMN has_website DROP DEFAULT,
        ALTER COLUMN has_website SET DEFAULT NULL;
        
        RAISE NOTICE 'has_website column converted from generated column to regular nullable column';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'has_website'
    ) THEN
        -- Column exists but is not generated, just ensure it's nullable
        ALTER TABLE public.leads 
        ALTER COLUMN has_website DROP NOT NULL,
        ALTER COLUMN has_website DROP DEFAULT,
        ALTER COLUMN has_website SET DEFAULT NULL;
        
        RAISE NOTICE 'has_website column updated to allow NULL values';
    ELSE
        -- Create the column if it doesn't exist
        ALTER TABLE public.leads
        ADD COLUMN has_website BOOLEAN DEFAULT NULL;
        
        COMMENT ON COLUMN public.leads.has_website IS 'Boolean flag indicating if the lead has a website (true/false)';
        
        RAISE NOTICE 'has_website column created';
    END IF;
END $$;















