/* global window */
/**
 * Task A: "원문 변경" badge + read-only source panel, injected into the Sveltia CMS admin page.
 *
 * Loaded from public/admin/index.html as `<script type="module" src="/admin/extensions/source-tools.js">`.
 *
 * WHAT IS FULLY WIRED (real, working code):
 *   - Detecting which article entry is open, from the `#/collections/articles/entries/<id>` hash
 *     route (the same hash-routing convention Netlify/Decap CMS uses; Sveltia CMS aims for
 *     config/workflow compatibility with it, but this exact route shape was not re-verified
 *     against a live, deployed instance from this sandboxed session - see README.md).
 *   - Fetching the sibling `source.md` and `metadata.json` (and the article's own `index.md`)
 *     for that article at the configured repo/branch via the GitHub Contents API and rendering
 *     the source read-only in a floating panel.
 *   - Computing the "원문 변경" badge by comparing `metadata.json`'s `content_sha256` against
 *     the article's own committed `last_reviewed_content_sha256` frontmatter field (added to
 *     public/admin/config.yml as an editor-facing string field; also present in
 *     packages/shared/src/schemas/article.ts). Both values are read from GitHub, not the DOM, so
 *     this comparison does not depend on Sveltia's internal markup at all.
 *   - Writing `last_reviewed_content_sha256` back onto the entry via the **documented** Sveltia
 *     CMS JavaScript API, `CMS.registerEventListener({ name: 'preSave', handler })`
 *     (https://sveltiacms.app/en/docs/api/events, checked 2026-07-28) - not a DOM hack. The
 *     handler only applies the change when the editor has explicitly clicked "원문 확인
 *     완료로 표시" in this panel for the entry currently being saved; it still requires the
 *     editor to press Sveltia's own Save button, same as any other field edit.
 *   - Falling back to a "GitHub에서 보기" link when content can't be fetched (private repo + no
 *     discoverable auth token, offline, rate-limited, etc).
 *
 * WHAT IS BEST-EFFORT / UNVERIFIED (documented in detail in README.md):
 *   - Reading the CMS's own GitHub OAuth token from the browser so the Contents API call is
 *     authenticated against the private repo (see github-contents.js#discoverCmsAuthToken).
 *   - The exact shape of the `entry` Immutable Map passed to the `preSave` handler, and the
 *     exact convention for "no change" (this file assumes returning the entry's `data`
 *     unmodified, per https://sveltiacms.app/en/docs/api/events's documented example, but that
 *     could not be exercised against a live, authenticated Sveltia CMS instance from this
 *     environment - no browser + no deployed OAuth Worker were available here). Verify this
 *     against a real save the first time this ships.
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
  ensurePanelHost,
  waitForGlobal,
} from './dom-helpers.js';

const PANEL_HOST_ID = 'swebin-source-tools-panel-host';
const REVIEWED_FIELD_NAME = 'last_reviewed_content_sha256';

/** Set by the panel's "mark reviewed" button, consumed (and cleared) by the preSave hook below. */
let pendingReviewConfirmation = null;

async function registerPreSaveHook() {
  const hasCms = await waitForGlobal(
    () =>
      typeof window.CMS !== 'undefined' && typeof window.CMS.registerEventListener === 'function',
  );
  if (!hasCms) {
    if (window.console) {
      window.console.warn(
        '[source-tools] window.CMS.registerEventListener not found; "mark reviewed" writeback is disabled.',
      );
    }
    return;
  }

  window.CMS.registerEventListener({
    name: 'preSave',
    handler: ({ entry }) => {
      if (!pendingReviewConfirmation) return undefined; // no pending confirmation -> no change
      try {
        const collection =
          typeof entry.get === 'function' ? entry.get('collection') : entry.collection;
        const slug = typeof entry.get === 'function' ? entry.get('slug') : entry.slug;
        if (collection !== 'articles' || slug !== pendingReviewConfirmation.slug) {
          return undefined; // a different entry is being saved; do not touch it
        }
        const sha256 = pendingReviewConfirmation.sha256;
        pendingReviewConfirmation = null;
        const data = typeof entry.get === 'function' ? entry.get('data') : entry.data;
        if (data && typeof data.set === 'function') {
          return data.set(REVIEWED_FIELD_NAME, sha256);
        }
        // Fallback shape in case `data` is a plain object rather than an Immutable Map.
        return { ...data, [REVIEWED_FIELD_NAME]: sha256 };
      } catch (err) {
        if (window.console) {
          window.console.warn('[source-tools] preSave hook failed, entry left unchanged', err);
        }
        return undefined;
      }
    },
  });
}

