// src/components/attendance/StudentAttendanceDetailDialog.tsx
"use client";

import React, { useState } from "react";
import { Student } from "@/types/roles";
import {
  AttendanceRecord,
  MonthlyAttendanceSummary,
  YearlyAttendanceSummary,
} from "@/types/attendance";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Printer,
  Phone,
  BookOpen,
  TrendingUp,
  User,
  Clock,
  Layers,
} from "lucide-react";
import { AttendanceReportDialog } from "./AttendanceReportDialog";

interface StudentAttendanceDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student;
  batchName: string;
  monthlySummary: MonthlyAttendanceSummary;
  yearlySummary: YearlyAttendanceSummary;
  allRecords: AttendanceRecord[];
}

export function StudentAttendanceDetailDialog({
  open,
  onOpenChange,
  student,
  batchName,
  monthlySummary,
  yearlySummary,
  allRecords,
}: StudentAttendanceDetailDialogProps) {
  const [reportOpen, setReportOpen] = useState(false);
  const [filterMonthOnly, setFilterMonthOnly] = useState(true);

  // Student specific records sorted newest first
  const studentRecords = allRecords
    .filter((r) => r.studentId === student.id)
    .filter((r) => (!filterMonthOnly ? true : r.date.startsWith(monthlySummary.month)))
    .sort((a, b) => b.date.localeCompare(a.date));

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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 font-bold text-lg dark:bg-indigo-950/60 dark:text-indigo-400">
                  {student.firstName[0]}
                  {student.lastName[0]}
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    {student.firstName} {student.lastName}
                    <Badge variant="outline" className="text-xs font-normal">
                      {student.standard}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription className="text-xs flex items-center gap-3 pt-1">
                    <span className="flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-indigo-500" />
                      {batchName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-emerald-500" />
                      {student.parentPhone}
                    </span>
                  </DialogDescription>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setReportOpen(true)}
                className="gap-1.5 self-start sm:self-center"
              >
                <Printer className="h-4 w-4" />
                Generate Report
              </Button>
            </div>
          </DialogHeader>

          {/* Key Stat Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
            {/* Monthly Attendance */}
            <div className="rounded-xl border p-3.5 bg-card space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{monthlySummary.monthName.split(" ")[0]} Attendance</span>
                <Calendar className="h-3.5 w-3.5 text-indigo-500" />
              </div>
              <div className="text-2xl font-extrabold tracking-tight">
                <span className={getPercentageColor(monthlySummary.attendancePercentage)}>
                  {monthlySummary.attendancePercentage}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${getPercentageBg(monthlySummary.attendancePercentage)}`}
                  style={{ width: `${monthlySummary.attendancePercentage}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground pt-0.5">
                {monthlySummary.presentDays + monthlySummary.lateDays} of {monthlySummary.totalWorkingDays} days
              </p>
            </div>

            {/* Academic Year Attendance */}
            <div className="rounded-xl border p-3.5 bg-card space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Year {yearlySummary.academicYear}</span>
                <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />
              </div>
              <div className="text-2xl font-extrabold tracking-tight">
                <span className={getPercentageColor(yearlySummary.attendancePercentage)}>
                  {yearlySummary.attendancePercentage}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${getPercentageBg(yearlySummary.attendancePercentage)}`}
                  style={{ width: `${yearlySummary.attendancePercentage}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground pt-0.5">
                Annual Cumulative
              </p>
            </div>

            {/* Present Days */}
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 dark:border-emerald-950 dark:bg-emerald-950/20 p-3.5 space-y-1">
              <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                <span>Present Days</span>
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
                {monthlySummary.presentDays}
              </div>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                Year Total: {yearlySummary.presentDays} days
              </p>
            </div>

            {/* Absent & Late */}
            <div className="rounded-xl border border-rose-100 bg-rose-50/50 dark:border-rose-950 dark:bg-rose-950/20 p-3.5 space-y-1">
              <div className="flex items-center justify-between text-xs text-rose-800 dark:text-rose-300 font-medium">
                <span>Absent / Late</span>
                <XCircle className="h-3.5 w-3.5 text-rose-600" />
              </div>
              <div className="text-2xl font-extrabold text-rose-700 dark:text-rose-400">
                {monthlySummary.absentDays} <span className="text-xs font-normal text-amber-600">({monthlySummary.lateDays} Late)</span>
              </div>
              <p className="text-[10px] text-rose-600 dark:text-rose-400">
                Year Absences: {yearlySummary.absentDays}
              </p>
            </div>
          </div>

          {/* Academic Year Monthly Breakdown Bar */}
          <div className="rounded-xl border p-4 bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                Monthly Attendance Progression ({yearlySummary.academicYear})
              </h4>
              <Badge variant="outline" className="text-[10px]">
                {yearlySummary.monthlyBreakdown.length} Months Tracked
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {yearlySummary.monthlyBreakdown.map((mb) => (
                <div
                  key={mb.month}
                  className={`rounded-lg border p-2 text-center text-xs space-y-1 transition-all ${
                    mb.month === monthlySummary.month
                      ? "border-indigo-500 bg-indigo-50/80 dark:border-indigo-800 dark:bg-indigo-950/50"
                      : "bg-background"
                  }`}
                >
                  <p className="text-[11px] font-semibold text-muted-foreground truncate">
                    {mb.monthName.split(" ")[0]}
                  </p>
                  <p className={`text-sm font-bold ${getPercentageColor(mb.percentage)}`}>
                    {mb.percentage}%
                  </p>
                  <div className="flex justify-center gap-1 text-[9px] text-muted-foreground">
                    <span className="text-emerald-600 font-medium">{mb.presentDays}P</span>
                    <span>•</span>
                    <span className="text-rose-600 font-medium">{mb.absentDays}A</span>
                    <span>•</span>
                    <span className="text-amber-600 font-medium">{mb.lateDays}L</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Date-wise Attendance History Log */}
          <div className="space-y-3 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-600" />
                Date-wise Attendance Records
              </h4>
              <div className="flex items-center gap-1.5 text-xs">
                <Button
                  size="sm"
                  variant={filterMonthOnly ? "default" : "outline"}
                  onClick={() => setFilterMonthOnly(true)}
                  className="h-7 text-xs"
                >
                  {monthlySummary.monthName.split(" ")[0]} Only ({studentRecords.length})
                </Button>
                <Button
                  size="sm"
                  variant={!filterMonthOnly ? "default" : "outline"}
                  onClick={() => setFilterMonthOnly(false)}
                  className="h-7 text-xs"
                >
                  All Records
                </Button>
              </div>
            </div>

            <div className="rounded-lg border overflow-hidden">
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 border-b bg-muted/80 backdrop-blur font-semibold text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2 text-center">Status</th>
                      <th className="px-3 py-2">Remarks / Notes</th>
                      <th className="px-3 py-2 text-right">Recorded At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {studentRecords.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                          No attendance marked yet for this timeframe.
                        </td>
                      </tr>
                    ) : (
                      studentRecords.map((rec) => (
                        <tr key={rec.id} className="hover:bg-muted/30">
                          <td className="px-3 py-2 font-medium">
                            {new Date(rec.date + "T00:00:00").toLocaleDateString("en-IN", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <Badge
                              variant={
                                rec.status === "PRESENT"
                                  ? "success"
                                  : rec.status === "ABSENT"
                                  ? "destructive"
                                  : "warning"
                              }
                              className="text-[10px]"
                            >
                              {rec.status === "PRESENT" && <CheckCircle className="h-3 w-3 mr-1 inline" />}
                              {rec.status === "ABSENT" && <XCircle className="h-3 w-3 mr-1 inline" />}
                              {rec.status === "LATE" && <AlertCircle className="h-3 w-3 mr-1 inline" />}
                              {rec.status}
                            </Badge>
                          </td>
                          <td className="px-3 py-2 text-muted-foreground max-w-xs truncate">
                            {rec.remarks || <span className="italic text-muted-foreground/60">—</span>}
                          </td>
                          <td className="px-3 py-2 text-right text-muted-foreground text-[10px]">
                            {new Date(rec.markedAt).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Printable Report Modal */}
      {reportOpen && (
        <AttendanceReportDialog
          open={reportOpen}
          onOpenChange={setReportOpen}
          student={student}
          batchName={batchName}
          monthlySummary={monthlySummary}
          yearlySummary={yearlySummary}
        />
      )}
    </>
  );
}

export default StudentAttendanceDetailDialog;
