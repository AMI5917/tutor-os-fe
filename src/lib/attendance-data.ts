// src/lib/attendance-data.ts
import { AttendanceRecord, AttendanceStatus, MonthlyAttendanceSummary, YearlyAttendanceSummary, MonthStat } from "@/types/attendance";
import { MOCK_STUDENTS, MOCK_BATCHES } from "./mock-data";

export const ACADEMIC_YEARS = ["2026-2027", "2025-2026"] as const;
export type AcademicYear = (typeof ACADEMIC_YEARS)[number];

export interface MonthOption {
  value: string; // YYYY-MM
  label: string;
  year: AcademicYear;
  workingDays: number;
}

export const MONTH_OPTIONS: MonthOption[] = [
  // 2026-2027
  { value: "2026-10", label: "October 2026", year: "2026-2027", workingDays: 22 },
  { value: "2026-09", label: "September 2026", year: "2026-2027", workingDays: 21 },
  { value: "2026-08", label: "August 2026", year: "2026-2027", workingDays: 20 },
  { value: "2026-07", label: "July 2026", year: "2026-2027", workingDays: 22 },
  // 2025-2026
  { value: "2026-03", label: "March 2026", year: "2025-2026", workingDays: 22 },
  { value: "2026-02", label: "February 2026", year: "2025-2026", workingDays: 19 },
  { value: "2026-01", label: "January 2026", year: "2025-2026", workingDays: 21 },
  { value: "2025-12", label: "December 2025", year: "2025-2026", workingDays: 20 },
  { value: "2025-11", label: "November 2025", year: "2025-2026", workingDays: 21 },
  { value: "2025-10", label: "October 2025", year: "2025-2026", workingDays: 22 },
];

/**
 * Deterministic generator for initial mock records so every student has realistic,
 * consistent attendance across dates.
 */
function generateInitialRecords(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];

  // Deterministic seed helper
  const pseudoRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const datesToGenerate: { date: string; month: string }[] = [];

  // Generate working days for Oct 2026 (days 1 to 25)
  for (let day = 1; day <= 25; day++) {
    const dStr = day < 10 ? `0${day}` : `${day}`;
    // skip Sundays (simulate 6-day or 5-day week)
    const dayOfWeek = (day + 3) % 7; // rough day of week
    if (dayOfWeek !== 0) {
      datesToGenerate.push({ date: `2026-10-${dStr}`, month: "2026-10" });
    }
  }

  // Generate working days for Sep 2026
  for (let day = 1; day <= 28; day += 2) {
    const dStr = day < 10 ? `0${day}` : `${day}`;
    datesToGenerate.push({ date: `2026-09-${dStr}`, month: "2026-09" });
  }

  // Generate working days for Aug 2026
  for (let day = 2; day <= 28; day += 2) {
    const dStr = day < 10 ? `0${day}` : `${day}`;
    datesToGenerate.push({ date: `2026-08-${dStr}`, month: "2026-08" });
  }

  // Generate some days for 2025-2026 academic year
  for (let day = 1; day <= 20; day += 3) {
    const dStr = day < 10 ? `0${day}` : `${day}`;
    datesToGenerate.push({ date: `2026-03-${dStr}`, month: "2026-03" });
    datesToGenerate.push({ date: `2026-02-${dStr}`, month: "2026-02" });
    datesToGenerate.push({ date: `2026-01-${dStr}`, month: "2026-01" });
  }

  let idCounter = 1;

  MOCK_STUDENTS.forEach((student, sIdx) => {
    const batchId = student.batchId || "bat_1";

    datesToGenerate.forEach((dItem, dIdx) => {
      const rand = pseudoRandom((sIdx + 1) * 73 + (dIdx + 1) * 31);
      let status: AttendanceStatus = "PRESENT";
      let remarks: string | undefined = undefined;

      // Realistic distribution: ~85% present, ~10% absent, ~5% late
      if (rand < 0.1) {
        status = "ABSENT";
        remarks = rand < 0.05 ? "Sick leave (reported by parent)" : "Unannounced absence";
      } else if (rand < 0.17) {
        status = "LATE";
        remarks = "Arrived 15 mins late due to transport delay";
      }

      records.push({
        id: `att_${idCounter++}`,
        studentId: student.id,
        batchId,
        date: dItem.date,
        status,
        remarks,
        markedAt: `${dItem.date}T09:15:00.000Z`,
      });
    });
  });

  return records;
}

export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = generateInitialRecords();

const STORAGE_KEY = "tutor_os_attendance_records_v1";

/**
 * Retrieve saved attendance records from localStorage (with fallback to mock data)
 */
