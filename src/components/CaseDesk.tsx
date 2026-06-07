import { useEffect, useMemo, useState } from "react";
import filumLogo from "@/assets/filum-logo.png.asset.json";
import { CASES, HEADER_STATS, AGENT_PIPELINE, type Case, type Severity } from "@/lib/cases-data";
import {
  CASE_EXTRAS,
  AGENT_RULES,
  exhibitLabel,
  type AuditEntry,
  type CaseStatus,
} from "@/lib/cases-extras";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { EvidenceChart } from "@/components/EvidenceChart";


interface BreakdownSegment {
  label: string;
  count: number;
  color: string;
}

const SEVERITY_SEGMENTS: BreakdownSegment[] = [
  { label: "Critical", count: 4, color: "var(--severity-critical)" },
  { label: "High", count: 9, color: "var(--severity-high)" },
  { label: "Review", count: 10, color: "var(--severity-review)" },
];

const SOURCE_SEGMENTS: BreakdownSegment[] = [
  { label: "Circular flows", count: 6, color: "#1B2B4B" },
  { label: "Structuring", count: 11, color: "#5B6472" },
  { label: "Duplicate transactions", count: 6, color: "#B07D2B" },
];

const LABEL = "text-[11px] uppercase tracking-[0.06em] font-medium text-muted-foreground";

