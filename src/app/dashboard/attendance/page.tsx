// src/app/dashboard/attendance/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Layers,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileText,
  Printer,
  CheckCheck,
  RotateCcw,
  Sparkles,
  Award,
  CalendarDays,
  Percent,
} from "lucide-react";
import { MOCK_BATCHES, MOCK_STUDENTS } from "@/lib/mock-data";
import {
  AttendanceRecord,
  AttendanceStatus,
} from "@/types/attendance";
import {
  ACADEMIC_YEARS,
  AcademicYear,
  MONTH_OPTIONS,
  getStoredAttendanceRecords,
  upsertDailyAttendance,
  calculateStudentMonthlySummary,
  calculateStudentYearlySummary,
} from "@/lib/attendance-data";
import { StudentAttendanceDetailDialog } from "@/components/attendance/StudentAttendanceDetailDialog";
import { AttendanceReportDialog } from "@/components/attendance/AttendanceReportDialog";
import { Student } from "@/types/roles";

export default function AttendancePage() {
  // Batch, Year, Month, Date selections
  const [selectedBatchId, setSelectedBatchId] = useState<string>(MOCK_BATCHES[0]?.id || "bat_1");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<AcademicYear>("2026-2027");
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-10");
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // default to Oct 25, 2026 or today's date in YYYY-MM-DD
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });

  // Active Tab: DAILY | MONTHLY | YEARLY | REPORTS
  const [activeTab, setActiveTab] = useState<"DAILY" | "MONTHLY" | "YEARLY" | "REPORTS">("DAILY");

  // Search query filter
  const [searchQuery, setSearchQuery] = useState("");

  // Storage for all attendance records
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  // Daily attendance marking form state: studentId -> { status, remarks }
  const [dailyMarks, setDailyMarks] = useState<
    Record<string, { status: AttendanceStatus | ""; remarks: string }>
  >({});

  // Dialog states for drilldown and reports
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<Student | null>(null);

  // Initialize records from localStorage on mount
  useEffect(() => {
    const loaded = getStoredAttendanceRecords();
    setRecords(loaded);
  }, []);

  // Filter months for the selected academic year
  const availableMonths = useMemo(() => {
    return MONTH_OPTIONS.filter((m) => m.year === selectedAcademicYear);
  }, [selectedAcademicYear]);

  // Keep selectedMonth synchronized when changing academic year
  useEffect(() => {
    if (availableMonths.length > 0 && !availableMonths.some((m) => m.value === selectedMonth)) {
      setSelectedMonth(availableMonths[0].value);
    }
  }, [selectedAcademicYear, availableMonths, selectedMonth]);

  // Selected Batch item
  const currentBatch = useMemo(() => {
    return MOCK_BATCHES.find((b) => b.id === selectedBatchId) || MOCK_BATCHES[0];
  }, [selectedBatchId]);

  // Students belonging to the selected batch
  const batchStudents = useMemo(() => {
    const list = MOCK_STUDENTS.filter(
      (s) => s.batchId === selectedBatchId || s.batchCode === currentBatch?.code
    );
    // fallback if no direct mapping exists
    return list.length > 0 ? list : MOCK_STUDENTS.slice(0, 4);
  }, [selectedBatchId, currentBatch]);

  // Filtered students by search
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return batchStudents;
    const q = searchQuery.toLowerCase();
    return batchStudents.filter(
      (s) =>
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.standard.toLowerCase().includes(q) ||
        s.parentPhone.includes(q)
    );
  }, [batchStudents, searchQuery]);

  // Synchronize daily marks whenever selectedDate, selectedBatchId, or records change
  useEffect(() => {
    const initialMarks: Record<string, { status: AttendanceStatus | ""; remarks: string }> = {};

    batchStudents.forEach((student) => {
      const rec = records.find(
        (r) => r.studentId === student.id && r.date === selectedDate
      );
      if (rec) {
        initialMarks[student.id] = {
          status: rec.status,
          remarks: rec.remarks || "",
        };
      } else {
        initialMarks[student.id] = {
          status: "",
          remarks: "",
        };
      }
    });

    setDailyMarks(initialMarks);
  }, [selectedDate, selectedBatchId, batchStudents, records]);

  // Handle marking an individual student
  const handleMarkStatus = (studentId: string, status: AttendanceStatus) => {
    setDailyMarks((prev) => ({
      ...prev,
      [studentId]: {
        status: prev[studentId]?.status === status ? "" : status,
        remarks: prev[studentId]?.remarks || "",
      },
    }));
  };

  // Handle remarks change
  const handleRemarkChange = (studentId: string, remarks: string) => {
    setDailyMarks((prev) => ({
      ...prev,
      [studentId]: {
        status: prev[studentId]?.status || "PRESENT",
        remarks,
      },
    }));
  };

  // Bulk action: Mark all present
  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    batchStudents.forEach((s) => {
      updated[s.id] = {
        status: "PRESENT",
        remarks: dailyMarks[s.id]?.remarks || "",
      };
    });
    setDailyMarks(updated);
    toast.info(`Marked all ${batchStudents.length} students as Present for ${selectedDate}`);
  };

  // Bulk action: Clear marks
  const handleClearMarks = () => {
    const cleared: Record<string, { status: ""; remarks: string }> = {};
    batchStudents.forEach((s) => {
      cleared[s.id] = {
        status: "",
        remarks: "",
      };
    });
    setDailyMarks(cleared);
    toast.info("Cleared today's attendance marks");
  };

  // Save daily attendance to storage
  const handleSaveAttendance = () => {
    const entriesToSave = batchStudents
      .filter((s) => dailyMarks[s.id]?.status)
      .map((s) => ({
        studentId: s.id,
        status: dailyMarks[s.id].status as AttendanceStatus,
        remarks: dailyMarks[s.id].remarks || undefined,
      }));

    if (entriesToSave.length === 0) {
      toast.error("Please mark attendance for at least one student before saving.");
      return;
    }

    const updatedRecords = upsertDailyAttendance(
      selectedBatchId,
      selectedDate,
      entriesToSave,
      records
    );

    setRecords(updatedRecords);
    toast.success(
      `Attendance saved for ${entriesToSave.length} students on ${selectedDate} in batch ${currentBatch.code}!`
    );
  };

  // Date step helpers
  const handleStepDate = (direction: -1 | 1) => {
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() + direction);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    setSelectedDate(`${y}-${m}-${day}`);
  };

  // Batch Monthly Stats Calculation
  const batchMonthlyStats = useMemo(() => {
    const summaries = batchStudents.map((s) =>
      calculateStudentMonthlySummary(s.id, selectedMonth, records)
    );
    if (summaries.length === 0) return { avgPercentage: 0, totalWorkingDays: 22 };

    const totalPct = summaries.reduce((acc, s) => acc + s.attendancePercentage, 0);
    const avgPercentage = Math.round(totalPct / summaries.length);
    const totalWorkingDays = summaries[0]?.totalWorkingDays || 22;

    return { avgPercentage, totalWorkingDays };
  }, [batchStudents, selectedMonth, records]);

  // Count marked statuses for selectedDate
  const todayMarkedCounts = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let unmarked = 0;

    batchStudents.forEach((s) => {
      const st = dailyMarks[s.id]?.status;
      if (st === "PRESENT") present++;
      else if (st === "ABSENT") absent++;
      else if (st === "LATE") late++;
      else unmarked++;
    });

    return { present, absent, late, unmarked, total: batchStudents.length };
  }, [batchStudents, dailyMarks]);

  const getPercentageColor = (pct: number) => {
    if (pct >= 85) return "text-emerald-600 dark:text-emerald-400";
    if (pct >= 75) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  };

  const getPercentageBg = (pct: number) => {
    if (pct >= 85) return "bg-emerald-500";
    if (pct >= 75) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Context Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Student Attendance Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Daily lecture attendance marking, monthly summaries, academic year tracking, and student audit reports.
          </p>
        </div>

        {/* Global Context Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Batch Selector */}
          <div className="w-56">
            <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
              <SelectTrigger className="h-9 text-xs font-semibold">
                <Layers className="h-3.5 w-3.5 text-indigo-500 mr-1.5" />
                <SelectValue placeholder="Select Batch" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_BATCHES.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    [{b.code}] {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Academic Year Selector */}
          <div className="w-36">
            <Select
              value={selectedAcademicYear}
              onValueChange={(val) => setSelectedAcademicYear(val as AcademicYear)}
            >
              <SelectTrigger className="h-9 text-xs font-semibold">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {ACADEMIC_YEARS.map((yr) => (
                  <SelectItem key={yr} value={yr}>
                    AY {yr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Month Selector */}
          <div className="w-40">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="h-9 text-xs font-semibold">
                <Calendar className="h-3.5 w-3.5 text-indigo-500 mr-1.5" />
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* KPI Stats Summary Banner for Selected Batch */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Batch Overview Card */}
        <Card className="hover:border-indigo-300 dark:hover:border-indigo-800 transition-all">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase text-muted-foreground">
              <span>Active Batch</span>
              <Layers className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-600">
                  [{currentBatch.code}]
                </span>
                <h4 className="text-sm font-bold truncate max-w-[160px]">{currentBatch.name}</h4>
              </div>
              <Badge variant="outline" className="text-xs">
                {batchStudents.length} Students
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground pt-1 border-t">
              Instructor: <strong className="text-foreground">{currentBatch.teacherName}</strong>
            </p>
          </CardContent>
        </Card>

        {/* Monthly Attendance Average Card */}
        <Card className="hover:border-indigo-300 dark:hover:border-indigo-800 transition-all">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase text-muted-foreground">
              <span>Monthly Batch Avg</span>
              <Percent className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-black ${getPercentageColor(batchMonthlyStats.avgPercentage)}`}>
                {batchMonthlyStats.avgPercentage}%
              </span>
              <span className="text-xs text-muted-foreground">
                in {MONTH_OPTIONS.find((m) => m.value === selectedMonth)?.label.split(" ")[0]}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${getPercentageBg(batchMonthlyStats.avgPercentage)} transition-all`}
                style={{ width: `${batchMonthlyStats.avgPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Working Days */}
        <Card className="hover:border-indigo-300 dark:hover:border-indigo-800 transition-all">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase text-muted-foreground">
              <span>Month Working Days</span>
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black">
              {batchMonthlyStats.totalWorkingDays}{" "}
              <span className="text-xs font-medium text-muted-foreground">Days</span>
            </div>
            <p className="text-[11px] text-muted-foreground border-t pt-1">
              Academic Year: <strong>{selectedAcademicYear}</strong>
            </p>
          </CardContent>
        </Card>

        {/* Today's Daily Marking Live Status */}
        <Card className="hover:border-indigo-300 dark:hover:border-indigo-800 transition-all">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase text-muted-foreground">
              <span>Marking Status ({selectedDate})</span>
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                <CheckCircle className="h-3 w-3" /> {todayMarkedCounts.present}P
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
                <XCircle className="h-3 w-3" /> {todayMarkedCounts.absent}A
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                <AlertCircle className="h-3 w-3" /> {todayMarkedCounts.late}L
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground border-t pt-1">
              {todayMarkedCounts.unmarked === 0 ? (
                <span className="text-emerald-600 font-semibold">✓ All {todayMarkedCounts.total} students recorded</span>
              ) : (
                <span>{todayMarkedCounts.unmarked} student(s) unmarked</span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Feature Tabs Navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-2">
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          <Button
            size="sm"
            variant={activeTab === "DAILY" ? "default" : "ghost"}
            onClick={() => setActiveTab("DAILY")}
            className="text-xs font-semibold gap-1.5"
          >
            <Clock className="h-3.5 w-3.5" />
            1. Daily Marking
          </Button>

          <Button
            size="sm"
            variant={activeTab === "MONTHLY" ? "default" : "ghost"}
            onClick={() => setActiveTab("MONTHLY")}
            className="text-xs font-semibold gap-1.5"
          >
            <Calendar className="h-3.5 w-3.5" />
            2. Monthly Summary
          </Button>

          <Button
            size="sm"
            variant={activeTab === "YEARLY" ? "default" : "ghost"}
            onClick={() => setActiveTab("YEARLY")}
            className="text-xs font-semibold gap-1.5"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            3. Academic Year Tracking
          </Button>

          <Button
            size="sm"
            variant={activeTab === "REPORTS" ? "default" : "ghost"}
            onClick={() => setActiveTab("REPORTS")}
            className="text-xs font-semibold gap-1.5"
          >
            <FileText className="h-3.5 w-3.5" />
            4. Reports & Analytics
          </Button>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search student or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DAILY ATTENDANCE MARKING */}
      {/* ========================================================================= */}
      {activeTab === "DAILY" && (
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                Daily Attendance Marking — {currentBatch.name}
              </CardTitle>
              <CardDescription>
                Mark student presence (Present, Absent, Late) on the selected date.
              </CardDescription>
            </div>

            {/* Date Navigator & Action Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Previous / Next Day Steppers */}
              <div className="flex items-center rounded-lg border bg-muted/20 p-0.5">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleStepDate(-1)}
                  className="h-7 w-7 text-muted-foreground"
                  title="Previous Day"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-xs font-semibold px-2 py-1 outline-none text-foreground"
                />

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleStepDate(1)}
                  className="h-7 w-7 text-muted-foreground"
                  title="Next Day"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Quick Action: Mark All Present */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleMarkAllPresent}
                className="h-8 text-xs gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark All Present
              </Button>

              {/* Quick Action: Clear */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearMarks}
                className="h-8 text-xs gap-1"
                title="Clear Marks"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Clear
              </Button>

              {/* Primary: Save Attendance */}
              <Button
                size="sm"
                onClick={handleSaveAttendance}
                className="h-8 text-xs gap-1.5 bg-slate-900 text-white dark:bg-indigo-600 hover:bg-slate-800"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Save Attendance
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-muted/40 font-semibold text-muted-foreground uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Standard / Grade</th>
                    <th className="px-4 py-3">Parent Contact</th>
                    <th className="px-4 py-3 text-center">Status (Select One)</th>
                    <th className="px-4 py-3">Remarks / Reason</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        No students found matching your filter in this batch.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => {
                      const currentMark = dailyMarks[student.id];
                      const status = currentMark?.status || "";
                      const remarks = currentMark?.remarks || "";

                      return (
                        <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-semibold text-foreground">
                            <button
                              onClick={() => setSelectedStudentForDetail(student)}
                              className="text-left hover:text-indigo-600 hover:underline flex items-center gap-2"
                            >
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs dark:bg-indigo-950 dark:text-indigo-400">
                                {student.firstName[0]}
                              </div>
                              <div>
                                <span>{student.firstName} {student.lastName}</span>
                                <span className="block text-[10px] font-normal text-muted-foreground font-mono">
                                  ID: {student.id}
                                </span>
                              </div>
                            </button>
                          </td>

                          <td className="px-4 py-3 text-muted-foreground">
                            <Badge variant="outline" className="text-[10px]">
                              {student.standard}
                            </Badge>
                          </td>

                          <td className="px-4 py-3 text-muted-foreground">
                            {student.parentPhone}
                          </td>

                          {/* Attendance Status Buttons: Present, Absent, Late */}
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* PRESENT */}
                              <button
                                type="button"
                                onClick={() => handleMarkStatus(student.id, "PRESENT")}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all border ${
                                  status === "PRESENT"
                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                    : "border-border hover:border-emerald-400 text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                Present
                              </button>

                              {/* ABSENT */}
                              <button
                                type="button"
                                onClick={() => handleMarkStatus(student.id, "ABSENT")}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all border ${
                                  status === "ABSENT"
                                    ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                                    : "border-border hover:border-rose-400 text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                Absent
                              </button>

                              {/* LATE */}
                              <button
                                type="button"
                                onClick={() => handleMarkStatus(student.id, "LATE")}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all border ${
                                  status === "LATE"
                                    ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                                    : "border-border hover:border-amber-400 text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                <AlertCircle className="h-3.5 w-3.5" />
                                Late
                              </button>
                            </div>
                          </td>

                          {/* Remarks Input */}
                          <td className="px-4 py-3">
                            <Input
                              placeholder="e.g. fever, family emergency..."
                              value={remarks}
                              onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                              className="h-8 text-xs max-w-xs"
                            />
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedStudentForDetail(student)}
                              className="h-7 text-xs text-indigo-600 hover:text-indigo-700"
                            >
                              Details →
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Save Bar */}
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t pt-3">
              <p className="text-xs text-muted-foreground">
                Attendance marked for <strong>{todayMarkedCounts.total - todayMarkedCounts.unmarked}</strong> of{" "}
                <strong>{todayMarkedCounts.total}</strong> students on <strong>{selectedDate}</strong>.
              </p>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleMarkAllPresent} className="text-xs">
                  Mark All Present
                </Button>
                <Button size="sm" onClick={handleSaveAttendance} className="text-xs bg-slate-900 text-white dark:bg-indigo-600">
                  Save Attendance
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MONTHLY ATTENDANCE SUMMARY */}
      {/* ========================================================================= */}
      {activeTab === "MONTHLY" && (
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                Monthly Attendance Summary — {MONTH_OPTIONS.find((m) => m.value === selectedMonth)?.label}
              </CardTitle>
              <CardDescription>
                Detailed aggregate of Present, Absent, Late days, and attendance percentage for {currentBatch.name}.
              </CardDescription>
            </div>

            {/* Month Selector inside tab */}
            <div className="w-48">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="h-8 text-xs">
                  <Calendar className="h-3.5 w-3.5 text-indigo-500 mr-1.5" />
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-muted/40 font-semibold text-muted-foreground uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Standard</th>
                    <th className="px-4 py-3 text-center">Total Working Days</th>
                    <th className="px-4 py-3 text-center text-emerald-600">Present Days</th>
                    <th className="px-4 py-3 text-center text-rose-600">Absent Days</th>
                    <th className="px-4 py-3 text-center text-amber-600">Late Days</th>
                    <th className="px-4 py-3 text-center">Attendance %</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredStudents.map((student) => {
                    const monthly = calculateStudentMonthlySummary(
                      student.id,
                      selectedMonth,
                      records
                    );

                    return (
                      <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-semibold text-foreground">
                          <button
                            onClick={() => setSelectedStudentForDetail(student)}
                            className="text-left hover:text-indigo-600 hover:underline"
                          >
                            {student.firstName} {student.lastName}
                          </button>
                        </td>

                        <td className="px-4 py-3 text-muted-foreground">
                          {student.standard}
                        </td>

                        <td className="px-4 py-3 text-center font-medium">
                          {monthly.totalWorkingDays}
                        </td>

                        <td className="px-4 py-3 text-center font-bold text-emerald-600">
                          {monthly.presentDays}
                        </td>

                        <td className="px-4 py-3 text-center font-bold text-rose-600">
                          {monthly.absentDays}
                        </td>

                        <td className="px-4 py-3 text-center font-bold text-amber-600">
                          {monthly.lateDays}
                        </td>

                        {/* Visual Progress Bar & % Badge */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full rounded-full ${getPercentageBg(monthly.attendancePercentage)}`}
                                style={{ width: `${monthly.attendancePercentage}%` }}
                              />
                            </div>
                            <span className={`font-bold text-xs ${getPercentageColor(monthly.attendancePercentage)}`}>
                              {monthly.attendancePercentage}%
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedStudentForDetail(student)}
                              className="h-7 text-xs text-indigo-600"
                            >
                              History
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedStudentForReport(student)}
                              className="h-7 text-xs"
                            >
                              <Printer className="h-3 w-3 mr-1" />
                              Report
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ACADEMIC YEAR ATTENDANCE TRACKING */}
      {/* ========================================================================= */}
      {activeTab === "YEARLY" && (
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                Academic Year Attendance Tracking ({selectedAcademicYear})
              </CardTitle>
              <CardDescription>
                Full academic year statistics, year-to-date working days, and annual percentage for every student.
              </CardDescription>
            </div>

            {/* Academic Year Switcher */}
            <div className="w-40">
              <Select
                value={selectedAcademicYear}
                onValueChange={(v) => setSelectedAcademicYear(v as AcademicYear)}
              >
                <SelectTrigger className="h-8 text-xs font-semibold">
                  <SelectValue placeholder="Academic Year" />
                </SelectTrigger>
                <SelectContent>
                  {ACADEMIC_YEARS.map((yr) => (
                    <SelectItem key={yr} value={yr}>
                      AY {yr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-muted/40 font-semibold text-muted-foreground uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Batch & Grade</th>
                    <th className="px-4 py-3 text-center">Annual Working Days</th>
                    <th className="px-4 py-3 text-center text-emerald-600">Annual Present</th>
                    <th className="px-4 py-3 text-center text-rose-600">Annual Absent</th>
                    <th className="px-4 py-3 text-center text-amber-600">Annual Late</th>
                    <th className="px-4 py-3 text-center">Annual Percentage</th>
                    <th className="px-4 py-3 text-center">Monthly Breakdown</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredStudents.map((student) => {
                    const yearly = calculateStudentYearlySummary(
                      student.id,
                      selectedAcademicYear,
                      records
                    );

                    return (
                      <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-semibold text-foreground">
                          <button
                            onClick={() => setSelectedStudentForDetail(student)}
                            className="text-left hover:text-indigo-600 hover:underline"
                          >
                            {student.firstName} {student.lastName}
                          </button>
                        </td>

                        <td className="px-4 py-3 text-muted-foreground">
                          [{currentBatch.code}] • {student.standard}
                        </td>

                        <td className="px-4 py-3 text-center font-medium">
                          {yearly.totalWorkingDays}
                        </td>

                        <td className="px-4 py-3 text-center font-bold text-emerald-600">
                          {yearly.presentDays}
                        </td>

                        <td className="px-4 py-3 text-center font-bold text-rose-600">
                          {yearly.absentDays}
                        </td>

                        <td className="px-4 py-3 text-center font-bold text-amber-600">
                          {yearly.lateDays}
                        </td>

                        {/* Annual % */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full rounded-full ${getPercentageBg(yearly.attendancePercentage)}`}
                                style={{ width: `${yearly.attendancePercentage}%` }}
                              />
                            </div>
                            <span className={`font-bold text-xs ${getPercentageColor(yearly.attendancePercentage)}`}>
                              {yearly.attendancePercentage}%
                            </span>
                          </div>
                        </td>

                        {/* Mini Month Pills */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {yearly.monthlyBreakdown.slice(0, 4).map((mb) => (
                              <span
                                key={mb.month}
                                className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${
                                  mb.percentage >= 85
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : mb.percentage >= 75
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-rose-50 text-rose-700 border-rose-200"
                                }`}
                                title={`${mb.monthName}: ${mb.percentage}% (${mb.presentDays}P, ${mb.absentDays}A)`}
                              >
                                {mb.monthName.slice(0, 3)}: {mb.percentage}%
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedStudentForDetail(student)}
                            className="h-7 text-xs"
                          >
                            Full Profile
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: REPORTS & ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === "REPORTS" && (
        <div className="space-y-6">
          {/* Visual Attendance Cohort Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-emerald-200 bg-emerald-50/40 dark:border-emerald-950 dark:bg-emerald-950/20">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold uppercase text-emerald-800 dark:text-emerald-300">
                  <span>Regular Attendance (≥ 85%)</span>
                  <Award className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
                  {batchStudents.filter((s) => {
                    const m = calculateStudentMonthlySummary(s.id, selectedMonth, records);
                    return m.attendancePercentage >= 85;
                  }).length}{" "}
                  <span className="text-xs font-normal text-muted-foreground">Students</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Eligible for semester exams and certificates of excellence.
                </p>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/40 dark:border-amber-950 dark:bg-amber-950/20">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold uppercase text-amber-800 dark:text-amber-300">
                  <span>Satisfactory (75% - 84%)</span>
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                </div>
                <div className="text-3xl font-black text-amber-700 dark:text-amber-400">
                  {batchStudents.filter((s) => {
                    const m = calculateStudentMonthlySummary(s.id, selectedMonth, records);
                    return m.attendancePercentage >= 75 && m.attendancePercentage < 85;
                  }).length}{" "}
                  <span className="text-xs font-normal text-muted-foreground">Students</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Advisory reminder sent to maintain regular classroom attendance.
                </p>
              </CardContent>
            </Card>

            <Card className="border-rose-200 bg-rose-50/40 dark:border-rose-950 dark:bg-rose-950/20">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold uppercase text-rose-800 dark:text-rose-300">
                  <span>Attendance Shortage (&lt; 75%)</span>
                  <XCircle className="h-4 w-4 text-rose-600" />
                </div>
                <div className="text-3xl font-black text-rose-700 dark:text-rose-400">
                  {batchStudents.filter((s) => {
                    const m = calculateStudentMonthlySummary(s.id, selectedMonth, records);
                    return m.attendancePercentage < 75;
                  }).length}{" "}
                  <span className="text-xs font-normal text-muted-foreground">Students</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Critical alert generated for automated parent contact.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Student Report Cards Generation Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Printer className="h-4 w-4 text-indigo-600" />
                Individual Student Attendance Report Generator
              </CardTitle>
              <CardDescription>
                Print or export formal attendance transcripts with institution seal and parent acknowledgment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b bg-muted/40 font-semibold text-muted-foreground uppercase text-[11px]">
                    <tr>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">Batch & Standard</th>
                      <th className="px-4 py-3 text-center">Monthly Attendance</th>
                      <th className="px-4 py-3 text-center">Yearly Attendance</th>
                      <th className="px-4 py-3 text-center">Standing</th>
                      <th className="px-4 py-3 text-right">Generate Report</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredStudents.map((student) => {
                      const monthly = calculateStudentMonthlySummary(
                        student.id,
                        selectedMonth,
                        records
                      );
                      const yearly = calculateStudentYearlySummary(
                        student.id,
                        selectedAcademicYear,
                        records
                      );

                      return (
                        <tr key={student.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3 font-semibold text-foreground">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            [{currentBatch.code}] • {student.standard}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-indigo-600">
                            {monthly.attendancePercentage}% ({monthly.presentDays}P, {monthly.absentDays}A)
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-foreground">
                            {yearly.attendancePercentage}%
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge
                              variant={
                                yearly.attendancePercentage >= 85
                                  ? "success"
                                  : yearly.attendancePercentage >= 75
                                  ? "warning"
                                  : "destructive"
                              }
                              className="text-[10px]"
                            >
                              {yearly.attendancePercentage >= 85
                                ? "REGULAR"
                                : yearly.attendancePercentage >= 75
                                ? "MODERATE"
                                : "SHORTAGE"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              size="sm"
                              onClick={() => setSelectedStudentForReport(student)}
                              className="h-7 text-xs gap-1.5 bg-slate-900 text-white dark:bg-indigo-600"
                            >
                              <Printer className="h-3 w-3" />
                              View & Print Report
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detail Dialog */}
      {selectedStudentForDetail && (
        <StudentAttendanceDetailDialog
          open={Boolean(selectedStudentForDetail)}
          onOpenChange={(open) => !open && setSelectedStudentForDetail(null)}
          student={selectedStudentForDetail}
          batchName={currentBatch.name}
          monthlySummary={calculateStudentMonthlySummary(
            selectedStudentForDetail.id,
            selectedMonth,
            records
          )}
          yearlySummary={calculateStudentYearlySummary(
            selectedStudentForDetail.id,
            selectedAcademicYear,
            records
          )}
          allRecords={records}
        />
      )}

      {/* Report Modal */}
      {selectedStudentForReport && (
        <AttendanceReportDialog
          open={Boolean(selectedStudentForReport)}
          onOpenChange={(open) => !open && setSelectedStudentForReport(null)}
          student={selectedStudentForReport}
          batchName={currentBatch.name}
          monthlySummary={calculateStudentMonthlySummary(
            selectedStudentForReport.id,
            selectedMonth,
            records
          )}
          yearlySummary={calculateStudentYearlySummary(
            selectedStudentForReport.id,
            selectedAcademicYear,
            records
          )}
        />
      )}
    </div>
  );
}