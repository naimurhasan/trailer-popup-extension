# Movie Trailer Popup - Chrome Extension

**Instantly preview movie trailers without leaving your page.**

Stop wasting your movie night on the wrong film. Preview any trailer with a simple right-click — no tab switching, no searching.

## Demo

[![Movie Trailer Popup Demo](https://img.youtube.com/vi/e2NEUappiKw/maxresdefault.jpg)](https://youtu.be/e2NEUappiKw)

[Watch Demo Video](https://youtu.be/e2NEUappiKw)

## Features

✅ **4 Ways to Search Trailers:**
- Right-click context menu on selected text
- Alt/Option + Right-click for quick access
- Floating "Trailer" button on text selection
- Extension icon for manual search

✅ **Smart Name Detection:**
- Automatically cleans messy movie titles
- Removes quality tags (1080p, WEB-DL, etc.)
- Confirmation popup when name is corrected
- Direct search when name is clean

✅ **Works Everywhere:**
- Even on sites with right-click disabled
- Extracts movie names from elements
- Works on any website

## Installation

### For Users
1. Download from [Chrome Web Store](#) (coming soon)
2. Or load unpacked:
   - Download the latest release
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extension folder

### For Developers

#### Setup
```bash
# Clone or download the repository
cd movie-trailer-popup

# Install as unpacked extension in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select this directory
```

#### Development Workflow
```bash
# Make changes to the code
# Then reload the extension in chrome://extensions/

# To test changes:
# 1. Click the refresh icon on the extension card
# 2. Refresh any open tabs
# 3. Test your changes
```

#### Build for Production
```bash
# Create a zip file for Chrome Web Store submission
cd "movie trailer popup"
zip -r movie-trailer-popup.zip manifest.json background.js content.js content.css popup.html popup.js popup.css icons/icon16.png icons/icon48.png icons/icon128.png

# The zip file will be created in the current directory
# Upload movie-trailer-popup.zip to Chrome Web Store
```

## How to Use

### Method 1: Right-Click Menu (Most Sites)
1. Select the movie title text
2. Right-click → "Show Trailer"
3. Watch instantly in a popup

### Method 2: Right-Click Disabled Sites
1. Hover over movie title
2. Hold **Alt** (Windows) / **Option** (Mac)
3. Right-click → trailer button appears
4. Click "Trailer" button

### Method 3: Quick Selection
1. Select title with left-click
2. Hold **Alt/Option** + Right-Click
3. Click floating "Trailer" button

### Method 4: Extension Icon
1. Click extension icon in toolbar
2. Enter movie name manually
3. Trailer loads in popup

## File Structure

```
movie-trailer-popup/
├── manifest.json          # Extension configuration (Manifest V3)
├── background.js          # Service worker & name cleaning logic
├── content.js             # Floating button & confirmation popup
├── content.css            # Content script styling
├── popup.html             # Extension popup interface
├── popup.js               # Popup logic
├── popup.css              # Popup styling
└── icons/                 # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Technical Details

### Smart Title Cleaning
The extension automatically removes:
- Quality tags (1080p, 720p, 4K, etc.)
- Source info (WEB-DL, BluRay, etc.)
- Codec tags (x264, HEVC, etc.)
- Season/episode markers (S01E01, etc.)
- Extra metadata and junk text

### Confirmation Popup
- Only shows when the title is actually modified
- Lets you verify or edit the cleaned name
- Shows original text for reference
- Skips confirmation when name is already clean

### Permissions
- `contextMenus`: Right-click menu option
- `storage`: Store user preferences
- `activeTab`: Access current tab for text selection
- `scripting`: Inject content scripts

## Browser Compatibility

- ✅ Chrome (Manifest V3)
- ✅ Edge (Chromium-based)
- ✅ Brave
- ✅ Other Chromium browsers

## Troubleshooting

**Trailer button doesn't appear:**
- Make sure you're holding Alt/Option while right-clicking
- Try selecting the text first
- Check that the extension is enabled

**Wrong trailer loads:**
- Use the confirmation popup to edit the name
- Try Method 4 (extension icon) for manual search
- Report persistent issues on GitHub

**Popup doesn't show:**
- Check if right-click is blocked on the site
- Use Alt/Option + Right-click method instead
- Reload the page and try again

## Development Notes

### Debugging
```javascript
// Console logs are removed in production
// For development, add them back temporarily:
console.log('Debug info:', data);
```

### Testing
1. Test on multiple websites
2. Test with messy movie titles
3. Test on sites with right-click disabled
4. Test confirmation popup flow

### Code Style
- No console.log in production
- Clean, commented code
- ES6+ syntax
- Async/await where appropriate

## Privacy

- No data collection
- No external servers (except Google search)
- No tracking or analytics
- All processing happens locally

## Contributing

1. Fork the repository
2. Create your feature branch
3. Test thoroughly
4. Submit a pull request

## License

MIT License - Free to use and modify

## Credits

Made with ❤️ for movie lovers who value their time.

## Support

- Report bugs on [GitHub Issues](#)
- Star the repo if you find it useful
- Share with friends who love movies