function SeverityBreakdownCollapsed() {
  const total = SEVERITY_SEGMENTS.reduce((s, x) => s + x.count, 0);
  const critical = SEVERITY_SEGMENTS[0].count;
  return (
    <Collapsible className="rounded-md border border-border bg-surface shadow-card">
      <CollapsibleTrigger className="group flex w-full items-center gap-3 p-4 text-left">
        <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-border">
          {SEVERITY_SEGMENTS.map((s) => (
            <div
              key={s.label}
              style={{ width: `${(s.count / total) * 100}%`, backgroundColor: s.color }}
              className="h-full"
            />
          ))}
        </div>
        <span className="shrink-0 text-[13px] text-muted-foreground">
          <Mono className="text-ink">{total}</Mono> findings ·{" "}
          <Mono className="text-ink">{critical}</Mono> critical
        </span>
        <span className="shrink-0 text-[11px] text-muted-foreground transition-transform group-data-[state=open]:rotate-90">
          ▸
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t border-border px-4 py-3">
        <ul className="space-y-1.5">
          {SEVERITY_SEGMENTS.map((s) => {
            const pct = ((s.count / total) * 100).toFixed(1);
            return (
              <li key={s.label} className="flex items-center gap-2 text-[13px]">
                <span className="inline-block h-2.5 w-[3px]" style={{ backgroundColor: s.color }} />
                <Mono className="text-ink">{pct}%</Mono>
                <span className="ml-auto text-muted-foreground">
                  <Mono className="text-ink">{s.count}</Mono>
                  <span className="mx-1">·</span>
                  {s.label}
                </span>
              </li>
            );
          })}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}


function FindingsBySourceCard() {
  const total = SOURCE_SEGMENTS.reduce((s, x) => s + x.count, 0);
  return (
    <div className="rounded-md border border-border bg-surface p-5 shadow-card">
      <p className={LABEL}>Findings by source</p>
      <p className="mt-1 text-[13px] text-muted-foreground">
        Detected by Finder across 3 rule sets
      </p>
      <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-full bg-border">
        {SOURCE_SEGMENTS.map((s) => (
          <div
            key={s.label}
            style={{ width: `${(s.count / total) * 100}%`, backgroundColor: s.color }}
            className="h-full"
          />
        ))}
      </div>
      <ul className="mt-3 space-y-1.5">
        {SOURCE_SEGMENTS.map((s) => {
          const pct = ((s.count / total) * 100).toFixed(1);
          return (
            <li key={s.label} className="flex items-center gap-2 text-[13px]">
              <span className="inline-block h-2.5 w-[3px]" style={{ backgroundColor: s.color }} />
              <Mono className="text-ink">{pct}%</Mono>
              <span className="ml-auto text-muted-foreground">
                <Mono className="text-ink">{s.count}</Mono>
                <span className="mx-1">·</span>
                {s.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}


const formatExposure = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n}`;

const formatAmount = (n: number) => `$${n.toLocaleString("en-US")}`;

const severityStyles: Record<Severity, string> = {
  CRITICAL: "bg-[#FBEAE5] text-[#D6452B]",
  HIGH: "bg-[#F8F0DF] text-[#B07D2B]",
  REVIEW: "bg-[#EEEFF1] text-[#5B6472]",
};

const statusStampColor: Record<CaseStatus, { fg: string; bg: string }> = {
  "UNDER REVIEW": { fg: "var(--stamp-amber)", bg: "var(--stamp-amber-bg)" },
  FROZEN: { fg: "var(--stamp-red)", bg: "var(--stamp-red-bg)" },
  CLEARED: { fg: "var(--stamp-green)", bg: "var(--stamp-green-bg)" },
  ESCALATED: { fg: "var(--stamp-blue)", bg: "var(--stamp-blue-bg)" },
};

const riskColor = (n: number) =>
  n >= 80 ? "text-[#D6452B]" : n >= 50 ? "text-[#B07D2B]" : "text-[#5B6472]";

type RecKey = "escalate" | "flag" | "dismiss";
const recommendedKey = (rec: string): RecKey => {
  const r = rec.toLowerCase();
  if (/(escalat|freeze|sar)/.test(r)) return "escalate";
  if (/(flag|review|hold|block|suspend|step-up|reverse)/.test(r)) return "flag";
  return "dismiss";
};


function Mono({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`num ${className}`}>{children}</span>;
}

function StatusStamp({ status }: { status: CaseStatus }) {
  const c = statusStampColor[status];
  return (
    <span
      className="inline-flex select-none items-center rounded-sm border border-dashed px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.08em]"
      style={{ color: c.fg, backgroundColor: c.bg, borderColor: c.fg }}
    >
      {status}
    </span>
  );
}

function SeverityBadge({ s }: { s: Severity }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.04em] ${severityStyles[s]}`}
    >
      {s}
    </span>
  );
}


function HeaderStatChip({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col rounded-md border border-border bg-surface px-4 py-2.5 shadow-card">
      <Mono className="text-[20px] font-semibold leading-none text-ink">{value}</Mono>
      <span className={`mt-1.5 ${LABEL}`}>{label}</span>
    </div>
  );
}


function SlaChip({ hours }: { hours: number }) {
  const urgent = hours < 24;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.04em] ${
        urgent
          ? "bg-[#F8F0DF] text-[#B07D2B]"
          : "bg-[#EEEFF1] text-[#5B6472]"
      }`}
    >
      <Mono>{hours}h</Mono>
      <span className="normal-case tracking-normal">SLA</span>
    </span>
  );
}


function CaseCard({
  c,
  active,
  onClick,
}: {
  c: Case;
  active: boolean;
  onClick: () => void;
}) {
  const extras = CASE_EXTRAS[c.id];
  return (
    <button
      onClick={onClick}
      className={`relative w-full overflow-hidden rounded-md border bg-surface p-5 text-left shadow-card transition-colors ${
        active
          ? "border-border border-l-2 border-l-primary bg-[#F4F6F9]"
          : "border-border hover:bg-[#FAFAF8]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <SeverityBadge s={c.severity} />
        <Mono className="text-[13px] text-muted-foreground">{c.account_id}</Mono>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <Mono className="text-base font-semibold text-ink">{formatExposure(c.exposure)}</Mono>
        {extras && <SlaChip hours={extras.sla_hours} />}
      </div>
      <p className="mt-2 line-clamp-1 text-[13px] text-muted-foreground">{c.reason}</p>
    </button>
  );
}


function FraudBar({ prob, ci }: { prob: number; ci: [number, number] }) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-[13px]">
        <span className={LABEL}>Fraud likelihood</span>
        <span>
          <Mono className="text-ink">{prob}%</Mono>
          <span className="ml-2 text-muted-foreground">
            [<Mono>{ci[0]}–{ci[1]}%</Mono>]
          </span>
        </span>
      </div>
      <div className="relative mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div className="absolute top-0 h-full bg-primary rounded-full" style={{ width: `${prob}%` }} />
      </div>
    </div>
  );
}

function RulesRow({ c }: { c: Case }) {
  const extras = CASE_EXTRAS[c.id];
  if (!extras) return null;
  return (
    <section className="space-y-3">
      <p className={LABEL}>Rules</p>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`${LABEL}`}>Triggered</span>
        {extras.triggered_rules.map((r) => (
          <span
            key={r}
            className="inline-flex items-center rounded-full bg-[#EEEFF1] px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.04em] text-[#5B6472]"
          >
            <Mono>{r}</Mono>
          </span>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`${LABEL}`}>Evaded</span>
        {extras.evaded_rules.map((r) => (
          <span
            key={r.code}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] text-ink"
          >
            <Mono className="font-medium">{r.code}</Mono>
            {r.note && <span className="text-muted-foreground normal-case">({r.note})</span>}
          </span>
        ))}
      </div>
    </section>
  );
}


