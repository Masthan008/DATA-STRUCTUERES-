-- Run this in your Neon SQL Editor to add new feature columns

-- Question difficulty, category, per-question time limit
ALTER TABLE questions ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'easy';
ALTER TABLE questions ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'General';
ALTER TABLE questions ADD COLUMN IF NOT EXISTS time_limit_seconds INTEGER DEFAULT 120;

-- Exam schedule
ALTER TABLE exam_settings ADD COLUMN IF NOT EXISTS scheduled_start_time TIMESTAMPTZ;

-- Student blacklist
ALTER TABLE students ADD COLUMN IF NOT EXISTS blacklisted BOOLEAN DEFAULT false;
