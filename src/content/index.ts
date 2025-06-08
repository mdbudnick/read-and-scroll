import * as readability from "@mozilla/readability";
import { themes } from "./theme";
import { generateCSS } from "./styles";

interface StylePreferences {
  width: string;
  fontSize: string;
  theme: "light" | "dark";
  imageSize: "normal" | "large" | "small";
  fontWeight: "normal" | "bold";
}

const defaultPreferences: StylePreferences = {
  width: "50%",
  fontSize: "18px",
  theme: "light",
  imageSize: "normal",
  fontWeight: "normal",
};

let currentPreferences = { ...defaultPreferences };

// Function to update styles
function updateStyles(newPrefs: Partial<StylePreferences>) {
  const styleEl = document.getElementById("read-and-scroll-styles");
  if (styleEl) {
    const updatedPrefs = { ...currentPreferences, ...newPrefs };
    styleEl.textContent = generateCSS(updatedPrefs, themes);
    currentPreferences = updatedPrefs;
  }
}

// Inject our CSS
function injectStyles() {
  const style = document.createElement("style");
  style.id = "read-and-scroll-styles";
  style.textContent = generateCSS(currentPreferences, themes);
  document.head.appendChild(style);
}

function createReadableVersion() {
  // Create the container for our readable content
  const container = document.createElement("div");
  container.id = "read-and-scroll-container";

  // Create a new document for Readability
  const documentClone = document.implementation.createHTMLDocument();
  documentClone.documentElement.innerHTML = document.documentElement.innerHTML;

  // Parse with Readability
  const reader = new readability.Readability(documentClone);
  const article = reader.parse();

  // Set up the layout
  document.body.innerHTML = "";
  document.body.appendChild(container);

  // Inject our styles after the container is in the DOM
  injectStyles();

  if (article && article.content) {
    console.log("[Read and Scroll] Extracted main content:", article);
    container.innerHTML = article.content;
  } else {
    console.log("[Read and Scroll] No main content found.");
    container.innerHTML =
      "<p>Could not extract readable content from this page.</p>";
  }

  // Listen for messages from popup/background script to update styles
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "UPDATE_STYLES") {
      updateStyles(message.preferences);
      sendResponse({ success: true });
    }
  });
}

// Export for use in other parts of the extension
export { updateStyles };
export type { StylePreferences };

// Start the process
createReadableVersion();
