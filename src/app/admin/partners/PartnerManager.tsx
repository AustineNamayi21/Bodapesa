"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { deletePartnerAction, savePartnerAction } from "@/lib/crud";
import {
  DangerButton,
  Field,
  Keep,
  KeptInput,
  KeptSelect,
  KeptTextarea,
  Result,
  Submit,
  type CrudState,
} from "@/components/admin";

export interface PartnerRow {
  id: string;
  code: string;
  name: string;
  kind: string;
  tagline: string | null;
  description: string | null;
  accent: string;
  contactMsisdn: string | null;
  website: string | null;
  products: number;
  leads: number;
  staff: number;
}

const KINDS = ["SACCO", "INSURER", "BANK", "FUND", "NGO"];

function PartnerForm({ partner, onDone }: { partner?: PartnerRow; onDone: () => void }) {
  const [state, action] = useActionState(savePartnerAction, null as CrudState);

  const saved = state?.ok;
  useEffect(() => {
    if (saved) onDone();
  }, [saved, onDone]);

  const k = partner?.id ?? "new";

  return (
    <Keep state={state}>
      <form
        action={action}
        className="p-4 space-y-4"
        style={{ border: "2px solid var(--ink)", background: "var(--surface)" }}
      >
        {partner ? <input type="hidden" name="partnerId" value={partner.id} /> : null}

        <div className="grid gap-3 sm:grid-cols-4">
          <Field id={`code-${k}`} label="Code">
            <KeptInput name="code" defaultValue={partner?.code} required placeholder="STIMA" />
          </Field>
          <Field id={`name-${k}`} label="Name">
            <KeptInput name="name" defaultValue={partner?.name} required placeholder="Stima DT SACCO" />
          </Field>
          <Field id={`kind-${k}`} label="Kind">
            <KeptSelect name="kind" defaultValue={partner?.kind ?? "SACCO"}>
              {KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {kind}
                </option>
              ))}
            </KeptSelect>
          </Field>
          <Field
            id={`accent-${k}`}
            label="Accent colour"
            hint="Used as the partner's marker on product cards."
          >
            <KeptInput
              name="accent"
              type="color"
              style={{ padding: "0.3rem", height: "2.6rem" }}
              defaultValue={partner?.accent ?? "#e65212"}
            />
          </Field>
        </div>

        <Field id={`tagline-${k}`} label="Tagline">
          <KeptInput name="tagline" defaultValue={partner?.tagline ?? ""} />
        </Field>

        <Field id={`desc-${k}`} label="Description">
          <KeptTextarea name="description" rows={3} defaultValue={partner?.description ?? ""} />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field id={`contact-${k}`} label="Contact number">
            <KeptInput
              name="contactMsisdn"
              inputMode="tel"
              defaultValue={partner?.contactMsisdn ?? ""}
              placeholder="0712 345 678"
            />
          </Field>
          <Field id={`web-${k}`} label="Website">
            <KeptInput
              name="website"
              inputMode="url"
              defaultValue={partner?.website ?? ""}
              placeholder="https://"
            />
          </Field>
        </div>

        <Result state={state} />

        <div className="flex items-center gap-2">
          <Submit label={partner ? "Save partner" : "Add partner"} />
          <button type="button" className="btn btn-ghost btn-sm" onClick={onDone}>
            Cancel
          </button>
        </div>
      </form>
    </Keep>
  );
}

export default function PartnerManager({ partners, canEdit }: { partners: PartnerRow[]; canEdit: boolean }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      {canEdit ? (
        adding ? (
          <PartnerForm onDone={() => setAdding(false)} />
        ) : (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>
            <Plus size={14} /> Add a partner
          </button>
        )
      ) : null}

      {partners.map((p) =>
        editingId === p.id ? (
          <PartnerForm key={p.id} partner={p} onDone={() => setEditingId(null)} />
        ) : (
          <article key={p.id} className="card p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span style={{ width: "11px", height: "11px", background: p.accent }} />
                  <h2
                    className="text-[1.05rem]"
                    style={{ fontFamily: "var(--font-heading)", fontWeight: 700 }}
                  >
                    {p.name}
                  </h2>
                  <span
                    className="pill"
                    style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
                  >
                    {p.kind}
                  </span>
                </div>
                {p.tagline ? (
                  <p
                    className="text-[0.82rem] mb-1.5"
                    style={{ color: "var(--text-faint)", fontStyle: "italic" }}
                  >
                    {p.tagline}
                  </p>
                ) : null}
                {p.description ? (
                  <p
                    className="text-[0.84rem] leading-relaxed max-w-prose"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {p.description}
                  </p>
                ) : null}
                <p className="text-[0.74rem] mt-2" style={{ color: "var(--text-faint)" }}>
                  {p.code}
                  {p.contactMsisdn ? ` · ${p.contactMsisdn}` : ""}
                  {p.website ? ` · ${p.website}` : ""}
                </p>
              </div>

              <div className="flex gap-6 shrink-0">
                {[
                  { n: p.products, label: "products" },
                  { n: p.leads, label: "leads" },
                ].map((s) => (
                  <div key={s.label} className="text-right">
                    <div className="stat-value text-[1.15rem]">{s.n}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {canEdit ? (
              <div
                className="mt-3 pt-3 flex flex-wrap items-start gap-2"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingId(p.id)}>
                  Edit
                </button>
                <Link href="/admin/products" className="btn btn-ghost btn-sm">
                  Products
                </Link>
                {p.products === 0 && p.leads === 0 && p.staff === 0 ? (
                  <DangerButton
                    action={deletePartnerAction}
                    hidden={{ partnerId: p.id }}
                    label="Delete"
                    confirmLabel="Delete partner"
                    warning={`${p.name} has no products, leads or staff accounts, so it can be removed cleanly.`}
                  />
                ) : (
                  <span className="text-[0.74rem] self-center" style={{ color: "var(--text-faint)" }}>
                    Cannot be deleted while it has {p.products} product{p.products === 1 ? "" : "s"},{" "}
                    {p.leads} lead
                    {p.leads === 1 ? "" : "s"} and {p.staff} staff account{p.staff === 1 ? "" : "s"}.
                  </span>
                )}
              </div>
            ) : null}
          </article>
        ),
      )}
    </div>
  );
}
