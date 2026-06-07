## Scope

Refinements only. Layout, three-zone structure, existing components, action buttons, Run Analysis, and Agent Pipeline recall lines stay as-is.

## 1. Data model additions (`src/lib/cases-data.ts`)

Extend the `Case` shape (and existing 10 records) with:
- `sla_hours: number` — mocked per case (mix of values; ~3 cases under 24h so the red state is visible)
- `case_status: "UNDER REVIEW" | "FROZEN" | "CLEARED" | "ESCALATED"` — seeded per case
- `triggered_rules: string[]` — e.g. `["VELOCITY-04", "DUP-TXN-11"]`
- `evaded_rules: { code: string; note: string }[]` — e.g. `{ code: "THRESHOLD-10K", note: "amounts kept at $9,400–$9,800" }`
- `flow: { account: string; amount?: number; date?: string }[]` — 4–5 nodes for the timeline; last node repeats the first account to express the circle
- `audit_seed: { time: string; text: string }[]` — two prior mocked entries per case

Extend `AGENT_PIPELINE` entries with `rules_executed: number` and `findings: number` for the new rule-count line.

## 2. Dossier character (`src/components/CaseDesk.tsx` + `src/styles.css`)

- Add a `.num` utility class (or a `<Mono>` span) using `font-mono` + `tabular-nums` and apply it to every number, account ID, timestamp, dollar amount, percentage, and CI range already on screen. No new numbers added.
- New `StatusStamp` component: uppercase, letter-spaced, 1px dashed border, slightly off-white fill, rotated `-2deg`, color-keyed per status. Add four semantic tokens in `styles.css`:
  - `--stamp-amber`, `--stamp-red`, `--stamp-green`, `--stamp-blue` (foreground + matching translucent bg/border).
- Render the stamp in the case detail header next to the severity badge, and a smaller variant on each queue card (top-right corner area).

## 3. Queue card SLA chip

Small chip under the reason line: `⏱ {h}h to regulatory deadline`. Default styling = muted; when `sla_hours < 24` swap to red tokens (reuse `severity-critical` foreground on a soft red bg). Mono digits.

## 4. Case detail — Rules row

New block placed **above** the Evidence section:
- Label "Rules" (same uppercase muted heading style as Evidence).
- Two chip groups on one row, wrapping on narrow widths:
  - "Triggered:" followed by filled red chips (`severity-critical-bg` / `severity-critical` text) for each `triggered_rules` code.
  - "Evaded:" followed by outlined gray chips (border + transparent bg) showing `{code}` with the parenthetical note appended in muted text.

## 5. Money Flow Timeline (replaces the image block)

Pure CSS/divs, no chart lib. Layout:
- A horizontal row of 4–5 node pills (account IDs in mono) connected by `→` arrows.
- Between arrows, a small two-line label: amount on top (mono), date below (muted mono).
- Below the row, a curved return path built with a single absolutely-positioned div using `border` + `border-radius` to form a U-shape from the last node back to the first, with a centered label "CIRCULAR FLOW DETECTED" (uppercase, letter-spaced, severity-critical color).
- Container keeps the existing bordered card framing and caption slot so the surrounding rhythm doesn't shift. The `fraud-network.jpg` import is removed.

```text
[ACC-4471] →$9,600·Jun 2→ [ACC-2210] →$9,400·Jun 3→ [ACC-8830] →$9,750·Jun 4→ [ACC-4471]
     ╰──────────────────── CIRCULAR FLOW DETECTED ────────────────────╯
```

## 6. Audit Log panel

New collapsible section at the bottom of the case detail (after the action button row).
- `useState` per selected case holds the entry list, seeded from `audit_seed` whenever the selected case changes (reset on switch).
- Each action button (`Approve Action`, `Dismiss`, `Escalate`) appends an entry: `HH:MM:SS — Analyst {verb} {ACTION} on {account_id} — reason: {action_reason}`.
- `Download Report` appends an entry noting the report was generated and **explicitly states the audit log is included** (both in the appended entry text and as small helper copy beside the button: "includes full audit log").
- Panel header: "Audit Log" + count, with a chevron toggle (`useState` open/closed, default open).
- Entries render in a monospace list, newest on top.

## 7. Agent feed rule count

Under each agent's existing summary line and **before** the recall line, add a small muted row: `{Name}: {rules_executed} detection rules executed · {findings} findings`. Recall lines stay byte-identical.

## 8. Out of scope (not touched)

- Three-zone grid, column widths, queue ordering logic.
- Action button set, labels, primary/secondary treatment.
- `Run Analysis` button behavior.
- Agent recall lines, status dots, pipeline ordering.
- Header stat chips, app title block, color foundation.

## Files changed

- `src/lib/cases-data.ts` — extend types + records; extend agent pipeline.
- `src/components/CaseDesk.tsx` — StatusStamp, SLA chip, Rules row, MoneyFlow timeline, AuditLog panel, mono-number passes, agent rule-count line.
- `src/styles.css` — stamp tokens; small utility for mono+tabular numerics if not handled via existing `font-mono`.
- `src/assets/fraud-network.jpg` — no longer referenced (left on disk; safe to delete later, not required for this change).
