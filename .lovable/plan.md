## Plan — CaseDesk targeted updates

Touches `src/components/CaseDesk.tsx` only. No data, styling-system, or other component changes.

### 1. Risk score by severity (helper)
Add a single helper inside the file:
```ts
const riskColor = (n: number) =>
  n >= 80 ? "text-severity-critical" : n >= 50 ? "text-severity-high" : "text-severity-review";
```

### 2. Case detail — Risk Score block (top)
Insert a new section at the very top of `CaseDetail`'s return, BEFORE `<RulesRow />` and the existing header block stays in place (still showing severity badge, status stamp, account id, exposure). New block:
- Row: `<Mono className="text-5xl font-bold {riskColor(prob)}">RISK {prob}</Mono>` with `<span className="text-xl text-muted-foreground">/100</span>` aligned baseline.
- Sub-line: `<Mono>{ci[0]}–{ci[1]}%</Mono> confidence` in `text-sm text-muted-foreground`.
- Wrapped in a `<section>` flush with the existing detail padding; no card chrome, no border, no extra background — keeps the dossier feel.
- `FraudBar` stays where it is (kept intentionally; only adding the prominent score above).

### 3. Case card — risk on the right
In `CaseCard`, add a right-aligned bold risk number in the top row next to the status stamp, OR place it on its own column. Concretely: change the top row to put `[severity badge + account id]` on the left and a small right cluster containing the `StatusStamp` (existing) plus the risk score below it:
```
<div className="flex flex-col items-end gap-1">
  <StatusStamp ... />
  <Mono className={`text-xl font-bold ${riskColor(c.fraud_prob)}`}>{c.fraud_prob}</Mono>
</div>
```
Also bump readability one step per spec #3 (see below).

### 4. Bigger queue + readability bump
- Grid template: `lg:grid-cols-[36fr_40fr_24fr]` (was 30/45/25).
- `CaseCard`: padding `p-5` → `p-6`; account id `text-xs` → `text-sm`; exposure `text-xl` → `text-2xl`; reason `text-sm` → `text-base`; SLA chip stays as-is (already comfortable) — keep.

### 5. Independent-scroll fix (queue + right rail)
Root layout becomes a fixed-height shell so each rail scrolls on its own:
- Wrap header + main in a `flex h-screen flex-col` container.
- `<header>` shrinks naturally (`shrink-0`).
- `<main>` becomes `flex-1 min-h-0 overflow-hidden`.
- Inner grid: `h-full min-h-0`.
- Left `<section>`: `flex h-full min-h-0 flex-col`; inside it, the breakdown card + queue header stay `shrink-0`; the case-list wrapper becomes `flex-1 min-h-0 overflow-y-auto` (drops the old `max-h-[calc(100vh-180px)]`).
- Center `<section>`: `h-full min-h-0 overflow-hidden`; its inner `CaseDetail` already has `overflow-y-auto h-full`.
- Right `<aside>`: `flex h-full min-h-0 flex-col overflow-y-auto` (drops the `lg:max-h-[…]` hack).

Result: header stays put, all three rails are self-scrolling, and every one of the 10 mock cases is reachable.

### 6. Action buttons — Escalate / Flag for Review / Dismiss
Replace the three (Approve / Dismiss / Escalate) buttons with:
- **Escalate** — primary cobalt-violet pill (`bg-primary text-primary-foreground`)
- **Flag for Review** — outline pill (`border bg-surface`)
- **Dismiss** — ghost pill (no border, muted text, hover bg-accent)

Keep `Download Report` and the "includes full audit log" text exactly as is.

Behavior:
- Add local `caseStatus` state per selected case, seeded from `extras.case_status`. Reset when `c.id` changes (alongside the existing audit reset).
- Mapping: Escalate → `ESCALATED`; Flag for Review → `UNDER REVIEW`; Dismiss → `CLEARED`.
- Stamp shown in detail header reads from this local state instead of `extras.case_status`.
- Audit appends:
  - Escalate: `Analyst escalated ${c.account_id} — recommendation: ${c.recommended_action}`
  - Flag: `Analyst flagged ${c.account_id} for review — ${c.action_reason}`
  - Dismiss: `Analyst dismissed ${c.account_id} — no action taken`
- Highlight matching recommendation: compute `recommendedKey` by keyword in `c.recommended_action.toLowerCase()`:
  - contains "escalat" or "freeze" or "sar" → escalate
  - contains "flag" or "review" or "hold" or "block" or "suspend" or "step-up" or "reverse" → flag
  - else → dismiss
  Apply `ring-2 ring-primary/40` to the matching button.

### Out of scope
Stat breakdown cards, agent pipeline content, money flow timeline, exhibits, audit log structure, Run Analysis button, Download Report, header, design tokens.
