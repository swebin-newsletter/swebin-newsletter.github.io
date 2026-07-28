/* global fetch, localStorage, atob, TextDecoder */
/**
 * Shared helper for reading files out of the private `swebin-dev/swebin-newsletter` GitHub repo
 * from inside the Sveltia CMS admin page, via the GitHub REST "contents" API.
 *
 * WORKING, fully wired: `fetchRepoFile()` and `buildGithubBlobUrl()` are plain `fetch()`/URL
 * logic against GitHub's public REST API and do not depend on any Sveltia-internal API.
 *
 * BEST-EFFORT / STUB: `discoverCmsAuthToken()`. Sveltia CMS keeps the user's GitHub OAuth token
 * somewhere in the browser (localStorage/IndexedDB) so it can call the GitHub API on the
 * editor's behalf, but its exact storage key/format is an internal implementation detail that
 * is not documented as a stable public API and could not be verified against a live, logged-in
 * instance from this environment (no browser + no OAuth Worker deployed yet). This function
 * therefore only *tries* a short list of plausible localStorage keys and returns null if none of
 * them look like a token. When no token is found, every caller in this extensions/ folder
 * degrades gracefully to an unauthenticated API call (works only while the repo is public) and,
 * failing that, to a plain "open on GitHub" link the editor can click while already signed in to
 * github.com in their browser. See README.md "What is and isn't wired up" for details.
 */

/** Parsed from public/admin/config.yml at runtime so the repo/branch stay in one place. */
export async function getBackendConfig() {
  const res = await fetch('/admin/config.yml', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`could not load /admin/config.yml (${res.status})`);
  }
  const text = await res.text();
  // Deliberately not a full YAML parser (no bundler/npm dependency available to this static
  // page) - just pulls the two scalar values we need out of the `backend:` block.
  const repoMatch = /^\s*repo:\s*(\S+)\s*$/m.exec(text);
  const branchMatch = /^\s*branch:\s*(\S+)\s*$/m.exec(text);
  if (!repoMatch || !branchMatch) {
    throw new Error('could not find backend.repo/backend.branch in config.yml');
  }
  return { repo: repoMatch[1], branch: branchMatch[1] };
}

/**
 * STUB / best-effort: scans a short list of plausible localStorage keys for something that looks
 * like a GitHub token. Sveltia CMS's real storage key is not verified here (see file header).
 * Returns null (never throws) when nothing usable is found, so callers can degrade gracefully.
 */
export function discoverCmsAuthToken() {
  const candidateKeys = [
    'sveltia-cms.user',
    'sveltia-cms-user',
    'netlify-cms-user',
    'decap-cms-user',
  ];
  for (const key of candidateKeys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const token = parsed && (parsed.token || (parsed.backendName && parsed.token));
      if (typeof token === 'string' && token.length > 0) {
        return token;
      }
    } catch {
      // Not JSON, or not shaped as expected - ignore and try the next candidate key.
    }
  }
  return null;
}

/**
 * Fetches a single file's text content from the GitHub contents API at `path` (repo-relative),
 * at `ref` (branch/sha). Uses `token` (via discoverCmsAuthToken()) when available so it also
 * works against the private source repo; otherwise makes an unauthenticated request, which only
 * succeeds for public repos.
 *
 * Returns `{ ok: true, content, sha }` or `{ ok: false, status, reason }`. Never throws for
 * ordinary HTTP failures (404/403/etc.) - only for genuine network errors.
 */
export async function fetchRepoFile({ repo, branch, path, token }) {
  const apiUrl = `https://api.github.com/repos/${repo}/contents/${encodeGithubPath(path)}?ref=${encodeURIComponent(branch)}`;
  const headers = {
    accept: 'application/vnd.github+json',
  };
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(apiUrl, { headers, cache: 'no-store' });
  } catch (err) {
    return { ok: false, status: 0, reason: `network error: ${err && err.message}` };
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      reason: `github api responded ${response.status}`,
    };
  }

  const data = await response.json();
  if (!data || typeof data.content !== 'string') {
    return {
      ok: false,
      status: response.status,
      reason: 'unexpected response shape from github api',
    };
  }

  return {
    ok: true,
    sha: data.sha,
    content: decodeBase64Utf8(data.content),
  };
}

function encodeGithubPath(path) {
  return path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

/** GitHub's contents API returns base64 (with embedded newlines); decode as UTF-8 text. */
function decodeBase64Utf8(base64) {
  const binary = atob(base64.replace(/\n/g, ''));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
}

/** A plain "view on GitHub" link as the final, always-working fallback. */
export function buildGithubBlobUrl({ repo, branch, path }) {
  return `https://github.com/${repo}/blob/${branch}/${path}`;
}
