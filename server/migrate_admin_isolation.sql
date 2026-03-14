-- =============================================
-- Migration: Admin Isolation
-- Run this in your Neon SQL Editor
-- =============================================

-- Add admin_id to exam_settings (one settings row per admin)
ALTER TABLE exam_settings ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES admins(id) ON DELETE CASCADE;

-- Add admin_id to questions
ALTER TABLE questions ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES admins(id) ON DELETE CASCADE;

-- Add admin_id to students (which admin's exam they belong to)
ALTER TABLE students ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES admins(id) ON DELETE CASCADE;

-- violations and submissions are linked via student_id which already has admin_id, no change needed

-- Drop the old unique constraint on regd_no (students from different admins can share regd_no)
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_regd_no_key;

-- New unique constraint: regd_no must be unique per admin
ALTER TABLE students ADD CONSTRAINT students_regd_no_admin_unique UNIQUE (regd_no, admin_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_exam_settings_admin ON exam_settings(admin_id);
CREATE INDEX IF NOT EXISTS idx_questions_admin ON questions(admin_id);
CREATE INDEX IF NOT EXISTS idx_students_admin ON students(admin_id);
