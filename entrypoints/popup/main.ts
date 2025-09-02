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

import { chromeStorageLocal, STORAGE_PREFIX } from "../../utils/chromeStorage";

document.addEventListener("DOMContentLoaded", async () => {
  const enabledToggle = document.getElementById(
    "enable-toggle"
  ) as HTMLInputElement;
  const alwaysEnabledToggle = document.getElementById(
    "always-enabled-toggle"
  ) as HTMLInputElement;
  const saveSettingsToggle = document.getElementById(
    "save-settings-toggle"
  ) as HTMLInputElement;
  if (!enabledToggle || !alwaysEnabledToggle || !saveSettingsToggle) return;

  // Load initial toggle states
  const alwaysEnabledResult = await chromeStorageLocal.get([
    `${STORAGE_PREFIX}alwaysEnabled`,
  ]);
  alwaysEnabledToggle.checked = Boolean(
    alwaysEnabledResult[`${STORAGE_PREFIX}alwaysEnabled`]
  );

  const saveSettingsResult = await chromeStorageLocal.get([
    `${STORAGE_PREFIX}saveSettings`,
  ]);
  saveSettingsToggle.checked = Boolean(
    saveSettingsResult[`${STORAGE_PREFIX}saveSettings`]
  );

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.id) return;
    const tabId = tab.id;
    chrome.tabs.sendMessage(tabId, { type: "GET_STATE" }, (response) => {
      enabledToggle.checked = response?.enabled || false;
    });
  });

  alwaysEnabledToggle.addEventListener("change", async () => {
    await chromeStorageLocal.set({
      [`${STORAGE_PREFIX}alwaysEnabled`]: alwaysEnabledToggle.checked,
    });
    console.log("Always enabled setting saved:", alwaysEnabledToggle.checked);
  });

  saveSettingsToggle.addEventListener("change", async () => {
    await chromeStorageLocal.set({
      [`${STORAGE_PREFIX}saveSettings`]: saveSettingsToggle.checked,
    });
    console.log("Save settings setting saved:", saveSettingsToggle.checked);
  });

  enabledToggle.addEventListener("change", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab || !tab.id) return;
      const tabId = tab.id;
      if (enabledToggle.checked) {
        // Enable: send message to content script to enable reader
        chrome.tabs.sendMessage(tabId, { type: "ENABLE_READER" });
      } else {
        // Disable: send message to content script to disable reader
        chrome.tabs.sendMessage(tabId, { type: "DISABLE_READER" });
      }
    });
  });
});
