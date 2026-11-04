// src/lib/supabase-data.ts
// Data access layer - bridges mock data types with Supabase
import { supabase } from "./supabase-client";
import {
  MOCK_BATCHES,
  MOCK_TEACHERS,
  MOCK_STUDENTS,
  MOCK_TODAY_SESSIONS,
  MOCK_RECENT_ACTIVITIES,
  MOCK_KPIS,
} from "./mock-data";
import {
  BatchItem,
  Teacher,
  Student,
  TodaySession,
  RecentActivity,
  KpiStats,
} from "@/types/roles";

// Helper to get all batches from Supabase
export async function getBatchesFromSupabase(): Promise<BatchItem[]> {
  try {
    const { data, error } = await supabase
      .from("batches")
      .select("*, subjects(name, code), teachers(first_name, last_name)")
      .eq("status", "ACTIVE");

    if (error || !data || data.length === 0) {
      return MOCK_BATCHES;
    }

    return data.map((b: any) => ({
      id: b.id,
      code: b.subjects?.code || "N/A",
      name: b.name,
      subject: b.subjects?.name || "General",
      teacherName: `${b.teachers?.first_name || ""} ${b.teachers?.last_name || ""}`.trim() || "Unassigned",
      enrolledStudents: 0,
      capacity: b.max_capacity || 20,
      scheduleDays: "Mon, Wed, Fri",
      time: "04:30 PM - 05:45 PM",
      monthlyFee: b.subjects?.default_monthly_fee || 0,
    }));
  } catch {
    return MOCK_BATCHES;
  }
}

// Helper to get all teachers from Supabase
export async function getTeachersFromSupabase(): Promise<Teacher[]> {
  try {
    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .eq("status", "ACTIVE");

    if (error || !data || data.length === 0) {
      return MOCK_TEACHERS;
    }

    return data.map((t: any) => ({
      id: t.id,
      firstName: t.first_name,
      middleName: t.middle_name,
      lastName: t.last_name,
      subjectSpecialization: t.subject_specialization,
      rateType: t.rate_type || "Hourly",
      rateAmount: t.rate_amount || 0,
      mobileNumber: t.mobile_number || "",
      status: t.status,
    }));
  } catch {
    return MOCK_TEACHERS;
  }
}

// Helper to get all students from Supabase
export async function getStudentsFromSupabase(): Promise<Student[]> {
  try {
    const { data, error } = await supabase
      .from("students")
      .select("*, users(full_name, email, phone)")
      .eq("status", "ACTIVE");

    if (error || !data || data.length === 0) {
      return MOCK_STUDENTS;
    }

    return data.map((s: any) => ({
      id: s.id,
      firstName: s.first_name,
      middleName: s.middle_name,
      lastName: s.last_name,
      parentPhone: s.guardian_phone || "",
      standard: s.grade_level || "10th",
      enrollmentType: "SPECIFIC",
      subjects: [],
      fee: 0,
      status: "ACTIVE",
      paymentStatus: "PENDING",
    }));
  } catch {
    return MOCK_STUDENTS;
  }
}

// Helper to get today sessions from Supabase
export async function getTodaySessionsFromSupabase(): Promise<TodaySession[]> {
  try {
    const { data, error } = await supabase
      .from("class_sessions")
      .select("*, batches(name, subjects(name, code)), teachers(first_name, last_name)")
      .gte("start_time", new Date().toISOString());

    if (error || !data || data.length === 0) {
      return MOCK_TODAY_SESSIONS;
    }

    return data.map((s: any) => ({
      id: s.id,
      batchCode: s.batches?.subjects?.code || "N/A",
      batchName: s.batches?.name || "Unknown",
      subject: s.batches?.subjects?.name || "General",
      teacherName: `${s.teachers?.first_name || ""} ${s.teachers?.last_name || ""}`.trim(),
      timeSlot: "04:30 PM - 05:45 PM",
      roomOrPlatform: "Online",
      status: s.status || "SCHEDULED",
      studentCount: 0,
    }));
  } catch {
    return MOCK_TODAY_SESSIONS;
  }
}

// Export mock data as fallback
export {
  MOCK_BATCHES,
  MOCK_TEACHERS,
  MOCK_STUDENTS,
  MOCK_TODAY_SESSIONS,
  MOCK_RECENT_ACTIVITIES,
  MOCK_KPIS,
};

export async function getKpiStats(): Promise<KpiStats> {
  const students = await getStudentsFromSupabase();
  return MOCK_KPIS;
}
