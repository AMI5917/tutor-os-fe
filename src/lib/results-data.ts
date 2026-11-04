// src/lib/results-data.ts
import {
  GradeLetter,
  SemesterCode,
  SemesterStatus,
  SubjectScore,
  SemesterResult,
  StudentAnnualPerformance,
  BatchResultsSummary,
} from "@/types/results";
import { MOCK_STUDENTS, MOCK_BATCHES } from "@/lib/mock-data";
import { getStoredAttendanceRecords, calculateStudentYearlySummary, AcademicYear } from "@/lib/attendance-data";

const STORAGE_KEY = "tutoros_semester_results_v1";

export const SEMESTER_OPTIONS: { code: SemesterCode; name: string }[] = [
  { code: "SEM_1", name: "Semester 1 (Mid-Term)" },
  { code: "SEM_2", name: "Semester 2 (Finals)" },
];

export const ACADEMIC_YEARS = ["2026-2027", "2025-2026"] as const;

/**
 * Compute Grade letter and GPA points from percentage
 */
export function calculateGradeAndGPA(marks: number, maxMarks: number = 100): {
  percentage: number;
  grade: GradeLetter;
  gpaPoint: number;
} {
  const percentage = maxMarks > 0 ? Math.round((marks / maxMarks) * 1000) / 10 : 0;

  if (percentage >= 90) return { percentage, grade: "A+", gpaPoint: 4.0 };
  if (percentage >= 80) return { percentage, grade: "A", gpaPoint: 3.7 };
  if (percentage >= 70) return { percentage, grade: "B+", gpaPoint: 3.3 };
  if (percentage >= 60) return { percentage, grade: "B", gpaPoint: 3.0 };
  if (percentage >= 50) return { percentage, grade: "C", gpaPoint: 2.3 };
  if (percentage >= 40) return { percentage, grade: "D", gpaPoint: 1.7 };
  return { percentage, grade: "F", gpaPoint: 0.0 };
}

/**
 * Generate initial mock semester results for all students across Sem 1 & Sem 2
 */
