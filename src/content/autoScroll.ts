export interface ScrollState {
  isScrolling: boolean;
  speed: number;
}

const scrollState: ScrollState = {
  isScrolling: false,
  speed: 0,
};

let scrollInterval: number | null = null;

export function startScrolling(value: number, labelText?: string) {
  scrollState.isScrolling = true;
  scrollState.speed = calculateScrollSpeed(value);
  const speedLabel = document.querySelector(".speed-label");

  if (scrollInterval) {
    clearInterval(scrollInterval);
  }

  scrollInterval = setInterval(() => {
    if (scrollState.isScrolling) {
      // Check if we're at the bottom of the page
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
        stopScrolling();
        // Reset slider value to 0 if present
        const slider = document.querySelector(
          ".scroll-slider"
        ) as HTMLInputElement | null;
        if (slider) slider.value = "0";
        if (speedLabel) {
          speedLabel.textContent = "Stopped";
          speedLabel.className = "speed-label";
        }
        return;
      }
      window.scrollBy(0, scrollState.speed);
      if (labelText) {
        if (speedLabel) {
          speedLabel.textContent = `${labelText}`;
        }
      }
    }
  }, 50) as unknown as number;
}

export function stopScrolling() {
  scrollState.isScrolling = false;
  if (scrollInterval) {
    clearInterval(scrollInterval);
    scrollInterval = null;
  }
  const speedLabel = document.querySelector(".speed-label");
  if (speedLabel) {
    speedLabel.textContent = "Stopped";
    speedLabel.className = "speed-label";
  }
}

export function updateScrollSpeed(speed: number) {
  scrollState.speed = speed;
  if (scrollState.isScrolling) {
    startScrolling(speed); // Restart with new speed
  }
}

// Convert slider value (0-100) to actual scroll speed
export function calculateScrollSpeed(sliderValue: number): number {
  // Exponential increase in speed, but half as fast as before
  // At 100%, speed will be 5.5 pixels per 50ms (ludicrous!)
  return sliderValue === 0 ? 0 : Math.pow(sliderValue / 100, 2) * 5 + 0.5;
}