export function getStoredAttendanceRecords(): AttendanceRecord[] {
  if (typeof window === "undefined") {
    return INITIAL_ATTENDANCE_RECORDS;
  }
  try {
    const item = window.localStorage.getItem(STORAGE_KEY);
    if (!item) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ATTENDANCE_RECORDS));
      return INITIAL_ATTENDANCE_RECORDS;
    }
    const parsed = JSON.parse(item);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_ATTENDANCE_RECORDS;
  } catch (err) {
    console.error("Error reading attendance from localStorage:", err);
    return INITIAL_ATTENDANCE_RECORDS;
  }
}

/**
 * Save updated attendance records to localStorage
 */
export function saveStoredAttendanceRecords(records: AttendanceRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error("Error writing attendance to localStorage:", err);
  }
}

/**
 * Upsert daily attendance marks for a specific batch and date
 */
export function upsertDailyAttendance(
  batchId: string,
  date: string,
  entries: { studentId: string; status: AttendanceStatus; remarks?: string }[],
  existingRecords: AttendanceRecord[]
): AttendanceRecord[] {
  const updated = [...existingRecords];

  entries.forEach((entry) => {
    const existingIdx = updated.findIndex(
      (r) => r.studentId === entry.studentId && r.date === date
    );

    if (existingIdx >= 0) {
      updated[existingIdx] = {
        ...updated[existingIdx],
        status: entry.status,
        remarks: entry.remarks || updated[existingIdx].remarks,
        markedAt: new Date().toISOString(),
      };
    } else {
      updated.push({
        id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        studentId: entry.studentId,
        batchId,
        date,
        status: entry.status,
        remarks: entry.remarks,
        markedAt: new Date().toISOString(),
      });
    }
  });

  saveStoredAttendanceRecords(updated);
  return updated;
}

/**
 * Compute monthly attendance summary for a student
 */
export function calculateStudentMonthlySummary(
  studentId: string,
  monthValue: string, // YYYY-MM
  records: AttendanceRecord[]
): MonthlyAttendanceSummary {
  const monthOpt = MONTH_OPTIONS.find((m) => m.value === monthValue);
  const totalWorkingDays = monthOpt ? monthOpt.workingDays : 20;

  const monthRecords = records.filter(
    (r) => r.studentId === studentId && r.date.startsWith(monthValue)
  );

  const presentDays = monthRecords.filter((r) => r.status === "PRESENT").length;
  const absentDays = monthRecords.filter((r) => r.status === "ABSENT").length;
  const lateDays = monthRecords.filter((r) => r.status === "LATE").length;

  // Working days recorded or official total
  const recordedDays = presentDays + absentDays + lateDays;
  const effectiveTotal = Math.max(totalWorkingDays, recordedDays || 1);

  // Present counts as 1.0, Late counts as 1.0 attendance presence (or 0.5 depending on policy; typically Present + Late = attended)
  const attendedDays = presentDays + lateDays;
  const attendancePercentage = Math.min(100, Math.round((attendedDays / effectiveTotal) * 100));

  return {
    month: monthValue,
    monthName: monthOpt ? monthOpt.label : monthValue,
    totalWorkingDays: effectiveTotal,
    presentDays,
    absentDays,
    lateDays,
    attendancePercentage,
  };
}

/**
 * Compute academic year attendance summary for a student
 */
export function calculateStudentYearlySummary(
  studentId: string,
  academicYear: AcademicYear,
  records: AttendanceRecord[]
): YearlyAttendanceSummary {
  const yearMonths = MONTH_OPTIONS.filter((m) => m.year === academicYear);

  let totalWorkingDays = 0;
  let presentDays = 0;
  let absentDays = 0;
  let lateDays = 0;

  const monthlyBreakdown: MonthStat[] = yearMonths.map((m) => {
    const summary = calculateStudentMonthlySummary(studentId, m.value, records);
    totalWorkingDays += summary.totalWorkingDays;
    presentDays += summary.presentDays;
    absentDays += summary.absentDays;
    lateDays += summary.lateDays;

    return {
      month: m.value,
      monthName: m.label,
      totalDays: summary.totalWorkingDays,
      presentDays: summary.presentDays,
      absentDays: summary.absentDays,
      lateDays: summary.lateDays,
      percentage: summary.attendancePercentage,
    };
  });

  const totalEffective = totalWorkingDays || 1;
  const totalAttended = presentDays + lateDays;
  const attendancePercentage = Math.min(100, Math.round((totalAttended / totalEffective) * 100));

  return {
    academicYear,
    totalWorkingDays,
    presentDays,
    absentDays,
    lateDays,
    attendancePercentage,
    monthlyBreakdown,
  };
}
