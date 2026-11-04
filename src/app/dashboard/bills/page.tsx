// src/app/dashboard/bills/page.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { MOCK_BATCHES } from "@/lib/mock-data";
import {
  MonthlyFeeRecord,
  PaymentStatus,
  BatchFeeSummary,
} from "@/types/billing";
import {
  ACADEMIC_YEARS,
  ACADEMIC_MONTHS,
  getStoredFeeRecords,
  calculateBatchFeeSummary,
  calculateStudentYearlySummary,
  exportFeeRecordsToCSV,
  resetFeeRecordsToDefault,
} from "@/lib/billing-data";
import { PaymentStatusBadge } from "@/components/billing/PaymentStatusBadge";
import { StudentPaymentDetailDialog } from "@/components/billing/StudentPaymentDetailDialog";
import { UpdatePaymentStatusDialog } from "@/components/billing/UpdatePaymentStatusDialog";
import { RecordPaymentDialog } from "@/components/billing/RecordPaymentDialog";
import { SendReminderDialog } from "@/components/billing/SendReminderDialog";
import { FeeReceiptDialog } from "@/components/billing/FeeReceiptDialog";
import {
  IndianRupee,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Hourglass,
  Calendar,
  CreditCard,
  Printer,
  Bell,
  Download,
  Users,
  Layers,
  RefreshCw,
  Send,
  PieChart,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";

export default function BillsPage() {
  // Navigation & Filter States
  const [selectedBatch, setSelectedBatch] = useState<string>("ALL");
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-10");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("2026-2027");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "PARTIALLY_PAID" | "PENDING">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("current-month");

  // Selection state for bulk operations
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Records state
  const [records, setRecords] = useState<MonthlyFeeRecord[]>([]);

  // Dialog States
  const [detailStudentId, setDetailStudentId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  // Status Update Dialog Target
  const [statusUpdateTarget, setStatusUpdateTarget] = useState<MonthlyFeeRecord | null>(null);
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState<boolean>(false);

  // Record Payment Dialog Target
  const [paymentRecordTarget, setPaymentRecordTarget] = useState<MonthlyFeeRecord | null>(null);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState<boolean>(false);

  // Reminders
  const [reminderRecords, setReminderRecords] = useState<MonthlyFeeRecord[]>([]);
  const [isReminderOpen, setIsReminderOpen] = useState<boolean>(false);

  // Receipt
  const [receiptRecord, setReceiptRecord] = useState<MonthlyFeeRecord | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);

  // Load records from local storage
  const refreshRecords = () => {
    setRecords(getStoredFeeRecords());
  };

  useEffect(() => {
    refreshRecords();
  }, []);

  // Filter records for current month & selected batch
  const currentMonthRecords = useMemo(() => {
    return records.filter(
      (r) =>
        (selectedBatch === "ALL" || r.batchId === selectedBatch) &&
        r.month === selectedMonth
    );
  }, [records, selectedBatch, selectedMonth]);

  // Overall batch summary for KPI cards
  const batchSummary: BatchFeeSummary = useMemo(() => {
    return calculateBatchFeeSummary(selectedBatch, selectedMonth, records);
  }, [selectedBatch, selectedMonth, records]);

  // Search & status filtered records for the active table
  const displayedMonthRecords = useMemo(() => {
    return currentMonthRecords.filter((r) => {
      // Status filter
      if (statusFilter === "PAID" && r.status !== "PAID") return false;
      if (statusFilter === "PARTIALLY_PAID" && r.status !== "PARTIALLY_PAID") return false;
      if (
        statusFilter === "PENDING" &&
        r.status !== "PENDING" &&
        r.status !== "OVERDUE"
      ) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = r.studentName.toLowerCase().includes(query);
        const matchesRoll = r.rollNumber?.toLowerCase().includes(query);
        const matchesPhone = r.parentPhone.includes(query);
        const matchesInvoice = r.invoiceNumber.toLowerCase().includes(query);
        return matchesName || matchesRoll || matchesPhone || matchesInvoice;
      }
      return true;
    });
  }, [currentMonthRecords, statusFilter, searchQuery]);

  // Pending & Overdue records specifically for Dues Center
  const pendingOrOverdueRecords = useMemo(() => {
    return currentMonthRecords.filter(
      (r) => r.status === "PENDING" || r.status === "OVERDUE" || r.status === "PARTIALLY_PAID"
    );
  }, [currentMonthRecords]);

  // Unique students in batch for Academic Year Tracking (Tab 2)
  const yearlyStudentSummaries = useMemo(() => {
    const studentIds = Array.from(
      new Set(
        records
          .filter((r) => selectedBatch === "ALL" || r.batchId === selectedBatch)
          .map((r) => r.studentId)
      )
    );

    return studentIds
      .map((id) => calculateStudentYearlySummary(id, selectedAcademicYear, records))
      .filter((s): s is NonNullable<typeof s> => s !== null);
  }, [records, selectedBatch, selectedAcademicYear]);

  // Academic Year Totals across all students in batch
  const academicYearTotals = useMemo(() => {
    const totalFeesDue = yearlyStudentSummaries.reduce((acc, s) => acc + s.annualFee, 0);
    const totalAmountPaid = yearlyStudentSummaries.reduce((acc, s) => acc + s.totalPaid, 0);
    const totalOutstanding = yearlyStudentSummaries.reduce((acc, s) => acc + s.totalPending, 0);
    const overallPercentage =
      totalFeesDue > 0 ? Math.round((totalAmountPaid / totalFeesDue) * 100) : 0;

    return {
      totalFeesDue,
      totalAmountPaid,
      totalOutstanding,
      overallPercentage,
    };
  }, [yearlyStudentSummaries]);

  // Handle payment status updated callback
  const handleStatusUpdated = (updated: MonthlyFeeRecord) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    );
    refreshRecords();
  };

  // Toggle single student selection for bulk reminders
  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Select all or deselect all pending students
  const toggleSelectAllPending = () => {
    if (selectedStudentIds.length === pendingOrOverdueRecords.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(pendingOrOverdueRecords.map((r) => r.studentId));
    }
  };

  // Launch bulk reminder dialog
  const handleLaunchBulkReminder = () => {
    const targets = currentMonthRecords.filter((r) =>
      selectedStudentIds.includes(r.studentId)
    );
    if (targets.length === 0) {
      toast.error("Please select at least one student to send reminders.");
      return;
    }
    setReminderRecords(targets);
    setIsReminderOpen(true);
  };

  // Launch single reminder dialog
  const handleLaunchSingleReminder = (rec: MonthlyFeeRecord) => {
    setReminderRecords([rec]);
    setIsReminderOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Bills & Fee Management</span>
                <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {batchSummary.batchCode}
                </Badge>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Batch-wise tuition collection, payment status management, academic year history & dues tracking
              </p>
            </div>
          </div>
        </div>

        {/* Global Selectors */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Batch Selector */}
          <div className="w-48">
            <Select value={selectedBatch} onValueChange={setSelectedBatch}>
              <SelectTrigger className="h-9 text-xs font-medium">
                <SelectValue placeholder="Select Batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Batches</SelectItem>
                {MOCK_BATCHES.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.code} — {b.name.slice(0, 22)}...
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Month Selector */}
          <div className="w-40">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="h-9 text-xs font-medium">
                <SelectValue placeholder="Billing Month" />
              </SelectTrigger>
              <SelectContent>
                {ACADEMIC_MONTHS.map((m) => (
                  <SelectItem key={m.key} value={m.key}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Academic Year Selector */}
          <div className="w-32">
            <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
              <SelectTrigger className="h-9 text-xs font-medium">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {ACADEMIC_YEARS.map((y) => (
                  <SelectItem key={y} value={y}>
                    AY {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={refreshRecords}
            className="h-9 px-2.5 text-slate-600 hover:text-slate-900"
            title="Refresh Fee Records"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards Row (Current Month Summary) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Monthly Fees Due */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Monthly Fee Due
            </CardTitle>
            <Layers className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(batchSummary.totalFeeExpected)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {batchSummary.enrolledStudents} Enrolled Students in {batchSummary.batchCode}
            </p>
          </CardContent>
        </Card>

        {/* Total Amount Paid */}
        <Card className="border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Total Amount Paid
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {formatCurrency(batchSummary.totalCollected)}
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              {batchSummary.paidCount} Fully Paid • {batchSummary.partialCount} Partially Paid
            </p>
          </CardContent>
        </Card>

        {/* Outstanding Balance */}
        <Card className="border-rose-200 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10 shadow-sm">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
              Outstanding Balance
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-rose-700 dark:text-rose-300">
              {formatCurrency(batchSummary.totalPending)}
            </div>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
              {batchSummary.pendingCount} Pending Accounts
            </p>
          </CardContent>
        </Card>

        {/* Collection Percentage */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Payment Percentage
            </CardTitle>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {batchSummary.collectionPercentage}%
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {batchSummary.collectionPercentage}%
            </div>
            <Progress value={batchSummary.collectionPercentage} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Container */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
          <TabsList className="bg-slate-100 dark:bg-slate-800 p-1">
            <TabsTrigger value="current-month" className="text-xs font-medium gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>Current Month Payment Summary</span>
            </TabsTrigger>
            <TabsTrigger value="academic-year" className="text-xs font-medium gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              <span>Academic Year Payment Tracking</span>
            </TabsTrigger>
            <TabsTrigger value="pending-dues" className="text-xs font-medium gap-1.5 relative">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
              <span>Pending & Overdue Dues</span>
              {batchSummary.pendingCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                  {batchSummary.pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-xs font-medium gap-1.5">
              <PieChart className="h-3.5 w-3.5" />
              <span>Reports & Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            {activeTab === "pending-dues" && pendingOrOverdueRecords.length > 0 && (
              <Button
                size="sm"
                onClick={handleLaunchBulkReminder}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send Reminders to Selected ({selectedStudentIds.length})</span>
              </Button>
            )}

            {activeTab === "reports" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => exportFeeRecordsToCSV(currentMonthRecords, `TutorOS_Fee_${selectedMonth}.csv`)}
                className="text-xs font-medium gap-1.5 border-slate-300 dark:border-slate-700"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV</span>
              </Button>
            )}
          </div>
        </div>

        {/* TAB 1: CURRENT MONTH PAYMENT SUMMARY & BATCH-WISE STUDENT LIST */}
        <TabsContent value="current-month" className="space-y-4">
          {/* Separate Filters / Sub-tabs for Paid, Partially Paid, and Pending Students */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  statusFilter === "ALL"
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                <span>All Students</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 font-bold">
                  {currentMonthRecords.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("PAID")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  statusFilter === "PAID"
                    ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/20"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-100"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Paid Students</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 font-bold">
                  {batchSummary.paidCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("PARTIALLY_PAID")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  statusFilter === "PARTIALLY_PAID"
                    ? "bg-amber-600 text-white shadow-sm ring-2 ring-amber-600/20"
                    : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 hover:bg-amber-100"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Partially Paid Students</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 font-bold">
                  {batchSummary.partialCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("PENDING")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  statusFilter === "PENDING"
                    ? "bg-rose-600 text-white shadow-sm ring-2 ring-rose-600/20"
                    : "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 hover:bg-rose-100"
                }`}
              >
                <Hourglass className="h-3.5 w-3.5" />
                <span>Pending Students</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 font-bold">
                  {batchSummary.pendingCount}
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search student, roll, invoice..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>

          {/* Batch-wise Student Table with all 6 required fields */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-3">Batch</th>
                    <th className="py-3 px-3 text-right">Monthly Fee Amount</th>
                    <th className="py-3 px-3 text-right">Amount Paid</th>
                    <th className="py-3 px-3 text-right">Pending Balance</th>
                    <th className="py-3 px-3 text-center">Payment Status</th>
                    <th className="py-3 px-3">Payment Date</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {displayedMonthRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        No students found matching the selected filter in this batch.
                      </td>
                    </tr>
                  ) : (
                    displayedMonthRecords.map((r) => (
                      <tr
                        key={r.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* 1. Student Name */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => {
                              setDetailStudentId(r.studentId);
                              setIsDetailOpen(true);
                            }}
                            className="font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 hover:underline text-left block"
                          >
                            {r.studentName}
                          </button>
                          <span className="block text-[11px] text-slate-400 mt-0.5">
                            {r.rollNumber} • {r.gradeLevel || "Grade 10"}
                          </span>
                        </td>

                        {/* Batch Code */}
                        <td className="py-3.5 px-3">
                          <Badge variant="outline" className="font-semibold text-[10px]">
                            {r.batchCode}
                          </Badge>
                        </td>

                        {/* 2. Monthly Fee Amount */}
                        <td className="py-3.5 px-3 text-right font-medium text-slate-800 dark:text-slate-200 text-xs">
                          {formatCurrency(r.totalFee)}
                        </td>

                        {/* 3. Amount Paid */}
                        <td className="py-3.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                          {formatCurrency(r.amountPaid)}
                        </td>

                        {/* 4. Pending Balance */}
                        <td className="py-3.5 px-3 text-right font-bold text-rose-600 dark:text-rose-400 text-xs">
                          {formatCurrency(r.pendingAmount)}
                        </td>

                        {/* 5. Payment Status */}
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setStatusUpdateTarget(r);
                              setIsStatusUpdateOpen(true);
                            }}
                            className="cursor-pointer hover:opacity-85 transition-opacity"
                            title="Click to update payment status"
                          >
                            <PaymentStatusBadge status={r.status} />
                          </button>
                        </td>

                        {/* 6. Payment Date */}
                        <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400 text-[11px]">
                          {r.paymentDate ? (
                            <div>
                              <span className="font-medium text-slate-800 dark:text-slate-200">
                                {r.paymentDate}
                              </span>
                              <span className="block text-[10px] text-slate-400">
                                {r.paymentMethod}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Unpaid</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Update Payment Status Action */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setStatusUpdateTarget(r);
                                setIsStatusUpdateOpen(true);
                              }}
                              className="h-7 px-2 text-[11px] border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 font-medium"
                              title="Update Payment Status (Paid / Partially Paid / Pending)"
                            >
                              <ShieldCheck className="h-3 w-3 mr-1" /> Update Status
                            </Button>

                            {/* View Student Details */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setDetailStudentId(r.studentId);
                                setIsDetailOpen(true);
                              }}
                              className="h-7 px-2 text-[11px] text-slate-600 hover:text-slate-900"
                              title="View Complete Payment Profile"
                            >
                              Details
                            </Button>

                            {/* Print Receipt */}
                            {r.amountPaid > 0 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setReceiptRecord(r);
                                  setIsReceiptOpen(true);
                                }}
                                className="h-7 px-1.5 text-[11px] text-slate-500 hover:text-indigo-600"
                                title="Print Official Fee Receipt"
                              >
                                <Printer className="h-3 w-3" />
                              </Button>
                            )}

                            {/* Send Reminder */}
                            {r.pendingAmount > 0 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleLaunchSingleReminder(r)}
                                className="h-7 px-1.5 text-[11px] text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                title="Send Fee Reminder"
                              >
                                <Bell className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 2: ACADEMIC YEAR PAYMENT TRACKING */}
        <TabsContent value="academic-year" className="space-y-4">
          {/* Annual KPI Cards Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block">
                Total Fees Due (Annual)
              </span>
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1 block">
                {formatCurrency(academicYearTotals.totalFeesDue)}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Full 12 Billing Months (AY {selectedAcademicYear})
              </span>
            </div>

            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm">
              <span className="text-xs text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-semibold block">
                Total Amount Paid
              </span>
              <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1 block">
                {formatCurrency(academicYearTotals.totalAmountPaid)}
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
                Collected across all enrolled students
              </span>
            </div>

            <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-800 shadow-sm">
              <span className="text-xs text-rose-700 dark:text-rose-400 uppercase tracking-wider font-semibold block">
                Outstanding Balance
              </span>
              <span className="text-xl font-bold text-rose-700 dark:text-rose-300 mt-1 block">
                {formatCurrency(academicYearTotals.totalOutstanding)}
              </span>
              <span className="text-[11px] text-rose-600 dark:text-rose-400 block mt-0.5">
                Remaining annual balance
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 uppercase tracking-wider font-semibold">
                    Overall Payment Percentage
                  </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {academicYearTotals.overallPercentage}%
                  </span>
                </div>
                <Progress value={academicYearTotals.overallPercentage} className="h-2 mt-2" />
              </div>
              <span className="text-[11px] text-slate-400 mt-1">
                Annual collection efficiency
              </span>
            </div>
          </div>

          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-indigo-600" />
                    <span>Annual Fee Collection Matrix — Academic Year {selectedAcademicYear}</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Full academic year payment tracking, total dues, amount paid, balance, and month-wise payment history.
                  </CardDescription>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" /> Paid
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" /> Partial
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" /> Due / Overdue
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Student & Batch</th>
                      <th className="py-3 px-3 text-right">Total Fees Due</th>
                      <th className="py-3 px-3 text-right">Total Amount Paid</th>
                      <th className="py-3 px-3 text-right">Outstanding Balance</th>
                      <th className="py-3 px-3 w-36">Overall Percentage</th>
                      <th className="py-3 px-4 text-center">Month-wise Payment History (Apr - Mar)</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {yearlyStudentSummaries.map((s) => (
                      <tr
                        key={s.studentId}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => {
                              setDetailStudentId(s.studentId);
                              setIsDetailOpen(true);
                            }}
                            className="font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 text-left"
                          >
                            {s.studentName}
                          </button>
                          <span className="block text-[11px] text-slate-400">
                            {s.batchCode} • {s.rollNumber}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right font-medium text-slate-800 dark:text-slate-200">
                          {formatCurrency(s.annualFee)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(s.totalPaid)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-bold text-rose-600 dark:text-rose-400">
                          {formatCurrency(s.totalPending)}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex justify-between text-[11px] font-semibold mb-1">
                            <span>{s.paymentPercentage}%</span>
                            <span className="text-slate-400 text-[10px]">
                              {s.paidMonthsCount}/12 Mo
                            </span>
                          </div>
                          <Progress value={s.paymentPercentage} className="h-1.5" />
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {s.monthlyRecords.map((m) => {
                              const shortMonth = m.monthName.slice(0, 3);
                              return (
                                <button
                                  type="button"
                                  key={m.id}
                                  onClick={() => {
                                    setStatusUpdateTarget(m);
                                    setIsStatusUpdateOpen(true);
                                  }}
                                  title={`${m.monthName}: ${m.status} (Paid: ₹${m.amountPaid}, Due: ₹${m.pendingAmount}) - Click to update status`}
                                  className={`inline-flex flex-col items-center justify-center w-6 h-6 rounded text-[9px] font-bold border transition-transform hover:scale-115 cursor-pointer ${
                                    m.status === "PAID"
                                      ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                                      : m.status === "PARTIALLY_PAID"
                                      ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                                      : "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 ring-1 ring-rose-400"
                                  }`}
                                >
                                  {shortMonth.charAt(0)}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setDetailStudentId(s.studentId);
                              setIsDetailOpen(true);
                            }}
                            className="h-7 text-xs px-2.5"
                          >
                            View Profile
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: PENDING & OVERDUE DUES CENTER */}
        <TabsContent value="pending-dues" className="space-y-4">
          {/* Outstanding Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-rose-950 dark:text-rose-200">
                  Dues Collection Center ({pendingOrOverdueRecords.length} Pending Accounts)
                </h3>
                <p className="text-xs text-rose-700 dark:text-rose-400">
                  Total Outstanding Balance for {selectedMonth}: <strong>{formatCurrency(batchSummary.totalPending)}</strong> across{" "}
                  {batchSummary.batchName}.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={toggleSelectAllPending}
                className="text-xs h-9 border-rose-300 text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-300"
              >
                {selectedStudentIds.length === pendingOrOverdueRecords.length
                  ? "Deselect All"
                  : `Select All (${pendingOrOverdueRecords.length})`}
              </Button>

              <Button
                size="sm"
                onClick={handleLaunchBulkReminder}
                disabled={selectedStudentIds.length === 0}
                className="text-xs h-9 bg-rose-600 hover:bg-rose-700 text-white font-medium gap-1.5 shadow"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send WhatsApp / SMS Reminders ({selectedStudentIds.length})</span>
              </Button>
            </div>
          </div>

          {/* Pending Accounts Table */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          pendingOrOverdueRecords.length > 0 &&
                          selectedStudentIds.length === pendingOrOverdueRecords.length
                        }
                        onChange={toggleSelectAllPending}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Batch</th>
                    <th className="py-3 px-3">Parent Contact</th>
                    <th className="py-3 px-3 text-right">Monthly Fee</th>
                    <th className="py-3 px-3 text-right">Amount Paid</th>
                    <th className="py-3 px-3 text-right">Pending Balance</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Instant Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pendingOrOverdueRecords.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-emerald-600 font-medium">
                        🎉 All fees for this batch are completely collected and settled!
                      </td>
                    </tr>
                  ) : (
                    pendingOrOverdueRecords.map((r) => {
                      const isSelected = selectedStudentIds.includes(r.studentId);
                      return (
                        <tr
                          key={r.id}
                          className={`transition-colors ${
                            isSelected
                              ? "bg-indigo-50/50 dark:bg-indigo-950/20"
                              : "hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                          }`}
                        >
                          <td className="py-3.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleStudentSelection(r.studentId)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                            {r.studentName}
                            <span className="block text-[10px] text-slate-400 font-normal">
                              Roll: {r.rollNumber}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <Badge variant="outline" className="text-[10px]">
                              {r.batchCode}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">
                            {r.parentPhone}
                          </td>
                          <td className="py-3.5 px-3 text-right text-slate-700 dark:text-slate-300 font-medium">
                            {formatCurrency(r.totalFee)}
                          </td>
                          <td className="py-3.5 px-3 text-right text-emerald-600 font-semibold">
                            {formatCurrency(r.amountPaid)}
                          </td>
                          <td className="py-3.5 px-3 text-right text-rose-600 font-bold text-sm">
                            {formatCurrency(r.pendingAmount)}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <PaymentStatusBadge status={r.status} />
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Update Status Button */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setStatusUpdateTarget(r);
                                  setIsStatusUpdateOpen(true);
                                }}
                                className="h-7 px-2 text-[11px] border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-medium"
                              >
                                <ShieldCheck className="h-3 w-3 mr-1" /> Update Status
                              </Button>

                              {/* Remind Button */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleLaunchSingleReminder(r)}
                                className="h-7 px-2.5 text-xs text-amber-700 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-800"
                              >
                                <Bell className="h-3 w-3 mr-1" /> Remind
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 4: REPORTS & ANALYTICS */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Monthly Fee Collection Summary Card */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-1">
              <CardHeader className="p-4 pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <PieChart className="h-4 w-4 text-indigo-600" />
                  <span>Monthly Collection Summary</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Performance for {selectedMonth} across {batchSummary.batchName}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Billed:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(batchSummary.totalFeeExpected)}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span className="font-medium">Total Collected:</span>
                    <span className="font-bold">{formatCurrency(batchSummary.totalCollected)}</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span className="font-medium">Total Outstanding Dues:</span>
                    <span className="font-bold">{formatCurrency(batchSummary.totalPending)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold">
                    <span>Collection Percentage:</span>
                    <span className="text-indigo-600">{batchSummary.collectionPercentage}%</span>
                  </div>
                </div>

                {/* Payment Methods breakdown */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Payment Method Distribution
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">UPI / QR (GPay, PhonePe)</span>
                      <span className="font-semibold">68%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cash in Hand</span>
                      <span className="font-semibold">20%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bank Transfer (NEFT/IMPS)</span>
                      <span className="font-semibold">8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cheque</span>
                      <span className="font-semibold">4%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Batch-wise Collection Breakdown Table */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
              <CardHeader className="p-4 pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-indigo-600" />
                  <span>Batch-wise Collection Reports</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Revenue comparison across all active batches for {selectedMonth}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-4">Batch</th>
                        <th className="py-2.5 px-3 text-center">Students</th>
                        <th className="py-2.5 px-3 text-right">Expected (₹)</th>
                        <th className="py-2.5 px-3 text-right">Collected (₹)</th>
                        <th className="py-2.5 px-3 text-right">Pending (₹)</th>
                        <th className="py-2.5 px-3 text-right">Collection Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {MOCK_BATCHES.map((b) => {
                        const sum = calculateBatchFeeSummary(b.id, selectedMonth, records);
                        return (
                          <tr key={b.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                              {b.code}
                              <span className="block text-[11px] text-slate-500 font-normal">
                                {b.name}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center font-semibold">
                              {sum.enrolledStudents}
                            </td>
                            <td className="py-3 px-3 text-right font-medium">
                              {formatCurrency(sum.totalFeeExpected)}
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(sum.totalCollected)}
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-rose-600 dark:text-rose-400">
                              {formatCurrency(sum.totalPending)}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <Badge
                                variant="outline"
                                className={`font-bold text-[10px] ${
                                  sum.collectionPercentage >= 80
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-amber-50 text-amber-700 border-amber-200"
                                }`}
                              >
                                {sum.collectionPercentage}%
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* DIALOG 1: Update Payment Status Modal (Paid / Partially Paid / Pending) */}
      <UpdatePaymentStatusDialog
        record={statusUpdateTarget}
        open={isStatusUpdateOpen}
        onOpenChange={setIsStatusUpdateOpen}
        onStatusUpdated={handleStatusUpdated}
      />

      {/* DIALOG 2: Student Payment Detail Modal */}
      <StudentPaymentDetailDialog
        studentId={detailStudentId}
        academicYear={selectedAcademicYear}
        activeMonth={selectedMonth}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onUpdateStatusClick={(rec) => {
          setStatusUpdateTarget(rec);
          setIsStatusUpdateOpen(true);
        }}
        onRecordPaymentClick={(rec) => {
          setPaymentRecordTarget(rec);
          setIsRecordPaymentOpen(true);
        }}
        onPrintReceiptClick={(rec) => {
          setReceiptRecord(rec);
          setIsReceiptOpen(true);
        }}
        onSendReminderClick={(rec) => handleLaunchSingleReminder(rec)}
      />

      {/* DIALOG 3: Record Payment Modal */}
      <RecordPaymentDialog
        record={paymentRecordTarget}
        open={isRecordPaymentOpen}
        onOpenChange={setIsRecordPaymentOpen}
        onPaymentRecorded={handleStatusUpdated}
      />

      {/* DIALOG 4: Send Reminder Notification Modal */}
      <SendReminderDialog
        records={reminderRecords}
        open={isReminderOpen}
        onOpenChange={setIsReminderOpen}
        onReminderSent={() => refreshRecords()}
      />

      {/* DIALOG 5: Printable Official Fee Receipt */}
      <FeeReceiptDialog
        record={receiptRecord}
        open={isReceiptOpen}
        onOpenChange={setIsReceiptOpen}
      />
    </div>
  );
}
