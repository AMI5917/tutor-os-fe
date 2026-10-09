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
4. **Flexible Subject-Wise Tuition (All Subjects vs 1–2 Subjects):**
   - Support full curriculum bundle or modular pick of 1–2 specific subjects with individualized pricing.
5. **Semester-Wise Student Results & Report Cards:**
   - Term/semester examination tracking, subject marks entry, dynamic GPA calculation, and auto-generated branded PDF report cards.
6. **Phase 1 Priority Deliverables:**
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
