// YouTube Data API v3 - you'll need to get your own API key from Google Cloud Console
// For now, we'll use a direct search approach without API key using embed
const YOUTUBE_SEARCH_URL = 'https://www.youtube.com/results?search_query=';

let currentQuery = '';

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  loadTrailer();

  // Retry button handler
  document.getElementById('retryBtn').addEventListener('click', () => {
    loadTrailer();
  });
});

// Load trailer based on selected text
function loadTrailer() {
  showLoading();

  // Get the search query from storage
  chrome.runtime.sendMessage({ action: "getSearchQuery" }, (response) => {
    if (response && response.query) {
      currentQuery = response.query;
      document.getElementById('searchQuery').textContent = `"${currentQuery}"`;
      searchYouTubeTrailer(currentQuery);
    } else {
      showError();
    }
  });
}

// Search for trailer on YouTube
async function searchYouTubeTrailer(query) {
  try {
    // Construct search query for trailer
    const searchQuery = encodeURIComponent(`${query} official trailer`);

    // Use YouTube's oEmbed API to get video information
    const searchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;

    // Since we can't directly access YouTube API without a key,
    // we'll construct a likely video URL based on search
    // Alternative: Use YouTube Data API v3 with API key

    // For demonstration, we'll use a noembed service or direct embed
    // In production, you should use YouTube Data API v3

    // Try to fetch using a public API
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${searchQuery}&format=json`)
      .catch(() => null);

    // Since direct API might not work without proper video ID,
    // we'll create an embedded search results page
    // Better approach: Get YouTube Data API key and search properly

    // For now, let's use invidious API (public YouTube frontend)
    const invidiousResponse = await fetch(`https://inv.nadeko.net/api/v1/search?q=${searchQuery}&type=video`)
      .catch(() => null);

    if (invidiousResponse && invidiousResponse.ok) {
      const data = await invidiousResponse.json();
      if (data && data.length > 0) {
        const videoId = data[0].videoId;
        displayVideo(videoId);
        return;
      }
    }

    // Fallback: show error and suggest manual search
    showError();

  } catch (error) {
    console.error('Error searching for trailer:', error);
    showError();
  }
}

// Display video in iframe
function displayVideo(videoId) {
  const videoContainer = document.getElementById('videoContainer');
  const videoPlayer = document.getElementById('videoPlayer');
  const loading = document.getElementById('loading');

  // Set iframe source
  videoPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

  // Hide loading, show video
  loading.style.display = 'none';
  videoContainer.style.display = 'block';
}

// Show loading state
function showLoading() {
  document.getElementById('loading').style.display = 'flex';
  document.getElementById('error').style.display = 'none';
  document.getElementById('videoContainer').style.display = 'none';
}

// Show error state
function showError() {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('error').style.display = 'block';
  document.getElementById('videoContainer').style.display = 'none';
}
