# Filum Visual Pass — Institutional Fraud-Ops Look

Styling only. No layout, structure, data, behavior, file/function renames.

## 1. Fonts — `src/routes/__root.tsx`

Add Google Fonts `<link>`s for: Inter (400/500/600/650), IBM Plex Mono (500), Space Grotesk (600). Remove any other display font links currently loaded.

## 2. Tokens — `src/styles.css`

Replace `:root` color/radius/font tokens (keep variable names so components keep working):

- `--radius: 0.5rem` (8px)
- `--background: #FAFAF8`
- `--surface / --surface-raised / --card / --popover: #FFFFFF`
- `--foreground / --card-foreground / --popover-foreground / --ink: #16181D`
- `--muted-foreground: #5B6472`
- `--border / --input: #E5E3DD`
- `--primary: #1E3A5F`, `--primary-hover: #16294A`, `--primary-foreground: #FFFFFF`, `--ring: #1E3A5F`
- `--secondary: #F4F6F9`, `--secondary-foreground: #16181D`
- `--muted: #EEEFF1`, `--accent: #F4F6F9`
- `--destructive: #C8503C` (thread red)
- `--header-bg: #FFFFFF` (header becomes the same calm surface, not the dark band)
- Remove `--blush`; reuse for severity backgrounds via new tokens below
- Severity tokens:
  - `--severity-critical: #C8503C`, `--severity-critical-bg: #FBEAE6`
  - `--severity-high: #B07D2B`, `--severity-high-bg: #F8F0DF`
  - `--severity-review: #5B6472`, `--severity-review-bg: #EEEFF1`
- `--success: #2F7D5B`
- `--rule-bg: #FCF8EF`, `--rule-border: #B07D2B`
- Stamps: align to new palette (`stamp-red: #C8503C/#FBEAE6`, `stamp-amber: #B07D2B/#F8F0DF`, `stamp-green: #2F7D5B/#EAF3EE`, `stamp-blue: #1E3A5F/#EEF2F7`)
- `--font-sans: "Inter", ui-sans-serif, system-ui, sans-serif`
- `--font-mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, monospace`
- Add `--font-display: "Space Grotesk", "Inter", sans-serif` (wordmark only)
- Map `--color-display` in `@theme inline`

Shadow: add `--shadow-card: 0 1px 2px rgba(0,0,0,0.04)`; map and use everywhere shadow is currently `shadow-sm`/`shadow-md`. Remove all gradients, `backdrop-blur`, larger shadows.

Base styles: `body { font-size: 15px; line-height: 1.5; }`; headings 1.25. Tabular-nums on `.num` stays.

## 3. CaseDesk.tsx — sweep, no structural change

