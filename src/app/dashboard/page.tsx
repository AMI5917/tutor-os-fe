// src/app/dashboard/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { HeroWelcome } from "@/components/dashboard/HeroWelcome";
import { KpiStatsCards } from "@/components/dashboard/KpiStatsCards";
import { QuickActionToolbar } from "@/components/dashboard/QuickActionToolbar";
import { TodayAgendaFeed } from "@/components/dashboard/TodayAgendaFeed";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";
import {
  getKpiStats,
  MOCK_TODAY_SESSIONS,
  MOCK_RECENT_ACTIVITIES,
  MOCK_STUDENTS,
} from "@/lib/mock-data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Layers,
  Users,
  Calendar,
  ArrowUpRight,
  GraduationCap,
  Award,
  CalendarCheck,
  Receipt,
  Plus,
  BookOpen,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  Sparkles,
  Filter,
} from "lucide-react";
import { getStoredClassBatches, seedMockBatches } from "@/lib/class-batch-data";
import { getStoredTeacherStaff, seedMockTeacherStaff } from "@/lib/teacher-staff-data";
import { ClassBatch, BatchStatus } from "@/types/class-batch";
import { TeacherStaff, EmploymentStatus } from "@/types/teacher-staff";
import { RegisterBatchDialog } from "@/components/batches/RegisterBatchDialog";
import { RegisterTeacherDialog } from "@/components/teachers/RegisterTeacherDialog";
import { useAcademicYear } from "@/lib/academic-year-context";

