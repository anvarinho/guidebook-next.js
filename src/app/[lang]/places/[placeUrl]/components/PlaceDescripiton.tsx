import styles from "../page.module.css";

interface Props {
  text: string | { [key: string]: string };
  highlights: string[];
  name: string;
  lang?: string;
}

// Helper function to process text
function processDescription(content: string, highlights: string[]): string {
  let html = content;

  // FIRST: Convert markdown images to HTML img tags (do this before any other processing)
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  html = html.replace(imageRegex, (match, alt, src) => {
    console.log("Found image:", { alt, src }); // Debug log
    // Clean the src URL
    let cleanSrc = src;
    if (
      !src.startsWith("http://") &&
      !src.startsWith("https://") &&
      !src.startsWith("/")
    ) {
      cleanSrc = `/${src}`;
    }
    return `<img src="${cleanSrc}" alt="${alt}" class="${styles.markdownImage}" loading="lazy" />`;
  });

  // Sort highlights by length (longest first) to avoid partial matches
  const sortedHighlights = [...highlights].sort((a, b) => b.length - a.length);

  // Apply highlights to plain text using tag protection method
  sortedHighlights.forEach((highlight) => {
    if (!highlight.trim()) return;

    // Escape special regex characters
    const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // First, temporarily protect HTML tags by replacing them with placeholders
    const tagPlaceholders: { [key: string]: string } = {};
    let tagCounter = 0;

    // Replace all HTML tags with placeholders
    let tempHtml = html.replace(/<[^>]*>/g, (match) => {
      const placeholder = `§§TAG_${tagCounter}§§`;
      tagPlaceholders[placeholder] = match;
      tagCounter++;
      return placeholder;
    });

    // Apply highlights to the text (now safe from HTML tags)
    const wordBoundaryRegex = new RegExp(
      `(?<!\\w)(${escapedHighlight})(?!\\w)`,
      "gi",
    );
    tempHtml = tempHtml.replace(
      wordBoundaryRegex,
      `<mark class="${styles.highlight}">$1</mark>`,
    );

    // Restore HTML tags
    html = tempHtml.replace(
      /§§TAG_\d+§§/g,
      (match) => tagPlaceholders[match] || match,
    );
  });

  // First, protect existing HTML tables from markdown conversion
  const tablePlaceholders: string[] = [];
  html = html.replace(/<table[\s\S]*?<\/table>/g, (match) => {
    tablePlaceholders.push(match);
    return `§§TABLE_${tablePlaceholders.length - 1}§§`;
  });

  // Convert markdown tables to HTML tables
  const markdownTableRegex = /^\|(.+)\|\n\|([-\s|]+)\|\n(\|.+\|\n?)+/gm;
  html = html.replace(markdownTableRegex, (match) => {
    const lines = match.trim().split("\n");
    const headers = lines[0]
      .split("|")
      .filter((cell) => cell.trim() !== "")
      .map((cell) => cell.trim());
    const rows = lines.slice(2).map((line) =>
      line
        .split("|")
        .filter((cell) => cell.trim() !== "")
        .map((cell) => cell.trim()),
    );

    // Single wrapper div for centering with no extra margins
    let tableHtml =
      '<div style="display: flex; justify-content: center; width: 100%;">';
    tableHtml += '<table class="' + styles.table + '">';

    // Headers
    tableHtml += "<thead><tr>";
    headers.forEach((header) => {
      tableHtml += `<th class="${styles.tableHeader}">${header}</th>`;
    });
    tableHtml += "</tr></thead>";

    // Body
    tableHtml += "<tbody>";
    rows.forEach((row) => {
      tableHtml += "<tr>";
      row.forEach((cell) => {
        tableHtml += `<td class="${styles.tableCell}">${cell}</td>`;
      });
      tableHtml += "</tr>";
    });
    tableHtml += "</tbody>";

    tableHtml += "</table></div>";

    return tableHtml;
  });

  // Convert markdown links
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  html = html.replace(linkRegex, (match, text, url) => {
    // Check if it's an internal link (no http/https)
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return `<a href="/places/${url}" class="${styles.link}">${text}</a>`;
    }
    // External link
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="${styles.link}">${text}</a>`;
  });

  // Restore protected HTML tables
  html = html.replace(/§§TABLE_(\d+)§§/g, (_, index) => {
    return tablePlaceholders[parseInt(index)];
  });

  // Process blockquotes to separate citation and author
  const blockquoteRegex = /<blockquote>([\s\S]*?)<\/blockquote>/g;
  html = html.replace(blockquoteRegex, (match, content) => {
    // Split by lines
    const lines = content
      .split("\n")
      .filter((line: string) => line.trim() !== "");

    if (lines.length >= 2) {
      // First line is the citation, last line is the author
      const citation = lines[0].trim();
      const author = lines[lines.length - 1].trim();

      // Check if author contains a dash (—) for formatting
      const authorFormatted = author.includes("—")
        ? author.replace(
            "—",
            '<span class="' + styles.authorDash + '">—</span>',
          )
        : author;

      return `
        <blockquote class="${styles.testimonial}">
          <div class="${styles.citation}">${citation}</div>
          <div class="${styles.author}">${authorFormatted}</div>
        </blockquote>
      `;
    }

    // If only one line, return as is
    return match;
  });

  // Convert markdown syntax to HTML (using native HTML elements)
  html = html
    // Headers - convert h1 to h2
    .replace(/^# (.*$)/gm, `<h2>$1</h2>`)
    .replace(/^## (.*$)/gm, `<h3>$1</h3>`)
    .replace(/^### (.*$)/gm, `<h4>$1</h4>`)
    .replace(/^#### (.*$)/gm, `<h5>$1</h5>`)

    // Bold and italic - using native HTML
    .replace(/\*\*\*(.*?)\*\*\*/g, `<strong><em>$1</em></strong>`)
    .replace(/___(.*?)___/g, `<strong><em>$1</em></strong>`)
    .replace(/\*\*(.*?)\*\*/g, `<strong>$1</strong>`)
    .replace(/__(.*?)__/g, `<strong>$1</strong>`)
    .replace(/\*(.*?)\*/g, `<em>$1</em>`)
    .replace(/_(.*?)_/g, `<em>$1</em>`)

    // Horizontal rule
    .replace(/^---$/gm, `<hr />`)

    // Blockquotes (already processed above, but keep for single-line quotes)
    .replace(/^> (.*$)/gm, `<blockquote>$1</blockquote>`)

    // List items - handle emoji lists specially
    .replace(/^\* (.*$)/gm, (match, content) => {
      // Check if content starts with an emoji
      const emojiMatch = content.match(
        /^([\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}])\s*(.*)$/u,
      );
      if (emojiMatch) {
        const [_, emoji, text] = emojiMatch;
        return `<div class="${styles.emojiItem}"><span class="${styles.emoji}">${emoji}</span> ${text}</div>`;
      }
      return `<div class="${styles.listItem}">${content}</div>`;
    })
    .replace(/^- (.*$)/gm, (match, content) => {
      const emojiMatch = content.match(
        /^([\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}])\s*(.*)$/u,
      );
      if (emojiMatch) {
        const [_, emoji, text] = emojiMatch;
        return `<div class="${styles.emojiItem}"><span class="${styles.emoji}">${emoji}</span> ${text}</div>`;
      }
      return `<div class="${styles.listItem}">${content}</div>`;
    })

    // Paragraphs - wrap remaining text
    .replace(
      /^(?!<h2|<h3|<h4|<h5|<blockquote|<div|<hr|<p|<table|<a|<img).+$/gm,
      (match) => {
        if (!match.trim() || match.startsWith("<")) return match;
        return `<p>${match}</p>`;
      },
    );

  return html;
}

export default function PlaceDescription({
  text,
  highlights = [],
  name,
  lang = "en",
}: Props) {
  // Extract the text if it's an object (handles multilingual)
  const content =
    typeof text === "string"
      ? text
      : text[lang] || text.en || Object.values(text)[0] || "";

  console.log("Original content:", content.substring(0, 200)); // Debug log
  const processedHtml = processDescription(content, highlights);
  console.log("Processed HTML:", processedHtml.substring(0, 200)); // Debug log

  return (
    <div
      className={styles.container}
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
}
