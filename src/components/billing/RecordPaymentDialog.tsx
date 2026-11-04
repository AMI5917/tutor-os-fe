// src/components/billing/RecordPaymentDialog.tsx
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
import { recordStudentPayment } from "@/lib/billing-data";
import { IndianRupee, CheckCircle2, CreditCard } from "lucide-react";

interface RecordPaymentDialogProps {
  record: MonthlyFeeRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentRecorded: (updated: MonthlyFeeRecord) => void;
}

export function RecordPaymentDialog({
  record,
  open,
  onOpenChange,
  onPaymentRecorded,
}: RecordPaymentDialogProps) {
  const [amountReceived, setAmountReceived] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [transactionRef, setTransactionRef] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");

  useEffect(() => {
    if (record) {
      setAmountReceived(record.pendingAmount > 0 ? record.pendingAmount : record.totalFee);
      setPaymentMethod("UPI");
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setTransactionRef(`UPI-${Math.floor(1000000000 + Math.random() * 9000000000)}`);
      setRemarks("");
    }
  }, [record]);

  if (!record) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (amountReceived <= 0) {
      toast.error("Please enter a valid amount greater than ₹0.");
      return;
    }

    const updated = recordStudentPayment({
      studentId: record.studentId,
      month: record.month,
      amountReceived: Number(amountReceived),
      paymentMethod,
      transactionRef: transactionRef.trim() || undefined,
      paymentDate: paymentDate || new Date().toISOString().split("T")[0],
      remarks: remarks.trim() || undefined,
    });

    if (updated) {
      toast.success(
        `Payment of ${formatCurrency(amountReceived)} recorded for ${record.studentName}!`
      );
      onPaymentRecorded(updated);
      onOpenChange(false);
    } else {
      toast.error("Failed to update fee record.");
    }
  };

  const remainingAfterPayment = Math.max(
    0,
    record.pendingAmount - (Number(amountReceived) || 0)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span>Record Fee Payment</span>
          </DialogTitle>
          <DialogDescription>
            Collect and record tuition fees for <strong>{record.studentName}</strong> for{" "}
            <strong>{record.monthName}</strong>.
          </DialogDescription>
        </DialogHeader>

        {/* Current Balance Summary Box */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-center">
          <div>
            <span className="text-slate-500 block">Total Fee</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              {formatCurrency(record.totalFee)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Already Paid</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              {formatCurrency(record.amountPaid)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Current Due</span>
            <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
              {formatCurrency(record.pendingAmount)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Amount to Collect */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="amountReceived">Amount Received (₹)*</Label>
              {record.pendingAmount > 0 && (
                <button
                  type="button"
                  onClick={() => setAmountReceived(record.pendingAmount)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  Pay Full Balance ({formatCurrency(record.pendingAmount)})
                </button>
              )}
            </div>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="amountReceived"
                type="number"
                min="1"
                max={record.pendingAmount > 0 ? record.pendingAmount : record.totalFee}
                value={amountReceived || ""}
                onChange={(e) => setAmountReceived(Number(e.target.value))}
                className="pl-9 font-semibold text-base"
                required
              />
            </div>
            {remainingAfterPayment > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Notice: A balance of {formatCurrency(remainingAfterPayment)} will remain pending.
              </p>
            )}
            {remainingAfterPayment === 0 && amountReceived > 0 && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                This payment will mark the monthly fee as Fully Paid.
              </p>
            )}
          </div>

          {/* Payment Method & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="paymentMethod">Payment Mode*</Label>
              <Select
                value={paymentMethod}
                onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPI">UPI / GPay / PhonePe</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer (NEFT/IMPS)</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                  <SelectItem value="CARD">Debit / Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="paymentDate">Payment Date*</Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Transaction Reference */}
          <div className="space-y-1.5">
            <Label htmlFor="transactionRef">Transaction Ref / Cheque No / UTR</Label>
            <Input
              id="transactionRef"
              placeholder="e.g. UPI/1234567890 or Cheque #4421"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
            />
          </div>

          {/* Remarks */}
          <div className="space-y-1.5">
            <Label htmlFor="remarks">Notes / Remarks</Label>
            <Input
              id="remarks"
              placeholder="e.g. Paid in office by mother"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
            >
              Save & Record Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
