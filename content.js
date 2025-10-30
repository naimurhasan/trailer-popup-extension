/**
 * Content Script - Floating Trailer Button
 * Shows a floating button when text is selected
 */

let floatingButton = null;
let selectionTimeout = null;

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
  // Show button ONLY on right-click over selected text
  document.addEventListener('contextmenu', (e) => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText.length >= 3) {
      // Show button near the right-click position
      showButtonAtPosition(e.clientX, e.clientY);
    } else {
      hideButton();
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

// Show the floating button at a specific position (near right-click)
function showButtonAtPosition(clientX, clientY) {
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
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  if (selectedText) {
    // Send message to background script to open trailer
    chrome.runtime.sendMessage({
      action: 'searchTrailer',
      query: selectedText
    });

    // Hide the button
    hideButton();

    // Clear selection (optional - comment out if you want to keep selection)
    // selection.removeAllRanges();
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
