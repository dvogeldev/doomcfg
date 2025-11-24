// Popup script for Doom Emacs Bookmarks extension
// Handles user interactions in the popup interface

document.addEventListener('DOMContentLoaded', function() {
  // Get current tab information
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentTab = tabs[0];
    updateStatus(`Ready to capture: ${currentTab.title.substring(0, 50)}...`);
  });
  
  // Set up event listeners
  document.getElementById('quick-capture').addEventListener('click', () => {
    captureBookmark('q');
  });
  
  document.getElementById('rich-capture').addEventListener('click', () => {
    captureBookmark('r');
  });
  
  document.getElementById('categorized-capture').addEventListener('click', () => {
    captureBookmark('c');
  });
  
  document.getElementById('open-bookmarks').addEventListener('click', () => {
    // In a real implementation, this would open the bookmarks file in Emacs
    // For now, just show a message
    updateStatus('This would open ~/org/bookmarks.org in Doom Emacs');
  });
});

// Function to capture bookmark
function captureBookmark(type) {
  const typeMap = {
    'q': 'Quick',
    'r': 'Rich',
    'c': 'Categorized'
  };
  
  updateStatus(`Capturing with ${typeMap[type]} capture...`);
  
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const tab = tabs[0];
    
    chrome.tabs.sendMessage(tab.id, {
      action: type === 'q' ? 'quick-capture' : 
              type === 'r' ? 'rich-capture' : 'categorized-capture'
    }, function(response) {
      if (chrome.runtime.lastError) {
        updateStatus('Error: Could not capture bookmark', 'error');
      } else {
        updateStatus(`${typeMap[type]} capture initiated!`, 'success');
      }
    });
  });
}

// Update status message
function updateStatus(message, type = 'info') {
  const statusElement = document.getElementById('status');
  statusElement.textContent = message;
  statusElement.className = `status ${type}`;
  
  if (type !== 'info') {
    setTimeout(() => {
      updateStatus('Ready to capture bookmarks', 'info');
    }, 3000);
  }
}

// Store recent captures for quick access
function storeCapture(bookmarkData) {
  chrome.storage.local.get(['recentCaptures'], function(result) {
    const recentCaptures = result.recentCaptures || [];
    recentCaptures.unshift(bookmarkData);
    
    // Keep only last 10 captures
    if (recentCaptures.length > 10) {
      recentCaptures = recentCaptures.slice(0, 10);
    }
    
    chrome.storage.local.set({recentCaptures: recentCaptures});
  });
}

// Load recent captures
function loadRecentCaptures(callback) {
  chrome.storage.local.get(['recentCaptures'], function(result) {
    callback(result.recentCaptures || []);
  });
}
