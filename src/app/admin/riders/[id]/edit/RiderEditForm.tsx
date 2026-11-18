"use client";

import { useActionState } from "react";
import { updateRiderAction } from "@/lib/crud";
import { FieldSet, Keep, Result, Select, Submit, Text, Toggle, type CrudState } from "@/components/admin";
import type { RiderWithStage } from "@/lib/types";

const LANGUAGES = [
  { value: "SW", label: "Kiswahili" },
  { value: "EN", label: "English" },
  { value: "SH", label: "Sheng" },
];

const CHANNELS = [
  { value: "SMS", label: "SMS" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "USSD", label: "USSD" },
  { value: "APP", label: "In-app" },
];

const STATUSES = [
  { value: "PROSPECT", label: "Prospect — recorded, not yet active" },
  { value: "ENROLLED", label: "Enrolled — registered and consented" },
  { value: "ACTIVE", label: "Active — learning or engaging" },
  { value: "ONBOARDED", label: "Onboarded — holds a partner product" },
  { value: "DORMANT", label: "Dormant — no activity for a long time" },
  { value: "OPTED_OUT", label: "Opted out — do not contact" },
];

const GENDERS = [
  { value: "M", label: "Male" },
  { value: "F", label: "Female" },
  { value: "OTHER", label: "Other" },
];

const AGE_BANDS = ["18-24", "25-34", "35-44", "45+"].map((a) => ({ value: a, label: a }));
const INCOME_BANDS = [
  { value: "<500", label: "Under KSh 500" },
  { value: "500-1000", label: "KSh 500 – 1,000" },
  { value: "1000-1500", label: "KSh 1,000 – 1,500" },
  { value: ">1500", label: "Over KSh 1,500" },
];

export default function RiderEditForm({
  rider,
  stages,
}: {
  rider: RiderWithStage;
  stages: { id: string; name: string; subCounty: string }[];
}) {
  const [state, action] = useActionState(updateRiderAction, null as CrudState);

  return (
    <Keep state={state}>
      <form action={action} className="space-y-6 max-w-3xl">
        <input type="hidden" name="riderId" value={rider.id} />

        <FieldSet legend="Identity">
          <Text name="firstName" label="First name" defaultValue={rider.firstName} required />
          <Text name="lastName" label="Last name" defaultValue={rider.lastName} required />
          <Text
            name="msisdn"
            label="Phone number"
            defaultValue={rider.msisdn}
            inputMode="tel"
            required
            hint="This is also the rider's sign-in credential. Changing it changes how they log in."
          />
          <Text name="nationalId" label="National ID" defaultValue={rider.nationalId} inputMode="numeric" />
          <Select
            name="gender"
            label="Gender"
            options={GENDERS}
            defaultValue={rider.gender}
            placeholder="Not given"
          />
          <Select
            name="ageBand"
            label="Age band"
            options={AGE_BANDS}
            defaultValue={rider.ageBand}
            placeholder="Not given"
          />
        </FieldSet>

        <FieldSet legend="Programme" cols={3}>
          <Select name="status" label="Status" options={STATUSES} defaultValue={rider.status} />
          <Select name="language" label="Language" options={LANGUAGES} defaultValue={rider.language} />
          <Select
            name="channelPref"
            label="Preferred channel"
            options={CHANNELS}
            defaultValue={rider.channelPref}
          />
          <Select
            name="stageId"
            label="Stage"
            options={stages.map((s) => ({ value: s.id, label: `${s.name} — ${s.subCounty}` }))}
            defaultValue={rider.stageId}
            placeholder="Not assigned"
          />
          <Select
            name="dailyIncomeBand"
            label="Daily take-home"
            options={INCOME_BANDS}
            defaultValue={rider.dailyIncomeBand}
            placeholder="Not given"
          />
        </FieldSet>

        <FieldSet
          legend="Financial inclusion baseline"
          hint="These drive campaign segmentation — a rider marked as already insured is excluded from insurance campaigns."
          cols={2}
        >
          <Toggle
            name="ownsMotorbike"
            label="Owns the motorbike they ride"
            defaultChecked={Boolean(rider.ownsMotorbike)}
          />
          <Toggle
            name="usesMobileMoney"
            label="Uses mobile money"
            defaultChecked={Boolean(rider.usesMobileMoney)}
          />
          <Toggle
            name="hasBankAccount"
            label="Has a bank account"
            defaultChecked={Boolean(rider.hasBankAccount)}
          />
          <Toggle
            name="saccoMember"
            label="Already a SACCO member"
            defaultChecked={Boolean(rider.saccoMember)}
          />
          <Toggle
            name="hasInsurance"
            label="Currently holds insurance"
            defaultChecked={Boolean(rider.hasInsurance)}
          />
        </FieldSet>

        <FieldSet
          legend="Messaging consent"
          hint="No campaign is ever dispatched to a rider without this. Removing it takes them out of every audience immediately."
          cols={1}
        >
          <Toggle
            name="consent"
            label="Rider has consented to receive messages"
            defaultChecked={Boolean(rider.consent)}
          />
        </FieldSet>

        <Result state={state} />

        <div className="flex items-center gap-3 pt-2" style={{ borderTop: "2px solid var(--ink)" }}>
          <div className="pt-4">
            <Submit label="Save changes" />
          </div>
        </div>
      </form>
    </Keep>
  );
}
