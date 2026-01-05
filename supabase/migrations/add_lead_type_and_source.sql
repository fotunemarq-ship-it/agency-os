-- Migration: Add lead_type and source columns to leads table
-- These columns help categorize leads as Outbound (Cold) or Inbound (Marketing)

-- Check if lead_type column already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'lead_type'
    ) THEN
        -- Add the lead_type column as TEXT (nullable)
        ALTER TABLE public.leads 
        ADD COLUMN lead_type TEXT;
        
        -- Add a comment to document the column
        COMMENT ON COLUMN public.leads.lead_type IS 'Lead type: outbound (cold leads) or inbound (marketing leads)';
    ELSE
        RAISE NOTICE 'Column lead_type already exists in leads table';
    END IF;
END $$;

-- Check if source column already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'source'
    ) THEN
        -- Add the source column as TEXT (nullable)
        ALTER TABLE public.leads 
        ADD COLUMN source TEXT;
        
        -- Add a comment to document the column
        COMMENT ON COLUMN public.leads.source IS 'Lead source: Facebook Ads, Google Ads, Website Form, Referral, Other, or manual_upload for outbound leads';
    ELSE
        RAISE NOTICE 'Column source already exists in leads table';
    END IF;
END $$;

-- These columns help categorize leads as Outbound (Cold) or Inbound (Marketing)

-- Check if lead_type column already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'lead_type'
    ) THEN
        -- Add the lead_type column as TEXT (nullable)
        ALTER TABLE public.leads 
        ADD COLUMN lead_type TEXT;
        
        -- Add a comment to document the column
        COMMENT ON COLUMN public.leads.lead_type IS 'Lead type: outbound (cold leads) or inbound (marketing leads)';
    ELSE
        RAISE NOTICE 'Column lead_type already exists in leads table';
    END IF;
END $$;

-- Check if source column already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'source'
    ) THEN
        -- Add the source column as TEXT (nullable)
        ALTER TABLE public.leads 
        ADD COLUMN source TEXT;
        
        -- Add a comment to document the column
        COMMENT ON COLUMN public.leads.source IS 'Lead source: Facebook Ads, Google Ads, Website Form, Referral, Other, or manual_upload for outbound leads';
    ELSE
        RAISE NOTICE 'Column source already exists in leads table';
    END IF;
END $$;




-- These columns help categorize leads as Outbound (Cold) or Inbound (Marketing)

-- Check if lead_type column already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'lead_type'
    ) THEN
        -- Add the lead_type column as TEXT (nullable)
        ALTER TABLE public.leads 
        ADD COLUMN lead_type TEXT;
        
        -- Add a comment to document the column
        COMMENT ON COLUMN public.leads.lead_type IS 'Lead type: outbound (cold leads) or inbound (marketing leads)';
    ELSE
        RAISE NOTICE 'Column lead_type already exists in leads table';
    END IF;
END $$;

-- Check if source column already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'source'
    ) THEN
        -- Add the source column as TEXT (nullable)
        ALTER TABLE public.leads 
        ADD COLUMN source TEXT;
        
        -- Add a comment to document the column
        COMMENT ON COLUMN public.leads.source IS 'Lead source: Facebook Ads, Google Ads, Website Form, Referral, Other, or manual_upload for outbound leads';
    ELSE
        RAISE NOTICE 'Column source already exists in leads table';
    END IF;
END $$;

-- These columns help categorize leads as Outbound (Cold) or Inbound (Marketing)

-- Check if lead_type column already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'lead_type'
    ) THEN
        -- Add the lead_type column as TEXT (nullable)
        ALTER TABLE public.leads 
        ADD COLUMN lead_type TEXT;
        
        -- Add a comment to document the column
        COMMENT ON COLUMN public.leads.lead_type IS 'Lead type: outbound (cold leads) or inbound (marketing leads)';
    ELSE
        RAISE NOTICE 'Column lead_type already exists in leads table';
    END IF;
END $$;

-- Check if source column already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'source'
    ) THEN
        -- Add the source column as TEXT (nullable)
        ALTER TABLE public.leads 
        ADD COLUMN source TEXT;
        
        -- Add a comment to document the column
        COMMENT ON COLUMN public.leads.source IS 'Lead source: Facebook Ads, Google Ads, Website Form, Referral, Other, or manual_upload for outbound leads';
    ELSE
        RAISE NOTICE 'Column source already exists in leads table';
    END IF;
END $$;




-- These columns help categorize leads as Outbound (Cold) or Inbound (Marketing)

-- Check if lead_type column already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'lead_type'
    ) THEN
        -- Add the lead_type column as TEXT (nullable)
        ALTER TABLE public.leads 
        ADD COLUMN lead_type TEXT;
        
        -- Add a comment to document the column
        COMMENT ON COLUMN public.leads.lead_type IS 'Lead type: outbound (cold leads) or inbound (marketing leads)';
    ELSE
        RAISE NOTICE 'Column lead_type already exists in leads table';
    END IF;
END $$;

-- Check if source column already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'source'
    ) THEN
        -- Add the source column as TEXT (nullable)
        ALTER TABLE public.leads 
        ADD COLUMN source TEXT;
        
        -- Add a comment to document the column
        COMMENT ON COLUMN public.leads.source IS 'Lead source: Facebook Ads, Google Ads, Website Form, Referral, Other, or manual_upload for outbound leads';
    ELSE
        RAISE NOTICE 'Column source already exists in leads table';
    END IF;
END $$;

-- These columns help categorize leads as Outbound (Cold) or Inbound (Marketing)

-- Check if lead_type column already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'lead_type'
    ) THEN
        -- Add the lead_type column as TEXT (nullable)
        ALTER TABLE public.leads 
        ADD COLUMN lead_type TEXT;
        
        -- Add a comment to document the column
        COMMENT ON COLUMN public.leads.lead_type IS 'Lead type: outbound (cold leads) or inbound (marketing leads)';
    ELSE
        RAISE NOTICE 'Column lead_type already exists in leads table';
    END IF;
END $$;

-- Check if source column already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'source'
    ) THEN
        -- Add the source column as TEXT (nullable)
        ALTER TABLE public.leads 
        ADD COLUMN source TEXT;
        
        -- Add a comment to document the column
        COMMENT ON COLUMN public.leads.source IS 'Lead source: Facebook Ads, Google Ads, Website Form, Referral, Other, or manual_upload for outbound leads';
    ELSE
        RAISE NOTICE 'Column source already exists in leads table';
    END IF;
END $$;
















