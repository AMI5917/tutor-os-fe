// src/components/dashboard/QuickActionToolbar.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { MOCK_TEACHERS } from "@/lib/mock-data";
import {
  UserPlus,
  Layers,
  GraduationCap,
  Receipt,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { AddStudentDialog } from "@/components/forms/AddStudentDialog";
import { toast } from "sonner";
export function QuickActionToolbar() {
  // modal control for batch, teacher, invoice (student handled by AddStudentDialog)
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Form states for other modals
  const [batchName, setBatchName] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Class Batch "${batchName || "New Batch"}" created and isolated!`);
    setActiveModal(null);
    setBatchName("");
  };

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Faculty teacher "${teacherName || "New Teacher"}" added to staff!`);
    setActiveModal(null);
    setTeacherName("");
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Invoice for ₹${invoiceAmount || "2500"} generated and sent!`);
    setActiveModal(null);
    setInvoiceAmount("");
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            Quick Operations
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* New Student – now using AddStudentDialog component */}
          <AddStudentDialog onAdd={() => {}} />

          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs border-indigo-200 hover:bg-indigo-50 dark:border-indigo-900"
            onClick={() => setActiveModal("batch")}
          >
            <Layers className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            + New Batch
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs border-indigo-200 hover:bg-indigo-50 dark:border-indigo-900"
            onClick={() => setActiveModal("teacher")}
          >
            <GraduationCap className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            + Add Teacher
          </Button>

          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500"
            onClick={() => setActiveModal("invoice")}
          >
            <Receipt className="h-3.5 w-3.5" />
            + Create Invoice
          </Button>
        </div>
      </div>

      {/* Modal 2: New Batch */}
      <Dialog open={activeModal === "batch"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Class Batch</DialogTitle>
            <DialogDescription>
              Segregate students into dedicated cohorts with an assigned teacher.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateBatch} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="batchTitle">Batch Name *</Label>
              <Input
                id="batchTitle"
                placeholder="e.g. Grade 11 Chemistry Weekend"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Chemistry" defaultValue="Chemistry" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="maxCap">Max Capacity</Label>
                <Input id="maxCap" type="number" defaultValue="15" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="instructor">Assigned Faculty Teacher</Label>
  <Select value={teacherName} onValueChange={setTeacherName}>
  <SelectTrigger>
    <SelectValue placeholder="Select Teacher" />
  </SelectTrigger>
  <SelectContent>
    {MOCK_TEACHERS.map(t => (
      <SelectItem key={t.id} value={`${t.firstName} ${t.lastName}`}>{t.firstName} {t.lastName}</SelectItem>
    ))}
  </SelectContent>
</Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setActiveModal(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-slate-900 text-white dark:bg-indigo-600">
                Create Batch
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 3: Add Teacher */}
      <Dialog open={activeModal === "teacher"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Faculty Teacher</DialogTitle>
            <DialogDescription>
              Record faculty credentials, assigned subjects, and pay model.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddTeacher} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="tName">Teacher Full Name *</Label>
              <Input
                id="tName"
                placeholder="e.g. Dr. Robert Lang"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tSubject">Subject Specialization</Label>
                <Input id="tSubject" placeholder="Mathematics / Physics" defaultValue="Calculus" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tRate">Hourly Rate (₹)</Label>
                <Input id="tRate" type="number" defaultValue="500" />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setActiveModal(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-slate-900 text-white dark:bg-indigo-600">
                Save Faculty
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 4: Create Invoice */}
      <Dialog open={activeModal === "invoice"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Tuition Invoice</DialogTitle>
            <DialogDescription>
              Issue an invoice with automated PDF creation and parent alert.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateInvoice} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="invStudent">Select Student</Label>
              <Input id="invStudent" placeholder="Alex Rivera" defaultValue="Alex Rivera" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="invAmount">Amount (₹) *</Label>
                <Input
                  id="invAmount"
                  type="number"
                  placeholder="3200"
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invDue">Due Date</Label>
                <Input id="invDue" type="date" defaultValue="2026-10-05" />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setActiveModal(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-slate-900 text-white dark:bg-indigo-600">
                Issue Invoice &amp; Alert Parent
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Note: The component uses UI primitives defined elsewhere in the project.
// Adjust import paths if needed.
