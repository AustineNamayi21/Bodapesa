"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createRiderAction } from "@/lib/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "Registering…" : "Register rider"}
    </button>
  );
}

export default function RiderForm({ stages }: { stages: { id: string; name: string; subCounty: string }[] }) {
  const [state, action] = useActionState(createRiderAction, null as { error?: string } | null);

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="firstName">First name</label>
          <input id="firstName" name="firstName" className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="lastName">Last name</label>
          <input id="lastName" name="lastName" className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="msisdn">Phone number</label>
          <input id="msisdn" name="msisdn" className="input" placeholder="0712 345 678" required />
        </div>
        <div>
          <label className="label" htmlFor="nationalId">National ID (optional)</label>
          <input id="nationalId" name="nationalId" className="input" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="stageId">Stage</label>
          <select id="stageId" name="stageId" className="select">
            <option value="">Not assigned</option>
            {stages.map((s) => (
              <option key={s.id} value={s.id}>{s.name} — {s.subCounty}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="gender">Gender</label>
          <select id="gender" name="gender" className="select">
            <option value="">Prefer not to say</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="ageBand">Age band</label>
          <select id="ageBand" name="ageBand" className="select">
            <option value="">Not given</option>
            {["18-24", "25-34", "35-44", "45+"].map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="language">Preferred language</label>
          <select id="language" name="language" className="select" defaultValue="SW">
            <option value="SW">Kiswahili</option>
            <option value="EN">English</option>
            <option value="SH">Sheng</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="channelPref">Preferred channel</label>
          <select id="channelPref" name="channelPref" className="select" defaultValue="SMS">
            <option value="SMS">SMS</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="USSD">USSD</option>
            <option value="APP">In-app</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="dailyIncomeBand">Daily take-home (KSh)</label>
          <select id="dailyIncomeBand" name="dailyIncomeBand" className="select">
            <option value="">Not given</option>
            {["<500", "500-1000", "1000-1500", ">1500"].map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      <fieldset>
        <legend className="label">Financial inclusion baseline</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { name: "ownsMotorbike", label: "Owns the motorbike they ride" },
            { name: "hasBankAccount", label: "Has a bank account" },
            { name: "saccoMember", label: "Already a SACCO member" },
            { name: "hasInsurance", label: "Currently holds any insurance" },
            { name: "usesMobileMoney", label: "Uses mobile money", checked: true },
          ].map((f) => (
            <label key={f.name} className="flex items-center gap-2 text-[0.85rem] p-2 rounded-lg cursor-pointer" style={{ background: "var(--surface-2)" }}>
              <input type="checkbox" name={f.name} defaultChecked={f.checked} className="accent-[var(--brand)]" />
              {f.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex items-start gap-2.5 text-[0.85rem] p-3 rounded-lg cursor-pointer" style={{ background: "var(--brand-soft)" }}>
        <input type="checkbox" name="consent" defaultChecked className="mt-0.5 accent-[var(--brand)]" />
        <span>
          <strong className="font-semibold">Messaging consent given.</strong>
          <span className="block text-[0.78rem] text-[var(--text-muted)] mt-0.5">
            The rider has agreed to receive financial literacy content and product information. No campaign is
            ever dispatched to a rider without this, and they can opt out at any time by replying STOP.
          </span>
        </span>
      </label>

      {state?.error ? (
        <p className="text-[0.82rem]" style={{ color: "var(--danger)" }}>{state.error}</p>
      ) : null}

      <Submit />
    </form>
  );
}
