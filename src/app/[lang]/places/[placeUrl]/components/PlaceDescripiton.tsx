import styles from "./PlaceDescription.module.css";

interface Props {
  text: string | { [key: string]: string };
  highlights: string[];
  name: string;
  lang?: string;
}

// Helper function to process text
function processDescription(content: string, highlights: string[]): string {
  let html = content;

  // Sort highlights by length (longest first) to avoid partial matches
  const sortedHighlights = [...highlights].sort((a, b) => b.length - a.length);

  // Apply highlights to plain text
  sortedHighlights.forEach((highlight) => {
    if (!highlight.trim()) return;

    // Escape special regex characters
    const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Create pattern that matches the highlight as a whole word
    const regex = new RegExp(`(?<!\\w)(${escapedHighlight})(?!\\w)`, "gi");

    // Replace with mark that has highlight class
    html = html.replace(regex, `<mark class="${styles.highlight}">$1</mark>`);
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

    // Blockquotes
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
    .replace(/^(?!<h2|<h3|<h4|<h5|<blockquote|<div|<hr).+$/gm, (match) => {
      if (!match.trim() || match.startsWith("<")) return match;
      return `<p>${match}</p>`;
    });

  return html;
}

export default function PlaceDescription({
  text,
  highlights,
  name,
  lang = "en",
}: Props) {
  // Extract the text if it's an object (handles multilingual)
  const content =
    typeof text === "string"
      ? text
      : text[lang] || text.en || Object.values(text)[0] || "";

  const processedHtml = processDescription(content, highlights);

  return (
    <div
      className={styles.container}
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
}
