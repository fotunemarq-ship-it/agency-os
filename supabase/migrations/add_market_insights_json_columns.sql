-- Migration: Add general_insights and competitor_insights JSON columns to market_insights table
-- This migration adds two new JSON columns to store structured market intelligence data:
-- 1. 'general_insights': Stores general market research data (search demand, keywords, SEO visibility, audit snapshots)
-- 2. 'competitor_insights': Stores competitor analysis data (traffic, keywords, ad activity, reputation)

-- Add general_insights column if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'market_insights'
        AND column_name = 'general_insights'
    ) THEN
        ALTER TABLE public.market_insights
        ADD COLUMN general_insights JSONB;
        
        COMMENT ON COLUMN public.market_insights.general_insights IS 'JSON object containing general market insights: monthlySearchDemand, topKeywords, localSeoVisibility, websiteAuditSnapshot';
    ELSE
        RAISE NOTICE 'Column general_insights already exists in market_insights table';
    END IF;
END $$;

-- Add competitor_insights column if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'market_insights'
        AND column_name = 'competitor_insights'
    ) THEN
        ALTER TABLE public.market_insights
        ADD COLUMN competitor_insights JSONB;
        
        COMMENT ON COLUMN public.market_insights.competitor_insights IS 'JSON object containing competitor analysis: competitorTraffic, competitorKeywords, googleAdsActivity, competitorReputation';
    ELSE
        RAISE NOTICE 'Column competitor_insights already exists in market_insights table';
    END IF;
END $$;

-- This migration adds two new JSON columns to store structured market intelligence data:
-- 1. 'general_insights': Stores general market research data (search demand, keywords, SEO visibility, audit snapshots)
-- 2. 'competitor_insights': Stores competitor analysis data (traffic, keywords, ad activity, reputation)

-- Add general_insights column if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'market_insights'
        AND column_name = 'general_insights'
    ) THEN
        ALTER TABLE public.market_insights
        ADD COLUMN general_insights JSONB;
        
        COMMENT ON COLUMN public.market_insights.general_insights IS 'JSON object containing general market insights: monthlySearchDemand, topKeywords, localSeoVisibility, websiteAuditSnapshot';
    ELSE
        RAISE NOTICE 'Column general_insights already exists in market_insights table';
    END IF;
END $$;

-- Add competitor_insights column if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'market_insights'
        AND column_name = 'competitor_insights'
    ) THEN
        ALTER TABLE public.market_insights
        ADD COLUMN competitor_insights JSONB;
        
        COMMENT ON COLUMN public.market_insights.competitor_insights IS 'JSON object containing competitor analysis: competitorTraffic, competitorKeywords, googleAdsActivity, competitorReputation';
    ELSE
        RAISE NOTICE 'Column competitor_insights already exists in market_insights table';
    END IF;
END $$;




-- This migration adds two new JSON columns to store structured market intelligence data:
-- 1. 'general_insights': Stores general market research data (search demand, keywords, SEO visibility, audit snapshots)
-- 2. 'competitor_insights': Stores competitor analysis data (traffic, keywords, ad activity, reputation)

-- Add general_insights column if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'market_insights'
        AND column_name = 'general_insights'
    ) THEN
        ALTER TABLE public.market_insights
        ADD COLUMN general_insights JSONB;
        
        COMMENT ON COLUMN public.market_insights.general_insights IS 'JSON object containing general market insights: monthlySearchDemand, topKeywords, localSeoVisibility, websiteAuditSnapshot';
    ELSE
        RAISE NOTICE 'Column general_insights already exists in market_insights table';
    END IF;
END $$;

-- Add competitor_insights column if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'market_insights'
        AND column_name = 'competitor_insights'
    ) THEN
        ALTER TABLE public.market_insights
        ADD COLUMN competitor_insights JSONB;
        
        COMMENT ON COLUMN public.market_insights.competitor_insights IS 'JSON object containing competitor analysis: competitorTraffic, competitorKeywords, googleAdsActivity, competitorReputation';
    ELSE
        RAISE NOTICE 'Column competitor_insights already exists in market_insights table';
    END IF;
