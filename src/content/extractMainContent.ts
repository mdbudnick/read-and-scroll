export interface MainContent {
  text: string;
  images: string[];
  videos: string[];
  audios: string[];
}

/**
 * Extracts the main content from a Daily Kos article HTML string,
 * preserving the order and HTML structure of important elements,
 * and keeping their original width, font, and text size.
 * @param html The HTML string of the article page.
 * @returns HTML string of the main content.
 */
export function extractMainContent(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Find the main article container
  const main =
    doc.querySelector("div.story-content, div#story, article, .story, main") ||
    doc.body;

  // Remove unwanted elements first
  const selectorsToRemove = [
    "nav",
    "aside",
    ".sidebar",
    ".ad",
    "[id*=ad]",
    ".comments",
    ".footer",
    "footer",
    "script",
    "noscript",
    "style",
    "link[rel=stylesheet]",
    "header",
    ".share",
    ".social",
    ".newsletter",
    ".related",
    ".promo",
    ".outbrain",
    ".recommendations",
    ".subscribe",
    ".author-bio",
    ".byline",
    ".meta",
    ".tools",
    ".print",
    ".mobile-nav",
    ".desktop-nav",
    ".site-header",
    ".site-footer",
    ".breadcrumb",
    ".tags",
    ".category",
    ".copyright",
    ".disclaimer",
    ".modal",
    ".popup",
    ".overlay",
    ".cookie",
    ".gdpr",
    ".banner",
    ".announcement",
    ".widget",
    ".sponsored",
    ".hidden",
    "[aria-hidden='true']",
    // ...other selectors as before...
  ];
  selectorsToRemove.forEach((selector) => {
    main.querySelectorAll(selector).forEach((el) => el.remove());
  });

  // Allowed tags to keep in the new HTML
  const allowedTags = [
    "p",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "img",
    "video",
    "audio",
    "iframe",
    "ul",
    "ol",
    "li",
    "blockquote",
    "pre",
    "code",
    "figure",
    "figcaption",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "strong",
    "em",
    "b",
    "i",
    "u",
    "a",
    "span",
    "br",
  ];

  // Helper to clone only allowed elements and their attributes/content
  function cloneImportant(node: Element): string {
    const tag = node.tagName.toLowerCase();
    if (!allowedTags.includes(tag)) return "";

    if (["img", "br"].includes(tag)) {
      const attrs = Array.from(node.attributes)
        .map((attr) => `${attr.name}="${attr.value}"`)
        .join(" ");
      return `<${tag}${attrs ? " " + attrs : ""}>`;
    }

    if (["video", "audio", "iframe"].includes(tag)) {
      const attrs = Array.from(node.attributes)
        .filter((attr) =>
          [
            "src",
            "controls",
            "width",
            "height",
            "frameborder",
            "allow",
            "allowfullscreen",
            "poster",
          ].includes(attr.name)
        )
        .map((attr) => `${attr.name}="${attr.value}"`)
        .join(" ");
      return `<${tag}${attrs ? " " + attrs : ""}>${node.innerHTML}</${tag}>`;
    }

    if (tag === "a") {
      const href = node.getAttribute("href");
      return `<a${href ? ` href="${href}"` : ""}>${node.innerHTML}</a>`;
    }

    return `<${tag}>${node.innerHTML}</${tag}>`;
  }

  // Recursively walk the DOM and build new HTML with only allowed tags, in order
  function extractNodes(parent: Element): string {
    let html = "";
    for (const child of Array.from(parent.childNodes)) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as Element;
        if (allowedTags.includes(el.tagName.toLowerCase())) {
          html += cloneImportant(el);
        } else {
          html += extractNodes(el);
        }
      } else if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent?.trim();
        if (text) html += text;
      }
    }
    return html;
  }

  return extractNodes(main);
}
