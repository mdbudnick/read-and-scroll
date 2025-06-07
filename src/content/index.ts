// Converted to TypeScript
import { extractMainContent } from "./extractMainContent";

console.log("Read and Scroll content script loaded.");

const mainContent = extractMainContent(document.documentElement.outerHTML);
if (mainContent) {
  console.log("[Read and Scroll] Extracted main content:", mainContent);
} else {
  console.log("[Read and Scroll] No main content found.");
}
