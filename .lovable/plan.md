## Plan

### Goal
Add two compact stat cards to the existing CaseDesk layout using the project's shadcn Card components. No layout changes, no new dependencies.

---

### Card 1 — Severity Breakdown
- **Placement:** Top of the left queue rail, above the case cards, inside the existing `section`.
- **Data:** Total 23 cases. Segments: Critical 4, High 9, Review 10.
- **Visual:**
  - Thin horizontal composite progress bar (full width) split into three colored segments: red (critical), amber (high), slate (review).
  - Below: three breakdown rows. Each row: small colored vertical tick, percentage in monospace bold, count and label right-aligned (e.g. "4 · Critical").
  - Segments animate in with a brief width transition on load.
- **Style:** Dossier styling — monospace numbers (`num` class), light theme, subtle border, no trend arrows.

### Card 2 — Findings by Source
- **Placement:** Top of the right Agent Pipeline rail, above the Finder card, inside the existing `aside`.
- **Data:** Total 23 findings. Segments: Circular flows 6, Structuring 11, Duplicate transactions 6.
- **Visual:**
  - Same composite bar + breakdown row pattern as Card 1.
  - Segment colors: deep blue, teal, slate.
  - Caption under title: "Detected by Finder across 3 rule sets".
- **Style:** Same dossier styling.

### Implementation Details
- Import `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` from `@/components/ui/card`.
- Create two new local components inside `CaseDesk.tsx`:
  - `SeverityBreakdownCard` — takes no props, derives counts from `CASES` array.
  - `FindingsBySourceCard` — takes no props, uses hardcoded counts that sum to 23.
- Add CSS keyframe/utility for the width animation in `src/styles.css` if needed (e.g. a simple `@keyframes bar-grow` + `animate-bar-grow` class).
- Insert `SeverityBreakdownCard` inside the left `section` before the case queue list.
- Insert `FindingsBySourceCard` inside the `aside` before the `AgentPipeline`.
- Verify the header chip "23 cases flagged" remains unchanged and the totals in both cards equal 23.

### Out of Scope
- No changes to layout structure, grid columns, or column widths.
- No changes to case cards, case detail pane, agent cards, action buttons, or Run Analysis.
- No new npm packages.
