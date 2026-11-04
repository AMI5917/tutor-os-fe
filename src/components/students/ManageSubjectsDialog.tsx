// src/components/students/ManageSubjectsDialog.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AVAILABLE_SUBJECTS,
  updateStudentSubjects,
} from "@/lib/student-directory-data";
import {
  DirectoryStudent,
  EnrollmentMode,
} from "@/types/student-directory";
import {
  BookOpen,
  CheckCircle2,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";

interface ManageSubjectsDialogProps {
  student: DirectoryStudent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubjectsUpdated: (updatedStudent: DirectoryStudent) => void;
}

export function ManageSubjectsDialog({
  student,
  open,
  onOpenChange,
  onSubjectsUpdated,
}: ManageSubjectsDialogProps) {
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [enrollmentMode, setEnrollmentMode] = useState<EnrollmentMode>("MODULAR");
  const [monthlyFee, setMonthlyFee] = useState<number>(3200);

  useEffect(() => {
    if (student) {
      setSelectedCodes(student.enrolledSubjects.map((s) => s.subjectCode));
      setEnrollmentMode(student.enrollmentMode);
      setMonthlyFee(student.monthlyFee);
    }
  }, [student, open]);

  if (!student) return null;

  const handleToggle = (code: string) => {
    if (selectedCodes.includes(code)) {
      if (selectedCodes.length === 1) {
        toast.error("Student must remain enrolled in at least 1 subject.");
        return;
      }
      const updated = selectedCodes.filter((c) => c !== code);
      setSelectedCodes(updated);
      recalcFee(updated, enrollmentMode);
    } else {
      const updated = [...selectedCodes, code];
      setSelectedCodes(updated);
      recalcFee(updated, enrollmentMode);
    }
  };

  const handleModeChange = (mode: EnrollmentMode) => {
    setEnrollmentMode(mode);
    if (mode === "FULL_BUNDLE") {
      const allCodes = AVAILABLE_SUBJECTS.map((s) => s.code);
      setSelectedCodes(allCodes);
      setMonthlyFee(4500);
    } else {
      recalcFee(selectedCodes, "MODULAR");
    }
  };

  const recalcFee = (codes: string[], mode: EnrollmentMode) => {
    if (mode === "FULL_BUNDLE") {
      setMonthlyFee(4500);
    } else {
      const sum = codes.reduce((acc, code) => {
        const found = AVAILABLE_SUBJECTS.find((s) => s.code === code);
        return acc + (found ? found.defaultMonthlyFee : 1500);
      }, 0);
      setMonthlyFee(sum);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedCodes.length === 0) {
      toast.error("Please select at least 1 subject.");
      return;
    }

    const updated = updateStudentSubjects(student.id, selectedCodes, enrollmentMode, monthlyFee);
    if (updated) {
      toast.success(`Updated subject enrollments for ${student.fullName}`);
      onSubjectsUpdated(updated);
      onOpenChange(false);
    } else {
      toast.error("Failed to update subjects.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-6">
        <DialogHeader>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <span>Manage Subject Enrollments</span>
                  <Badge variant="outline" className="font-mono text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {student.studentId}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  {student.fullName} • {student.batchName} ({student.academicYear})
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {/* Enrollment Mode Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border bg-slate-50 dark:bg-slate-900">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-foreground">Enrollment Pricing Tier</span>
              <p className="text-[11px] text-muted-foreground">
                Choose between discounted full curriculum bundle or modular per-subject pricing.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={enrollmentMode === "MODULAR" ? "default" : "outline"}
                className="h-8 text-xs"
                onClick={() => handleModeChange("MODULAR")}
              >
                Modular
              </Button>
              <Button
                type="button"
                size="sm"
                variant={enrollmentMode === "FULL_BUNDLE" ? "default" : "outline"}
                className="h-8 text-xs"
                onClick={() => handleModeChange("FULL_BUNDLE")}
              >
                Full Bundle
              </Button>
            </div>
          </div>

          {/* Subjects Grid */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Available Subjects ({AVAILABLE_SUBJECTS.length})</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
              {AVAILABLE_SUBJECTS.map((sub) => {
                const isSelected = selectedCodes.includes(sub.code);
                return (
                  <div
                    key={sub.code}
                    onClick={() => handleToggle(sub.code)}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex items-start justify-between ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-foreground">{sub.name}</span>
                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                          {sub.code}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{sub.facultyTeacher}</p>
                      <p className="text-[10px] text-slate-500">{sub.scheduleDays}</p>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">
                        ₹{sub.defaultMonthlyFee}
                      </span>
                      <div className="mt-1.5 flex justify-end">
                        <div
                          className={`h-4 w-4 rounded border flex items-center justify-center ${
                            isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300"
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="h-3 w-3" />}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Tuition Recalculation */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
            <div>
              <span className="text-xs font-semibold text-indigo-950 dark:text-indigo-200">
                Monthly Tuition Fee (Recalculated):
              </span>
              <p className="text-[11px] text-indigo-700 dark:text-indigo-400">
                {selectedCodes.length} subject(s) enrolled • {enrollmentMode === "FULL_BUNDLE" ? "Full Bundle" : "Modular"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">₹</span>
              <Input
                type="number"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(Number(e.target.value) || 0)}
                className="h-8 w-28 text-sm font-bold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900"
              />
              <span className="text-xs text-slate-500">/mo</span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              Save Subject Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
