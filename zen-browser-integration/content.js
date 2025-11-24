// Content script for Doom Emacs Bookmarks extension
// Extracts page information and handles keyboard shortcuts

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "quick-capture") {
    captureCurrentPage("q");
  } else if (request.action === "rich-capture") {
    captureCurrentPage("r");
  }
});

// Function to capture current page
function captureCurrentPage(type) {
  const url = window.location.href;
  const title = document.title;
  
  // Send data to background script
  chrome.runtime.sendMessage({
    action: "capture",
    info: {
      pageUrl: url,
      title: title
    },
    type: type
  });
  
  // Show visual feedback
  showCaptureFeedback(type);
}

// Show visual feedback when capturing
function showCaptureFeedback(type) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #2d3748;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 10000;
    font-family: system-ui, sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    transition: opacity 0.3s ease;
  `;
  
  const message = type === 'q' ? 'Quick capture initiated' : 'Rich capture initiated';
  overlay.textContent = `📚 ${message}`;
  
  document.body.appendChild(overlay);
  
  // Remove after 3 seconds
  setTimeout(() => {
    overlay.style.opacity = '0';
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 300);
  }, 3000);
}

// Extract page metadata for better bookmark information
function extractPageMetadata() {
  const metadata = {
    url: window.location.href,
    title: document.title,
    description: '',
    keywords: '',
    author: '',
    siteName: '',
    favicon: ''
  };
  
  // Get meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metadata.description = metaDesc.getAttribute('content') || '';
  }
  
  // Get OpenGraph description
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) {
    metadata.description = ogDesc.getAttribute('content') || metadata.description;
  }
  
  // Get keywords
  const metaKeywords = document.querySelector('meta[name="keywords"]');
  if (metaKeywords) {
    metadata.keywords = metaKeywords.getAttribute('content') || '';
  }
  
  // Get site name from OpenGraph
  const ogSite = document.querySelector('meta[property="og:site_name"]');
  if (ogSite) {
    metadata.siteName = ogSite.getAttribute('content') || '';
  }
  
  // Get favicon
  const favicon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
  if (favicon) {
    metadata.favicon = favicon.getAttribute('href') || '';
  }
  
  // Get author
  const author = document.querySelector('meta[name="author"], meta[property="article:author"]');
  if (author) {
    metadata.author = author.getAttribute('content') || '';
  }
  
  return metadata;
}

// Auto-capture functionality for specific patterns
function initAutoCapture() {
  // Only auto-capture on specific domains or patterns
  const autoCaptureDomains = [
    'github.com',
    'stackoverflow.com',
    'docs.google.com',
    'arxiv.org',
    'medium.com'
  ];
  
  const currentDomain = window.location.hostname;
  const shouldAutoCapture = autoCaptureDomains.some(domain => 
    currentDomain.includes(domain)
  );
  
  if (shouldAutoCapture) {
    // Add visual indicator that this page can be auto-captured
    const indicator = document.createElement('div');
    indicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: #4299e1;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      z-index: 10000;
      font-family: system-ui, sans-serif;
      font-size: 12px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    indicator.textContent = '📚 Quick capture';
    indicator.onclick = () => captureCurrentPage('q');
    
    document.body.appendChild(indicator);
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAutoCapture);
} else {
  initAutoCapture();
}
