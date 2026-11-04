// src/lib/student-directory-data.ts

import {
  DirectoryStudent,
  EnrolledSubject,
  AvailableSubject,
  RegisterStudentPayload,
  StudentStatus,
  EnrollmentMode,
  StudentDocument,
} from "@/types/student-directory";
import { MOCK_STUDENTS, MOCK_BATCHES } from "@/lib/mock-data";

const STORAGE_KEY = "tutoros_student_directory_v2";

export const ACADEMIC_YEAR_OPTIONS = [
  { value: "2026-2027", label: "2026-2027 (Current Active)" },
  { value: "2025-2026", label: "2025-2026 (Previous Year)" },
  { value: "2024-2025", label: "2024-2025 (Archived Alumni)" },
] as const;

export const AVAILABLE_SUBJECTS: AvailableSubject[] = [
  {
    code: "MATH",
    name: "Mathematics",
    facultyTeacher: "Dr. Sarah Jenkins",
    scheduleDays: "Mon, Wed, Fri (04:30 PM - 05:45 PM)",
    defaultMonthlyFee: 1800,
    description: "Calculus, Advanced Algebra, Coordinate Geometry & Trigonometry.",
  },
  {
    code: "PHYS",
    name: "Physics",
    facultyTeacher: "Prof. Amir",
    scheduleDays: "Tue, Thu (06:00 PM - 07:15 PM)",
    defaultMonthlyFee: 1600,
    description: "Classical Mechanics, Electromagnetism, Optics & Thermodynamics.",
  },
  {
    code: "CHEM",
    name: "Chemistry",
    facultyTeacher: "Dr. Robert Chen",
    scheduleDays: "Mon, Wed (06:00 PM - 07:15 PM)",
    defaultMonthlyFee: 1500,
    description: "Organic Mechanisms, Periodic Trends, Stoichiometry & Chemical Bonding.",
  },
  {
    code: "BIOL",
    name: "Biology",
    facultyTeacher: "Dr. Priya Nair",
    scheduleDays: "Tue, Fri (04:30 PM - 05:45 PM)",
    defaultMonthlyFee: 1500,
    description: "Cell Biology, Human Physiology, Genetics & Molecular Ecology.",
  },
  {
    code: "COMP",
    name: "Computer Science",
    facultyTeacher: "Prof. Vikram Rao",
    scheduleDays: "Sat (10:00 AM - 12:30 PM)",
    defaultMonthlyFee: 1400,
    description: "Data Structures, Python & JavaScript Core, Object-Oriented Design.",
  },
  {
    code: "ENGL",
    name: "English Literature",
    facultyTeacher: "Ms. Ananya Roy",
    scheduleDays: "Sun (10:00 AM - 12:00 PM)",
    defaultMonthlyFee: 1200,
    description: "Advanced Reading Comprehension, Rhetoric & Creative Essay Writing.",
  },
];

// Helper to map subject codes to full EnrolledSubject objects
export function mapSubjects(subjectCodes: string[]): EnrolledSubject[] {
  return subjectCodes.map((code) => {
    const found = AVAILABLE_SUBJECTS.find((s) => s.code === code || s.name.toLowerCase() === code.toLowerCase());
    if (found) {
      return {
        id: `subj_${found.code}`,
        subjectCode: found.code,
        subjectName: found.name,
        teacherName: found.facultyTeacher,
        scheduleDays: found.scheduleDays,
        monthlyFee: found.defaultMonthlyFee,
      };
    }
    return {
      id: `subj_${code.toLowerCase().replace(/\s+/g, "_")}`,
      subjectCode: code.substring(0, 4).toUpperCase(),
      subjectName: code,
      teacherName: "Faculty Team",
      scheduleDays: "Mon, Wed",
      monthlyFee: 1500,
    };
  });
}

/**
 * Seed initial students by enriching MOCK_STUDENTS with complete profiles
 */
