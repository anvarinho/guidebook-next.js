import styles from "./page.module.css";

interface TourDescriptionProps {
  description: string;
  lang?: string;
}

export default function TourDescription({
  description,
  lang = "en",
}: TourDescriptionProps) {
  // Process the description text to add basic formatting
  let html = description;

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

    let tableHtml = '<table class="' + styles.table + '">';

    // Headers
    tableHtml += "<thead><tr>";
    headers.forEach((header) => {
      tableHtml += `<th>${header}</th>`;
    });
    tableHtml += "</tr></thead>";

    // Body
    tableHtml += "<tbody>";
    rows.forEach((row) => {
      tableHtml += "<tr>";
      row.forEach((cell) => {
        tableHtml += `<td>${cell}</td>`;
      });
      tableHtml += "</tr>";
    });
    tableHtml += "</tbody>";

    tableHtml += "</table>";

    return tableHtml;
  });

  // Convert markdown links
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  html = html.replace(linkRegex, (match, text, url) => {
    // Check if it's an internal link (no http/https)
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return `<a href="/${lang}/places/${url}" class="${styles.link}">${text}</a>`;
    }
    // External link
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="${styles.link}">${text}</a>`;
  });

  // Convert URLs to clickable links (if not already linked)
  html = html.replace(
    /(?<!href=")(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="' +
      styles.link +
      '">$1</a>',
  );

  // Convert **text** to bold
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Convert *text* to italic
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Convert horizontal rules
  html = html.replace(/^---$/gm, "<hr />");

  // Convert headings
  html = html
    .replace(/^# (.*$)/gm, "<h2>$1</h2>")
    .replace(/^## (.*$)/gm, "<h3>$1</h3>")
    .replace(/^### (.*$)/gm, "<h4>$1</h4>")
    .replace(/^#### (.*$)/gm, "<h5>$1</h5>");

  // Convert bullet points with emojis
  html = html.replace(/^\* (.*$)/gm, (match, content) => {
    const emojiMatch = content.match(
      /^([\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}])\s*(.*)$/u,
    );
    if (emojiMatch) {
      const [_, emoji, text] = emojiMatch;
      return `<div class="${styles.emojiItem}"><span class="${styles.emoji}">${emoji}</span> ${text}</div>`;
    }
    return `<div class="${styles.listItem}">${content}</div>`;
  });

  html = html.replace(/^- (.*$)/gm, (match, content) => {
    const emojiMatch = content.match(
      /^([\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}])\s*(.*)$/u,
    );
    if (emojiMatch) {
      const [_, emoji, text] = emojiMatch;
      return `<div class="${styles.emojiItem}"><span class="${styles.emoji}">${emoji}</span> ${text}</div>`;
    }
    return `<div class="${styles.listItem}">${content}</div>`;
  });

  // Convert blockquotes
  html = html.replace(/^> (.*$)/gm, "<blockquote>$1</blockquote>");

  // Wrap paragraphs - but skip already wrapped content
  const lines = html.split("\n");
  let inBlock = false;
  let processedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) {
      processedLines.push("");
      continue;
    }

    // Skip if already wrapped in HTML tags
    if (
      line.startsWith("<h2") ||
      line.startsWith("<h3") ||
      line.startsWith("<h4") ||
      line.startsWith("<h5") ||
      line.startsWith("<table") ||
      line.startsWith("<blockquote") ||
      line.startsWith("<div") ||
      line.startsWith("<hr") ||
      line.startsWith("<ul") ||
      line.startsWith("<ol") ||
      line.startsWith("<li")
    ) {
      processedLines.push(line);
      continue;
    }

    // Check if it's a list item
    if (
      line.startsWith('<div class="' + styles.emojiItem) ||
      line.startsWith('<div class="' + styles.listItem)
    ) {
      processedLines.push(line);
      continue;
    }

    // Regular paragraph
    processedLines.push(`<p>${line}</p>`);
  }

  html = processedLines.join("\n");

  return (
    <div
      className={styles.tourContainer}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
