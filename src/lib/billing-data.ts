// src/lib/billing-data.ts
import {
  MonthlyFeeRecord,
  StudentYearlyFeeSummary,
  BatchFeeSummary,
  PaymentStatus,
  PaymentMethod,
  ReminderType,
  ReminderPayload,
  NotificationLog,
} from "@/types/billing";
import { MOCK_STUDENTS, MOCK_BATCHES } from "@/lib/mock-data";

export const ACADEMIC_YEARS = ["2026-2027", "2025-2026"] as const;

export interface MonthOption {
  key: string; // "2026-10"
  label: string; // "October 2026"
  academicYear: string;
}

export const ACADEMIC_MONTHS: MonthOption[] = [
  { key: "2026-04", label: "April 2026", academicYear: "2026-2027" },
  { key: "2026-05", label: "May 2026", academicYear: "2026-2027" },
  { key: "2026-06", label: "June 2026", academicYear: "2026-2027" },
  { key: "2026-07", label: "July 2026", academicYear: "2026-2027" },
  { key: "2026-08", label: "August 2026", academicYear: "2026-2027" },
  { key: "2026-09", label: "September 2026", academicYear: "2026-2027" },
  { key: "2026-10", label: "October 2026", academicYear: "2026-2027" },
  { key: "2026-11", label: "November 2026", academicYear: "2026-2027" },
  { key: "2026-12", label: "December 2026", academicYear: "2026-2027" },
  { key: "2027-01", label: "January 2027", academicYear: "2026-2027" },
  { key: "2027-02", label: "February 2027", academicYear: "2026-2027" },
  { key: "2027-03", label: "March 2027", academicYear: "2026-2027" },
];

const STORAGE_KEY = "tutoros_monthly_fee_records_v1";
const NOTIFICATION_LOG_KEY = "tutoros_fee_notification_logs_v1";

/**
 * Generate initial mock fee records across the academic year
 */
