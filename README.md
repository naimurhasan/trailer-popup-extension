# Movie Trailer Popup Chrome Extension

A Chrome extension that lets you right-click any selected text and instantly watch its movie trailer in a popup.

## Features

- Right-click context menu on selected text
- Searches YouTube for movie trailers
- Clean, modern popup interface
- Built with Manifest V3 (latest Chrome extension standard)

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select this extension directory

## Usage

1. Select any movie name on a webpage
2. Right-click the selected text
3. Click "Show Trailer" from the context menu
4. A popup will open showing the trailer

## File Structure

```
movie-trailer-popup/
├── manifest.json          # Extension configuration (Manifest V3)
├── background.js          # Service worker for context menu
├── popup.html            # Popup interface
├── popup.js              # Popup logic and YouTube integration
├── popup.css             # Popup styling
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

## Setup Notes

### Icons
You need to add icon files (16x16, 48x48, 128x128 PNG) to the `icons/` directory. See `icons/README.md` for details.

### YouTube API (Optional Enhancement)
The current implementation uses the Invidious public API to search for trailers. For better reliability, you can:

1. Get a YouTube Data API v3 key from [Google Cloud Console](https://console.cloud.google.com/)
2. Update `popup.js` to use the official YouTube API
3. Add the API key to your code (or use chrome.storage for security)

Example API usage:
```javascript
const API_KEY = 'your-api-key-here';
const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query} trailer&type=video&key=${API_KEY}`;
```

## Permissions

- `contextMenus`: To add right-click menu option
- `storage`: To store selected text between background and popup

## Browser Compatibility

- Chrome (Manifest V3)
- Edge (Chromium-based)
- Other Chromium-based browsers

## Development

To modify the extension:

1. Make your changes to the files
2. Go to `chrome://extensions/`
3. Click the refresh icon on your extension card
4. Test your changes

## Troubleshooting

**Popup doesn't open:**
- Make sure you've selected text before right-clicking
- Check that the extension is enabled in chrome://extensions/

**No trailer loads:**
- The Invidious API instance might be down
- Consider implementing YouTube Data API v3 for better reliability
- Check browser console for errors (F12)

## Future Enhancements

- Add YouTube Data API integration
- Support for TV shows
- Multiple video sources (IMDb, Vimeo, etc.)
- Favorites/history feature
- Keyboard shortcuts
- Multiple trailer options

## License

MIT License - Feel free to modify and distribute
