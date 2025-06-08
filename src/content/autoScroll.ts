export interface ScrollState {
  isScrolling: boolean;
  speed: number;
}

const scrollState: ScrollState = {
  isScrolling: false,
  speed: 0,
};

let scrollInterval: number | null = null;

export function startScrolling(speed: number) {
  scrollState.isScrolling = true;
  scrollState.speed = speed;

  if (scrollInterval) {
    clearInterval(scrollInterval);
  }

  scrollInterval = setInterval(() => {
    if (scrollState.isScrolling) {
      window.scrollBy(0, scrollState.speed);
    }
  }, 50) as unknown as number;
}

export function stopScrolling() {
  scrollState.isScrolling = false;
  if (scrollInterval) {
    clearInterval(scrollInterval);
    scrollInterval = null;
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
  // Exponential increase in speed
  // At 100%, speed will be 20 pixels per 50ms (ludicrous!)
  return Math.pow(sliderValue / 100, 2) * 20;
}
