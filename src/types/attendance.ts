// src/types/attendance.ts
import { Student } from "./roles";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

export interface AttendanceRecord {
  id: string;
  studentId: string;
  batchId: string;
  date: string; // ISO date string: YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string;
  markedAt: string; // ISO timestamp
}

export interface MonthlyAttendanceSummary {
  month: string; // e.g. "2026-10"
  monthName: string; // e.g. "October 2026"
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendancePercentage: number; // 0 - 100
}

export interface MonthStat {
  month: string;
  monthName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  percentage: number;
}

export interface YearlyAttendanceSummary {
  academicYear: string; // e.g. "2026-2027"
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendancePercentage: number;
  monthlyBreakdown: MonthStat[];
}

export interface StudentAttendanceProfile {
  student: Student;
  batchId: string;
  monthlySummary: MonthlyAttendanceSummary;
  yearlySummary: YearlyAttendanceSummary;
  recentRecords: AttendanceRecord[];
}
