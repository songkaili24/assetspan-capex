"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChangeOrderModal } from "@/components/projects/change-order-modal";
import type { CapitalProject } from "@/lib/types";

/** Detail-page actions: change order entry with the 10% escalation gate. */
export function ProjectActions({ project }: { project: CapitalProject }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {project.status !== "Completed" && (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          Log Change Order
        </Button>
      )}
      <Button variant="calculation" size="sm">
        {project.status === "Bidding" ? "Award Recommendation" : "Submit Budget Action"}
      </Button>
      <ChangeOrderModal project={project} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
