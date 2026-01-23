import { Suspense } from "react";
import NewFlashkyClient from "../components/NewFlashkyClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <NewFlashkyClient />
    </Suspense>
  );
}
