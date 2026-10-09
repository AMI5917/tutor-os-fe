// src/lib/mock-data.ts
import { KpiStats, TodaySession, RecentActivity, BatchItem, Teacher, Student } from "@/types/roles";

export const MOCK_BATCHES: BatchItem[] = [
  {
    id: "bat_1",
    code: "MATH-10A",
    name: "Grade 10 Advanced Mathematics",
    subject: "Mathematics",
    teacherName: "Dr. Sarah Jenkins",
    enrolledStudents: 18,
    capacity: 20,
    scheduleDays: "Mon, Wed, Fri",
    time: "04:30 PM - 05:45 PM",
    monthlyFee: 1800,
  },
  {
    id: "bat_2",
    code: "PHY-12B",
    name: "AP Physics Mechanics & Waves",
    subject: "Physics",
    teacherName: "Prof. Amir",
    enrolledStudents: 14,
    capacity: 15,
    scheduleDays: "Tue, Thu",
    time: "06:00 PM - 07:15 PM",
    monthlyFee: 2000,
  },
  {
    id: "bat_3",
    code: "SCI-BUNDLE",
    name: "Grade 10 Full Science Stream (All Subjects)",
    subject: "Math + Physics + Chem + Bio",
    teacherName: "Multi-Faculty Team",
    enrolledStudents: 28,
    capacity: 30,
    scheduleDays: "Mon through Fri",
    time: "04:00 PM - 07:00 PM",
    monthlyFee: 4500,
  },
];

export const MOCK_TEACHERS: Teacher[] = [
  {
    id: "teach_1",
    firstName: "Amit",
    middleName: "K.",
    lastName: "Sharma",
    subjectSpecialization: "Mathematics",
    rateType: "Hourly",
    rateAmount: 500,
    mobileNumber: "+91 98765 43210",
    status: "ACTIVE",
  },
  {
    id: "teach_2",
    firstName: "Neha",
    lastName: "Patel",
    subjectSpecialization: "Physics",
    rateType: "Weekly",
    rateAmount: 1500,
    mobileNumber: "+91 98123 45678",
    status: "ACTIVE",
  },
];

// Mock student data with Rupee fees and realistic statuses
export const MOCK_STUDENTS: Student[] = [
  {
    id: "stud_1",
    firstName: "Alex",
    middleName: "",
    lastName: "Rivera",
    parentPhone: "+1 (555) 234-5678",
    standard: "10th",
    enrollmentType: "SPECIFIC",
    subjects: ["Mathematics", "Physics"],
    fee: 3200,
    status: "ACTIVE",
    paymentStatus: "PAID",
  },
  {
    id: "stud_2",
    firstName: "Sophia",
    middleName: "",
    lastName: "Zhang",
    parentPhone: "+1 (555) 876-5432",
    standard: "11th",
    enrollmentType: "ALL",
    subjects: [],
    fee: 4500,
    status: "ACTIVE",
    paymentStatus: "PENDING",
  },
  {
    id: "stud_3",
    firstName: "Liam",
    middleName: "",
    lastName: "Miller",
    parentPhone: "+1 (555) 998-1122",
    standard: "10th",
    enrollmentType: "SPECIFIC",
    subjects: ["Mathematics"],
    fee: 1800,
    status: "ACTIVE",
    paymentStatus: "PENDING",
  },
  {
    id: "stud_4",
    firstName: "Aarav",
    middleName: "",
    lastName: "Sharma",
    parentPhone: "+91 98765 12340",
    standard: "9th",
    enrollmentType: "ALL",
    subjects: [],
    fee: 4000,
    status: "ACTIVE",
    paymentStatus: "PAID",
  },
  {
    id: "stud_5",
    firstName: "Priya",
    middleName: "K.",
    lastName: "Patel",
    parentPhone: "+91 98123 78901",
    standard: "10th",
    enrollmentType: "SPECIFIC",
    subjects: ["Physics", "Chemistry"],
    fee: 3000,
    status: "ACTIVE",
    paymentStatus: "PAID",
  },
  {
    id: "stud_6",
    firstName: "Rohan",
    middleName: "",
    lastName: "Verma",
    parentPhone: "+91 98456 34567",
    standard: "12th",
    enrollmentType: "ALL",
    subjects: [],
    fee: 5000,
    status: "ACTIVE",
    paymentStatus: "PENDING",
  },
];

