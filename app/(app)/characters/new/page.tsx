"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp, newDraft } from "@/lib/store";

export default function NewCharacterPage() {
  const { state, dispatch } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (state.characters.length >= 2) {
      dispatch({ type: "LIMIT_OPEN" });
      router.replace("/characters");
      return;
    }
    const d = newDraft();
    dispatch({ type: "DRAFT_INIT", draft: d });
    router.replace(`/characters/${d.id}/edit/1`);
  }, [dispatch, router, state.characters.length]);

  return null;
}
