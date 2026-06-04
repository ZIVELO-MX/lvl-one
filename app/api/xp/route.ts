import { NextResponse } from "next/server";
import { createServerSupabase, requireAuth } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabase();

    const { data: xp } = await supabase
      .from("user_xp")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    const { data: achievements } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", session.user.id)
      .order("earned_at", { ascending: false });

    const total = xp?.total || 0;
    const level = Math.floor(total / 500) + 1;

    return NextResponse.json({
      total,
      level,
      updatedAt: xp?.updated_at || null,
      achievements: achievements || [],
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

const XP_GRANTS: Record<string, number> = {
  complete_lesson: 50,
  create_character: 25,
  join_group: 15,
  daily_login: 10,
};

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabase();
    const { type } = await req.json();

    const amount = XP_GRANTS[type];
    if (!amount) {
      return NextResponse.json({ error: "Invalid XP event type" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("user_xp")
      .select("total")
      .eq("user_id", session.user.id)
      .single();

    if (existing) {
      const { error } = await supabase
        .from("user_xp")
        .update({ total: existing.total + amount, updated_at: new Date().toISOString() })
        .eq("user_id", session.user.id);

      if (error) return NextResponse.json({ error: "Database error" }, { status: 500 });
    } else {
      const { error } = await supabase
        .from("user_xp")
        .insert({ user_id: session.user.id, total: amount });

      if (error) return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const { data: updated } = await supabase
      .from("user_xp")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    const total = updated?.total || amount;
    const level = Math.floor(total / 500) + 1;

    const oldLevel = existing ? Math.floor(existing.total / 500) + 1 : 1;
    if (level > oldLevel) {
      await supabase.from("activity_feed").insert({
        user_id: session.user.id,
        type: "level_up",
        target_id: session.user.id,
        target_type: "user",
      });
    }

    return NextResponse.json({
      total,
      level,
      updatedAt: updated?.updated_at || new Date().toISOString(),
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
