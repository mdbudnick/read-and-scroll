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

import * as React from "react";
import { createRoot } from "react-dom/client";

const Popup: React.FC = () => {
  return React.createElement(
    "div",
    { style: { padding: 16 } },
    "Read and Scroll Popup"
  );
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(React.createElement(Popup));
}
