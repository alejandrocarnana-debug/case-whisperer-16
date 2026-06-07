# CaseDesk Final Brand Pass — Styling Only

Scope: token + className edits in `src/styles.css` and `src/components/CaseDesk.tsx`. No layout, structure, data, content semantics, or behavior changes.

## 1. Tokens — `src/styles.css`

Update `:root` values (everything else in the theme block stays):
- `--background` → warm off-white `oklch` matching `#FAF7F2`
- `--border` → warm `oklch` matching `#EBE7E0`
- `--foreground` → `#0E0E0F`
- `--muted-foreground` → warm gray `#5A5A5F`
- `--primary` / `--ring` → `#494FDF` (already cobalt-violet; nudge if off)
- Add new tokens:
  - `--ink: #0E0E0F`
  - `--header-bg: #0F1115`
  - `--blush: #FFF1F4` (Klarna recommendation tint)
- Map in `@theme inline`: `--color-ink`, `--color-header-bg`, `--color-blush`.
- Add small utilities/keyframes:
  - `.pulse-primary` — soft pulse animation in `var(--color-primary)` for active agent dots while pipeline runs (replaces ping-on-success styling target only where pipeline is "running"; existing JSX uses success — keep, just add the utility so future use lands).
  - Keep existing `animate-bar-grow`.

No layout-affecting CSS.

## 2. Header band — `CaseDesk.tsx` header (~lines 661–688)

- `<header>`: background `bg-[color:var(--color-header-bg)]` (near-black `#0F1115`), full-width, white text. Remove `border-b border-border bg-surface`.
- Add a 2px bottom gradient line: an absolutely-positioned `div` inside the header `bg-gradient-to-r from-primary to-transparent h-[2px]` at the very bottom — the only gradient.
- CASE/DESK wordmark: white text, with the `/` glyph wrapped in `<span className="text-primary">/</span>`.
- Stat numerals: `text-white font-bold tracking-tight` oversized (e.g. `text-2xl`), labels in `text-white/60 uppercase tracking-wider text-[11px]`.
- Run Analysis button: keep current pill but ensure it is the single loudest element — `bg-primary text-white font-bold` solid pill, slightly larger shadow.

## 3. Canvas + cards

- Body canvas already driven by `--background` (now warm off-white).
- All card surfaces (`bg-surface` / `bg-surface-raised`) stay pure white.
- Bump card radius from `rounded-2xl` → `rounded-3xl` globally inside `CaseDesk.tsx` (queue card, case detail sections, agent rail, severity breakdown, exhibits, stat chips). 1px `border-border` (now warm `#EBE7E0`) + `shadow-sm`.
- Card padding raised to `p-6` where currently `p-3/p-4/p-5` on the three zone shells and queue card (queue card already `p-6`).

## 4. Pill geometry

- Buttons / chips / badges / tabs all `rounded-full`.
- `StatusStamp`: keep slight rotation, switch from current dashed rounded-full (already round) — confirm pill radius and dashed border preserved.
- `SeverityBadge`, `SlaChip`, rule chips, tab triggers, Download Report, Escalate/Flag/Dismiss, Run Analysis — all pill.
- `TabsList`/`TabsTrigger`: ensure pill styling via shadcn override classes inline (`rounded-full`, active state `bg-primary text-primary-foreground`).

## 5. Recommendation card (Klarna moment)

In `CaseDetail` section "2. Recommendation" (~line 511):
- Change container from `border-primary/20 bg-primary/5` → `border-[color:var(--color-border)] bg-[color:var(--color-blush)] text-ink`.
- Heading: "Recommended next step" (sentence case), then `{recLabel[recKey]}` bold.
- Action buttons remain — Escalate stays solid primary, Flag outline white, Dismiss ghost. The recommended one keeps its ring.

## 6. Selected case left edge

- `CaseCard` selected state (`isSelected`): add a 3px left edge `before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-primary before:rounded-l-3xl` (replacing whatever current selected indicator is — pure styling swap).

## 7. Typography

- Risk score stays `text-5xl font-bold font-mono tracking-tight`.
- Header stat numerals + dollar exposure values: `font-bold tracking-tight`, monospace (`num`) where already applied; bump exposure in queue card to `text-2xl` if not already.
- Section labels: small uppercase wide-tracking in `text-muted-foreground` (warm gray now via token).
- Microcopy rewrites (sentence case):
  - "Recommended:" → "Recommended next step"
  - Empty state "No cases" → "All caught up"
  - Download Report tooltip/label area → "Report ready to download" where the label currently reads "Download Report" keep button text as-is per "don't change content"... 
  - Tab labels: "Evidence", "Money Flow", "Audit Log" → "Evidence", "Money flow", "Audit log".
  - These are tab labels/section labels — visual casing only, no semantic change.

## 8. Motion discipline

- Ensure every card / button / tab carries `transition-all duration-200 ease-out` (most already do).
- Cards: hover lift `hover:-translate-y-px hover:shadow-md` (queue card already has).
- Agent status dots: while pipeline running, dot uses `animate-ping`/pulse in `bg-primary` instead of success green. (Same JSX — swap class on the running-state branch only; behavior unchanged.)
- Remove any other transitions/animations beyond these (audit log etc. — leave existing none).

## 9. Files touched

- `src/styles.css` — token values + new `--header-bg`, `--blush`, mappings.
- `src/components/CaseDesk.tsx` — className swaps on header, cards, recommendation card, selected edge, tabs, microcopy casing.

## Out of scope (do not touch)

Layout grid, three-zone structure, Tabs sub-structure, queue card content, agent feed content, exhibits, SLA chips, money flow timeline, audit log, stat breakdown cards, action button set/handlers, Run Analysis behavior, Download Report behavior.
