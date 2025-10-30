/**
 * Content Script - Floating Trailer Button
 * Shows a floating button when text is selected or element is clicked
 */

let floatingButton = null;
let selectionTimeout = null;
let currentSearchText = null; // Stores text for trailer search

// Initialize
function init() {
  createFloatingButton();
  attachListeners();
}

// Create the floating button element
function createFloatingButton() {
  floatingButton = document.createElement('div');
  floatingButton.id = 'movie-trailer-floating-btn';
  floatingButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H3zm3 3.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
    </svg>
    <span>Trailer</span>
  `;

  floatingButton.style.display = 'none';
  document.body.appendChild(floatingButton);

  // Click handler
  floatingButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleTrailerClick();
  });

  // Prevent button from disappearing when clicking it
  floatingButton.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
}

// Attach event listeners
function attachListeners() {
  // Show button on Alt+Right-click (with selection OR extract from element)
  document.addEventListener('contextmenu', (e) => {
    // Only show button if Alt key is pressed (Option on Mac)
    if (!e.altKey) {
      hideButton();
      return;
    }

    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText.length >= 3) {
      // Text is selected - use selected text
      showButtonAtPosition(e.clientX, e.clientY, selectedText);
    } else {
      // No selection - try to extract from clicked element
      const extractedText = extractMovieTitleFromElement(e.target);

      if (extractedText && extractedText.length >= 3) {
        showButtonAtPosition(e.clientX, e.clientY, extractedText);
      } else {
        hideButton();
      }
    }
  });

  // Hide button when clicking elsewhere
  document.addEventListener('mousedown', (e) => {
    if (e.target !== floatingButton && !floatingButton.contains(e.target)) {
      hideButton();
    }
  });

  // Hide button when left-clicking
  document.addEventListener('click', (e) => {
    if (e.target !== floatingButton && !floatingButton.contains(e.target)) {
      hideButton();
    }
  });

  // Hide on scroll
  document.addEventListener('scroll', hideButton, true);

  // Hide on window resize
  window.addEventListener('resize', hideButton);
}

/**
 * Intelligently extracts movie title from clicked HTML element
 * Handles various website structures and DOM patterns
 * @param {HTMLElement} element - The clicked element
 * @returns {string} - Extracted text or empty string
 */
function extractMovieTitleFromElement(element) {
  if (!element || element === document.body || element === document.documentElement) {
    return '';
  }

  // STRATEGY 1: Check for data attributes (common in modern web apps)
  const dataAttributes = [
    'data-title',
    'data-name',
    'data-movie-title',
    'data-video-title',
    'aria-label',
    'title'
  ];

  for (const attr of dataAttributes) {
    const value = element.getAttribute(attr);
    if (value && value.trim().length >= 3 && value.trim().length <= 150) {
      return value.trim();
    }
  }

  // STRATEGY 2: Look for common title selectors within clicked element
  const titleSelectors = [
    '.title',
    '.movie-title',
    '.video-title',
    '.name',
    '.film-title',
    'h1', 'h2', 'h3', 'h4',
    '[class*="title"]',
    '[class*="name"]'
  ];

  for (const selector of titleSelectors) {
    const titleElement = element.querySelector(selector);
    if (titleElement) {
      const text = (titleElement.innerText || titleElement.textContent || '').trim();
      if (text.length >= 3 && text.length <= 150) {
        return text;
      }
    }
  }

  // STRATEGY 3: Try closest parent container (movie card, article, etc.)
  const containerSelectors = [
    '.movie-card',
    '.video-card',
    '.film-card',
    '.card',
    'article',
    '.item',
    '[class*="movie"]',
    '[class*="video"]'
  ];

  for (const selector of containerSelectors) {
    const container = element.closest(selector);
    if (container && container !== element) {
      // Check if container has title selector
      for (const titleSelector of titleSelectors) {
        const titleElement = container.querySelector(titleSelector);
        if (titleElement) {
          const text = (titleElement.innerText || titleElement.textContent || '').trim();
          if (text.length >= 3 && text.length <= 150) {
            return text;
          }
        }
      }
    }
  }

  // STRATEGY 4: Use element's own text content
  let text = element.innerText || element.textContent || '';
  text = text.trim();

  // If text is too long, it's likely a description or full page content
  if (text.length > 150) {
    // Try to find title within the text
    // Look for heading tags first
    const heading = element.querySelector('h1, h2, h3');
    if (heading) {
      text = (heading.innerText || heading.textContent || '').trim();
    } else {
      // Take first line (often the title)
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      text = lines[0] || '';
    }
  }

  // STRATEGY 5: If text is too short, try parent element (max 3 levels up)
  if (text.length < 3) {
    const parent = element.parentElement;
    if (parent && parent !== document.body && parent !== document.documentElement) {
      // Prevent infinite recursion - check if we've already tried this parent
      const parentText = extractMovieTitleFromElement(parent);
      if (parentText && parentText !== text) {
        return parentText;
      }
    }
  }

  // Final validation
  if (text.length >= 3 && text.length <= 150) {
    return text;
  }

  return '';
}

// Show the floating button at a specific position (near right-click)
function showButtonAtPosition(clientX, clientY, textToShow = null) {
  // Store text for later use
  if (textToShow) {
    currentSearchText = textToShow;
  } else {
    // Fallback to selection if no text provided
    const selection = window.getSelection();
    currentSearchText = selection.toString().trim();
  }
  // Calculate button position with smart auto-positioning
  const buttonWidth = 110;
  const buttonHeight = 40;
  const padding = 12;

  let top, left;

  // Check if there's space below the cursor
  const spaceBelow = window.innerHeight - clientY - buttonHeight - padding;
  const spaceAbove = clientY - buttonHeight - padding;

  // Position below cursor if space, otherwise above
  if (spaceBelow > buttonHeight + padding) {
    top = window.scrollY + clientY + padding;
  } else if (spaceAbove > buttonHeight + padding) {
    top = window.scrollY + clientY - buttonHeight - padding;
  } else {
    // Not enough space vertically, position to the side
    top = window.scrollY + clientY - (buttonHeight / 2);
  }

  // Position to the right of cursor
  left = window.scrollX + clientX + padding;

  // If not enough space on right, position to the left
  if (left + buttonWidth > window.innerWidth + window.scrollX - padding) {
    left = window.scrollX + clientX - buttonWidth - padding;
  }

  // Keep button within viewport
  const maxLeft = window.innerWidth + window.scrollX - buttonWidth - padding;
  const minLeft = window.scrollX + padding;
  left = Math.max(minLeft, Math.min(left, maxLeft));

  const maxTop = window.innerHeight + window.scrollY - buttonHeight - padding;
  const minTop = window.scrollY + padding;
  top = Math.max(minTop, Math.min(top, maxTop));

  // Apply position
  floatingButton.style.top = `${top}px`;
  floatingButton.style.left = `${left}px`;
  floatingButton.style.display = 'flex';

  // Trigger animation
  setTimeout(() => {
    floatingButton.classList.add('show');
  }, 10);
}

// Hide the floating button
function hideButton() {
  floatingButton.classList.remove('show');
  setTimeout(() => {
    floatingButton.style.display = 'none';
  }, 200);
}

// Handle trailer button click
function handleTrailerClick() {
  // Use stored text instead of relying on selection
  const searchText = currentSearchText;

  if (searchText) {
    // Send message to background script to open trailer
    chrome.runtime.sendMessage({
      action: 'searchTrailer',
      query: searchText
    });

    // Hide the button
    hideButton();

    // Clear stored text
    currentSearchText = null;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
