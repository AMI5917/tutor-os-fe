// src/server/actions/teacher.actions.ts
"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookies().set(name, value, options);
          } catch (error) {
            // Ignore
          }
        },
        remove(name: string, options: any) {
          try {
            cookies().set(name, "", options);
          } catch (error) {
            // Ignore
          }
        },
      },
    }
  );
}

export async function getTeachers() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("teachers")
    .select(`
      *,
      users(full_name, email, phone, avatar_url)
    `)
    .eq("status", "ACTIVE")
    .order("first_name");

  if (error) {
    console.error("Error fetching teachers:", error);
    return [];
  }

  return data || [];
}

export async function getTeacher(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("teachers")
    .select(`
      *,
      users(full_name, email, phone, avatar_url),
      batches(id, name, subject_id, max_capacity)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching teacher:", error);
    return null;
  }

  return data;
}

export async function createTeacher(teacherData: {
  first_name: string;
  middle_name?: string;
  last_name: string;
  subject_specialization: string;
  qualification?: string;
  hourly_rate?: number;
  rate_type: string;
  rate_amount: number;
  mobile_number: string;
  user_id: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("teachers")
    .insert(teacherData)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/teachers");
  return { success: true, teacher: data };
}

export async function updateTeacher(id: string, teacherData: any) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("teachers")
    .update(teacherData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/teachers");
  return { success: true, teacher: data };
}

export async function deleteTeacher(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("teachers")
    .update({ status: "INACTIVE" })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/teachers");
  return { success: true };
}