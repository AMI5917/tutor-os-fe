$token = "sbp_fc5ca38fe3797039010b5e7513b0a9be6b19a34a"
$url = "https://api.supabase.com/v1/projects/rjiglxodzmlreuirlypq/database/query"

$sqlStatements = @(
    "CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, email TEXT UNIQUE NOT NULL, full_name TEXT NOT NULL, role TEXT NOT NULL, phone TEXT, avatar_url TEXT, created_at TIMESTAMPTZ DEFAULT NOW())",
    "CREATE TABLE IF NOT EXISTS teachers (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES users(id) ON DELETE CASCADE, first_name TEXT NOT NULL, middle_name TEXT, last_name TEXT NOT NULL, subject_specialization TEXT NOT NULL, qualification TEXT, hourly_rate DECIMAL(10,2), rate_type TEXT, rate_amount DECIMAL(10,2), mobile_number TEXT, status TEXT DEFAULT 'ACTIVE', created_at TIMESTAMPTZ DEFAULT NOW())",
    "CREATE TABLE IF NOT EXISTS subjects (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name TEXT NOT NULL, code TEXT UNIQUE NOT NULL, default_monthly_fee DECIMAL(10,2), created_at TIMESTAMPTZ DEFAULT NOW())",
    "CREATE TABLE IF NOT EXISTS batches (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name TEXT NOT NULL, subject_id UUID REFERENCES subjects(id), grade TEXT, teacher_id UUID REFERENCES teachers(id), max_capacity INTEGER, color_code TEXT, status TEXT DEFAULT 'ACTIVE', created_at TIMESTAMPTZ DEFAULT NOW())",
    "CREATE TABLE IF NOT EXISTS students (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES users(id) ON DELETE CASCADE, first_name TEXT NOT NULL, middle_name TEXT, last_name TEXT NOT NULL, grade_level TEXT, school_name TEXT, guardian_name TEXT, guardian_phone TEXT, guardian_email TEXT, created_at TIMESTAMPTZ DEFAULT NOW())",
    "CREATE TABLE IF NOT EXISTS student_subject_enrollment (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), student_id UUID REFERENCES students(id) ON DELETE CASCADE, subject_id UUID REFERENCES subjects(id), enrollment_type TEXT, agreed_monthly_fee DECIMAL(10,2), status TEXT DEFAULT 'ACTIVE')",
    "CREATE TABLE IF NOT EXISTS batch_enrollment (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), batch_id UUID REFERENCES batches(id) ON DELETE CASCADE, student_id UUID REFERENCES students(id) ON DELETE CASCADE, status TEXT DEFAULT 'ENROLLED', enrolled_at TIMESTAMPTZ DEFAULT NOW())",
    "CREATE TABLE IF NOT EXISTS semesters (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name TEXT NOT NULL, academic_year TEXT NOT NULL, start_date DATE, end_date DATE, is_current BOOLEAN DEFAULT FALSE)",
    "CREATE TABLE IF NOT EXISTS exams (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), semester_id UUID REFERENCES semesters(id), subject_id UUID REFERENCES subjects(id), batch_id UUID REFERENCES batches(id), title TEXT NOT NULL, total_marks DECIMAL(10,2), exam_date DATE)",
    "CREATE TABLE IF NOT EXISTS exam_results (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), exam_id UUID REFERENCES exams(id) ON DELETE CASCADE, student_id UUID REFERENCES students(id) ON DELETE CASCADE, marks_obtained DECIMAL(10,2), letter_grade TEXT, percentage DECIMAL(5,2), teacher_remarks TEXT)",
    "CREATE TABLE IF NOT EXISTS report_cards (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), student_id UUID REFERENCES students(id) ON DELETE CASCADE, semester_id UUID REFERENCES semesters(id), total_marks_obtained DECIMAL(10,2), total_max_marks DECIMAL(10,2), overall_percentage DECIMAL(5,2), overall_grade TEXT, status TEXT DEFAULT 'DRAFT', published_at TIMESTAMPTZ)",
    "CREATE TABLE IF NOT EXISTS class_sessions (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), batch_id UUID REFERENCES batches(id), teacher_id UUID REFERENCES teachers(id), start_time TIMESTAMPTZ, end_time TIMESTAMPTZ, meeting_link TEXT, status TEXT DEFAULT 'SCHEDULED')",
    "CREATE TABLE IF NOT EXISTS attendance (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), session_id UUID REFERENCES class_sessions(id) ON DELETE CASCADE, student_id UUID REFERENCES students(id) ON DELETE CASCADE, status TEXT, remarks TEXT)",
    "CREATE TABLE IF NOT EXISTS lesson_logs (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), session_id UUID REFERENCES class_sessions(id) ON DELETE CASCADE, topics_covered TEXT, homework_details TEXT, homework_due_date DATE, tutor_private_notes TEXT)",
    "CREATE TABLE IF NOT EXISTS invoices (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), student_id UUID REFERENCES students(id) ON DELETE CASCADE, batch_id UUID REFERENCES batches(id), amount DECIMAL(10,2) NOT NULL, status TEXT DEFAULT 'PENDING', due_date DATE, paid_at TIMESTAMPTZ)"
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

Write-Host "`nSchema creation complete!"