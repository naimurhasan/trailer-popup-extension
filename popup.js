/**
 * Movie Trailer Popup - Simple and reliable approach
 * Uses Google "I'm Feeling Lucky" search - no API needed, no CORS issues
 */

let currentQuery = '';

// Initialize popup - always runs fresh on each popup open
document.addEventListener('DOMContentLoaded', () => {
  // Reset all UI elements to ensure clean state
  resetUI();

  // Load trailer with fresh selection
  loadTrailer();

  // Manual search button handler
  document.getElementById('searchBtn').addEventListener('click', () => {
    const query = document.getElementById('movieInput').value.trim();
    if (query) {
      searchTrailer(query);
    }
  });

  // Enter key handler for input field
  document.getElementById('movieInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = document.getElementById('movieInput').value.trim();
      if (query) {
        searchTrailer(query);
      }
    }
  });

  // Retry button handler
  document.getElementById('retryBtn').addEventListener('click', () => {
    loadTrailer();
  });
});

// Reset UI to initial state
function resetUI() {
  currentQuery = '';
  document.getElementById('movieInput').value = '';
  document.getElementById('searchQuery').textContent = '';
}

// Load trailer - try to get selected text first
function loadTrailer() {
  showLoading();

  // Try to get selected text from the current tab
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (!tabs || tabs.length === 0) {
      // No active tab, show manual input
      console.log('No active tab found');
      showManualInput();
      return;
    }

    const tabId = tabs[0].id;

    // Inject script to get CURRENT selection from the page
    chrome.scripting.executeScript({
      target: {tabId: tabId},
      func: () => {
        // Force fresh selection capture
        const selection = window.getSelection();
        const text = selection.toString();
        console.log('Captured selection:', text);
        return text;
      }
    }, (results) => {
      if (chrome.runtime.lastError) {
        // Can't access tab (e.g., chrome:// pages, PDF viewers, etc.)
        console.log('Cannot access tab:', chrome.runtime.lastError.message);
        showManualInput();
        return;
      }

      const selectedText = results && results[0] && results[0].result;

      if (selectedText && selectedText.trim().length > 0) {
        // Text was selected, search for trailer immediately
        console.log('Text selected, searching for:', selectedText.trim());
        searchTrailer(selectedText.trim());
      } else {
        // No text selected, show manual input
        console.log('No text selected, showing manual input');
        showManualInput();
      }
    });
  });
}

// Search for trailer using Google "I'm Feeling Lucky"
function searchTrailer(query) {
  showLoading();

  // Send query to background script to clean and search
  // Background.js has the cleanMovieTitle function
  chrome.runtime.sendMessage({
    action: "searchTrailer",
    query: query
  }, () => {
    // Close this popup after the search is initiated
    window.close();
  });
}

// Show manual input form
function showManualInput() {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('error').style.display = 'none';
  document.getElementById('videoContainer').style.display = 'none';
  document.getElementById('manualInput').style.display = 'block';

  // Auto-focus the input field
  document.getElementById('movieInput').focus();
}

// Show loading state
function showLoading() {
  document.getElementById('loading').style.display = 'flex';
  document.getElementById('error').style.display = 'none';
  document.getElementById('videoContainer').style.display = 'none';
  document.getElementById('manualInput').style.display = 'none';
}

// Show error state
function showError() {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('error').style.display = 'block';
  document.getElementById('videoContainer').style.display = 'none';
  document.getElementById('manualInput').style.display = 'none';
}
