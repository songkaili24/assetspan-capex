"use client";

import { useState } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Input } from "@/components/ui/filters";

export function CreateScenarioModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, multiplier: number, description: string) => void;
}) {
  const [name, setName] = useState("");
  const [multiplier, setMultiplier] = useState("100");
  const [description, setDescription] = useState("");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Scenario"
      subtitle="Starts as a Draft — submit for approval from the detail view"
      footer={
        <ModalFooter
          onClose={onClose}
          onConfirm={() =>
            onCreate(
              name || "Untitled Scenario",
              Number(multiplier) / 100,
              description || "No description provided.",
            )
          }
          confirmLabel="Create Draft"
        />
      }
    >
      <div className="space-y-4">
        <Input
          label="Scenario Name"
          value={name}
          onChange={setName}
          placeholder="e.g. Bond-Funded Accelerated Plan"
        />
        <Input
          label="Funding Level (% of baseline reserve study)"
          value={multiplier}
          onChange={setMultiplier}
          type="number"
          min={55}
          max={140}
          step={5}
        />
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-charcoal-500">
            Strategy Description
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What does this scenario assume, and what should reviewers watch?"
            className="w-full rounded-lg border border-charcoal-300 bg-white px-3 py-2 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:border-gold-600 focus:outline-none focus:ring-1 focus:ring-gold-600"
          />
        </label>
      </div>
    </Modal>
  );
}
