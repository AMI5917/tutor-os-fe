// src/components/forms/EditStudentBillingDialog.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Student } from "@/types/roles";

interface EditStudentBillingDialogProps {
  /** Student being edited */
  student: Student;
  /** Callback with updated student */
  onUpdate: (student: Student) => void;
  /** Close the dialog */
  onClose: () => void;
}

/**
 * Dialog for editing a student's tuition fee and payment status.
 * It is rendered conditionally (open={true}) by the Bills page.
 */
export function EditStudentBillingDialog({
  student,
  onUpdate,
  onClose,
}: EditStudentBillingDialogProps) {
  // Initialise form fields from the provided student
  const [fee, setFee] = useState<string>(student.fee?.toString() ?? "");
  const [paymentStatus, setPaymentStatus] = useState<string>(student.paymentStatus);

  // Sync when student prop changes
  useEffect(() => {
    setFee(student.fee?.toString() ?? "");
    setPaymentStatus(student.paymentStatus);
  }, [student]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Student = {
      ...student,
      fee: Number(fee),
      paymentStatus: paymentStatus as Student["paymentStatus"],
    };
    onUpdate(updated);
    toast.success(`Updated billing for ${student.firstName} ${student.lastName}`);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Billing</DialogTitle>
          <DialogDescription>
            Adjust the monthly fee and mark the payment status.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="fee">Monthly Fee (₹)</Label>
            <Input
              id="fee"
              type="number"
              min="0"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status">Payment Status</Label>
            <Select
              value={paymentStatus}
              onValueChange={(v) => setPaymentStatus(v)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PAID">PAID</SelectItem>
                <SelectItem value="PENDING">PENDING</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-slate-900 text-white dark:bg-indigo-600">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditStudentBillingDialog;