export function generateInitialFeeRecords(): MonthlyFeeRecord[] {
  const records: MonthlyFeeRecord[] = [];

  MOCK_STUDENTS.forEach((student) => {
    const batch = MOCK_BATCHES.find((b) => b.id === student.batchId) || {
      id: student.batchId || "bat_1",
      code: student.batchCode || "MATH-10A",
      name: "Standard Batch",
      monthlyFee: student.fee || 2500,
    };

    const studentName = `${student.firstName} ${student.lastName}`.trim();
    const monthlyFee = student.fee || batch.monthlyFee || 2500;

    ACADEMIC_MONTHS.forEach((m, idx) => {
      const monthKey = m.key;
      const invoiceNumber = `INV-${monthKey.replace("-", "")}-${student.id.replace("stud_", "S0")}`;
      const dueDate = `${monthKey}-10`;

      let status: PaymentStatus = "PAID";
      let amountPaid = monthlyFee;
      let pendingAmount = 0;
      let paymentDate: string | undefined = `${monthKey}-0${(idx % 7) + 2}`;
      let paymentMethod: PaymentMethod | undefined =
        idx % 2 === 0 ? "UPI" : idx % 3 === 0 ? "CASH" : "BANK_TRANSFER";
      let transactionRef: string | undefined = `TXN-${monthKey.slice(5)}-${Math.floor(100000 + Math.random() * 900000)}`;

      // Distinctive patterns for October 2026 (the current active demo month)
      if (monthKey === "2026-10") {
        if (student.id === "stud_3") {
          // Liam Miller -> Overdue
          status = "OVERDUE";
          amountPaid = 0;
          pendingAmount = monthlyFee;
          paymentDate = undefined;
          paymentMethod = undefined;
          transactionRef = undefined;
        } else if (student.id === "stud_4") {
          // Aarav Sharma -> Partially paid
          status = "PARTIALLY_PAID";
          amountPaid = Math.floor(monthlyFee * 0.6);
          pendingAmount = monthlyFee - amountPaid;
          paymentDate = "2026-10-07";
          paymentMethod = "CASH";
          transactionRef = "CASH-RCP-1044";
        } else if (student.id === "stud_6") {
          // Rohan Verma -> Overdue
          status = "OVERDUE";
          amountPaid = 0;
          pendingAmount = monthlyFee;
          paymentDate = undefined;
          paymentMethod = undefined;
          transactionRef = undefined;
        } else if (student.id === "stud_8") {
          // Tanvi Iyer -> Partially paid
          status = "PARTIALLY_PAID";
          amountPaid = Math.floor(monthlyFee * 0.5);
          pendingAmount = monthlyFee - amountPaid;
          paymentDate = "2026-10-09";
          paymentMethod = "UPI";
          transactionRef = "UPI-9948271049";
        } else if (student.id === "stud_11") {
          // Ishita Kapoor -> Pending
          status = "PENDING";
          amountPaid = 0;
          pendingAmount = monthlyFee;
          paymentDate = undefined;
          paymentMethod = undefined;
          transactionRef = undefined;
        } else if (student.id === "stud_10") {
          // Vihaan Reddy -> Partially paid
          status = "PARTIALLY_PAID";
          amountPaid = Math.floor(monthlyFee * 0.45);
          pendingAmount = monthlyFee - amountPaid;
          paymentDate = "2026-10-05";
          paymentMethod = "CHEQUE";
          transactionRef = "CHQ-883920";
        } else {
          // All others paid on time
          status = "PAID";
          amountPaid = monthlyFee;
          pendingAmount = 0;
        }
      } else if (m.key > "2026-10") {
        // Future months are pending
        status = "PENDING";
        amountPaid = 0;
        pendingAmount = monthlyFee;
        paymentDate = undefined;
        paymentMethod = undefined;
        transactionRef = undefined;
      } else {
        // Months prior to October: mostly paid, occasional partial in Sept
        if (m.key === "2026-09" && (student.id === "stud_3" || student.id === "stud_6")) {
          status = "PARTIALLY_PAID";
          amountPaid = Math.floor(monthlyFee * 0.5);
          pendingAmount = monthlyFee - amountPaid;
          paymentDate = "2026-09-12";
          paymentMethod = "UPI";
        } else {
          status = "PAID";
          amountPaid = monthlyFee;
          pendingAmount = 0;
        }
      }

      records.push({
        id: `fee_${student.id}_${monthKey}`,
        studentId: student.id,
        studentName,
        rollNumber: `TOS-${student.id.replace("stud_", "00")}`,
        gradeLevel: student.standard,
        parentPhone: student.parentPhone,
        parentEmail: `${student.firstName.toLowerCase()}.${student.lastName.toLowerCase()}@example.com`,
        batchId: batch.id,
        batchCode: batch.code,
        batchName: batch.name,
        month: monthKey,
        monthName: m.label,
        academicYear: m.academicYear,
        totalFee: monthlyFee,
        amountPaid,
        pendingAmount,
        status,
        dueDate,
        paymentDate,
        paymentMethod,
        transactionRef,
        invoiceNumber,
        remarks:
          status === "OVERDUE"
            ? "Payment overdue past 10th of the month"
            : status === "PARTIALLY_PAID"
            ? `Partial installment received. ₹${pendingAmount} remaining.`
            : "Tuition fee payment processed",
        updatedAt: new Date().toISOString(),
      });
    });
  });

  return records;
}

/**
 * Retrieve stored fee records from localStorage with fallback to default seed
 */
export function getStoredFeeRecords(): MonthlyFeeRecord[] {
  if (typeof window === "undefined") {
    return generateInitialFeeRecords();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = generateInitialFeeRecords();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading stored fee records:", err);
    return generateInitialFeeRecords();
  }
}

/**
 * Persist fee records to localStorage
 */
export function saveFeeRecords(records: MonthlyFeeRecord[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (err) {
      console.error("Failed to save fee records:", err);
    }
  }
}

/**
 * Record a payment for a student and recompute status and pending dues
 */
