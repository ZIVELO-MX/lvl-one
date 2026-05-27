import { NextResponse } from "next/server";
import { createServerSupabase, requireAuth } from "@/lib/supabaseServer";
import { pick, CHARACTER_FIELDS } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("characters")
      .select("*")
      .eq("user_id", session.user.id)
      .order("updated_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabase();
    const body = await req.json();

    const { data, error } = await supabase
      .from("characters")
      .insert({ ...pick(body, CHARACTER_FIELDS), user_id: session.user.id })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
