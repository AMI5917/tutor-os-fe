// src/components/attendance/AttendanceReportDialog.tsx
"use client";

import React from "react";
import { Student } from "@/types/roles";
import {
  MonthlyAttendanceSummary,
  YearlyAttendanceSummary,
} from "@/types/attendance";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, GraduationCap, Calendar, CheckCircle2, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AttendanceReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student;
  batchName: string;
  monthlySummary: MonthlyAttendanceSummary;
  yearlySummary: YearlyAttendanceSummary;
}

export function AttendanceReportDialog({
  open,
  onOpenChange,
  student,
  batchName,
  monthlySummary,
  yearlySummary,
}: AttendanceReportDialogProps) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const getAttendanceGrade = (pct: number) => {
    if (pct >= 90) return { label: "EXEMPLARY ATTENDANCE", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (pct >= 75) return { label: "REGULAR ATTENDANCE", color: "text-blue-700 bg-blue-50 border-blue-200" };
    return { label: "ATTENDANCE WARNING (<75%)", color: "text-rose-700 bg-rose-50 border-rose-200" };
  };

  const grade = getAttendanceGrade(yearlySummary.attendancePercentage);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto print:p-0 print:border-none print:shadow-none">
        <DialogHeader className="print:hidden pb-2 border-b flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Printer className="h-5 w-5 text-indigo-600" />
            Official Attendance Transcript & Report
          </DialogTitle>
          <Button size="sm" onClick={handlePrint} className="gap-1.5 bg-slate-900 text-white dark:bg-indigo-600">
            <Printer className="h-4 w-4" />
            Print Report
          </Button>
        </DialogHeader>

        {/* Printable Card Area */}
        <div className="p-6 bg-white dark:bg-card text-foreground rounded-xl border print:border-none space-y-6">
          {/* Header */}
          <div className="border-b pb-4 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight uppercase text-foreground">
                    TutorOS Academy
                  </h2>
                  <p className="text-xs text-muted-foreground font-medium">
                    Integrated Tuition & Academic Management System
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-1 text-[11px] font-bold rounded-md uppercase border border-indigo-200 bg-indigo-50 text-indigo-700">
                Official Report Card
              </span>
              <p className="text-[11px] text-muted-foreground pt-1">
                Generated: {new Date().toLocaleDateString("en-IN", { dateStyle: "medium" })}
              </p>
            </div>
          </div>

          {/* Student Particulars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-muted/30 border text-xs">
            <div>
              <span className="text-muted-foreground uppercase font-semibold text-[10px]">Student Name</span>
              <p className="font-bold text-sm text-foreground pt-0.5">
                {student.firstName} {student.lastName}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground uppercase font-semibold text-[10px]">Enrollment ID</span>
              <p className="font-mono font-bold text-sm text-foreground pt-0.5 uppercase">
                {student.id}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground uppercase font-semibold text-[10px]">Standard / Cohort</span>
              <p className="font-bold text-sm text-foreground pt-0.5">
                {student.standard} • {batchName.split(" ")[0]}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground uppercase font-semibold text-[10px]">Academic Year</span>
              <p className="font-bold text-sm text-foreground pt-0.5">
                {yearlySummary.academicYear}
              </p>
            </div>
          </div>

          {/* Overall Standing Banner */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${grade.color}`}>
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 shrink-0" />
              <div>
                <p className="font-black text-sm tracking-wide">{grade.label}</p>
                <p className="text-xs opacity-90">
                  Annual cumulative attendance performance across all scheduled lectures.
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-3xl font-black">
                {yearlySummary.attendancePercentage}%
              </span>
              <span className="text-xs block opacity-80 font-medium">Year Aggregate</span>
            </div>
          </div>

          {/* Month-Wise Breakdown Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-indigo-600" />
              Month-by-Month Attendance Log ({yearlySummary.academicYear})
            </h3>

            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 border-b font-semibold text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Month</th>
                    <th className="px-3 py-2 text-center">Working Days</th>
                    <th className="px-3 py-2 text-center text-emerald-600">Present</th>
                    <th className="px-3 py-2 text-center text-rose-600">Absent</th>
                    <th className="px-3 py-2 text-center text-amber-600">Late</th>
                    <th className="px-3 py-2 text-right">Attendance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {yearlySummary.monthlyBreakdown.map((row) => (
                    <tr key={row.month} className={row.month === monthlySummary.month ? "bg-indigo-50/40 font-semibold" : ""}>
                      <td className="px-3 py-2">
                        {row.monthName}
                        {row.month === monthlySummary.month && (
                          <span className="ml-1.5 text-[9px] uppercase px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">
                            Current
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center text-muted-foreground">{row.totalDays}</td>
                      <td className="px-3 py-2 text-center text-emerald-600 font-medium">{row.presentDays}</td>
                      <td className="px-3 py-2 text-center text-rose-600 font-medium">{row.absentDays}</td>
                      <td className="px-3 py-2 text-center text-amber-600 font-medium">{row.lateDays}</td>
                      <td className="px-3 py-2 text-right font-bold">
                        <span className={row.percentage >= 85 ? "text-emerald-600" : row.percentage >= 75 ? "text-amber-600" : "text-rose-600"}>
                          {row.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-muted/70 font-bold border-t">
                    <td className="px-3 py-2.5">Academic Year Total</td>
                    <td className="px-3 py-2.5 text-center">{yearlySummary.totalWorkingDays}</td>
                    <td className="px-3 py-2.5 text-center text-emerald-600">{yearlySummary.presentDays}</td>
                    <td className="px-3 py-2.5 text-center text-rose-600">{yearlySummary.absentDays}</td>
                    <td className="px-3 py-2.5 text-center text-amber-600">{yearlySummary.lateDays}</td>
                    <td className="px-3 py-2.5 text-right text-indigo-600 font-extrabold">
                      {yearlySummary.attendancePercentage}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Remarks & Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t text-xs">
            <div className="space-y-1">
              <span className="font-bold text-muted-foreground uppercase text-[10px]">Guardian Acknowledgment</span>
              <p className="text-[11px] text-muted-foreground">
                Parent WhatsApp: {student.parentPhone}
              </p>
              <div className="pt-8 border-b w-48 border-dashed border-muted-foreground/40" />
              <span className="text-[10px] text-muted-foreground">Parent / Guardian Signature</span>
            </div>

            <div className="space-y-1 text-right flex flex-col items-end">
              <span className="font-bold text-muted-foreground uppercase text-[10px]">Institutional Verification</span>
              <p className="text-[11px] text-muted-foreground">
                TutorOS Academic Director
              </p>
              <div className="pt-8 border-b w-48 border-dashed border-muted-foreground/40" />
              <span className="text-[10px] text-muted-foreground">Authorized Signature & Seal</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AttendanceReportDialog;
