// Popup script for Doom Emacs Bookmarks extension
// Handles user interactions in the popup interface

document.addEventListener('DOMContentLoaded', function() {
  // Set up event listeners
  document.getElementById('quick-capture').addEventListener('click', function() {
    captureBookmark('q');
  });
  
  document.getElementById('rich-capture').addEventListener('click', function() {
    captureBookmark('r');
  });
  
  document.getElementById('categorized-capture').addEventListener('click', function() {
    captureBookmark('c');
  });
  
  document.getElementById('open-bookmarks').addEventListener('click', function() {
    // In a real implementation, this would open the bookmarks file in Emacs
    // For now, just show a message
    const statusEl = document.getElementById('status');
    statusEl.textContent = 'This would open ~/org/bookmarks.org in Doom Emacs';
  });
});

// Function to capture bookmark
function captureBookmark(type) {
  const statusEl = document.getElementById('status');
  statusEl.textContent = 'Capturing...';
  
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const tab = tabs[0];
    const url = tab.url;
    const title = tab.title;
    
    // Show the command that should be captured (matching brave extension)
    statusEl.innerHTML = `Captured:<br>${title.substring(0, 25)}...<br><small>Run: ~/.config/doom/simple-bookmark-capture.sh ${type} "${url}" "${title}"</small>`;
    
    // Try to copy to clipboard as backup
    const textToCopy = `Run this command:\n~/.config/doom/simple-bookmark-capture.sh ${type} "${url}" "${title}"`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      console.log("Command copied to clipboard");
    }).catch(err => {
      console.log("Could not copy to clipboard:", err);
    });
    
    // Send to background script for processing
    chrome.runtime.sendMessage({
      action: 'capture',
      data: {
        url: url,
        title: title,
        type: type,
        timestamp: new Date().toISOString()
      }
    }, function(response) {
      console.log("Background script response:", response);
    });
    
    setTimeout(() => {
      statusEl.textContent = 'Ready to capture bookmarks';
    }, 10000); // Show longer for user to copy command
  });
}

// Removed unused functions to avoid conflicts
