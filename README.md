# TutorOS — The Operating System for Modern Tutors & Academies

**TutorOS** is an all-in-one web platform engineered for independent tutors, private coaching academies, faculty teachers, and students. It eliminates spreadsheets, paper logs, and manual messaging by unifying student profiles, teacher management, class and student batch segregation, interactive scheduling, 1-click attendance, automated billing & invoicing, and smart reminders (via Email and WhatsApp).

---

## 📚 Complete Project Documentation

The project specifications have been partitioned into dedicated, modular documentation files:

| Document | Topic & Focus Area | Link |
| :--- | :--- | :--- |
| **01. Requirements & Scope** | What app to build, Target users, Core features, Teacher management, and Student batch segregation | [01_PRODUCT_REQUIREMENTS.md](file:///d:/AMIR/TutorOS/docs/01_PRODUCT_REQUIREMENTS.md) |
| **02. Architecture & Data Model** | App flow, Entity-Relationship schema, Directory structure, and Tech stack | [02_ARCHITECTURE_AND_TECH_STACK.md](file:///d:/AMIR/TutorOS/docs/02_ARCHITECTURE_AND_TECH_STACK.md) |
| **03. Rules & Boundaries** | Engineering rules, what to do & avoid, approved libraries, and error handling | [03_ENGINEERING_RULES_AND_BOUNDARIES.md](file:///d:/AMIR/TutorOS/docs/03_ENGINEERING_RULES_AND_BOUNDARIES.md) |
| **04. Phased Roadmap** | Implementation milestones with focus on Phase 1 (Multi-role Login & Executive Dashboard) | [04_PHASED_IMPLEMENTATION_PLAN.md](file:///d:/AMIR/TutorOS/docs/04_PHASED_IMPLEMENTATION_PLAN.md) |
| **05. Design System** | Color theme, light/dark mode tokens, fonts, typography hierarchy, and UI rules | [05_DESIGN_SYSTEM.md](file:///d:/AMIR/TutorOS/docs/05_DESIGN_SYSTEM.md) |
| **Master Specification** | Full unified technical specification in a single document | [PROJECT_SPECIFICATION.md](file:///d:/AMIR/TutorOS/PROJECT_SPECIFICATION.md) |

---

## 🚀 Key Highlights & Highlights Added

1. **Teacher Information Management:**
   - Store teacher profiles, qualifications, subject specializations, contact details, and compensation rates (hourly/monthly/batch split).
2. **Class Batch & Student Batch Segregation:**
   - Create distinct class cohorts (e.g. *Grade 10 Math Morning Batch*, *SAT Weekend Intensive*).
   - Prevent cross-batch scheduling clashes and student data mix-ups with isolated batch rosters.
3. **Multi-Role RBAC:**
   - Pre-configured roles for `ADMIN`, `TEACHER`, `STUDENT`, and `PARENT`.
4. **Student Directory & Subject Enrollment Management System:**
   - **Batch-Wise Student Directory & Rosters:** Filter and manage students across active batch cohorts (*Grade 10 Advanced Math*, *AP Physics*, *Grade 10 Full Science Stream*, or *All Batches*) with basic bio, contact details, standard/grade, enrollment mode, and active status.
   - **Academic Year-Wise Directory & Historical Archives:** View and filter cohorts across current and prior academic sessions (`2026-2027`, `2025-2026`, and `2024-2025`), enabling administrators to track current students as well as archived alumni and historical records.
   - **New Student Registration Workflow:** Comprehensive enrollment dialog capturing student personal details, DOB, gender, parent/guardian contact, residential address, batch assignment, and subject selection with **automatic unique Student ID generation** (`TOS-2026-XXX`), avatar selection, and supporting document attachments (Birth Certificate, Marksheet, ID Proof).
   - **Subject Enrollment Management:** Flexible assignment of one or multiple subjects (*Mathematics*, *Physics*, *Chemistry*, *Biology*, *Computer Science*, *English Literature*) per student with instant tuition fee recalculation, modular vs bundled pricing, and direct subject add/update/remove capabilities.
   - **Subject Enrollment Matrix:** Dedicated subject overview displaying all offered courses, assigned faculty teachers, weekly schedules, total student count, and an interactive roster of all enrolled students for that specific subject.
   - **Comprehensive Student 360° Profile Dossier:** Click on any student to open a unified dossier displaying:
     - Full personal identity, residential address, and parent/guardian contact.
     - Enrolled subjects breakdown with teacher and schedule details.
     - **Integrated Attendance Summary:** Working days, present days, absent days, late days, and attendance % with visual progress bar.
     - **Integrated Academic Performance Summary:** Semester 1 %, Semester 2 %, Cumulative GPA (4.0 scale), academic standing, and teacher remarks.
     - **Integrated Fee & Payment Status:** Annual tuition due, amount paid, pending balance, and payment status badge.
     - Supporting document verification status and chronological enrollment audit history.
5. **Semester-Wise Student Results & Report Cards Management System:**
   - **Batch-Wise Student Academic Tracking:** View academic performance filtered by batch, with quick access to student report cards, overall percentage, GPA, and performance filter chips (**Distinction ≥ 80%**, **First Class ≥ 60%**, and **Needs Improvement < 60%**).
   - **Semester-Wise Progress Management & Marks Editor:** Administrators and teachers can click **Edit Marks** on any student to update theory and practical marks, add/remove subjects, modify the semester status (**Published**, **Draft**, **Under Review**), and enter detailed faculty feedback/remarks with instant client recalculation.
   - **Academic Year Progress Report:** Maintain annual academic records tracking Semester 1 vs Semester 2 comparative performance, cumulative annual GPA (out of 4.0), combined percentage, performance trajectory (**Improved**, **Consistent**, **Needs Focus**), and integrated student attendance statistics (**Present**, **Absent**, **Late**, and **Attendance %**).
   - **Interactive Student Detailed Report Card:** Click on any student to open a comprehensive academic dossier featuring personal information, subject-wise breakdown (Theory + Practical, Total, Grade, Result Status), academic year attendance metrics, semester comparison progress bar, and teacher remarks.
   - **Official Printable Institutional Transcript:** One-click generation of high-resolution, institutional grade cards formatted for A4 printing and PDF export via `window.print()`, complete with TutorOS academy header, student bio, subject marks table, grading scale legend, and authenticated signature blocks for the Class Teacher and Academic Director.
   - **Batch Gradebook Analytics & CSV Export:** Real-time KPI summary cards (*Batch Average GPA*, *Average Score %*, *Pass Rate %*, and *Top Performers*), visual grade distribution breakdown progress bars (A+, A, B+, B, C, F), and instant 1-click CSV gradebook export for external archiving and school records.
6. **Comprehensive Bills & Fee Management System:**
   - **Batch-Wise Student Fee Rosters:** Display students filtered by selected batch, with dedicated tabs/filters for **Paid Students**, **Partially Paid Students**, and **Pending Students**.
   - **Current Month Payment Summary:** Detailed student-by-student roster displaying *Student Name*, *Monthly Fee Amount*, *Amount Paid*, *Pending Balance*, *Payment Status (Paid / Partially Paid / Pending)*, and *Payment Date*.
   - **Academic Year Payment Tracking:** Track and monitor annual finances across all 12 billing months with *Total Fees Due*, *Total Amount Paid*, *Outstanding Balance*, *Overall Payment Percentage*, and interactive *Month-wise Payment History*.
   - **Student Payment Details & Profile Dashboard:** Click on any student to inspect their complete financial audit profile, current payment status, 12-month payment history, outstanding dues, and visual payment progress bar.
   - **Instant Payment Status Updates:** Administrators can directly update any student's payment status to **Paid (Fully Paid)**, **Partially Paid**, or **Pending**. The system instantly recalculates all summary metrics, batch collection percentages, and outstanding dues across the dashboard.
   - **Multi-Channel Reminder Center:** Instant dispatch of payment reminders via WhatsApp (with 1-click WhatsApp Web launcher), SMS, Email, and In-App alerts.
   - **Printable Receipts & CSV Export:** Generate formatted official fee receipts/tax invoices with amount in words and export batch collection data to CSV.
7. **Student Attendance Management System:**
   - **Batch-Wise Rosters & Daily Marking:** 3-state marking (Present, Absent, Late) with 1-click "Mark All Present" and persistent storage.
   - **Monthly & Annual Attendance Summaries:** Working days calculation, percentage scoring, and monthly historical audit logs.
   - **Printable Attendance Transcript:** Formatted formal academic attendance transcripts with director/parent signature sections.
8. **Phase 1 Priority Deliverables:**
   - **Phase 1A: Login & Multi-Role Auth:** Split-screen authentication, Google OAuth, role-based redirects.
   - **Phase 1B: Executive Command Center:** 4 Key KPI cards, "Today's Agenda" feed with 1-click meeting join, and a Quick Actions toolbar.

---

## 🛠 Recommended Tech Stack

- **Framework:** Next.js 14+ (App Router, Server Actions)
- **Language:** TypeScript 5 (Strict Mode)
- **Styling:** Tailwind CSS + Shadcn UI (Radix UI)
- **Database:** PostgreSQL (Neon / Supabase)
- **ORM:** Prisma ORM
- **Authentication:** Supabase Auth or NextAuth.js v5
- **Forms & Validation:** React Hook Form + Zod
- **Alerts:** WhatsApp Business Cloud API & Resend Email
