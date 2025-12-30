-- Complete Leads Schema Update
-- This migration adds all missing columns needed for the CSV uploader and lead management

-- 1. Add lead_type column if it does not exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'lead_type'
    ) THEN
        ALTER TABLE public.leads 
        ADD COLUMN lead_type TEXT;
        
        COMMENT ON COLUMN public.leads.lead_type IS 'Lead type: outbound (cold leads) or inbound (marketing leads)';
        
        RAISE NOTICE 'Column lead_type added to leads table';
    ELSE
        RAISE NOTICE 'Column lead_type already exists in leads table';
    END IF;
END $$;

-- 2. Add source column if it does not exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'source'
    ) THEN
        ALTER TABLE public.leads 
        ADD COLUMN source TEXT;
        
        COMMENT ON COLUMN public.leads.source IS 'Lead source: Facebook Ads, Google Ads, Website Form, Referral, Other, or manual_upload for outbound leads';
        
        RAISE NOTICE 'Column source added to leads table';
    ELSE
        RAISE NOTICE 'Column source already exists in leads table';
    END IF;
END $$;

-- 3. Add has_website column if it does not exist
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
        
        RAISE NOTICE 'Column has_website added to leads table';
    ELSE
        RAISE NOTICE 'Column has_website already exists in leads table';
    END IF;
END $$;

-- 4. Add website_link column if it does not exist
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
        
        RAISE NOTICE 'Column website_link added to leads table';
    ELSE
        RAISE NOTICE 'Column website_link already exists in leads table';
    END IF;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Leads table schema update completed successfully!';
END $$;

-- This migration adds all missing columns needed for the CSV uploader and lead management

-- 1. Add lead_type column if it does not exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'lead_type'
    ) THEN
        ALTER TABLE public.leads 
        ADD COLUMN lead_type TEXT;
        
        COMMENT ON COLUMN public.leads.lead_type IS 'Lead type: outbound (cold leads) or inbound (marketing leads)';
        
        RAISE NOTICE 'Column lead_type added to leads table';
    ELSE
        RAISE NOTICE 'Column lead_type already exists in leads table';
    END IF;
END $$;

-- 2. Add source column if it does not exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'source'
    ) THEN
        ALTER TABLE public.leads 
        ADD COLUMN source TEXT;
        
        COMMENT ON COLUMN public.leads.source IS 'Lead source: Facebook Ads, Google Ads, Website Form, Referral, Other, or manual_upload for outbound leads';
        
        RAISE NOTICE 'Column source added to leads table';
    ELSE
        RAISE NOTICE 'Column source already exists in leads table';
    END IF;
END $$;

-- 3. Add has_website column if it does not exist
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
        
        RAISE NOTICE 'Column has_website added to leads table';
    ELSE
        RAISE NOTICE 'Column has_website already exists in leads table';
    END IF;
END $$;

-- 4. Add website_link column if it does not exist
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
        
        RAISE NOTICE 'Column website_link added to leads table';
    ELSE
        RAISE NOTICE 'Column website_link already exists in leads table';
    END IF;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Leads table schema update completed successfully!';
END $$;




-- This migration adds all missing columns needed for the CSV uploader and lead management

-- 1. Add lead_type column if it does not exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'lead_type'
    ) THEN
        ALTER TABLE public.leads 
        ADD COLUMN lead_type TEXT;
        
        COMMENT ON COLUMN public.leads.lead_type IS 'Lead type: outbound (cold leads) or inbound (marketing leads)';
        
        RAISE NOTICE 'Column lead_type added to leads table';
    ELSE
        RAISE NOTICE 'Column lead_type already exists in leads table';
    END IF;
END $$;

-- 2. Add source column if it does not exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'source'
    ) THEN
        ALTER TABLE public.leads 
        ADD COLUMN source TEXT;
        
        COMMENT ON COLUMN public.leads.source IS 'Lead source: Facebook Ads, Google Ads, Website Form, Referral, Other, or manual_upload for outbound leads';
        
        RAISE NOTICE 'Column source added to leads table';
    ELSE
        RAISE NOTICE 'Column source already exists in leads table';
    END IF;
END $$;

-- 3. Add has_website column if it does not exist
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
        
        RAISE NOTICE 'Column has_website added to leads table';
    ELSE
        RAISE NOTICE 'Column has_website already exists in leads table';
    END IF;
END $$;

-- 4. Add website_link column if it does not exist
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
        
        RAISE NOTICE 'Column website_link added to leads table';
    ELSE
        RAISE NOTICE 'Column website_link already exists in leads table';
    END IF;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Leads table schema update completed successfully!';
