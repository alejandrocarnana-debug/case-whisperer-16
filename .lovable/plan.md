# Filum brand restyle — styling only

Visual pass to match the supplied logo. No layout, logic, component, or naming changes.

## 1. Logo asset

Upload the previously attached Filum logo and serve it at `/filum-logo.png` (so the user's specified path works):

```bash
lovable-assets create --file /mnt/user-uploads/image.png --filename filum-logo.png > public/filum-logo.png.asset.json
```

Then copy to `public/filum-logo.png` is not how lovable-assets works — the asset is served from the CDN URL in the `.asset.json`. I'll instead import that pointer in `CaseDesk.tsx` and use `logo.url` for the `<img src>`. If you specifically need the literal `/filum-logo.png` path (e.g. for a future printable report served from `public/`), say so and I'll place the binary in `public/` instead.

## 2. Tokens — `src/styles.css`

Replace values (variable names unchanged):

- `--background: #FAF9F6`
- `--foreground / --ink / --card-foreground / --popover-foreground: #16181D`
- `--muted-foreground: #5B6472`
- `--border / --input: #E7E4DD`
- `--primary: #1B2B4B`, `--primary-hover: #14213A`, `--ring: #1B2B4B`
- `--destructive: #D6452B`
- Severity:
  - critical `#D6452B` on `#FBEAE5`
  - high `#B07D2B` on `#F8F0DF`
  - review `#5B6472` on `#EEEFF1`
- Stamps re-aligned to new palette (red→`#D6452B/#FBEAE5`, blue→`#1B2B4B/#EEF2F7`, green stays, amber stays)
- Remove `--font-display` and the `.font-display` utility (Space Grotesk leaves the bundle in step 4).
- Shadow cap: only `0 1px 2px rgba(0,0,0,0.04)` — strip any larger `shadow-*` usage.

## 3. Header — `CaseDesk.tsx`

- Replace the `<FilumMark/>` SVG + wordmark text with `<img src={logo.url} alt="Filum" height={36} className="h-9 w-auto" onError={fallbackToText}/>`. The text fallback: `Filum` in Inter 700 / 22px / #1B2B4B / -0.02em / 2px #D6452B underline under the word only.
- Tagline beside it unchanged ("Pull the thread.", 13px #5B6472).
- Second line text unchanged.
- Drop the `FilumMark` SVG component.

## 4. Fonts — `src/routes/__root.tsx`

Remove Space Grotesk from the Google Fonts `<link>`; keep Inter + IBM Plex Mono only.

## 5. Red audit (CaseDesk.tsx)

Replace every remaining `#C8503C` / red usage with the new palette and keep red ONLY on:
- CRITICAL severity badge (text on `#FBEAE5`)
- wordmark underline
- the ring outline in any ring/graph visual
- the new thread divider

Specifically de-red:
- Money flow's "circular flow detected" arc + caption → switch to `#5B6472`
- Triggered rule chips → switch chip bg/text to neutral severity-review palette (chip stays distinct from "Evaded" by remaining filled vs outlined)
- SLA urgent chip → keep red because urgent SLA is genuinely critical signal; **flag for confirmation**: if you want SLA never red, say so and I'll switch urgent SLA to the high-amber palette.

## 6. Thread divider (the one decorative element)

Add inside `CaseDetail`, between the recommendation text and the row of action buttons (Escalate / Flag / Dismiss / Download report):

```tsx
<div className="relative my-4 h-px w-full" style={{ backgroundColor: "rgba(214,69,43,0.4)" }}>
  <span className="absolute -right-0 -top-[2.5px] block h-1.5 w-1.5 rounded-full bg-[#1B2B4B]" />
</div>
```

Your wording was "separates evidence section from action buttons." In the current layout the action buttons sit in the recommendation card ABOVE the Evidence tab — there is no buttons-below-evidence region. I'm placing the divider in the only valid spot without restructuring: inside the recommendation card, right above the action buttons. If you actually want a layout move (buttons relocated below the tabs so the divider can separate them), tell me and I'll do that as a separate change.

## 7. Numbers everywhere

Quick sweep confirming every numeric value uses `<Mono>` (already mostly done): risk score, exposures, percentages, account IDs, transaction IDs, dates, SLA hours, breakdown counts, audit timestamps. Currency cells stay right-aligned where currently right-aligned.

## 8. Report

No `Report` component exists today — "Download report" only appends an audit-log line. **Two options**:
- (a) Skip the report styling — there's nothing to style.
- (b) I add a small Report preview modal/page styled per spec (logo at 28px + "Case File" Inter 600).

Default is (a). Tell me if you want (b) and I'll add it in a follow-up.

## Files touched

- `src/styles.css` (tokens, drop font-display utility)
- `src/routes/__root.tsx` (drop Space Grotesk)
- `src/components/CaseDesk.tsx` (logo `<img>`, remove FilumMark, recolor, thread divider)
- `public/filum-logo.png.asset.json` (new pointer)

## Confirm before I build

1. Logo path: OK to import `logo.asset.json` and use `logo.url`? (Or do you want the binary copied into `public/` literally?)
2. SLA urgent chip: stay red, or move to amber?
3. Report styling: skip (a), or add a preview modal (b)?

If you just reply "go", I'll proceed with (1) asset pointer, (2) keep SLA red, (3) skip report.
