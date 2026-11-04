// src/server/actions/batch.actions.ts
"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            // Ignore
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set(name, "", options);
          } catch (error) {
            // Ignore
          }
        },
      },
    }
  );
}

export async function getBatches() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("batches")
    .select(`
      *,
      subjects(name, code, default_monthly_fee),
      teachers(first_name, last_name, users(full_name))
    `)
    .eq("status", "ACTIVE")
    .order("name");

  if (error) {
    console.error("Error fetching batches:", error);
    return [];
  }

  return data || [];
}

export async function getBatch(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("batches")
    .select(`
      *,
      subjects(name, code, default_monthly_fee),
      teachers(first_name, last_name, users(full_name, phone, email)),
      batch_enrollment(
        id,
        status,
        students(id, first_name, last_name, grade_level, users(full_name, email))
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching batch:", error);
    return null;
  }

  return data;
}

export async function createBatch(batchData: {
  name: string;
  subject_id: string;
  grade: string;
  teacher_id: string;
  max_capacity: number;
  color_code?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("batches")
    .insert(batchData)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/batches");
  return { success: true, batch: data };
}

export async function updateBatch(id: string, batchData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("batches")
    .update(batchData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/batches");
  return { success: true, batch: data };
}

export async function deleteBatch(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("batches")
    .update({ status: "ARCHIVED" })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/batches");
  return { success: true };
}

export async function enrollStudentInBatch(batchId: string, studentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("batch_enrollment")
    .insert({
      batch_id: batchId,
      student_id: studentId,
      status: "ENROLLED",
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/batches/${batchId}`);
  return { success: true, enrollment: data };
}

export async function unenrollStudentFromBatch(batchId: string, studentId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("batch_enrollment")
    .update({ status: "DROPPED" })
    .eq("batch_id", batchId)
    .eq("student_id", studentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/batches/${batchId}`);
  return { success: true };
}