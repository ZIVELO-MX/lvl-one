import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        },
      },
    },
  );
}

export async function getSession() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function requireAuth() {
  const supabase = await createServerSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user || error) {
    throw new Error("Unauthorized");
  }
  return { user, supabase };
}

export async function requireDmAuth(campaignId: string) {
  const { user, supabase } = await requireAuth();
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("dm_id")
    .eq("id", campaignId)
    .single();
  if (!campaign) throw new Error("Not found");
  if (campaign.dm_id !== user.id) throw new Error("Forbidden");
  return { user, supabase };
}
