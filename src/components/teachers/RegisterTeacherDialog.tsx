// src/components/teachers/RegisterTeacherDialog.tsx
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createTeacherStaff, NewTeacherStaff } from "@/lib/teacher-staff-data";
import { useAcademicYear, CANONICAL_ACADEMIC_YEARS } from "@/lib/academic-year-context";

interface RegisterTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RegisterTeacherDialog: React.FC<RegisterTeacherDialogProps> = ({ open, onOpenChange }) => {
  const { selectedYear } = useAcademicYear();
  const defaultYear = selectedYear && selectedYear !== "ALL" ? selectedYear : "2026-2027";
  const [form, setForm] = useState<Partial<NewTeacherStaff>>({
    academicYear: defaultYear,
  });

  React.useEffect(() => {
    if (open) {
      setForm((prev) => ({
        ...prev,
        academicYear: prev.academicYear || defaultYear,
      }));
    }
  }, [open, defaultYear]);

  const handleChange = (field: keyof NewTeacherStaff, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const required: (keyof NewTeacherStaff)[] = [
      "fullName",
      "role",
      "designation",
      "department",
      "email",
      "joiningDate",
      "academicYear",
    ];
    for (const f of required) {
      // @ts-ignore
      if (!form[f]) {
        toast.error(`Please fill ${f}`);
        return;
      }
    }
    const data = form as NewTeacherStaff;
    createTeacherStaff(data);
    toast.success(`${data.fullName} added`);
    onOpenChange(false);
    setForm({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Teacher / Staff</DialogTitle>
          <DialogDescription>Enter personal and employment details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="fullName">Full Name *</label>
            <Input id="fullName" value={form.fullName || ""} onChange={(e) => handleChange("fullName", e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="role">Role *</label>
            <Select value={form.role || "TEACHER"} onValueChange={(v) => handleChange("role", v as any)}>
              <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TEACHER">Teacher</SelectItem>
                <SelectItem value="STAFF">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="designation">Designation *</label>
            <Input id="designation" value={form.designation || ""} onChange={(e) => handleChange("designation", e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="department">Department *</label>
            <Input id="department" value={form.department || ""} onChange={(e) => handleChange("department", e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="email">Email *</label>
            <Input id="email" type="email" value={form.email || ""} onChange={(e) => handleChange("email", e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="phone">Phone</label>
            <Input id="phone" value={form.phone || ""} onChange={(e) => handleChange("phone", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="joiningDate">Joining Date *</label>
              <Input id="joiningDate" type="date" value={form.joiningDate || ""} onChange={(e) => handleChange("joiningDate", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="academicYear">Academic Year *</label>
              <Select
                value={form.academicYear || defaultYear}
                onValueChange={(v) => handleChange("academicYear", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Academic Year" />
                </SelectTrigger>
                <SelectContent>
                  {CANONICAL_ACADEMIC_YEARS.map((yr) => (
                    <SelectItem key={yr} value={yr}>
                      {yr} {yr === "2026-2027" ? "(Current)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" size="sm" className="bg-slate-900 text-white dark:bg-indigo-600">Add</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
