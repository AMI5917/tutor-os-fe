// src/app/dashboard/students/page.tsx
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
  DirectoryStudent,
  StudentStatus,
  AvailableSubject,
} from "@/types/student-directory";
import {
  getStoredDirectoryStudents,
  AVAILABLE_SUBJECTS,
  exportStudentsToCSV,
  updateStudentStatus,
  ACADEMIC_YEAR_OPTIONS,
} from "@/lib/student-directory-data";
import { RegisterStudentDialog } from "@/components/students/RegisterStudentDialog";
import { ManageSubjectsDialog } from "@/components/students/ManageSubjectsDialog";
import { StudentProfileDialog } from "@/components/students/StudentProfileDialog";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import {
  UserPlus,
  Search,
  Phone,
  Edit3,
  Download,
  BookOpen,
  Calendar,
  Layers,
  GraduationCap,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Archive,
  Eye,
  ShieldAlert,
} from "lucide-react";

export default function StudentsDirectoryPage() {
  // Primary States
  const [students, setStudents] = useState<DirectoryStudent[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("2026-2027");
  const [selectedBatch, setSelectedBatch] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | StudentStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("directory-list");

  // Subject view filter (for Subject Enrollment Matrix tab)
  const [matrixSubjectCode, setMatrixSubjectCode] = useState<string>("MATH");

  // Dialog States
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [profileStudent, setProfileStudent] = useState<DirectoryStudent | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [subjectManageStudent, setSubjectManageStudent] = useState<DirectoryStudent | null>(null);
  const [isSubjectManageOpen, setIsSubjectManageOpen] = useState(false);

  // Load from local storage
  const loadStudents = () => {
    setStudents(getStoredDirectoryStudents());
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Filter students based on Academic Year, Batch, Status, and Search Query
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesYear = s.academicYear === selectedAcademicYear;
      const matchesBatch = selectedBatch === "ALL" || s.batchId === selectedBatch;
      const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.fullName.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.guardian.name.toLowerCase().includes(q) ||
        s.guardian.phone.includes(q) ||
        s.enrolledSubjects.some((sub) => sub.subjectName.toLowerCase().includes(q) || sub.subjectCode.toLowerCase().includes(q));

      return matchesYear && matchesBatch && matchesStatus && matchesSearch;
    });
  }, [students, selectedAcademicYear, selectedBatch, statusFilter, searchQuery]);

  // Aggregate Metrics for Active Year
  const yearStudents = useMemo(() => {
    return students.filter((s) => s.academicYear === selectedAcademicYear);
  }, [students, selectedAcademicYear]);

  const activeCount = useMemo(
    () => yearStudents.filter((s) => s.status === "ACTIVE").length,
    [yearStudents]
  );
  const bundleCount = useMemo(
    () => yearStudents.filter((s) => s.enrollmentMode === "FULL_BUNDLE").length,
    [yearStudents]
  );
  const modularCount = useMemo(
    () => yearStudents.filter((s) => s.enrollmentMode === "MODULAR").length,
    [yearStudents]
  );
  const avgFee = useMemo(() => {
    if (yearStudents.length === 0) return 0;
    const total = yearStudents.reduce((sum, s) => sum + s.monthlyFee, 0);
    return Math.round(total / yearStudents.length);
  }, [yearStudents]);

  // Handle student registration callback
  const handleStudentRegistered = (newStudent: DirectoryStudent) => {
    loadStudents();
    setProfileStudent(newStudent);
    setIsProfileOpen(true);
  };

  // Handle subject updates callback
  const handleSubjectsUpdated = (updated: DirectoryStudent) => {
    loadStudents();
    if (profileStudent && profileStudent.id === updated.id) {
      setProfileStudent(updated);
    }
  };

  // Handle status toggle (Active/Inactive)
  const handleToggleStatus = (student: DirectoryStudent) => {
    const nextStatus: StudentStatus = student.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const updated = updateStudentStatus(student.id, nextStatus);
    if (updated) {
      toast.success(`${student.fullName} status marked as ${nextStatus}`);
      loadStudents();
    }
  };

  // Subject matrix filtered students
  const matrixStudents = useMemo(() => {
    return yearStudents.filter((s) =>
      s.enrolledSubjects.some((sub) => sub.subjectCode === matrixSubjectCode)
    );
  }, [yearStudents, matrixSubjectCode]);

  const selectedMatrixSubject = useMemo(() => {
    return AVAILABLE_SUBJECTS.find((s) => s.code === matrixSubjectCode) || AVAILABLE_SUBJECTS[0];
  }, [matrixSubjectCode]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <span>Student Directory & Subject Enrollment</span>
            <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-mono">
              Session {selectedAcademicYear}
            </Badge>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Centralized registry for batch assignments, multi-subject enrollments, and 360° student records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs gap-1.5"
            onClick={() => exportStudentsToCSV(filteredStudents)}
          >
            <Download className="h-4 w-4" />
            Export Directory CSV
          </Button>

          <Button
            size="sm"
            className="h-9 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
            onClick={() => setIsRegisterOpen(true)}
          >
            <UserPlus className="h-4 w-4" />
            Register New Student
          </Button>
        </div>
      </div>

      {/* Primary KPI Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Cohort Roster</p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">{yearStudents.length}</h3>
              <p className="text-[11px] text-emerald-600 font-medium">{activeCount} active enrollments</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Bundle vs Modular</p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">
                {bundleCount} <span className="text-xs font-normal text-muted-foreground">/ {modularCount}</span>
              </h3>
              <p className="text-[11px] text-indigo-600 font-medium">
                {yearStudents.length > 0 ? Math.round((bundleCount / yearStudents.length) * 100) : 0}% bundled
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Average Monthly Fee</p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">₹{avgFee}</h3>
              <p className="text-[11px] text-slate-500 font-medium">per enrolled student</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <Award className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Subjects Offered</p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">{AVAILABLE_SUBJECTS.length}</h3>
              <p className="text-[11px] text-slate-500 font-medium">Math, Physics, Chem, Bio, CS, Eng</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Global Toolbar: Filters & Controls */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between p-3.5 rounded-xl border bg-card shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by student name, ID, phone, email, or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 text-xs"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Academic Year Dropdown */}
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
              <SelectTrigger className="w-[180px] h-9 text-xs font-medium">
                <SelectValue placeholder="Academic Year" />
              </SelectTrigger>
              <SelectContent>
                {ACADEMIC_YEAR_OPTIONS.map((y) => (
                  <SelectItem key={y.value} value={y.value}>
                    {y.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Batch Selector */}
          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-muted-foreground" />
            <Select value={selectedBatch} onValueChange={setSelectedBatch}>
              <SelectTrigger className="w-[170px] h-9 text-xs font-medium">
                <SelectValue placeholder="Batch Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Batches</SelectItem>
                {MOCK_BATCHES.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.code} ({b.name.split(" ")[0]})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(v: "ALL" | StudentStatus) => setStatusFilter(v)}>
            <SelectTrigger className="w-[130px] h-9 text-xs font-medium">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="GRADUATED">Graduated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 max-w-xl h-10 p-1 bg-slate-100 dark:bg-slate-800">
          <TabsTrigger value="directory-list" className="text-xs flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>Batch Directory ({filteredStudents.length})</span>
          </TabsTrigger>
          <TabsTrigger value="subject-matrix" className="text-xs flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Subject Enrollment Matrix</span>
          </TabsTrigger>
          <TabsTrigger value="archives" className="text-xs flex items-center gap-1.5">
            <Archive className="h-3.5 w-3.5" />
            <span>Historical Archives</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Batch-wise Student Directory Table */}
        <TabsContent value="directory-list" className="space-y-4">
          <Card className="border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Student Details</th>
                    <th className="px-4 py-3">Student ID</th>
                    <th className="px-4 py-3">Batch & Grade</th>
                    <th className="px-4 py-3">Enrollment Mode</th>
                    <th className="px-4 py-3">Enrolled Subjects</th>
                    <th className="px-4 py-3">Monthly Tuition</th>
                    <th className="px-4 py-3">Parent Contact</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-xs">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                        <Users className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                        <p className="font-semibold text-foreground">No students found matching current filters.</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Try resetting your search query or selecting a different batch.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                        {/* Student Name & Avatar */}
                        <td className="px-4 py-3">
                          <div
                            className="flex items-center gap-2.5 cursor-pointer group"
                            onClick={() => {
                              setProfileStudent(s);
                              setIsProfileOpen(true);
                            }}
                          >
                            <img
                              src={s.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.firstName}`}
                              alt={s.fullName}
                              className="h-9 w-9 rounded-full bg-slate-100 border object-cover group-hover:ring-2 group-hover:ring-indigo-500 transition-all flex-shrink-0"
                            />
                            <div>
                              <span className="font-semibold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors block">
                                {s.fullName}
                              </span>
                              <span className="text-[11px] text-muted-foreground">{s.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Student ID */}
                        <td className="px-4 py-3 font-mono font-medium text-foreground">
                          <Badge variant="outline" className="bg-slate-50 dark:bg-slate-900 text-xs px-2 py-0.5">
                            {s.studentId}
                          </Badge>
                        </td>

                        {/* Batch & Grade */}
                        <td className="px-4 py-3">
                          <span className="font-medium text-foreground block">{s.batchCode}</span>
                          <span className="text-[11px] text-muted-foreground">{s.gradeLevel}</span>
                        </td>

                        {/* Enrollment Mode */}
                        <td className="px-4 py-3">
                          <Badge
                            variant={s.enrollmentMode === "FULL_BUNDLE" ? "default" : "secondary"}
                            className="text-[10px]"
                          >
                            {s.enrollmentMode === "FULL_BUNDLE" ? "All Subjects (Bundle)" : "Modular (1-2 Subj)"}
                          </Badge>
                        </td>

                        {/* Enrolled Subjects */}
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {s.enrolledSubjects.map((sub) => (
                              <span
                                key={sub.id}
                                className="rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-1.5 py-0.5 text-[10px] font-medium"
                              >
                                {sub.subjectName}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Monthly Tuition */}
                        <td className="px-4 py-3 font-bold text-foreground">
                          ₹{s.monthlyFee}
                          <span className="text-[10px] text-muted-foreground font-normal">/mo</span>
                        </td>

                        {/* Parent Contact */}
                        <td className="px-4 py-3">
                          <div className="space-y-0.5">
                            <span className="font-medium text-foreground block">{s.guardian.name}</span>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3 text-indigo-500" />
                              {s.guardian.phone}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <Badge
                            variant={s.status === "ACTIVE" ? "default" : "secondary"}
                            className={`text-[10px] cursor-pointer ${
                              s.status === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200"
                                : s.status === "GRADUATED"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                            onClick={() => handleToggleStatus(s)}
                            title="Click to toggle status"
                          >
                            {s.status}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="View 360° Profile"
                              onClick={() => {
                                setProfileStudent(s);
                                setIsProfileOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Manage Subjects"
                              onClick={() => {
                                setSubjectManageStudent(s);
                                setIsSubjectManageOpen(true);
                              }}
                            >
                              <Edit3 className="h-4 w-4 text-slate-500 hover:text-foreground" />
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

        {/* TAB 2: Subject Enrollment Matrix */}
        <TabsContent value="subject-matrix" className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {AVAILABLE_SUBJECTS.map((sub) => {
              const count = yearStudents.filter((s) =>
                s.enrolledSubjects.some((es) => es.subjectCode === sub.code)
              ).length;
              const isSelected = matrixSubjectCode === sub.code;

              return (
                <div
                  key={sub.code}
                  onClick={() => setMatrixSubjectCode(sub.code)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground">{sub.name}</span>
                    <Badge variant="outline" className="text-[10px] font-mono px-1 py-0">
                      {sub.code}
                    </Badge>
                  </div>
                  <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
                    {count}
                  </p>
                  <p className="text-[11px] text-muted-foreground">students enrolled</p>
                </div>
              );
            })}
          </div>

          {/* Selected Subject Dossier & Enrolled Students */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
            <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <span>{selectedMatrixSubject.name} Enrollment Roster</span>
                    <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {matrixStudents.length} Students
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Faculty: <strong>{selectedMatrixSubject.facultyTeacher}</strong> • Schedule: {selectedMatrixSubject.scheduleDays} • Tuition: ₹{selectedMatrixSubject.defaultMonthlyFee}/mo
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                    <tr>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">Student ID</th>
                      <th className="px-4 py-3">Assigned Batch</th>
                      <th className="px-4 py-3">Total Subjects Enrolled</th>
                      <th className="px-4 py-3">Monthly Tuition</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-center">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-xs">
                    {matrixStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                          No students currently enrolled in {selectedMatrixSubject.name}.
                        </td>
                      </tr>
                    ) : (
                      matrixStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3">
                            <div
                              className="flex items-center gap-2 cursor-pointer group"
                              onClick={() => {
                                setProfileStudent(s);
                                setIsProfileOpen(true);
                              }}
                            >
                              <img
                                src={s.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.firstName}`}
                                alt={s.fullName}
                                className="h-7 w-7 rounded-full bg-slate-100 object-cover"
                              />
                              <span className="font-semibold text-foreground group-hover:text-indigo-600">
                                {s.fullName}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono font-medium">{s.studentId}</td>
                          <td className="px-4 py-3">{s.batchName}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="text-[10px]">
                              {s.enrolledSubjects.length} Subjects
                            </Badge>
                          </td>
                          <td className="px-4 py-3 font-bold">₹{s.monthlyFee}/mo</td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={s.status === "ACTIVE" ? "default" : "secondary"}
                              className="text-[10px]"
                            >
                              {s.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => {
                                setSubjectManageStudent(s);
                                setIsSubjectManageOpen(true);
                              }}
                            >
                              Edit Subjects
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: Historical Academic Archives */}
        <TabsContent value="archives" className="space-y-4">
          <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
            <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Archive className="h-4 w-4 text-indigo-500" />
                    <span>Academic Archives & Alumni Registry</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    View student records, graduation status, and historical performance from prior sessions.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Historical Session:</span>
                  <Select
                    value={selectedAcademicYear}
                    onValueChange={setSelectedAcademicYear}
                  >
                    <SelectTrigger className="w-[170px] h-8 text-xs font-medium">
                      <SelectValue placeholder="Session" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025-2026">2025-2026 (Previous Year)</SelectItem>
                      <SelectItem value="2024-2025">2024-2025 (Archived Alumni)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                    <tr>
                      <th className="px-4 py-3">Alumni Name</th>
                      <th className="px-4 py-3">Student ID</th>
                      <th className="px-4 py-3">Archived Batch</th>
                      <th className="px-4 py-3">Graduation Standing</th>
                      <th className="px-4 py-3">Enrolled Subjects</th>
                      <th className="px-4 py-3">Archival Notes</th>
                      <th className="px-4 py-3 text-center">View Profile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-xs">
                    {yearStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                          No archived student records for academic year {selectedAcademicYear}.
                        </td>
                      </tr>
                    ) : (
                      yearStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3 font-semibold text-foreground">{s.fullName}</td>
                          <td className="px-4 py-3 font-mono font-medium">{s.studentId}</td>
                          <td className="px-4 py-3">{s.batchName}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                              {s.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-muted-foreground">
                              {s.enrolledSubjects.map((sub) => sub.subjectName).join(", ")}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                            {s.notes || "Alumni record preserved."}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                setProfileStudent(s);
                                setIsProfileOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 text-indigo-600" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Register New Student Dialog */}
      <RegisterStudentDialog
        open={isRegisterOpen}
        onOpenChange={setIsRegisterOpen}
        onStudentRegistered={handleStudentRegistered}
      />

      {/* Manage Subjects Dialog */}
      <ManageSubjectsDialog
        student={subjectManageStudent}
        open={isSubjectManageOpen}
        onOpenChange={setIsSubjectManageOpen}
        onSubjectsUpdated={handleSubjectsUpdated}
      />

      {/* 360 Student Profile Dialog */}
      <StudentProfileDialog
        student={profileStudent}
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        onManageSubjectsClick={(st) => {
          setIsProfileOpen(false);
          setSubjectManageStudent(st);
          setIsSubjectManageOpen(true);
        }}
      />
    </div>
  );
}
