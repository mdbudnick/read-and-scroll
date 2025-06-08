import * as readability from "@mozilla/readability";

console.log("Read and Scroll content script loaded.");

const mainContent = new readability.Readability(document);
if (mainContent) {
  console.log("[Read and Scroll] Extracted main content:", mainContent);
  // Overwrite the page with the extracted main content for visual inspection
  document.body.innerHTML = mainContent.parse()?.content || "";
} else {
  console.log("[Read and Scroll] No main content found.");
}