export function generateInitialDirectoryStudents(): DirectoryStudent[] {
  const initialList: DirectoryStudent[] = [];

  // 1. Current Active Cohort (2026-2027) from MOCK_STUDENTS
  MOCK_STUDENTS.forEach((student, idx) => {
    const batch = MOCK_BATCHES.find((b) => b.id === student.batchId) || {
      id: student.batchId || "bat_1",
      code: student.batchCode || "MATH-10A",
      name: "Grade 10 Advanced Mathematics",
    };

    const seq = String(idx + 1).padStart(3, "0");
    const studentId = `TOS-2026-${seq}`;
    const fullName = `${student.firstName} ${student.lastName}`.trim();

    // Map subjects
    let subjectCodes = student.subjects.length > 0 ? student.subjects : ["Mathematics"];
    if (student.enrollmentType === "ALL") {
      subjectCodes = ["Mathematics", "Physics", "Chemistry", "Biology"];
    }
    const enrolledSubjects = mapSubjects(subjectCodes);

    const initialDocs: StudentDocument[] = [
      {
        id: `doc_${student.id}_1`,
        name: "Birth Certificate",
        type: "BIRTH_CERTIFICATE",
        fileName: `${student.firstName.toLowerCase()}_birth_certificate.pdf`,
        fileSize: "1.2 MB",
        uploadedAt: "2026-06-15",
        status: "VERIFIED",
      },
      {
        id: `doc_${student.id}_2`,
        name: "Previous Grade Marksheet",
        type: "PREVIOUS_MARKSHEET",
        fileName: `${student.firstName.toLowerCase()}_9th_marksheet.pdf`,
        fileSize: "2.4 MB",
        uploadedAt: "2026-06-18",
        status: "VERIFIED",
      },
      {
        id: `doc_${student.id}_3`,
        name: "Aadhar / Government ID",
        type: "ID_PROOF",
        fileName: `${student.firstName.toLowerCase()}_aadhar_id.pdf`,
        fileSize: "850 KB",
        uploadedAt: "2026-06-20",
        status: "VERIFIED",
      },
    ];

    initialList.push({
      id: student.id,
      studentId,
      firstName: student.firstName,
      middleName: student.middleName || "",
      lastName: student.lastName,
      fullName,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.firstName}`,
      dateOfBirth: `2010-0${(idx % 8) + 1}-1${idx + 2}`,
      gender: idx % 2 === 0 ? "Male" : "Female",
      email: `${student.firstName.toLowerCase()}.${student.lastName.toLowerCase()}@student.apex.edu`,
      phone: `+91 98${idx}34 ${idx}6780`,
      standard: student.standard.includes("th") ? student.standard : `${student.standard}th`,
      gradeLevel: student.standard.startsWith("Grade") ? student.standard : `Grade ${student.standard}`,
      academicYear: "2026-2027",
      batchId: batch.id,
      batchCode: batch.code,
      batchName: batch.name,
      enrollmentMode: student.enrollmentType === "ALL" ? "FULL_BUNDLE" : "MODULAR",
      enrolledSubjects,
      monthlyFee: student.fee || 3200,
      status: student.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
      guardian: {
        name: `${student.lastName} Senior`,
        relationship: idx % 2 === 0 ? "Father" : "Mother",
        phone: student.parentPhone || "+91 98234 56780",
        email: `parent.${student.lastName.toLowerCase()}@gmail.com`,
        occupation: idx % 3 === 0 ? "Software Engineer" : idx % 3 === 1 ? "Physician" : "Entrepreneur",
      },
      address: {
        street: `${100 + idx * 12}, Brigade Gateway Road, 4th Block`,
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560055",
      },
      documents: initialDocs,
      enrollmentHistory: [
        {
          id: `hist_${student.id}_1`,
          date: "2026-06-15",
          event: "Student Registration",
          notes: "Initial registration completed with primary documents verified.",
          performedBy: "Academic Admin (Amir)",
        },
        {
          id: `hist_${student.id}_2`,
          date: "2026-06-20",
          event: `Assigned to Batch ${batch.code}`,
          notes: `Enrolled in ${batch.name} for Academic Session 2026-2027.`,
          performedBy: "Class Coordinator",
        },
      ],
      registrationDate: "2026-06-15",
      notes: "Enrolled in standard coaching track. Consistent track record in unit tests.",
    });
  });

  // 2. Historical Previous Year Students (2025-2026)
  const previousYearStudents: DirectoryStudent[] = [
    {
      id: "hist_stud_101",
      studentId: "TOS-2025-045",
      firstName: "Dev",
      lastName: "Kapoor",
      fullName: "Dev Kapoor",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dev",
      dateOfBirth: "2009-04-12",
      gender: "Male",
      email: "dev.kapoor@alumni.apex.edu",
      phone: "+91 98451 22334",
      standard: "10th",
      gradeLevel: "Grade 10",
      academicYear: "2025-2026",
      batchId: "bat_1",
      batchCode: "MATH-10A",
      batchName: "Grade 10 Advanced Mathematics",
      enrollmentMode: "FULL_BUNDLE",
      enrolledSubjects: mapSubjects(["Mathematics", "Physics", "Chemistry"]),
      monthlyFee: 4200,
      status: "GRADUATED",
      guardian: {
        name: "Vikram Kapoor",
        relationship: "Father",
        phone: "+91 98451 99887",
        email: "vikram.kapoor@tata.com",
        occupation: "Financial Analyst",
      },
      address: {
        street: "42, Richmond Town Road",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560025",
      },
      documents: [
        {
          id: "doc_hist_1",
          name: "Graduation Certificate",
          type: "OTHER",
          fileName: "dev_kapoor_completion_cert.pdf",
          fileSize: "1.5 MB",
          uploadedAt: "2026-03-30",
          status: "VERIFIED",
        },
      ],
      enrollmentHistory: [
        {
          id: "hist_event_1",
          date: "2025-06-10",
          event: "Admitted to Academic Year 2025-2026",
          performedBy: "Academic Admin",
        },
        {
          id: "hist_event_2",
          date: "2026-03-31",
          event: "Successfully Completed Class 10 Board Examinations",
          performedBy: "Academy Director",
        },
      ],
      registrationDate: "2025-06-10",
      notes: "Scored 94.2% in CBSE Class 10 Board examinations. Excellent alumnus.",
    },
    {
      id: "hist_stud_102",
      studentId: "TOS-2025-046",
      firstName: "Meera",
      lastName: "Swaminathan",
      fullName: "Meera Swaminathan",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Meera",
      dateOfBirth: "2009-08-22",
      gender: "Female",
      email: "meera.swami@alumni.apex.edu",
      phone: "+91 98332 44556",
      standard: "10th",
      gradeLevel: "Grade 10",
      academicYear: "2025-2026",
      batchId: "bat_2",
      batchCode: "PHY-12B",
      batchName: "AP Physics Mechanics & Waves",
      enrollmentMode: "MODULAR",
      enrolledSubjects: mapSubjects(["Physics", "Mathematics"]),
      monthlyFee: 3400,
      status: "GRADUATED",
      guardian: {
        name: "S. Swaminathan",
        relationship: "Father",
        phone: "+91 98332 77889",
        email: "swami.meera.parent@gmail.com",
        occupation: "Chartered Accountant",
      },
      address: {
        street: "18, Malleshwaram 15th Cross",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560003",
      },
      documents: [],
      enrollmentHistory: [
        {
          id: "hist_event_3",
          date: "2025-06-15",
          event: "Admitted to AP Physics Cohort",
          performedBy: "Admin",
        },
      ],
      registrationDate: "2025-06-15",
      notes: "Distinction in AP Physics exam with 5/5 score.",
    },
  ];

  // 3. Archived Historical Students (2024-2025)
  const archivedStudents: DirectoryStudent[] = [
    {
      id: "hist_stud_201",
      studentId: "TOS-2024-012",
      firstName: "Kavya",
      lastName: "Rao",
      fullName: "Kavya Rao",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kavya",
      dateOfBirth: "2008-02-14",
      gender: "Female",
      email: "kavya.rao@alumni.apex.edu",
      phone: "+91 98221 66778",
      standard: "12th",
      gradeLevel: "Grade 12",
      academicYear: "2024-2025",
      batchId: "bat_1",
      batchCode: "MATH-10A",
      batchName: "Grade 10 Advanced Mathematics",
      enrollmentMode: "FULL_BUNDLE",
      enrolledSubjects: mapSubjects(["Mathematics", "Physics", "Chemistry"]),
      monthlyFee: 4500,
      status: "GRADUATED",
      guardian: {
        name: "N. K. Rao",
        relationship: "Father",
        phone: "+91 98221 99001",
        email: "nkrao@gmail.com",
      },
      address: {
        street: "77, Indiranagar 100ft Road",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560038",
      },
      documents: [],
      enrollmentHistory: [
        {
          id: "hist_event_4",
          date: "2024-06-01",
          event: "Archived after graduating Grade 12",
        },
      ],
      registrationDate: "2024-06-01",
      notes: "Admitted to IIT Madras (Computer Science Engineering).",
    },
  ];

  return [...initialList, ...previousYearStudents, ...archivedStudents];
}

/**
 * Get stored student directory records from localStorage or seed initial
 */
export function getStoredDirectoryStudents(): DirectoryStudent[] {
  if (typeof window === "undefined") {
    return generateInitialDirectoryStudents();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = generateInitialDirectoryStudents();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading student directory from storage:", err);
    return generateInitialDirectoryStudents();
  }
}

/**
 * Save directory students to localStorage
 */
export function persistDirectoryStudents(students: DirectoryStudent[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  } catch (err) {
    console.error("Error writing student directory to storage:", err);
  }
}

/**
 * Generate next unique student ID for a given academic year
 */
export function generateNextStudentId(academicYear: string = "2026-2027"): string {
  const students = getStoredDirectoryStudents();
  const yearCode = academicYear.split("-")[0] || "2026";
  const yearStudents = students.filter((s) => s.academicYear === academicYear);

  let maxSeq = 0;
  yearStudents.forEach((s) => {
    const match = s.studentId.match(/-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxSeq) maxSeq = num;
    }
  });

  const nextSeq = String(maxSeq + 1).padStart(3, "0");
  return `TOS-${yearCode}-${nextSeq}`;
}

/**
 * Register a new student
 */
export function registerNewStudent(payload: RegisterStudentPayload): DirectoryStudent {
  const students = getStoredDirectoryStudents();
  const studentId = generateNextStudentId(payload.academicYear);
  const newInternalId = `stud_${Date.now()}`;

  const batch = MOCK_BATCHES.find((b) => b.id === payload.batchId) || {
    id: payload.batchId,
    code: "CUSTOM-BATCH",
    name: "Custom Cohort",
  };

  const enrolledSubjects = mapSubjects(payload.subjectCodes);
  const fullName = [payload.firstName, payload.middleName, payload.lastName].filter(Boolean).join(" ");

  const docs: StudentDocument[] = (payload.documents || []).map((d, idx) => ({
    id: `doc_${newInternalId}_${idx + 1}`,
    name: d.name,
    type: d.type,
    fileName: d.fileName,
    fileSize: "1.5 MB",
    uploadedAt: new Date().toISOString().split("T")[0],
    status: "VERIFIED",
  }));

  const newStudent: DirectoryStudent = {
    id: newInternalId,
    studentId,
    firstName: payload.firstName,
    middleName: payload.middleName || "",
    lastName: payload.lastName,
    fullName,
    avatarUrl: payload.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${payload.firstName}`,
    dateOfBirth: payload.dateOfBirth,
    gender: payload.gender,
    email: payload.email,
    phone: payload.phone,
    standard: payload.standard,
    gradeLevel: payload.standard.startsWith("Grade") ? payload.standard : `Grade ${payload.standard}`,
    academicYear: payload.academicYear,
    batchId: batch.id,
    batchCode: batch.code,
    batchName: batch.name,
    enrollmentMode: payload.enrollmentMode,
    enrolledSubjects,
    monthlyFee: payload.monthlyFee,
    status: "ACTIVE",
    guardian: payload.guardian,
    address: payload.address,
    documents: docs,
    enrollmentHistory: [
      {
        id: `hist_${newInternalId}_1`,
        date: new Date().toISOString().split("T")[0],
        event: "Registered as New Student",
        notes: `Enrolled in ${batch.name} with ${enrolledSubjects.length} subjects.`,
        performedBy: "Academic Admin",
      },
    ],
    registrationDate: new Date().toISOString().split("T")[0],
    notes: payload.notes || "New student enrollment.",
  };

  const updatedList = [newStudent, ...students];
  persistDirectoryStudents(updatedList);
  return newStudent;
}

/**
 * Update student subject enrollment
 */
export function updateStudentSubjects(
  id: string,
  subjectCodes: string[],
  enrollmentMode: EnrollmentMode,
  customMonthlyFee?: number
): DirectoryStudent | null {
  const students = getStoredDirectoryStudents();
  const index = students.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const current = students[index];
  const newEnrolled = mapSubjects(subjectCodes);

  // Auto compute fee if not explicitly passed
  let calculatedFee = customMonthlyFee;
  if (calculatedFee === undefined) {
    if (enrollmentMode === "FULL_BUNDLE") {
      calculatedFee = 4500;
    } else {
      calculatedFee = newEnrolled.reduce((sum, s) => sum + s.monthlyFee, 0);
    }
  }

  const subjectNames = newEnrolled.map((s) => s.subjectName).join(", ");
  const historyItem = {
    id: `hist_${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    event: "Subject Enrollment Updated",
    notes: `Enrolled subjects updated to: ${subjectNames}. Mode: ${enrollmentMode}. Fee: ₹${calculatedFee}/mo.`,
    performedBy: "Academic Admin",
  };

  const updated: DirectoryStudent = {
    ...current,
    enrolledSubjects: newEnrolled,
    enrollmentMode,
    monthlyFee: calculatedFee,
    enrollmentHistory: [historyItem, ...current.enrollmentHistory],
  };

  students[index] = updated;
  persistDirectoryStudents(students);
  return updated;
}

/**
 * Update student general profile details
 */
export function updateStudentProfile(updatedStudent: DirectoryStudent): DirectoryStudent {
  const students = getStoredDirectoryStudents();
  const index = students.findIndex((s) => s.id === updatedStudent.id);
  if (index !== -1) {
    students[index] = updatedStudent;
    persistDirectoryStudents(students);
  }
  return updatedStudent;
}

/**
 * Update student status (Active, Inactive, Graduated, Suspended)
 */
export function updateStudentStatus(id: string, status: StudentStatus): DirectoryStudent | null {
  const students = getStoredDirectoryStudents();
  const index = students.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const current = students[index];
  const historyItem = {
    id: `hist_${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    event: `Status Changed to ${status}`,
    notes: `Student enrollment status updated from ${current.status} to ${status}.`,
    performedBy: "Academic Admin",
  };

  const updated: DirectoryStudent = {
    ...current,
    status,
    enrollmentHistory: [historyItem, ...current.enrollmentHistory],
  };

  students[index] = updated;
  persistDirectoryStudents(students);
  return updated;
}

/**
 * Export students directory to CSV file
 */
export function exportStudentsToCSV(students: DirectoryStudent[]): void {
  const headers = [
    "Student ID",
    "Full Name",
    "Batch Code",
    "Batch Name",
    "Grade Level",
    "Academic Year",
    "Enrollment Mode",
    "Enrolled Subjects",
    "Monthly Fee (INR)",
    "Status",
    "Student Email",
    "Student Phone",
    "Guardian Name",
    "Guardian Relationship",
    "Guardian Phone",
    "Guardian Email",
    "City",
    "Registration Date",
  ];

  const rows = students.map((s) => [
    `"${s.studentId}"`,
    `"${s.fullName}"`,
    `"${s.batchCode}"`,
    `"${s.batchName}"`,
    `"${s.gradeLevel}"`,
    `"${s.academicYear}"`,
    `"${s.enrollmentMode}"`,
    `"${s.enrolledSubjects.map((sub) => sub.subjectName).join("; ")}"`,
    s.monthlyFee,
    `"${s.status}"`,
    `"${s.email}"`,
    `"${s.phone}"`,
    `"${s.guardian.name}"`,
    `"${s.guardian.relationship}"`,
    `"${s.guardian.phone}"`,
    `"${s.guardian.email}"`,
    `"${s.address.city}"`,
    `"${s.registrationDate}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `TutorOS_Student_Directory_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
