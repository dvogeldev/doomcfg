// Background script for Doom Emacs Bookmarks extension
// Handles communication between content scripts and external capture script

let config = {
  captureScript: "/home/david/.config/doom/browser-capture.sh",
  fallbackScript: "~/.config/doom/browser-capture.sh"
};

// Install context menu items
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "quick-capture",
    title: "Quick capture to Doom Emacs",
    contexts: ["link", "page"]
  });
  
  chrome.contextMenus.create({
    id: "rich-capture",
    title: "Rich capture to Doom Emacs", 
    contexts: ["link", "page"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  captureBookmark(info, "q"); // Default to quick capture
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: command
    });
  });
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "capture") {
    captureBookmark(request.info, request.type);
  }
});

// Function to capture bookmark using external script
function captureBookmark(info, type) {
  const url = info.linkUrl || info.pageUrl;
  const title = info.linkText || info.title || extractTitle(info.pageUrl);
  
  // Execute capture script
  executeCaptureScript(url, title, "", type)
    .then(result => {
      if (result.success) {
        showNotification("Bookmark captured successfully!", "success");
      } else {
        showNotification("Failed to capture bookmark", "error");
      }
    })
    .catch(error => {
      console.error("Capture failed:", error);
      showNotification("Error capturing bookmark", "error");
    });
}

// Execute the capture script
async function executeCaptureScript(url, title, description, type) {
  try {
    const bookmarkData = {
      url: url,
      title: title,
      description: description,
      type: type,
      timestamp: new Date().toISOString()
    };
    
    // Store in extension storage for later processing
    chrome.storage.local.get(['bookmarks'], (result) => {
      const bookmarks = result.bookmarks || [];
      bookmarks.push(bookmarkData);
      chrome.storage.local.set({bookmarks: bookmarks});
    });
    
    return {success: true};
  } catch (error) {
    console.error("Script execution failed:", error);
    return {success: false, error: error.message};
  }
}

// Extract title from URL if not provided
function extractTitle(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '').replace('.com', '').replace('.org', '').replace('.net', '');
  } catch (e) {
    return "Unknown Title";
  }
}

// Show notification
function showNotification(message, type) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon-48.png",
    title: "Doom Emacs Bookmarks",
    message: message
  });
}

// Handle extension installation
chrome.runtime.onStartup.addListener(() => {
  console.log("Doom Emacs Bookmarks extension started");
});
