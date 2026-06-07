import { useMemo, useState } from "react";
import { CASES, HEADER_STATS, AGENT_PIPELINE, type Case, type Severity } from "@/lib/cases-data";
import fraudNetwork from "@/assets/fraud-network.jpg";

const formatExposure = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n}`;

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

function SeverityBadge({ s }: { s: Severity }) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold tracking-wider ${severityStyles[s]}`}
    >
      {s}
    </span>
  );
}

function StatChip({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      {label}
    </div>
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
  return (
    <button
      onClick={onClick}
      className={`relative w-full overflow-hidden rounded-lg border bg-surface p-3.5 text-left transition-colors ${
        active
          ? "border-primary ring-1 ring-primary/30 shadow-sm"
          : "border-border hover:border-foreground/20 hover:bg-accent/40"
      }`}
    >
      <span className={`absolute left-0 top-0 h-full w-1 ${severityBar[c.severity]}`} />
      <div className="flex items-center justify-between gap-2 pl-2">
        <SeverityBadge s={c.severity} />
        <span className="font-mono text-xs text-muted-foreground">{c.account_id}</span>
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-2 pl-2">
        <span className="text-lg font-semibold tabular-nums text-foreground">
          {formatExposure(c.exposure)}
        </span>
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
          exposure
        </span>
      </div>
      <p className="mt-1.5 pl-2 text-sm leading-snug text-foreground/85">{c.reason}</p>
    </button>
  );
}

function FraudBar({ prob, ci }: { prob: number; ci: [number, number] }) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-foreground">Fraud likelihood</span>
        <span className="tabular-nums">
          <span className="text-2xl font-semibold text-foreground">{prob}%</span>
          <span className="ml-2 text-muted-foreground">
            [{ci[0]}–{ci[1]}% confidence]
          </span>
        </span>
      </div>
      <div className="relative mt-2 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        {/* confidence interval band */}
        <div
          className="absolute top-0 h-full bg-primary/15"
          style={{ left: `${ci[0]}%`, width: `${ci[1] - ci[0]}%` }}
        />
        {/* point estimate */}
        <div
          className="absolute top-0 h-full bg-primary"
          style={{ width: `${prob}%` }}
        />
      </div>
    </div>
  );
}

function CaseDetail({ c }: { c: Case }) {
  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <SeverityBadge s={c.severity} />
          <h2 className="font-mono text-xl font-semibold text-foreground">{c.account_id}</h2>
          <span className="text-sm text-muted-foreground">·</span>
          <span className="text-sm text-foreground/80">{c.reason}</span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold tabular-nums">{formatExposure(c.exposure)}</div>
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">exposure</div>
        </div>
      </header>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Evidence
        </h3>
        <ol className="space-y-2">
          {c.evidence.map((e, i) => (
            <li key={i} className="flex gap-3 rounded-md border border-border bg-surface px-3 py-2.5 text-sm leading-relaxed">
              <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-foreground/70">
                {i + 1}
              </span>
              <span className="text-foreground/90">{e}</span>
            </li>
          ))}
        </ol>
        <div className="mt-3 rounded-md border-l-4 border-rule-border bg-rule-bg px-3 py-2 text-sm">
          <span className="font-semibold text-foreground">Evaded rule:</span>{" "}
          <span className="text-foreground/85">{c.evaded_rule}</span>
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Fraud Ring Network
        </h3>
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <img
            src={fraudNetwork}
            alt="Network graph of accounts connected in fraud ring"
            loading="lazy"
            width={1024}
            height={512}
            className="h-44 w-full object-cover opacity-90"
          />
          <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
            Visualization placeholder · 5 accounts, 14 edges, cycle detected
          </div>
        </div>
      </section>

      <section>
        <FraudBar prob={c.fraud_prob} ci={c.fraud_ci} />
      </section>

      <section className="mt-auto">
        <p className="mb-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Recommended:</span>{" "}
          {c.recommended_action} — {c.action_reason}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover">
            Approve Action
          </button>
          <button className="rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent">
            Dismiss
          </button>
          <button className="rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent">
            Escalate
          </button>
          <button className="ml-auto rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent">
            Download Report
          </button>
        </div>
      </section>
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
        {AGENT_PIPELINE.map((a, i) => (
          <li
            key={a.name}
            className="rounded-lg border border-border bg-surface p-3"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              <span className="text-sm font-semibold text-foreground">
                {i + 1}. {a.name}
              </span>
              <span className="ml-auto text-[11px] uppercase tracking-wide text-success">
                done
              </span>
            </div>
            <p className="mt-1.5 text-sm leading-snug text-foreground/85">
              <span className="font-medium">{a.name}:</span> {a.summary}
            </p>
            <p className="mt-2 border-l-2 border-primary/40 bg-primary/5 px-2 py-1 text-xs italic leading-snug text-primary">
              {a.recall}
            </p>
          </li>
        ))}
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
    []
  );
  const [selectedId, setSelectedId] = useState(sorted[0].id);
  const selected = sorted.find((c) => c.id === selectedId) ?? sorted[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HEADER */}
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2.2">
                <path d="M3 4h18v4H3zM3 12h12v8H3zM18 12h3v8h-3z" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold leading-tight tracking-tight">CaseDesk</h1>
              <p className="text-xs leading-tight text-muted-foreground">
                5,000 real bank transactions analyzed · findings verifiable against event benchmark
              </p>
            </div>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <StatChip label={`${HEADER_STATS.flagged} cases flagged`} />
              <StatChip label={`${HEADER_STATS.exposure} exposure`} />
              <StatChip label={`${HEADER_STATS.ring_accounts} ring accounts`} />
            </div>
            <button className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover">
              Run Analysis
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-[1600px] px-6 py-5">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[30fr_45fr_25fr]">
          {/* LEFT: queue */}
          <section className="flex flex-col rounded-xl border border-border bg-surface-raised p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Case Queue
              </h2>
              <span className="text-[11px] text-muted-foreground">worst first</span>
            </div>
            <div className="flex max-h-[calc(100vh-180px)] flex-col gap-2 overflow-y-auto pr-1">
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

          {/* CENTER: detail */}
          <section className="rounded-xl border border-border bg-surface p-5 lg:max-h-[calc(100vh-130px)]">
            <CaseDetail c={selected} />
          </section>

          {/* RIGHT: agent pipeline */}
          <aside className="rounded-xl border border-border bg-surface-raised p-4 lg:max-h-[calc(100vh-130px)] lg:overflow-y-auto">
            <AgentPipeline />
          </aside>
        </div>
      </main>
    </div>
  );
}
