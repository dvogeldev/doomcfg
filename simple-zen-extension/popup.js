document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('capture').addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const tab = tabs[0];
      const url = tab.url;
      const title = tab.title;
      
      document.getElementById('status').textContent = `Captured: ${title}`;
      
      // Send to background script or store locally
      chrome.storage.local.get(['bookmarks'], function(result) {
        const bookmarks = result.bookmarks || [];
        bookmarks.push({
          url: url,
          title: title,
          timestamp: new Date().toISOString()
        });
        chrome.storage.local.set({bookmarks: bookmarks});
      });
      
      setTimeout(() => {
        document.getElementById('status').textContent = '';
      }, 3000);
    });
  });
});
