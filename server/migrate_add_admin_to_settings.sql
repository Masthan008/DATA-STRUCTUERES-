-- Run this in your Neon SQL Editor
-- Adds admin_id column to exam_settings so each admin has their own settings row

ALTER TABLE exam_settings ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES admins(id) ON DELETE CASCADE;

-- Update the existing default row to have no admin (shared fallback)
-- New per-admin rows will be created on first save
