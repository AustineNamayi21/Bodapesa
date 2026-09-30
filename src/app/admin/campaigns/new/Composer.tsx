"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { createCampaignAction } from "@/lib/actions";
import { smsParts } from "@/lib/i18n";
import { Card, SectionTitle } from "@/components/ui";
import type { Segment } from "@/lib/types";

interface Stage {
  id: string;
  name: string;
  subCounty: string;
}
interface ProductOption {
  id: string;
  name: string;
  partnerName: string;
  summaryEn: string;
  summarySw: string;
  summarySh: string;
}
interface LessonOption {
  id: string;
  code: string;
  titleEn: string;
  smsEn: string;
  smsSw: string;
  smsSh: string;
  moduleKey: string;
}

const CHANNELS = [
  { value: "SMS", label: "SMS", note: "Every handset · KSh 0.80 per part" },
  { value: "WHATSAPP", label: "WhatsApp", note: "Smartphones · KSh 0.50" },
  { value: "USSD", label: "USSD inbox", note: "Shown on *384*14791# · free" },
  { value: "APP", label: "In-app", note: "Rider portal inbox · free" },
];

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "Saving…" : "Save as draft"}
    </button>
  );
}

function BodyField({
  name,
  label,
  value,
  onChange,
  hint,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  const { chars, parts, unicode } = smsParts(value);
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <textarea id={name} name={name} className="textarea" value={value} onChange={(e) => onChange(e.target.value)} />
      <div className="flex justify-between gap-2 mt-1">
        <span className="text-[0.68rem] text-[var(--text-faint)]">{hint}</span>
        <span
          className="text-[0.68rem] tabular-nums"
          style={{ color: parts > 2 ? "var(--danger)" : "var(--text-faint)" }}
        >
          {chars} chars · {parts} SMS part{parts === 1 ? "" : "s"}
          {unicode ? " · unicode" : ""}
        </span>
      </div>
    </div>
  );
}

