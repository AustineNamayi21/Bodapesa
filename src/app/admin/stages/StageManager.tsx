"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { deleteStageAction, saveStageAction } from "@/lib/crud";
import { DangerButton, Field, Keep, KeptInput, Result, Submit, type CrudState } from "@/components/admin";

export interface StageRow {
  id: string;
  name: string;
  subCounty: string;
  ward: string | null;
  lat: number | null;
  lng: number | null;
  chairperson: string | null;
  chairMsisdn: string | null;
  riders: number;
}

function StageForm({ stage, onDone }: { stage?: StageRow; onDone: () => void }) {
  const [state, action] = useActionState(saveStageAction, null as CrudState);

  const saved = state?.ok;
  useEffect(() => {
    if (saved) onDone();
  }, [saved, onDone]);

  return (
    <Keep state={state}>
      <form
        action={action}
        className="p-4 space-y-4"
        style={{ border: "2px solid var(--ink)", background: "var(--surface)" }}
      >
        {stage ? <input type="hidden" name="stageId" value={stage.id} /> : null}

        <div className="grid gap-3 sm:grid-cols-3">
          <Field id={`name-${stage?.id ?? "new"}`} label="Stage name">
            <KeptInput name="name" defaultValue={stage?.name} required placeholder="Kangemi Main" />
          </Field>
          <Field id={`sub-${stage?.id ?? "new"}`} label="Sub-county">
            <KeptInput name="subCounty" defaultValue={stage?.subCounty} required placeholder="Westlands" />
          </Field>
          <Field id={`ward-${stage?.id ?? "new"}`} label="Ward">
            <KeptInput name="ward" defaultValue={stage?.ward ?? ""} />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <Field id={`chair-${stage?.id ?? "new"}`} label="Chairperson">
            <KeptInput name="chairperson" defaultValue={stage?.chairperson ?? ""} />
          </Field>
          <Field id={`chairm-${stage?.id ?? "new"}`} label="Chairperson's number">
            <KeptInput
              name="chairMsisdn"
              inputMode="tel"
              defaultValue={stage?.chairMsisdn ?? ""}
              placeholder="0712 345 678"
            />
          </Field>
          <Field id={`lat-${stage?.id ?? "new"}`} label="Latitude">
            <KeptInput name="lat" inputMode="decimal" defaultValue={stage?.lat ?? ""} placeholder="-1.2672" />
          </Field>
          <Field id={`lng-${stage?.id ?? "new"}`} label="Longitude">
            <KeptInput name="lng" inputMode="decimal" defaultValue={stage?.lng ?? ""} placeholder="36.7461" />
          </Field>
        </div>

        <Result state={state} />

        <div className="flex items-center gap-2">
          <Submit label={stage ? "Save stage" : "Add stage"} />
          <button type="button" className="btn btn-ghost btn-sm" onClick={onDone}>
            Cancel
          </button>
        </div>
      </form>
    </Keep>
  );
}

export default function StageManager({ stages, canEdit }: { stages: StageRow[]; canEdit: boolean }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const bySubCounty = stages.reduce<Record<string, StageRow[]>>((acc, s) => {
    (acc[s.subCounty] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {canEdit ? (
        adding ? (
          <StageForm onDone={() => setAdding(false)} />
        ) : (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>
            <Plus size={14} /> Add a stage
          </button>
        )
      ) : null}

      {Object.entries(bySubCounty)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([subCounty, items]) => (
          <section key={subCounty}>
            <div className="rule-head mb-3">
              <h2 className="text-[1.05rem] leading-none">{subCounty}</h2>
              <span className="eyebrow">
                {items.length} stage{items.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="space-y-2">
              {items.map((s) =>
                editingId === s.id ? (
                  <StageForm key={s.id} stage={s} onDone={() => setEditingId(null)} />
                ) : (
                  <div key={s.id} className="card p-3.5 flex flex-wrap items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[0.95rem] font-semibold">{s.name}</h3>
                      <p className="text-[0.76rem] mt-0.5" style={{ color: "var(--text-faint)" }}>
                        {s.ward ? `${s.ward} ward · ` : ""}
                        {s.chairperson ? `Chair: ${s.chairperson}` : "No chairperson recorded"}
                        {s.lat && s.lng ? ` · ${s.lat.toFixed(4)}, ${s.lng.toFixed(4)}` : ""}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="stat-value text-[1.15rem]">{s.riders}</div>
                      <div className="stat-label">riders</div>
                    </div>

                    {canEdit ? (
                      <div className="flex items-start gap-2 shrink-0">
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setEditingId(s.id)}
                        >
                          Edit
                        </button>
                        <DangerButton
                          action={deleteStageAction}
                          hidden={{ stageId: s.id }}
                          label="Delete"
                          confirmLabel="Delete stage"
                          warning={
                            s.riders > 0
                              ? `${s.riders} rider${s.riders === 1 ? " is" : "s are"} assigned to ${s.name}. They will be kept but unassigned from any stage.`
                              : `${s.name} will be removed. No riders are assigned to it.`
                          }
                        />
                      </div>
                    ) : null}
                  </div>
                ),
              )}
            </div>
          </section>
        ))}

      {!stages.length ? (
        <p className="text-[0.85rem]" style={{ color: "var(--text-faint)" }}>
          No stages recorded yet. Stages are how riders are grouped for campaigns and how the dashboard breaks
          down coverage by sub-county.
        </p>
      ) : null}
    </div>
  );
}
