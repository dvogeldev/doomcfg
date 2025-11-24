// Simple background script for bookmark capture
chrome.runtime.onInstalled.addListener(() => {
  console.log("Doom Bookmarks extension installed");
});

// Handle storage operations
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    console.log("Storage changed:", changes);
  }
});

// Handle messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received:", request);
  sendResponse({status: "received"});
});
