// src/components/billing/UpdatePaymentStatusDialog.tsx
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { MonthlyFeeRecord, PaymentMethod } from "@/types/billing";
import { updateStudentPaymentStatus } from "@/lib/billing-data";
import {
  CheckCircle2,
  Clock,
  Hourglass,
  IndianRupee,
  ShieldCheck,
  Calendar,
  CreditCard,
  Sparkles,
} from "lucide-react";

interface UpdatePaymentStatusDialogProps {
  record: MonthlyFeeRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdated: (updated: MonthlyFeeRecord) => void;
}

export function UpdatePaymentStatusDialog({
  record,
  open,
  onOpenChange,
  onStatusUpdated,
}: UpdatePaymentStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<
    "PAID" | "PARTIALLY_PAID" | "PENDING"
  >("PAID");
  const [partialAmount, setPartialAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [transactionRef, setTransactionRef] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");

  useEffect(() => {
    if (record) {
      const initialStatus =
        record.status === "PAID"
          ? "PAID"
          : record.status === "PARTIALLY_PAID"
          ? "PARTIALLY_PAID"
          : "PENDING";

      setSelectedStatus(initialStatus);
      setPartialAmount(
        record.amountPaid > 0 && record.amountPaid < record.totalFee
          ? record.amountPaid
          : Math.floor(record.totalFee / 2)
      );
      setPaymentMethod(record.paymentMethod || "UPI");
      setPaymentDate(record.paymentDate || new Date().toISOString().split("T")[0]);
      setTransactionRef(
        record.transactionRef ||
          `TXN-${Date.now().toString().slice(-6)}`
      );
      setRemarks(record.remarks || "");
    }
  }, [record, open]);

  if (!record) return null;

  // Compute calculated amounts dynamically
  const computedPaid =
    selectedStatus === "PAID"
      ? record.totalFee
      : selectedStatus === "PARTIALLY_PAID"
      ? Math.max(1, Math.min(record.totalFee - 1, Number(partialAmount) || 0))
      : 0;

  const computedPending = record.totalFee - computedPaid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedStatus === "PARTIALLY_PAID") {
      if (computedPaid <= 0 || computedPaid >= record.totalFee) {
        toast.error(
          `Partial payment must be between ₹1 and ${formatCurrency(record.totalFee - 1)}.`
        );
        return;
      }
    }

    const updated = updateStudentPaymentStatus({
      studentId: record.studentId,
      month: record.month,
      status: selectedStatus,
      amountPaid: selectedStatus === "PARTIALLY_PAID" ? computedPaid : undefined,
      paymentMethod,
      paymentDate:
        selectedStatus === "PENDING"
          ? undefined
          : paymentDate || new Date().toISOString().split("T")[0],
      transactionRef:
        selectedStatus === "PENDING" ? undefined : transactionRef.trim() || undefined,
      remarks: remarks.trim() || undefined,
    });

    if (updated) {
      const statusLabel =
        selectedStatus === "PAID"
          ? "Paid (Fully Paid)"
          : selectedStatus === "PARTIALLY_PAID"
          ? "Partially Paid"
          : "Pending";

      toast.success(
        `Updated payment status for ${record.studentName} to "${statusLabel}"!`
      );
      onStatusUpdated(updated);
      onOpenChange(false);
    } else {
      toast.error("Failed to update payment status.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span>Update Payment Status</span>
          </DialogTitle>
          <DialogDescription>
            Change the fee status for <strong>{record.studentName}</strong> ({record.batchCode}) for{" "}
            <strong>{record.monthName}</strong>. All summaries and calculations will recompute automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Status Selection Cards */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select New Payment Status:
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {/* PAID */}
              <button
                type="button"
                onClick={() => setSelectedStatus("PAID")}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  selectedStatus === "PAID"
                    ? "border-emerald-500 bg-emerald-50/70 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-200 ring-2 ring-emerald-500/20"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <CheckCircle2
                    className={`h-4 w-4 ${
                      selectedStatus === "PAID" ? "text-emerald-600" : "text-slate-400"
                    }`}
                  />
                  {selectedStatus === "PAID" && (
                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-1 rounded">
                      Active
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-bold text-xs block">Paid</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                    Fully Paid (100%)
                  </span>
                </div>
              </button>

              {/* PARTIALLY PAID */}
              <button
                type="button"
                onClick={() => setSelectedStatus("PARTIALLY_PAID")}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  selectedStatus === "PARTIALLY_PAID"
                    ? "border-amber-500 bg-amber-50/70 text-amber-950 dark:bg-amber-950/40 dark:text-amber-200 ring-2 ring-amber-500/20"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Clock
                    className={`h-4 w-4 ${
                      selectedStatus === "PARTIALLY_PAID" ? "text-amber-600" : "text-slate-400"
                    }`}
                  />
                  {selectedStatus === "PARTIALLY_PAID" && (
                    <span className="text-[10px] bg-amber-600 text-white font-bold px-1 rounded">
                      Active
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-bold text-xs block">Partially Paid</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                    Split Installment
                  </span>
                </div>
              </button>

              {/* PENDING */}
              <button
                type="button"
                onClick={() => setSelectedStatus("PENDING")}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  selectedStatus === "PENDING"
                    ? "border-slate-700 bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 ring-2 ring-slate-500/20"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Hourglass
                    className={`h-4 w-4 ${
                      selectedStatus === "PENDING" ? "text-slate-700 dark:text-slate-200" : "text-slate-400"
                    }`}
                  />
                  {selectedStatus === "PENDING" && (
                    <span className="text-[10px] bg-slate-700 text-white font-bold px-1 rounded">
                      Active
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-bold text-xs block">Pending</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                    Unpaid / Due
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Dynamic Calculation Overview Box */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-center">
            <div>
              <span className="text-slate-500 block">Monthly Fee</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                {formatCurrency(record.totalFee)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Amount Paid</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                {formatCurrency(computedPaid)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Pending Balance</span>
              <span
                className={`font-bold text-sm ${
                  computedPending > 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {formatCurrency(computedPending)}
              </span>
            </div>
          </div>

          {/* Additional Controls if Partially Paid */}
          {selectedStatus === "PARTIALLY_PAID" && (
            <div className="space-y-2 p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex justify-between items-center">
                <Label htmlFor="partialAmount" className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                  Partial Amount Paid (₹)*
                </Label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setPartialAmount(Math.floor(record.totalFee * 0.25))}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border text-slate-600 hover:bg-slate-100"
                  >
                    25%
                  </button>
                  <button
                    type="button"
                    onClick={() => setPartialAmount(Math.floor(record.totalFee * 0.5))}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => setPartialAmount(Math.floor(record.totalFee * 0.75))}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border text-slate-600 hover:bg-slate-100"
                  >
                    75%
                  </button>
                </div>
              </div>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="partialAmount"
                  type="number"
                  min="1"
                  max={record.totalFee - 1}
                  value={partialAmount || ""}
                  onChange={(e) => setPartialAmount(Number(e.target.value))}
                  className="pl-9 font-semibold text-sm h-9"
                  required
                />
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                A pending balance of <strong>{formatCurrency(computedPending)}</strong> will remain for this student.
              </p>
            </div>
          )}

          {/* Payment Details for Paid and Partially Paid */}
          {selectedStatus !== "PENDING" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="paymentMethod" className="text-xs font-medium">
                  Payment Mode
                </Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
                >
                  <SelectTrigger id="paymentMethod" className="h-9 text-xs">
                    <SelectValue placeholder="Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPI">UPI / GPay / PhonePe</SelectItem>
                    <SelectItem value="CASH">Cash in Hand</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer (NEFT/IMPS)</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                    <SelectItem value="CARD">Debit / Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="paymentDate" className="text-xs font-medium">
                  Payment Date
                </Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
            </div>
          )}

          {/* Transaction Reference (if not Pending) */}
          {selectedStatus !== "PENDING" && (
            <div className="space-y-1">
              <Label htmlFor="transactionRef" className="text-xs font-medium">
                Transaction Reference / UTR / Cheque #
              </Label>
              <Input
                id="transactionRef"
                placeholder="e.g. UPI/123456789 or Cash Receipt #101"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          )}

          {/* Remarks */}
          <div className="space-y-1">
            <Label htmlFor="remarks" className="text-xs font-medium">
              Administrator Remarks / Note
            </Label>
            <Input
              id="remarks"
              placeholder="e.g. Status updated manually by administrator"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
            >
              Save Payment Status
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
