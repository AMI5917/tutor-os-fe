// src/components/billing/StudentPaymentDetailDialog.tsx
"use client";

import React, { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { MonthlyFeeRecord, StudentYearlyFeeSummary } from "@/types/billing";
import {
  calculateStudentYearlySummary,
  getStoredFeeRecords,
} from "@/lib/billing-data";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import {
  Calendar,
  CreditCard,
  Printer,
  Bell,
  Phone,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Hourglass,
  Layers,
} from "lucide-react";

interface StudentPaymentDetailDialogProps {
  studentId: string | null;
  academicYear: string;
  activeMonth?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatusClick: (record: MonthlyFeeRecord) => void;
  onRecordPaymentClick: (record: MonthlyFeeRecord) => void;
  onPrintReceiptClick: (record: MonthlyFeeRecord) => void;
  onSendReminderClick: (record: MonthlyFeeRecord) => void;
}

export function StudentPaymentDetailDialog({
  studentId,
  academicYear,
  activeMonth = "2026-10",
  open,
  onOpenChange,
  onUpdateStatusClick,
  onRecordPaymentClick,
  onPrintReceiptClick,
  onSendReminderClick,
}: StudentPaymentDetailDialogProps) {
  const records = useMemo(() => {
    return getStoredFeeRecords();
  }, [open, studentId]);

  const summary: StudentYearlyFeeSummary | null = useMemo(() => {
    if (!studentId) return null;
    return calculateStudentYearlySummary(studentId, academicYear, records);
  }, [studentId, academicYear, records]);

  // Find record for the active month
  const currentMonthRecord = useMemo(() => {
    if (!summary) return null;
    return (
      summary.monthlyRecords.find((r) => r.month === activeMonth) ||
      summary.monthlyRecords[summary.monthlyRecords.length - 1] ||
      null
    );
  }, [summary, activeMonth]);

  if (!summary) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-6">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                {summary.studentName.charAt(0)}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <span>{summary.studentName}</span>
                  <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {summary.batchCode}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1 mt-0.5">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3 text-slate-400" /> Roll: {summary.rollNumber} ({summary.gradeLevel} Grade)
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3 text-slate-400" /> {summary.parentPhone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3 text-slate-400" /> {summary.parentEmail}
                  </span>
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 text-right">
              <Badge variant="outline" className="font-semibold text-xs py-1 px-2.5">
                Academic Year {summary.academicYear}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Current Active Month Status Card */}
        {currentMonthRecord && (
          <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/50 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 my-1">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-indigo-900 dark:text-indigo-300">
                  Current Billing Month: {currentMonthRecord.monthName}
                </span>
                <PaymentStatusBadge status={currentMonthRecord.status} />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 text-xs text-slate-600 dark:text-slate-300">
                <span>Fee: <strong>{formatCurrency(currentMonthRecord.totalFee)}</strong></span>
                <span>Paid: <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(currentMonthRecord.amountPaid)}</strong></span>
                <span>Balance: <strong className="text-rose-600 dark:text-rose-400">{formatCurrency(currentMonthRecord.pendingAmount)}</strong></span>
                {currentMonthRecord.paymentDate && (
                  <span>Paid on: <strong>{currentMonthRecord.paymentDate}</strong></span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => onUpdateStatusClick(currentMonthRecord)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 px-3 font-medium gap-1.5 shadow-sm"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Update Status</span>
              </Button>

              {currentMonthRecord.amountPaid > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onPrintReceiptClick(currentMonthRecord)}
                  className="text-xs h-8 px-2.5"
                >
                  <Printer className="h-3.5 w-3.5 mr-1" /> Receipt
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Annual KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500 block font-medium">Total Fees Due (Annual)</span>
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(summary.annualFee)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">12 Billed Cycles</span>
          </div>

          <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/80 dark:border-emerald-800/50">
            <span className="text-xs text-emerald-700 dark:text-emerald-400 block font-medium">Total Amount Paid</span>
            <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
              {formatCurrency(summary.totalPaid)}
            </span>
            <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 block mt-0.5">
              {summary.paidMonthsCount} Fully Paid Months
            </span>
          </div>

          <div className="p-3.5 bg-rose-50/60 dark:bg-rose-950/30 rounded-xl border border-rose-200/80 dark:border-rose-800/50">
            <span className="text-xs text-rose-700 dark:text-rose-400 block font-medium">Outstanding Balance</span>
            <span className="text-xl font-bold text-rose-700 dark:text-rose-300">
              {formatCurrency(summary.totalPending)}
            </span>
            <span className="text-[11px] text-rose-600/80 dark:text-rose-400/80 block mt-0.5">
              {summary.pendingMonthsCount} Months Pending / Due
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Overall Percentage</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {summary.paymentPercentage}%
                </span>
              </div>
              <Progress value={summary.paymentPercentage} className="h-2 mt-2" />
            </div>
            <span className="text-[11px] text-slate-400 mt-1">
              {summary.partialMonthsCount} Partial Installments
            </span>
          </div>
        </div>

        {/* Month-wise payment table */}
        <div className="mt-2 space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-indigo-600" />
              <span>Month-by-Month Payment History</span>
            </h3>
            <span className="text-xs text-slate-500">
              Complete fee records for {summary.academicYear}
            </span>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Month</th>
                    <th className="py-2.5 px-3">Invoice #</th>
                    <th className="py-2.5 px-3 text-right">Fee (₹)</th>
                    <th className="py-2.5 px-3 text-right">Paid (₹)</th>
                    <th className="py-2.5 px-3 text-right">Pending (₹)</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3">Paid Date / Mode</th>
                    <th className="py-2.5 px-3 text-center">Payment Status</th>
                    <th className="py-2.5 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {summary.monthlyRecords.map((rec) => (
                    <tr
                      key={rec.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100">
                        {rec.monthName}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                        {rec.invoiceNumber}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-800 dark:text-slate-200">
                        {formatCurrency(rec.totalFee)}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(rec.amountPaid)}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-rose-600 dark:text-rose-400">
                        {formatCurrency(rec.pendingAmount)}
                      </td>
                      <td className="py-3 px-3 text-slate-500">{rec.dueDate}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                        {rec.paymentDate ? (
                          <span>
                            {rec.paymentDate}{" "}
                            <span className="text-[10px] text-slate-400">({rec.paymentMethod})</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <PaymentStatusBadge status={rec.status} />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Update Status Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateStatusClick(rec)}
                            className="h-7 px-2 text-[11px] border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400"
                            title="Update Payment Status"
                          >
                            <ShieldCheck className="h-3 w-3 mr-1" /> Status
                          </Button>

                          {/* Print Receipt Button */}
                          {rec.amountPaid > 0 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onPrintReceiptClick(rec)}
                              className="h-7 px-2 text-[11px] text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                              title="Print Receipt"
                            >
                              <Printer className="h-3 w-3 mr-1" /> Receipt
                            </Button>
                          )}

                          {/* Remind Button */}
                          {rec.pendingAmount > 0 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onSendReminderClick(rec)}
                              className="h-7 px-2 text-[11px] text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950"
                              title="Send Reminder"
                            >
                              <Bell className="h-3 w-3 mr-1" /> Remind
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
