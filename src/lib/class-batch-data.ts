// src/lib/class-batch-data.ts
// Data layer for Class Batch Management
import { NewClassBatch, ClassBatch, BatchStatus } from "../types/class-batch";
import { v4 as uuidv4 } from "uuid";

export type { NewClassBatch };

const STORAGE_KEY = "tutoros_class_batches_v2";

/** Load batches from localStorage */
export function getStoredClassBatches(): ClassBatch[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

/** Persist batches */
export function setStoredClassBatches(batches: ClassBatch[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
}

/** Generate a new batch ID */
export function generateBatchId(): string {
  return "BATCH-" + uuidv4().slice(0, 8);
}

/** Create a new batch */
export function createClassBatch(data: NewClassBatch): ClassBatch {
  const batch: ClassBatch = {
    ...data,
    batchId: generateBatchId(),
    studentIds: [],
    status: data.status || BatchStatus.ACTIVE,
  };
  const batches = getStoredClassBatches();
  batches.push(batch);
  setStoredClassBatches(batches);
  return batch;
}

/** Update an existing batch */
export function updateClassBatch(updated: Partial<ClassBatch> & { batchId: string }) {
  const batches = getStoredClassBatches();
  const idx = batches.findIndex((b) => b.batchId === updated.batchId);
  if (idx === -1) return null;
  const batch = { ...batches[idx], ...updated };
  batches[idx] = batch;
  setStoredClassBatches(batches);
  return batch;
}

/** Assign students to a batch */
export function assignStudentsToBatch(batchId: string, studentIds: string[]) {
  const batch = getStoredClassBatches().find((b) => b.batchId === batchId);
  if (!batch) return null;
  batch.studentIds = Array.from(new Set([...batch.studentIds, ...studentIds]));
  updateClassBatch(batch);
  return batch;
}

/** Mock seed data across Academic Years */
export function seedMockBatches() {
  if (typeof window === "undefined") return;
  if (getStoredClassBatches().length > 0) return;

  const mock: ClassBatch[] = [
    // ----------------------------------------------------
    // Academic Year: 2026-2027 (Current Active Academic Year)
    // ----------------------------------------------------
    {
      batchId: "BATCH-2026-10A",
      batchName: "Grade 10 - Advanced Mathematics",
      className: "10th Grade",
      academicYear: "2026-2027",
      assignedTeacherId: "EMP-101", // Dr. Sarah Jenkins
      capacity: 30,
      startDate: "2026-06-01",
      endDate: "2027-05-31",
      status: BatchStatus.ACTIVE,
      studentIds: ["stud_1", "stud_3", "stud_4", "stud_7"],
    },
    {
      batchId: "BATCH-2026-12B",
      batchName: "Grade 12 - AP Physics Mechanics",
      className: "12th Grade",
      academicYear: "2026-2027",
      assignedTeacherId: "EMP-102", // Prof. Amir Khan
      capacity: 25,
      startDate: "2026-06-01",
      endDate: "2027-05-31",
      status: BatchStatus.ACTIVE,
      studentIds: ["stud_5", "stud_6", "stud_8", "stud_9"],
    },
    {
      batchId: "BATCH-2026-10SCI",
      batchName: "Grade 10 - Full Science Stream",
      className: "10th Grade",
      academicYear: "2026-2027",
      assignedTeacherId: "EMP-104", // Neha Patel
      capacity: 28,
      startDate: "2026-06-15",
      endDate: "2027-05-31",
      status: BatchStatus.ACTIVE,
      studentIds: ["stud_1", "stud_4", "stud_7"],
    },
    {
      batchId: "BATCH-2026-11M",
      batchName: "Grade 11 - Pure Mathematics",
      className: "11th Grade",
      academicYear: "2026-2027",
      assignedTeacherId: "EMP-103", // Amit Sharma
      capacity: 20,
      startDate: "2026-07-01",
      endDate: "2027-04-30",
      status: BatchStatus.ACTIVE,
      studentIds: ["stud_3", "stud_7"],
    },

    // ----------------------------------------------------
    // Academic Year: 2025-2026 (Previous Academic Year)
    // ----------------------------------------------------
    {
      batchId: "BATCH-2025-10M",
      batchName: "Grade 10 - Math Foundations (2025-2026)",
      className: "10th Grade",
      academicYear: "2025-2026",
      assignedTeacherId: "EMP-101", // Dr. Sarah Jenkins
      capacity: 30,
      startDate: "2025-06-01",
      endDate: "2026-05-31",
      status: BatchStatus.ACTIVE,
      studentIds: ["stud_1", "stud_3"],
    },
    {
      batchId: "BATCH-2025-12P",
      batchName: "Grade 12 - Senior Physics (2025-2026)",
      className: "12th Grade",
      academicYear: "2025-2026",
      assignedTeacherId: "EMP-102", // Prof. Amir Khan
      capacity: 24,
      startDate: "2025-06-01",
      endDate: "2026-05-31",
      status: BatchStatus.ACTIVE,
      studentIds: ["stud_5", "stud_6"],
    },
    {
      batchId: "BATCH-2025-11CS",
      batchName: "Grade 11 - Computer Science & Coding (2025-2026)",
      className: "11th Grade",
      academicYear: "2025-2026",
      assignedTeacherId: "EMP-105", // Dr. Robert Lang
      capacity: 18,
      startDate: "2025-07-01",
      endDate: "2026-04-30",
      status: BatchStatus.ACTIVE,
      studentIds: ["stud_8", "stud_9"],
    },

    // ----------------------------------------------------
    // Academic Year: 2024-2025 (Historical Session)
    // ----------------------------------------------------
    {
      batchId: "BATCH-2024-10A",
      batchName: "Grade 10 - Cohort Alpha (2024-2025)",
      className: "10th Grade",
      academicYear: "2024-2025",
      assignedTeacherId: "EMP-108", // Alice Johnson
      capacity: 25,
      startDate: "2024-06-01",
      endDate: "2025-05-31",
      status: BatchStatus.INACTIVE,
      studentIds: ["stud_4", "stud_7"],
    },
    {
      batchId: "BATCH-2024-12A",
      batchName: "Grade 12 - Board Prep (2024-2025)",
      className: "12th Grade",
      academicYear: "2024-2025",
      assignedTeacherId: "EMP-108", // Alice Johnson
      capacity: 25,
      startDate: "2024-06-01",
      endDate: "2025-05-31",
      status: BatchStatus.INACTIVE,
      studentIds: ["stud_8"],
    },
  ];

  setStoredClassBatches(mock);
}
