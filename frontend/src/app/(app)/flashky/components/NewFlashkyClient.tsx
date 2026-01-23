"use client";

import { useSearchParams } from "next/navigation";
import NewFlashkyInner from "./NewFlashkyInner";

export default function NewFlashkyClient() {
  const searchParams = useSearchParams();
  const deckId = searchParams.get("deck");

  return <NewFlashkyInner deckId={deckId} />;
}
