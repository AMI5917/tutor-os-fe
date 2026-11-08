// Types for Class Batch Management

export enum BatchStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface ClassBatch {
  /** Unique identifier for the batch */
  batchId: string;
  /** Human readable name, e.g. "Batch A - 2024" */
  batchName: string;
  /** Class or grade this batch belongs to (e.g. "10th Grade") */
  className: string;
  /** Academic year string, e.g. "2024-2025" */
  academicYear: string;
  /** Teacher (by employeeId) assigned to lead the batch */
  assignedTeacherId: string;
  /** Maximum number of students the batch can hold */
  capacity: number;
  /** Start date of the batch (ISO string) */
  startDate: string;
  /** End date of the batch (ISO string) */
  endDate: string;
  /** Current status */
  status: BatchStatus;
  /** List of student IDs assigned to this batch */
  studentIds: string[];
}

/** Helper type for creating a new batch (ID is generated) */
export type NewClassBatch = Omit<ClassBatch, "batchId" | "studentIds">;
