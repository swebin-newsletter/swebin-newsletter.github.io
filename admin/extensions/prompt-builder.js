/**
 * Pure prompt-assembly logic for the "AI 작업용 프롬프트 복사" tool (Task B).
 *
 * Deliberately framework/DOM-free so the exact same module can be imported both by the browser
 * extension (ai-prompt-copy.js) and by public/admin/prompt-tool.html's standalone page, and could
 * be unit tested directly if this folder is ever added to vitest's `include` globs (it currently
 * is not - vitest.config.ts's `include` only covers `packages/**` and `apps/workers/**`, and this
 * task's instructions asked not to edit vitest.config.ts - see
 * public/admin/extensions/ai-prompt-copy.manual-test.md for the manual verification steps used
 * instead).
 *
 * This module makes no network calls, calls no LLM, and never writes anywhere by itself - it
 * only turns plain-object input into a plain string, and measures that string's length. Every
 * side effect (fetching source files, reading form fields, writing to the clipboard) lives in
 * the caller.
 */

export const DEFAULT_MAX_PROMPT_CHARS = 12000;

export const INSTRUCTION_BLOCK = [
  '아래 원문을 바탕으로 다음을 작성해 주세요:',
  '1. 제목 후보 3개',
  '2. 요약 (3~4문장)',
  '3. 핵심 포인트 (bullet 3~5개)',
  '4. 중립적이고 담백한 문체를 유지할 것',
  '5. 원문에 없는 사실을 추가하지 말 것 (추측, 과장, 없는 통계/인용 금지)',
].join('\n');

/** Which optional sections to include in the assembled prompt. All default to included. */
export function defaultSections() {
  return { sourceBody: true, sourceMetadata: true, draft: true };
}

function formatMetadataBlock(metadata) {
  const m = metadata || {};
  return [
    `제목: ${m.title || '(없음)'}`,
    `작성자: ${m.author || '(없음)'}`,
    `원문 날짜: ${m.publishedAt || '(없음)'}`,
    `카테고리: ${m.category || '(없음)'}`,
    `원문 URL: ${m.url || '(없음)'}`,
  ].join('\n');
}

function formatDraftBlock(draft) {
  const d = draft || {};
  return [
    `뉴스레터 제목(초안): ${d.newsletterTitle || '(비어 있음)'}`,
    `뉴스레터 요약(초안): ${d.newsletterSummary || '(비어 있음)'}`,
    `편집 메모: ${d.editorNotes || '(비어 있음)'}`,
  ].join('\n');
}

/**
 * Builds the full clipboard prompt text from whichever sections are enabled in `sections`. Always
 * includes the fixed instruction block (제목 후보/요약/핵심 포인트/중립적 문체/원문 외 사실 금지),
 * since that constraint must never be silently droppable by the section picker.
 */
export function assemblePrompt({ sections, sourceBody, metadata, draft }) {
  const s = sections || defaultSections();
  const parts = [];
  if (s.sourceMetadata) {
    parts.push(`## 원문 메타데이터\n${formatMetadataBlock(metadata)}`);
  }
  if (s.sourceBody) {
    parts.push(`## 원문 전체\n${sourceBody || '(원문을 불러오지 못했습니다)'}`);
  }
  if (s.draft) {
    parts.push(`## 현재 편집 초안\n${formatDraftBlock(draft)}`);
  }
  parts.push(`## 요청\n${INSTRUCTION_BLOCK}`);
  return parts.join('\n\n');
}

/** Length of the prompt that `assemblePrompt(input)` would produce, without building it twice. */
export function computePromptLength(input) {
  return assemblePrompt(input).length;
}

/** True when the assembled prompt is longer than `maxChars` (default DEFAULT_MAX_PROMPT_CHARS). */
export function exceedsLimit(promptText, maxChars = DEFAULT_MAX_PROMPT_CHARS) {
  return promptText.length > maxChars;
}
