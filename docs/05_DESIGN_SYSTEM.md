# 05. Design System, Typography & UI Tokens

> **Project:** TutorOS  
> **Document:** Visual Identity, Color System, Fonts & Typography Hierarchy  
> **Status:** Approved Design Specifications  

---

## 1. Brand Identity & Visual Direction

TutorOS utilizes a **modern, high-productivity educational design language** designed to evoke:
- **Academic Trust & Focus:** Deep Slate, Indigo, and Navy foundations.
- **Clarity & Growth:** Crisp Emerald and Teal accents for payment success and high attendance.
- **Urgency & Action:** Warm Amber for upcoming classes (<30m) and pending dues; Soft Crimson for overdue balances.

---

## 2. Color Palette & Token System

### 2.1 Core Palette Tokens

```
Brand Primary:    #1E293B (Slate Navy) / #4338CA (Indigo 700)
Brand Accent:     #059669 (Emerald 600 - Success & Paid)
Warning / Alerts: #D97706 (Amber 600 - Classes Starting Soon & Pending Dues)
Destructive:      #DC2626 (Red 600 - Overdue & Cancellations)
Surface Light:    #FFFFFF (Pure White)
Background Light: #F8FAFC (Slate 50)
```

### 2.2 Semantic Light & Dark Mode Tokens

| Token Name | Light Mode Value | Dark Mode Value | Usage Context |
| :--- | :--- | :--- | :--- |
| `--background` | `#F8FAFC` (Slate 50) | `#0B0F17` (Deep Obsidian) | Application canvas background |
| `--card` | `#FFFFFF` (Pure White) | `#131B2E` (Deep Navy Slate) | Metric cards, dialog surfaces, sidebars |
| `--card-foreground`| `#0F172A` (Slate 900) | `#F8FAFC` (Slate 50) | Text inside cards and modals |
| `--primary` | `#1E293B` (Slate 900) | `#6366F1` (Indigo 500) | Primary CTA buttons, active sidebar links |
| `--primary-foreground` | `#FFFFFF` | `#FFFFFF` | Text inside primary buttons |
| `--accent-success` | `#059669` (Emerald 600) | `#10B981` (Emerald 500) | "Paid" badges, attendance marked, positive trends |
| `--accent-warning` | `#D97706` (Amber 600) | `#F59E0B` (Amber 500) | "Pending" fees, sessions starting in <30 min |
| `--destructive` | `#DC2626` (Red 600) | `#EF4444` (Red 500) | "Overdue" invoices, cancelled classes, delete buttons |
| `--muted` | `#F1F5F9` (Slate 100) | `#1E293B` (Slate 800) | Table row hover, inactive tab backgrounds |
| `--muted-foreground` | `#64748B` (Slate 500) | `#94A3B8` (Slate 400) | Subtitles, helper text, timestamps |
| `--border` | `#E2E8F0` (Slate 200) | `#1E293B` (Slate 800) | Card outlines, table dividers, input borders |

---

## 3. Typography System

### 3.1 Font Families
- **Primary Sans-Serif:** `Plus Jakarta Sans` or `Inter`  
  *Rationale:* Geometric precision with open letterforms, ensuring effortless scanning of names, batch codes, and dense data tables.
- **Monospace & Numerical:** `JetBrains Mono` or tabular figures (`font-feature-settings: 'tnum'`)  
  *Rationale:* Ensures numbers in fee columns, timetables, and invoice sums remain strictly column-aligned without jitter.

### 3.2 Typographic Scale

| Level | Size | Weight | Line Height | Usage Context |
| :--- | :--- | :--- | :--- | :--- |
| **Display 1** | `32px` (`2.00rem`) | Bold (700) | 1.2 | Welcome headers, hero metric sums (`$14,250`) |
| **Heading 2** | `24px` (`1.50rem`) | SemiBold (600) | 1.3 | Page titles (`Teachers`, `Batches`, `Schedule`) |
| **Heading 3** | `18px` (`1.125rem`) | SemiBold (600) | 1.4 | Card headers, widget titles, modal headings |
| **Body (Default)** | `14px` (`0.875rem`) | Regular (400) | 1.5 | Primary body copy, table cell content, inputs |
| **Body Medium** | `14px` (`0.875rem`) | Medium (500) | 1.5 | Navigation links, buttons, table headers |
| **Caption / Badge**| `12px` (`0.75rem`) | Medium (500) | 1.4 | Status pills (`Paid`, `Enrolled`), time badges |

---

## 4. Component Tokens & Styling Rules

- **Border Radius:**
  - Cards & Dialogs: `rounded-xl` (`12px` / `0.75rem`)
  - Buttons, Inputs, Selects: `rounded-lg` (`8px` / `0.5rem`)
  - Status Badges: `rounded-full` (`9999px`)
- **Shadows & Elevation:**
  - Neutral State: `shadow-sm` (`0 1px 2px 0 rgb(0 0 0 / 0.05)`)
  - Hover / Interactive State: `shadow-md` (`0 4px 6px -1px rgb(0 0 0 / 0.1)`)
  - Modals & Popovers: `shadow-xl` (`0 20px 25px -5px rgb(0 0 0 / 0.1)`)
- **Spacing & Layout:**
  - Consistent `8px` grid system (`gap-2`, `gap-4`, `p-6`).
  - High information density in tables with `px-4 py-3` row padding for optimal productivity.

### 4.1 Academic & Result Badges
- **Grade Badges:**
  - `A+ / A (Distinction)`: `bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400`
  - `B / B+ (Good)`: `bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400`
  - `C (Average)`: `bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400`
  - `F (Needs Attention)`: `bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400`
- **Subject Enrollment Badges:**
  - `All-Subjects Bundle`: `bg-indigo-50 text-indigo-700 border-indigo-200`
  - `Single/Dual Subject`: `bg-purple-50 text-purple-700 border-purple-200`
- **Printable Report Card Styles:**
  - `@media print` layout: Clean white background (`bg-white`), high-contrast black typography, border-collapse table formatting, official academy header & watermark.

