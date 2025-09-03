# Read and Scroll Chrome Extension

Read and Scroll is a Chrome/Firefox browser extension built with WXT (Web Extension Toolkit), TypeScript, and React. It provides a clean reader mode using Mozilla's Readability library and auto-scroll functionality.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

## Global Wxt imports

There is no need to import anything directly that is exported from the utils folder.
Wxt will generate global imports for these files automatically and they do not need to be imported manually. Check .wxt/types/imports-module.d.ts for the full list of auto-imported modules, and do not add any imports that are already listed there.

### Bootstrap and Build

- **CRITICAL**: Set timeout to 60+ minutes for any build commands. NEVER CANCEL builds.
- Install dependencies: `pnpm install` -- takes ~18 seconds. NEVER CANCEL.
- Build for Chrome: `pnpm run build` -- takes ~2 seconds. NEVER CANCEL.
- Build for Firefox: `pnpm run build:firefox` -- takes ~2 seconds. NEVER CANCEL.
- Development mode: `pnpm run dev` -- starts dev server at http://localhost:3000. NEVER CANCEL.
- Create distribution packages: `pnpm run zip` or `pnpm run zip:firefox` -- takes ~3 seconds. NEVER CANCEL.

### Dependencies and Requirements

- **Node.js**: Use Node.js v20+ (tested with v20.19.4)
- **Package Manager**: ALWAYS use `pnpm` (not npm/yarn). Install with `npm install -g pnpm` if not available.
- **TypeScript**: Project uses TypeScript v5+ with strict settings
- **WXT**: Primary build tool, handles Chrome/Firefox manifest generation and building

### TypeScript Compilation

- `pnpm run compile` -- runs TypeScript type checking (may show non-critical errors in vite.config.ts)
- Type errors in config files do NOT prevent successful builds
- Build process uses WXT's internal TypeScript handling, not direct tsc compilation

## Validation and Testing

### Manual Extension Testing Scenarios

ALWAYS manually validate extension functionality after making code changes:

1. **Build and Load Extension:**

   - Run `pnpm run build` to create production build in `.output/chrome-mv3/`
   - Load `.output/chrome-mv3/` directory as unpacked extension in Chrome
   - Verify extension icon appears in browser toolbar

2. **Reader Mode Functionality Test:**

   - Navigate to any article-heavy website (news sites, Wikipedia, blogs)
   - Click extension icon to open popup
   - Toggle "Enabled" switch to activate reader mode
   - VERIFY: Ads, navigation, sidebars, and footer content are removed
   - VERIFY: Main article content (title, byline, text, images) is preserved
   - VERIFY: Content is displayed in clean, readable format

3. **Auto-Scroll Testing:**

   - With reader mode active, use the scroll speed slider in the controls
   - VERIFY: Page automatically scrolls at selected speed
   - VERIFY: Clicking on content pauses/resumes scrolling
   - VERIFY: Hover over content pauses scrolling

4. **Theme and Font Testing:**

   - Test all theme options: Light (☀️), Dark (🌙), Star Wars (⭐), Rainbow (🌈)
   - Test all font sizes: Small, Medium, Large
   - VERIFY: Changes apply immediately and persist during session

5. **Settings Persistence Testing:**
   - Enable "Save Settings" toggle in popup
   - Change theme, font size, or enable "Always Enabled"
   - Reload page or navigate to new page
   - VERIFY: Settings are restored correctly

### Browser Compatibility

- **Chrome**: Primary target, uses Manifest V3 (.output/chrome-mv3/)
- **Firefox**: Secondary target, uses Manifest V2 (.output/firefox-mv2/)
- Extension builds successfully for both browsers with single codebase

## Common Tasks

### Development Workflow

1. Run `pnpm install` to install dependencies (first time only)
2. Run `pnpm run dev` for development with hot reload
3. Make code changes in `entrypoints/`, `utils/`, or React components
4. Changes automatically rebuild and reload in dev mode
5. Test functionality manually as described above
6. Run `pnpm run build` for production build before committing

### File Structure Navigation

Key files and directories:

- `entrypoints/background.ts` -- Background service worker
- `entrypoints/content.ts` -- Main content script with reader mode logic
- `entrypoints/popup/` -- Extension popup UI (HTML + React)
- `utils/` -- Utility modules (storage, themes, auto-scroll, reader logic)
- `wxt.config.ts` -- WXT build configuration
- `package.json` -- Dependencies and scripts
- `.output/` -- Build output directory (gitignored)

### Working with Storage

- Extension uses Chrome storage API through `utils/chromeStorage.ts`
- Settings are prefixed with `readAndScrollConfig_`
- Default values are provided for all settings when storage fails
- Test storage by toggling "Save Settings" in popup

### Working with Content Scripts

- Main logic in `entrypoints/content.ts` uses Mozilla Readability
- Content script injects reader mode UI and controls
- Themes and styles defined in `utils/theme.ts`
- Auto-scroll functionality in `utils/autoScroll.ts`

## Build Output Structure

### Chrome (Manifest V3)

```
.output/chrome-mv3/
├── manifest.json        # Chrome extension manifest
├── popup.html          # Extension popup interface
├── background.js       # Service worker
├── content-scripts/    # Content script bundle
├── chunks/            # Code-split chunks
└── icon/              # Extension icons
```

### Firefox (Manifest V2)

```
.output/firefox-mv2/
├── manifest.json       # Firefox extension manifest
├── popup.html         # Extension popup interface
├── background.js      # Background script
├── content-scripts/   # Content script bundle
├── chunks/           # Code-split chunks
└── icon/             # Extension icons
```

### Distribution Packages

- `pnpm run zip` creates `.output/read-and-scroll-[version]-chrome.zip`
- `pnpm run zip:firefox` creates `.output/read-and-scroll-[version]-firefox.zip`
- These files are ready for Chrome Web Store / Firefox Add-ons submission

## Common Issues and Solutions

### Build Issues

- **"Command eslint not found"**: ESLint not installed - ignore or install eslint if needed
- **TypeScript errors in vite.config.ts**: Non-critical, builds still work correctly
- **pnpm not found**: Install with `npm install -g pnpm`

### Extension Loading Issues

- Always load the `.output/chrome-mv3/` directory, not the root project directory
- Enable "Developer mode" in Chrome before loading unpacked extension
- Check browser console for runtime errors if extension doesn't work

### Content Script Issues

- Verify `matches: ["<all_urls>"]` is present in manifest for content script
- Check that `@mozilla/readability` dependency is properly bundled
- Test on pages with clear article structure (news sites work best)

## Performance and Timing

- **Dependencies install**: ~18 seconds with pnpm
- **Production build**: ~2 seconds
- **Development build**: ~1 second
- **Zip creation**: ~3 seconds
- **Dev server startup**: ~1 second

All operations complete quickly. Set timeouts to 60+ minutes to be safe, but actual times are much faster.

## No Test Framework

This project does not have automated tests. Manual testing using the validation scenarios above is required for all changes.