END $$;

-- This migration adds all missing columns needed for the CSV uploader and lead management

-- 1. Add lead_type column if it does not exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'lead_type'
    ) THEN
        ALTER TABLE public.leads 
        ADD COLUMN lead_type TEXT;
        
        COMMENT ON COLUMN public.leads.lead_type IS 'Lead type: outbound (cold leads) or inbound (marketing leads)';
        
        RAISE NOTICE 'Column lead_type added to leads table';
    ELSE
        RAISE NOTICE 'Column lead_type already exists in leads table';
    END IF;
END $$;

-- 2. Add source column if it does not exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'source'
    ) THEN
        ALTER TABLE public.leads 
        ADD COLUMN source TEXT;
        
        COMMENT ON COLUMN public.leads.source IS 'Lead source: Facebook Ads, Google Ads, Website Form, Referral, Other, or manual_upload for outbound leads';
        
        RAISE NOTICE 'Column source added to leads table';
    ELSE
        RAISE NOTICE 'Column source already exists in leads table';
    END IF;
END $$;

-- 3. Add has_website column if it does not exist
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
        
        RAISE NOTICE 'Column has_website added to leads table';
    ELSE
        RAISE NOTICE 'Column has_website already exists in leads table';
    END IF;
END $$;

-- 4. Add website_link column if it does not exist
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
        
        RAISE NOTICE 'Column website_link added to leads table';
    ELSE
        RAISE NOTICE 'Column website_link already exists in leads table';
    END IF;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Leads table schema update completed successfully!';
END $$;




-- This migration adds all missing columns needed for the CSV uploader and lead management

-- 1. Add lead_type column if it does not exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'lead_type'
    ) THEN
        ALTER TABLE public.leads 
        ADD COLUMN lead_type TEXT;
        
        COMMENT ON COLUMN public.leads.lead_type IS 'Lead type: outbound (cold leads) or inbound (marketing leads)';
        
        RAISE NOTICE 'Column lead_type added to leads table';
    ELSE
        RAISE NOTICE 'Column lead_type already exists in leads table';
    END IF;
END $$;

-- 2. Add source column if it does not exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'source'
    ) THEN
        ALTER TABLE public.leads 
        ADD COLUMN source TEXT;
        
        COMMENT ON COLUMN public.leads.source IS 'Lead source: Facebook Ads, Google Ads, Website Form, Referral, Other, or manual_upload for outbound leads';
        
        RAISE NOTICE 'Column source added to leads table';
    ELSE
        RAISE NOTICE 'Column source already exists in leads table';
    END IF;
END $$;

-- 3. Add has_website column if it does not exist
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
        
        RAISE NOTICE 'Column has_website added to leads table';
    ELSE
        RAISE NOTICE 'Column has_website already exists in leads table';
    END IF;
END $$;

-- 4. Add website_link column if it does not exist
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
        
        RAISE NOTICE 'Column website_link added to leads table';
    ELSE
        RAISE NOTICE 'Column website_link already exists in leads table';
    END IF;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Leads table schema update completed successfully!';
END $$;

-- This migration adds all missing columns needed for the CSV uploader and lead management

-- 1. Add lead_type column if it does not exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'lead_type'
    ) THEN
        ALTER TABLE public.leads 
        ADD COLUMN lead_type TEXT;
        
        COMMENT ON COLUMN public.leads.lead_type IS 'Lead type: outbound (cold leads) or inbound (marketing leads)';
        
        RAISE NOTICE 'Column lead_type added to leads table';
    ELSE
        RAISE NOTICE 'Column lead_type already exists in leads table';
    END IF;
END $$;

-- 2. Add source column if it does not exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'source'
    ) THEN
        ALTER TABLE public.leads 
        ADD COLUMN source TEXT;
        
        COMMENT ON COLUMN public.leads.source IS 'Lead source: Facebook Ads, Google Ads, Website Form, Referral, Other, or manual_upload for outbound leads';
        
        RAISE NOTICE 'Column source added to leads table';
    ELSE
        RAISE NOTICE 'Column source already exists in leads table';
    END IF;
END $$;

-- 3. Add has_website column if it does not exist
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
        
        RAISE NOTICE 'Column has_website added to leads table';
    ELSE
        RAISE NOTICE 'Column has_website already exists in leads table';
    END IF;
END $$;

-- 4. Add website_link column if it does not exist
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
        
        RAISE NOTICE 'Column website_link added to leads table';
    ELSE
        RAISE NOTICE 'Column website_link already exists in leads table';
    END IF;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Leads table schema update completed successfully!';
END $$;















