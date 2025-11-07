/**
 * Intelligently extracts movie/show name from messy titles
 * Handles: quality tags, codecs, year, promotional text, etc.
 * @param {string} rawTitle - The raw selected text
 * @returns {string} - Cleaned movie/show name
 */
function cleanMovieTitle(rawTitle) {
  if (!rawTitle || typeof rawTitle !== 'string') return '';

  let title = rawTitle.trim();

  // PHASE 1: Early truncation at "stop words" (quality indicators)
  // This prevents processing junk and leaves cleaner results
  const stopWords = [
    'WEB-DL', 'WEBRip', 'BluRay', 'Blu-Ray', 'BRRip', 'DVDRip', 'HDRip', 'HDTV',
    'Dual Audio', 'Multi Audio', 'Dubbed',
    'GDrive', 'GDRive', 'Download', 'Watch Online',
    '480p', '720p', '1080p', '2160p', '4K'
  ];

  const stopWordPattern = new RegExp(`\\b(${stopWords.join('|')})\\b`, 'i');
  const stopMatch = title.search(stopWordPattern);
  if (stopMatch !== -1) {
    title = title.substring(0, stopMatch);
  }

  // Split on long dashes/separators (–, —, |, ::) and take the first part
  // These are usually separators between title and quality info
  const separators = /[–—|]|::/;
  if (separators.test(title)) {
    title = title.split(separators)[0];
  }

  // PHASE 2: Remove quality/format patterns (for any remaining junk)
  const qualityPatterns = [
    // Audio/Language phrases (match phrases first, before individual words)
    /\b(Dual\s+Audio|Multi\s+Audio|Dubbed|Original\s+Audio)\b/gi,
    // Resolutions
    /\b(4K|2160p|1080p|720p|480p|360p|240p|UHD|HD|SD)\b/gi,
    // Codecs & formats
    /\b(H\.?264|H\.?265|x264|x265|HEVC|AVC|AAC|MP3|AC3|DTS|FLAC)\b/gi,
    // Sources
    /\b(WEB-?DL|WEBRip|BluRay|Blu-Ray|BRRip|DVDRip|HDRip|CAM|TS|TC|IMAX)\b/gi,
    // File extensions
    /\.(mkv|mp4|avi|mov|wmv|flv|webm)\b/gi,
    // Additional quality info
    /\b(10bit|8bit|HDR|SDR)\b/gi,
    // Promotional text
    /\b(Download|Watch|Stream|Online|FREE|Full Movie)\b/gi,
    // Common separators with junk
    /\b(Best Qualty?|Best Quality?|High Quality?|Full HD|Ultra HD)\b/gi,
    // Subtitles & Audio & Languages (including "Audio" standalone)
    /\b(ESub|MSub|Multi|Dual|TrueHD|Atmos|DTS-HD|Hindi|English|Tamil|Telugu|Audio)\b/gi,
    // Audio channels
    /\b(\d+\.\d+)\b/g,
    // Extended/Special editions
    /\b(Extended Edition|Special Edition|Director's Cut|Unrated|Remastered)\b/gi,
  ];

  qualityPatterns.forEach(pattern => {
    title = title.replace(pattern, ' ');
  });

  // Years are kept in all cases now
  // - Years in parentheses/brackets: "Movie (2024)" - intentional identifiers
  // - Years after title: "O-Kay 2024" - part of the movie identity
  // The quality tags removal above already cleaned unnecessary info

  // Remove season/episode patterns (e.g., "S01E01", "S1", "Season 1", "EP 1")
  // First remove patterns inside brackets/parens: [Episode 6], (S01), [EP 3], etc.
  title = title.replace(/[\[\(]\s*(S\d{1,2}(E\d{1,2})?|Season\s*\d+|Episode\s*\d+|EP\s*\d+)\s*[\]\)]/gi, '');
  // Then remove standalone patterns
  title = title.replace(/\b(S\d{1,2}(E\d{1,2})?|Season\s*\d+|Episode\s*\d+|EP\s*\d+)\b/gi, '');

  // PHASE 3: Cleanup empty brackets and leftover punctuation
  // Remove empty brackets/parentheses: [], (), [,], [, ,], etc.
  title = title.replace(/[\[\(]\s*[,;\s]*\s*[\]\)]/g, '');
  title = title.replace(/[\[\(][,;\s]+[\]\)]/g, '');

  // Clean up multiple spaces and trim
  title = title.replace(/\s+/g, ' ').trim();

  // If still too long (>35 chars), try to intelligently truncate
  if (title.length > 35) {
    // Try splitting on colon (often separates main title from subtitle)
    if (title.includes(':')) {
      const mainPart = title.split(':')[0].trim();
      if (mainPart.length >= 3) { // Make sure it's not too short
        title = mainPart;
      }
    }

    // If still too long, truncate at word boundary near 35 chars
    if (title.length > 35) {
      const words = title.split(' ');
      let truncated = '';
      for (const word of words) {
        if ((truncated + word).length <= 35) {
          truncated += (truncated ? ' ' : '') + word;
        } else {
          break;
        }
      }
      if (truncated.length >= 3) {
        title = truncated;
      }
    }
  }

  // PHASE 4: Final cleanup - remove trailing/leading special characters
  // But preserve closing parens/brackets that are part of years like "(2025)" or "[2023]"
  // And preserve & when it's part of the title like "Deadpool & Wolverine"
  title = title.replace(/[\s\-_:,;|]+$/, '').trim(); // trailing punctuation (not & or brackets)
  title = title.replace(/^[\s\-_:,;|&\[\]()]+/, '').trim();  // leading junk

  // Remove standalone punctuation (but not & between words)
  title = title.replace(/\s+[,;|]+\s+/g, ' ').trim();

  // PHASE 5: Handle truncation artifacts
  // If title was cut and left fragments before [ or ( like "Title S1 [" or "Title EP [",
  // remove everything from the last space before such patterns
  // Match patterns like: "S1", "S01", "EP 1", "Episode", etc. followed by [ or (
  title = title.replace(/\s+(S\d+|EP\s*\d*|Episode\s*\d*)\s*[\[\(]?\s*$/, '').trim();

  // Also clean up if brackets/parens are left open at the end without closing
  title = title.replace(/[\[\(]\s*$/, '').trim();

  // If we ended up with nothing, return the original (truncated)
  if (title.length === 0) {
    title = rawTitle.trim().substring(0, 35).trim();
  }

  return title;
}

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
    // Send message to content script to show confirmation popup
    chrome.tabs.sendMessage(tab.id, {
      action: 'showConfirmation',
      text: info.selectionText
    });
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "searchTrailer") {
    openTrailer(message.query);
    sendResponse({success: true});
  } else if (message.action === "cleanTitle") {
    // Clean the title and send back to content script
    const cleanedTitle = cleanMovieTitle(message.text);
    sendResponse({cleanedTitle: cleanedTitle});
  }
  return true;
});

// Open trailer in popup window
function openTrailer(rawText) {
  // Clean up the selected text to extract just the movie/show name
  const cleanedTitle = cleanMovieTitle(rawText);

  // Use Google's "I'm Feeling Lucky" to directly open the first YouTube result
  // This searches: "movie name" official trailer site:youtube.com
  const searchQuery = encodeURIComponent(`${cleanedTitle} official trailer site:youtube.com`);
  const googleLuckyUrl = `https://www.google.com/search?btnI=1&q=${searchQuery}`;

  // Open in a popup window
  chrome.windows.create({
    url: googleLuckyUrl,
    type: "popup",
    width: 1000,
    height: 700,
    focused: true
  });
}
