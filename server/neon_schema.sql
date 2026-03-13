-- =============================================
-- Neon PostgreSQL Schema for Exam Portal
-- Run this in your Neon SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table: exam_settings
CREATE TABLE IF NOT EXISTS exam_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  exam_active BOOLEAN DEFAULT false,
  allowed_device VARCHAR(50) DEFAULT 'desktop',
  exam_duration INTEGER DEFAULT 120,
  exam_start_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert a default row
INSERT INTO exam_settings (exam_active, allowed_device, exam_duration)
SELECT false, 'desktop', 120
WHERE NOT EXISTS (SELECT 1 FROM exam_settings);

-- 2. Table: students
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  regd_no VARCHAR(100) NOT NULL UNIQUE,
  system_no VARCHAR(100) NOT NULL,
  device_type VARCHAR(50) NOT NULL,
  exam_started BOOLEAN DEFAULT false,
  violations INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Table: questions
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  sample_input TEXT NOT NULL,
  sample_output TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Table: violations
CREATE TABLE IF NOT EXISTS violations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  regd_no VARCHAR(100) NOT NULL,
  violation_type VARCHAR(255) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- 5. Table: submissions
CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  output TEXT,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
