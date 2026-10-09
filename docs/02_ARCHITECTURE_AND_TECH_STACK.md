# 02. Architecture, Data Model & Tech Stack

> **Project:** TutorOS  
> **Document:** System Architecture, Data Relationships & Tech Stack  
> **Status:** Approved Specification  

---

## 1. System Architecture & App Flow

```mermaid
flowchart TD
    subgraph ClientLayer["Frontend Client (Next.js 14+ / React 19)"]
        UI["Modern Web Client (Desktop & Mobile-Optimized)"]
        Shadcn["Tailwind CSS + Shadcn UI + Lucide Icons"]
        StateEngine["Zustand (Client UI State) + React Query"]
    end

    subgraph SecurityLayer["Security & Route Protection"]
        EdgeMiddleware["Next.js Edge Middleware"]
        RBACGuard["RBAC Resolver (ADMIN vs TEACHER vs STUDENT/PARENT)"]
        AuthEngine["Supabase Auth / NextAuth.js v5 (JWT & Sessions)"]
    end

    subgraph AppLayer["Application & Backend Logic"]
        ServerActions["Type-Safe Next.js Server Actions"]
        ZodValidator["Zod Input Validation Layer"]
        Services["Domain Services (BatchService, AttendanceService, BillingService)"]
    end

    subgraph DataLayer["Persistence Layer"]
        PrismaORM["Prisma ORM"]
        PostgresDB[(PostgreSQL Database)]
    end

    subgraph ExternalIntegrations["Third-Party APIs"]
        WhatsApp["WhatsApp Cloud API / Twilio (Class & Fee Alerts)"]
        Email["Resend (Transactional Emails & PDF Invoices)"]
        Storage["Cloud File Storage (Lesson Materials & Homework)"]
    end

    ClientLayer --> EdgeMiddleware
    EdgeMiddleware --> RBACGuard
    RBACGuard --> AuthEngine
    ClientLayer --> ServerActions
    ServerActions --> ZodValidator
    ZodValidator --> Services
    Services --> PrismaORM
    PrismaORM --> PostgresDB
    Services --> ExternalIntegrations
```

---

## 2. Relational Data Model (Batch Segregation & Teacher Architecture)

Below is the core entity schema supporting multi-teacher assignment and student-batch segregation.

