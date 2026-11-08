// src/components/batches/RegisterBatchDialog.tsx
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
import { createClassBatch, NewClassBatch } from "@/lib/class-batch-data";
import { MOCK_TEACHERS } from "@/lib/mock-data";
import { useAcademicYear, CANONICAL_ACADEMIC_YEARS } from "@/lib/academic-year-context";

interface RegisterBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RegisterBatchDialog: React.FC<RegisterBatchDialogProps> = ({ open, onOpenChange }) => {
  const { selectedYear } = useAcademicYear();
  const defaultYear = selectedYear && selectedYear !== "ALL" ? selectedYear : "2026-2027";
  const [form, setForm] = useState<Partial<NewClassBatch>>({
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

  const handleChange = (field: keyof NewClassBatch, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const required: (keyof NewClassBatch)[] = [
      "batchName",
      "className",
      "academicYear",
      "assignedTeacherId",
      "capacity",
      "startDate",
      "endDate",
    ];
    for (const f of required) {
      // @ts-ignore
      if (!form[f]) {
        toast.error(`Please fill ${f}`);
        return;
      }
    }
    const data = form as NewClassBatch;
    createClassBatch(data);
    toast.success(`Batch "${data.batchName}" created`);
    onOpenChange(false);
    setForm({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Class Batch</DialogTitle>
          <DialogDescription>Define a new academic batch and assign a teacher.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label htmlFor="batchName" className="text-sm font-medium">Batch Name *</label>
            <Input id="batchName" value={form.batchName || ""} onChange={(e) => handleChange("batchName", e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="className" className="text-sm font-medium">Class / Grade *</label>
            <Input id="className" value={form.className || ""} onChange={(e) => handleChange("className", e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="academicYear" className="text-sm font-medium">Academic Year *</label>
            <Select
              value={form.academicYear || defaultYear}
              onValueChange={(v) => handleChange("academicYear", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Academic Year" />
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
          <div className="space-y-1.5">
            <label htmlFor="teacher" className="text-sm font-medium">Assigned Teacher *</label>
            <Select value={form.assignedTeacherId || ""} onValueChange={(v) => handleChange("assignedTeacherId", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Teacher" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_TEACHERS.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="capacity" className="text-sm font-medium">Capacity *</label>
              <Input id="capacity" type="number" min={1} value={form.capacity?.toString() || ""} onChange={(e) => handleChange("capacity", Number(e.target.value))} required />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="status" className="text-sm font-medium">Status</label>
              <Select value={form.status || "ACTIVE"} onValueChange={(v) => handleChange("status", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="startDate" className="text-sm font-medium">Start Date *</label>
              <Input id="startDate" type="date" value={form.startDate || ""} onChange={(e) => handleChange("startDate", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="endDate" className="text-sm font-medium">End Date *</label>
              <Input id="endDate" type="date" value={form.endDate || ""} onChange={(e) => handleChange("endDate", e.target.value)} required />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" size="sm" className="bg-slate-900 text-white dark:bg-indigo-600">Create Batch</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
