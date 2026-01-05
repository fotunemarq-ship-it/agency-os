-- Add new statuses to the lead_status enum
DO $$
BEGIN
    ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'proposal_requested';
    ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'proposal_sent';
    ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'contract_signed';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
