// Polyfill for modulepreload (optional, most modern browsers support this)
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link as HTMLLinkElement);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLLinkElement && node.rel === "modulepreload") {
          processPreload(node);
        }
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link: HTMLLinkElement) {
    const fetchOpts: RequestInit = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy)
      fetchOpts.referrerPolicy = link.referrerPolicy as ReferrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link: HTMLLinkElement & { ep?: boolean }) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  const modeSelect = document.getElementById(
    "reader-mode-select"
  ) as HTMLSelectElement;
  if (!modeSelect) return;

  // Restore the mode state
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.id) return;
    const tabId = tab.id;
    chrome.tabs.sendMessage(tabId, { type: "GET_STATE" }, (response) => {
      if (response?.enabled === true && response?.mode) {
        modeSelect.value = response.mode;
      } else {
        modeSelect.value = "disabled";
      }
    });
  });

  modeSelect.addEventListener("change", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab || !tab.id) return;
      const tabId = tab.id;
      const mode = modeSelect.value;
      if (mode === "disabled") {
        chrome.tabs.sendMessage(tabId, { type: "DISABLE_READER" });
      } else if (mode === "mozilla") {
        chrome.tabs.sendMessage(tabId, { type: "ENABLE_MOZILLA_READER" });
      } else if (mode === "magic-scroll") {
        chrome.tabs.sendMessage(tabId, { type: "ENABLE_MAGIC_SCROLL_READER" });
      }
    });
  });
});
