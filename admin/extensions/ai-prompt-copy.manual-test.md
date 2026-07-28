# Manual test — AI 작업용 프롬프트 복사 (ai-prompt-copy.js / prompt-tool.html)

`prompt-builder.js`'s functions are pure and would be a natural fit for an automated `vitest`
suite, but `vitest.config.ts`'s `test.include` only covers `packages/**/*.test.ts` and
`apps/workers/**/*.test.ts` — it does not cover `public/admin/**`, and this task was scoped not to
edit `vitest.config.ts`. So this is the honest fallback: manual steps to verify the same behavior
by hand in a real browser (clipboard APIs also generally require a real, focused browser tab —
`navigator.clipboard.writeText` typically rejects in a headless/background context anyway).

Two ways to run this:

- **A. Standalone page** (no CMS/OAuth Worker needed): open `public/admin/prompt-tool.html`
  directly (e.g. via a static file server, or `open public/admin/prompt-tool.html`).
- **B. Injected panel**: open `/admin/` in a browser with the Sveltia auth Worker deployed and
  signed in, then open any article entry (e.g. `content/articles/10192`). A panel should appear
  in the bottom-left corner labeled "AI 작업용 프롬프트 복사 - 10192".

Both share the same underlying `prompt-builder.js`; the checks below describe the standalone page
but note where the injected panel differs.

## 1. Basic assembly and section toggles

1. Fill in: 원문 제목=`테스트 제목`, 작성자=`테스트 작성자`, 원문 날짜=`2026-07-01`,
   카테고리=`NEWS`, 원문 URL=`https://swebin.com/F/A/10192`.
2. Fill 원문 본문 with a few sentences of placeholder text.
3. Fill 뉴스레터 제목(초안)/뉴스레터 요약(초안)/편집 메모 with placeholder text.
4. All three "포함할 항목" checkboxes should start checked. Confirm the length counter below
   updates as you type in any field (no reload/button press needed).
5. Uncheck "원문 본문" — the counter should drop noticeably; uncheck "원문 메타데이터" and
   "현재 편집 초안" too — the counter should still show a positive, non-zero length (the fixed
   instruction block — 제목 후보/요약/핵심 포인트/중립적 문체/원문 외 사실 금지 — is always
   included and must never be an optional/uncheckable section).
6. Re-check all three boxes.

**Pass condition**: the counter updates live on every keystroke/checkbox toggle, and unchecking
all three optional sections never brings the length to 0.

## 2. Length-limit gate (no silent truncation)

1. Set "글자 수 제한" to a small number, e.g. `50`.
2. Confirm the status line turns to an "over limit" state (visually distinct / red-ish) and reads
   something like "현재 길이: N자 / 제한: 50자 - 제한 초과: 포함 항목을 줄여주세요".
3. Confirm the "클립보드에 복사" button is now disabled (cannot be clicked / no visible effect).
4. Uncheck sections (or raise the limit back to e.g. `12000`) until the length status flips back
   to the "ok" state.

**Pass condition**: at no point does the tool copy a truncated/cut-off version of the prompt when
over the limit — the only way to copy is to first bring the assembled length under the limit
yourself, by choosing what to include or raising the limit. Nothing is silently cut.

## 3. Clipboard copy correctness

1. With the length under the limit, click "클립보드에 복사".
2. Confirm the status line changes to a confirmation message ("클립보드에 복사되었습니다.").
3. Paste (Cmd/Ctrl+V) into a plain text editor and confirm the pasted text contains, in order:
   - a `## 원문 메타데이터` section (if checked) with the exact values you typed;
   - a `## 원문 전체` section (if checked) with your placeholder source text;
   - a `## 현재 편집 초안` section (if checked) with your draft field values;
   - a `## 요청` section containing all five fixed instructions: 제목 후보, 요약, 핵심 포인트,
     중립적 문체, and the explicit "원문에 없는 사실을 추가하지 말 것" constraint.

**Pass condition**: pasted text matches what was on screen; the five fixed instructions are
present verbatim regardless of which optional sections were checked.

## 4. No network/LLM calls

1. Open the browser's Network tab before clicking "클립보드에 복사".
2. Click copy.
3. Confirm no new network request fires as a result of the click (aside from whatever the browser
   itself does for clipboard permission prompts, which is not a page-initiated request).

**Pass condition**: zero network requests triggered by the copy action itself.

## 5. Injected-panel-specific checks (mode B only)

1. Open an article entry in `/admin/`. Confirm the panel's title includes the correct source ID
   from the URL.
2. Type something into the 뉴스레터 요약 field in Sveltia's own form (do not save), then check
   whether the panel's "뉴스레터 요약(초안)" textarea picks it up automatically on next
   open/refresh. If it does not, this is the documented best-effort DOM-scrape gap (see
   `README.md`) — the textarea should still contain the last _saved_ value and remain editable by
   hand; this is not a failure of the tool, just a known limitation to note.
3. Confirm the panel never writes anything back into Sveltia's own form fields, and never
   triggers a save by itself.

## 6. Never-do checklist (re-confirm on every change to this file/ai-prompt-copy.js)

- [ ] No call to any LLM/model-provider API.
- [ ] No network request to any endpoint other than the GitHub Contents API (for pre-filling)
      and `/admin/config.yml` (same-origin static file).
- [ ] No write-back to the article/issue itself.
- [ ] No auto-save, no auto-publish.
- [ ] Over-limit state always blocks the copy button; never silently truncates.
