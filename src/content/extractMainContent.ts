// Extracts main textual, image, and video/audio content from a Daily Kos article HTML string
export interface MainContent {
  text: string;
  images: string[];
  videos: string[];
  audios: string[];
}

/**
 * Extracts the main content from a Daily Kos article HTML string.
 * @param html The HTML string of the article page.
 * @returns MainContent object with text, images, videos, and audios.
 */
export function extractMainContent(html: string): MainContent {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Main article text: look for repeated headlines, then main story blocks
  const mainBlocks = Array.from(
    doc.querySelectorAll("div.story-content, div#story, article, .story")
  );
  let text = "";
  if (mainBlocks.length > 0) {
    text = mainBlocks
      .map((block) => block.textContent?.trim() || "")
      .join("\n\n");
  } else {
    // fallback: get all paragraphs
    text = Array.from(doc.querySelectorAll("p"))
      .map((p) => p.textContent?.trim() || "")
      .join("\n\n");
  }

  // Images: look for <img> tags in main content
  const images = Array.from(doc.querySelectorAll("img"))
    .map((img) => img.src)
    .filter(Boolean);

  // Videos: look for <iframe> (YouTube, etc) and <video> tags
  const videos = [
    ...Array.from(doc.querySelectorAll("iframe")).map((f) => f.src),
    ...Array.from(doc.querySelectorAll("video")).map((v) => v.src),
  ].filter(Boolean);

  // Audios: look for <audio> tags
  const audios = Array.from(doc.querySelectorAll("audio"))
    .map((a) => a.src)
    .filter(Boolean);

  return { text, images, videos, audios };
}