// Dynamic KPI generator based on students and batches
export const getKpiStats = (students: Student[] = MOCK_STUDENTS): KpiStats => {
  const activeStudents = students.filter((s) => s.status === "ACTIVE");
  const totalStudents = activeStudents.length;
  const paidStudents = activeStudents.filter((s) => s.paymentStatus === "PAID");
  const pendingStudents = activeStudents.filter((s) => s.paymentStatus === "PENDING");

  const monthlyEarnings = paidStudents.reduce((sum, s) => sum + s.fee, 0);
  const pendingDues = pendingStudents.reduce((sum, s) => sum + s.fee, 0);
  const pendingDuesCount = pendingStudents.length;
  const targetEarnings = monthlyEarnings + pendingDues;

  return {
    totalStudents,
    studentGrowthPct: 14.2,
    activeBatches: MOCK_BATCHES.length,
    monthlyEarnings,
    targetEarnings: targetEarnings || 25000,
    earningsGrowthPct: 18.5,
    todayClasses: 5,
    completedTodayClasses: 2,
    pendingDues,
    pendingDuesCount,
  };
};

export const MOCK_KPIS: KpiStats = getKpiStats(MOCK_STUDENTS);

export const MOCK_TODAY_SESSIONS: TodaySession[] = [
  {
    id: "sess_1",
    batchCode: "MATH-10A",
    batchName: "Grade 10 Calculus & Trigonometry",
    subject: "Mathematics",
    teacherName: "Dr. Sarah Jenkins",
    timeSlot: "04:30 PM - 05:45 PM",
    roomOrPlatform: "Room 101 (Offline)",
    status: "COMPLETED",
    studentCount: 18,
  },
  {
    id: "sess_2",
    batchCode: "PHY-12B",
    batchName: "AP Physics Mechanics Cohort",
    subject: "Physics",
    teacherName: "Prof. Amir",
    timeSlot: "06:00 PM - 07:15 PM",
    roomOrPlatform: "Google Meet",
    meetingLink: "https://meet.google.com/abc-tutor-os",
    status: "IN_PROGRESS",
    studentCount: 14,
  },
  {
    id: "sess_3",
    batchCode: "CHEM-11M",
    batchName: "Grade 11 Organic Chemistry (Modular)",
    subject: "Chemistry",
    teacherName: "Dr. Elena Rostova",
    timeSlot: "07:30 PM - 08:30 PM",
    roomOrPlatform: "Zoom Classroom",
    meetingLink: "https://zoom.us/j/987654321",
    status: "UPCOMING",
    studentCount: 12,
  },
  {
    id: "sess_4",
    batchCode: "SAT-ENG",
    batchName: "SAT Verbal & Reading Intensive",
    subject: "English SAT",
    teacherName: "Marcus Vance",
    timeSlot: "08:45 PM - 09:45 PM",
    roomOrPlatform: "Zoom Classroom",
    meetingLink: "https://zoom.us/j/123456789",
    status: "UPCOMING",
    studentCount: 20,
  },
];

export const MOCK_RECENT_ACTIVITIES: RecentActivity[] = [
  {
    id: "act_1",
    type: "PAYMENT",
    title: "Tuition Fee Received",
    description: "Alex Rivera paid for Grade 10 Math & Physics (Modular)",
    timeAgo: "12 mins ago",
    amount: 3200,
    statusBadge: "PAID",
    statusVariant: "success",
  },
  {
    id: "act_2",
    type: "ATTENDANCE",
    title: "Attendance Logged",
    description: "Dr. Sarah Jenkins marked 17/18 present in [MATH-10A]",
    timeAgo: "45 mins ago",
    statusBadge: "COMPLETED",
    statusVariant: "default",
  },
  {
    id: "act_3",
    type: "ENROLLMENT",
    title: "New Student Enrolled",
    description: "Sophia Zhang joined [SAT-ENG] Full Prep Bundle",
    timeAgo: "2 hours ago",
    statusBadge: "ENROLLED",
    statusVariant: "default",
  },
  {
    id: "act_4",
    type: "PAYMENT",
    title: "Overdue Reminder Sent",
    description: "Automated WhatsApp alert sent to parent of Liam Miller",
    timeAgo: "3 hours ago",
    amount: 1800,
    statusBadge: "PENDING",
    statusVariant: "warning",
  },
  {
    id: "act_5",
    type: "EXAM",
    title: "Semester 1 Results Published",
    description: "Mid-Term Physics Exam results published to 14 students",
    timeAgo: "5 hours ago",
    statusBadge: "PUBLISHED",
    statusVariant: "success",
  },
];