```mermaid
erDiagram
    USER ||--o| TEACHER_PROFILE : has
    USER ||--o| STUDENT_PROFILE : has
    USER {
        string id PK
        string email
        string fullName
        string role "ADMIN | TEACHER | STUDENT | PARENT"
        string phone
        datetime createdAt
    }

    TEACHER_PROFILE ||--o{ BATCH : leads
    TEACHER_PROFILE {
        string id PK
        string userId FK
        string[] subjects
        string qualification
        decimal hourlyRate
        string status
    }

    STUDENT_PROFILE ||--o{ BATCH_ENROLLMENT : enrolls_in
    STUDENT_PROFILE {
        string id PK
        string userId FK
        string gradeLevel
        string schoolName
        string guardianName
        string guardianPhone
        string guardianEmail
    }

    BATCH ||--o{ BATCH_ENROLLMENT : contains
    BATCH ||--o{ CLASS_SESSION : schedules
    BATCH ||--o{ INVOICE : generates
    BATCH {
        string id PK
        string name "e.g. Grade 10 Math - Batch A"
        string subjectId FK
        string grade
        string teacherId FK
        int maxCapacity
        string colorCode
        string status "ACTIVE | COMPLETED | ARCHIVED"
    }

    SUBJECT ||--o{ BATCH : categorizes
    SUBJECT ||--o{ STUDENT_SUBJECT_ENROLLMENT : offers
    SUBJECT {
        string id PK
        string name "e.g. Mathematics, Physics"
        string code "MATH10"
        decimal defaultMonthlyFee
    }

    STUDENT_PROFILE ||--o{ STUDENT_SUBJECT_ENROLLMENT : enrolls
    STUDENT_SUBJECT_ENROLLMENT {
        string id PK
        string studentId FK
        string subjectId FK
        string enrollmentType "ALL_SUBJECTS_BUNDLE | SINGLE_OR_DUAL_MODULAR"
        decimal agreedMonthlyFee
        string status "ACTIVE | PAUSED | COMPLETED"
    }

    BATCH_ENROLLMENT {
        string id PK
        string batchId FK
        string studentId FK
        datetime enrolledAt
        string status "ENROLLED | DROPPED | COMPLETED"
    }

    SEMESTER ||--o{ EXAM : organizes
    SEMESTER ||--o{ REPORT_CARD : aggregates
    SEMESTER {
        string id PK
        string name "e.g. Semester 1, Midterm 2026"
        string academicYear "2026-2027"
        date startDate
        date endDate
        boolean isCurrent
    }

    EXAM ||--o{ EXAM_RESULT : records
    EXAM {
        string id PK
        string semesterId FK
        string subjectId FK
        string batchId FK
        string title "Final Exam, Unit Test 1"
        decimal totalMarks
        date examDate
    }

    STUDENT_PROFILE ||--o{ EXAM_RESULT : achieves
    EXAM_RESULT {
        string id PK
        string examId FK
        string studentId FK
        decimal marksObtained
        string letterGrade "A+, A, B, etc."
        decimal percentage
        string teacherRemarks
    }

    STUDENT_PROFILE ||--o{ REPORT_CARD : receives
    REPORT_CARD {
        string id PK
        string studentId FK
        string semesterId FK
        decimal totalMarksObtained
        decimal totalMaxMarks
        decimal overallPercentage
        string overallGrade
        string status "DRAFT | PUBLISHED"
        datetime publishedAt
    }

    CLASS_SESSION ||--o{ ATTENDANCE : tracks
    CLASS_SESSION ||--o| LESSON_LOG : has
    CLASS_SESSION {
        string id PK
        string batchId FK
        string teacherId FK
        datetime startTime
        datetime endTime
        string meetingLink
        string status "SCHEDULED | COMPLETED | CANCELLED"
    }

    ATTENDANCE {
        string id PK
        string sessionId FK
        string studentId FK
        string status "PRESENT | ABSENT | LATE | EXCUSED"
        string remarks
    }

    LESSON_LOG {
        string id PK
        string sessionId FK
        string topicsCovered
        string homeworkDetails
        datetime homeworkDueDate
        string tutorPrivateNotes
    }

    INVOICE {
        string id PK
        string studentId FK
        string batchId FK
        decimal amount
        string status "PENDING | PAID | OVERDUE | VOID"
        datetime dueDate
        datetime paidAt
    }
```

---

## 3. Directory & Folder Structure

