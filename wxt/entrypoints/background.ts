export default defineBackground(() => {
  chrome.runtime.onInstalled.addListener(() => {
    console.log("Read and Scroll extension installed.");
  });
});
