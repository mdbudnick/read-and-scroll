const STORAGE_PREFIX = "readAndScrollConfig_";

export interface ScrollState {
  isScrolling: boolean;
  speed: number; // This is scroll speed
  value: string; // This is slider value
  label: string;
  isClickStopped: boolean;
  isPaused: boolean;
}

export const defaultScrollState: ScrollState = {
  isScrolling: false,
  speed: 0,
  value: "0",
  label: "Stopped",
  isClickStopped: false,
  isPaused: false,
};

const scrollState: ScrollState = { ...defaultScrollState };

async function checkSaveSettingsEnabled(): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.storage.local.get([`${STORAGE_PREFIX}saveSettings`], (result) => {
      const enabled =
        String(result[`${STORAGE_PREFIX}saveSettings`]) === "true";
      resolve(enabled);
    });
  });
}

export async function loadScrollStateFromStorage(): Promise<ScrollState> {
  return new Promise(async (resolve) => {
    const saveEnabled = await checkSaveSettingsEnabled();
    if (saveEnabled) {
      const scrollKeys = Object.keys(defaultScrollState).map(
        (key) => `${STORAGE_PREFIX}${key}`
      );
      chrome.storage.local.get(scrollKeys, (scrollResult) => {
        const loadedScrollState: Partial<ScrollState> = {};

        Object.keys(defaultScrollState).forEach((key) => {
          const storageKey = `${STORAGE_PREFIX}${key}`;
          if (scrollResult[storageKey] !== undefined) {
            loadedScrollState[key as keyof ScrollState] =
              scrollResult[storageKey];
          }
        });

        const mergedScrollState = {
          ...defaultScrollState,
          ...loadedScrollState,
        };
        resolve(mergedScrollState);
      });
    } else {
      // saveSettings is disabled, use defaults
      resolve(defaultScrollState);
    }
  });
}

loadScrollStateFromStorage().then((state) => {
  Object.assign(scrollState, state);
});

let scrollInterval: number | null = null;

async function saveScrollSettings() {
  checkSaveSettingsEnabled().then((saveEnabled) => {
    if (saveEnabled) {
      chrome.storage.local.set({
        [`${STORAGE_PREFIX}isScrolling`]: scrollState.isScrolling,
        [`${STORAGE_PREFIX}value`]: scrollState.value,
        [`${STORAGE_PREFIX}speed`]: scrollState.speed,
      });
    }
  });
}