function MoneyFlowTimeline({ c }: { c: Case }) {
  const extras = CASE_EXTRAS[c.id];
  if (!extras) return null;
  const nodes = extras.flow;
  return (
    <section>
      <p className={`${LABEL} mb-3`}>Money flow timeline</p>
      <div className="overflow-hidden rounded-md border border-border bg-surface shadow-card">
        <div className="relative px-4 pb-12 pt-5">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {nodes.map((n, i) => (
              <div key={i} className="flex shrink-0 items-center gap-1">
                <div className="inline-flex items-center rounded-md border border-border bg-[#FAFAF8] px-2.5 py-1.5">
                  <Mono className="text-[13px] text-ink">{n.account}</Mono>
                </div>
                {i < nodes.length - 1 && (
                  <div className="flex shrink-0 flex-col items-center px-1 text-center">
                    <Mono className="text-[11px] leading-tight text-ink">
                      {nodes[i + 1].amount != null ? formatAmount(nodes[i + 1].amount!) : ""}
                    </Mono>
                    <span className="text-[11px] leading-tight text-muted-foreground">
                      <Mono>{nodes[i + 1].date ?? ""}</Mono>
                    </span>
                    <span className="-mt-0.5 text-base leading-none text-muted-foreground">→</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute left-6 right-6 bottom-3 h-8 rounded-b-[999px] border-x border-b border-[#D6452B]"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-1 flex justify-center">
            <span className="bg-surface px-2 text-[11px] font-medium uppercase tracking-[0.06em] text-[#D6452B]">
              ↺ Circular flow detected
            </span>
          </div>
        </div>
        <div className="border-t border-border px-4 py-2 text-[13px] text-muted-foreground">
          <Mono className="text-ink">{nodes.length}</Mono> hops · return-to-origin within{" "}
          <Mono className="text-ink">{Math.max(1, nodes.length - 1) * 24}h</Mono> window
        </div>
      </div>
    </section>
  );
}

function AuditLogList({ entries }: { entries: AuditEntry[] }) {
  return (
    <ol className="max-h-[60vh] divide-y divide-border overflow-y-auto">
      {entries.map((e, i) => (
        <li key={i} className="flex gap-3 py-2 text-[13px] leading-relaxed">
          <Mono className="shrink-0 text-muted-foreground">{e.time}</Mono>
          <span className="text-ink">{e.text}</span>
        </li>
      ))}
    </ol>
  );
}


const nowStamp = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const recLabel: Record<RecKey, string> = {
  escalate: "Escalate",
  flag: "Flag for review",
  dismiss: "Dismiss",
};

function CaseDetail({ c }: { c: Case }) {
  const extras = CASE_EXTRAS[c.id];
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [caseStatus, setCaseStatus] = useState<CaseStatus | undefined>(extras?.case_status);

  useEffect(() => {
    setAudit([...(extras?.audit_seed ?? [])].reverse());
    setCaseStatus(extras?.case_status);
  }, [c.id, extras]);

  const append = (text: string) =>
    setAudit((prev) => [{ time: nowStamp(), text }, ...prev]);

  const onEscalate = () => {
    setCaseStatus("ESCALATED");
    append(`Analyst escalated ${c.account_id} — recommendation: ${c.recommended_action}`);
  };
  const onFlag = () => {
    setCaseStatus("UNDER REVIEW");
    append(`Analyst flagged ${c.account_id} for review — ${c.action_reason}`);
  };
  const onDismiss = () => {
    setCaseStatus("CLEARED");
    append(`Analyst dismissed ${c.account_id} — no action taken`);
  };
  const onDownload = () =>
    append(`Analyst downloaded full case report for ${c.account_id} (PDF) — audit log included`);

  const recKey = recommendedKey(c.recommended_action);
  const recRing = (k: RecKey) => (recKey === k ? "ring-1 ring-primary/40" : "");

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto">
      {/* 1. Identity + Risk */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Mono className="text-base text-ink">{c.account_id}</Mono>
          {caseStatus && <StatusStamp status={caseStatus} />}
        </div>
        <div className="flex flex-wrap items-baseline gap-x-3">
          <Mono className={`text-5xl font-medium leading-none tracking-tight ${riskColor(c.fraud_prob)}`}>
            RISK {c.fraud_prob}
          </Mono>
          <span className="text-base text-muted-foreground">/100</span>
        </div>
        <div className="text-[13px] text-muted-foreground">
          <Mono className="text-ink">{c.fraud_ci[0]}–{c.fraud_ci[1]}%</Mono> confidence
        </div>
        <FraudBar prob={c.fraud_prob} ci={c.fraud_ci} />
      </section>

      {/* 2. Recommendation card */}
      <section className="rounded-md border border-border bg-surface p-5 shadow-card">
        <p className={LABEL}>Recommended next step</p>
        <p className="mt-2 text-[15px]">
          <span className="font-semibold text-ink">{recLabel[recKey]}</span>
          <span className="text-muted-foreground"> — {c.action_reason}</span>
        </p>
        <div className="relative my-4 h-px w-full" style={{ backgroundColor: "rgba(214,69,43,0.4)" }} aria-hidden>
          <span className="absolute right-0 -top-[2.5px] block h-1.5 w-1.5 rounded-full bg-[#1B2B4B]" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onEscalate}
            className={`rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover ${recRing("escalate")}`}
          >
            Escalate
          </button>
          <button
            onClick={onFlag}
            className={`rounded-md border border-border bg-surface px-4 py-2 text-[13px] font-semibold text-ink transition-colors hover:bg-secondary ${recRing("flag")}`}
          >
            Flag for review
          </button>
          <button
            onClick={onDismiss}
            className={`rounded-md border border-border bg-surface px-4 py-2 text-[13px] font-semibold text-ink transition-colors hover:bg-secondary ${recRing("dismiss")}`}
          >
            Dismiss
          </button>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[13px] text-muted-foreground">Report ready</span>
            <button
              onClick={onDownload}
              className="rounded-md border border-border bg-surface px-4 py-2 text-[13px] font-semibold text-ink transition-colors hover:bg-secondary"
            >
              Download report
            </button>
          </div>
        </div>
      </section>

      {/* 3. Tabs */}
      <Tabs defaultValue="evidence" className="w-full">
        <TabsList className="rounded-md bg-secondary p-0.5">
          <TabsTrigger
            value="evidence"
            className="rounded-sm px-3 py-1 text-[13px] data-[state=active]:bg-white data-[state=active]:text-ink data-[state=active]:shadow-card"
          >
            Evidence
          </TabsTrigger>
          <TabsTrigger
            value="flow"
            className="rounded-sm px-3 py-1 text-[13px] data-[state=active]:bg-white data-[state=active]:text-ink data-[state=active]:shadow-card"
          >
            Money flow
          </TabsTrigger>
          <TabsTrigger
            value="audit"
            className="rounded-sm px-3 py-1 text-[13px] data-[state=active]:bg-white data-[state=active]:text-ink data-[state=active]:shadow-card"
          >
            Audit log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="evidence" className="flex flex-col gap-5 pt-4">
          <RulesRow c={c} />
          <section>
            <p className={`${LABEL} mb-2`}>Exhibit list</p>
            <ol className="divide-y divide-border">
              {c.evidence.map((e, i) => (
                <li key={i} className="flex gap-3 py-3 text-[15px] leading-relaxed">
                  <span className="shrink-0 pt-0.5 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                    {exhibitLabel(i)}
                  </span>
                  <span className="text-ink">{e}</span>
                </li>
              ))}
            </ol>
            <div className="mt-3 rounded-r-md border-l-[3px] border-[#B07D2B] bg-[#FCF8EF] px-3 py-2 text-[15px]">
              <span className="font-semibold text-ink">Evaded rule:</span>{" "}
              <span className="text-ink">{c.evaded_rule}</span>
            </div>
          </section>
          <EvidenceChart c={c} />
        </TabsContent>

        <TabsContent value="flow" className="pt-4">
          <MoneyFlowTimeline c={c} />
        </TabsContent>

        <TabsContent value="audit" className="pt-4">
          <AuditLogList entries={audit} />
        </TabsContent>
      </Tabs>
    </div>
  );
}


function AgentPipeline() {
  const [expanded, setExpanded] = useState<string | null>("Finder");
  return (
    <div className="flex h-full flex-col">
      <p className={`${LABEL} mb-3`}>Agent pipeline</p>
      <ol className="space-y-2">
        {AGENT_PIPELINE.map((a, i) => {
          const stats = AGENT_RULES[a.name];
          const isOpen = expanded === a.name;
          return (
            <li key={a.name} className="rounded-md border border-border bg-surface shadow-card">
              <button
                onClick={() => setExpanded(isOpen ? null : a.name)}
                className="flex w-full items-center gap-2.5 px-5 pt-4 text-left"
              >
                <span className="inline-block h-2 w-2 rounded-full bg-[#2F7D5B]" />
                <Mono className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </Mono>
                <span className="text-[11px] uppercase tracking-[0.06em] font-medium text-ink">
                  {a.name}
                </span>
                <span
                  className="ml-auto text-[11px] text-muted-foreground transition-transform"
                  style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                >
                  ▸
                </span>
              </button>
              <p className="px-5 pb-4 pt-2 text-[15px] leading-snug text-ink">{a.summary}</p>
              {isOpen && (
                <div className="border-t border-border px-5 py-3 space-y-2">
                  {stats && (
                    <p className="text-[13px] text-muted-foreground">
                      <Mono className="text-ink">{stats.rules_executed}</Mono> detection rules
                      executed · <Mono className="text-ink">{stats.findings}</Mono> findings
                    </p>
                  )}
                  <p className="rounded-md bg-[#F7F7F5] px-3 py-2 text-[13px] italic leading-snug text-muted-foreground">
                    ⟲ Recalled from memory: {a.recall}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}


// Logo image lives at filumLogo.url (CDN). No SVG fallback component needed —
// brand asset is a single PNG lockup.


export function CaseDesk() {
  const sorted = useMemo(
    () =>
      [...CASES].sort((a, b) => {
        const rank = { CRITICAL: 0, HIGH: 1, REVIEW: 2 } as const;
        return rank[a.severity] - rank[b.severity] || b.exposure - a.exposure;
      }),
    [],
  );
  const [selectedId, setSelectedId] = useState(sorted[0].id);
  const selected = sorted.find((c) => c.id === selectedId) ?? sorted[0];

  return (
    <div className="flex h-screen flex-col bg-background text-ink">
      <header className="shrink-0 border-b border-border bg-surface">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-6 py-5">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-4">
              <img
                src={filumLogo.url}
                alt="Filum"
                className="h-9 w-auto"
                onError={(e) => {
                  const img = e.currentTarget;
                  img.style.display = "none";
                  const fb = img.nextElementSibling as HTMLElement | null;
                  if (fb) fb.style.display = "inline-block";
                }}
              />
              <span
                style={{ display: "none" }}
                className="text-[22px] font-bold leading-none text-[#1B2B4B] tracking-[-0.02em] border-b-2 border-[#D6452B] pb-0.5"
              >
                Filum
              </span>
              <span className="text-[13px] text-muted-foreground">Pull the thread.</span>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              <HeaderStatChip value={String(HEADER_STATS.flagged)} label="cases flagged" />
              <HeaderStatChip value={HEADER_STATS.exposure} label="exposure" />
              <HeaderStatChip value={String(HEADER_STATS.ring_accounts)} label="ring accounts" />
              <button className="ml-2 rounded-md bg-primary px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover">
                Run analysis
              </button>
            </div>
          </div>
          <p className="text-[13px] text-muted-foreground">
            <Mono className="text-ink">5,000</Mono> real bank transactions ·{" "}
            one hidden fraud ring · findings verifiable against the event's answer key
          </p>
        </div>
      </header>


      <main className="mx-auto w-full max-w-[1600px] flex-1 min-h-0 overflow-hidden px-6 py-5">
        <div className="grid h-full min-h-0 grid-cols-1 gap-5 lg:grid-cols-[36fr_40fr_24fr]">
          <section className="flex h-full min-h-0 flex-col rounded-md border border-border bg-surface p-5 shadow-card">
            <div className="mb-3 shrink-0">
              <SeverityBreakdownCollapsed />
            </div>

            <div className="mb-3 flex shrink-0 items-center justify-between">
              <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-ink">Case queue</h2>
              <span className={LABEL}>worst first</span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
              {sorted.map((c) => (
                <CaseCard
                  key={c.id}
                  c={c}
                  active={c.id === selectedId}
                  onClick={() => setSelectedId(c.id)}
                />
              ))}
            </div>
          </section>

          <section className="h-full min-h-0 overflow-hidden rounded-md border border-border bg-surface p-5 shadow-card">
            <CaseDetail c={selected} />
          </section>

          <aside className="flex h-full min-h-0 flex-col overflow-y-auto rounded-md border border-border bg-surface p-5 shadow-card">
            <div className="mb-4 shrink-0">
              <FindingsBySourceCard />
            </div>
            <AgentPipeline />
          </aside>
        </div>
      </main>
    </div>
  );
}
