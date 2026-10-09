export type UserRole = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  academyName: string;
  title?: string;
}

export interface KpiStats {
  totalStudents: number;
  studentGrowthPct: number;
  activeBatches: number;
  monthlyEarnings: number;
  targetEarnings: number;
  earningsGrowthPct: number;
  todayClasses: number;
  completedTodayClasses: number;
  pendingDues: number;
  pendingDuesCount: number;
}

export type ClassSessionStatus = "UPCOMING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface TodaySession {
  id: string;
  batchCode: string;
  batchName: string;
  subject: string;
  teacherName: string;
  timeSlot: string;
  roomOrPlatform: string;
  meetingLink?: string;
  status: ClassSessionStatus;
  studentCount: number;
}

export type ActivityType = "PAYMENT" | "ATTENDANCE" | "ENROLLMENT" | "EXAM";

export interface RecentActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timeAgo: string;
  amount?: number;
  statusBadge?: string;
  statusVariant?: "success" | "warning" | "destructive" | "default";
}

export interface BatchItem {
  id: string;
  code: string;
  name: string;
  subject: string;
  teacherName: string;
  enrolledStudents: number;
  capacity: number;
  scheduleDays: string;
  time: string;
  monthlyFee: number;
}

// New types for Teacher management
export type RateType = "Hourly" | "Per Session" | "Weekly" | "Monthly";

export interface Teacher {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  subjectSpecialization: string;
  rateType: RateType;
  rateAmount: number; // stored in Rupees (or local currency)
  mobileNumber: string;
  status: "ACTIVE" | "INACTIVE";
}
// -------------------------------------------------
// Student management types (newly added)
// -------------------------------------------------
export type EnrollmentType = "ALL" | "SPECIFIC";

export interface Student {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  parentPhone: string;
  standard: string; // e.g., "1st" … "10th"
  enrollmentType: EnrollmentType;
  subjects: string[]; // empty when enrollmentType === "ALL"
  fee: number; // Reupess
  status: "ACTIVE" | "INACTIVE";
  paymentStatus: "PAID" | "PENDING"; // added for billing page
}

// End of file