```
TutorOS/
├── prisma/
│   ├── schema.prisma                  # PostgreSQL models (User, Teacher, Student, Batch, Semester, Exam, etc.)
│   └── seed.ts                        # Sample seed data (Teachers, Batches, Students, Exams)
├── public/
│   ├── logo.svg
│   └── illustrations/
├── src/
│   ├── app/                           # Next.js 14+ App Router
│   │   ├── (auth)/                    # Public Auth Routes
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/               # Protected Workspace Shell
│   │   │   ├── dashboard/page.tsx     # Role-aware Command Center
│   │   │   ├── teachers/              # Teacher Management Directory
│   │   │   │   ├── page.tsx           # All Teachers List & Performance
│   │   │   │   └── [id]/page.tsx      # Teacher Profile, Assigned Batches & Rates
│   │   │   ├── batches/               # Class Batch Management & Segregation
│   │   │   │   ├── page.tsx           # Batch Directory & Capacity Overview
│   │   │   │   └── [id]/page.tsx      # Batch Roster, Teacher, Schedule, Attendance
│   │   │   ├── students/              # Student CRM & Subject Enrollment
│   │   │   │   ├── page.tsx           # Filtered by Batch, Subject or All Students
│   │   │   │   └── [id]/page.tsx      # Student File, Subject Pick, Parent & Billing
│   │   │   ├── results/               # Semester Results & Report Cards
│   │   │   │   ├── page.tsx           # Semester overview, GPA analytics & publish
│   │   │   │   ├── enter-marks/page.tsx # Quick marks entry by batch / subject
│   │   │   │   └── report-card/[studentId]/page.tsx # Printable PDF Report Card
│   │   │   ├── schedule/              # Timetable & Calendar Engine
│   │   │   │   └── page.tsx           # Multi-teacher & batch conflict view
│   │   │   ├── attendance/            # Quick Attendance & Lesson Logging
│   │   │   │   └── page.tsx
│   │   │   ├── billing/               # Invoices & Financial Reports
│   │   │   │   └── page.tsx           # Auto-calculated fees (Bundle vs 1-2 Subjects)
│   │   │   ├── settings/page.tsx      # Academy Branding, Alert Settings
│   │   │   └── layout.tsx             # Dashboard Shell (Sidebar, Topbar, UserMenu)
│   │   ├── api/                       # Webhooks (WhatsApp alerts / Payment callbacks)
│   │   ├── error.tsx                  # Global Error Boundary
│   │   ├── loading.tsx                # App-wide Skeleton Loader
│   │   └── layout.tsx                 # Root Layout with Font & Toaster Providers
│   ├── components/
│   │   ├── ui/                        # Shadcn UI primitives (Button, Dialog, Badge, Card, etc.)
│   │   ├── shared/                    # Header, AppSidebar, MobileNav, UserDropdown
│   │   ├── dashboard/                 # MetricCards, TodayAgendaTimeline, QuickActionToolbar
│   │   ├── teachers/                  # TeacherCard, TeacherFormModal, SubjectBadge
│   │   ├── batches/                   # BatchRosterTable, AssignTeacherModal, BatchCard
│   │   ├── students/                  # StudentTable, SubjectEnrollmentModal, BatchFilterSelect
│   │   ├── results/                   # MarksheetTable, GradeBadge, ReportCardTemplate
│   │   └── forms/                     # React Hook Form + Zod form instances
│   ├── lib/
│   │   ├── db.ts                      # Prisma Client singleton
│   │   ├── auth.ts                    # Auth configuration & session utilities
│   │   ├── utils.ts                   # cn merger, currency formatters, grade calculators
│   │   └── validations/               # Zod schemas (teacher.ts, batch.ts, exam.ts, result.ts)
│   ├── server/
│   │   └── actions/                   # Type-safe Server Actions
│   │       ├── auth.actions.ts
│   │       ├── teacher.actions.ts
│   │       ├── batch.actions.ts
│   │       ├── student.actions.ts
│   │       ├── result.actions.ts      # Exam creation, mark entry, report card generation
│   │       ├── attendance.actions.ts
│   │       └── billing.actions.ts
│   └── types/                         # Shared TypeScript types & interfaces
│       ├── roles.ts
│       └── index.ts
```

---

## 4. Tech Stack Breakdown

| Layer | Selected Tech | Justification |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14+ (App Router)** | Hybrid SSR, React Server Components for speed, and secure Server Actions for mutations. |
| **Language** | **TypeScript 5 (Strict Mode)** | Prevents type mismatch bugs across complex Batch, Student, and Attendance relations. |
| **Styling** | **Tailwind CSS + Shadcn UI** | High-polish, enterprise-grade accessible components built on Radix UI primitives. |
| **Database** | **PostgreSQL (via Neon / Supabase)** | High-integrity ACID relational database essential for multi-student batch rosters and financial records. |
| **ORM** | **Prisma ORM** | Type-safe migrations, intuitive relational joins, and automated TypeScript definitions. |
| **Auth** | **Supabase Auth or NextAuth.js v5** | Secure cookie sessions, role-based claims (Admin, Teacher, Student, Parent), and Google OAuth. |
| **Forms & Validation** | **React Hook Form + Zod** | High-performance uncontrolled forms with unified client-server validation schemas. |
| **Icons & Visuals** | **Lucide React + Recharts** | Consistent SVG icons and interactive revenue/attendance charts. |
| **Date & Scheduling** | **date-fns** | Modular, lightweight date math for recurring timetables and timezone formatting. |
| **Alerts & Messaging** | **Resend + WhatsApp Business Cloud API** | Direct parent communication for session updates and pending tuition reminders. |
