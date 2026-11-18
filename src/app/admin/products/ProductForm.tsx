"use client";

import { useActionState } from "react";
import { createProductAction, updateProductAction } from "@/lib/crud";
import {
  Area,
  FieldSet,
  Keep,
  Result,
  Select,
  Submit,
  Text,
  Toggle,
  type CrudState,
} from "@/components/admin";
import type { Product } from "@/lib/types";

const CATEGORIES = [
  { value: "SAVINGS", label: "Savings" },
  { value: "CREDIT", label: "Credit" },
  { value: "INSURANCE", label: "Insurance" },
  { value: "INVESTMENT", label: "Investment" },
  { value: "PENSION", label: "Pension" },
];

// Matches the lucide icons the rider portal knows how to draw.
const ICONS = [
  "wallet",
  "piggy-bank",
  "hand-coins",
  "shield-check",
  "trending-up",
  "landmark",
  "umbrella",
].map((i) => ({ value: i, label: i }));

export default function ProductForm({
  product,
  partners,
}: {
  product?: Product;
  partners: { id: string; name: string; code: string }[];
}) {
  const editing = Boolean(product);
  const [state, action] = useActionState(
    editing ? updateProductAction : createProductAction,
    null as CrudState,
  );

  return (
    <Keep state={state}>
      <form action={action} className="space-y-6 max-w-3xl">
        {product ? <input type="hidden" name="productId" value={product.id} /> : null}

        <FieldSet legend="Identity">
          <Text
            name="code"
            label="Product code"
            defaultValue={product?.code}
            placeholder="STIMA-BODA-SAVE"
            required={!editing}
            hint={
              editing
                ? "The code cannot be changed once riders have enquired against it."
                : "Short, uppercase, unique."
            }
          />
          <Select
            name="partnerId"
            label="Partner"
            options={partners.map((p) => ({ value: p.id, label: `${p.name} (${p.code})` }))}
            defaultValue={product?.partnerId}
            placeholder={editing ? undefined : "Choose a partner"}
          />
          <Text name="name" label="Product name" defaultValue={product?.name} required />
          <Select
            name="category"
            label="Category"
            options={CATEGORIES}
            defaultValue={product?.category ?? "SAVINGS"}
          />
          <Select name="icon" label="Icon" options={ICONS} defaultValue={product?.icon ?? "wallet"} />
        </FieldSet>

        <FieldSet
          legend="Rider-facing summary"
          hint="One or two sentences, plain language. This is what appears on the product card in the portal and in SMS — avoid words a rider would not hear at a SACCO counter."
          cols={1}
        >
          <Area
            name="summaryEn"
            label="Summary — English"
            defaultValue={product?.summaryEn}
            rows={2}
            required
          />
          <Area
            name="summarySw"
            label="Summary — Kiswahili"
            defaultValue={product?.summarySw}
            rows={2}
            required
          />
          <Area
            name="summarySh"
            label="Summary — Sheng"
            defaultValue={product?.summarySh}
            rows={2}
            hint="Leave blank to fall back to the Kiswahili summary."
          />
        </FieldSet>

        <FieldSet
          legend="Full details"
          hint="Shown when a rider opens the product. Eligibility, what to bring, how long it takes."
          cols={1}
        >
          <Area name="detailsEn" label="Details — English" defaultValue={product?.detailsEn} rows={5} />
          <Area
            name="detailsSw"
            label="Details — Kiswahili"
            defaultValue={product?.detailsSw}
            rows={5}
            hint="Leave blank to fall back to the English details."
          />
        </FieldSet>

        <FieldSet legend="Terms" cols={3}>
          <Text
            name="minAmount"
            label="Minimum amount (KSh)"
            defaultValue={product?.minAmount}
            inputMode="numeric"
          />
          <Text
            name="maxAmount"
            label="Maximum amount (KSh)"
            defaultValue={product?.maxAmount}
            inputMode="numeric"
          />
          <Text
            name="interestRate"
            label="Interest rate"
            defaultValue={product?.interestRate}
            placeholder="14% p.a. reducing"
          />
          <Text
            name="premium"
            label="Premium"
            defaultValue={product?.premium}
            placeholder="KSh 500 / month"
          />
          <Text name="termLabel" label="Term" defaultValue={product?.termLabel} placeholder="12–36 months" />
          <Text
            name="eligibility"
            label="Eligibility"
            defaultValue={product?.eligibility}
            placeholder="6 months of savings"
          />
        </FieldSet>

        <FieldSet legend="Visibility" cols={1}>
          <Toggle
            name="requiresMembership"
            label="Requires partner membership first"
            defaultChecked={Boolean(product?.requiresMembership)}
          />
          <Toggle
            name="featured"
            label="Feature on the rider home screen"
            defaultChecked={Boolean(product?.featured)}
          />
          <Toggle
            name="active"
            label="Active — visible to riders"
            defaultChecked={product ? Boolean(product.active) : true}
          />
        </FieldSet>

        <Result state={state} />

        <div className="pt-4" style={{ borderTop: "2px solid var(--ink)" }}>
          <Submit label={editing ? "Save product" : "Create product"} />
        </div>
      </form>
    </Keep>
  );
}
