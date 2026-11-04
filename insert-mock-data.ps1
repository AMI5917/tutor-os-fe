$token = "sbp_fc5ca38fe3797039010b5e7513b0a9be6b19a34a"
$url = "https://api.supabase.com/v1/projects/rjiglxodzmlreuirlypq/database/query"

# Get subject IDs
$subjectsJson = Invoke-WebRequest -Uri $url -Method POST -Headers @{Authorization = "Bearer $token"; "Content-Type" = "application/json"} -Body '{"query":"SELECT id, code FROM subjects"}' -ErrorAction Stop
Write-Host "Subjects: $($subjectsJson.Content)"

# Get teacher IDs
$teachersJson = Invoke-WebRequest -Uri $url -Method POST -Headers @{Authorization = "Bearer $token"; "Content-Type" = "application/json"} -Body '{"query":"SELECT id, first_name, last_name FROM teachers"}' -ErrorAction Stop
Write-Host "Teachers: $($teachersJson.Content)"

# Insert Batches
$batchesSql = @"
INSERT INTO batches (name, subject_id, grade, max_capacity, color_code, status)
SELECT 'Grade 10 Advanced Mathematics', id, '10th', 20, '#6366f1', 'ACTIVE' FROM subjects WHERE code='MATH';
INSERT INTO batches (name, subject_id, grade, max_capacity, color_code, status)
SELECT 'AP Physics Mechanics & Waves', id, '12th', 15, '#ec4899', 'ACTIVE' FROM subjects WHERE code='PHY';
INSERT INTO batches (name, subject_id, grade, max_capacity, color_code, status)
SELECT 'Grade 10 Full Science Stream', id, '10th', 30, '#10b981', 'ACTIVE' FROM subjects WHERE code='BIO';
"@
$batchesResult = Invoke-WebRequest -Uri $url -Method POST -Headers @{Authorization = "Bearer $token"; "Content-Type" = "application/json"} -Body (ConvertTo-Json -InputObject @{query = $batchesSql}) -ErrorAction Stop
Write-Host "Batches: $($batchesResult.Content)"

# Get batch IDs
$batchesData = Invoke-WebRequest -Uri $url -Method POST -Headers @{Authorization = "Bearer $token"; "Content-Type" = "application/json"} -Body '{"query":"SELECT id, name FROM batches"}' -ErrorAction Stop
Write-Host "Batches data: $($batchesData.Content)"

Write-Host "`nAll mock data inserted successfully!"