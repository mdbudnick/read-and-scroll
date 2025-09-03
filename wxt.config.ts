import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Read and Scroll",
    short_name: "ReadScroll",
    version: "2.0.2",
    description:
      "An extension that adds a reader mode and auto-scroll to any website in Chrome.",
    permissions: ["activeTab", "storage"],
    action: {
      default_icon: {
        "16": "icon/rs-16.png",
        "32": "icon/rs-32.png",
        "48": "icon/rs-48.png",
        "64": "icon/rs-64.png",
        "128": "icon/rs-128.png",
      },
    },
    browser_action: {
      default_icon: {
        "16": "icon/rs-16.png",
        "32": "icon/rs-32.png",
        "48": "icon/rs-48.png",
        "64": "icon/rs-64.png",
        "128": "icon/rs-128.png",
      },
    },
    icons: {
      "16": "icon/rs-16.png",
      "32": "icon/rs-32.png",
      "48": "icon/rs-48.png",
      "64": "icon/rs-64.png",
      "128": "icon/rs-128.png",
    },
    web_accessible_resources: [
      {
        resources: [
          "icon/rs-16.png",
          "icon/rs-32.png",
          "icon/rs-48.png",
          "icon/rs-64.png",
          "icon/rs-128.png",
        ],
        matches: ["<all_urls>"],
      },
    ],
  },
});