export function recordStudentPayment(params: {
  studentId: string;
  month: string;
  amountReceived: number;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  remarks?: string;
  paymentDate?: string;
}): MonthlyFeeRecord | null {
  const records = getStoredFeeRecords();
  const index = records.findIndex(
    (r) => r.studentId === params.studentId && r.month === params.month
  );

  if (index === -1) return null;

  const current = records[index];
  const newAmountPaid = Math.min(
    current.totalFee,
    current.amountPaid + Math.max(0, params.amountReceived)
  );
  const newPending = Math.max(0, current.totalFee - newAmountPaid);

  let newStatus: PaymentStatus = "PAID";
  if (newPending === 0) {
    newStatus = "PAID";
  } else if (newAmountPaid > 0) {
    newStatus = "PARTIALLY_PAID";
  } else {
    // Check if past due date
    const today = new Date().toISOString().split("T")[0];
    newStatus = today > current.dueDate ? "OVERDUE" : "PENDING";
  }

  const updated: MonthlyFeeRecord = {
    ...current,
    amountPaid: newAmountPaid,
    pendingAmount: newPending,
    status: newStatus,
    paymentDate: params.paymentDate || new Date().toISOString().split("T")[0],
    paymentMethod: params.paymentMethod,
    transactionRef: params.transactionRef || current.transactionRef,
    remarks: params.remarks || current.remarks,
    updatedAt: new Date().toISOString(),
  };

  records[index] = updated;
  saveFeeRecords(records);
  return updated;
}

/**
 * Directly update a student's payment status to PAID, PARTIALLY_PAID, or PENDING
 * and automatically recompute amounts, balances, and timestamps.
 */
