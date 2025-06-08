import * as readability from "@mozilla/readability";

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

// Function to generate CSS based on preferences
function generateCSS(prefs: StylePreferences): string {
  const themes = {
    light: {
      background: "white",
      color: "#333",
      shadow: "rgba(0, 0, 0, 0.1)",
    },
    dark: {
      background: "#222",
      color: "#eee",
      shadow: "rgba(0, 0, 0, 0.3)",
    },
  };

  const theme = themes[prefs.theme];

  return `
    #read-and-scroll-container {
      --rs-width: ${prefs.width};
      --rs-font-size: ${prefs.fontSize};
      --rs-bg-color: ${theme.background};
      --rs-text-color: ${theme.color};
      --rs-shadow-color: ${theme.shadow};
      
      width: var(--rs-width) !important;
      margin: 0 auto !important;
      padding: 2rem !important;
      background-color: var(--rs-bg-color) !important;
      min-height: 100vh !important;
      box-shadow: 0 0 20px var(--rs-shadow-color) !important;
      position: relative !important;
      z-index: 1000 !important;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      font-size: var(--rs-font-size) !important;
      line-height: 1.6 !important;
      color: var(--rs-text-color) !important;
      font-weight: ${prefs.fontWeight} !important;
    }

    #read-and-scroll-container img {
      max-width: ${
        prefs.imageSize === "large"
          ? "120%"
          : prefs.imageSize === "small"
          ? "80%"
          : "100%"
      } !important;
      height: auto !important;
      margin: 1em auto !important;
      display: block !important;
    }
  `;
}

// Function to update styles
function updateStyles(newPrefs: Partial<StylePreferences>) {
  const styleEl = document.getElementById("read-and-scroll-styles");
  if (styleEl) {
    const updatedPrefs = { ...currentPreferences, ...newPrefs };
    styleEl.textContent = generateCSS(updatedPrefs);
    currentPreferences = updatedPrefs;
  }
}

let currentPreferences = { ...defaultPreferences };

// Inject our CSS
function injectStyles() {
  const style = document.createElement("style");
  style.id = "read-and-scroll-styles";
  style.textContent = generateCSS(currentPreferences);
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