export function generateInitialResults(): SemesterResult[] {
  const results: SemesterResult[] = [];

  MOCK_STUDENTS.forEach((student, studentIdx) => {
    const batch = MOCK_BATCHES.find((b) => b.id === student.batchId) || {
      id: student.batchId || "bat_1",
      code: student.batchCode || "MATH-10A",
      name: "Standard Batch",
    };

    const studentName = `${student.firstName} ${student.lastName}`.trim();
    const rollNumber = `TOS-${student.id.replace("stud_", "00")}`;

    // Subject lists tailored by batch
    const getBatchSubjects = (sem: SemesterCode): { name: string; code: string }[] => {
      if (batch.id === "bat_1") {
        return [
          { name: "Pure Mathematics", code: "MTH-101" },
          { name: "Applied Physics", code: "PHY-101" },
          { name: "Trigonometry & Calculus", code: "MTH-102" },
        ];
      } else if (batch.id === "bat_2") {
        return [
          { name: "Mechanics & Dynamics", code: "PHY-201" },
          { name: "Electromagnetism & Waves", code: "PHY-202" },
          { name: "Physical Chemistry", code: "CHM-201" },
        ];
      } else {
        return [
          { name: "Advanced Mathematics", code: "MTH-301" },
          { name: "Physics Core", code: "PHY-301" },
          { name: "Organic & Inorganic Chemistry", code: "CHM-301" },
          { name: "Cell Biology & Genetics", code: "BIO-301" },
        ];
      }
    };

    // Base score tier for realism
    let baseScore = 82;
    if (student.id === "stud_1") baseScore = 91; // Alex Rivera
    if (student.id === "stud_2") baseScore = 94; // Sophia Zhang
    if (student.id === "stud_3") baseScore = 74; // Liam Miller
    if (student.id === "stud_4") baseScore = 86; // Aarav Sharma
    if (student.id === "stud_5") baseScore = 89; // Priya Patel
    if (student.id === "stud_6") baseScore = 69; // Rohan Verma
    if (student.id === "stud_7") baseScore = 88; // Diya Patel
    if (student.id === "stud_8") baseScore = 79; // Tanvi Iyer
    if (student.id === "stud_9") baseScore = 73; // Samar Mehta
    if (student.id === "stud_10") baseScore = 93; // Ananya Gupta
    if (student.id === "stud_11") baseScore = 84; // Aditya Roy
    if (student.id === "stud_12") baseScore = 87; // Meera

    SEMESTER_OPTIONS.forEach((sem, semIdx) => {
      // Semester 2 has modest growth (+3-5% for top, +1-2% for middle)
      const semBonus = sem.code === "SEM_2" ? (studentIdx % 2 === 0 ? 3.5 : 2.0) : 0;
      const subjects = getBatchSubjects(sem.code);

      const scores: SubjectScore[] = subjects.map((sub, subIdx) => {
        const variance = ((subIdx * 7 + studentIdx * 11) % 9) - 4;
        const totalMarks = Math.min(100, Math.max(45, Math.round(baseScore + semBonus + variance)));
        const theoryMarks = Math.round(totalMarks * 0.7);
        const practicalMarks = totalMarks - theoryMarks;
        const { percentage, grade, gpaPoint } = calculateGradeAndGPA(totalMarks, 100);

        let feedback = "Consistent and solid grasp of foundational concepts.";
        if (totalMarks >= 90) feedback = "Exceptional conceptual depth and problem-solving clarity.";
        else if (totalMarks >= 80) feedback = "Very good understanding. Keep maintaining this standard.";
        else if (totalMarks >= 70) feedback = "Good effort. Focus on practicing complex numerical exercises.";
        else feedback = "Needs additional revision and guided doubt-clearing practice.";

        return {
          id: `score_${student.id}_${sem.code}_${sub.code}`,
          subjectName: sub.name,
          subjectCode: sub.code,
          maxMarks: 100,
          theoryMarks,
          practicalMarks,
          totalMarks,
          percentage,
          grade,
          gpaPoint,
          feedback,
        };
      });

      const totalMarksScored = scores.reduce((sum, s) => sum + s.totalMarks, 0);
      const maxTotalMarks = scores.reduce((sum, s) => sum + s.maxMarks, 0);
      const aggregatePercentage =
        maxTotalMarks > 0 ? Math.round((totalMarksScored / maxTotalMarks) * 1000) / 10 : 0;

      const avgGpa =
        scores.length > 0
          ? Math.round(
              (scores.reduce((sum, s) => sum + s.gpaPoint, 0) / scores.length) * 10
            ) / 10
          : 0;

      const overallGrade = calculateGradeAndGPA(aggregatePercentage, 100).grade;

      let teacherRemarks = "Active participant in classroom discussions and analytical thinking.";
      if (aggregatePercentage >= 90) {
        teacherRemarks = "Outstanding academic prowess! Displays exceptional intellectual curiosity and leadership.";
      } else if (aggregatePercentage >= 80) {
        teacherRemarks = "Commendable performance across all subjects. Demonstrates high consistency in tests.";
      } else if (aggregatePercentage >= 70) {
        teacherRemarks = "Good academic progress. Continual revision in numerical problem-solving is advised.";
      } else {
        teacherRemarks = "Has genuine potential. Attending regular doubt-clearing sessions will yield noticeable improvement.";
      }

      results.push({
        id: `res_${student.id}_${sem.code}_2026-2027`,
        studentId: student.id,
        studentName,
        rollNumber,
        gradeLevel: student.standard,
        batchId: batch.id,
        batchCode: batch.code,
        batchName: batch.name,
        semesterCode: sem.code,
        semesterName: sem.name,
        academicYear: "2026-2027",
        status: "PUBLISHED",
        scores,
        totalMarksScored,
        maxTotalMarks,
        aggregatePercentage,
        gpa: avgGpa,
        overallGrade,
        teacherRemarks,
        evaluationDate: sem.code === "SEM_1" ? "2026-10-15" : "2027-03-25",
        updatedAt: new Date().toISOString(),
      });
    });
  });

  return results;
}

/**
 * Retrieve stored results from localStorage or initialize with seed
 */
export function getStoredResults(): SemesterResult[] {
  if (typeof window === "undefined") {
    return generateInitialResults();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = generateInitialResults();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading stored semester results:", err);
    return generateInitialResults();
  }
}

/**
 * Persist results to localStorage
 */
export function saveResults(results: SemesterResult[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    } catch (err) {
      console.error("Failed to save results:", err);
    }
  }
}

/**
 * Update a student's semester result (subject scores, remarks, status)
 */
