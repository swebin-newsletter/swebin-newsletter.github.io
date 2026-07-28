# public/admin/extensions — Sveltia CMS editorial extensions

Two small extensions load from `public/admin/index.html`, after the Sveltia CMS CDN script:

- `source-tools.js` — Task A: read-only source panel + "원문 변경" (source-changed) badge.
- `ai-prompt-copy.js` — Task B: "AI 작업용 프롬프트 복사" clipboard tool.

They share two small helper modules: `github-contents.js` (GitHub Contents API access) and
`dom-helpers.js` (route detection + best-effort DOM reads). `prompt-builder.js` is the pure prompt
assembly logic for Task B, also reused by the standalone fallback page `public/admin/prompt-tool.html`.

## Why "best-effort" is honest here, and what changed after checking the real docs

Sveltia CMS, loaded via the UNPKG CDN script tag, **does** expose a documented JavaScript
extension API on a global `CMS` object (`https://sveltiacms.app/en/docs/api`, checked 2026-07-28):
`registerEventListener`, `registerEditorComponent`, `registerFieldType`/`registerWidget`, custom
preview styles/templates, and manual initialization. That is more than this task's own framing
("Sveltia CMS itself... you cannot deeply fork its React internals") assumed going in, so this
implementation actually uses two different strategies depending on which documented API fit:

1. **`CMS.registerEventListener({ name: 'preSave', handler })`** — a real, documented, stable
   hook (verified via the docs site, not exercised against a live running instance in this
   session - no browser + no deployed OAuth Worker were available here). `source-tools.js` uses
   this to write `last_reviewed_content_sha256` back onto the entry at save time, gated on the
   editor having clicked "원문 확인 완료로 표시" for that exact entry first. **This is not a DOM
   hack** - it is the CMS's own intended extension point. The one thing that could not be
   double-checked live is the exact shape of the `entry` Immutable Map argument and the "return
   the entry unmodified" convention for a no-op; the code follows the one worked example the docs
   showed (`entry.get('data').set(field, value)`) and falls back defensively (try/catch, plain
   object spread) if that shape turns out to be wrong. **A future contributor with access to a
   real deployed CMS should do one real save with the review button clicked and confirm the
   commit actually contains the updated field.**

