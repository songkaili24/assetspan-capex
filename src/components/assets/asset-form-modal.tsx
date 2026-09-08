"use client";

import { useState } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Input, Select } from "@/components/ui/filters";
import type { Asset, AssetClass, AssetCondition, Criticality } from "@/lib/types";

const CLASSES: AssetClass[] = ["HVAC", "Roofing", "Elevator", "Electrical", "Plumbing"];
const CONDITIONS: AssetCondition[] = ["Excellent", "Good", "Fair", "Poor", "Critical"];
const CRITICALITIES: Criticality[] = ["High", "Medium", "Low"];

/**
 * Add Asset form. The next asset ID is derived from the highest existing
 * class-series number so the register stays ordered; remaining life and
 * forecast year compute from the inputs the estimator fills in.
 */
export function AssetFormModal({
  open,
  onClose,
  buildings,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  buildings: string[];
  onCreate: (asset: Asset) => void;
}) {
  const [name, setName] = useState("");
  const [assetClass, setAssetClass] = useState<AssetClass>("HVAC");
  const [buildingName, setBuildingName] = useState(buildings[0] ?? "");
  const [location, setLocation] = useState("");
  const [installDate, setInstallDate] = useState("2015-01-01");
  const [usefulLife, setUsefulLife] = useState("20");
  const [cost, setCost] = useState("250000");
  const [condition, setCondition] = useState<AssetCondition>("Good");
  const [criticality, setCriticality] = useState<Criticality>("Medium");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");

  const reset = () => {
    setName("");
    setLocation("");
    setManufacturer("");
    setModel("");
  };

  const submit = () => {
    const inServiceYear = Number(installDate.slice(0, 4));
    const life = Number(usefulLife) || 20;
    const eolYear = inServiceYear + life;
    const remaining = Math.max(0, Math.min(1, (eolYear - 2026) / life));
    const forecastYear = remaining > 0 ? eolYear : 2026;
    const id = `ast-${3000 + Math.floor(Math.random() * 7000)}`;

    const asset: Asset = {
      id,
      name: name || "New Capital Asset",
      tag: "TBD",
      assetClass,
      buildingId: "bldg-new",
      buildingName,
      condition,
      conditionScore: { Excellent: 90, Good: 70, Fair: 50, Poor: 30, Critical: 12 }[condition],
      currentReplacementCost: Number(cost) || 0,
      usefulLifeYears: life,
      installDate,
      inServiceYear,
      forecastReplacementYear: forecastYear,
      forecastQuarter: "Q2",
      remainingLifePct: remaining,
      location: location || " TBD",
      lastInspectionDate: "2026-04-01",
      manufacturer: manufacturer || "—",
      model: model || "—",
      warrantyStatus: "Active",
      warrantyExpiration: `${inServiceYear + 5}-01-01`,
      criticality,
      maintenanceHistory: [],
      linkedProjectIds: [],
    };
    onCreate(asset);
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Asset"
      subtitle="New entry registers as Draft pending field verification"
      size="lg"
      footer={<ModalFooter onClose={onClose} onConfirm={submit} confirmLabel="Register Asset" />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Asset Name"
          value={name}
          onChange={setName}
          placeholder="e.g. Chiller — 800 Ton"
          className="sm:col-span-2"
        />
        <Select
          label="Category"
          value={assetClass}
          onChange={(v) => setAssetClass(v as AssetClass)}
          options={CLASSES.map((c) => ({ value: c, label: c }))}
        />
        <Select
          label="Building"
          value={buildingName}
          onChange={setBuildingName}
          options={buildings.map((b) => ({ value: b, label: b }))}
        />
        <Input
          label="Location"
          value={location}
          onChange={setLocation}
          placeholder="e.g. Level B1 — Central Plant"
          className="sm:col-span-2"
        />
        <Input label="Install Date" value={installDate} onChange={setInstallDate} type="date" />
        <Input
          label="Expected Life (years)"
          value={usefulLife}
          onChange={setUsefulLife}
          type="number"
          min={1}
        />
        <Input
          label="Replacement Cost (USD)"
          value={cost}
          onChange={setCost}
          type="number"
          min={0}
          step={1000}
        />
        <Select
          label="Condition"
          value={condition}
          onChange={(v) => setCondition(v as AssetCondition)}
          options={CONDITIONS.map((c) => ({ value: c, label: c }))}
        />
        <Select
          label="Criticality"
          value={criticality}
          onChange={(v) => setCriticality(v as Criticality)}
          options={CRITICALITIES.map((c) => ({ value: c, label: c }))}
        />
        <Input
          label="Manufacturer"
          value={manufacturer}
          onChange={setManufacturer}
          placeholder="e.g. Carrier"
        />
        <Input label="Model" value={model} onChange={setModel} placeholder="e.g. 19XR" />
      </div>
      <p className="mt-4 rounded-lg bg-charcoal-50 p-3 text-xs leading-relaxed text-charcoal-500">
        Remaining life and the condition-adjusted forecast replacement year compute automatically
        from install date, expected life, and condition. The asset enters the lifecycle model on the
        next run.
      </p>
    </Modal>
  );
}
