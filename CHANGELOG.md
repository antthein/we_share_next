# Changelog — we_share

## v0.4.0 — Write page + toast light mode fix
**Type:** Minor (new feature)
- New `/write` page — full post creation with Tiptap rich text editor
- Editor toolbar: Bold, Italic, H2, H3, Bullet list, Link
- Fields: title, excerpt, topic (10 options), tags (pill input, max 6), content
- Read time auto-calculated live from word count (~200 wpm)
- Auth-protected: redirects to login if not signed in
- Nav: "write" button shown for authenticated users (desktop + mobile menu)
- Toast colours switched to CSS variables — now respects light/dark mode correctly

---

## v0.3.0 — Quotes tab
**Type:** Minor (new feature)
- New `/quotes` page — 3 curated/AI quotes refreshed every UTC day
- Daily selection: slots 1-2 from hand-picked pool, slot 3 Claude-generated (falls back to curated if no `ANTHROPIC_API_KEY`)
- AI quotes clearly labelled with a subtle `ai pick` pill
- Quote cards: large breathing text, theme tag, author/source attribution
- Resonate — lightweight reaction per quote, shows aggregate count subtly
- Bookmark — saves quote to personal collection (login required; guests shown sign-in nudge)
- Nav updated: quotes positioned after share_space and before browse
- New DB tables: `quotes`, `daily_quotes`, `quote_reactions`, `quote_bookmarks`
- New env var: `ANTHROPIC_API_KEY` (optional — enables AI quote generation)

---

## v0.2.0 — About page
**Type:** Minor (new page)
- Created `/about` as a dedicated full page (hero, stats, mission, values, CTA)
- Nav `about` link updated from `#about` anchor to `/about` route — active highlight works correctly
- Footer `About` link updated to `/about`
- Home page left unchanged

---

Semantic Versioning: `vMAJOR.MINOR.PATCH`
Pre-launch builds are tracked as `v0.x.x`

---

## v0.1.4 — Light mode fix
**Type:** Patch (bug fix)
- Added `@custom-variant dark` directive so Tailwind v4 responds to `.dark` class instead of system media query
- Added `html:not(.dark)` CSS variable block so custom utility classes (`.ws-bg`, `.ws-text`, etc.) correctly switch to light palette
- Light mode now fully functional

---

## v0.1.3 — Version badge
**Type:** Patch (UI addition)
- Added version pill next to the `we_share` wordmark in the nav
- Version imported from a single constant — bump once per update
- Styled with accent blue pill, consistent with brand

---

## v0.1.2 — Theme toggle hydration fix
**Type:** Patch (bug fix)
- Changed `useState(true)` to `useState<boolean | null>(null)` in ThemeToggle
- Component renders a placeholder until after mount, then reads `localStorage`
- Eliminates server/client mismatch that caused wrong icon and broken toggle state

---

## v0.1.1 — Theme toggle modal fix
**Type:** Patch (bug fix)
- Used `createPortal` to render the brightness warning modal directly into `document.body`
- Prevented modal from being clipped inside the nav's `z-50` stacking context
- Added inline `<script>` in `layout.tsx` to apply saved theme before React hydrates (no flash on load)

---

## v0.1.0 — Initial pre-launch build
**Type:** Minor (full feature set shipped)
- Next.js 15 + Supabase project scaffold with TypeScript and Tailwind v4
- Supabase schema: 7 tables (profiles, posts, votes, bookmarks, comments, shares, share_reactions), RLS policies, auto-profile trigger
- Pages: home, browse, share_space, post/[id], auth (login / signup / callback), 404
- Components: Nav, ThemeToggle, PostCard, Toast, PostActions, BrowseClient, ShareSpaceClient
- Dark/light theme system with localStorage persistence
- Auth: email + password login, signup with email confirmation
