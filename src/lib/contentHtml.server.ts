// Server rendering only: import from Server Components, never the client HTML sink.
import { Marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { localizedContentHref } from './links';

interface ContentOptions {
  lang?: string;
  classes?: Record<string, string>;
  highlights?: string[];
}

const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** Parse Markdown (including legacy HTML), then enforce the content HTML allowlist.
 * Attribute values are serialized by sanitize-html, never interpolated from content.
 */
export function renderContentHtml(content: string, { lang = 'en', classes = {}, highlights = [] }: ContentOptions = {}): string {
  const addClass = (attributes: Record<string, string>, name: string) => ({
    ...attributes, ...(classes[name] ? { class: classes[name] } : {}),
  });
  const options: sanitizeHtml.IOptions = {
    allowedTags: ['p', 'br', 'hr', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b', 'em', 'i', 'u', 's', 'del', 'blockquote', 'div', 'span', 'mark', 'ul', 'ol', 'li', 'pre', 'code', 'a', 'img', 'table', 'caption', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'sup', 'sub'],
    allowedAttributes: {
      '*': ['class'], a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      th: ['colspan', 'rowspan', 'scope', 'align'], td: ['colspan', 'rowspan', 'align'], ol: ['start'],
    },
    allowedClasses: { '*': Object.values(classes).flatMap(value => value.split(/\s+/)).filter(Boolean) },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    allowProtocolRelative: false,
    transformTags: {
      h1: 'h2',
      a: (tagName, attributes) => {
        const reference = attributes.href?.trim() || '';
        const href = reference.startsWith('//') ? `https:${reference}` : reference;
        const external = /^https?:\/\//i.test(href);
        // Do not turn a dangerous scheme into a local URL. The sanitizer removes it.
        const special = /^(?:[a-z][a-z\d+.-]*:|[\\/]{2}|#)/i.test(href);
        const localized = href && !special ? localizedContentHref(href, lang) : href;
        return { tagName, attribs: addClass({ ...attributes, href: localized, ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : { target: '', rel: '' }) }, 'link') };
      },
      img: (tagName, attributes) => {
        const reference = attributes.src || '';
        const src = reference.startsWith('//') ? `https:${reference}` : reference;
        const normalized = src && !/^(?:[a-z][a-z\d+.-]*:|[\\/])/i.test(src) ? `/${src}` : src;
        return { tagName, attribs: addClass({ ...attributes, src: normalized, loading: 'lazy' }, 'markdownImage') };
      },
      table: (tagName, attributes) => ({ tagName, attribs: addClass(attributes, 'table') }),

    },
  };
  const parser = new Marked({ gfm: true, breaks: true, renderer: {
    heading({ depth, tokens }) {
      const level = Math.min(depth + 1, 6);
      return `<h${level}>${this.parser.parseInline(tokens)}</h${level}>\n`;
    },
    list({ ordered, start, items }) {
      const tag = ordered ? 'ol' : 'ul';
      const className = !ordered && classes.markdownList ? ` class="${escapeHtml(classes.markdownList)}"` : '';
      const startAttribute = ordered && start !== 1 ? ` start="${Number(start)}"` : '';
      const content = items.map(item => {
        const html = this.listitem(item);
        return !ordered && classes.listItem ? html.replace(/^<li>/, `<li class="${escapeHtml(classes.listItem)}">`) : html;
      }).join('');
      return `<${tag}${className}${startAttribute}>${content}</${tag}>\n`;
    },
  } });
  let html = sanitizeHtml(parser.parse(content, { async: false }), options);
  // These decorations operate only on already sanitized text/tags. Escape trusted
  // class values too; run the allowlist once more after decorating as defense in depth.
  if (classes.tableScroll) html = html.replace(/<table\b[\s\S]*?<\/table>/g, table => `<div class="${escapeHtml(classes.tableScroll)}">${table}</div>`);
  if (classes.emojiItem) html = html.replace(/<li\b[^>]*>([\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}]\uFE0F?)\s*/gu, (_, emoji: string) => `<li class="${escapeHtml(classes.emojiItem)}"><span class="${escapeHtml(classes.emoji || '')}">${emoji}</span> `);
  if (classes.testimonial) html = html.replace(/<blockquote>([\s\S]*?)<\/blockquote>/g, (quote, body: string) => {
    const lines = body.split('\n').map(line => line.trim()).filter(Boolean);
    if (lines.length < 2) return quote;
    const author = lines.pop()!.replace('—', `<span class="${escapeHtml(classes.authorDash || '')}">—</span>`);
    return `<blockquote class="${escapeHtml(classes.testimonial)}"><div class="${escapeHtml(classes.citation || '')}">${lines.join('<br />')}</div><div class="${escapeHtml(classes.author || '')}">${author}</div></blockquote>`;
  });
  const terms = [...new Set(highlights.filter(value => value.trim()))].sort((a, b) => b.length - a.length);
  if (terms.length) {
    const matcher = new RegExp(`(?<![\\p{L}\\p{N}_])(${terms.map(term => escapeHtml(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?![\\p{L}\\p{N}_])`, 'giu');
    // HTML tags and entities are opaque: never highlight inside attributes/entities.
    html = html.split(/(<[^>]*>|&(?:#\d+|#x[\da-f]+|\w+);)/gi).map((part, index) => index % 2 ? part : part.replace(matcher, text => `<mark class="${escapeHtml(classes.highlight || '')}">${text}</mark>`)).join('');
  }
  // Link localization must run only once (slugs can contain percent escapes).
  return sanitizeHtml(html, { ...options, transformTags: {} });
}
