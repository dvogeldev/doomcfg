document.addEventListener('DOMContentLoaded', function() {
  const statusEl = document.getElementById('status');
  
  document.getElementById('quick-capture').addEventListener('click', function() {
    captureBookmark('q');
  });
  
  document.getElementById('rich-capture').addEventListener('click', function() {
    captureBookmark('r');
  });
  
  function captureBookmark(type) {
    statusEl.textContent = 'Capturing...';
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const tab = tabs[0];
      const url = tab.url;
      const title = tab.title;
      
      // Try to call the capture script via native messaging
      // This requires native messaging setup, but we'll also provide fallback
      captureToOrgFile(url, title, type);
    });
  }
  
  function captureToOrgFile(url, title, type) {
    // Since we can't directly call shell scripts from browser extensions,
    // we'll copy the bookmark data and provide instructions
    const bookmarkData = {
      url: url,
      title: title,
      type: type,
      timestamp: new Date().toISOString()
    };
    
    // Show the data that should be captured
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
      data: bookmarkData
    }, function(response) {
      console.log("Background script response:", response);
    });
    
    setTimeout(() => {
      statusEl.textContent = 'Ready to capture';
    }, 10000); // Show longer for user to copy command
  }
});
