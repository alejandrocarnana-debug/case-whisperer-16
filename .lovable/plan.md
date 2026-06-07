## Polish Pass — Revolut-inspired styling tokens

Styling-only. No structure, content, data, or behavior changes. Two files touched: `src/styles.css` and `src/components/CaseDesk.tsx`.

### 1. Tokens (`src/styles.css`)
- `--background` → #FAFAFA off-white canvas
- `--surface`, `--surface-raised`, `--card` → #FFFFFF
- `--foreground` / `--card-foreground` → #0A0A0A ink
- `--muted-foreground` → #525252
- `--primary` / `--ring` / `--source-blue` → #494FDF cobalt-violet
- `--primary-hover` → slightly darker cobalt-violet
- `--border` / `--input` → #E5E5E5
- `--radius` → 1.25rem (drives rounded-2xl ≈ 20px on cards)
- Severity tokens left untouched (functional colors)

### 2. Shape & shadow updates in `CaseDesk.tsx`
- Outer rail sections + detail pane: `rounded-2xl border-border shadow-sm`
- Breakdown cards (`BreakdownCard`): `rounded-2xl shadow-sm`
- `CaseCard`: `rounded-2xl shadow-sm`, p-5, `transition-all duration-200`, hover lifts (`hover:-translate-y-px hover:shadow-md`); when active, swap the left severity bar for a 2px cobalt-violet left border (`border-l-2 border-primary`) keeping the severity bar visible on inactive
- Detail pane padding p-5 (already), confirm
- Audit log, money flow timeline, exhibit list cards: same `rounded-2xl` / border / shadow-sm
- All buttons (Run Analysis, Approve, Dismiss, Escalate, Download Report, AuditLog toggle): `rounded-full transition-all duration-200`
- Chips/badges/pills: `SeverityBadge`, `SlaChip`, rule chips (Triggered / Evaded), agent "done" tag → `rounded-full`
- `StatusStamp`: keep rotation + dashed border, change radius from `rounded-sm` to `rounded-full`

### 3. Typography — header stat chips
Restructure each `StatChip` to a stacked display block:
- Number: `text-3xl font-bold tracking-tight` (kept `num` monospace)
- Label: small muted text beneath
- Card-style container: white surface, `rounded-2xl border shadow-sm`, p-4
- Layout still inline-flex side-by-side in the header; no grid changes

### 4. Case card typography
- Exposure number: bump from `text-lg` → `text-xl`, keep `font-semibold` → `font-bold`
- Keep monospace, keep IDs/amounts/timestamps in `num` exactly as is

### 5. Spacing
- Queue card gap: `gap-2` → `gap-3` (12px)
- Card internal padding: `p-3.5` → `p-5` on `CaseCard`; rail containers stay as-is (only the cards themselves get the bump per "padding inside cards to p-5")

### Out of scope (untouched)
Three-zone grid, column widths, all text content, dossier components' structure, behavior, all data, agent feed structure, breakdown card data, severity colors, monospace styling, animations beyond the single `transition-all duration-200`.
