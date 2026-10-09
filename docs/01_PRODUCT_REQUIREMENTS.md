# 01. Product Requirements Document (PRD)

> **Project:** TutorOS  
> **Document:** Product Requirements & Scope  
> **Status:** Approved Specification  

---

## 1. Executive Summary & App Definition

**TutorOS** is an all-in-one operating platform engineered for independent tutors, private coaching academies, faculty teachers, and students. It eliminates messy spreadsheets, fragmented WhatsApp groups, paper diaries, and manual invoicing by centralizing:

- **Student & Teacher Information Management:** Storing comprehensive profiles, teacher qualifications, subjects taught, and compensation models.
- **Class & Student Batch Segregation:** Structuring students into discrete class cohorts/batches (by subject, grade level, or schedule) with assigned teachers, preventing scheduling clashes and data confusion.
- **Interactive Scheduling & Calendar:** Multi-teacher, multi-batch timetable engine with clash detection and 1-click meeting links (Zoom/Google Meet/Offline).
- **1-Click Attendance & Digital Lesson Logs:** Real-time presence tracking, topic coverage, and assigned homework.
- **Automated Invoicing & Payment Tracking:** Generating tuition fee invoices (hourly, monthly, or batch-based) and tracking payment statuses.
- **Smart Automated Alerts:** Sending instant class reminders, homework notifications, and overdue fee alerts via WhatsApp and Email.

---

## 2. Target Users & Personas

| Role / Persona | Description & Pain Points | Primary TutorOS Objectives |
| :--- | :--- | :--- |
| **Academy Admin / Solo Tutor** | Operates the tutoring business or coaching academy. Struggles with managing multiple teachers, tracking student batches, keeping tabs on unpaid dues, and calendar collisions. | Master dashboard, batch creation, teacher assignment, automated fee billing, and business revenue analytics. |
| **Teachers / Instructors** | Hired or independent educators assigned to teach specific batches or 1-on-1 students. Struggles to know which batch is next, who attended, and logging homework. | Teacher portal to view assigned batches, today's schedule, 1-click attendance marking, and homework logging. |
| **Students & Batches** | Enrolled in specific subjects/batches (e.g., Grade 10 Math Batch A, SAT Prep Weekend). | View upcoming batch classes, access lesson notes, submit homework, and view attendance stats. |
| **Parents (Guardian View)** | Pays tuition fees and wants transparency on student attendance, academic progress, and invoices. | Receive automated WhatsApp/Email reminders, view invoice receipts, and check attendance/lesson progress. |

---

## 3. Core Feature Specifications

### 3.1 Multi-Role Authentication & Role-Based Access Control (RBAC)
- **Role System:**
  - `ADMIN`: Full access to academy settings, financial revenue, all teachers, all batches, and student records.
  - `TEACHER`: Restricted access to assigned batches, assigned student lists, attendance marking, and lesson logging. Cannot see global financial records unless authorized.
  - `STUDENT`: Read-only access to enrolled batch schedules, lesson notes, assigned homework, and personal attendance.
  - `PARENT`: Access to student progress reports, batch timetable, and fee invoices.
- **Auth Methods:** Email/Password with verification, Google OAuth, and secure Session Management.

### 3.2 Teacher Management Directory
- **Teacher Profiles:** Name, email, phone, bio, subject specializations (e.g., AP Physics, Grade 12 Math), qualifications, and photo.
- **Compensation & Rate Models:** Hourly rate, fixed monthly salary, or revenue-share percentage per batch.
- **Batch & Student Allocation:** Assign teachers to lead specific class batches or 1-on-1 student slots.
- **Teacher Availability:** Define working hours and days to prevent schedule conflicts.

### 3.3 Class Batch & Student Batch Segregation
- **Batch Architecture:**
  - A **Batch** represents a distinct instructional cohort (e.g., *Batch 2026-Math-10A*, *SAT-English-Weekend*).
  - Attributes: Batch Name, Subject, Grade/Level, Assigned Teacher, Max Student Capacity, Room/Online Link, Recurring Timetable.
- **Student Segregation:**
  - Students can be enrolled in one or multiple batches without cross-batch data contamination.
  - Batch roster management: Add, remove, transfer students between batches.
  - Waitlist handling when batch capacity is reached.
- **Batch-Level Operations:**
  - Batch-wise attendance sheets.
  - Batch-wise lesson coverage logs.
  - Group announcements and shared homework assignments.

### 3.4 Interactive Calendar & Scheduling Engine
- Multi-view calendar: Day, Week, Month, and Teacher-filtered views.
- **Conflict Detection:** Automatic validation preventing a teacher or student from being double-booked at the same time across different batches.
- **Recurring Slots:** Setup recurring schedules (e.g., Every Monday & Thursday, 5:00 PM – 6:30 PM).
- **Virtual Classroom Links:** Store and launch direct Zoom, Google Meet, or physical room details.

### 3.5 1-Click Attendance & Lesson Tracking
- Rapid attendance marking (`Present`, `Absent`, `Late`, `Excused`).
- **Lesson Log:**
  - Topic/Chapter covered in the session.
  - Homework description and due date.
  - Internal tutor notes vs. notes shared with parents.

### 3.6 Automated Invoicing & Financials
- **Flexible Fee Structures:**
  - Per-hour rate (calculated from attended hours).
  - Fixed recurring monthly batch subscription.
  - One-time package fee.
- **Invoice Tracking:** `PAID`, `PENDING`, `PARTIALLY_PAID`, `OVERDUE`.
- **Receipts:** Auto-generated branded PDF receipts for parents.

### 3.7 Smart Communication & Alerts (WhatsApp & Email)
- **Session Reminders:** Automated alert 1 hour and 15 minutes before class starts.
- **Daily / Post-Class Digest:** WhatsApp/Email sent to parents with attendance confirmation and homework details.
- **Fee Overdue Notifications:** Gentle automated reminders for pending tuition fees.

### 3.8 Flexible Subject Tuition / Enrollment (All Subjects vs. Modular 1–2 Subjects)
- **Flexible Enrollment Models:**
  - **All-Subject Bundle:** Student joins for the complete curriculum/stream (e.g., All 4 Science subjects: Math, Physics, Chemistry, Biology) at a discounted comprehensive monthly fee.
  - **Modular / Single-Subject Pick:** Student joins tuition for only 1 or 2 specific subjects (e.g., only "Grade 10 Mathematics" or "AP Physics + Chemistry").
- **Dynamic Fee Calculation:**
  - Tuition billing dynamically recalculates based on whether the student is enrolled in full bundle or discrete individual subjects.
- **Independent Subject-to-Batch Mapping:**
  - A student enrolled in 2 subjects is mapped only to those 2 corresponding subject batches and teachers, keeping other subject batches clean.

### 3.9 Semester-Wise & Term-Wise Student Results Management
- **Academic Term & Semester Tracking:**
  - Support for multiple academic milestones: Semester 1, Semester 2, Quarter 1, Mid-terms, and Final Examinations.
- **Subject-Wise Marksheets & Grade Entry:**
  - Subject-wise score recording (Marks Obtained, Maximum Marks, Percentage, Letter Grade: A+, A, B, etc.).
  - Teacher remarks & performance notes per subject.
  - Grade computation dynamically calculates only for the specific subjects the student is enrolled in (all subjects vs. 1–2 subjects).
- **Cumulative GPA & Analytics:**
  - Semester-wise GPA / Percentage calculation and progress trajectory graph.
- **Digital Report Cards:**
  - Auto-generated branded PDF report cards ready to download, print, or share directly to parents via WhatsApp/Email.
  - Parent & Student portal visibility for real-time academic progress review.

