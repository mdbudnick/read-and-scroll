// Converted to TypeScript
// ...existing code from index.js will be migrated here...

// Minimal background script for Read and Scroll (TypeScript)
declare const chrome: any;

chrome.runtime.onInstalled.addListener(() => {
  console.log("Read and Scroll extension installed.");
});
