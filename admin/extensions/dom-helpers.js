/* global window, document, MutationObserver */
/**
 * Small DOM utilities shared by the Sveltia CMS admin extensions.
 *
 * Sveltia CMS *does* document a real JavaScript extension API when loaded via the UNPKG CDN
 * script tag (a global `CMS` object with `registerEventListener`, `registerEditorComponent`,
 * `registerFieldType`/`registerWidget`, etc - see https://sveltiacms.app/en/docs/api and
 * https://sveltiacms.app/en/docs/api/events, checked 2026-07-28). source-tools.js uses that real
 * `CMS.registerEventListener({ name: 'preSave', ... })` hook for writing the review-hash field
 * (see waitForGlobal() below), which is NOT a best-effort DOM hack.
 *
 * `registerFieldType`/`registerWidget` (a genuine, documented way to render fully custom UI
 * *inside* the entry form, which would have been the ideal way to build these panels) requires
 * the control/preview components to be React class components. There is no React (or any
 * bundler/JSX toolchain) available to this static `/admin/` page, so that route was not
 * practically usable here - this is the "if those aren't practically wireable without a bundler"
 * case the task anticipated. `findFieldControlByLabelText`/`readFieldControlValue` below are the
 * fallback for that specific gap (used by ai-prompt-copy.js to *read* a best-effort snapshot of
 * unsaved draft field text): they work by inspecting the *rendered* page DOM from the outside,
 * which is not a stable contract - a future Sveltia CMS release can change its markup and
 * silently break this. Each function documents its own fallback behavior; nothing here throws on
 * failure, and nothing here fakes success when it did not actually happen.
 */

/** Polls until `predicate()` returns truthy, or gives up after `timeoutMs`. Never throws. */
export function waitForGlobal(predicate, { timeoutMs = 8000, intervalMs = 100 } = {}) {
  return new Promise((resolve) => {
    const start = Date.now();
    const tick = () => {
      let ok = false;
      try {
        ok = Boolean(predicate());
      } catch {
        ok = false;
      }
      if (ok) {
        resolve(true);
        return;
      }
      if (Date.now() - start >= timeoutMs) {
        resolve(false);
        return;
      }
      window.setTimeout(tick, intervalMs);
    };
    tick();
  });
}

/** Parses `#/collections/<name>/entries/<slug>` out of the current hash-based CMS route. */
export function getCurrentEntryRoute() {
  const hash = window.location.hash || '';
  const match = /^#\/collections\/([^/]+)\/entries\/([^/?]+)/.exec(hash);
  if (!match) return null;
  return { collection: decodeURIComponent(match[1]), slug: decodeURIComponent(match[2]) };
}

/**
 * Re-invokes `callback` whenever the hash route changes and once the DOM appears to have
 * settled after each change (Sveltia re-renders the entry editor asynchronously). This is a
 * best-effort substitute for a real "entry opened" lifecycle event, which Sveltia does not
 * expose to third-party code.
 */
export function onRouteSettled(callback) {
  let debounceTimer = null;
  const schedule = () => {
    if (debounceTimer) window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(callback, 300);
  };
  window.addEventListener('hashchange', schedule);
  const observer = new MutationObserver(schedule);
  observer.observe(document.body, { childList: true, subtree: true });
  schedule();
  return () => {
    window.removeEventListener('hashchange', schedule);
    observer.disconnect();
    if (debounceTimer) window.clearTimeout(debounceTimer);
  };
}

/**
 * BEST-EFFORT: finds a rendered form control (input/textarea) whose nearby label text contains
 * `labelSubstring`. Sveltia's actual field markup/attributes were not verifiable from this
 * environment; this walks up from any element containing the label text to the nearest
 * reasonable ancestor and looks for one control inside it. Returns null if nothing matches -
 * callers must treat that as "could not read/write this field automatically" and fall back to
 * asking the editor to do it manually, not as an error to hide.
 */
export function findFieldControlByLabelText(labelSubstring) {
  const all = document.querySelectorAll('label, [class*="label" i]');
  for (const el of all) {
    const text = (el.textContent || '').trim();
    if (!text || !text.includes(labelSubstring)) continue;
    const container = el.closest('div, section, fieldset') || el.parentElement;
    if (!container) continue;
    const control = container.querySelector('input, textarea');
    if (control) return control;
  }
  return null;
}

/** Reads the current value of a rendered input/textarea, or '' if the control is missing. */
export function readFieldControlValue(control) {
  return control && typeof control.value === 'string' ? control.value : '';
}

/**
 * Ensures a single host element (used as a Shadow DOM mount point for a floating panel) exists
 * under `document.body`, re-creating it if something removed it (defensive against a CMS
 * re-render that clears `document.body`'s children).
 */
export function ensurePanelHost(id) {
  let host = document.getElementById(id);
  if (!host) {
    host = document.createElement('div');
    host.id = id;
    document.body.appendChild(host);
  } else if (!document.body.contains(host)) {
    document.body.appendChild(host);
  }
  return host;
}
