"use client";
import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { Step1Identity } from "@/components/creator/steps/Step1Identity";
import { Step2Race } from "@/components/creator/steps/Step2Race";
import { Step3Class } from "@/components/creator/steps/Step3Class";
import { Step4Stats } from "@/components/creator/steps/Step4Stats";
import { Step5Background } from "@/components/creator/steps/Step5Background";
import { Step6Equipment } from "@/components/creator/steps/Step6Equipment";
import { Step7Story } from "@/components/creator/steps/Step7Story";
import { Step8Review } from "@/components/creator/steps/Step8Review";

const STEPS = [Step1Identity, Step2Race, Step3Class, Step4Stats, Step5Background, Step6Equipment, Step7Story, Step8Review];

interface Props {
  params: Promise<{ id: string; step: string }>;
}

export default function EditPage({ params }: Props) {
  const { id, step: stepStr } = use(params);
  const step = parseInt(stepStr, 10);
  const router = useRouter();
  const { state, dispatch } = useApp();

  const draft = state.draftCharacter?.id === id
    ? state.draftCharacter
    : state.characters.find(c => c.id === id) ?? null;

  useEffect(() => {
    if (!draft) {
      const existing = state.characters.find(c => c.id === id);
      if (existing) {
        dispatch({ type: "DRAFT_INIT", draft: existing });
      } else {
        router.replace("/characters");
      }
    }
  }, [dispatch, draft, id, router, state.characters]);

  if (!draft) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", color: "var(--text-low)" }}>
        Cargando…
      </div>
    );
  }

  if (step < 1 || step > 8 || isNaN(step)) {
    router.replace(`/characters/${id}/edit/1`);
    return null;
  }

  const StepComponent = STEPS[step - 1];

  return <StepComponent draft={draft} id={id}/>;
}