export function updateStudentSemesterResult(params: {
  resultId: string;
  scores: SubjectScore[];
  teacherRemarks?: string;
  status?: SemesterStatus;
}): SemesterResult | null {
  const results = getStoredResults();
  const index = results.findIndex((r) => r.id === params.resultId);
  if (index === -1) return null;

  const current = results[index];

  // Recompute total, percentage, GPA
  const totalMarksScored = params.scores.reduce((sum, s) => sum + s.totalMarks, 0);
  const maxTotalMarks = params.scores.reduce((sum, s) => sum + s.maxMarks, 0);
  const aggregatePercentage =
    maxTotalMarks > 0 ? Math.round((totalMarksScored / maxTotalMarks) * 1000) / 10 : 0;

  const gpa =
    params.scores.length > 0
      ? Math.round(
          (params.scores.reduce((sum, s) => sum + s.gpaPoint, 0) / params.scores.length) * 10
        ) / 10
      : 0;

  const overallGrade = calculateGradeAndGPA(aggregatePercentage, 100).grade;

  const updated: SemesterResult = {
    ...current,
    scores: params.scores,
    totalMarksScored,
    maxTotalMarks,
    aggregatePercentage,
    gpa,
    overallGrade,
    teacherRemarks: params.teacherRemarks !== undefined ? params.teacherRemarks : current.teacherRemarks,
    status: params.status || current.status,
    updatedAt: new Date().toISOString(),
  };

  results[index] = updated;
  saveResults(results);
  return updated;
}

/**
 * Retrieve comprehensive academic year progress for a student
 */
export function getStudentAnnualPerformance(
  studentId: string,
  academicYear: string,
  records?: SemesterResult[]
): StudentAnnualPerformance | null {
  const allResults = records || getStoredResults();
  const studentResults = allResults.filter(
    (r) => r.studentId === studentId && r.academicYear === academicYear
  );

  if (studentResults.length === 0) return null;

  const first = studentResults[0];
  const sem1 = studentResults.find((r) => r.semesterCode === "SEM_1");
  const sem2 = studentResults.find((r) => r.semesterCode === "SEM_2");

  const sem1Percentage = sem1?.aggregatePercentage;
  const sem2Percentage = sem2?.aggregatePercentage;

  let overallAnnualPercentage = 0;
  let overallAnnualGpa = 0;

  if (sem1 && sem2) {
    overallAnnualPercentage = Math.round(((sem1.aggregatePercentage + sem2.aggregatePercentage) / 2) * 10) / 10;
    overallAnnualGpa = Math.round(((sem1.gpa + sem2.gpa) / 2) * 10) / 10;
  } else if (sem1) {
    overallAnnualPercentage = sem1.aggregatePercentage;
    overallAnnualGpa = sem1.gpa;
  } else if (sem2) {
    overallAnnualPercentage = sem2.aggregatePercentage;
    overallAnnualGpa = sem2.gpa;
  }

  let trajectory: "IMPROVED" | "CONSISTENT" | "DECLINED" = "CONSISTENT";
  let trajectoryDelta = 0;

  if (sem1Percentage !== undefined && sem2Percentage !== undefined) {
    trajectoryDelta = Math.round((sem2Percentage - sem1Percentage) * 10) / 10;
    if (trajectoryDelta > 0.5) trajectory = "IMPROVED";
    else if (trajectoryDelta < -0.5) trajectory = "DECLINED";
  }

  let standing: StudentAnnualPerformance["standing"] = "Pass";
  if (overallAnnualPercentage >= 85) standing = "First Class with Distinction";
  else if (overallAnnualPercentage >= 70) standing = "First Class";
  else if (overallAnnualPercentage >= 50) standing = "Second Class";
  else if (overallAnnualPercentage >= 40) standing = "Pass";
  else standing = "Needs Improvement";

  // Attendance integration
  const attendanceRecords = getStoredAttendanceRecords();
  const validYear: AcademicYear = academicYear === "2026-2027" ? "2026-2027" : "2025-2026";
  const attendanceYearly = calculateStudentYearlySummary(studentId, validYear, attendanceRecords);

  const attendanceSummary = {
    totalWorkingDays: attendanceYearly?.totalWorkingDays || 220,
    totalPresentDays: attendanceYearly?.presentDays || 202,
    attendancePercentage: attendanceYearly?.attendancePercentage || 92,
  };

  const overallGrade = calculateGradeAndGPA(overallAnnualPercentage, 100).grade;

  return {
    studentId,
    studentName: first.studentName,
    rollNumber: first.rollNumber,
    gradeLevel: first.gradeLevel,
    batchId: first.batchId,
    batchCode: first.batchCode,
    batchName: first.batchName,
    academicYear,
    semesterResults: studentResults,
    sem1Percentage,
    sem2Percentage,
    overallAnnualPercentage,
    overallAnnualGpa,
    overallGrade,
    standing,
    trajectory,
    trajectoryDelta,
    attendanceSummary,
    overallRemarks:
      standing === "First Class with Distinction"
        ? "Exemplary performance with high academic diligence throughout the year."
        : standing === "First Class"
        ? "Consistently high standard of academic performance and conduct."
        : "Satisfactory progress. Continued focus will unlock greater potential.",
  };
}

