// Replaces Next's built-in polyfill-module for the browsers in Next's default
// targets (Chrome/Edge/Firefox 111+, Safari 16.4+). Only URL.canParse is missing there (Safari < 17).
if (typeof URL !== 'undefined' && !('canParse' in URL)) {
  URL.canParse = function (url, base) {
    try { new URL(url, base); return true; } catch { return false; }
  };
}
