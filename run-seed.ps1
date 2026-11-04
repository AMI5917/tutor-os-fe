$token = "sbp_fc5ca38fe3797039010b5e7513b0a9be6b19a34a"
$url = "https://api.supabase.com/v1/projects/rjiglxodzmlreuirlypq/database/query"

# Seed data
$sqlStatements = @(
    "INSERT INTO subjects (name, code, default_monthly_fee) VALUES ('Mathematics', 'MATH', 1800), ('Physics', 'PHY', 2000), ('Chemistry', 'CHEM', 1800), ('Biology', 'BIO', 1800), ('English SAT', 'ENG-SAT', 1500) ON CONFLICT (code) DO NOTHING",
    "INSERT INTO teachers (first_name, last_name, subject_specialization, qualification, hourly_rate, rate_type, rate_amount, mobile_number, status) VALUES ('Amit', 'Sharma', 'Mathematics', 'M.Sc. Math', 500, 'HOURLY', 500, '+91 98765 43210', 'ACTIVE'), ('Neha', 'Patel', 'Physics', 'M.Sc. Physics', 500, 'WEEKLY', 1500, '+91 98123 45678', 'ACTIVE'), ('Elena', 'Rostova', 'Chemistry', 'Ph.D. Chemistry', 750, 'HOURLY', 750, '+91 98765 12345', 'ACTIVE'), ('Marcus', 'Vance', 'English SAT', 'M.A. English', 400, 'HOURLY', 400, '+91 98765 12346', 'ACTIVE') ON CONFLICT DO NOTHING",
    "INSERT INTO semesters (name, academic_year, start_date, end_date, is_current) VALUES ('Semester 1', '2026-2027', '2026-08-01', '2026-12-15', true), ('Semester 2', '2026-2027', '2027-01-01', '2027-05-30', false) ON CONFLICT DO NOTHING",
    "CREATE INDEX IF NOT EXISTS idx_teachers_status ON teachers(status)",
    "CREATE INDEX IF NOT EXISTS idx_batches_status ON batches(status)",
    "CREATE INDEX IF NOT EXISTS idx_batches_subject ON batches(subject_id)",
    "CREATE INDEX IF NOT EXISTS idx_batches_teacher ON batches(teacher_id)",
    "CREATE INDEX IF NOT EXISTS idx_students_user ON students(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_batch_enrollment_batch ON batch_enrollment(batch_id)",
    "CREATE INDEX IF NOT EXISTS idx_batch_enrollment_student ON batch_enrollment(student_id)",
    "CREATE INDEX IF NOT EXISTS idx_student_subject_student ON student_subject_enrollment(student_id)",
    "CREATE INDEX IF NOT EXISTS idx_student_subject_subject ON student_subject_enrollment(subject_id)",
    "CREATE INDEX IF NOT EXISTS idx_class_sessions_batch ON class_sessions(batch_id)",
    "CREATE INDEX IF NOT EXISTS idx_class_sessions_teacher ON class_sessions(teacher_id)",
    "CREATE INDEX IF NOT EXISTS idx_attendance_session ON attendance(session_id)",
    "CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id)",
    "CREATE INDEX IF NOT EXISTS idx_invoices_student ON invoices(student_id)",
    "CREATE INDEX IF NOT EXISTS idx_invoices_batch ON invoices(batch_id)",
    "CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)",
    "CREATE INDEX IF NOT EXISTS idx_exam_results_exam ON exam_results(exam_id)",
    "CREATE INDEX IF NOT EXISTS idx_exam_results_student ON exam_results(student_id)"
)

foreach ($sql in $sqlStatements) {
    $body = ConvertTo-Json -InputObject @{ query = $sql }
    try {
        $response = Invoke-WebRequest -Uri $url -Method POST -Headers @{Authorization = "Bearer $token"; "Content-Type" = "application/json"} -Body $body -ErrorAction Stop
        Write-Host "OK: $($sql.Substring(0, [Math]::Min(50, $sql.Length)))..."
    } catch {
        Write-Host "ERROR: $($_.Exception.Message)"
    }
}

Write-Host "`nSeed data and indexes complete!"