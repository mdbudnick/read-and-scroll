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
  const toggle = document.getElementById("enable-toggle") as HTMLInputElement;
  if (!toggle) return;

  // Restore the enabled/disabled state
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.id) return;
    const tabId = tab.id;
    chrome.tabs.sendMessage(tabId, { type: "GET_STATE" }, (response) => {
      toggle.checked = response?.enabled || false;
    });
  });

  toggle.addEventListener("change", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab || !tab.id) return;
      const tabId = tab.id;
      if (toggle.checked) {
        // Enable: send message to content script to enable reader
        chrome.tabs.sendMessage(tabId, { type: "ENABLE_READER" });
      } else {
        // Disable: send message to content script to disable reader
        chrome.tabs.sendMessage(tabId, { type: "DISABLE_READER" });
      }
    });
  });
});
