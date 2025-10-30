// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "showTrailer",
    title: "Show Trailer",
    contexts: ["selection"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "showTrailer" && info.selectionText) {
    // Store the selected text in chrome.storage
    chrome.storage.local.set({ searchQuery: info.selectionText }, () => {
      // Open the popup by creating a new window or using the action popup
      chrome.action.openPopup();
    });
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSearchQuery") {
    chrome.storage.local.get(["searchQuery"], (result) => {
      sendResponse({ query: result.searchQuery || "" });
    });
    return true; // Will respond asynchronously
  }
});
