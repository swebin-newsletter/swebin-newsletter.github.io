/* global window, navigator */
/**
 * Task B: "AI 작업용 프롬프트 복사" tool, injected into the Sveltia CMS admin page.
 *
 * Loaded from public/admin/index.html as `<script type="module" src="/admin/extensions/ai-prompt-copy.js">`.
 *
 * Hard requirements this file must satisfy (do not weaken these while editing):
 *   - NEVER calls an LLM API or any model-provider network endpoint.
 *   - NEVER writes anything back to the article/issue itself (contrast with source-tools.js,
 *     which intentionally does write a review-hash field). This tool is read + clipboard only.
 *   - NEVER auto-saves or auto-publishes anything.
 *   - If the assembled prompt exceeds the configurable character limit, it must show an explicit
 *     section picker rather than silently truncating (see prompt-builder.js#exceedsLimit).
 *
 * WHAT IS FULLY WIRED: fetching the article's committed `index.md` (for source metadata) and
 * `source.md` (for the full source body) via the GitHub Contents API - both plain `fetch()`
 * calls, no Sveltia-internal API involved - and the entire prompt-assembly/length-check/section-
 * picker/clipboard-copy flow (public/admin/extensions/prompt-builder.js), which is pure and
 * framework-free.
 *
 * WHAT IS BEST-EFFORT: pre-filling the "current draft" textareas with whatever the editor has
 * typed but not yet saved, by best-effort DOM scraping (see dom-helpers.js). If that fails, the
 * textareas still start pre-filled from the last *saved* frontmatter (fetched from GitHub) and
 * remain fully editable, so the editor can always correct them by hand before copying - nothing
 * is silently wrong, only "as fresh as we could automatically detect."
 *
 * Also see public/admin/prompt-tool.html for a standalone, non-injected fallback that offers the
 * same functionality without depending on being embedded inside the CMS page at all.
 */
import {
  getBackendConfig,
  fetchRepoFile,
  buildGithubBlobUrl,
  discoverCmsAuthToken,
} from './github-contents.js';
import {
  getCurrentEntryRoute,
  onRouteSettled,
  findFieldControlByLabelText,
  readFieldControlValue,
  ensurePanelHost,
} from './dom-helpers.js';
import {
  assemblePrompt,
  computePromptLength,
  exceedsLimit,
  defaultSections,
  DEFAULT_MAX_PROMPT_CHARS,
} from './prompt-builder.js';

const PANEL_HOST_ID = 'swebin-ai-prompt-copy-panel-host';

/** Minimal, best-effort YAML-frontmatter scalar-field reader (no bundler/YAML lib available here). */
function parseFrontmatterFields(markdown, fieldNames) {
  const result = {};
  const frontmatterMatch = /^---\n([\s\S]*?)\n---/.exec(markdown || '');
  const block = frontmatterMatch ? frontmatterMatch[1] : '';
  for (const name of fieldNames) {
    const re = new RegExp(`^${name}:\\s*"?(.*?)"?\\s*$`, 'm');
    const m = re.exec(block);
    if (m) result[name] = m[1];
  }
  return result;
}

function bodyAfterFrontmatter(markdown) {
  return (markdown || '').replace(/^---\n[\s\S]*?\n---\n?/, '').trim();
}

/**
 * Starts collapsed to a small tab -- this is an optional power-user tool (copy a prompt for an
 * external AI chat tool), not something every save requires, so it shouldn't cover a large part
 * of a non-technical editor's screen by default.
 */
function isCollapsed(host) {
  return host.dataset.collapsed !== 'false';
}