export default function Composer({
  stages,
  subCounties,
  products,
  lessons,
}: {
  stages: Stage[];
  subCounties: string[];
  products: ProductOption[];
  lessons: LessonOption[];
}) {
  const [state, action] = useActionState(createCampaignAction, null as { error?: string } | null);

  const [bodyEn, setBodyEn] = useState("");
  const [bodySw, setBodySw] = useState("");
  const [bodySh, setBodySh] = useState("");
  const [segment, setSegment] = useState<Segment>({ consentOnly: true });
  const [estimate, setEstimate] = useState<{
    total: number;
    real: number;
    synthetic: number;
    byLanguage: Record<string, number>;
    byChannel: Record<string, number>;
    realByChannel: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Live audience estimate — the same query that will select recipients.
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      setLoading(true);
      fetch("/api/segment/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(segment),
      })
        .then((r) => r.json())
        .then((d) => {
          if (!cancelled) setEstimate(d);
        })
        .finally(() => !cancelled && setLoading(false));
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [segment]);

  const readSegmentFromForm = () => {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    const multi = (k: string) => fd.getAll(k).map(String).filter(Boolean);
    const tri = (k: string) => {
      const v = String(fd.get(k) ?? "any");
      return v === "any" ? undefined : v === "yes";
    };
    const lit = String(fd.get("literacyBelow") ?? "");
    setSegment({
      consentOnly: true,
      stageIds: multi("stageIds").length ? multi("stageIds") : undefined,
      subCounties: multi("subCounties").length ? multi("subCounties") : undefined,
      languages: multi("languages").length ? (multi("languages") as Segment["languages"]) : undefined,
      statuses: multi("statuses").length ? (multi("statuses") as Segment["statuses"]) : undefined,
      incomeBands: multi("incomeBands").length ? multi("incomeBands") : undefined,
      saccoMember: tri("saccoMember"),
      hasInsurance: tri("hasInsurance"),
      hasBankAccount: tri("hasBankAccount"),
      literacyBelow: lit ? Number(lit) : undefined,
    });
  };

  const estimatedCost = useMemo(() => {
    if (!estimate) return 0;
    const smsParts1 = smsParts(bodySw || bodyEn).parts;
    // Only real recipients cost anything — synthetic riders are simulated.
    return Object.entries(estimate.realByChannel ?? {}).reduce((acc, [channel, n]) => {
      if (channel === "SMS") return acc + n * smsParts1 * 0.8;
      if (channel === "WHATSAPP") return acc + n * 0.5;
      return acc;
    }, 0);
  }, [estimate, bodySw, bodyEn]);

  const applyLesson = (lessonId: string) => {
    const l = lessons.find((x) => x.id === lessonId);
    if (!l) return;
    setBodyEn(l.smsEn);
    setBodySw(l.smsSw);
    setBodySh(l.smsSh);
  };

  const applyProduct = (productId: string) => {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    setBodyEn(`BodaPesa: ${p.name} from ${p.partnerName}. ${p.summaryEn} Reply YES or dial *384*14791#`);
    setBodySw(`BodaPesa: ${p.name} kutoka ${p.partnerName}. ${p.summarySw} Jibu NDIO au piga *384*14791#`);
    setBodySh(`BodaPesa: ${p.name} kutoka ${p.partnerName}. ${p.summarySh} Reply YES ama dial *384*14791#`);
  };

  return (
    <form ref={formRef} action={action} onChange={readSegmentFromForm} className="grid gap-4 lg:grid-cols-[1fr_320px] items-start">
      <div className="space-y-4 min-w-0">
        {/* ------------------------------------------------------- basics */}
        <Card>
          <SectionTitle title="Campaign details" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="name">Campaign name</label>
              <input id="name" name="name" className="input" placeholder="e.g. Know what your loan costs" required />
            </div>
            <div>
              <label className="label" htmlFor="objective">Objective</label>
              <select id="objective" name="objective" className="select" defaultValue="EDUCATION">
                <option value="EDUCATION">Education — deliver a lesson</option>
                <option value="AWARENESS">Awareness — highlight a risk or right</option>
                <option value="PRODUCT_PUSH">Product — promote a partner product</option>
                <option value="REMINDER">Reminder — nudge an existing action</option>
                <option value="SURVEY">Survey — ask riders a question</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="productId">Linked product (optional)</label>
              <select
                id="productId"
                name="productId"
                className="select"
                defaultValue=""
                onChange={(e) => e.target.value && applyProduct(e.target.value)}
              >
                <option value="">None</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.partnerName} — {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* ------------------------------------------------------ content */}
        <Card>
          <SectionTitle
            title="Message content"
            subtitle="Riders receive the version matching their stated language. Sheng falls back to Kiswahili if left blank."
          />

          <div className="mb-4">
            <label className="label" htmlFor="lessonTemplate">Start from a curriculum lesson</label>
            <select
              id="lessonTemplate"
              className="select"
              defaultValue=""
              onChange={(e) => e.target.value && applyLesson(e.target.value)}
            >
              <option value="">Write from scratch</option>
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.code} · {l.titleEn}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <BodyField
              name="bodySw"
              label="Kiswahili"
              value={bodySw}
              onChange={setBodySw}
              hint="The default for most riders"
            />
            <BodyField name="bodyEn" label="English" value={bodyEn} onChange={setBodyEn} />
            <BodyField
              name="bodySh"
              label="Sheng"
              value={bodySh}
              onChange={setBodySh}
              hint="Higher engagement with riders under 30"
            />
          </div>
        </Card>

        {/* ----------------------------------------------------- channels */}
        <Card>
          <SectionTitle
            title="Channels"
            subtitle="Each rider is sent on their preferred channel when it is selected here, otherwise on the cheapest one available."
          />
          <div className="grid gap-2 sm:grid-cols-2">
            {CHANNELS.map((c) => (
              <label
                key={c.value}
                className="flex items-start gap-2.5 p-3 rounded-lg cursor-pointer"
                style={{ background: "var(--surface-2)" }}
              >
                <input
                  type="checkbox"
                  name="channels"
                  value={c.value}
                  defaultChecked={c.value === "SMS"}
                  className="mt-0.5 accent-[var(--brand)]"
                />
                <span>
                  <span className="text-[0.85rem] font-medium block">{c.label}</span>
                  <span className="text-[0.7rem] text-[var(--text-faint)]">{c.note}</span>
                </span>
              </label>
            ))}
          </div>
        </Card>

        {/* ----------------------------------------------------- audience */}
        <Card>
          <SectionTitle
            title="Audience"
            subtitle="Leave a filter untouched to include everyone. Riders without consent are always excluded."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className="label">Programme status</span>
              <div className="flex flex-wrap gap-1.5">
                {["PROSPECT", "ENROLLED", "ACTIVE", "ONBOARDED", "DORMANT"].map((s) => (
                  <label key={s} className="pill cursor-pointer" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
                    <input type="checkbox" name="statuses" value={s} className="accent-[var(--brand)]" />
                    {s.replace("_", " ")}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <span className="label">Language</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { v: "SW", l: "Kiswahili" },
                  { v: "EN", l: "English" },
                  { v: "SH", l: "Sheng" },
                ].map((x) => (
                  <label key={x.v} className="pill cursor-pointer" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
                    <input type="checkbox" name="languages" value={x.v} className="accent-[var(--brand)]" />
                    {x.l}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <span className="label">Daily take-home (KSh)</span>
              <div className="flex flex-wrap gap-1.5">
                {["<500", "500-1000", "1000-1500", ">1500"].map((b) => (
                  <label key={b} className="pill cursor-pointer" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
                    <input type="checkbox" name="incomeBands" value={b} className="accent-[var(--brand)]" />
                    {b}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="label" htmlFor="literacyBelow">Literacy score below</label>
              <select id="literacyBelow" name="literacyBelow" className="select" defaultValue="">
                <option value="">Any score</option>
                <option value="25">25 — barely started</option>
                <option value="50">50 — halfway</option>
                <option value="75">75 — nearly complete</option>
              </select>
            </div>

            {[
              { name: "saccoMember", label: "SACCO membership" },
              { name: "hasInsurance", label: "Holds insurance" },
              { name: "hasBankAccount", label: "Has a bank account" },
            ].map((f) => (
              <div key={f.name}>
                <label className="label" htmlFor={f.name}>{f.label}</label>
                <select id={f.name} name={f.name} className="select" defaultValue="any">
                  <option value="any">Either</option>
                  <option value="yes">Yes</option>
                  <option value="no">No — target the gap</option>
                </select>
              </div>
            ))}

            <div>
              <label className="label" htmlFor="subCounties">Sub-county</label>
              <select id="subCounties" name="subCounties" className="select" multiple size={4}>
                {subCounties.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="label" htmlFor="stageIds">Specific stages (hold Ctrl / Cmd to pick several)</label>
              <select id="stageIds" name="stageIds" className="select" multiple size={5}>
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.subCounty}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {state?.error ? (
          <p className="text-[0.82rem]" style={{ color: "var(--danger)" }}>{state.error}</p>
        ) : null}
      </div>

      {/* ------------------------------------------------------- sidebar */}
      <div className="lg:sticky lg:top-6 space-y-4">
        <Card>
          <SectionTitle title="Audience preview" />
          <div className="stat-value" style={{ color: "var(--brand)" }}>
            {loading ? "…" : (estimate?.total ?? 0).toLocaleString()}
          </div>
          <p className="text-[0.72rem] text-[var(--text-faint)] mb-3">riders will receive this campaign</p>

          {estimate && estimate.synthetic > 0 ? (
            <div className="text-[0.74rem] p-2.5 rounded-lg mb-3 leading-relaxed" style={{ background: "var(--surface-2)" }}>
              <div className="flex justify-between">
                <span>Real messages</span>
                <strong className="tabular-nums">{estimate.real.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between text-[var(--text-faint)]">
                <span>Simulated (demo riders)</span>
                <span className="tabular-nums">{estimate.synthetic.toLocaleString()}</span>
              </div>
              <p className="text-[0.68rem] text-[var(--text-faint)] mt-1.5">
                Demo riders have generated numbers that may belong to real people, so they are never sent a
                real message.
              </p>
            </div>
          ) : null}

          {estimate && estimate.total > 0 ? (
            <>
              <div className="stat-label mb-1.5">By language</div>
              <div className="space-y-1 mb-3">
                {Object.entries(estimate.byLanguage).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-[0.78rem]">
                    <span className="text-[var(--text-muted)]">
                      {k === "EN" ? "English" : k === "SH" ? "Sheng" : "Kiswahili"}
                    </span>
                    <span className="tabular-nums">{v}</span>
                  </div>
                ))}
              </div>

              <div className="stat-label mb-1.5">By preferred channel</div>
              <div className="space-y-1">
                {Object.entries(estimate.byChannel).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-[0.78rem]">
                    <span className="text-[var(--text-muted)]">{k}</span>
                    <span className="tabular-nums">{v}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t">
                <div className="flex justify-between items-baseline">
                  <span className="stat-label">Estimated cost</span>
                  <span className="text-sm font-semibold tabular-nums">
                    KSh {estimatedCost.toFixed(2)}
                  </span>
                </div>
                <p className="text-[0.68rem] text-[var(--text-faint)] mt-1">
                  Real messages only, based on the Kiswahili body length. USSD and in-app delivery are free.
                </p>
              </div>
            </>
          ) : null}
        </Card>

        <Card>
          <Submit />
          <p className="text-[0.7rem] text-[var(--text-faint)] mt-2">
            Saving creates a draft. You review the rendered message and audience on the next screen before
            anything is dispatched.
          </p>
        </Card>
      </div>
    </form>
  );
}
