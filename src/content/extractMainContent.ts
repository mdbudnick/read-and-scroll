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

  // Try to find the main article container
  const main =
    doc.querySelector("div.story-content, div#story, article, .story, main") ||
    doc.body;

  // Clone the main node to avoid modifying the original document
  const mainClone = main.cloneNode(true) as HTMLElement;

  // Remove non-essential elements (ads, nav, sidebars, comments, etc)
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
    "[role='navigation']",
    "[role='banner']",
    "[role='contentinfo']",
    "[role='complementary']",
    "[role='search']",
    "[role='dialog']",
    "[role='alert']",
    "[role='status']",
    "[role='tooltip']",
    "[role='tablist']",
    "[role='tab']",
    "[role='tabpanel']",
    "[role='presentation']",
    "[role='separator']",
    "[role='menu']",
    "[role='menubar']",
    "[role='menuitem']",
    "[role='listbox']",
    "[role='option']",
    "[role='group']",
    "[role='region']",
    "[role='form']",
    "[role='searchbox']",
    "[role='switch']",
    "[role='slider']",
    "[role='progressbar']",
    "[role='scrollbar']",
    "[role='spinbutton']",
    "[role='textbox']",
    "[role='combobox']",
    "[role='list']",
    "[role='listitem']",
    "[role='tree']",
    "[role='treeitem']",
    "[role='grid']",
    "[role='gridcell']",
    "[role='row']",
    "[role='rowgroup']",
    "[role='columnheader']",
    "[role='rowheader']",
    "[role='cell']",
    "[role='article']",
    "[role='document']",
    "[role='application']",
    "[role='main']",
    "[role='content']",
    "[role='feed']",
    "[role='figure']",
    "[role='img']",
    "[role='math']",
    "[role='note']",
    "[role='presentation']",
    "[role='separator']",
    "[role='status']",
    "[role='timer']",
    "[role='tooltip']",
    "[role='tree']",
    "[role='treegrid']",
    "[role='treeitem']",
    "[role='none']",
    "[role='presentation']",
  ];
  selectorsToRemove.forEach((selector) => {
    mainClone.querySelectorAll(selector).forEach((el) => el.remove());
  });

  // Optionally, remove empty elements
  Array.from(mainClone.querySelectorAll("*")).forEach((el) => {
    if (
      !el.children.length &&
      !el.textContent?.trim() &&
      !["img", "video", "audio", "iframe"].includes(el.tagName.toLowerCase())
    ) {
      el.remove();
    }
  });

  // Return the HTML string of the cleaned main content
  return mainClone.innerHTML;
}
