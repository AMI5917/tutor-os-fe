// src/components/results/PrintableReportCardDialog.tsx
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SemesterResult,
  StudentAnnualPerformance,
} from "@/types/results";
import { Printer, Download, Award, ShieldCheck, CheckCircle2 } from "lucide-react";

interface PrintableReportCardDialogProps {
  performance: StudentAnnualPerformance | null;
  activeSemesterResult?: SemesterResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrintableReportCardDialog({
  performance,
  activeSemesterResult,
  open,
  onOpenChange,
}: PrintableReportCardDialogProps) {
  if (!performance) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentResult =
    activeSemesterResult ||
    performance.semesterResults[performance.semesterResults.length - 1];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>
            Academic Transcript - {performance.studentName} ({performance.rollNumber})
          </DialogTitle>
          <DialogDescription>
            Official Semester & Academic Year Report Card
          </DialogDescription>
        </DialogHeader>

        {/* Action bar for screen view */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white dark:bg-slate-950 border-b print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Official Academic Transcript
            </span>
            <span className="text-sm font-medium text-slate-200">
              #{performance.rollNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium gap-1.5 shadow"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Save PDF</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Close
            </Button>
          </div>
        </div>

        {/* Printable Transcript Paper */}
        <div
          id="printable-report-card"
          className="p-8 sm:p-10 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans"
        >
          {/* Header */}
          <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-5 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                    T
                  </div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white uppercase">
                    TutorOS Academy of Academic Excellence
                  </h1>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                  Affiliated with National Board of Secondary & Higher Secondary Education
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Campus Knowledge Park, Linking Road, Mumbai 400050 | Institution Code: MH-40291
                </p>
              </div>
              <div className="sm:text-right">
                <span className="inline-block bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold px-3 py-1 rounded uppercase tracking-wider">
                  Official Grade Report
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1.5">
                  AY {performance.academicYear}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Issued on: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>

          {/* Student Profile Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs mb-6">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-semibold uppercase text-[10px]">
                Student Name
              </span>
              <span className="text-slate-900 dark:text-slate-100 font-bold text-sm">
                {performance.studentName}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-semibold uppercase text-[10px]">
                Roll / Student ID
              </span>
              <span className="text-slate-900 dark:text-slate-100 font-semibold text-sm">
                {performance.rollNumber}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-semibold uppercase text-[10px]">
                Cohort / Batch
              </span>
              <span className="text-slate-900 dark:text-slate-100 font-semibold text-sm">
                {performance.batchCode} ({performance.gradeLevel} Grade)
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-semibold uppercase text-[10px]">
                Academic Standing
              </span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                {performance.standing}
              </span>
            </div>
          </div>

          {/* Subject Performance Breakdown Table */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mb-6">
            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Detailed Subject Evaluation — {currentResult?.semesterName || "Semester Evaluation"}
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Max Marks: 100 per subject
              </span>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-4 w-12 text-center">#</th>
                  <th className="py-2.5 px-4">Subject Name</th>
                  <th className="py-2.5 px-3 text-center">Theory (70)</th>
                  <th className="py-2.5 px-3 text-center">Practical (30)</th>
                  <th className="py-2.5 px-3 text-center">Total (100)</th>
                  <th className="py-2.5 px-3 text-center">Grade</th>
                  <th className="py-2.5 px-3 text-center">GPA (4.0)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {currentResult?.scores.map((sc, i) => (
                  <tr key={sc.id || i}>
                    <td className="py-2.5 px-4 text-center font-medium text-slate-500">{i + 1}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {sc.subjectName}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        Code: {sc.subjectCode}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">{sc.theoryMarks}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{sc.practicalMarks}</td>
                    <td className="py-2.5 px-3 text-center font-bold font-mono text-slate-900 dark:text-slate-100">
                      {sc.totalMarks}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {sc.grade}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-medium">
                      {sc.gpaPoint.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 dark:bg-slate-800/60 font-bold border-t-2 border-slate-300 dark:border-slate-700">
                <tr>
                  <td colSpan={2} className="py-2.5 px-4 text-slate-800 dark:text-slate-200">
                    Semester Aggregate Total
                  </td>
                  <td colSpan={2} className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400">
                    Max Marks: {currentResult?.maxTotalMarks}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                    {currentResult?.totalMarksScored}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-900 dark:text-slate-100">
                    {currentResult?.overallGrade}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold font-mono">
                    {currentResult?.gpa.toFixed(1)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Academic Year Summary & Attendance Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Semester-wise Comparison Box */}
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider block text-[11px]">
                Semester-wise Performance Comparison
              </span>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400">Semester 1 (Mid-Term):</span>
                <span className="font-bold">
                  {performance.sem1Percentage !== undefined ? `${performance.sem1Percentage}%` : "N/A"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400">Semester 2 (Finals):</span>
                <span className="font-bold">
                  {performance.sem2Percentage !== undefined ? `${performance.sem2Percentage}%` : "N/A"}
                </span>
              </div>
              <div className="flex justify-between py-1 font-bold text-indigo-600 dark:text-indigo-400">
                <span>Cumulative Annual Average:</span>
                <span>{performance.overallAnnualPercentage}% (GPA: {performance.overallAnnualGpa})</span>
              </div>
            </div>

            {/* Attendance & Conduct Box */}
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider block text-[11px]">
                Attendance & General Conduct
              </span>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400">Total Working Days:</span>
                <span className="font-bold">{performance.attendanceSummary.totalWorkingDays}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400">Days Present / Attended:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {performance.attendanceSummary.totalPresentDays} ({performance.attendanceSummary.attendancePercentage}%)
                </span>
              </div>
              <div className="flex justify-between py-1 text-slate-700 dark:text-slate-300">
                <span>Classroom Demeanor:</span>
                <span className="font-semibold text-emerald-600">Exemplary / Diligent</span>
              </div>
            </div>
          </div>

          {/* Teacher Remarks Box */}
          <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs mb-8">
            <span className="font-bold text-indigo-950 dark:text-indigo-200 block mb-1">
              Faculty Remarks & Mentorship Feedback:
            </span>
            <p className="text-slate-700 dark:text-slate-300 italic">
              &ldquo;{currentResult?.teacherRemarks || performance.overallRemarks}&rdquo;
            </p>
          </div>

          {/* Grading Legend & Signatures */}
          <div className="pt-6 border-t border-slate-300 dark:border-slate-700">
            <div className="grid grid-cols-2 gap-8 text-xs text-slate-500">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1 text-[11px]">
                  Grading Scale Legend:
                </p>
                <p className="text-[10px] leading-relaxed">
                  <strong>A+</strong> (90-100% | 4.0) • <strong>A</strong> (80-89% | 3.7) •{" "}
                  <strong>B+</strong> (70-79% | 3.3) • <strong>B</strong> (60-69% | 3.0) •{" "}
                  <strong>C</strong> (50-59% | 2.3) • <strong>D</strong> (40-49% | 1.7) •{" "}
                  <strong>F</strong> (&lt;40% | 0.0)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="flex flex-col justify-end items-center">
                  <div className="w-32 border-b border-slate-400 dark:border-slate-600 mb-1 h-8 flex items-center justify-center font-serif italic text-xs">
                    Class Teacher
                  </div>
                  <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">
                    Faculty In-Charge
                  </span>
                </div>

                <div className="flex flex-col justify-end items-center">
                  <div className="w-32 border-b border-slate-400 dark:border-slate-600 mb-1 h-8 flex items-center justify-center font-serif italic text-xs">
                    Director / Principal
                  </div>
                  <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">
                    Academic Dean
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
