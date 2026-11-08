// src/components/teachers/TeacherProfileDialog.tsx
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TeacherStaff, EmploymentStatus } from "@/types/teacher-staff";

interface TeacherProfileDialogProps {
  staff: TeacherStaff | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TeacherProfileDialog: React.FC<TeacherProfileDialogProps> = ({ staff, open, onOpenChange }) => {
  if (!staff) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{staff.fullName}</DialogTitle>
          <DialogDescription>
            {staff.role} – {staff.department}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <p><strong>Employee ID:</strong> {staff.employeeId}</p>
          <p><strong>Designation:</strong> {staff.designation}</p>
          <p><strong>Email:</strong> {staff.email}</p>
          {staff.phone && <p><strong>Phone:</strong> {staff.phone}</p>}
          <p><strong>Joining Date:</strong> {staff.joiningDate}</p>
          <p><strong>Academic Year:</strong> {staff.academicYear}</p>
          <p><strong>Status:</strong> <Badge variant={staff.status === EmploymentStatus.ACTIVE ? "success" : "secondary"} className="text-[10px]">{staff.status}</Badge></p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