function renderPanel(host, state) {
  if (!host.shadowRoot) {
    host.attachShadow({ mode: 'open' });
  }
  const root = host.shadowRoot;

  const style = `
    :host { all: initial; }
    .panel {
      position: fixed; right: 16px; bottom: 16px; z-index: 999999;
      width: 360px; max-height: 70vh; overflow-y: auto;
      background: #1f2430; color: #eef1f6; border-radius: 10px;
      box-shadow: 0 6px 24px rgba(0,0,0,.35); font: 13px/1.5 -apple-system, system-ui, sans-serif;
      padding: 12px 14px;
    }
    .panel h3 { margin: 0 0 8px; font-size: 13px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 12px; margin-bottom: 8px; }
    .badge.changed { background: #5c2b2b; color: #ffd1d1; }
    .badge.ok { background: #234a2b; color: #c9f7cf; }
    .badge.unknown { background: #444; color: #ddd; }
    pre { white-space: pre-wrap; word-break: break-word; background: #14171f; padding: 8px; border-radius: 6px; max-height: 240px; overflow: auto; }
    button { cursor: pointer; border: none; border-radius: 6px; padding: 6px 10px; font-size: 12px; margin-right: 6px; }
    .primary { background: #4c7cf0; color: white; }
    .primary:disabled { background: #3a3f4d; color: #8a90a0; cursor: not-allowed; }
    a.link { color: #9cc0ff; }
    .muted { color: #9aa2b1; font-size: 12px; }
    .row { margin-bottom: 8px; }
  `;

  const badgeClass =
    state.badge === 'changed' ? 'changed' : state.badge === 'ok' ? 'ok' : 'unknown';
  const badgeText =
    state.badge === 'changed'
      ? '원문 변경됨 - 재확인 필요'
      : state.badge === 'ok'
        ? '원문 확인 완료 (최신)'
        : '원문 변경 여부 확인 불가';

  root.innerHTML = `
    <style>${style}</style>
    <div class="panel">
      <h3>원문 도구 - ${state.sourceId}</h3>
      <div class="row"><span class="badge ${badgeClass}">${badgeText}</span></div>
      ${
        state.fetchError
          ? `<div class="row muted">원문을 자동으로 불러오지 못했습니다 (${escapeHtml(state.fetchError)}).<br/>` +
            `<a class="link" href="${state.githubUrl}" target="_blank" rel="noopener noreferrer">GitHub에서 원문 보기</a></div>`
          : `<div class="row"><strong>원문 전체 보기 (읽기 전용)</strong><pre>${escapeHtml(state.sourceBody || '(비어 있음)')}</pre></div>`
      }
      <div class="row">
        <button class="primary" id="mark-reviewed" ${state.contentSha256 ? '' : 'disabled'}>원문 확인 완료로 표시</button>
      </div>
      <div class="row muted" id="mark-reviewed-status"></div>
      <div class="row muted">
        지금 누르면 다음 저장(Save) 시점에 "${REVIEWED_FIELD_NAME}" 필드에 자동으로 기록됩니다.
        저장을 누르기 전까지는 아무것도 Git에 반영되지 않습니다.
      </div>
    </div>
  `;

  const button = root.getElementById('mark-reviewed');
  const status = root.getElementById('mark-reviewed-status');
  button.addEventListener('click', () => {
    if (!state.contentSha256) {
      status.textContent = 'metadata.json을 불러오지 못해 해시를 알 수 없습니다.';
      return;
    }
    pendingReviewConfirmation = { slug: state.sourceId, sha256: state.contentSha256 };
    status.textContent = '표시가 예약되었습니다. 화면 상단의 저장(Save) 버튼을 눌러 반영하세요.';
  });
}

function escapeHtml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
      badge: 'unknown',
      fetchError: `config.yml 읽기 실패: ${err && err.message}`,
      githubUrl: '#',
    });
    return;
  }

  const token = discoverCmsAuthToken();
  const basePath = `content/articles/${sourceId}`;

  const [sourceResult, metadataResult, indexResult] = await Promise.all([
    fetchRepoFile({
      repo: backend.repo,
      branch: backend.branch,
      path: `${basePath}/source.md`,
      token,
    }),
    fetchRepoFile({
      repo: backend.repo,
      branch: backend.branch,
      path: `${basePath}/metadata.json`,
      token,
    }),
    fetchRepoFile({
      repo: backend.repo,
      branch: backend.branch,
      path: `${basePath}/index.md`,
      token,
    }),
  ]);

  const githubUrl = buildGithubBlobUrl({
    repo: backend.repo,
    branch: backend.branch,
    path: `${basePath}/source.md`,
  });

  if (!sourceResult.ok || !metadataResult.ok || !indexResult.ok) {
    const reason = !sourceResult.ok
      ? sourceResult.reason
      : !metadataResult.ok
        ? metadataResult.reason
        : indexResult.reason;
    renderPanel(host, { sourceId, badge: 'unknown', fetchError: reason, githubUrl });
    return;
  }

  let metadata;
  try {
    metadata = JSON.parse(metadataResult.content);
  } catch {
    renderPanel(host, {
      sourceId,
      badge: 'unknown',
      fetchError: 'metadata.json 파싱 실패',
      githubUrl,
    });
    return;
  }

  const contentSha256 = metadata.content_sha256;
  const frontmatterMatch = /^---\n([\s\S]*?)\n---/.exec(indexResult.content || '');
  const block = frontmatterMatch ? frontmatterMatch[1] : '';
  const reviewedMatch = new RegExp(`^${REVIEWED_FIELD_NAME}:\\s*"?(.*?)"?\\s*$`, 'm').exec(block);
  const lastReviewed = reviewedMatch ? reviewedMatch[1] : '';

  const badge = !contentSha256 ? 'unknown' : lastReviewed === contentSha256 ? 'ok' : 'changed';

  renderPanel(host, {
    sourceId,
    badge,
    sourceBody: sourceResult.content,
    contentSha256,
    githubUrl,
  });
}

registerPreSaveHook();
onRouteSettled(() => {
  refresh().catch((err) => {
    // Never let a panel-refresh failure break the rest of the CMS page.
    if (window.console) window.console.warn('[source-tools] refresh failed', err);
  });
});