export function startScrolling(value: number, labelText?: string) {
  const slider = document.querySelector(
    ".scroll-slider"
  ) as HTMLInputElement | null;
  if (slider) {
    slider.value = value.toString();
    scrollState.value = slider.value;
    scrollState.isScrolling = true;
    scrollState.speed = calculateScrollSpeed(value);
    saveScrollSettings();
    startInterval();
    // Set label before dispatching event so the event handler can use it
    if (labelText) {
      const speedLabel = document.querySelector(".speed-label");
      if (speedLabel) {
        speedLabel.textContent = labelText;
        scrollState.label = labelText;
        saveScrollLabelState();
      }
    }
    slider.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

// Only handles the interval logic now
export function startInterval() {
  if (scrollInterval) {
    clearInterval(scrollInterval);
  }
  scrollInterval = setInterval(() => {
    if (scrollState.isScrolling) {
      const scrollY = window.scrollY || window.pageYOffset;
      const viewportHeight = window.innerHeight;
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight
      );
      if (scrollY + viewportHeight >= docHeight - 2) {
        stopScrolling("endofpage");
        return;
      }
      window.scrollBy(0, scrollState.speed);
    }
  }, 50) as unknown as number;
}

let prevScrollValue = "0";
let prevScrollLabel = "";
let wasLudicrous = false;
export async function stopScrolling(type?: "pause" | "stop" | "endofpage") {
  if (scrollInterval) {
    clearInterval(scrollInterval);
    scrollInterval = null;

    scrollState.isScrolling = false;
    prevScrollValue = scrollState.value;
    scrollState.speed = 0;
    scrollState.value = "0";
    saveScrollSettings();
    prevScrollLabel = scrollState.label; // Reupdated below
    wasLudicrous =
      document.querySelector(".speed-label")?.classList.contains("ludicrous") ??
      false;
    scrollState.isClickStopped = type === "stop";
    scrollState.isPaused = type === "pause";
    savePauseStopState();
  }

  const slider = document.querySelector(
    ".scroll-slider"
  ) as HTMLInputElement | null;
  if (slider) slider.value = "0";

  const speedLabel = document.querySelector(".speed-label");
  if (speedLabel) {
    const text =
      type === "pause"
        ? "Hover Paused"
        : type === "stop"
        ? "Stopped (Click)"
        : type === "endofpage"
        ? "0% (End of Page)"
        : "0%";
    speedLabel.textContent = text;
    speedLabel.className = "speed-label";
    scrollState.label = text; // Update the label in scrollState
    await saveScrollLabelState();
  }
}

function savePauseStopState() {
  checkSaveSettingsEnabled().then((saveEnabled) => {
    if (saveEnabled) {
      chrome.storage.local.set({
        [`${STORAGE_PREFIX}isPaused`]: scrollState.isPaused,
        [`${STORAGE_PREFIX}isClickStopped`]: scrollState.isClickStopped,
      });
    }
  });
}

export function doPauseStopOrResume(type: "pause" | "stop") {
  if (scrollState.isScrolling) {
    prevScrollValue = scrollState.value;
    prevScrollLabel = scrollState.label;
    wasLudicrous =
      document.querySelector(".speed-label")?.classList.contains("ludicrous") ??
      false;
    scrollState.isClickStopped = type === "stop";
    scrollState.isPaused = type === "pause";
    stopScrolling(type);
  } else if (scrollState.isPaused && type === "stop") {
    scrollState.isPaused = false;
    scrollState.isClickStopped = true;
    stopScrolling(type);
  } else if (
    (scrollState.isPaused && type === "pause") ||
    (scrollState.isClickStopped && type === "stop")
  ) {
    if (scrollState.isClickStopped && type === "stop") {
      scrollState.isClickStopped = false;
      // There's actually a bug here, because we click to resume
      // and the mouse is ALREADY hovering, so we dispatch a pause hover event
      // To trigger a pause again. Or else it becomes inverted.
      scrollState.isPaused = true;
      stopScrolling("pause");
    } else {
      scrollState.isPaused = false;
      scrollState.isClickStopped = false;
      resumeScrolling();
    }
  }
  savePauseStopState();
}

function resumeScrolling() {
  const prevValue = parseInt(prevScrollValue);
  if (!scrollState.isScrolling && prevValue > 0) {
    scrollState.isScrolling = true;
    const speedLabel = document.querySelector(".speed-label");
    const labelText = prevScrollLabel || `${scrollState.speed}%`;
    if (speedLabel) {
      if (wasLudicrous) {
        speedLabel.className = "speed-label ludicrous";
      } else {
        speedLabel.className = "speed-label";
      }
    }
    startScrolling(prevValue, labelText);
    const slider = document.querySelector(
      ".scroll-slider"
    ) as HTMLInputElement | null;
    if (slider) {
      slider.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
}

// Convert slider value (0-100) to actual scroll speed
function calculateScrollSpeed(sliderValue: number): number {
  // Exponential increase in speed, but half as fast as before
  // At 100%, speed will be 5.5 pixels per 50ms (ludicrous!)
  return sliderValue === 0 ? 0 : Math.pow(sliderValue / 100, 2) * 5 + 0.5;
}

async function saveScrollLabelState() {
  checkSaveSettingsEnabled().then((saveEnabled) => {
    if (saveEnabled) {
      chrome.storage.local.set({
        [`${STORAGE_PREFIX}scrollLabel`]: scrollState.label,
      });
    }
  });
}
