import * as readability from "@mozilla/readability";
import { themes } from "./styles/theme";
import { generateCSS } from "./styles/reader";
import { controlStyles } from "./styles/controls";
import {
  doPauseStopOrResume,
  startScrolling,
  stopScrolling,
  defaultScrollState,
  loadScrollStateFromStorage,
} from "./autoScroll";
import type { StylePreferences } from "./styles/reader";

const STORAGE_PREFIX = "readAndScrollConfig_";

const defaultPreferences: StylePreferences = {
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

async function checkSaveSettingsEnabled(): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.storage.local.get([`${STORAGE_PREFIX}saveSettings`], (result) => {
      const enabled =
        String(result[`${STORAGE_PREFIX}saveSettings`]) === "true";

      resolve(enabled);
    });
  });
}

async function loadPreferencesFromStorage(): Promise<StylePreferences> {
  return new Promise((resolve) => {
    chrome.storage.local.get([`${STORAGE_PREFIX}saveSettings`], (result) => {
      const saveEnabled =
        String(result[`${STORAGE_PREFIX}saveSettings`]) === "true";

      if (saveEnabled) {
        // Get all preference keys from storage
        const prefKeys = Object.keys(defaultPreferences).map(
          (key) => `${STORAGE_PREFIX}${key}`
        );
        chrome.storage.local.get(prefKeys, (prefResult) => {
          const loadedPrefs: Partial<StylePreferences> = {};

          // Extract saved preferences
          Object.keys(defaultPreferences).forEach((key) => {
            const storageKey = `${STORAGE_PREFIX}${key}`;
            if (prefResult[storageKey] !== undefined) {
              loadedPrefs[key as keyof StylePreferences] =
                prefResult[storageKey];
            }
          });

          const mergedPrefs = { ...defaultPreferences, ...loadedPrefs };
          console.log("merged prefs:", JSON.stringify(mergedPrefs, null, 2));
          resolve(mergedPrefs);
        });
      } else {
        // saveSettings is disabled, use defaults
        resolve(defaultPreferences);
      }
    });
  });
}

let currentPreferences = { ...defaultPreferences };

