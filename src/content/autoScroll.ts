export interface ScrollState {
  isScrolling: boolean;
  speed: number; // This is scroll speed
  value: string; // This is slider value
  label: string;
}

const scrollState: ScrollState = {
  isScrolling: false,
  speed: 0,
  value: "0",
  label: "0%",
};

let scrollInterval: number | null = null;

export function startScrolling(value: number, labelText?: string) {
  const slider = document.querySelector(
    ".scroll-slider"
  ) as HTMLInputElement | null;
  if (slider) {
    slider.value = value.toString();
    scrollState.value = slider.value;
    scrollState.isScrolling = true;
    scrollState.speed = calculateScrollSpeed(value);
    startInterval(value);
    // Set label before dispatching event so the event handler can use it
    if (labelText) {
      const speedLabel = document.querySelector(".speed-label");
      if (speedLabel) {
        speedLabel.textContent = labelText;
        scrollState.label = labelText;
      }
    }
    slider.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

// Only handles the interval logic now
export function startInterval(value: number) {
  scrollState.isScrolling = true;
  scrollState.speed = calculateScrollSpeed(value);
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
let isClickStopped = false;
let isPaused = false;
export function stopScrolling(type?: "pause" | "stop" | "endofpage") {
  if (scrollInterval) {
    clearInterval(scrollInterval);
    scrollInterval = null;

    scrollState.isScrolling = false;
    prevScrollValue = scrollState.value;
    scrollState.speed = 0;
    scrollState.value = "0";
    prevScrollLabel = scrollState.label; // Reupdated below
    wasLudicrous =
      document.querySelector(".speed-label")?.classList.contains("ludicrous") ??
      false;
    isClickStopped = type === "stop";
    isPaused = type === "pause";
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
  }
}

export function doPauseStopOrResume(type: "pause" | "stop") {
  if (scrollState.isScrolling) {
    prevScrollValue = scrollState.value;
    prevScrollLabel = scrollState.label;
    wasLudicrous =
      document.querySelector(".speed-label")?.classList.contains("ludicrous") ??
      false;
    isClickStopped = type === "stop";
    isPaused = type === "pause";
    stopScrolling(type);
  } else if (isPaused && type === "stop") {
    isPaused = false;
    isClickStopped = true;
    stopScrolling(type);
  } else if (
    (isPaused && type === "pause") ||
    (isClickStopped && type === "stop")
  ) {
    if (isClickStopped && type === "stop") {
      isClickStopped = false;
      // There's actually a bug here, because we click to resume
      // and the mouse is ALREADY hovering, so we dispatch a pause hover event
      // To trigger a pause again. Or else it becomes inverted.
      isPaused = true;
      stopScrolling("pause");
    } else {
      isPaused = false;
      isClickStopped = false;
      resumeScrolling();
    }
  }
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

export function updateScrollSpeed(speed: number) {
  scrollState.speed = speed;
  if (scrollState.isScrolling) {
    startInterval(speed); // Restart with new speed
  }
}

// Convert slider value (0-100) to actual scroll speed
export function calculateScrollSpeed(sliderValue: number): number {
  // Exponential increase in speed, but half as fast as before
  // At 100%, speed will be 5.5 pixels per 50ms (ludicrous!)
  return sliderValue === 0 ? 0 : Math.pow(sliderValue / 100, 2) * 5 + 0.5;
}