END $$;

-- This migration adds two new JSON columns to store structured market intelligence data:
-- 1. 'general_insights': Stores general market research data (search demand, keywords, SEO visibility, audit snapshots)
-- 2. 'competitor_insights': Stores competitor analysis data (traffic, keywords, ad activity, reputation)

-- Add general_insights column if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'market_insights'
        AND column_name = 'general_insights'
    ) THEN
        ALTER TABLE public.market_insights
        ADD COLUMN general_insights JSONB;
        
        COMMENT ON COLUMN public.market_insights.general_insights IS 'JSON object containing general market insights: monthlySearchDemand, topKeywords, localSeoVisibility, websiteAuditSnapshot';
    ELSE
        RAISE NOTICE 'Column general_insights already exists in market_insights table';
    END IF;
END $$;

-- Add competitor_insights column if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'market_insights'
        AND column_name = 'competitor_insights'
    ) THEN
        ALTER TABLE public.market_insights
        ADD COLUMN competitor_insights JSONB;
        
        COMMENT ON COLUMN public.market_insights.competitor_insights IS 'JSON object containing competitor analysis: competitorTraffic, competitorKeywords, googleAdsActivity, competitorReputation';
    ELSE
        RAISE NOTICE 'Column competitor_insights already exists in market_insights table';
    END IF;
END $$;




-- This migration adds two new JSON columns to store structured market intelligence data:
-- 1. 'general_insights': Stores general market research data (search demand, keywords, SEO visibility, audit snapshots)
-- 2. 'competitor_insights': Stores competitor analysis data (traffic, keywords, ad activity, reputation)

-- Add general_insights column if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'market_insights'
        AND column_name = 'general_insights'
    ) THEN
        ALTER TABLE public.market_insights
        ADD COLUMN general_insights JSONB;
        
        COMMENT ON COLUMN public.market_insights.general_insights IS 'JSON object containing general market insights: monthlySearchDemand, topKeywords, localSeoVisibility, websiteAuditSnapshot';
    ELSE
        RAISE NOTICE 'Column general_insights already exists in market_insights table';
    END IF;
END $$;

-- Add competitor_insights column if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'market_insights'
        AND column_name = 'competitor_insights'
    ) THEN
        ALTER TABLE public.market_insights
        ADD COLUMN competitor_insights JSONB;
        
        COMMENT ON COLUMN public.market_insights.competitor_insights IS 'JSON object containing competitor analysis: competitorTraffic, competitorKeywords, googleAdsActivity, competitorReputation';
    ELSE
        RAISE NOTICE 'Column competitor_insights already exists in market_insights table';
    END IF;
END $$;

-- This migration adds two new JSON columns to store structured market intelligence data:
-- 1. 'general_insights': Stores general market research data (search demand, keywords, SEO visibility, audit snapshots)
-- 2. 'competitor_insights': Stores competitor analysis data (traffic, keywords, ad activity, reputation)

-- Add general_insights column if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'market_insights'
        AND column_name = 'general_insights'
    ) THEN
        ALTER TABLE public.market_insights
        ADD COLUMN general_insights JSONB;
        
        COMMENT ON COLUMN public.market_insights.general_insights IS 'JSON object containing general market insights: monthlySearchDemand, topKeywords, localSeoVisibility, websiteAuditSnapshot';
    ELSE
        RAISE NOTICE 'Column general_insights already exists in market_insights table';
    END IF;
END $$;

-- Add competitor_insights column if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'market_insights'
        AND column_name = 'competitor_insights'
    ) THEN
        ALTER TABLE public.market_insights
        ADD COLUMN competitor_insights JSONB;
        
        COMMENT ON COLUMN public.market_insights.competitor_insights IS 'JSON object containing competitor analysis: competitorTraffic, competitorKeywords, googleAdsActivity, competitorReputation';
    ELSE
        RAISE NOTICE 'Column competitor_insights already exists in market_insights table';
    END IF;
END $$;
















