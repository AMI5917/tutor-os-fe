// src/app/dashboard/results/page.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MOCK_BATCHES } from "@/lib/mock-data";
import {
  SemesterResult,
  SemesterCode,
  BatchResultsSummary,
  StudentAnnualPerformance,
} from "@/types/results";
import {
  SEMESTER_OPTIONS,
  ACADEMIC_YEARS,
  getStoredResults,
  calculateBatchResultsSummary,
  getStudentAnnualPerformance,
  exportResultsToCSV,
} from "@/lib/results-data";
import { EditSemesterMarksDialog } from "@/components/results/EditSemesterMarksDialog";
import { StudentReportCardDialog } from "@/components/results/StudentReportCardDialog";
import { PrintableReportCardDialog } from "@/components/results/PrintableReportCardDialog";
import {
  Award,
  BookOpen,
  Calendar,
  Download,
  Printer,
  Search,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Layers,
  GraduationCap,
  Edit3,
  RefreshCw,
  PieChart,
  User,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useAcademicYear } from "@/lib/academic-year-context";

export default function ResultsPage() {
  const { selectedYear, setSelectedYear } = useAcademicYear();

  // Navigation & Filter States
  const [selectedBatch, setSelectedBatch] = useState<string>("ALL");
  const [selectedSemester, setSelectedSemester] = useState<SemesterCode>("SEM_1");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(
    selectedYear && selectedYear !== "ALL" ? selectedYear : "2026-2027"
  );

  useEffect(() => {
    if (selectedYear && selectedYear !== "ALL") {
      setSelectedAcademicYear(selectedYear);
    }
  }, [selectedYear]);
  const [performanceFilter, setPerformanceFilter] = useState<"ALL" | "DISTINCTION" | "FIRST_CLASS" | "NEEDS_IMPROVEMENT">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("semester-results");

  // Records state
  const [results, setResults] = useState<SemesterResult[]>([]);

  // Dialog States
  const [reportCardStudentId, setReportCardStudentId] = useState<string | null>(null);
  const [isReportCardOpen, setIsReportCardOpen] = useState<boolean>(false);

  const [editMarksTarget, setEditMarksTarget] = useState<SemesterResult | null>(null);
  const [isEditMarksOpen, setIsEditMarksOpen] = useState<boolean>(false);

  const [printablePerformance, setPrintablePerformance] = useState<StudentAnnualPerformance | null>(null);
  const [isPrintableOpen, setIsPrintableOpen] = useState<boolean>(false);

  // Load results from storage
  const refreshResults = () => {
    setResults(getStoredResults());
  };

  useEffect(() => {
    refreshResults();
  }, []);

  // Filter results for current batch and semester
  const semesterResults = useMemo(() => {
    return results.filter(
      (r) =>
        (selectedBatch === "ALL" || r.batchId === selectedBatch) &&
        r.semesterCode === selectedSemester &&
        r.academicYear === selectedAcademicYear
    );
  }, [results, selectedBatch, selectedSemester, selectedAcademicYear]);

  // Batch analytics summary
  const batchSummary: BatchResultsSummary = useMemo(() => {
    return calculateBatchResultsSummary(selectedBatch, selectedSemester, results);
  }, [selectedBatch, selectedSemester, results]);

  // Filtered displayed student list
  const displayedResults = useMemo(() => {
    return semesterResults.filter((r) => {
      // Performance tier filter
      if (performanceFilter === "DISTINCTION" && r.aggregatePercentage < 85) return false;
      if (
        performanceFilter === "FIRST_CLASS" &&
        (r.aggregatePercentage < 70 || r.aggregatePercentage >= 85)
      ) {
        return false;
      }
      if (performanceFilter === "NEEDS_IMPROVEMENT" && r.aggregatePercentage >= 70) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = r.studentName.toLowerCase().includes(query);
        const matchesRoll = r.rollNumber.toLowerCase().includes(query);
        const matchesBatch = r.batchCode.toLowerCase().includes(query);
        return matchesName || matchesRoll || matchesBatch;
      }
      return true;
    });
  }, [semesterResults, performanceFilter, searchQuery]);

  // Annual student performances for Academic Year Tracking (Tab 2)
  const annualPerformances: StudentAnnualPerformance[] = useMemo(() => {
    const studentIds = Array.from(
      new Set(
        results
          .filter((r) => selectedBatch === "ALL" || r.batchId === selectedBatch)
          .map((r) => r.studentId)
      )
    );

    return studentIds
      .map((id) => getStudentAnnualPerformance(id, selectedAcademicYear, results))
      .filter((p): p is StudentAnnualPerformance => p !== null);
  }, [results, selectedBatch, selectedAcademicYear]);

  // Handle result update callback
  const handleResultUpdated = (updated: SemesterResult) => {
    setResults((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    );
    refreshResults();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Semester Results & Report Cards</span>
                <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {batchSummary.batchCode}
                </Badge>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Centralized academic grading, semester-wise progress, subject marks editing & annual report cards
              </p>
            </div>
          </div>
        </div>

        {/* Global Selectors */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Batch Selector */}
          <div className="w-48">
            <Select value={selectedBatch} onValueChange={setSelectedBatch}>
              <SelectTrigger className="h-9 text-xs font-medium">
                <SelectValue placeholder="Select Batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Batches</SelectItem>
                {MOCK_BATCHES.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.code} — {b.name.slice(0, 22)}...
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Semester Selector */}
          <div className="w-44">
            <Select
              value={selectedSemester}
              onValueChange={(val) => setSelectedSemester(val as SemesterCode)}
            >
              <SelectTrigger className="h-9 text-xs font-medium">
                <SelectValue placeholder="Select Semester" />
              </SelectTrigger>
              <SelectContent>
                {SEMESTER_OPTIONS.map((s) => (
                  <SelectItem key={s.code} value={s.code}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Academic Year indicator - controlled globally from top header */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-sky-50/50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-900 text-xs text-sky-800 dark:text-sky-300">
            <Calendar className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
            <span>AY: <strong className="font-semibold">{selectedYear === "ALL" ? "All Years" : selectedYear}</strong></span>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={refreshResults}
            className="h-9 px-2.5 text-slate-600 hover:text-slate-900"
            title="Refresh Results"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards Row (Semester Summary) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Batch Average Score */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Batch Average Score
            </CardTitle>
            <Award className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {batchSummary.batchAveragePercentage}%
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Average GPA: <strong>{batchSummary.batchAverageGpa} / 4.0</strong>
            </p>
          </CardContent>
        </Card>

        {/* Passing Rate */}
        <Card className="border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Passing Rate
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {batchSummary.passingRatePercentage}%
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              {batchSummary.evaluatedStudents} of {batchSummary.totalStudents} Evaluated
            </p>
          </CardContent>
        </Card>

        {/* Top Performer */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Top Scorer
            </CardTitle>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {batchSummary.topScorePercentage}%
            </div>
            <p className="text-xs text-slate-500 truncate mt-1">
              {batchSummary.topScorerName}
            </p>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Distinction & Merit
            </CardTitle>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {batchSummary.distinctionCount} Dist.
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {batchSummary.distinctionCount + batchSummary.firstClassCount} Students
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {batchSummary.distinctionCount} &ge; 85% • {batchSummary.firstClassCount} in 70-84%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Container */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
          <TabsList className="bg-slate-100 dark:bg-slate-800 p-1">
            <TabsTrigger value="semester-results" className="text-xs font-medium gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>Semester Results & Marks</span>
            </TabsTrigger>
            <TabsTrigger value="academic-year" className="text-xs font-medium gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              <span>Academic Year Progress Report</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs font-medium gap-1.5">
              <PieChart className="h-3.5 w-3.5" />
              <span>Batch Analytics & Gradebook</span>
            </TabsTrigger>
          </TabsList>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                exportResultsToCSV(
                  semesterResults,
                  `TutorOS_Results_${selectedBatch}_${selectedSemester}.csv`
                )
              }
              className="text-xs font-medium gap-1.5 border-slate-300 dark:border-slate-700 h-8"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Gradebook CSV</span>
            </Button>
          </div>
        </div>

        {/* TAB 1: SEMESTER RESULTS & MARKS MANAGEMENT */}
        <TabsContent value="semester-results" className="space-y-4">
          {/* Filters & Search Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            {/* Filter pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPerformanceFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  performanceFilter === "ALL"
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                <span>All Students</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 font-bold">
                  {semesterResults.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPerformanceFilter("DISTINCTION")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  performanceFilter === "DISTINCTION"
                    ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/20"
                    : "bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 hover:bg-indigo-100"
                }`}
              >
                <Award className="h-3.5 w-3.5" />
                <span>Distinction (&ge;85%)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 font-bold">
                  {batchSummary.distinctionCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPerformanceFilter("FIRST_CLASS")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  performanceFilter === "FIRST_CLASS"
                    ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/20"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-100"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>First Class (70-84%)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 font-bold">
                  {batchSummary.firstClassCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPerformanceFilter("NEEDS_IMPROVEMENT")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  performanceFilter === "NEEDS_IMPROVEMENT"
                    ? "bg-amber-600 text-white shadow-sm ring-2 ring-amber-600/20"
                    : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 hover:bg-amber-100"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Needs Improvement (&lt;70%)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 font-bold">
                  {batchSummary.secondClassCount + batchSummary.retestCount}
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search student or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>

          {/* Student Semester Results Table */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Student & Roll</th>
                    <th className="py-3 px-3">Batch</th>
                    <th className="py-3 px-3 text-center">Subjects</th>
                    <th className="py-3 px-3 text-right">Total Marks</th>
                    <th className="py-3 px-3 text-right">Percentage</th>
                    <th className="py-3 px-3 text-center">GPA (4.0)</th>
                    <th className="py-3 px-3 text-center">Grade</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {displayedResults.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500">
                        No student performance records found matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    displayedResults.map((r) => (
                      <tr
                        key={r.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Student Name */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => {
                              setReportCardStudentId(r.studentId);
                              setIsReportCardOpen(true);
                            }}
                            className="font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 hover:underline text-left block"
                          >
                            {r.studentName}
                          </button>
                          <span className="block text-[11px] text-slate-400 mt-0.5">
                            {r.rollNumber} • {r.gradeLevel} Grade
                          </span>
                        </td>

                        {/* Batch Code */}
                        <td className="py-3.5 px-3">
                          <Badge variant="outline" className="font-semibold text-[10px]">
                            {r.batchCode}
                          </Badge>
                        </td>

                        {/* Subjects Count */}
                        <td className="py-3.5 px-3 text-center text-slate-600 dark:text-slate-400 font-medium">
                          {r.scores.length} Subjects
                        </td>

                        {/* Total Marks */}
                        <td className="py-3.5 px-3 text-right font-mono font-medium text-slate-800 dark:text-slate-200">
                          {r.totalMarksScored} / {r.maxTotalMarks}
                        </td>

                        {/* Percentage */}
                        <td className="py-3.5 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                          {r.aggregatePercentage}%
                        </td>

                        {/* GPA */}
                        <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-900 dark:text-slate-100">
                          {r.gpa.toFixed(1)}
                        </td>

                        {/* Grade */}
                        <td className="py-3.5 px-3 text-center">
                          <Badge
                            variant="outline"
                            className={`font-bold text-[10px] px-2 py-0.5 ${
                              r.aggregatePercentage >= 85
                                ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300"
                                : r.aggregatePercentage >= 70
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300"
                            }`}
                          >
                            {r.overallGrade}
                          </Badge>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-3 text-center">
                          <Badge
                            variant="outline"
                            className={`text-[10px] uppercase font-semibold ${
                              r.status === "PUBLISHED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            {r.status}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* View Detailed Report Card */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setReportCardStudentId(r.studentId);
                                setIsReportCardOpen(true);
                              }}
                              className="h-7 px-2 text-[11px] border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 font-medium"
                              title="Detailed Report Card"
                            >
                              <Award className="h-3 w-3 mr-1" /> Report Card
                            </Button>

                            {/* Edit Marks */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditMarksTarget(r);
                                setIsEditMarksOpen(true);
                              }}
                              className="h-7 px-2 text-[11px] text-slate-700 hover:bg-slate-100 font-medium"
                              title="Edit Marks and Remarks"
                            >
                              <Edit3 className="h-3 w-3 mr-1" /> Edit Marks
                            </Button>

                            {/* Print Report Card */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const annual = getStudentAnnualPerformance(
                                  r.studentId,
                                  selectedAcademicYear,
                                  results
                                );
                                if (annual) {
                                  setPrintablePerformance(annual);
                                  setIsPrintableOpen(true);
                                }
                              }}
                              className="h-7 px-1.5 text-slate-500 hover:text-indigo-600"
                              title="Print Official Transcript"
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 2: ACADEMIC YEAR PROGRESS REPORT */}
        <TabsContent value="academic-year" className="space-y-4">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-indigo-600" />
                    <span>Academic Year Progress Matrix — AY {selectedAcademicYear}</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Comprehensive annual progress report tracking Semester 1 vs Semester 2 growth, attendance summary, and cumulative GPA.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Student & Batch</th>
                      <th className="py-3 px-3 text-center">Sem 1 (Mid-Term)</th>
                      <th className="py-3 px-3 text-center">Sem 2 (Finals)</th>
                      <th className="py-3 px-3 text-center">Annual Percentage</th>
                      <th className="py-3 px-3 text-center">Cumulative GPA</th>
                      <th className="py-3 px-3 text-center">Attendance Record</th>
                      <th className="py-3 px-3 text-center">Progress Trajectory</th>
                      <th className="py-3 px-3">Academic Standing</th>
                      <th className="py-3 px-4 text-center">Report Card</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {annualPerformances.map((p) => (
                      <tr
                        key={p.studentId}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Student Name */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => {
                              setReportCardStudentId(p.studentId);
                              setIsReportCardOpen(true);
                            }}
                            className="font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 text-left block"
                          >
                            {p.studentName}
                          </button>
                          <span className="block text-[11px] text-slate-400">
                            {p.batchCode} • {p.rollNumber}
                          </span>
                        </td>

                        {/* Sem 1 */}
                        <td className="py-3.5 px-3 text-center font-medium">
                          {p.sem1Percentage !== undefined ? (
                            <span className="font-semibold">{p.sem1Percentage}%</span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Sem 2 */}
                        <td className="py-3.5 px-3 text-center font-medium">
                          {p.sem2Percentage !== undefined ? (
                            <span className="font-semibold">{p.sem2Percentage}%</span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Annual Percentage */}
                        <td className="py-3.5 px-3 text-center font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                          {p.overallAnnualPercentage}%
                        </td>

                        {/* Cumulative GPA */}
                        <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-900 dark:text-slate-100">
                          {p.overallAnnualGpa.toFixed(1)}
                        </td>

                        {/* Attendance Summary */}
                        <td className="py-3.5 px-3 text-center">
                          <Badge
                            variant="outline"
                            className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border-emerald-200"
                          >
                            {p.attendanceSummary.attendancePercentage}% Attendance
                          </Badge>
                          <span className="block text-[9px] text-slate-400 mt-0.5">
                            {p.attendanceSummary.totalPresentDays} / {p.attendanceSummary.totalWorkingDays} days
                          </span>
                        </td>

                        {/* Progress Trajectory */}
                        <td className="py-3.5 px-3 text-center">
                          {p.trajectory === "IMPROVED" ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                              <TrendingUp className="h-3.5 w-3.5" /> +{p.trajectoryDelta}%
                            </span>
                          ) : p.trajectory === "DECLINED" ? (
                            <span className="inline-flex items-center gap-1 text-rose-600 font-bold text-[11px]">
                              <TrendingDown className="h-3.5 w-3.5" /> {p.trajectoryDelta}%
                            </span>
                          ) : (
                            <span className="text-slate-500 font-medium text-[11px]">Consistent</span>
                          )}
                        </td>

                        {/* Standing */}
                        <td className="py-3.5 px-3">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs block">
                            {p.standing}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setPrintablePerformance(p);
                              setIsPrintableOpen(true);
                            }}
                            className="h-7 text-xs px-2.5 gap-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-medium"
                          >
                            <Printer className="h-3 w-3" /> Transcript
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: BATCH ANALYTICS & GRADEBOOK */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Grade Distribution Breakdown */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-1">
              <CardHeader className="p-4 pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <PieChart className="h-4 w-4 text-indigo-600" />
                  <span>Grade Distribution Breakdown</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Performance across {batchSummary.batchName} ({batchSummary.semesterCode})
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between font-medium mb-1">
                      <span>A+ Grade (&ge;90%)</span>
                      <span className="font-bold text-indigo-600">
                        {batchSummary.distinctionCount} Students
                      </span>
                    </div>
                    <Progress
                      value={
                        batchSummary.totalStudents > 0
                          ? (batchSummary.distinctionCount / batchSummary.totalStudents) * 100
                          : 0
                      }
                      className="h-1.5"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-medium mb-1">
                      <span>A Grade (80-89%)</span>
                      <span className="font-bold text-emerald-600">
                        {batchSummary.firstClassCount} Students
                      </span>
                    </div>
                    <Progress
                      value={
                        batchSummary.totalStudents > 0
                          ? (batchSummary.firstClassCount / batchSummary.totalStudents) * 100
                          : 0
                      }
                      className="h-1.5"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-medium mb-1">
                      <span>B+ / B Grade (60-79%)</span>
                      <span className="font-bold text-amber-600">
                        {batchSummary.secondClassCount} Students
                      </span>
                    </div>
                    <Progress
                      value={
                        batchSummary.totalStudents > 0
                          ? (batchSummary.secondClassCount / batchSummary.totalStudents) * 100
                          : 0
                      }
                      className="h-1.5"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-medium mb-1">
                      <span>Retest / Below 50%</span>
                      <span className="font-bold text-rose-600">
                        {batchSummary.retestCount} Students
                      </span>
                    </div>
                    <Progress
                      value={
                        batchSummary.totalStudents > 0
                          ? (batchSummary.retestCount / batchSummary.totalStudents) * 100
                          : 0
                      }
                      className="h-1.5"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                  <div className="flex justify-between py-0.5">
                    <span>Evaluated Cohort:</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {batchSummary.evaluatedStudents} / {batchSummary.totalStudents} Students
                    </strong>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Batch Overall Passing Rate:</span>
                    <strong className="text-emerald-600">
                      {batchSummary.passingRatePercentage}%
                    </strong>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Batch-wise Results Comparison Table */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
              <CardHeader className="p-4 pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-indigo-600" />
                  <span>Cross-Batch Performance Comparison</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Comparative performance metrics across all active cohorts for {selectedSemester}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-4">Batch Name</th>
                        <th className="py-2.5 px-3 text-center">Students</th>
                        <th className="py-2.5 px-3 text-right">Avg Score</th>
                        <th className="py-2.5 px-3 text-center">Avg GPA</th>
                        <th className="py-2.5 px-3 text-right">Top Score</th>
                        <th className="py-2.5 px-3 text-right">Pass Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {MOCK_BATCHES.map((b) => {
                        const sum = calculateBatchResultsSummary(b.id, selectedSemester, results);
                        return (
                          <tr key={b.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                              {b.code}
                              <span className="block text-[11px] text-slate-500 font-normal">
                                {b.name}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center font-semibold">
                              {sum.totalStudents}
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400">
                              {sum.batchAveragePercentage}%
                            </td>
                            <td className="py-3 px-3 text-center font-mono font-medium">
                              {sum.batchAverageGpa.toFixed(1)}
                            </td>
                            <td className="py-3 px-3 text-right font-medium">
                              {sum.topScorePercentage}%
                              <span className="block text-[10px] text-slate-400 truncate max-w-[120px] ml-auto">
                                {sum.topScorerName}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right font-semibold text-emerald-600">
                              {sum.passingRatePercentage}%
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
        </TabsContent>
      </Tabs>

      {/* DIALOG 1: Student Detailed Report Card Modal */}
      <StudentReportCardDialog
        studentId={reportCardStudentId}
        academicYear={selectedAcademicYear}
        open={isReportCardOpen}
        onOpenChange={setIsReportCardOpen}
        onEditMarksClick={(res) => {
          setEditMarksTarget(res);
          setIsEditMarksOpen(true);
        }}
        onPrintTranscriptClick={(perf) => {
          setPrintablePerformance(perf);
          setIsPrintableOpen(true);
        }}
      />

      {/* DIALOG 2: Edit Semester Marks & Remarks Modal */}
      <EditSemesterMarksDialog
        result={editMarksTarget}
        open={isEditMarksOpen}
        onOpenChange={setIsEditMarksOpen}
        onResultUpdated={handleResultUpdated}
      />

      {/* DIALOG 3: Official Printable Academic Transcript */}
      <PrintableReportCardDialog
        performance={printablePerformance}
        open={isPrintableOpen}
        onOpenChange={setIsPrintableOpen}
      />
    </div>
  );
}