export default function DashboardPage() {
  const { selectedYear, setSelectedYear, availableYears } = useAcademicYear();

  const [batches, setBatches] = React.useState<ClassBatch[]>([]);
  const [staff, setStaff] = React.useState<TeacherStaff[]>([]);
  const [selectedBatch, setSelectedBatch] = React.useState<ClassBatch | null>(null);
  const [activeModal, setActiveModal] = React.useState<string | null>(null);

  // Load and sync real stored data
  const loadData = React.useCallback(() => {
    seedMockBatches();
    seedMockTeacherStaff();
    setBatches(getStoredClassBatches());
    setStaff(getStoredTeacherStaff());
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter batches by selected global academic year
  const yearBatches = React.useMemo(() => {
    if (selectedYear === "ALL") return batches;
    return batches.filter((b) => b.academicYear === selectedYear);
  }, [batches, selectedYear]);

  // Filter staff by selected global academic year
  const yearStaff = React.useMemo(() => {
    if (selectedYear === "ALL") return staff;
    return staff.filter((s) => s.academicYear === selectedYear);
  }, [staff, selectedYear]);

  const activeStaff = React.useMemo(() => {
    return yearStaff.filter((s) => s.status === EmploymentStatus.ACTIVE);
  }, [yearStaff]);

  const totalSeats = React.useMemo(() => {
    return yearBatches.reduce((acc, b) => acc + (b.capacity || 0), 0);
  }, [yearBatches]);

  const totalEnrolled = React.useMemo(() => {
    return yearBatches.reduce((acc, b) => acc + (b.studentIds?.length || 0), 0);
  }, [yearBatches]);

  const stats = React.useMemo(() => {
    const baseStats = getKpiStats();
    const activeBatchesCount = yearBatches.filter((b) => b.status === BatchStatus.ACTIVE).length;
    return {
      ...baseStats,
      activeBatches: activeBatchesCount,
      totalStudents: totalEnrolled > 0 ? totalEnrolled : MOCK_STUDENTS.length,
    };
  }, [yearBatches, totalEnrolled]);

  return (
    <div className="space-y-6">
      {/* 1. Hero Welcome Greeting Banner */}
      <HeroWelcome />

      {/* 2. Global Academic Year Session Banner */}
      <div className="flex flex-col gap-3 rounded-2xl border bg-gradient-to-r from-sky-50/70 via-indigo-50/50 to-background p-4 shadow-sm dark:from-sky-950/20 dark:via-indigo-950/20 dark:to-background sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">
                Active Academic Session: {selectedYear === "ALL" ? "All Academic Years" : selectedYear}
              </h2>
              {selectedYear === "2026-2027" && (
                <Badge className="bg-emerald-600 hover:bg-emerald-600 text-[10px] text-white">
                  Current Session
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {yearBatches.length} Batches • {activeStaff.length} Faculty Members • {totalEnrolled}/{totalSeats} Allocated Seats
            </p>
          </div>
        </div>

        {/* Global Context Notice */}
        <div className="flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50/60 px-3 py-1.5 text-xs text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300">
          <Calendar className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
          <span className="font-medium">
            Session controlled globally from the top navigation bar
          </span>
        </div>
      </div>

      {/* 3. Academy Modules Quick Hub Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Link
          href="/dashboard/teachers"
          className="group flex flex-col justify-between rounded-xl border bg-card p-3.5 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md dark:hover:border-indigo-800"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <GraduationCap className="h-4 w-4" />
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-indigo-600 transition-colors" />
          </div>
          <div className="mt-2.5">
            <div className="text-lg font-bold text-foreground">{activeStaff.length}</div>
            <div className="text-[11px] font-medium text-muted-foreground">Teachers & Staff</div>
          </div>
        </Link>

        <Link
          href="/dashboard/batches"
          className="group flex flex-col justify-between rounded-xl border bg-card p-3.5 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md dark:hover:border-indigo-800"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
              <Layers className="h-4 w-4" />
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-sky-600 transition-colors" />
          </div>
          <div className="mt-2.5">
            <div className="text-lg font-bold text-foreground">{yearBatches.length}</div>
            <div className="text-[11px] font-medium text-muted-foreground">Class Batches</div>
          </div>
        </Link>

        <Link
          href="/dashboard/students"
          className="group flex flex-col justify-between rounded-xl border bg-card p-3.5 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md dark:hover:border-indigo-800"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Users className="h-4 w-4" />
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
          </div>
          <div className="mt-2.5">
            <div className="text-lg font-bold text-foreground">{MOCK_STUDENTS.length}</div>
            <div className="text-[11px] font-medium text-muted-foreground">Enrolled Students</div>
          </div>
        </Link>

        <Link
          href="/dashboard/attendance"
          className="group flex flex-col justify-between rounded-xl border bg-card p-3.5 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md dark:hover:border-indigo-800"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <CalendarCheck className="h-4 w-4" />
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-amber-600 transition-colors" />
          </div>
          <div className="mt-2.5">
            <div className="text-lg font-bold text-foreground">94.2%</div>
            <div className="text-[11px] font-medium text-muted-foreground">Attendance Rate</div>
          </div>
        </Link>

        <Link
          href="/dashboard/results"
          className="group flex flex-col justify-between rounded-xl border bg-card p-3.5 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md dark:hover:border-indigo-800"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <Award className="h-4 w-4" />
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-purple-600 transition-colors" />
          </div>
          <div className="mt-2.5">
            <div className="text-lg font-bold text-foreground">Sem 1 &amp; 2</div>
            <div className="text-[11px] font-medium text-muted-foreground">Exam Results</div>
          </div>
        </Link>

        <Link
          href="/dashboard/bills"
          className="group flex flex-col justify-between rounded-xl border bg-card p-3.5 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md dark:hover:border-indigo-800"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              <Receipt className="h-4 w-4" />
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-rose-600 transition-colors" />
          </div>
          <div className="mt-2.5">
            <div className="text-lg font-bold text-foreground">6 Dues</div>
            <div className="text-[11px] font-medium text-muted-foreground">Tuition Invoices</div>
          </div>
        </Link>
      </div>

      {/* 4. Quick Operations Toolbar (Syncs on batch/teacher/student added) */}
      <QuickActionToolbar onRefresh={loadData} />

      {/* 5. Core Executive KPI Cards */}
      <KpiStatsCards stats={stats} />

      {/* 6. Split Grid: Live Agenda & Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <TodayAgendaFeed sessions={MOCK_TODAY_SESSIONS} />
        </div>
        <div className="lg:col-span-5">
          <RecentActivityFeed activities={MOCK_RECENT_ACTIVITIES} />
        </div>
      </div>

      {/* 7. Academic Performance & Attendance Operational Health */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Attendance Health Snapshot */}
        <Card className="hover:border-indigo-300 dark:hover:border-indigo-800 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Attendance Health &amp; Daily Logs
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time tracking for academic session: <strong>{selectedYear}</strong>
              </CardDescription>
            </div>
            <Link
              href="/dashboard/attendance"
              className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400 flex items-center gap-1"
            >
              Mark Log <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 p-3 border border-emerald-500/20">
              <div className="space-y-0.5">
                <span className="text-xs text-muted-foreground">Current Average Attendance</span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">94.2%</div>
              </div>
              <Badge variant="outline" className="border-emerald-300 text-emerald-700 dark:text-emerald-300">
                Optimal Engagement
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded border p-2 bg-muted/30">
                <div className="font-bold text-foreground">24 Students</div>
                <div className="text-[10px] text-muted-foreground">Present Today</div>
              </div>
              <div className="rounded border p-2 bg-muted/30">
                <div className="font-bold text-rose-600">2 Students</div>
                <div className="text-[10px] text-muted-foreground">Absent</div>
              </div>
              <div className="rounded border p-2 bg-muted/30">
                <div className="font-bold text-indigo-600">{yearBatches.length} Batches</div>
                <div className="text-[10px] text-muted-foreground">In Session</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Semester Results & Academic Excellence Snapshot */}
        <Card className="hover:border-indigo-300 dark:hover:border-indigo-800 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                Academic Examinations &amp; Results
              </CardTitle>
              <CardDescription className="text-xs">
                Term evaluations, batch average performance, and report cards.
              </CardDescription>
            </div>
            <Link
              href="/dashboard/results"
              className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400 flex items-center gap-1"
            >
              Gradebook <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-purple-500/10 p-3 border border-purple-500/20">
              <div className="space-y-0.5">
                <span className="text-xs text-muted-foreground">Batch Average GPA</span>
                <div className="text-2xl font-black text-purple-600 dark:text-purple-400">3.64 / 4.0</div>
              </div>
              <Badge variant="outline" className="border-purple-300 text-purple-700 dark:text-purple-300">
                91.8% Pass Rate
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded border p-2 bg-muted/30">
                <div className="font-bold text-foreground">Sem 1</div>
                <div className="text-[10px] text-muted-foreground">Mid-Term Completed</div>
              </div>
              <div className="rounded border p-2 bg-muted/30">
                <div className="font-bold text-foreground">Sem 2</div>
                <div className="text-[10px] text-muted-foreground">Finals Scheduled</div>
              </div>
              <div className="rounded border p-2 bg-muted/30">
                <div className="font-bold text-foreground">4 Subjects</div>
                <div className="text-[10px] text-muted-foreground">Tested</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 8. Class Batch Segregation & Capacity Live Preview */}
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Class Batches ({selectedYear === "ALL" ? "All Sessions" : selectedYear})
            </CardTitle>
            <CardDescription>
              Segregated cohorts with assigned faculty and seat occupancy ({totalEnrolled} / {totalSeats} seats allocated).
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs border-indigo-200 hover:bg-indigo-50 dark:border-indigo-900"
              onClick={() => setActiveModal("new-batch")}
            >
              <Plus className="h-3.5 w-3.5" />
              New Batch
            </Button>
            <Link
              href="/dashboard/batches"
              className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400 flex items-center gap-1 pl-2"
            >
              Manage All ({batches.length}) <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardHeader>

        <CardContent>
          {yearBatches.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-xl bg-muted/20">
              <Layers className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" />
              <p className="text-sm font-semibold text-foreground">No class batches registered for {selectedYear}</p>
              <p className="text-xs text-muted-foreground mt-1">Create a new batch or switch to another academic session.</p>
              <Button size="sm" onClick={() => setActiveModal("new-batch")} className="mt-3 gap-1.5">
                <Plus className="h-4 w-4" /> Create Batch for {selectedYear}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {yearBatches.map((batch) => {
                const enrolledCount = batch.studentIds?.length || 0;
                const occupancyPct = batch.capacity > 0 ? Math.round((enrolledCount / batch.capacity) * 100) : 0;
                const isFull = enrolledCount >= batch.capacity;
                const remaining = Math.max(0, batch.capacity - enrolledCount);

                // Look up assigned teacher
                const assignedTeacher = staff.find((s) => s.employeeId === batch.assignedTeacherId);
                const teacherDisplayName = assignedTeacher?.fullName || batch.assignedTeacherId;

                return (
                  <div
                    key={batch.batchId}
                    className="rounded-xl border p-4 space-y-3 bg-muted/20 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate max-w-[180px]">
                        {batch.batchId}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] bg-background">
                          {batch.academicYear}
                        </Badge>
                        <Badge
                          variant={isFull ? "destructive" : "success"}
                          className="text-[10px] font-bold"
                        >
                          {isFull ? "FULL" : `${remaining} SEATS`}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold truncate leading-tight">
                        {batch.batchName}
                      </h4>
                      <p className="text-xs text-muted-foreground pt-1">
                        Class: <strong className="text-foreground">{batch.className}</strong>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Teacher: <strong className="text-foreground">{teacherDisplayName}</strong>
                      </p>
                    </div>

                    {/* Seat Occupancy Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>Occupancy: {enrolledCount} / {batch.capacity}</span>
                        <span className="font-bold">{occupancyPct}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isFull ? "bg-rose-500" : "bg-indigo-600"
                          }`}
                          style={{ width: `${occupancyPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t pt-2.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 truncate max-w-[160px]">
                        <Calendar className="h-3 w-3 shrink-0" />
                        {batch.startDate} – {batch.endDate}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400"
                        onClick={() => setSelectedBatch(batch)}
                      >
                        <Users className="h-3 w-3 mr-1" />
                        Students ({enrolledCount})
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 9. Teachers & Faculty Staff Directory Spotlight */}
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Faculty &amp; Staff Spotlight ({selectedYear === "ALL" ? "All Sessions" : selectedYear})
            </CardTitle>
            <CardDescription>
              {activeStaff.length} active faculty teachers and staff for the selected academic session.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs border-indigo-200 hover:bg-indigo-50 dark:border-indigo-900"
              onClick={() => setActiveModal("new-teacher")}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Teacher
            </Button>
            <Link
              href="/dashboard/teachers"
              className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400 flex items-center gap-1 pl-2"
            >
              View All Directory <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardHeader>

        <CardContent>
          {activeStaff.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No faculty or staff recorded specifically for {selectedYear}.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {activeStaff.slice(0, 4).map((member) => (
                <div
                  key={member.employeeId}
                  className="flex flex-col justify-between rounded-xl border p-4 space-y-3 bg-muted/20 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs uppercase shadow-sm">
                        {member.fullName.slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground leading-tight">
                          {member.fullName}
                        </h4>
                        <p className="text-[11px] text-muted-foreground">{member.designation}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-semibold border-indigo-200 text-indigo-700 dark:text-indigo-300">
                      {member.role}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground pt-1 border-t">
                    <div className="flex items-center justify-between">
                      <span>Department:</span>
                      <strong className="text-foreground">{member.department}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Academic Year:</span>
                      <strong className="text-foreground">{member.academicYear}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Status:</span>
                      <span className="font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/dashboard/teachers"
                    className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                  >
                    View Profile &amp; Batches
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog for Batch Student Inspection directly from Dashboard */}
      <Dialog open={!!selectedBatch} onOpenChange={(open) => { if (!open) setSelectedBatch(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Students in {selectedBatch?.batchName}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto space-y-2 py-2">
            {selectedBatch?.studentIds && selectedBatch.studentIds.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {selectedBatch.studentIds.map((id) => {
                  const s = MOCK_STUDENTS.find((st) => st.id === id);
                  if (!s) return null;
                  return (
                    <li key={id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <div className="font-semibold text-foreground">{s.firstName} {s.lastName}</div>
                        <div className="text-xs text-muted-foreground">ID: {s.id} • Parent: {s.parentPhone}</div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {s.standard}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No students enrolled in this batch yet.
                <div className="pt-2">
                  <Link href="/dashboard/batches" className="text-xs font-semibold text-indigo-600 hover:underline">
                    Assign Students in Class Batches &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button size="sm" variant="outline" onClick={() => setSelectedBatch(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Register Batch Modal */}
      <RegisterBatchDialog
        open={activeModal === "new-batch"}
        onOpenChange={(open) => {
          if (!open) {
            setActiveModal(null);
            loadData();
          }
        }}
      />

      {/* Register Teacher Modal */}
      <RegisterTeacherDialog
        open={activeModal === "new-teacher"}
        onOpenChange={(open) => {
          if (!open) {
            setActiveModal(null);
            loadData();
          }
        }}
      />
    </div>
  );
}
