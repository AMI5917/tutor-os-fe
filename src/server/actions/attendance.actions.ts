// src/server/actions/attendance.actions.ts
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

export async function createClassSession(sessionData: {
  batch_id: string;
  teacher_id: string;
  start_time: string;
  end_time: string;
  meeting_link?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("class_sessions")
    .insert(sessionData)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/schedule");
  return { success: true, session: data };
}

export async function markAttendance(
  sessionId: string,
  studentId: string,
  status: string,
  remarks?: string
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("attendance")
    .upsert({
      session_id: sessionId,
      student_id: studentId,
      status,
      remarks,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/attendance");
  return { success: true, attendance: data };
}

export async function createLessonLog(lessonData: {
  session_id: string;
  topics_covered: string;
  homework_details?: string;
  homework_due_date?: string;
  tutor_private_notes?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lesson_logs")
    .insert(lessonData)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/attendance");
  return { success: true, lesson: data };
}

export async function getTodaySessions(teacherId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("class_sessions")
    .select(`
      *,
      batches(name, subjects(name)),
      teachers(first_name, last_name)
    `)
    .gte("start_time", new Date().toISOString())
    .lt("start_time", new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
    .order("start_time");

  if (teacherId) {
    query = query.eq("teacher_id", teacherId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching today sessions:", error);
    return [];
  }

  return data || [];
}