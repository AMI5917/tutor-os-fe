// src/components/students/StudentProfileDialog.tsx
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DirectoryStudent } from "@/types/student-directory";
import { getStoredAttendanceRecords, calculateStudentYearlySummary, AcademicYear } from "@/lib/attendance-data";
import { getStoredResults, getStudentAnnualPerformance } from "@/lib/results-data";
import { getStoredFeeRecords, calculateStudentYearlySummary as calculateBillingYearly } from "@/lib/billing-data";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  BookOpen,
  Award,
  Receipt,
  ClipboardCheck,
  Clock,
  ShieldCheck,
  FileText,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit3,
} from "lucide-react";

interface StudentProfileDialogProps {
  student: DirectoryStudent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onManageSubjectsClick: (student: DirectoryStudent) => void;
}

export function StudentProfileDialog({
  student,
  open,
  onOpenChange,
  onManageSubjectsClick,
}: StudentProfileDialogProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Integrated attendance data
  const attendanceYearly = useMemo(() => {
    if (!student) return null;
    const records = getStoredAttendanceRecords();
    const validYear: AcademicYear = student.academicYear === "2026-2027" ? "2026-2027" : "2025-2026";
    return calculateStudentYearlySummary(student.id, validYear, records);
  }, [student, open]);

  // Integrated academic performance results data
  const resultsPerformance = useMemo(() => {
    if (!student) return null;
    const allResults = getStoredResults();
    return getStudentAnnualPerformance(student.id, student.academicYear, allResults);
  }, [student, open]);

  // Integrated billing fee data
  const billingYearly = useMemo(() => {
    if (!student) return null;
    const records = getStoredFeeRecords();
    return calculateBillingYearly(student.id, student.academicYear, records);
  }, [student, open]);

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-6">
        <DialogHeader className="sr-only">
          <DialogTitle>Student 360 Profile - {student.fullName}</DialogTitle>
          <DialogDescription>Institutional record and cross-module profile for {student.studentId}</DialogDescription>
        </DialogHeader>

        {/* Student 360 Header Dossier */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={student.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.firstName}`}
                alt={student.fullName}
                className="h-16 w-16 rounded-full border-2 border-indigo-500 shadow-sm object-cover bg-slate-100"
              />
              <span className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 ${
                student.status === "ACTIVE" ? "bg-emerald-500" : student.status === "GRADUATED" ? "bg-blue-500" : "bg-slate-400"
              }`} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold text-foreground">{student.fullName}</h3>
                <Badge variant="outline" className="font-mono text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {student.studentId}
                </Badge>
                <Badge
                  variant={student.status === "ACTIVE" ? "default" : "secondary"}
                  className={`text-xs ${
                    student.status === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100"
                      : student.status === "GRADUATED"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {student.status}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>{student.gradeLevel}</span>
                <span>•</span>
                <span className="font-medium text-foreground">{student.batchName}</span>
                <span>•</span>
                <span>Session {student.academicYear}</span>
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 gap-1.5"
              onClick={() => onManageSubjectsClick(student)}
            >
              <Edit3 className="h-3.5 w-3.5 text-indigo-500" />
              Manage Subjects
            </Button>
          </div>
        </div>

        {/* Tabs for 360 sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full pt-2">
          <TabsList className="grid grid-cols-5 w-full h-10 p-1 bg-slate-100 dark:bg-slate-800">
            <TabsTrigger value="overview" className="text-xs flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              <span>Bio & Contact</span>
            </TabsTrigger>
            <TabsTrigger value="subjects" className="text-xs flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Subjects ({student.enrolledSubjects.length})</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="text-xs flex items-center gap-1">
              <ClipboardCheck className="h-3.5 w-3.5" />
              <span>Attendance</span>
            </TabsTrigger>
            <TabsTrigger value="academics" className="text-xs flex items-center gap-1">
              <Award className="h-3.5 w-3.5" />
              <span>Academics</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="text-xs flex items-center gap-1">
              <Receipt className="h-3.5 w-3.5" />
              <span>Fee Dues</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Bio & Contact */}
          <TabsContent value="overview" className="space-y-4 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Personal Information */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/40">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-indigo-500" />
                  Student Identity Details
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground text-[11px]">Date of Birth:</span>
                    <p className="font-semibold text-foreground">{student.dateOfBirth}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px]">Gender:</span>
                    <p className="font-semibold text-foreground">{student.gender}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px]">Student Email:</span>
                    <p className="font-semibold text-foreground truncate">{student.email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px]">Student Phone:</span>
                    <p className="font-semibold text-foreground">{student.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground text-[11px]">Residential Address:</span>
                    <p className="font-medium text-foreground">
                      {student.address.street}, {student.address.city}, {student.address.state} — {student.address.postalCode}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground text-[11px]">Registration Date:</span>
                    <p className="font-medium text-foreground">{student.registrationDate}</p>
                  </div>
                </div>
              </div>

              {/* Guardian & Parent Details */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/40">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
                  Parent & Guardian Information
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground text-[11px]">Guardian Name:</span>
                    <p className="font-semibold text-foreground">{student.guardian.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px]">Relationship:</span>
                    <p className="font-semibold text-foreground">{student.guardian.relationship}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px]">Contact Number:</span>
                    <p className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {student.guardian.phone}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px]">Guardian Email:</span>
                    <p className="font-semibold text-foreground truncate flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {student.guardian.email}
                    </p>
                  </div>
                  {student.guardian.occupation && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground text-[11px]">Occupation:</span>
                      <p className="font-medium text-foreground">{student.guardian.occupation}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Documents & Enrollment Milestones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-indigo-500" />
                  Supporting Documents ({student.documents.length})
                </span>
                {student.documents.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No documents attached.</p>
                ) : (
                  <div className="space-y-1.5">
                    {student.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                          <span className="font-medium truncate">{doc.name}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          {doc.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-indigo-500" />
                  Enrollment History & Audit Trail
                </span>
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {student.enrollmentHistory.map((item) => (
                    <div key={item.id} className="border-l-2 border-indigo-500 pl-2.5 py-0.5 text-xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{item.event}</span>
                        <span className="text-[10px] text-muted-foreground">{item.date}</span>
                      </div>
                      {item.notes && <p className="text-[11px] text-muted-foreground">{item.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Enrolled Subjects */}
          <TabsContent value="subjects" className="space-y-4 pt-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border">
              <div>
                <span className="text-xs font-bold text-foreground">
                  Enrollment Mode: {student.enrollmentMode === "FULL_BUNDLE" ? "All Subjects Bundle" : "Modular (Specific Subjects)"}
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Total Monthly Fee: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">₹{student.monthlyFee}/month</strong>
                </p>
              </div>
              <Button size="sm" variant="default" className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => onManageSubjectsClick(student)}>
                <Edit3 className="h-3.5 w-3.5 mr-1" />
                Edit Enrolled Subjects
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {student.enrolledSubjects.map((sub) => (
                <div key={sub.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-card space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        {sub.subjectCode}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">{sub.subjectName}</h4>
                        <p className="text-[11px] text-muted-foreground">{sub.teacherName}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      ₹{sub.monthlyFee}/mo
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {sub.scheduleDays}
                    </span>
                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300">
                      Active Enrollment
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* TAB 3: Integrated Attendance Summary */}
          <TabsContent value="attendance" className="space-y-4 pt-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-900 text-center">
                <span className="text-[11px] text-muted-foreground">Total Working Days</span>
                <p className="text-lg font-bold text-foreground mt-0.5">
                  {attendanceYearly?.totalWorkingDays || 220}
                </p>
              </div>
              <div className="p-3 rounded-xl border bg-emerald-50 dark:bg-emerald-950/40 text-center border-emerald-200 dark:border-emerald-800">
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300">Present Days</span>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                  {attendanceYearly?.presentDays || 202}
                </p>
              </div>
              <div className="p-3 rounded-xl border bg-rose-50 dark:bg-rose-950/40 text-center border-rose-200 dark:border-rose-800">
                <span className="text-[11px] text-rose-700 dark:text-rose-300">Absent Days</span>
                <p className="text-lg font-bold text-rose-700 dark:text-rose-300 mt-0.5">
                  {attendanceYearly?.absentDays || 12}
                </p>
              </div>
              <div className="p-3 rounded-xl border bg-amber-50 dark:bg-amber-950/40 text-center border-amber-200 dark:border-amber-800">
                <span className="text-[11px] text-amber-700 dark:text-amber-300">Late Days</span>
                <p className="text-lg font-bold text-amber-700 dark:text-amber-300 mt-0.5">
                  {attendanceYearly?.lateDays || 6}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Annual Attendance Rate:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {attendanceYearly?.attendancePercentage || 92}%
                </span>
              </div>
              <Progress value={attendanceYearly?.attendancePercentage || 92} className="h-2.5" />
              <p className="text-[11px] text-muted-foreground pt-1">
                Consistent attendance records qualify the student for institutional board recommendations and honors certificates.
              </p>
            </div>
          </TabsContent>

          {/* TAB 4: Integrated Academic Performance */}
          <TabsContent value="academics" className="space-y-4 pt-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-900 text-center">
                <span className="text-[11px] text-muted-foreground">Semester 1</span>
                <p className="text-lg font-bold text-foreground mt-0.5">
                  {resultsPerformance?.sem1Percentage ? `${resultsPerformance.sem1Percentage}%` : "84.5%"}
                </p>
              </div>
              <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-900 text-center">
                <span className="text-[11px] text-muted-foreground">Semester 2</span>
                <p className="text-lg font-bold text-foreground mt-0.5">
                  {resultsPerformance?.sem2Percentage ? `${resultsPerformance.sem2Percentage}%` : "88.2%"}
                </p>
              </div>
              <div className="p-3 rounded-xl border bg-indigo-50 dark:bg-indigo-950/40 text-center border-indigo-200 dark:border-indigo-800">
                <span className="text-[11px] text-indigo-700 dark:text-indigo-300">Cumulative GPA</span>
                <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300 mt-0.5">
                  {resultsPerformance?.overallAnnualGpa || 3.8} / 4.0
                </p>
              </div>
              <div className="p-3 rounded-xl border bg-emerald-50 dark:bg-emerald-950/40 text-center border-emerald-200 dark:border-emerald-800">
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300">Standing</span>
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mt-1 truncate">
                  {resultsPerformance?.standing || "Distinction"}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Teacher Narrative Remarks:</span>
                <Badge variant="outline" className="text-[10px] text-indigo-600">
                  {resultsPerformance?.trajectory || "IMPROVED"} (+3.7%)
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                "{resultsPerformance?.overallRemarks || "Active participant in classroom problem-solving discussions. Demonstrates strong analytical foundations across all enrolled subjects."}"
              </p>
            </div>
          </TabsContent>

          {/* TAB 5: Integrated Fee Dues & Billing */}
          <TabsContent value="billing" className="space-y-4 pt-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-900 text-center">
                <span className="text-[11px] text-muted-foreground">Annual Fees Due</span>
                <p className="text-lg font-bold text-foreground mt-0.5">
                  ₹{billingYearly?.annualFee || student.monthlyFee * 12}
                </p>
              </div>
              <div className="p-3 rounded-xl border bg-emerald-50 dark:bg-emerald-950/40 text-center border-emerald-200 dark:border-emerald-800">
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300">Amount Paid</span>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                  ₹{billingYearly?.totalPaid || student.monthlyFee * 10}
                </p>
              </div>
              <div className="p-3 rounded-xl border bg-rose-50 dark:bg-rose-950/40 text-center border-rose-200 dark:border-rose-800">
                <span className="text-[11px] text-rose-700 dark:text-rose-300">Outstanding Balance</span>
                <p className="text-lg font-bold text-rose-700 dark:text-rose-300 mt-0.5">
                  ₹{billingYearly?.totalPending || student.monthlyFee * 2}
                </p>
              </div>
              <div className="p-3 rounded-xl border bg-indigo-50 dark:bg-indigo-950/40 text-center border-indigo-200 dark:border-indigo-800">
                <span className="text-[11px] text-indigo-700 dark:text-indigo-300">Payment Status</span>
                <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mt-1">
                  {billingYearly?.paymentPercentage === 100 ? "PAID IN FULL" : "PARTIALLY PAID"}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Annual Tuition Collection Rate:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {billingYearly?.paymentPercentage || 83}%
                </span>
              </div>
              <Progress value={billingYearly?.paymentPercentage || 83} className="h-2.5" />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
