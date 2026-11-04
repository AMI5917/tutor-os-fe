// src/types/results.ts

export type GradeLetter = "A+" | "A" | "B+" | "B" | "C" | "D" | "F";

export type SemesterCode = "SEM_1" | "SEM_2";

export type SemesterStatus = "PUBLISHED" | "DRAFT" | "UNDER_REVIEW";

export interface SubjectScore {
  id: string;
  subjectName: string;
  subjectCode: string;
  maxMarks: number;
  theoryMarks: number;
  practicalMarks: number;
  totalMarks: number;
  percentage: number;
  grade: GradeLetter;
  gpaPoint: number; // e.g. 4.0, 3.7
  feedback?: string;
}

export interface SemesterResult {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  gradeLevel: string;
  batchId: string;
  batchCode: string;
  batchName: string;
  semesterCode: SemesterCode;
  semesterName: string; // e.g. "Semester 1 (Mid-Term)"
  academicYear: string; // "2026-2027"
  status: SemesterStatus;
  scores: SubjectScore[];
  totalMarksScored: number;
  maxTotalMarks: number;
  aggregatePercentage: number;
  gpa: number; // 4.0 scale
  overallGrade: GradeLetter;
  teacherRemarks: string;
  evaluationDate: string;
  updatedAt?: string;
}

export interface StudentAnnualPerformance {
  studentId: string;
  studentName: string;
  rollNumber: string;
  gradeLevel: string;
  batchId: string;
  batchCode: string;
  batchName: string;
  academicYear: string;
  semesterResults: SemesterResult[];
  sem1Percentage?: number;
  sem2Percentage?: number;
  overallAnnualPercentage: number;
  overallAnnualGpa: number;
  overallGrade: GradeLetter;
  standing: "First Class with Distinction" | "First Class" | "Second Class" | "Pass" | "Needs Improvement";
  trajectory: "IMPROVED" | "CONSISTENT" | "DECLINED";
  trajectoryDelta: number; // e.g. +4.2%
  attendanceSummary: {
    totalWorkingDays: number;
    totalPresentDays: number;
    attendancePercentage: number;
  };
  overallRemarks: string;
}

export interface BatchResultsSummary {
  batchId: string;
  batchCode: string;
  batchName: string;
  semesterCode: SemesterCode;
  totalStudents: number;
  evaluatedStudents: number;
  batchAveragePercentage: number;
  batchAverageGpa: number;
  topScorePercentage: number;
  topScorerName: string;
  passingRatePercentage: number;
  distinctionCount: number; // >= 85%
  firstClassCount: number; // 70-84%
  secondClassCount: number; // 50-69%
  retestCount: number; // < 50%
}
