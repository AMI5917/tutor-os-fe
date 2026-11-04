// src/components/billing/FeeReceiptDialog.tsx
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { MonthlyFeeRecord } from "@/types/billing";
import { Printer, Download, CheckCircle, ShieldCheck } from "lucide-react";

interface FeeReceiptDialogProps {
  record: MonthlyFeeRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function numberToWordsINR(amount: number): string {
  if (amount === 0) return "Zero Rupees Only";
  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertSection(num: number): string {
    let result = "";
    if (num >= 100) {
      result += units[Math.floor(num / 100)] + " Hundred ";
      num %= 100;
    }
    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + " ";
      num %= 10;
    } else if (num >= 10) {
      result += teens[num - 10] + " ";
      return result.trim();
    }
    if (num > 0) {
      result += units[num] + " ";
    }
    return result.trim();
  }

  let words = "";
  if (amount >= 10000000) {
    words += convertSection(Math.floor(amount / 10000000)) + " Crore ";
    amount %= 10000000;
  }
  if (amount >= 100000) {
    words += convertSection(Math.floor(amount / 100000)) + " Lakh ";
    amount %= 100000;
  }
  if (amount >= 1000) {
    words += convertSection(Math.floor(amount / 1000)) + " Thousand ";
    amount %= 1000;
  }
  if (amount > 0) {
    words += convertSection(amount) + " ";
  }

  return words.trim() + " Rupees Only";
}

export function FeeReceiptDialog({
  record,
  open,
  onOpenChange,
}: FeeReceiptDialogProps) {
  if (!record) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Fee Receipt - {record.invoiceNumber}</DialogTitle>
          <DialogDescription>
            Official tuition fee receipt for {record.studentName}
          </DialogDescription>
        </DialogHeader>

        {/* Action bar for screen view */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white dark:bg-slate-950 border-b print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Receipt Preview
            </span>
            <span className="text-sm font-medium text-slate-200">
              #{record.invoiceNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium gap-1.5 shadow"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Save PDF</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Close
            </Button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div id="printable-fee-receipt" className="p-8 sm:p-10 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
          {/* Header */}
          <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-5 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                    T
                  </div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white uppercase">
                    TutorOS Academy
                  </h1>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                  Excellence in Coaching & Student Mentorship
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Knowledge Park Campus, Linking Road, Mumbai 400050 | GSTIN: 27AABCT1234F1Z8
                </p>
              </div>
              <div className="sm:text-right">
                <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold px-3 py-1 rounded border border-slate-300 dark:border-slate-700 uppercase tracking-wider">
                  Official Fee Receipt
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1.5">
                  No: {record.invoiceNumber}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Date: {record.paymentDate || record.updatedAt?.split("T")[0] || new Date().toISOString().split("T")[0]}
                </p>
              </div>
            </div>
          </div>

          {/* Student & Batch Information */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs mb-6">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-semibold uppercase text-[10px]">
                Student Name
              </span>
              <span className="text-slate-900 dark:text-slate-100 font-bold text-sm">
                {record.studentName}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-semibold uppercase text-[10px]">
                Roll / ID
              </span>
              <span className="text-slate-900 dark:text-slate-100 font-semibold text-sm">
                {record.rollNumber || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-semibold uppercase text-[10px]">
                Batch / Class
              </span>
              <span className="text-slate-900 dark:text-slate-100 font-semibold text-sm">
                {record.batchCode} ({record.gradeLevel || "Grade 10"})
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-semibold uppercase text-[10px]">
                Billing Period
              </span>
              <span className="text-slate-900 dark:text-slate-100 font-semibold text-sm">
                {record.monthName} ({record.academicYear})
              </span>
            </div>
          </div>

          {/* Itemized Fee Table */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mb-6">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-4 w-12 text-center">#</th>
                  <th className="py-2.5 px-4">Fee Description</th>
                  <th className="py-2.5 px-4 text-center">Billing Cycle</th>
                  <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                <tr>
                  <td className="py-3 px-4 text-center font-medium text-slate-500">1</td>
                  <td className="py-3 px-4 font-medium">
                    Monthly Academic Tuition Fee — {record.batchName}
                    <span className="block text-[11px] text-slate-500 mt-0.5">
                      Classroom sessions, study materials & doubt-clearing assistance
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">
                    {record.monthName}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(record.totalFee)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-center font-medium text-slate-500">2</td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                    Digital Portal Access & Assessment Tools
                  </td>
                  <td className="py-2.5 px-4 text-center text-slate-500">Included</td>
                  <td className="py-2.5 px-4 text-right text-slate-600 dark:text-slate-400">₹0</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Calculation Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Payment Details */}
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs uppercase tracking-wider mb-2">
                Payment Details
              </span>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Payment Status:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 uppercase">
                  {record.status}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {record.paymentMethod || "Pending Settlement"}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Transaction Reference:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {record.transactionRef || "N/A"}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Paid Date:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {record.paymentDate || "Pending"}
                </span>
              </div>
            </div>

            {/* Totals */}
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Total Fee Billed:</span>
                <span className="font-semibold">{formatCurrency(record.totalFee)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold text-sm border-t border-slate-200 dark:border-slate-700 pt-2">
                <span>Amount Received:</span>
                <span>{formatCurrency(record.amountPaid)}</span>
              </div>
              <div className="flex justify-between text-rose-600 dark:text-rose-400 font-bold border-t border-slate-200 dark:border-slate-700 pt-1.5">
                <span>Balance Outstanding:</span>
                <span>{formatCurrency(record.pendingAmount)}</span>
              </div>
            </div>
          </div>

          {/* Amount in words */}
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded text-xs mb-8">
            <span className="font-bold text-indigo-900 dark:text-indigo-300">Amount in Words: </span>
            <span className="text-indigo-800 dark:text-indigo-200 italic font-medium">
              {numberToWordsINR(record.amountPaid)}
            </span>
          </div>

          {/* Footer & Signature */}
          <div className="pt-8 border-t border-slate-300 dark:border-slate-700 grid grid-cols-2 gap-8 text-xs text-slate-500">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Terms & Conditions:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                <li>Fees once deposited are non-refundable & non-transferable.</li>
                <li>Receipt must be preserved for future academic inquiries.</li>
                <li>Late payment fee of ₹100/week applies after the 10th of every month.</li>
              </ul>
            </div>
            <div className="text-right flex flex-col justify-end items-end">
              <div className="w-44 border-b border-slate-400 dark:border-slate-600 mb-1.5 h-12 flex items-center justify-center">
                <span className="font-serif italic text-slate-700 dark:text-slate-300 text-sm">
                  TutorOS Authorized
                </span>
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Accounts Officer / Administrator
              </span>
              <span className="text-[10px] text-slate-400">
                TutorOS Academy Management System
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
