-- TutorOS Seed Data
-- Run this after schema.sql

-- Insert Subjects
INSERT INTO subjects (name, code, default_monthly_fee) VALUES
  ('Mathematics', 'MATH', 1800),
  ('Physics', 'PHY', 2000),
  ('Chemistry', 'CHEM', 1800),
  ('Biology', 'BIO', 1800),
  ('English SAT', 'ENG-SAT', 1500)
ON CONFLICT (code) DO NOTHING;

-- Insert Teachers
INSERT INTO teachers (first_name, last_name, subject_specialization, qualification, hourly_rate, rate_type, rate_amount, mobile_number, status) VALUES
  ('Amit', 'Sharma', 'Mathematics', 'M.Sc. Math', 500, 'HOURLY', 500, '+91 98765 43210', 'ACTIVE'),
  ('Neha', 'Patel', 'Physics', 'M.Sc. Physics', 500, 'WEEKLY', 1500, '+91 98123 45678', 'ACTIVE'),
  ('Elena', 'Rostova', 'Chemistry', 'Ph.D. Chemistry', 750, 'HOURLY', 750, '+91 98765 12345', 'ACTIVE'),
  ('Marcus', 'Vance', 'English SAT', 'M.A. English', 400, 'HOURLY', 400, '+91 98765 12346', 'ACTIVE')
ON CONFLICT DO NOTHING;

-- Insert Batches
INSERT INTO batches (name, subject_id, grade, max_capacity, color_code, status)
SELECT 'Grade 10 Advanced Mathematics', id, '10th', 20, '#6366f1', 'ACTIVE' FROM subjects WHERE code='MATH'
ON CONFLICT DO NOTHING;

INSERT INTO batches (name, subject_id, grade, max_capacity, color_code, status)
SELECT 'AP Physics Mechanics & Waves', id, '12th', 15, '#ec4899', 'ACTIVE' FROM subjects WHERE code='PHY'
ON CONFLICT DO NOTHING;

INSERT INTO batches (name, subject_id, grade, max_capacity, color_code, status)
SELECT 'Grade 11 Organic Chemistry', id, '11th', 15, '#10b981', 'ACTIVE' FROM subjects WHERE code='CHEM'
ON CONFLICT DO NOTHING;

INSERT INTO batches (name, subject_id, grade, max_capacity, color_code, status)
SELECT 'SAT Verbal & Reading Intensive', id, '11-12th', 20, '#f59e0b', 'ACTIVE' FROM subjects WHERE code='ENG-SAT'
ON CONFLICT DO NOTHING;

-- Insert Semesters
INSERT INTO semesters (name, academic_year, start_date, end_date, is_current) VALUES
  ('Semester 1', '2026-2027', '2026-08-01', '2026-12-15', true),
  ('Semester 2', '2026-2027', '2027-01-01', '2027-05-30', false)
ON CONFLICT DO NOTHING;