// src/types/teacher-staff.ts

export enum RoleType {
  TEACHER = "TEACHER",
  STAFF = "STAFF",
}

export enum EmploymentStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

/** Fields required when creating a new teacher or staff member. */
export interface NewTeacherStaff {
  fullName: string;
  role: RoleType | string; // allow string for simplicity
  designation: string;
  department: string;
  email: string;
  phone?: string;
  joiningDate: string; // ISO date string
  academicYear: string;
}

/** Complete record stored in localStorage. */
export interface TeacherStaff extends NewTeacherStaff {
  employeeId: string;
  status: EmploymentStatus;
}
