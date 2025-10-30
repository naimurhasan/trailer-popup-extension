/**
 * Standalone test file for cleanMovieTitle function
 * Can be run with: node test.js
 *
 * Note: This duplicates the function from background.js for Node.js testing.
 * The source of truth is in background.js - keep them in sync.
 */

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
    /\b(Download|Watch|Stream|Online|FREE|Full Movie|Episode)\b/gi,
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

  // Remove season/episode patterns (e.g., "S01E01", "Season 1")
  title = title.replace(/\b(S\d{1,2}E\d{1,2}|Season\s*\d+|Episode\s*\d+)\b/gi, '');

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

  // If we ended up with nothing, return the original (truncated)
  if (title.length === 0) {
    title = rawTitle.trim().substring(0, 35).trim();
  }

  return title;
}

/**
 * Test function to verify title cleaning works correctly
 */
function testCleanMovieTitle() {
  const testCases = [
    {
      input: "Idly Kadai (2025) Dual Audio [Tamil, Hindi] WEB-DL, 480P, 720P & 1080P | GDRive",
      expected: "Idly Kadai (2025)"
    },
    {
      input: "Thamma (2025) Best Qualty – WEB-DL H264 AAC 1080p 720p 480p Download & Watch FREE",
      expected: "Thamma (2025)"
    },
    {
      input: "Spider-Man: No Way Home (2021) 1080p BluRay x264",
      expected: "Spider-Man: No Way Home (2021)"
    },
    {
      input: "The Batman – 4K UHD BluRay x265 HEVC 10bit",
      expected: "The Batman"
    },
    {
      input: "The Batman (2022) – 4K UHD BluRay x265 HEVC 10bit",
      expected: "The Batman (2022)"
    },
    {
      input: "O-Kay 2024 WEB-DL 720p Hindi",
      expected: "O-Kay 2024"
    },
    {
      input: "Inception (2010) 1080p BRRip x264 AAC",
      expected: "Inception (2010)"
    },
    {
      input: "Breaking Bad S01E01 720p WEBRip",
      expected: "Breaking Bad"
    },
    {
      input: "Avatar: The Way of Water (2022) | 4K 2160p | Download",
      expected: "Avatar: The Way of Water (2022)"
    },
    {
      input: "The Lord of the Rings: The Fellowship of the Ring Extended Edition BluRay 1080p",
      expected: "The Lord of the Rings"
    },
    {
      input: "Deadpool & Wolverine 2024 CAM x264",
      expected: "Deadpool & Wolverine 2024"
    },
    {
      input: "Dune Part Two (2024) – IMAX 4K HDR WEB-DL",
      expected: "Dune Part Two (2024)"
    },
    {
      input: "John Wick: Chapter 4 (2023) 1080p 720p 480p WEB-DL x264 ESub",
      expected: "John Wick: Chapter 4 (2023)"
    },
    {
      input: "Oppenheimer [2023] UHD BluRay 2160p TrueHD Atmos 7.1 HEVC",
      expected: "Oppenheimer [2023]"
    }
  ];

  console.log("🎬 Testing cleanMovieTitle() function...\n");
  console.log("=".repeat(80));

  let passed = 0;
  let failed = 0;

  testCases.forEach((test, index) => {
    const result = cleanMovieTitle(test.input);
    const isMatch = result === test.expected;

    if (isMatch) {
      passed++;
      console.log(`✅ Test ${index + 1}: PASSED`);
    } else {
      failed++;
      console.log(`❌ Test ${index + 1}: FAILED`);
    }

    console.log(`   Input:    "${test.input}"`);
    console.log(`   Expected: "${test.expected}"`);
    console.log(`   Got:      "${result}"`);
    console.log("-".repeat(80));
  });

  console.log("\n" + "=".repeat(80));
  console.log(`📊 Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);
  console.log("=".repeat(80));

  // Exit with error code if any tests failed
  if (failed > 0) {
    process.exit(1);
  }

  return { passed, failed, total: testCases.length };
}

// Run tests
testCleanMovieTitle();
