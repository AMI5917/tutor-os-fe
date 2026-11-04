// src/types/billing.ts

export type PaymentStatus = "PAID" | "PARTIALLY_PAID" | "PENDING" | "OVERDUE";

export type PaymentMethod = "UPI" | "CASH" | "BANK_TRANSFER" | "CHEQUE" | "CARD";

export interface MonthlyFeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber?: string;
  gradeLevel?: string;
  parentPhone: string;
  parentEmail?: string;
  batchId: string;
  batchCode: string;
  batchName: string;
  month: string; // "2026-10"
  monthName: string; // "October 2026"
  academicYear: string; // "2026-2027"
  totalFee: number; // in ₹
  amountPaid: number; // in ₹
  pendingAmount: number; // in ₹
  status: PaymentStatus;
  dueDate: string; // "2026-10-10"
  paymentDate?: string; // "2026-10-08"
  paymentMethod?: PaymentMethod;
  transactionRef?: string;
  invoiceNumber: string; // "INV-2026-1001"
  remarks?: string;
  updatedAt?: string;
}

export interface StudentYearlyFeeSummary {
  studentId: string;
  studentName: string;
  rollNumber?: string;
  gradeLevel?: string;
  parentPhone: string;
  parentEmail?: string;
  batchId: string;
  batchCode: string;
  batchName: string;
  academicYear: string;
  annualFee: number;
  totalPaid: number;
  totalPending: number;
  paymentPercentage: number;
  paidMonthsCount: number;
  pendingMonthsCount: number;
  partialMonthsCount: number;
  monthlyRecords: MonthlyFeeRecord[];
}

export interface BatchFeeSummary {
  batchId: string;
  batchCode: string;
  batchName: string;
  enrolledStudents: number;
  totalFeeExpected: number;
  totalCollected: number;
  totalPending: number;
  collectionPercentage: number;
  paidCount: number;
  partialCount: number;
  pendingCount: number;
  overdueCount: number;
}

export type ReminderChannel = "WHATSAPP" | "SMS" | "EMAIL" | "IN_APP";

export type ReminderType =
  | "PENDING_FEE"
  | "PARTIAL_PAYMENT"
  | "UPCOMING_DUE"
  | "OVERDUE_URGENT";

export interface ReminderPayload {
  studentId: string;
  studentName: string;
  parentPhone: string;
  parentEmail?: string;
  channel: ReminderChannel;
  type: ReminderType;
  month: string;
  pendingAmount: number;
  dueDate: string;
  customMessage: string;
  sentAt?: string;
}

export interface NotificationLog {
  id: string;
  studentId: string;
  studentName: string;
  recipientContact: string;
  channel: ReminderChannel;
  type: ReminderType;
  amount: number;
  message: string;
  sentAt: string;
  status: "SENT" | "FAILED";
}
