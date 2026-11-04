// src/types/student-directory.ts

export type StudentStatus = "ACTIVE" | "INACTIVE" | "GRADUATED" | "SUSPENDED";

export type EnrollmentMode = "FULL_BUNDLE" | "MODULAR";

export interface EnrolledSubject {
  id: string;
  subjectCode: string;
  subjectName: string;
  teacherName: string;
  scheduleDays: string;
  monthlyFee: number;
}

export interface StudentGuardian {
  name: string;
  relationship: "Father" | "Mother" | "Guardian" | "Other";
  phone: string;
  email: string;
  occupation?: string;
  altPhone?: string;
}

export interface StudentAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface StudentDocument {
  id: string;
  name: string;
  type: "ID_PROOF" | "BIRTH_CERTIFICATE" | "PREVIOUS_MARKSHEET" | "TRANSFER_CERTIFICATE" | "OTHER";
  fileName: string;
  fileSize?: string;
  uploadedAt: string;
  status: "VERIFIED" | "PENDING" | "REJECTED";
}

export interface EnrollmentHistoryItem {
  id: string;
  date: string;
  event: string;
  notes?: string;
  performedBy?: string;
}

export interface DirectoryStudent {
  id: string; // Internal ID: e.g. "stud_1"
  studentId: string; // Institutional ID: e.g. "TOS-2026-001"
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  avatarUrl?: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: "Male" | "Female" | "Other";
  email: string;
  phone: string;
  standard: string; // e.g. "10th"
  gradeLevel: string; // e.g. "Grade 10"
  academicYear: string; // e.g. "2026-2027", "2025-2026"
  batchId: string;
  batchCode: string;
  batchName: string;
  enrollmentMode: EnrollmentMode;
  enrolledSubjects: EnrolledSubject[];
  monthlyFee: number; // In INR (₹)
  status: StudentStatus;
  guardian: StudentGuardian;
  address: StudentAddress;
  documents: StudentDocument[];
  enrollmentHistory: EnrollmentHistoryItem[];
  registrationDate: string;
  notes?: string;
}

export interface AvailableSubject {
  code: string;
  name: string;
  facultyTeacher: string;
  scheduleDays: string;
  defaultMonthlyFee: number;
  description: string;
}

export interface RegisterStudentPayload {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: "Male" | "Female" | "Other";
  email: string;
  phone: string;
  standard: string;
  academicYear: string;
  batchId: string;
  enrollmentMode: EnrollmentMode;
  subjectCodes: string[];
  monthlyFee: number;
  guardian: StudentGuardian;
  address: StudentAddress;
  avatarUrl?: string;
  documents?: { name: string; type: StudentDocument["type"]; fileName: string }[];
  notes?: string;
}
