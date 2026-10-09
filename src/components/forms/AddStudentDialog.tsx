// src/components/forms/AddStudentDialog.tsx
"use client";

import React, { useState } from "react";
import { UserPlus } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export interface Student {
  id?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  parentPhone: string;
  standard: string; // e.g. "1st", "2nd" … "10th"
  enrollmentType: string; // "all", "single", "specific"
  subjects?: string; // comma‑separated list when enrollmentType is "specific" or "single"
  fee: number;
  status: "active" | "inactive";
}

interface AddStudentDialogProps {
  /** Called after a new student has been created */
  onAdd: (student: Student) => void;
  /** Optional: called when editing an existing student */
  onUpdate?: (student: Student) => void;
  /** When provided, the dialog works in *edit* mode */
  initialStudent?: Student;
}

/**
 * Reusable dialog for creating (or editing) a student record.
 * It renders its own "Add New Student" button – UI‑identical to the previous
 * toolbar button – and handles all form state internally.
 *
 * Admin‑only fields (status) are hidden for non‑admin users.
 */
export function AddStudentDialog({ onAdd, onUpdate, initialStudent }: AddStudentDialogProps) {
  const isEdit = Boolean(initialStudent);
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [firstName, setFirstName] = useState(initialStudent?.firstName ?? "");
  const [middleName, setMiddleName] = useState(initialStudent?.middleName ?? "");
  const [lastName, setLastName] = useState(initialStudent?.lastName ?? "");
  const [parentPhone, setParentPhone] = useState(initialStudent?.parentPhone ?? "");
  const [standard, setStandard] = useState(initialStudent?.standard ?? "1st");
  const [enrollmentType, setEnrollmentType] = useState(initialStudent?.enrollmentType ?? "all");
  const [subjects, setSubjects] = useState(initialStudent?.subjects ?? "");
  const [fee, setFee] = useState(initialStudent?.fee?.toString() ?? "");
  const [status, setStatus] = useState<Student["status"]>(initialStudent?.status ?? "active");

  const resetForm = () => {
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setParentPhone("");
    setStandard("1st");
    setEnrollmentType("all");
    setSubjects("");
    setFee("");
    setStatus("active");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student: Student = {
      firstName,
      middleName: middleName || undefined,
      lastName,
      parentPhone,
      standard,
      enrollmentType,
      subjects: subjects || undefined,
      fee: Number(fee),
      status,
    };

    if (isEdit && onUpdate) {
      onUpdate(student);
      toast.success(`Student "${firstName} ${lastName}" updated.`);
    } else {
      onAdd(student);
      toast.success(`Student "${firstName} ${lastName}" enrolled successfully!`);
    }
    resetForm();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 text-xs border-indigo-200 hover:bg-indigo-50 dark:border-indigo-900"
        >
          <UserPlus className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          + New Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Student" : "Enroll New Student"}</DialogTitle>
          <DialogDescription>
            Fill in the student details and press {isEdit ? "Update" : "Enroll"}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Name fields */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First Name *</Label>
              <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="middleName">Middle Name</Label>
              <Input id="middleName" value={middleName} onChange={e => setMiddleName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} required />
            </div>
          </div>

          {/* Parent contact */}
          <div className="space-y-1.5">
            <Label htmlFor="parentPhone">Parent WhatsApp / Phone *</Label>
            <Input id="parentPhone" placeholder="+1 (555) 234‑5678" value={parentPhone} onChange={e => setParentPhone(e.target.value)} required />
          </div>

          {/* Standard selection */}
          <div className="space-y-1.5">
            <Label htmlFor="standard">Standard *</Label>
            <Select value={standard} onValueChange={setStandard}>
              <SelectTrigger id="standard">
                <SelectValue placeholder="Select standard" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => (
                  <SelectItem key={i} value={`${i + 1}${i === 0 ? "st" : i === 1 ? "nd" : i === 2 ? "rd" : "th"}`}>
                    {`${i + 1}${i === 0 ? "st" : i === 1 ? "nd" : i === 2 ? "rd" : "th"}`} 
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Enrollment type */}
          <div className="space-y-1.5">
            <Label htmlFor="enrollmentType">Tuition Enrollment Type *</Label>
            <Select value={enrollmentType} onValueChange={setEnrollmentType}>
              <SelectTrigger id="enrollmentType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects (Bundle)</SelectItem>
                <SelectItem value="single">Single Subject</SelectItem>
                <SelectItem value="specific">Specific Subjects (multiple)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subject(s) – shown when not "all" */}
          {enrollmentType !== "all" && (
            <div className="space-y-1.5">
              <Label htmlFor="subjects">Subject(s) (comma separated)</Label>
              <Input id="subjects" placeholder="e.g. Math, Physics" value={subjects} onChange={e => setSubjects(e.target.value)} />
            </div>
          )}

          {/* Fee */}
          <div className="space-y-1.5">
            <Label htmlFor="fee">Fees (₹) *</Label>
            <Input id="fee" type="number" min="0" placeholder="3000" value={fee} onChange={e => setFee(e.target.value)} required />
          </div>

          {/* Status – admin only */}
          {isAdmin && (
            <div className="space-y-1.5">
              <Label htmlFor="status">Status *</Label>
              <Select value={status} onValueChange={v => setStatus(v as Student["status"]) }>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => { resetForm(); }}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-slate-900 text-white dark:bg-indigo-600">
              {isEdit ? "Update Student" : "Enroll Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddStudentDialog;