function renderPanel(host, model) {
  if (!host.shadowRoot) host.attachShadow({ mode: 'open' });
  const root = host.shadowRoot;

  const style = `
    :host { all: initial; }
    .tab {
      position: fixed; left: 16px; bottom: 16px; z-index: 999999;
      background: #1f2430; color: #eef1f6; border-radius: 999px;
      box-shadow: 0 4px 16px rgba(0,0,0,.3); font: 13px/1.5 -apple-system, system-ui, sans-serif;
      padding: 8px 14px; cursor: pointer; border: none;
    }
    .panel {
      position: fixed; left: 16px; bottom: 16px; z-index: 999999;
      width: 420px; max-height: 78vh; overflow-y: auto;
      background: #1f2430; color: #eef1f6; border-radius: 10px;
      box-shadow: 0 6px 24px rgba(0,0,0,.35); font: 13px/1.5 -apple-system, system-ui, sans-serif;
      padding: 12px 14px;
    }
    .panel-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .panel-head h3 { margin: 0; font-size: 13px; }
    .close { background: none; border: none; color: #9aa2b1; cursor: pointer; font-size: 16px; padding: 0 4px; }
    label { display: block; font-size: 12px; margin: 8px 0 2px; color: #cbd2e0; }
    textarea { width: 100%; box-sizing: border-box; background: #14171f; color: #eef1f6; border: 1px solid #333a4a; border-radius: 6px; padding: 6px; font: 12px/1.4 monospace; }
    input[type="number"] { width: 90px; }
    .checks { display: flex; gap: 12px; flex-wrap: wrap; margin: 6px 0; }
    .checks label { display: flex; align-items: center; gap: 4px; margin: 0; }
    button.action { cursor: pointer; border: none; border-radius: 6px; padding: 7px 12px; font-size: 12px; }
    .primary { background: #4c7cf0; color: white; }
    .primary:disabled { background: #3a3f4d; color: #8a90a0; cursor: not-allowed; }
    .status { font-size: 12px; margin-top: 6px; min-height: 16px; }
    .status.over { color: #ffb4b4; }
    .status.ok { color: #b8f0c2; }
    .muted { color: #9aa2b1; font-size: 12px; }
  `;

  if (isCollapsed(host)) {
    root.innerHTML = `
      <style>${style}</style>
      <button class="tab" id="expand">🤖 AI 프롬프트 복사</button>
    `;
    root.getElementById('expand').addEventListener('click', () => {
      host.dataset.collapsed = 'false';
      renderPanel(host, model);
    });
    return;
  }

  root.innerHTML = `
    <style>${style}</style>
    <div class="panel">
      <div class="panel-head">
        <h3>AI 작업용 프롬프트 복사 - ${model.sourceId}</h3>
        <button class="close" id="collapse" title="접기" aria-label="접기">×</button>
      </div>
      <div class="muted">
        이 도구는 어떤 AI 모델도 직접 호출하지 않습니다. 아래 내용을 클립보드에 복사한 뒤,
        여러분이 직접 사용하는 AI 채팅 도구에 붙여넣어 확인하세요. 결과는 반드시 사실 여부를 검토하고,
        원문에 없는 내용은 그대로 받아들이지 마세요.
      </div>

      <div class="checks">
        <label><input type="checkbox" id="chk-meta" ${model.sections.sourceMetadata ? 'checked' : ''}/> 원문 메타데이터</label>
        <label><input type="checkbox" id="chk-body" ${model.sections.sourceBody ? 'checked' : ''}/> 원문 본문</label>
        <label><input type="checkbox" id="chk-draft" ${model.sections.draft ? 'checked' : ''}/> 현재 편집 초안</label>
      </div>

      <label>글자 수 제한 <input type="number" id="max-chars" min="500" step="500" value="${model.maxChars}"/></label>

      <label>뉴스레터 제목 (초안, 수정 가능)</label>
      <textarea id="draft-title" rows="2">${escapeHtml(model.draft.newsletterTitle)}</textarea>
      <label>뉴스레터 요약 (초안, 수정 가능)</label>
      <textarea id="draft-summary" rows="3">${escapeHtml(model.draft.newsletterSummary)}</textarea>
      <label>편집 메모 (수정 가능)</label>
      <textarea id="draft-notes" rows="2">${escapeHtml(model.draft.editorNotes)}</textarea>

      <div class="muted" id="fetch-note">${model.fetchError ? `원문 자동 로딩 실패: ${escapeHtml(model.fetchError)} (원문 본문 항목을 해제하거나 직접 붙여넣어 사용하세요)` : ''}</div>

      <div class="status" id="length-status"></div>
      <button class="action primary" id="copy-btn">클립보드에 복사</button>
    </div>
  `;

  root.getElementById('collapse').addEventListener('click', () => {
    host.dataset.collapsed = 'true';
    renderPanel(host, model);
  });

  const chkMeta = root.getElementById('chk-meta');
  const chkBody = root.getElementById('chk-body');
  const chkDraft = root.getElementById('chk-draft');
  const maxCharsInput = root.getElementById('max-chars');
  const draftTitle = root.getElementById('draft-title');
  const draftSummary = root.getElementById('draft-summary');
  const draftNotes = root.getElementById('draft-notes');
  const lengthStatus = root.getElementById('length-status');
  const copyBtn = root.getElementById('copy-btn');

  function currentInput() {
    return {
      sections: {
        sourceMetadata: chkMeta.checked,
        sourceBody: chkBody.checked,
        draft: chkDraft.checked,
      },
      sourceBody: model.sourceBody,
      metadata: model.metadata,
      draft: {
        newsletterTitle: draftTitle.value,
        newsletterSummary: draftSummary.value,
        editorNotes: draftNotes.value,
      },
    };
  }

  function recompute() {
    const maxChars = Number(maxCharsInput.value) || DEFAULT_MAX_PROMPT_CHARS;
    const input = currentInput();
    const length = computePromptLength(input);
    const over = exceedsLimit(assemblePrompt(input), maxChars);
    lengthStatus.textContent = `현재 길이: ${length}자 / 제한: ${maxChars}자${over ? ' - 제한 초과: 포함 항목을 줄여주세요' : ''}`;
    lengthStatus.className = `status ${over ? 'over' : 'ok'}`;
    copyBtn.disabled = over;
    return { input, maxChars, over };
  }

  [chkMeta, chkBody, chkDraft, maxCharsInput, draftTitle, draftSummary, draftNotes].forEach((el) =>
    el.addEventListener('input', recompute),
  );

  copyBtn.addEventListener('click', async () => {
    const { input, over } = recompute();
    if (over) return; // Defense in depth; the button is already disabled in this state.
    const text = assemblePrompt(input);
    try {
      await navigator.clipboard.writeText(text);
      lengthStatus.textContent = '클립보드에 복사되었습니다.';
      lengthStatus.className = 'status ok';
    } catch (err) {
      lengthStatus.textContent = `클립보드 복사 실패: ${err && err.message}. 브라우저 권한을 확인하세요.`;
      lengthStatus.className = 'status over';
    }
  });

  recompute();
}

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function refresh() {
  const route = getCurrentEntryRoute();
  const host = ensurePanelHost(PANEL_HOST_ID);
  if (!route || route.collection !== 'articles') {
    host.style.display = 'none';
    return;
  }
  host.style.display = 'block';

  const sourceId = route.slug;
  let backend;
  try {
    backend = await getBackendConfig();
  } catch (err) {
    renderPanel(host, {
      sourceId,
      sections: defaultSections(),
      maxChars: DEFAULT_MAX_PROMPT_CHARS,
      metadata: {},
      draft: { newsletterTitle: '', newsletterSummary: '', editorNotes: '' },
      sourceBody: '',
      fetchError: `config.yml 읽기 실패: ${err && err.message}`,
    });
    return;
  }

  const token = discoverCmsAuthToken();
  const basePath = `content/articles/${sourceId}`;

  const [indexResult, sourceResult] = await Promise.all([
    fetchRepoFile({
      repo: backend.repo,
      branch: backend.branch,
      path: `${basePath}/index.md`,
      token,
    }),
    fetchRepoFile({
      repo: backend.repo,
      branch: backend.branch,
      path: `${basePath}/source.md`,
      token,
    }),
  ]);

  const savedFields = indexResult.ok
    ? parseFrontmatterFields(indexResult.content, [
        'source_title',
        'source_author',
        'source_published_at',
        'source_category',
        'source_url',
        'newsletter_title',
        'newsletter_summary',
        'editor_notes',
      ])
    : {};

  // Best-effort freshness upgrade: if the CMS's own rendered form still has these fields on
  // screen (which it should, since we are on this article's edit route), prefer the *live*
  // values over the last-saved ones for the editable draft fields, in case the editor has typed
  // something new but not saved yet. This can silently fail to find a control; that's fine, the
  // saved value already pre-filled the textarea above.
  const liveTitle = findFieldControlByLabelText('뉴스레터 제목');
  const liveSummary = findFieldControlByLabelText('뉴스레터 요약');
  const liveNotes = findFieldControlByLabelText('편집 메모');

  const draft = {
    newsletterTitle: liveTitle
      ? readFieldControlValue(liveTitle)
      : (savedFields.newsletter_title ?? ''),
    newsletterSummary: liveSummary
      ? readFieldControlValue(liveSummary)
      : (savedFields.newsletter_summary ?? ''),
    editorNotes: liveNotes ? readFieldControlValue(liveNotes) : (savedFields.editor_notes ?? ''),
  };

  const metadata = {
    title: savedFields.source_title ?? '',
    author: savedFields.source_author ?? '',
    publishedAt: savedFields.source_published_at ?? '',
    category: savedFields.source_category ?? '',
    url: savedFields.source_url ?? '',
  };

  const fetchError = !indexResult.ok
    ? indexResult.reason
    : !sourceResult.ok
      ? sourceResult.reason
      : null;

  renderPanel(host, {
    sourceId,
    sections: defaultSections(),
    maxChars: DEFAULT_MAX_PROMPT_CHARS,
    metadata,
    draft,
    sourceBody: sourceResult.ok ? bodyAfterFrontmatter(sourceResult.content) : '',
    fetchError,
    githubUrl: buildGithubBlobUrl({
      repo: backend.repo,
      branch: backend.branch,
      path: `${basePath}/source.md`,
    }),
  });
}

onRouteSettled(() => {
  refresh().catch((err) => {
    if (window.console) window.console.warn('[ai-prompt-copy] refresh failed', err);
  });
});
