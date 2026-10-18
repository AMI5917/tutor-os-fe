-- TutorOS Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teachers
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  subject_specialization TEXT NOT NULL,
  qualification TEXT,
  hourly_rate DECIMAL(10,2),
  rate_type TEXT CHECK (rate_type IN ('HOURLY', 'WEEKLY', 'MONTHLY', 'REVENUE_SHARE')),
  rate_amount DECIMAL(10,2),
  mobile_number TEXT,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  default_monthly_fee DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Batches
CREATE TABLE IF NOT EXISTS batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subject_id UUID REFERENCES subjects(id),
  grade TEXT,
  teacher_id UUID REFERENCES teachers(id),
  max_capacity INTEGER,
  color_code TEXT,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'ARCHIVED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  grade_level TEXT,
  school_name TEXT,
  guardian_name TEXT,
  guardian_phone TEXT,
  guardian_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student Subject Enrollment
CREATE TABLE IF NOT EXISTS student_subject_enrollment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id),
  enrollment_type TEXT CHECK (enrollment_type IN ('ALL_SUBJECTS_BUNDLE', 'SINGLE_OR_DUAL_MODULAR')),
  agreed_monthly_fee DECIMAL(10,2),
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'COMPLETED'))
);

-- Batch Enrollment
CREATE TABLE IF NOT EXISTS batch_enrollment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'ENROLLED' CHECK (status IN ('ENROLLED', 'DROPPED', 'COMPLETED')),
  enrolled_at TIMESTAMPTZ DEFAULT NOW()
);

-- Semesters
CREATE TABLE IF NOT EXISTS semesters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE
);

-- Exams
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  semester_id UUID REFERENCES semesters(id),
  subject_id UUID REFERENCES subjects(id),
  batch_id UUID REFERENCES batches(id),
  title TEXT NOT NULL,
  total_marks DECIMAL(10,2),
  exam_date DATE
);

-- Exam Results
CREATE TABLE IF NOT EXISTS exam_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  marks_obtained DECIMAL(10,2),
  letter_grade TEXT,
  percentage DECIMAL(5,2),
  teacher_remarks TEXT
);

-- Report Cards
CREATE TABLE IF NOT EXISTS report_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  semester_id UUID REFERENCES semesters(id),
  total_marks_obtained DECIMAL(10,2),
  total_max_marks DECIMAL(10,2),
  overall_percentage DECIMAL(5,2),
  overall_grade TEXT,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED')),
  published_at TIMESTAMPTZ
);

-- Class Sessions
CREATE TABLE IF NOT EXISTS class_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID REFERENCES batches(id),
  teacher_id UUID REFERENCES teachers(id),
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  meeting_link TEXT,
  status TEXT DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED'))
);

-- Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES class_sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED')),
  remarks TEXT
);

-- Lesson Logs
CREATE TABLE IF NOT EXISTS lesson_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES class_sessions(id) ON DELETE CASCADE,
  topics_covered TEXT,
  homework_details TEXT,
  homework_due_date DATE,
  tutor_private_notes TEXT
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES batches(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'OVERDUE', 'VOID')),
  due_date DATE,
  paid_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_teachers_status ON teachers(status);
CREATE INDEX IF NOT EXISTS idx_batches_status ON batches(status);
CREATE INDEX IF NOT EXISTS idx_batches_subject ON batches(subject_id);
CREATE INDEX IF NOT EXISTS idx_batches_teacher ON batches(teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_user ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_batch_enrollment_batch ON batch_enrollment(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_enrollment_student ON batch_enrollment(student_id);
CREATE INDEX IF NOT EXISTS idx_student_subject_student ON student_subject_enrollment(student_id);
CREATE INDEX IF NOT EXISTS idx_student_subject_subject ON student_subject_enrollment(subject_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_batch ON class_sessions(batch_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_teacher ON class_sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_attendance_session ON attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_invoices_student ON invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_invoices_batch ON invoices(batch_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_exam_results_exam ON exam_results(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_student ON exam_results(student_id);