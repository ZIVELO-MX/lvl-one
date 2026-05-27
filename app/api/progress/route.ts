import { NextResponse } from "next/server";
import { createServerSupabase, requireAuth } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabase();

    const { data, error } = await supabase
      .from("modules_progress")
      .select("*")
      .eq("user_id", session.user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Convert to moduleId-keyed object
    const progress: Record<string, { pct: number; completedLessons: string[] }> = {};
    for (const row of data ?? []) {
      progress[row.module_id] = { pct: row.pct, completedLessons: row.completed_lessons };
    }

    return NextResponse.json(progress);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabase();
    const body: { moduleId: string; completedLessons?: string[]; pct?: number } = await req.json();
    const { moduleId, completedLessons, pct } = body;

    if (!moduleId || typeof moduleId !== "string") {
      return NextResponse.json({ error: "moduleId is required and must be a non-empty string" }, { status: 400 });
    }

    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (completedLessons !== undefined) payload.completed_lessons = completedLessons;
    if (pct !== undefined) payload.pct = pct;

    const { data, error } = await supabase
      .from("modules_progress")
      .upsert(
        { user_id: session.user.id, module_id: moduleId, ...payload },
        { onConflict: "user_id,module_id" },
      )
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
