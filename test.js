/**
 * Standalone test file for cleanMovieTitle function
 * Can be run with: node test.js
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

  // Remove year in parentheses or brackets (e.g., "(2024)" or "[2024]")
  title = title.replace(/[\(\[]\s*\d{4}\s*[\)\]]/g, '');

  // Remove standalone years (e.g., "2024", "2023")
  title = title.replace(/\b(19|20)\d{2}\b/g, '');

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

/**
 * Test function to verify title cleaning works correctly
 */
function testCleanMovieTitle() {
  const testCases = [
    {
      input: "Thamma (2025) Best Qualty – WEB-DL H264 AAC 1080p 720p 480p Download & Watch FREE",
      expected: "Thamma"
    },
    {
      input: "Spider-Man: No Way Home (2021) 1080p BluRay x264",
      expected: "Spider-Man: No Way Home"
    },
    {
      input: "The Batman – 4K UHD BluRay x265 HEVC 10bit",
      expected: "The Batman"
    },
    {
      input: "O-Kay 2024 WEB-DL 720p Hindi",
      expected: "O-Kay"
    },
    {
      input: "Inception (2010) 1080p BRRip x264 AAC",
      expected: "Inception"
    },
    {
      input: "Breaking Bad S01E01 720p WEBRip",
      expected: "Breaking Bad"
    },
    {
      input: "Avatar: The Way of Water (2022) | 4K 2160p | Download",
      expected: "Avatar: The Way of Water"
    },
    {
      input: "The Lord of the Rings: The Fellowship of the Ring Extended Edition BluRay 1080p",
      expected: "The Lord of the Rings"
    },
    {
      input: "Deadpool & Wolverine 2024 CAM x264",
      expected: "Deadpool & Wolverine"
    },
    {
      input: "Dune Part Two (2024) – IMAX 4K HDR WEB-DL",
      expected: "Dune Part Two"
    },
    {
      input: "John Wick: Chapter 4 (2023) 1080p 720p 480p WEB-DL x264 ESub",
      expected: "John Wick: Chapter 4"
    },
    {
      input: "Oppenheimer [2023] UHD BluRay 2160p TrueHD Atmos 7.1 HEVC",
      expected: "Oppenheimer"
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
