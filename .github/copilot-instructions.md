# Read and Scroll Chrome Extension

Read and Scroll is a Chrome browser extension built with React, TypeScript, and Vite that provides clean reader mode and auto-scroll functionality for web pages. It uses Mozilla's Readability library to extract article content and offers multiple themes and scroll controls.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

- **CRITICAL**: All build commands in this project are very fast (under 5 seconds). Set timeouts to 60+ seconds minimum to avoid unnecessary cancellation.
- Bootstrap and build the repository:
  - `npm install` -- takes ~2 seconds. NEVER CANCEL. Set timeout to 120+ seconds.
  - `npm run build` -- takes ~3 seconds. NEVER CANCEL. Set timeout to 60+ seconds.
  - `npm run lint` -- takes ~1 second. NEVER CANCEL. Set timeout to 60+ seconds.
- Development workflow:
  - `npm run dev` -- starts Vite dev server on http://localhost:5173/ for popup development
  - `npm run build:dev` -- builds extension in development mode (~1 second)
  - `npm run zip` -- creates production build and packages as release.zip (~3 seconds)

## Extension Development & Testing

- **MANUAL VALIDATION REQUIREMENT**: This is a Chrome browser extension that requires manual testing in Chrome browser. Simply running build commands is NOT sufficient validation.
- Loading the extension in Chrome:
  1. Run `npm run build` or `npm run build:dev`
  2. Open Chrome and navigate to `chrome://extensions`
  3. Enable "Developer mode" (toggle in top right)
  4. Click "Load unpacked" and select the `dist` directory
  5. The extension icon should appear in the Chrome toolbar
- **VALIDATION SCENARIOS**: After making changes, ALWAYS test these scenarios:
  1. **Reader Mode Test**: Navigate to a news article or blog post, click the extension icon, toggle "Enabled" to activate reader mode
  2. **Theme Switching**: In reader mode, test all theme buttons (☀️ light, 🌙 dark, ⭐ Star Wars, 🌈 rainbow)
  3. **Font Size Control**: Test the three "Aa" font size buttons (small, medium, large)
  4. **Auto-Scroll**: Use the scroll speed slider from 0 (stopped) to 100 (ludicrous speed)
  5. **Disable/Re-enable**: Toggle the extension off and verify original page is restored
- Testing websites that work well: news articles, blog posts, Wikipedia pages
- The extension processes content locally - no network requests are made

## Code Structure

- `src/content/` -- Content script that runs on web pages and provides reader functionality
- `src/background/` -- Minimal service worker for extension lifecycle  
- `src/popup/` -- React popup UI with enable/disable toggle
- `src/content/styles/` -- Theme definitions and CSS generation
- `manifest.json` -- Chrome Extension Manifest V3 configuration
- `dist/` -- Build output directory (this is what gets loaded as the unpacked extension)
- `public/` -- Static assets (icons, images) copied to dist during build

## Key Dependencies

- **@mozilla/readability** -- Core library for extracting readable content from web pages
- **React + TypeScript** -- UI framework and type safety
- **Vite** -- Build tool and bundler configured for Chrome extension output
- **ESLint** -- Code linting with React and TypeScript rules

## Build Configuration

- Vite builds three entry points: popup, content script, background script
- TypeScript configuration uses strict mode with React JSX
- Build outputs are not minified for easier debugging
- Source maps are included in development builds
- Public assets are automatically copied to dist folder

## Asset Management

- Extension icons: rs-16.png, rs-32.png, rs-48.png, rs-128.png
- Use `public/resize.sh` script to generate icon sizes from source image
- Requires ImageMagick: script will attempt auto-install on Linux/macOS

## Common Issues and Solutions

- **Extension not loading**: Ensure `npm run build` completed successfully and `dist/manifest.json` exists
- **Reader mode not working**: Test on article pages, not homepages or social media feeds
- **Popup not opening**: Check Chrome developer tools for JavaScript errors
- **Changes not reflecting**: Reload the extension in `chrome://extensions` after rebuilding

## No Automated Tests

- This project does not have automated tests (no `npm run test` command)
- All validation must be done manually by loading the extension in Chrome
- Focus on the validation scenarios listed above rather than seeking automated test commands
- When making changes, always build and test in Chrome browser to ensure functionality works

## Development Tips

- Use `npm run dev` for popup development with hot reload
- Use `npm run build:dev` for faster development builds
- Content script changes require extension reload in Chrome
- Check Chrome DevTools console for both page and extension errors
- Extension popup has separate DevTools (right-click popup → "Inspect")

## Common Commands Reference

```bash
# Full build from clean state
npm install && npm run build

# Development cycle
npm run build:dev  # Quick build for testing
npm run lint       # Check code style

# Check built extension structure  
ls -la dist/       # Should contain: manifest.json, *.js files, icons, popup HTML

# Package for distribution
npm run zip        # Creates release.zip
```

## Validation Checklist

Before completing any changes, ALWAYS verify:
- [ ] `npm run build` succeeds without errors
- [ ] `npm run lint` passes with no issues  
- [ ] Extension loads successfully in Chrome (no errors in `chrome://extensions`)
- [ ] Reader mode activates on test article page
- [ ] All theme switches work correctly
- [ ] Font size controls function properly
- [ ] Auto-scroll slider operates smoothly
- [ ] Extension can be disabled and re-enabled properly