### Header (~661–688)
- Background `bg-white`, bottom `border-b border-border`. Remove the dark band, the gradient line, all white-on-dark utilities.
- Logo block: small SVG ring icon (12 navy dots on a #C8503C circle outline with a short #C8503C lead line) + wordmark `Filum` in `font-display text-[20px] font-semibold text-ink` with a 2px #C8503C bottom border **under the word only** (inline-block + `border-b-2 border-[#C8503C]`). Tagline beside: `Pull the thread.` 13px `text-muted-foreground`.
- Second line under wordmark row: 13px muted: "5,000 real bank transactions · one hidden fraud ring · findings verifiable against the event's answer key".
- Stat chips: white cards, 1px border, 8px radius, padding 16/20px. Value: mono 20px/600 ink. Label: 11px uppercase 0.06em tracking, muted.
- Run Analysis button: `bg-primary text-white rounded-md` (6px), 13px 600, hover `bg-[#16294A]`. No pill.

### Global className sweep
- Replace every `rounded-2xl`/`rounded-3xl`/`rounded-full` on cards/buttons/inputs with `rounded-md` (8px). Keep `rounded-full` ONLY on status dots and the small severity pills.
- Replace `shadow-md`/`shadow-lg` with `shadow-[0_1px_2px_rgba(0,0,0,0.04)]`.
- Remove all `bg-gradient-*`, `backdrop-blur*`, `before:` colored left edges of 3px+ except the queue selected state.

### Typography sweep
- Page title (only one) → `text-[28px] font-[650] tracking-[-0.02em]`.
- Pane headings (Case Detail / Agent Pipeline / Queue) → `text-[20px] font-semibold tracking-[-0.01em]`.
- Card titles / case names → `text-base font-semibold` (16/600).
- Body / evidence → `text-[15px]`.
- Metadata / timestamps → `text-[13px] font-medium text-muted-foreground`.
- Uppercase labels → `text-[11px] uppercase tracking-[0.06em] font-medium text-muted-foreground`.
- All numerals (risk score, exposures, confidence, percentages, account IDs, txn IDs, dates) → wrap in `font-mono font-medium` (`num` class already does tabular). Right-align currency cells.
- Risk score hero: `text-5xl font-mono font-medium tracking-tight` colored by severity (red/amber/slate per existing thresholds remapped to new severity colors).
- Remove every italic except agent "⟲ Recalled from memory:" line.

### Buttons
- Primary (Approve Action, Run Analysis, Escalate): `bg-primary text-white rounded-md` 13px 600.
- All others: `bg-white border border-border text-ink rounded-md hover:bg-secondary`.

### Severity badges
- `text-[11px] uppercase tracking-[0.04em] font-medium px-2 py-0.5 rounded-full`
- CRITICAL → `text-[#C8503C] bg-[#FBEAE6]`
- HIGH → `text-[#B07D2B] bg-[#F8F0DF]`
- REVIEW → `text-[#5B6472] bg-[#EEEFF1]`

### Queue cards
- White, 1px border, 8px radius, padding 20px, 12px gap.
- Severity pill top-left, account ID mono top-right.
- Exposure: mono 16px/600 ink.
- Reason: 13px muted, one line.
- Selected: `border-l-2 border-l-primary bg-[#F4F6F9]` (replaces the 3px primary edge / pill bg).

### Case detail evidence rows
- Replace boxed evidence rows with vertical stack separated by `border-b border-border` hairlines, 16px vertical padding. Remove individual card borders inside.
- "Evaded rule:" row: `border-l-[3px] border-l-[#B07D2B] bg-[#FCF8EF] pl-3 py-2 rounded-r-md`.

### Recommendation card
- White surface, 1px border, 8px radius, 20px padding. Remove blush tint. Heading 11px uppercase label + 16/600 recommendation text.

### Agent pipeline cards
- White, 1px border, 8px radius, 20px padding.
- Agent name as 11px uppercase label; summary 15px ink.
- Status dot 8px round; running uses `#1E3A5F` pulse, success `#2F7D5B`, no other colors.
- Recalled line: `italic text-[13px] text-muted-foreground bg-[#F7F7F5] rounded-md px-3 py-2`.

### Fraud-likelihood bar
- Track 6px `bg-border rounded-full`, fill `bg-primary rounded-full`. Value beside: `font-mono` `87% [79–93%]`.

### Tabs
- `TabsList`: `bg-secondary rounded-md p-0.5`. `TabsTrigger`: `rounded-sm px-3 py-1 text-[13px]`, active `bg-white text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04)]`. No pill.

### Misc
- StatusStamp: keep stamped feel but switch to new palette, remove rotation if it reads "playful"; keep dashed border + uppercase 11px.
- SLA chip: 11px uppercase pill, severity colors per above.
- Audit log rows: hairline-separated, mono timestamps.
- Modals / report preview / empty states: same surface/border/radius/shadow rules, Inter throughout, primary button style.

## 4. Out of scope
Layout grid, three-zone structure, tabs sub-structure, queue contents, agent feed content, exhibits, money-flow timeline, audit log content, action handlers, Run Analysis behavior, Download Report behavior, file/function renames.

## Files touched
- `src/styles.css`
- `src/routes/__root.tsx` (font links)
- `src/components/CaseDesk.tsx` (className + small inline SVG logo swap)
