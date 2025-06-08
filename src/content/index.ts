import * as readability from "@mozilla/readability";
import { themes } from "./styles/theme";
import { generateCSS } from "./styles/reader";
import { controlStyles } from "./styles/controls";
import type { StylePreferences } from "./styles/reader";

const defaultPreferences: StylePreferences = {
  width: "50%",
  fontSize: "18px",
  theme: "light",
  imageSize: "normal",
  fontWeight: "normal",
};

const sizes = [
  { label: "Aa", size: "14px", class: "small" },
  { label: "Aa", size: "18px", class: "medium" },
  { label: "Aa", size: "22px", class: "large" },
] as const;

let currentPreferences = { ...defaultPreferences };

function createControls() {
  const controls = document.createElement("div");
  controls.id = "read-and-scroll-controls";

  // Theme toggle
  const themeToggle = document.createElement("div");
  themeToggle.className = "theme-toggle";

  const lightButton = document.createElement("button");
  lightButton.innerHTML = "☀️";
  lightButton.className = currentPreferences.theme === "light" ? "active" : "";
  lightButton.addEventListener("click", () => updateStyles({ theme: "light" }));

  const darkButton = document.createElement("button");
  darkButton.innerHTML = "🌙";
  darkButton.className = currentPreferences.theme === "dark" ? "active" : "";
  darkButton.addEventListener("click", () => updateStyles({ theme: "dark" }));

  themeToggle.appendChild(lightButton);
  themeToggle.appendChild(darkButton);

  // Font size controls
  const fontSizes = document.createElement("div");
  fontSizes.className = "font-sizes";

  sizes.forEach(({ label, size, class: className }) => {
    const button = document.createElement("button");
    button.textContent = label;
    button.className = `font-size-button ${className} ${
      currentPreferences.fontSize === size ? "active" : ""
    }`;
    button.addEventListener("click", () => updateStyles({ fontSize: size }));
    fontSizes.appendChild(button);
  });

  controls.appendChild(themeToggle);
  controls.appendChild(fontSizes);

  document.body.appendChild(controls);
}

// Function to update styles
function updateStyles(newPrefs: Partial<StylePreferences>) {
  const styleEl = document.getElementById("read-and-scroll-styles");
  if (styleEl) {
    const updatedPrefs = { ...currentPreferences, ...newPrefs };
    styleEl.textContent =
      generateCSS(updatedPrefs, themes) +
      controlStyles(themes[updatedPrefs.theme]);
    currentPreferences = updatedPrefs;

    // Update active states on controls
    if (newPrefs.theme) {
      document.querySelectorAll(".theme-toggle button").forEach((button) => {
        button.classList.toggle(
          "active",
          (button.innerHTML === "☀️" && newPrefs.theme === "light") ||
            (button.innerHTML === "🌙" && newPrefs.theme === "dark")
        );
      });
    }

    if (newPrefs.fontSize) {
      document.querySelectorAll(".font-size-button").forEach((button) => {
        const size = sizes.find(
          (s) => s.class === button.className.split(" ")[1]
        )?.size;
        if (size) {
          button.classList.toggle("active", size === newPrefs.fontSize);
        }
      });
    }
  }
}

// Inject our CSS
function injectStyles() {
  const style = document.createElement("style");
  style.id = "read-and-scroll-styles";
  style.textContent =
    generateCSS(currentPreferences, themes) +
    controlStyles(themes[currentPreferences.theme]);
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

  // Create and add controls
  createControls();

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
