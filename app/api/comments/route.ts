import { NextResponse } from "next/server";
import { createServerSupabase, requireAuth } from "@/lib/supabaseServer";
import { pick } from "@/lib/api-helpers";

const COMMENT_FIELDS = ["campaign_id", "body"] as const;

export async function GET(req: Request) {
  try {
    await requireAuth();
    const supabase = await createServerSupabase();
    const url = new URL(req.url);
    const campaignId = url.searchParams.get("campaignId");

    if (!campaignId) {
      return NextResponse.json({ error: "campaignId query param is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        author:user_id (id, username, avatar_url)
      `)
      .eq("campaign_id", campaignId)
      .order("created_at", { ascending: true });

    if (error) return NextResponse.json({ error: "Database error" }, { status: 500 });
    return NextResponse.json(data || []);
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
      .from("comments")
      .insert({ ...pick(body, COMMENT_FIELDS), user_id: session.user.id })
      .select(`
        *,
        author:user_id (id, username, avatar_url)
      `)
      .single();

    if (error) return NextResponse.json({ error: "Database error" }, { status: 500 });

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
