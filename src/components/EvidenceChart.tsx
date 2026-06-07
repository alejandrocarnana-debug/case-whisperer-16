import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
} from "recharts";
import type { Case } from "@/lib/cases-data";

const MONO_TICK = {
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  fill: "#5B6472",
} as const;

const LABEL =
  "text-[13px] uppercase tracking-[0.06em] font-medium text-muted-foreground";
const CAPTION = "mt-3 text-[13px] italic text-[#5B6472]";

const RED = "#D6452B";
const NAVY = "#1B2B4B";
const GREY = "#5B6472";
const GRID = "#E7E4DD";

const CHART_HEIGHT = 220;

function CardShell({
  pattern,
  caption,
  children,
}: {
  pattern: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-[#E7E4DD] bg-white p-5">
      <p className={LABEL}>Evidence visual — {pattern}</p>
      <div className="mt-3" style={{ height: CHART_HEIGHT }}>
        {children}
      </div>
      <p className={CAPTION}>{caption}</p>
    </section>
  );
}

function MonoTooltip({ value, label }: { value: string; label?: string }) {
  return (
    <div className="rounded-md border border-[#E7E4DD] bg-white px-2 py-1 shadow-card">
      {label && <div className="text-[11px] text-[#5B6472]">{label}</div>}
      <div
        className="text-[13px] text-ink"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {value}
      </div>
    </div>
  );
}

function StructuringChart({
  data,
}: {
  data: Extract<NonNullable<Case["chart_data"]>, { kind: "structuring" }>;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data.bins} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis
          dataKey="range"
          tick={MONO_TICK}
          tickLine={false}
          axisLine={{ stroke: GRID }}
        />
        <YAxis
          tick={MONO_TICK}
          tickLine={false}
          axisLine={{ stroke: GRID }}
          width={28}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(27,43,75,0.04)" }}
          content={({ active, payload }) =>
            active && payload?.[0] ? (
              <MonoTooltip
                label={String(payload[0].payload.range)}
                value={`${payload[0].value} transfers`}
              />
            ) : null
          }
        />
        <ReferenceLine
          x="9500–10000"
          stroke={RED}
          strokeDasharray="4 3"
          label={{
            value: "Alert threshold",
            position: "top",
            fill: RED,
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            style: { textTransform: "uppercase", letterSpacing: "0.06em" },
          }}
        />
        <Bar dataKey="count" isAnimationActive={false} animationDuration={300}>
          {data.bins.map((b, i) => (
            <Cell
              key={i}
              fill={b.flagged ? RED : NAVY}
              fillOpacity={b.flagged ? 1 : 0.25}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function RingChart({
  data,
}: {
  data: Extract<NonNullable<Case["chart_data"]>, { kind: "ring" }>;
}) {
  const size = CHART_HEIGHT;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 28;
  const positions: Record<string, { x: number; y: number }> = {};
  data.nodes.forEach((n) => {
    const rad = (n.angle - 90) * (Math.PI / 180);
    positions[n.id] = { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  });

  return (
    <div className="flex h-full items-center justify-center">
      <svg width={size * 1.6} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <marker
            id="arrowred"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M0,0 L10,5 L0,10 z" fill={RED} />
          </marker>
        </defs>
        {data.edges.map((e, i) => {
          const a = positions[e.from];
          const b = positions[e.to];
          if (!a || !b) return null;
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const nx = -dy;
          const ny = dx;
          const len = Math.hypot(nx, ny) || 1;
          const k = 18;
          const qx = mx + (nx / len) * k;
          const qy = my + (ny / len) * k;
          return (
            <g key={i}>
              <title>{`${e.from} → ${e.to}: $${e.amount.toLocaleString("en-US")}`}</title>
              <path
                d={`M${a.x},${a.y} Q${qx},${qy} ${b.x},${b.y}`}
                stroke={RED}
                strokeWidth={1.5}
                fill="none"
                markerEnd="url(#arrowred)"
              />
            </g>
          );
        })}
        {data.nodes.map((n) => {
          const p = positions[n.id];
          const isSel = n.id === data.selected_id;
          const lrad = (n.angle - 90) * (Math.PI / 180);
          const lx = cx + (r + 16) * Math.cos(lrad);
          const ly = cy + (r + 16) * Math.sin(lrad);
          return (
            <g key={n.id}>
              {isSel && (
                <circle cx={p.x} cy={p.y} r={14} fill="none" stroke={RED} strokeWidth={1.5} />
              )}
              <circle cx={p.x} cy={p.y} r={isSel ? 10 : 7} fill={NAVY} />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontFamily: "var(--font-mono)", fontSize: 10, fill: GREY }}
              >
                {n.id}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function TemporalChart({
  data,
}: {
  data: Extract<NonNullable<Case["chart_data"]>, { kind: "temporal" }>;
}) {
  const baseline = data.baseline.map((d) => ({ x: d.hour, y: 1 }));
  const flagged = data.flagged.map((d) => ({ x: d.hour, y: 1, amount: d.amount }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 24, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis
          type="number"
          dataKey="x"
          domain={[0, 23]}
          ticks={[0, 3, 6, 9, 12, 15, 18, 21, 23]}
          tickFormatter={(v) => `${String(v).padStart(2, "0")}:00`}
          tick={MONO_TICK}
          tickLine={false}
          axisLine={{ stroke: GRID }}
        />
        <YAxis type="number" dataKey="y" domain={[0, 2]} hide />
        <ZAxis range={[60, 60]} />
        <ReferenceLine
          x={0}
          stroke="transparent"
          segment={[{ x: 0, y: 0 }, { x: 5, y: 0 }]}
        />
        <ReferenceLine
          x={2.5}
          stroke="#EEEFF1"
          strokeWidth={120}
          opacity={0.6}
          label={{
            value: "overnight",
            position: "top",
            fill: GREY,
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            style: { textTransform: "uppercase", letterSpacing: "0.06em" },
          }}
        />
        <Tooltip
          cursor={false}
          content={({ active, payload }) =>
            active && payload?.[0] ? (
              <MonoTooltip
                label={`${String(payload[0].payload.x).padStart(2, "0")}:00`}
                value={
                  payload[0].payload.amount
                    ? `$${payload[0].payload.amount.toLocaleString("en-US")}`
                    : "baseline"
                }
              />
            ) : null
          }
        />
        <Scatter data={baseline} fill={GREY} fillOpacity={0.3} isAnimationActive={false} />
        <Scatter
          data={flagged}
          fill={RED}
          shape={(props: { cx?: number; cy?: number }) => (
            <circle cx={props.cx} cy={props.cy} r={6} fill={RED} />
          )}
          isAnimationActive={false}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

function OutlierChart({
  data,
}: {
  data: Extract<NonNullable<Case["chart_data"]>, { kind: "outlier" }>;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 8, right: 24, left: 8, bottom: 24 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis
          type="number"
          dataKey="x"
          name="Avg transaction ($)"
          tick={MONO_TICK}
          tickLine={false}
          axisLine={{ stroke: GRID }}
          label={{
            value: "Avg transaction ($)",
            position: "insideBottom",
            offset: -8,
            fill: GREY,
            fontSize: 11,
            fontFamily: "var(--font-mono)",
          }}
        />
        <YAxis
          type="number"
          dataKey="y"
          name="Transactions / week"
          tick={MONO_TICK}
          tickLine={false}
          axisLine={{ stroke: GRID }}
          width={36}
        />
        <ZAxis range={[40, 40]} />
        <Tooltip
          cursor={false}
          content={({ active, payload }) =>
            active && payload?.[0] ? (
              <MonoTooltip
                label={String(payload[0].payload.id ?? "population")}
                value={`$${payload[0].payload.x.toLocaleString("en-US")} · ${payload[0].payload.y}/wk`}
              />
            ) : null
          }
        />
        <Scatter data={data.population} fill={GREY} fillOpacity={0.2} isAnimationActive={false} />
        <Scatter
          data={[data.flagged]}
          fill={RED}
          shape={(props: { cx?: number; cy?: number; payload?: { id: string } }) => (
            <g>
              <circle cx={props.cx} cy={props.cy} r={7} fill={RED} />
              <text
                x={(props.cx ?? 0) + 10}
                y={(props.cy ?? 0) - 8}
                style={{ fontFamily: "var(--font-mono)", fontSize: 11, fill: NAVY }}
              >
                {props.payload?.id}
              </text>
            </g>
          )}
          isAnimationActive={false}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export function EvidenceChart({ c }: { c: Case }) {
  const data = c.chart_data;
  if (!data || !c.pattern_type) return null;

  switch (data.kind) {
    case "structuring":
      return (
        <CardShell
          pattern="structuring"
          caption="6 transfers clustered just under the $10K reporting threshold."
        >
          <StructuringChart data={data} />
        </CardShell>
      );
    case "ring":
      return (
        <CardShell
          pattern="ring"
          caption="Funds complete a full circuit through 12 coordinated accounts."
        >
          <RingChart data={data} />
        </CardShell>
      );
    case "temporal":
      return (
        <CardShell
          pattern="temporal"
          caption="Account is dormant overnight — except two transfers at 03:00 and 04:00."
        >
          <TemporalChart data={data} />
        </CardShell>
      );
    case "outlier":
      return (
        <CardShell
          pattern="outlier"
          caption="Account behavior sits far outside the normal customer cluster."
        >
          <OutlierChart data={data} />
        </CardShell>
      );
    default:
      return null;
  }
}
