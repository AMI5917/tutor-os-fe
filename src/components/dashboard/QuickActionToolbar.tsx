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
import {
  Layers,
  GraduationCap,
  Receipt,
  Sparkles,
} from "lucide-react";
import { AddStudentDialog } from "@/components/forms/AddStudentDialog";
import { RegisterBatchDialog } from "@/components/batches/RegisterBatchDialog";
import { RegisterTeacherDialog } from "@/components/teachers/RegisterTeacherDialog";
import { toast } from "sonner";

interface QuickActionToolbarProps {
  onRefresh?: () => void;
}

export function QuickActionToolbar({ onRefresh }: QuickActionToolbarProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [invoiceAmount, setInvoiceAmount] = useState("");

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Invoice for ₹${invoiceAmount || "2500"} generated and sent!`);
    setActiveModal(null);
    setInvoiceAmount("");
    onRefresh?.();
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
          {/* New Student */}
          <AddStudentDialog onAdd={() => onRefresh?.()} />

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

      {/* Official Register Batch Dialog */}
      <RegisterBatchDialog
        open={activeModal === "batch"}
        onOpenChange={(open) => {
          if (!open) {
            setActiveModal(null);
            onRefresh?.();
          }
        }}
      />

      {/* Official Register Teacher / Staff Dialog */}
      <RegisterTeacherDialog
        open={activeModal === "teacher"}
        onOpenChange={(open) => {
          if (!open) {
            setActiveModal(null);
            onRefresh?.();
          }
        }}
      />

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
