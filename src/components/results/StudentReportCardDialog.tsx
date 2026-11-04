// src/components/results/StudentReportCardDialog.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  SemesterResult,
  StudentAnnualPerformance,
  SemesterCode,
} from "@/types/results";
import {
  getStudentAnnualPerformance,
  getStoredResults,
} from "@/lib/results-data";
import {
  Award,
  Calendar,
  BookOpen,
  Printer,
  Edit3,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  User,
  GraduationCap,
} from "lucide-react";

interface StudentReportCardDialogProps {
  studentId: string | null;
  academicYear: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditMarksClick: (result: SemesterResult) => void;
  onPrintTranscriptClick: (performance: StudentAnnualPerformance) => void;
}

export function StudentReportCardDialog({
  studentId,
  academicYear,
  open,
  onOpenChange,
  onEditMarksClick,
  onPrintTranscriptClick,
}: StudentReportCardDialogProps) {
  const [selectedSemCode, setSelectedSemCode] = useState<SemesterCode>("SEM_1");

  const results = useMemo(() => {
    return getStoredResults();
  }, [open, studentId]);

  const performance: StudentAnnualPerformance | null = useMemo(() => {
    if (!studentId) return null;
    return getStudentAnnualPerformance(studentId, academicYear, results);
  }, [studentId, academicYear, results]);

  const activeSemesterResult = useMemo(() => {
    if (!performance) return null;
    return (
      performance.semesterResults.find((r) => r.semesterCode === selectedSemCode) ||
      performance.semesterResults[0] ||
      null
    );
  }, [performance, selectedSemCode]);

  if (!performance) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-6">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <span>{performance.studentName}</span>
                  <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {performance.batchCode}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1 mt-0.5">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3 text-slate-400" /> Roll: {performance.rollNumber} ({performance.gradeLevel} Grade)
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="h-3 w-3 text-amber-500" /> Standing:{" "}
                    <strong className="text-slate-800 dark:text-slate-200 font-semibold">{performance.standing}</strong>
                  </span>
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPrintTranscriptClick(performance)}
                className="text-xs h-8 px-2.5 gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 font-medium"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Official Report Card</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Annual KPI Cards Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3">
          {/* Annual Aggregate */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500 block font-medium">Overall Annual Score</span>
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {performance.overallAnnualPercentage}%
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Cumulative Grade: <strong>{performance.overallGrade}</strong>
            </span>
          </div>

          {/* Cumulative GPA */}
          <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-200/80 dark:border-indigo-800/50">
            <span className="text-xs text-indigo-700 dark:text-indigo-400 block font-medium">Annual GPA</span>
            <span className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
              {performance.overallAnnualGpa.toFixed(1)} / 4.0
            </span>
            <span className="text-[11px] text-indigo-600/80 dark:text-indigo-400/80 block mt-0.5">
              10.0 Scale: {(performance.overallAnnualGpa * 2.5).toFixed(1)}
            </span>
          </div>

          {/* Attendance Summary */}
          <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/80 dark:border-emerald-800/50">
            <span className="text-xs text-emerald-700 dark:text-emerald-400 block font-medium">Attendance Record</span>
            <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
              {performance.attendanceSummary.attendancePercentage}%
            </span>
            <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 block mt-0.5">
              {performance.attendanceSummary.totalPresentDays} of {performance.attendanceSummary.totalWorkingDays} days present
            </span>
          </div>

          {/* Academic Trajectory */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <span className="text-xs text-slate-500 block font-medium">Semester Trajectory</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {performance.trajectory === "IMPROVED" ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <span className="font-bold text-emerald-600 text-sm">+{performance.trajectoryDelta}%</span>
                  </>
                ) : performance.trajectory === "DECLINED" ? (
                  <>
                    <TrendingDown className="h-4 w-4 text-rose-600" />
                    <span className="font-bold text-rose-600 text-sm">{performance.trajectoryDelta}%</span>
                  </>
                ) : (
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">Consistent</span>
                )}
              </div>
            </div>
            <span className="text-[11px] text-slate-400">Sem 1: {performance.sem1Percentage}% → Sem 2: {performance.sem2Percentage}%</span>
          </div>
        </div>

        {/* Semester Selector Tabs */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2 mt-4">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedSemCode("SEM_1")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedSemCode === "SEM_1"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              Semester 1 (Mid-Term)
            </button>
            <button
              type="button"
              onClick={() => setSelectedSemCode("SEM_2")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedSemCode === "SEM_2"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              Semester 2 (Finals)
            </button>
          </div>

          {activeSemesterResult && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEditMarksClick(activeSemesterResult)}
              className="h-8 text-xs px-2.5 gap-1.5 border-slate-300 dark:border-slate-700 font-medium"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Semester Marks</span>
            </Button>
          )}
        </div>

        {/* Active Semester Results */}
        {activeSemesterResult && (
          <div className="space-y-4 pt-2">
            {/* Subject-wise Performance Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3 text-center">Theory (70)</th>
                    <th className="py-2.5 px-3 text-center">Practical (30)</th>
                    <th className="py-2.5 px-3 text-center">Total (100)</th>
                    <th className="py-2.5 px-3 w-28">Score Progress</th>
                    <th className="py-2.5 px-3 text-center">Grade</th>
                    <th className="py-2.5 px-3">Subject Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activeSemesterResult.scores.map((sc) => (
                    <tr key={sc.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100">
                        {sc.subjectName}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {sc.subjectCode}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">{sc.theoryMarks}</td>
                      <td className="py-3 px-3 text-center font-mono">{sc.practicalMarks}</td>
                      <td className="py-3 px-3 text-center font-bold font-mono text-slate-900 dark:text-slate-100 text-sm">
                        {sc.totalMarks}
                      </td>
                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          <Progress value={sc.percentage} className="h-1.5" />
                          <span className="text-[10px] text-slate-400 block text-right font-medium">
                            {sc.percentage}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge
                          variant="outline"
                          className="font-bold text-[10px] px-2 py-0.5 bg-slate-50 dark:bg-slate-800"
                        >
                          {sc.grade}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 text-[11px] italic">
                        &ldquo;{sc.feedback || "Satisfactory coursework engagement."}&rdquo;
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Teacher Remarks & Overall Feedback */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                Class Teacher Remarks & Evaluation ({activeSemesterResult.semesterName}):
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                &ldquo;{activeSemesterResult.teacherRemarks}&rdquo;
              </p>
              <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-400">
                <span>Evaluation Date: {activeSemesterResult.evaluationDate}</span>
                <span>Status: <strong className="text-slate-700 dark:text-slate-300 uppercase">{activeSemesterResult.status}</strong></span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