2. **`CMS.registerFieldType`/`registerWidget`** would have been the ideal way to render a fully
   custom side panel _inside_ the entry form (not a floating overlay), but the docs state the
   control/preview components must be **React class components**, and this static `/admin/` page
   has no React, JSX, or bundler toolchain available (see the root `package.json` — it is a Vite-
   free, bundler-free static page loaded straight over a CDN script tag). Building a custom
   field type therefore was not practically wireable here, matching the escape hatch the task
   description itself anticipated ("if those aren't practically wireable without a bundler in
   this static setup, implement the same logic as a small vanilla-JS panel").

3. For everything that isn't covered by a documented lifecycle hook — most importantly, "which
   article is the editor currently looking at, right now, for any reason other than a save" — there
   is no documented event. `dom-helpers.js#getCurrentEntryRoute` reads
   `location.hash` (`#/collections/<name>/entries/<slug>`), the routing convention Netlify/Decap
   CMS uses and Sveltia CMS aims for compatibility with; this specific route shape was **not**
   re-verified against a live deployed Sveltia CMS instance in this session. If it turns out to be
   wrong, both panels will simply stay hidden (they fail closed, not open) until
   `getCurrentEntryRoute()` is corrected against the real app.

## What is fully wired (works today, no caveats beyond normal browser fetch failures)

- `github-contents.js#fetchRepoFile` / `buildGithubBlobUrl` — plain `fetch()` calls against
  GitHub's public REST Contents API; no Sveltia-internal dependency at all.
- `github-contents.js#getBackendConfig` — reads `repo`/`branch` out of the live `config.yml` so
  they are never duplicated/hardcoded a second time in these scripts.
- `prompt-builder.js` — 100% pure functions (assemble/measure/limit-check), no DOM, no network, no
  LLM calls. See `ai-prompt-copy.manual-test.md` for how this is verified by hand (see below for
  why it isn't in the automated `vitest` suite).
- The "원문 변경" badge computation in `source-tools.js` — both values it compares
  (`metadata.json`'s `content_sha256` and the article's committed `last_reviewed_content_sha256`)
  come from the GitHub Contents API, not the DOM, so this part has no dependency on Sveltia's
  markup.
- `source-tools.js`'s `last_reviewed_content_sha256` writeback via `CMS.registerEventListener`
  (see caveat #1 above — the _mechanism_ is real/documented, the exact Immutable Map field-setting
  shape is inferred from one example and unverified live).
- `public/admin/prompt-tool.html` — a fully standalone page requiring no CMS embedding at all;
  the safest fallback if the injected panel ever fails to render for any reason.

## What is best-effort / not independently verified from this sandboxed session

- `github-contents.js#discoverCmsAuthToken` — tries a short list of plausible `localStorage` keys
  for Sveltia's own GitHub OAuth token so the Contents API calls can be authenticated against the
  private `swebin-dev/swebin-newsletter` repo. The exact key/format is an internal implementation
  detail with no environment available here to confirm it (no browser, no deployed OAuth Worker,
  private repo). If no token is found, every caller degrades to an unauthenticated GitHub API call
  (works only if the repo were public) and finally to a plain "GitHub에서 보기" link (works as long
  as the editor is separately signed in to github.com in the same browser).
- `dom-helpers.js#getCurrentEntryRoute` — hash-route parsing, see point 3 above.
- `dom-helpers.js#findFieldControlByLabelText` / `readFieldControlValue` — used only by
  `ai-prompt-copy.js` to _best-effort_ pick up unsaved, in-progress draft field text (뉴스레터
  제목/요약/편집 메모) by walking the rendered DOM near a label's text. If Sveltia's markup makes
  this unfindable, the corresponding textarea in the panel simply starts from the last **saved**
  value (fetched from GitHub) instead of the live unsaved one - always still editable by hand, so
  nothing is silently wrong, only "as fresh as automatic detection managed."

## What a future contributor with real access needs to do to finish this properly

1. Deploy `apps/workers/sveltia-auth` for real (see its own README.md) and sign in to `/admin/` as
   an actual editor.
2. Open a real article entry and confirm `location.hash` matches
   `#/collections/articles/entries/<source_id>` exactly; fix `getCurrentEntryRoute()` if not.
3. Click "원문 확인 완료로 표시", save the entry, and diff the resulting commit to confirm
   `last_reviewed_content_sha256` was actually written with the expected value (see caveat #1).
4. Inspect `localStorage` while signed in to find Sveltia's actual OAuth token storage key, and
   update `discoverCmsAuthToken()` to use the confirmed key instead of guessing.
5. If a bundler/React toolchain is ever introduced for `/admin/`, consider migrating the read-only
   source panel to a genuine `CMS.registerFieldType` custom field instead of a floating overlay -
   it would render inline in the form and would not depend on hash-route/DOM guessing at all.

## Never-do list (guardrails baked into both tools, do not remove while editing)

- `ai-prompt-copy.js` never calls an LLM API, never makes a network request to a model provider,
  never writes back to the article/issue, never auto-saves, never auto-publishes. It only reads
  (GitHub API + best-effort DOM) and writes to the clipboard.
- `ai-prompt-copy.js`/`prompt-tool.html` never silently truncate an over-limit prompt; the
  section-picker checkboxes and character counter must stay wired to `prompt-builder.js`'s
  `exceedsLimit()`, and the copy button must stay disabled while over the limit.
- `source-tools.js` never writes to any field other than `last_reviewed_content_sha256`, and only
  ever as a _pending_ change applied at the editor's own next Save - never immediately, never
  without the editor's explicit click.