export function updateStudentPaymentStatus(params: {
  studentId: string;
  month: string;
  status: "PAID" | "PARTIALLY_PAID" | "PENDING";
  amountPaid?: number;
  paymentMethod?: PaymentMethod;
  paymentDate?: string;
  transactionRef?: string;
  remarks?: string;
}): MonthlyFeeRecord | null {
  const records = getStoredFeeRecords();
  const index = records.findIndex(
    (r) => r.studentId === params.studentId && r.month === params.month
  );

  if (index === -1) return null;

  const current = records[index];
  let newAmountPaid = 0;
  let newPending = 0;
  let newStatus: PaymentStatus = params.status;
  let newPaymentDate: string | undefined = undefined;
  let newPaymentMethod: PaymentMethod | undefined = undefined;
  let newTxnRef = params.transactionRef;

  if (params.status === "PAID") {
    newAmountPaid = current.totalFee;
    newPending = 0;
    newStatus = "PAID";
    newPaymentDate = params.paymentDate || new Date().toISOString().split("T")[0];
    newPaymentMethod = params.paymentMethod || current.paymentMethod || "UPI";
    newTxnRef = newTxnRef || current.transactionRef || `UPI-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  } else if (params.status === "PARTIALLY_PAID") {
    const defaultPartial = Math.floor(current.totalFee / 2);
    const validAmount =
      params.amountPaid !== undefined && params.amountPaid > 0 && params.amountPaid < current.totalFee
        ? params.amountPaid
        : current.amountPaid > 0 && current.amountPaid < current.totalFee
        ? current.amountPaid
        : defaultPartial;

    newAmountPaid = validAmount;
    newPending = current.totalFee - newAmountPaid;
    newStatus = "PARTIALLY_PAID";
    newPaymentDate = params.paymentDate || current.paymentDate || new Date().toISOString().split("T")[0];
    newPaymentMethod = params.paymentMethod || current.paymentMethod || "UPI";
    newTxnRef = newTxnRef || current.transactionRef || `PART-${Math.floor(100000 + Math.random() * 900000)}`;
  } else {
    // PENDING
    newAmountPaid = 0;
    newPending = current.totalFee;
    newStatus = "PENDING";
    newPaymentDate = undefined;
    newPaymentMethod = undefined;
    newTxnRef = undefined;
  }

  const updated: MonthlyFeeRecord = {
    ...current,
    amountPaid: newAmountPaid,
    pendingAmount: newPending,
    status: newStatus,
    paymentDate: newPaymentDate,
    paymentMethod: newPaymentMethod,
    transactionRef: newTxnRef,
    remarks:
      params.remarks ||
      (params.status === "PAID"
        ? "Payment marked as Fully Paid by administrator"
        : params.status === "PARTIALLY_PAID"
        ? `Partial fee of ₹${newAmountPaid} recorded. ₹${newPending} balance pending.`
        : "Fee payment status marked as Pending by administrator"),
    updatedAt: new Date().toISOString(),
  };

  records[index] = updated;
  saveFeeRecords(records);
  return updated;
}

/**
 * Reset all stored fee records back to initial mock dataset
 */
export function resetFeeRecordsToDefault(): MonthlyFeeRecord[] {
  const initial = generateInitialFeeRecords();
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    } catch (err) {
      console.error("Failed to reset fee records:", err);
    }
  }
  return initial;
}

/**
 * Calculate batch fee summary for a specific month
 */
export function calculateBatchFeeSummary(
  batchId: string,
  month: string,
  records: MonthlyFeeRecord[]
): BatchFeeSummary {
  const batch = MOCK_BATCHES.find((b) => b.id === batchId);
  const filtered = records.filter(
    (r) => (batchId === "ALL" || r.batchId === batchId) && r.month === month
  );

  const totalFeeExpected = filtered.reduce((acc, r) => acc + r.totalFee, 0);
  const totalCollected = filtered.reduce((acc, r) => acc + r.amountPaid, 0);
  const totalPending = filtered.reduce((acc, r) => acc + r.pendingAmount, 0);

  const paidCount = filtered.filter((r) => r.status === "PAID").length;
  const partialCount = filtered.filter((r) => r.status === "PARTIALLY_PAID").length;
  const pendingCount = filtered.filter((r) => r.status === "PENDING" || r.status === "OVERDUE").length;
  const overdueCount = filtered.filter((r) => r.status === "OVERDUE").length;

  const collectionPercentage =
    totalFeeExpected > 0 ? Math.round((totalCollected / totalFeeExpected) * 100) : 0;

  return {
    batchId,
    batchCode: batch ? batch.code : "ALL-BATCHES",
    batchName: batch ? batch.name : "All Enrolled Batches",
    enrolledStudents: filtered.length,
    totalFeeExpected,
    totalCollected,
    totalPending,
    collectionPercentage,
    paidCount,
    partialCount,
    pendingCount,
    overdueCount,
  };
}

/**
 * Calculate yearly summary for a student across all months of an academic year
 */
export function calculateStudentYearlySummary(
  studentId: string,
  academicYear: string,
  records: MonthlyFeeRecord[]
): StudentYearlyFeeSummary | null {
  const student = MOCK_STUDENTS.find((s) => s.id === studentId);
  if (!student) return null;

  const studentRecords = records
    .filter((r) => r.studentId === studentId && r.academicYear === academicYear)
    .sort((a, b) => a.month.localeCompare(b.month));

  const annualFee = studentRecords.reduce((acc, r) => acc + r.totalFee, 0);
  const totalPaid = studentRecords.reduce((acc, r) => acc + r.amountPaid, 0);
  const totalPending = studentRecords.reduce((acc, r) => acc + r.pendingAmount, 0);

  const paidMonthsCount = studentRecords.filter((r) => r.status === "PAID").length;
  const partialMonthsCount = studentRecords.filter((r) => r.status === "PARTIALLY_PAID").length;
  const pendingMonthsCount = studentRecords.filter(
    (r) => r.status === "PENDING" || r.status === "OVERDUE"
  ).length;

  const paymentPercentage =
    annualFee > 0 ? Math.round((totalPaid / annualFee) * 100) : 0;

  return {
    studentId,
    studentName: `${student.firstName} ${student.lastName}`.trim(),
    rollNumber: `TOS-${student.id.replace("stud_", "00")}`,
    gradeLevel: student.standard,
    parentPhone: student.parentPhone,
    parentEmail: `${student.firstName.toLowerCase()}.${student.lastName.toLowerCase()}@example.com`,
    batchId: student.batchId || "bat_1",
    batchCode: student.batchCode || "MATH-10A",
    batchName:
      MOCK_BATCHES.find((b) => b.id === student.batchId)?.name || "Standard Batch",
    academicYear,
    annualFee,
    totalPaid,
    totalPending,
    paymentPercentage,
    paidMonthsCount,
    partialMonthsCount,
    pendingMonthsCount,
    monthlyRecords: studentRecords,
  };
}

/**
 * Pre-filled reminder templates
 */
export function getReminderTemplate(
  type: ReminderType,
  data: {
    studentName: string;
    monthName: string;
    pendingAmount: number;
    dueDate: string;
    academyName?: string;
    upiId?: string;
  }
): string {
  const academy = data.academyName || "TutorOS Academy";
  const upi = data.upiId || "tutoros@icici";

  switch (type) {
    case "PENDING_FEE":
      return `Dear Parent, This is a gentle reminder from ${academy} that the tuition fee for ${data.studentName} for ${data.monthName} of ₹${data.pendingAmount} is pending. Kindly clear the dues before ${data.dueDate}. UPI: ${upi}. Thank you!`;

    case "PARTIAL_PAYMENT":
      return `Dear Parent, Thank you for your recent payment. A partial balance of ₹${data.pendingAmount} remains outstanding for ${data.studentName} (${data.monthName}) at ${academy}. Please arrange the remaining payment at your earliest convenience. UPI: ${upi}.`;

    case "UPCOMING_DUE":
      return `Dear Parent, Greetings from ${academy}. The monthly fee for ${data.studentName} for ${data.monthName} (₹${data.pendingAmount}) is due on ${data.dueDate}. Please ensure timely settlement to avoid late charges. UPI: ${upi}.`;

    case "OVERDUE_URGENT":
      return `URGENT NOTICE: The fee payment for ${data.studentName} (${data.monthName}) of ₹${data.pendingAmount} is OVERDUE past ${data.dueDate} at ${academy}. Kindly clear this immediately to continue uninterrupted classes. Pay via UPI: ${upi} or contact the office.`;

    default:
      return `Dear Parent, Please find fee details for ${data.studentName} (${data.monthName}). Outstanding balance: ₹${data.pendingAmount}. Due date: ${data.dueDate}. - ${academy}`;
  }
}

/**
 * Retrieve notification log history from localStorage
 */
export function getNotificationLogs(): NotificationLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(NOTIFICATION_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

/**
 * Save notification log
 */
export function logNotification(payload: Omit<NotificationLog, "id" | "sentAt">) {
  if (typeof window === "undefined") return;
  try {
    const existing = getNotificationLogs();
    const entry: NotificationLog = {
      ...payload,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sentAt: new Date().toISOString(),
    };
    localStorage.setItem(NOTIFICATION_LOG_KEY, JSON.stringify([entry, ...existing.slice(0, 49)]));
  } catch (err) {
    console.error("Failed to log notification:", err);
  }
}

/**
 * Client-side CSV export of fee records
 */
export function exportFeeRecordsToCSV(
  records: MonthlyFeeRecord[],
  filename = "TutorOS_Fee_Report.csv"
) {
  if (typeof window === "undefined") return;

  const headers = [
    "Invoice Number",
    "Student Name",
    "Roll Number",
    "Grade",
    "Batch Code",
    "Batch Name",
    "Month",
    "Total Fee (INR)",
    "Amount Paid (INR)",
    "Pending Amount (INR)",
    "Status",
    "Due Date",
    "Payment Date",
    "Payment Method",
    "Transaction Ref",
    "Parent Phone",
  ];

  const rows = records.map((r) => [
    `"${r.invoiceNumber}"`,
    `"${r.studentName}"`,
    `"${r.rollNumber || ""}"`,
    `"${r.gradeLevel || ""}"`,
    `"${r.batchCode}"`,
    `"${r.batchName}"`,
    `"${r.monthName}"`,
    r.totalFee,
    r.amountPaid,
    r.pendingAmount,
    `"${r.status}"`,
    `"${r.dueDate}"`,
    `"${r.paymentDate || "N/A"}"`,
    `"${r.paymentMethod || "N/A"}"`,
    `"${r.transactionRef || "N/A"}"`,
    `"${r.parentPhone}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
