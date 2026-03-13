-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table: exam_settings
CREATE TABLE IF NOT EXISTS public.exam_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  exam_active BOOLEAN DEFAULT false,
  allowed_device VARCHAR(50) DEFAULT 'desktop',
  exam_duration INTEGER DEFAULT 120,
  exam_start_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert a default exam setting row if none exists
INSERT INTO public.exam_settings (exam_active, allowed_device, exam_duration)
SELECT false, 'desktop', 120
WHERE NOT EXISTS (SELECT 1 FROM public.exam_settings);

-- 2. Table: students
CREATE TABLE IF NOT EXISTS public.students (
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
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  sample_input TEXT NOT NULL,
  sample_output TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Table: violations
CREATE TABLE IF NOT EXISTS public.violations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  regd_no VARCHAR(100) NOT NULL,
  violation_type VARCHAR(255) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- 5. Table: submissions
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  output TEXT,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.exam_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- For maximum security, we only allow public SELECTs on read-only tables (questions, exam_settings)
-- and require Edge Functions (which bypass RLS via service_role) to handle POSTs for students, violations, and submissions.
-- However, for the admin dashboard (which might be querying directly from React), we will allow SELECT on all tables.

CREATE POLICY "Allow public read on exam_settings" ON public.exam_settings FOR SELECT USING (true);
CREATE POLICY "Allow public read on questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Allow public read on students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow public read on violations" ON public.violations FOR SELECT USING (true);
CREATE POLICY "Allow public read on submissions" ON public.submissions FOR SELECT USING (true);

-- The Edge Functions will handle INSERTS/UPDATES, so no public INSERT policies are provided here.