/**
 * Calculate batch results summary for a specific semester
 */
export function calculateBatchResultsSummary(
  batchId: string,
  semesterCode: SemesterCode,
  results: SemesterResult[]
): BatchResultsSummary {
  const batch = MOCK_BATCHES.find((b) => b.id === batchId);
  const filtered = results.filter(
    (r) => (batchId === "ALL" || r.batchId === batchId) && r.semesterCode === semesterCode
  );

  const totalStudents = filtered.length;
  const evaluatedStudents = filtered.filter((r) => r.status === "PUBLISHED").length;

  const totalPct = filtered.reduce((acc, r) => acc + r.aggregatePercentage, 0);
  const totalGpa = filtered.reduce((acc, r) => acc + r.gpa, 0);

  const batchAveragePercentage =
    totalStudents > 0 ? Math.round((totalPct / totalStudents) * 10) / 10 : 0;
  const batchAverageGpa =
    totalStudents > 0 ? Math.round((totalGpa / totalStudents) * 10) / 10 : 0;

  let topScorePercentage = 0;
  let topScorerName = "N/A";

  filtered.forEach((r) => {
    if (r.aggregatePercentage > topScorePercentage) {
      topScorePercentage = r.aggregatePercentage;
      topScorerName = r.studentName;
    }
  });

  const distinctionCount = filtered.filter((r) => r.aggregatePercentage >= 85).length;
  const firstClassCount = filtered.filter((r) => r.aggregatePercentage >= 70 && r.aggregatePercentage < 85).length;
  const secondClassCount = filtered.filter((r) => r.aggregatePercentage >= 50 && r.aggregatePercentage < 70).length;
  const retestCount = filtered.filter((r) => r.aggregatePercentage < 50).length;

  const passingRatePercentage =
    totalStudents > 0 ? Math.round(((totalStudents - retestCount) / totalStudents) * 100) : 100;

  return {
    batchId,
    batchCode: batch ? batch.code : "ALL-BATCHES",
    batchName: batch ? batch.name : "All Batches Combined",
    semesterCode,
    totalStudents,
    evaluatedStudents,
    batchAveragePercentage,
    batchAverageGpa,
    topScorePercentage,
    topScorerName,
    passingRatePercentage,
    distinctionCount,
    firstClassCount,
    secondClassCount,
    retestCount,
  };
}

/**
 * Client-side CSV export of gradebook
 */
export function exportResultsToCSV(
  results: SemesterResult[],
  filename = "TutorOS_Gradebook.csv"
) {
  if (typeof window === "undefined") return;

  const headers = [
    "Student Name",
    "Roll Number",
    "Batch Code",
    "Semester",
    "Academic Year",
    "Total Marks",
    "Max Marks",
    "Percentage",
    "GPA (4.0)",
    "Grade",
    "Status",
    "Evaluation Date",
    "Teacher Remarks",
  ];

  const rows = results.map((r) => [
    `"${r.studentName}"`,
    `"${r.rollNumber}"`,
    `"${r.batchCode}"`,
    `"${r.semesterName}"`,
    `"${r.academicYear}"`,
    r.totalMarksScored,
    r.maxTotalMarks,
    `${r.aggregatePercentage}%`,
    r.gpa,
    `"${r.overallGrade}"`,
    `"${r.status}"`,
    `"${r.evaluationDate}"`,
    `"${r.teacherRemarks.replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
