/**
 * Intelligently extracts movie/show name from messy titles
 * Handles: quality tags, codecs, year, promotional text, etc.
 * @param {string} rawTitle - The raw selected text
 * @returns {string} - Cleaned movie/show name
 */
function cleanMovieTitle(rawTitle) {
  if (!rawTitle || typeof rawTitle !== 'string') return '';

  let title = rawTitle.trim();

  // Remove common quality/format patterns (case insensitive)
  const qualityPatterns = [
    // Resolutions
    /\b(4K|2160p|1080p|720p|480p|360p|240p|UHD|HD|SD)\b/gi,
    // Codecs & formats
    /\b(H\.?264|H\.?265|x264|x265|HEVC|AVC|AAC|MP3|AC3|DTS|FLAC)\b/gi,
    // Sources
    /\b(WEB-?DL|WEBRip|BluRay|BRRip|DVDRip|HDRip|CAM|TS|TC|IMAX)\b/gi,
    // File extensions
    /\.(mkv|mp4|avi|mov|wmv|flv|webm)\b/gi,
    // Additional quality info
    /\b(10bit|8bit|HDR|SDR)\b/gi,
    // Promotional text
    /\b(Download|Watch|Stream|Online|FREE|Full Movie|Episode)\b/gi,
    // Common separators with junk
    /\b(Best Qualty?|Best Quality?|High Quality?|Full HD|Ultra HD)\b/gi,
    // Subtitles & Audio
    /\b(ESub|MSub|Multi|Dual|TrueHD|Atmos|DTS-HD|Hindi|English|Tamil|Telugu)\b/gi,
    // Audio channels
    /\b(\d+\.\d+)\b/g,
    // Extended/Special editions
    /\b(Extended Edition|Special Edition|Director's Cut|Unrated|Remastered)\b/gi,
  ];

  qualityPatterns.forEach(pattern => {
    title = title.replace(pattern, ' ');
  });

  // Split on long dashes/separators (–, —, |, ::) and take the first part
  // These are usually separators between title and quality info
  const separators = /[–—|]|::/;
  if (separators.test(title)) {
    title = title.split(separators)[0];
  }

  // Years are kept in all cases now
  // - Years in parentheses/brackets: "Movie (2024)" - intentional identifiers
  // - Years after title: "O-Kay 2024" - part of the movie identity
  // The quality tags removal above already cleaned unnecessary info

  // Remove season/episode patterns (e.g., "S01E01", "Season 1")
  title = title.replace(/\b(S\d{1,2}E\d{1,2}|Season\s*\d+|Episode\s*\d+)\b/gi, '');

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

  // Final cleanup: remove trailing special characters
  title = title.replace(/[\s\-_:,;]+$/, '').trim();

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
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "showTrailer" && info.selectionText) {
    // Clean up the selected text to extract just the movie/show name
    const cleanedTitle = cleanMovieTitle(info.selectionText);

    // Use Google's "I'm Feeling Lucky" to directly open the first YouTube result
    // This searches: "movie name" official trailer site:youtube.com
    const searchQuery = encodeURIComponent(`"${cleanedTitle}" official trailer site:youtube.com`);
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
});
