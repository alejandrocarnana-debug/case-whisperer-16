import { useEffect, useMemo, useState } from "react";
import { CASES, HEADER_STATS, AGENT_PIPELINE, type Case, type Severity } from "@/lib/cases-data";
import {
  CASE_EXTRAS,
  AGENT_RULES,
  exhibitLabel,
  type AuditEntry,
  type CaseStatus,
} from "@/lib/cases-extras";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BreakdownSegment {
  label: string;
  count: number;
  color: string;
}

function BreakdownCard({
  title,
  caption,
  segments,
}: {
  title: string;
  caption?: string;
  segments: BreakdownSegment[];
}) {
  const total = segments.reduce((s, x) => s + x.count, 0);
  return (
    <Card className="rounded-2xl border-border bg-surface shadow-sm transition-all duration-200">
      <CardHeader className="space-y-1 p-3 pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
        {caption && (
          <CardDescription className="text-[11px] leading-snug">{caption}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-2.5 p-3 pt-0">
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-secondary">
          {segments.map((s) => (
            <div
              key={s.label}
              className="animate-bar-grow h-full transition-[width] duration-700 ease-out"
              style={{
                width: `${(s.count / total) * 100}%`,
                backgroundColor: s.color,
              }}
              title={`${s.label}: ${s.count}`}
            />
          ))}
        </div>
        <ul className="space-y-1">
          {segments.map((s) => {
            const pct = ((s.count / total) * 100).toFixed(1);
            return (
              <li key={s.label} className="flex items-center gap-2 text-xs">
                <span
                  className="inline-block h-3 w-[3px] rounded-sm"
                  style={{ backgroundColor: s.color }}
                />
                <span className="num font-semibold text-foreground tabular-nums">{pct}%</span>
                <span className="ml-auto text-muted-foreground">
                  <span className="num font-semibold text-foreground">{s.count}</span>
                  <span className="mx-1">·</span>
                  {s.label}
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function SeverityBreakdownCard() {
  return (
    <BreakdownCard
      title="Severity Breakdown"
      segments={[
        { label: "Critical", count: 4, color: "var(--severity-critical)" },
        { label: "High", count: 9, color: "var(--severity-high)" },
        { label: "Review", count: 10, color: "var(--source-slate)" },
      ]}
    />
  );
}

function FindingsBySourceCard() {
  return (
    <BreakdownCard
      title="Findings by Source"
      caption="Detected by Finder across 3 rule sets"
      segments={[
        { label: "Circular flows", count: 6, color: "var(--source-blue)" },
        { label: "Structuring", count: 11, color: "var(--source-teal)" },
        { label: "Duplicate transactions", count: 6, color: "var(--source-slate)" },
      ]}
    />
  );
}


const formatExposure = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n}`;

const formatAmount = (n: number) =>
  `$${n.toLocaleString("en-US")}`;

const severityStyles: Record<Severity, string> = {
  CRITICAL: "bg-severity-critical-bg text-severity-critical",
  HIGH: "bg-severity-high-bg text-severity-high",
  REVIEW: "bg-severity-review-bg text-severity-review",
};

const severityBar: Record<Severity, string> = {
  CRITICAL: "bg-severity-critical",
  HIGH: "bg-severity-high",
  REVIEW: "bg-severity-review",
};

const statusStampColor: Record<CaseStatus, { fg: string; bg: string }> = {
  "UNDER REVIEW": { fg: "var(--stamp-amber)", bg: "var(--stamp-amber-bg)" },
  FROZEN: { fg: "var(--stamp-red)", bg: "var(--stamp-red-bg)" },
  CLEARED: { fg: "var(--stamp-green)", bg: "var(--stamp-green-bg)" },
  ESCALATED: { fg: "var(--stamp-blue)", bg: "var(--stamp-blue-bg)" },
};

const riskColor = (n: number) =>
  n >= 80 ? "text-severity-critical" : n >= 50 ? "text-severity-high" : "text-severity-review";

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

function StatusStamp({ status, size = "md" }: { status: CaseStatus; size?: "sm" | "md" }) {
  const c = statusStampColor[status];
  const dims =
    size === "sm"
      ? "px-2 py-0.5 text-[9.5px] tracking-[0.18em]"
      : "px-2.5 py-1 text-[11px] tracking-[0.2em]";
  return (
    <span
      className={`inline-flex select-none items-center rounded-full border border-dashed font-semibold uppercase transition-all duration-200 ${dims}`}
      style={{
        color: c.fg,
        backgroundColor: c.bg,
        borderColor: c.fg,
        transform: "rotate(-2deg)",
      }}
    >
      {status}
    </span>
  );
}

function SeverityBadge({ s }: { s: Severity }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wider transition-all duration-200 ${severityStyles[s]}`}
    >
      {s}
    </span>
  );
}


function StatChip({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface px-4 py-2.5 shadow-sm transition-all duration-200">
      <Mono className="text-3xl font-bold tracking-tight text-foreground leading-none">{value}</Mono>
      <span className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
    </div>
  );
}

function SlaChip({ hours }: { hours: number }) {
  const urgent = hours < 24;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] transition-all duration-200 ${
        urgent
          ? "border-severity-critical/30 bg-severity-critical-bg text-severity-critical"
          : "border-border bg-secondary text-muted-foreground"
      }`}
    >
      <span>⏱</span>
      <Mono className="font-semibold">{hours}h</Mono>
      <span>to regulatory deadline</span>
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
      className={`relative w-full overflow-hidden rounded-2xl border bg-surface p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-px hover:shadow-md ${
        active
          ? "border-l-2 border-l-primary border-border ring-1 ring-primary/20"
          : "border-border hover:border-foreground/20"
      }`}
    >
      <span className={`absolute left-0 top-0 h-full w-1 ${severityBar[c.severity]} ${active ? "opacity-0" : ""}`} />
      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="flex flex-wrap items-center gap-2">
          <SeverityBadge s={c.severity} />
          <Mono className="text-sm text-muted-foreground">{c.account_id}</Mono>
        </div>
        <div className="flex flex-col items-end gap-1">
          {extras && <StatusStamp status={extras.case_status} size="sm" />}
          <Mono className={`text-xl font-bold leading-none ${riskColor(c.fraud_prob)}`}>
            {c.fraud_prob}
          </Mono>
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-2 pl-2">
        <Mono className="text-2xl font-bold text-foreground">{formatExposure(c.exposure)}</Mono>
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">exposure</span>
      </div>
      <p className="mt-2 pl-2 text-base leading-snug text-foreground/85">{c.reason}</p>
      {extras && (
        <div className="mt-3 pl-2">
          <SlaChip hours={extras.sla_hours} />
        </div>
      )}
    </button>
  );
}



function FraudBar({ prob, ci }: { prob: number; ci: [number, number] }) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-foreground">Fraud likelihood</span>
        <span>
          <Mono className="text-2xl font-semibold text-foreground">{prob}%</Mono>
          <span className="ml-2 text-muted-foreground">
            [<Mono>{ci[0]}–{ci[1]}%</Mono> confidence]
          </span>
        </span>
      </div>
      <div className="relative mt-2 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="absolute top-0 h-full bg-primary/15"
          style={{ left: `${ci[0]}%`, width: `${ci[1] - ci[0]}%` }}
        />
        <div className="absolute top-0 h-full bg-primary" style={{ width: `${prob}%` }} />
      </div>
    </div>
  );
}

function RulesRow({ c }: { c: Case }) {
  const extras = CASE_EXTRAS[c.id];
  if (!extras) return null;
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Rules
      </h3>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Triggered:
          </span>
          {extras.triggered_rules.map((r) => (
            <span
              key={r}
              className="inline-flex items-center rounded-full bg-severity-critical-bg px-2.5 py-0.5 text-xs font-semibold text-severity-critical transition-all duration-200"
            >
              <Mono>{r}</Mono>
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Evaded:
          </span>
          {extras.evaded_rules.map((r) => (
            <span
              key={r.code}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-transparent px-2.5 py-0.5 text-xs text-foreground/80 transition-all duration-200"
            >
              <Mono className="font-semibold">{r.code}</Mono>
              {r.note && <span className="text-muted-foreground">({r.note})</span>}
            </span>
          ))}
        </div>
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
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Money Flow Timeline
      </h3>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-200">
        <div className="relative px-4 pb-12 pt-5">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {nodes.map((n, i) => (
              <div key={i} className="flex shrink-0 items-center gap-1">
                <div className="inline-flex items-center rounded-md border border-border bg-secondary px-2.5 py-1.5">
                  <Mono className="text-xs font-semibold text-foreground">{n.account}</Mono>
                </div>
                {i < nodes.length - 1 && (
                  <div className="flex shrink-0 flex-col items-center px-1 text-center">
                    <Mono className="text-[11px] font-semibold leading-tight text-foreground">
                      {nodes[i + 1].amount != null ? formatAmount(nodes[i + 1].amount!) : ""}
                    </Mono>
                    <span className="text-[10px] leading-tight text-muted-foreground">
                      <Mono>{nodes[i + 1].date ?? ""}</Mono>
                    </span>
                    <span className="-mt-0.5 text-base leading-none text-muted-foreground">→</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Curved return path */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-6 right-6 bottom-3 h-8 rounded-b-[999px] border-x-2 border-b-2 border-severity-critical/50"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-1 flex justify-center">
            <span className="rounded-sm bg-surface px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-severity-critical">
              ↺ Circular Flow Detected
            </span>
          </div>
        </div>
        <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
          <Mono>{nodes.length}</Mono> hops · return-to-origin within{" "}
          <Mono>{Math.max(1, nodes.length - 1) * 24}h</Mono> window
        </div>
      </div>
    </section>
  );
}

function AuditLog({
  entries,
  open,
  onToggle,
}: {
  entries: AuditEntry[];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface shadow-sm transition-all duration-200">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 rounded-full px-3 py-2 text-left transition-all duration-200"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Audit Log
          </span>
          <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
            <Mono>{entries.length}</Mono>
          </span>
        </div>
        <span
          className="text-xs text-muted-foreground transition-transform"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          ▸
        </span>
      </button>
      {open && (
        <ol className="max-h-44 overflow-y-auto border-t border-border px-3 py-2">
          {entries.map((e, i) => (
            <li key={i} className="flex gap-3 py-1 text-xs leading-relaxed">
              <Mono className="shrink-0 text-muted-foreground">{e.time}</Mono>
              <span className="text-foreground/85">{e.text}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}


const nowStamp = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

function CaseDetail({ c }: { c: Case }) {
  const extras = CASE_EXTRAS[c.id];
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [auditOpen, setAuditOpen] = useState(true);
  const [caseStatus, setCaseStatus] = useState<CaseStatus | undefined>(extras?.case_status);

  // Reset audit log + status when switching cases.
  useEffect(() => {
    setAudit([...(extras?.audit_seed ?? [])].reverse());
    setCaseStatus(extras?.case_status);
  }, [c.id, extras]);

  const append = (text: string) =>
    setAudit((prev) => [{ time: nowStamp(), text }, ...prev]);

  const onEscalate = () => {
    setCaseStatus("ESCALATED");
    append(
      `Analyst escalated ${c.account_id} — recommendation: ${c.recommended_action}`,
    );
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
    append(
      `Analyst downloaded full case report for ${c.account_id} (PDF) — audit log included`,
    );

  const recKey = recommendedKey(c.recommended_action);
  const rec = (k: RecKey) =>
    recKey === k ? "ring-2 ring-primary/40" : "";

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto">
      <section className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <Mono className={`text-5xl font-bold leading-none ${riskColor(c.fraud_prob)}`}>
          RISK {c.fraud_prob}
        </Mono>
        <span className="text-xl text-muted-foreground">/100</span>
        <div className="basis-full text-sm text-muted-foreground">
          <Mono>{c.fraud_ci[0]}–{c.fraud_ci[1]}%</Mono> confidence
        </div>
      </section>

      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <SeverityBadge s={c.severity} />
          {caseStatus && <StatusStamp status={caseStatus} />}
          <Mono className="text-xl font-semibold text-foreground">{c.account_id}</Mono>
          <span className="text-sm text-muted-foreground">·</span>
          <span className="text-sm text-foreground/80">{c.reason}</span>
        </div>
        <div className="text-right">
          <Mono className="block text-2xl font-semibold">{formatExposure(c.exposure)}</Mono>
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">exposure</div>
        </div>
      </header>

      <RulesRow c={c} />

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Exhibit List
        </h3>
        <ol className="space-y-2">
          {c.evidence.map((e, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-2xl border border-border bg-surface px-3 py-2.5 text-sm leading-relaxed shadow-sm transition-all duration-200"
            >
              <span className="shrink-0 pt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {exhibitLabel(i)}
              </span>
              <span className="text-foreground/90">{e}</span>
            </li>
          ))}
        </ol>
        <div className="mt-3 rounded-2xl border-l-4 border-rule-border bg-rule-bg px-3 py-2 text-sm">
          <span className="font-semibold text-foreground">Evaded rule:</span>{" "}
          <span className="text-foreground/85">{c.evaded_rule}</span>
        </div>

      </section>

      <MoneyFlowTimeline c={c} />

      <section>
        <FraudBar prob={c.fraud_prob} ci={c.fraud_ci} />
      </section>

      <section>
        <p className="mb-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Recommended:</span>{" "}
          {c.recommended_action} — {c.action_reason}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onEscalate}
            className={`rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md ${rec("escalate")}`}
          >
            Escalate
          </button>
          <button
            onClick={onFlag}
            className={`rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:bg-accent hover:shadow-md ${rec("flag")}`}
          >
            Flag for Review
          </button>
          <button
            onClick={onDismiss}
            className={`rounded-full px-5 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground ${rec("dismiss")}`}
          >
            Dismiss
          </button>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">includes full audit log</span>
            <button
              onClick={onDownload}
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:bg-accent hover:shadow-md"
            >
              Download Report
            </button>
          </div>
        </div>

      </section>

      <AuditLog entries={audit} open={auditOpen} onToggle={() => setAuditOpen((v) => !v)} />
    </div>
  );
}

function AgentPipeline() {
  return (
    <div className="flex h-full flex-col">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Agent Pipeline
      </h3>
      <ol className="space-y-3">
        {AGENT_PIPELINE.map((a, i) => {
          const stats = AGENT_RULES[a.name];
          return (
            <li key={a.name} className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all duration-200">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                <span className="text-sm font-semibold text-foreground">
                  <Mono>{i + 1}.</Mono> {a.name}
                </span>
                <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-[11px] uppercase tracking-wide text-success">
                  done
                </span>
              </div>

              <p className="mt-1.5 text-sm leading-snug text-foreground/85">
                <span className="font-medium">{a.name}:</span> {a.summary}
              </p>
              {stats && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {a.name}: <Mono>{stats.rules_executed}</Mono> detection rules executed ·{" "}
                  <Mono>{stats.findings}</Mono> findings
                </p>
              )}
              <p className="mt-2 border-l-2 border-primary/40 bg-primary/5 px-2 py-1 text-xs italic leading-snug text-primary">
                {a.recall}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

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
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm transition-all duration-200">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2.2">
                <path d="M3 4h18v4H3zM3 12h12v8H3zM18 12h3v8h-3z" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold leading-tight tracking-tight">CaseDesk</h1>
              <p className="text-xs leading-tight text-muted-foreground">
                <Mono>5,000</Mono> real bank transactions analyzed · findings verifiable against event benchmark
              </p>
            </div>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <StatChip value={String(HEADER_STATS.flagged)} label="cases flagged" />
              <StatChip value={HEADER_STATS.exposure} label="exposure" />
              <StatChip value={String(HEADER_STATS.ring_accounts)} label="ring accounts" />
            </div>
            <button className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md">
              Run Analysis
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-6 py-5">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[30fr_45fr_25fr]">
          <section className="flex flex-col rounded-2xl border border-border bg-surface-raised p-3 shadow-sm transition-all duration-200">
            <div className="mb-2 px-1">
              <SeverityBreakdownCard />
            </div>
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Case Queue
              </h2>
              <span className="text-[11px] text-muted-foreground">worst first</span>
            </div>
            <div className="flex max-h-[calc(100vh-180px)] flex-col gap-3 overflow-y-auto pr-1">
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

          <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all duration-200 lg:max-h-[calc(100vh-130px)]">
            <CaseDetail c={selected} />
          </section>

          <aside className="rounded-2xl border border-border bg-surface-raised p-4 shadow-sm transition-all duration-200 lg:max-h-[calc(100vh-130px)] lg:overflow-y-auto">
            <div className="mb-3">
              <FindingsBySourceCard />
            </div>
            <AgentPipeline />
          </aside>



        </div>
      </main>
    </div>
  );
}
