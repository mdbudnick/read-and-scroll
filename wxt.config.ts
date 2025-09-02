import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Read and Scroll",
    short_name: "ReadScroll",
    version: "1.0.2",
    description:
      "An extension that adds a reader mode and auto-scroll to any website in Chrome.",
    permissions: ["activeTab", "storage"],
    action: {
      default_icon: {
        "16": "icon/16.png",
        "32": "icon/32.png",
        "48": "icon/48.png",
        "128": "icon/128.png",
      },
    },
    icons: {
      "16": "icon/16.png",
      "32": "icon/32.png",
      "48": "icon/48.png",
      "128": "icon/128.png",
    },
    web_accessible_resources: [
      {
        resources: [
          "icon/128.png",
          "icon/48.png",
          "icon/32.png",
          "icon/16.png",
        ],
        matches: ["<all_urls>"],
      },
    ],
  },
});
