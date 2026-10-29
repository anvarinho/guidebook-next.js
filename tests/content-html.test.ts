import test from 'node:test';
import assert from 'node:assert/strict';
import { renderContentHtml } from '../src/lib/contentHtml.server';
import { safeJsonLd } from '../src/lib/seo';

const classes = { table: 'table_hash', tableScroll: 'scroll_hash', link: 'link_hash', markdownImage: 'image_hash', highlight: 'highlight_hash', listItem: 'list_hash', emojiItem: 'emoji_item_hash', emoji: 'emoji_hash' };
test('stored HTML, malformed attributes and unsafe schemes cannot execute', () => {
  const html = renderContentHtml(`<script>alert(1)</script><style>body{display:none}</style><iframe srcdoc='<script>bad()</script>'></iframe><svg onload=alert(1)><a href="javascript:alert(1)">bad</a></svg>
<img src="x" onerror="alert(1)" style="background:url(javascript:alert(1))"><a href="jav&#x61;script:alert(1)" onclick="evil()">bad</a>
[bad](javascript:alert%281%29) ![x\" onerror=\"alert(1)](/photo.jpg)
<a href="data:text/html,bad">data</a><form><input autofocus onfocus=evil()></form>`, { lang: 'ru', classes });
  assert.doesNotMatch(html, /<\/?(?:script|style|iframe|svg|form|input)\b|href="(?:javascript|data):/i);
  // Inspect attribute boundaries, not escaped payload text within alt values.
  for (const tag of html.match(/<[^>]+>/g) || []) {
    const withoutQuotedValues = tag.replace(/"[^"]*"|'[^']*'/g, '""');
    assert.doesNotMatch(withoutQuotedValues, /\s(?:on\w+|style)=/i);
  }
  assert.match(html, /&quot;/);
});
test('Markdown formatting, images, table classes, highlights and localized URLs survive', () => {
  const html = renderContentHtml('# Heading\n\n**Bold** and *italic* Kyrgyzstan\n\n- 🏔 Mountain\n\n| Name | Value |\n| --- | --- |\n| One | Two |\n\n[Lake](places/son-kol?x=1&y=2) [web](https://example.com/a_b) ![Lake](/images/lake_view.jpg)\n\n> Quote', { lang: 'ru', classes, highlights: ['Kyrgyzstan'] });
  for (const value of ['<h2>Heading</h2>', '<strong>Bold</strong>', '<em>italic</em>', 'table_hash', 'scroll_hash', 'highlight_hash', 'emoji_item_hash', '/ru/places/son-kol?x=1&amp;y=2', 'https://example.com/a_b', 'rel="noopener noreferrer"', '/images/lake_view.jpg', '<blockquote>']) assert.ok(html.includes(value), value);
});
test('JSON-LD preserves data but never emits an HTML script terminator', () => {
  const data = { text: '</script><script>alert(1)</script>' };
  assert.doesNotMatch(safeJsonLd(data), /</);
  assert.deepEqual(JSON.parse(safeJsonLd(data)), data);
});

test('legacy testimonial and heading styling survives without trusting inline styles', () => {
  const html = renderContentHtml('## Section\n\n<blockquote>Wonderful trip\n— Visitor</blockquote>', { classes: { testimonial: 'quote_hash', citation: 'citation_hash', author: 'author_hash', authorDash: 'dash_hash' } });
  for (const value of ['<h3>Section</h3>', 'quote_hash', 'citation_hash', 'author_hash', 'dash_hash']) assert.ok(html.includes(value), value);
});

test('safe protocol-relative links and images retain their destinations', () => {
  const html = renderContentHtml('[Visit](//example.com/path) ![View](//example.com/view.jpg)');
  assert.match(html, /href="https:\/\/example.com\/path"/);
  assert.match(html, /src="https:\/\/example.com\/view.jpg"/);
});

test('Markdown bullets retain custom styling without decorating ordered or raw HTML lists', () => {
  const html = renderContentHtml('- First\n- Second\n\n1. Ordered\n2. Another\n\n<ul><li>Raw list</li></ul>', { classes: { listItem: 'bullet_hash', markdownList: 'markdown_list_hash' } });
  assert.match(html, /<ul class="markdown_list_hash">/);
  assert.match(html, /<li class="bullet_hash">First/);
  assert.match(html, /<ol>\s*<li>Ordered/);
  assert.match(html, /<ul><li>Raw list<\/li><\/ul>/);
});
