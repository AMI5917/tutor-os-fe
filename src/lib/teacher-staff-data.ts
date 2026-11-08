// src/lib/teacher-staff-data.ts
// LocalStorage mock data layer for Teacher & Staff management

import { NewTeacherStaff, TeacherStaff, EmploymentStatus } from "../types/teacher-staff";
export type { NewTeacherStaff };

const STORAGE_KEY = "tutoros_teacher_staff_v2";

/** Generate a UUID using crypto.randomUUID if available, otherwise a simple fallback. */
function generateUuid(): string {
  if (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function") {
    return (crypto as any).randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Retrieve the stored teacher/staff list from localStorage. */
export function getStoredTeacherStaff(): TeacherStaff[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

/** Persist the teacher/staff list to localStorage. */
export function setStoredTeacherStaff(staff: TeacherStaff[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(staff));
}

/** Generate a new employee ID. */
export function generateEmployeeId(): string {
  return "EMP-" + generateUuid().slice(0, 8);
}

/** Create a new teacher/staff record and store it. */
export function createTeacherStaff(data: NewTeacherStaff): TeacherStaff {
  const staff: TeacherStaff = {
    employeeId: generateEmployeeId(),
    status: EmploymentStatus.ACTIVE,
    ...data,
  };
  const list = getStoredTeacherStaff();
  list.push(staff);
  setStoredTeacherStaff(list);
  return staff;
}

/** Update an existing record (partial) identified by employeeId. */
export function updateTeacherStaff(updated: Partial<TeacherStaff> & { employeeId: string }) {
  const list = getStoredTeacherStaff();
  const idx = list.findIndex((s) => s.employeeId === updated.employeeId);
  if (idx === -1) return null;
  const staff = { ...list[idx], ...updated };
  list[idx] = staff;
  setStoredTeacherStaff(list);
  return staff;
}

/** Seed mock data if storage is empty. */
export function seedMockTeacherStaff() {
  if (typeof window === "undefined") return;
  if (getStoredTeacherStaff().length > 0) return;

  const mock: TeacherStaff[] = [
    // Current Academic Year: 2026-2027
    {
      employeeId: "EMP-101",
      fullName: "Dr. Sarah Jenkins",
      role: "TEACHER",
      designation: "Head of Mathematics & Science",
      department: "Mathematics",
      email: "sarah.jenkins@tutoros.edu",
      phone: "+91 98765 11001",
      joiningDate: "2021-06-01",
      academicYear: "2026-2027",
      status: EmploymentStatus.ACTIVE,
    },
    {
      employeeId: "EMP-102",
      fullName: "Prof. Amir Khan",
      role: "TEACHER",
      designation: "Senior Physics Faculty",
      department: "Physics",
      email: "amir.khan@tutoros.edu",
      phone: "+91 98765 11002",
      joiningDate: "2020-07-15",
      academicYear: "2026-2027",
      status: EmploymentStatus.ACTIVE,
    },
    {
      employeeId: "EMP-103",
      fullName: "Amit Sharma",
      role: "TEACHER",
      designation: "Senior Mathematics Lecturer",
      department: "Mathematics",
      email: "amit.sharma@tutoros.edu",
      phone: "+91 98765 43210",
      joiningDate: "2022-04-10",
      academicYear: "2026-2027",
      status: EmploymentStatus.ACTIVE,
    },
    {
      employeeId: "EMP-104",
      fullName: "Neha Patel",
      role: "TEACHER",
      designation: "Faculty for Chem & Bio",
      department: "Chemistry",
      email: "neha.patel@tutoros.edu",
      phone: "+91 98123 45678",
      joiningDate: "2023-01-05",
      academicYear: "2026-2027",
      status: EmploymentStatus.ACTIVE,
    },
    {
      employeeId: "EMP-106",
      fullName: "Pooja Verma",
      role: "STAFF",
      designation: "Academic Counselor & Registrar",
      department: "Administration",
      email: "pooja.verma@tutoros.edu",
      phone: "+91 98222 33445",
      joiningDate: "2022-09-01",
      academicYear: "2026-2027",
      status: EmploymentStatus.ACTIVE,
    },

    // Previous Academic Year: 2025-2026
    {
      employeeId: "EMP-105",
      fullName: "Dr. Robert Lang",
      role: "TEACHER",
      designation: "Computer Science & Logic",
      department: "Computer Science",
      email: "robert.lang@tutoros.edu",
      phone: "+91 98444 55667",
      joiningDate: "2021-03-20",
      academicYear: "2025-2026",
      status: EmploymentStatus.ACTIVE,
    },
    {
      employeeId: "EMP-107",
      fullName: "Rajesh Gupta",
      role: "STAFF",
      designation: "Finance & Operations Lead",
      department: "Finance",
      email: "rajesh.gupta@tutoros.edu",
      phone: "+91 98111 22339",
      joiningDate: "2021-11-12",
      academicYear: "2025-2026",
      status: EmploymentStatus.ACTIVE,
    },

    // Historical Academic Year: 2024-2025
    {
      employeeId: "EMP-108",
      fullName: "Alice Johnson",
      role: "TEACHER",
      designation: "Junior Math Tutor",
      department: "Mathematics",
      email: "alice.johnson@tutoros.edu",
      phone: "555-1234",
      joiningDate: "2022-08-01",
      academicYear: "2024-2025",
      status: EmploymentStatus.INACTIVE,
    },
    {
      employeeId: "EMP-109",
      fullName: "Bob Smith",
      role: "STAFF",
      designation: "Administrative Assistant",
      department: "Administration",
      email: "bob.smith@tutoros.edu",
      phone: "555-5678",
      joiningDate: "2020-01-15",
      academicYear: "2024-2025",
      status: EmploymentStatus.INACTIVE,
    },
  ];

  setStoredTeacherStaff(mock);
}
