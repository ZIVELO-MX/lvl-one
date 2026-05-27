"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppProvider, useApp } from "@/lib/store";
import { useMounted } from "@/lib/mounted";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  const router = useRouter();
  const mounted = useMounted();
  useEffect(() => {
    if (mounted && !state.user) router.replace("/login");
  }, [mounted, state.user, router]);
  if (!mounted || !state.user) return null;
  return <>{children}</>;
}

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return <AppProvider><AuthGuard>{children}</AuthGuard></AppProvider>;
}
