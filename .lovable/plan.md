## Plan — CaseDesk progressive-disclosure restructure

Single file: `src/components/CaseDesk.tsx`. No data, token, or functionality changes.

### 1. Case detail pane — strict vertical hierarchy (gap-6)

Replace the current pile-up with three zones inside the existing `<CaseDetail>` scroll container:

**a. Identity + Risk (top)**
- Line 1: `<Mono>{c.account_id}</Mono>` (xl bold) + `<StatusStamp status={caseStatus} />` on the same row.
- Line 2 (big): `RISK {prob} /100` (text-5xl bold mono, severity-colored).
- Line 3: `{ci[0]}–{ci[1]}% confidence` (sm, muted).
- Drop the old border-bottom header row (severity badge, exposure, reason) — that info now lives in the queue card and the tabs.

**b. Recommendation card (decision zone)**
- One bordered, lightly tinted card (`rounded-2xl border-primary/20 bg-primary/5 p-5`).
- Top line: `Recommended: {Escalate|Flag for Review|Dismiss} — {c.action_reason}` (label derived from existing `recommendedKey`).
- Three action buttons directly inside the card on the next row: Escalate / Flag for Review / Dismiss. Keep current handlers, status-update behavior, audit append, and the matching-recommendation highlight ring.
- Keep Download Report + "includes full audit log" — move it onto the same row, right-aligned, inside this card.

**c. Tabs (Evidence / Money Flow / Audit Log)**
- Use existing `@/components/ui/tabs` (Radix) — already in `src/components/ui/tabs.tsx`. No new deps.
- `defaultValue="evidence"`, three `TabsTrigger`s.
- **Evidence tab:** the existing `<RulesRow />` (triggered/evaded chips) + Exhibit List (current ordered list) + the existing yellow "Evaded rule:" callout. All borders on the inner exhibit list items REMOVED (per "remove borders inside cards" rule) — keep them as borderless rows with subtle bg or just padding/spacing.
- **Money Flow tab:** existing `<MoneyFlowTimeline />` rendered inside; the inner timeline card keeps its outer border (it IS the card), but no nested borders added.
- **Audit Log tab:** existing audit list, always-expanded inside the tab (drop the collapsible toggle since the tab itself controls visibility).
- `<FraudBar />` is removed from the detail pane — the hero RISK score already conveys this; the bar was redundant clutter. (Confidence range still shows under RISK.)

Spacing: container becomes `flex h-full flex-col gap-6 overflow-y-auto`.

### 2. Queue cards — 3 lines + SLA in corner
Rewrite `CaseCard` body to exactly:
- Top-right corner: small SLA chip (`absolute top-3 right-3`, smaller padding/text). Severity left bar stays.
- Line 1: `<Mono>{account_id}</Mono>` + bold risk score (right-aligned within line, severity-colored).
- Line 2: bold exposure dollar amount + `<SeverityBadge />` right-aligned.
- Line 3: one-line reason, `line-clamp-1` for safety.
- Remove: existing StatusStamp from cards, the "exposure" label word, separate SLA row. Padding stays `p-6`.

### 3. Left rail — collapsible Severity Breakdown
Replace the current expanded `<SeverityBreakdownCard />` with a `<Collapsible>` (existing `@/components/ui/collapsible`) wrapping a single trigger row:
- Trigger row: thin composite bar (8px tall, same three colors) + summary text "23 findings · 4 critical" + chevron.
- Content: the existing breakdown rows (percentages + count labels) revealed on click.
- Default closed. Internal borders dropped; outer rounded-2xl border + shadow-sm stays.

### 4. Right rail — compact Agent Feed
Rewrite `<AgentPipeline />`:
- Local `useState<string | null>(expanded)` seeded to `"Finder"`.
- Each agent card: name + status dot + one-line summary visible always. Click toggles expansion.
- Expanded body shows: rules-count line + `⟲ Recalled from memory:` italic block — same content/markup as today, just gated.
- Chevron indicator (rotated when open). No new card borders inside — outer rounded-2xl border stays as the only card chrome.

### 5. Whitespace + border cleanup
- `CaseDetail` root: `gap-6`.
- Recommendation card: keep its outer border (it IS the card); no inner dividers.
- Tabs content: `pt-4` spacing; no extra borders around panels.
- Exhibit list items: drop `border border-border`, keep `bg-surface rounded-2xl shadow-sm` OR just spacing — pick the latter for less visual weight (`px-3 py-2.5` only).
- Audit log items: borderless rows (current state).
- AgentPipeline expanded content: borderless except for the existing left-border accent on the recall blockquote (that's content emphasis, keep).

### Out of scope (untouched)
Design tokens, breakdown segment data, agent content/strings, money flow timeline internals, action handlers' core behavior, layout shell scroll/sizing, header, stat chips, FindingsBySource card, Run Analysis, Download Report behavior (only its placement moves inside the recommendation card).