// Initialize preferences from storage
loadPreferencesFromStorage().then((prefs) => {
  currentPreferences = prefs;
  loadScrollStateFromStorage().then((retrievedState) => {
    const currentScrollState = {
      defaultScrollState,
      ...retrievedState,
    };
    // --- Reader Mode State ---
    let readerEnabled = false;
    let originalBodyHTML: string | null = null;
    let originalScroll: number = 0;

    function checkAlwaysEnabled() {
      chrome.storage.local.get([`${STORAGE_PREFIX}alwaysEnabled`], (result) => {
        if (result[`${STORAGE_PREFIX}alwaysEnabled`] && !readerEnabled) {
          enableReader();
        }
      });
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", checkAlwaysEnabled);
    } else {
      checkAlwaysEnabled();
    }

    function enableReader() {
      if (!readerEnabled) {
        originalBodyHTML = document.body.innerHTML;
        originalScroll = window.scrollY;
        createReadableVersion();
        readerEnabled = true;
      }
    }

    function disableReader() {
      if (readerEnabled) {
        stopScrolling();
        // Restore original DOM and scroll position
        if (originalBodyHTML !== null) {
          document.body.innerHTML = originalBodyHTML;
          window.scrollTo(0, originalScroll);
        } else {
          // If we don't have the original HTML, reload the page
          window.location.reload();
        }
        // Remove any leftover styles
        const style = document.getElementById("read-and-scroll-styles");
        if (style) style.remove();
        readerEnabled = false;
      }
    }

    function createControls() {
      const controls = document.createElement("div");
      controls.id = "read-and-scroll-controls";

      // Theme toggle
      const themeToggle = document.createElement("div");
      themeToggle.className = "theme-toggle";

      const lightButton = document.createElement("button");
      lightButton.innerHTML = "☀️";
      lightButton.className =
        currentPreferences.theme === "light" ? "active" : "";
      lightButton.addEventListener("click", () =>
        updateStyles({ theme: "light" })
      );

      const darkButton = document.createElement("button");
      darkButton.innerHTML = "🌙";
      darkButton.className =
        currentPreferences.theme === "dark" ? "active" : "";
      darkButton.addEventListener("click", () =>
        updateStyles({ theme: "dark" })
      );

      const rainbowButton = document.createElement("button");
      rainbowButton.innerHTML = "🌈";
      rainbowButton.className =
        currentPreferences.theme === "rainbow" ? "active" : "";
      rainbowButton.addEventListener("click", () =>
        updateStyles({ theme: "rainbow" })
      );

      const starWarsButton = document.createElement("button");
      starWarsButton.innerHTML = "⭐";
      starWarsButton.className =
        currentPreferences.theme === "starwars" ? "active" : "";
      starWarsButton.addEventListener("click", () =>
        updateStyles({ theme: "starwars" })
      );

      themeToggle.appendChild(lightButton);
      themeToggle.appendChild(darkButton);
      themeToggle.appendChild(starWarsButton);
      themeToggle.appendChild(rainbowButton);

      // Font size controls
      const fontSizes = document.createElement("div");
      fontSizes.className = "font-sizes";

      sizes.forEach(({ label, size, class: className }) => {
        const button = document.createElement("button");
        button.textContent = label;
        button.className = `font-size-button ${className} ${
          currentPreferences.fontSize === size ? "active" : ""
        }`;
        button.addEventListener("click", () =>
          updateStyles({ fontSize: size })
        );
        fontSizes.appendChild(button);
      });

      const scrollControl = document.createElement("div");
      scrollControl.className = "scroll-control";

      const slider = document.createElement("input");
      slider.type = "range";
      slider.min = "0";
      slider.max = "100";
      slider.value = currentScrollState.value;
      slider.className = "scroll-slider";

      const speedLabel = document.createElement("div");
      speedLabel.className = "speed-label";
      speedLabel.textContent = currentScrollState.label;

      slider.addEventListener("input", (e) => {
        const sliderElement = e.target as HTMLInputElement;
        currentScrollState.value = sliderElement.value;
        const value = parseInt(currentScrollState.value);

        if (value === 0) {
          stopScrolling();
        } else if (value === 100) {
          startScrolling(value, "LUDICROUS SPEED!");
          speedLabel.className = "speed-label ludicrous";
        } else {
          startScrolling(value, `${value}%`);
          speedLabel.className = "speed-label";
        }
      });

      scrollControl.appendChild(slider);
      scrollControl.appendChild(speedLabel);

      controls.appendChild(themeToggle);
      controls.appendChild(fontSizes);
      controls.appendChild(scrollControl);

      document.body.appendChild(controls);
    }

    function updateStyles(newPrefs: Partial<StylePreferences>) {
      const styleEl = document.getElementById("read-and-scroll-styles");

      if (styleEl) {
        // Check Save Settings toggle and handle preference persistence
        checkSaveSettingsEnabled().then((saveEnabled) => {
          if (saveEnabled) {
            Object.entries(newPrefs).forEach((entry) => {
              const prefKey = `${STORAGE_PREFIX}${entry[0]}`;
              const value = entry[1];
              if (value !== undefined) {
                chrome.storage.local.set({ [prefKey]: value });
              }
            });
          }
        });

        const updatedPrefs = { ...currentPreferences, ...newPrefs };
        styleEl.textContent =
          generateCSS(updatedPrefs, themes) +
          controlStyles(themes[updatedPrefs.theme as keyof typeof themes]);
        currentPreferences = updatedPrefs;

        if (newPrefs.theme) {
          document
            .querySelectorAll(".theme-toggle button")
            .forEach((button) => {
              button.classList.toggle(
                "active",
                (button.innerHTML === "☀️" && newPrefs.theme === "light") ||
                  (button.innerHTML === "🌙" && newPrefs.theme === "dark") ||
                  (button.innerHTML === "🌈" && newPrefs.theme === "rainbow") ||
                  (button.innerHTML === "⭐" && newPrefs.theme === "starwars")
              );
            });
          // Add or remove rainbow/starwars-theme class on container
          const container = document.getElementById(
            "read-and-scroll-container"
          );
          if (container) {
            if (newPrefs.theme === "rainbow") {
              container.classList.remove("starwars-theme");
              container.classList.add("rainbow-theme");
            } else if (newPrefs.theme === "starwars") {
              container.classList.remove("rainbow-theme");
              container.classList.add("starwars-theme");
              startScrolling(25); // Set a default speed for Star Wars theme
            } else {
              container.classList.remove("rainbow-theme");
              container.classList.remove("starwars-theme");
              document.body.classList.remove("starwars");
              document.body.classList.remove("rainbow");
            }
          }
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
      // Create the wrapper and container
      const wrapper = document.createElement("div");
      wrapper.id = "read-and-scroll-wrapper";

      const container = document.createElement("div");
      container.id = "read-and-scroll-container";

      // Create a new document for Readability
      const documentClone = document.implementation.createHTMLDocument();
      documentClone.documentElement.innerHTML =
        document.documentElement.innerHTML;

      // Parse with Readability
      const reader = new readability.Readability(documentClone);
      const article = reader.parse();

      // Set up the layout
      document.body.innerHTML = "";
      wrapper.appendChild(container);
      document.body.appendChild(wrapper);

      // Create and add controls
      createControls();

      // Inject our styles after the container is in the DOM
      injectStyles();

      if (article && article.content) {
        // Build a cleaner article HTML with title, byline, published time, and content
        let html = `<h1>${article.title ?? ""}</h1>`;
        if (article.byline) {
          html += `<div class="readability-byline" style="font-size:1.05em;color:#666;margin-bottom:0.5em;">${article.byline}</div>`;
        }
        if (article.publishedTime) {
          const date = new Date(article.publishedTime);
          html += `<div class="readability-published" style="font-size:0.98em;color:#888;margin-bottom:1em;">Published: ${date.toLocaleString()}</div>`;
        }
        html += article.content;
        container.innerHTML = html;
      } else {
        console.log("[Read and Scroll] No main content found.");
        container.innerHTML =
          "<p>Could not extract readable content from this page.</p>";
      }

      // Pause scrolling on hover, resume on mouse leave
      container.addEventListener("mouseenter", () => {
        doPauseStopOrResume("pause");
      });
      container.addEventListener("mouseleave", () => {
        doPauseStopOrResume("pause"); // This will call resume if already paused
      });

      // Toggle scrolling on fast click (not drag)
      let mouseDownTime = 0;
      let isDragging = false;
      container.addEventListener("mousedown", () => {
        mouseDownTime = Date.now();
        isDragging = false;
      });
      container.addEventListener("mousemove", () => {
        isDragging = true;
      });
      container.addEventListener("mouseup", () => {
        const clickDuration = Date.now() - mouseDownTime;
        // Prevent toggle if user is clearing a text selection
        const selection = window.getSelection();
        if (
          selection &&
          selection.type === "Range" &&
          selection.toString().length > 0
        ) {
          isDragging = false;
          return;
        }
        // Only toggle if not a drag and click is quick (<250ms)
        if (!isDragging && clickDuration < 250) {
          doPauseStopOrResume("stop");
        }
        isDragging = false;
      });
    }

    // Listen for messages from popup/background script
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === "ENABLE_READER") {
        enableReader();
        sendResponse({ enabled: true });
      } else if (message.type === "DISABLE_READER") {
        disableReader();
        sendResponse({ enabled: false });
      } else if (message.type === "GET_STATE") {
        sendResponse({ enabled: readerEnabled });
      } else if (message.type === "UPDATE_STYLES") {
        updateStyles(message.preferences);
        sendResponse({ success: true });
      }
    });
  });
});
