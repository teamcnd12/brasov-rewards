# Prekoputa PWA Checklist

This document provides guidance on testing and verifying the PWA (Progressive Web App) installation and functionality.

## Deployment Verification

Before deploying to production:

1. **Build the app**: `npm run build`
2. **Verify all files are served correctly**:
   - `/manifest.webmanifest` returns 200 with `application/json` content-type
   - `/sw.js` returns 200 with `application/javascript` content-type
   - `/icons/*.png` files are accessible
   - `/offline.html` is accessible

3. **Check HTTPS requirement**:
   - Service workers only work over HTTPS (or localhost for development)
   - Ensure production deployment uses HTTPS

## Testing on Android Chrome

### Installation (Add to Home Screen)

1. Open Prekoputa app in Chrome on Android
2. Tap the **three-dot menu** (⋮) at the top-right
3. Select **"Install app"** or **"Add to Home Screen"**
4. Review the install prompt and tap **"Install"**

### What to Verify

- ✅ App icon appears on home screen using the 192x192 icon
- ✅ App opens in standalone mode (no browser toolbar)
- ✅ Correct name "Prekoputa" displayed
- ✅ Theme color (#4CAF50 green) appears in status bar
- ✅ App works offline (shows offline page when connection lost)

### Testing Offline Mode

1. Install app on Android
2. Open app in standalone mode
3. Disable WiFi and mobile data
4. Try navigating to a new page
5. Should see the offline page with "Nema internet konekcije" message
6. Enable connection and refresh - should reload normally

## Testing on iOS Safari

### Installation (Add to Home Screen)

1. Open Prekoputa app in Safari on iOS
2. Tap the **Share button** (box with arrow) at the bottom
3. Scroll down and tap **"Add to Home Screen"**
4. Customize the name (default: "Prekoputa")
5. Tap **"Add"**

### What to Verify

- ✅ App icon appears on home screen
- ✅ App opens in full-screen mode without Safari toolbar
- ✅ App title displays correctly
- ✅ Status bar styling appears (black-translucent)
- ✅ Apple touch icon is used (192x192 PNG)

### Note on iOS Service Workers

iOS PWAs have limited service worker support:
- Offline page won't automatically show
- Session is not persistent across closes (automatically logs out after ~7 days)
- Cache behavior is limited
- Use for basic app shell caching only

## Core PWA Features Checklist

### Manifest

- ✅ `manifest.webmanifest` exists at `/manifest.webmanifest`
- ✅ Contains required fields:
  - `name`: "Prekoputa"
  - `short_name`: "Prekoputa"
  - `start_url`: "/"
  - `display`: "standalone"
  - `theme_color`: "#4CAF50"
  - `background_color`: "#faf9f6"
  - `orientation`: "portrait"
- ✅ Icons array includes:
  - 192x192 PNG (any purpose)
  - 512x512 PNG (any purpose)
  - 192x192 PNG (maskable)
  - 512x512 PNG (maskable)

### HTML Metadata

- ✅ `<link rel="manifest" href="/manifest.webmanifest">` in `<head>`
- ✅ `<meta name="theme-color" content="#4CAF50">`
- ✅ `<meta name="apple-mobile-web-app-capable" content="yes">`
- ✅ `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
- ✅ `<link rel="apple-touch-icon" href="/icons/icon-192x192.png">`
- ✅ Service worker registration script in HTML

### Service Worker

- ✅ `public/sw.js` exists and is valid JavaScript
- ✅ Registers on page load
- ✅ Caches static assets on install
- ✅ Implements network-first strategy for HTML
- ✅ Implements cache-first strategy for static assets
- ✅ Does NOT cache Supabase API responses
- ✅ Does NOT cache user-specific data
- ✅ Serves offline page when connection is lost

### Icons

- ✅ Icons exist in `/public/icons/`:
  - `icon-192x192.png`
  - `icon-512x512.png`
  - `icon-maskable-192x192.png`
  - `icon-maskable-512x512.png`
- ✅ Icons are valid PNG files
- ✅ Icons use coffee rewards branding (green #4CAF50 + cream #faf9f6)
- ✅ Maskable icons include safe zone padding

### Offline Page

- ✅ `public/offline.html` exists
- ✅ Contains Serbian message: "Nema internet konekcije. Pokušaj ponovo."
- ✅ Styled consistently with app theme
- ✅ Includes refresh button

## Production Deployment Steps

1. **Build**: `npm run build` (generates optimized files in `/dist`)
2. **Verify icons** are copied to dist (Vite should do this automatically)
3. **Deploy**:
   - Upload all files from `/dist` to your web server
   - Ensure `/manifest.webmanifest` has correct MIME type
   - Ensure `/sw.js` has correct MIME type
   - Ensure HTTPS is enabled
4. **Test**: Use Chrome DevTools Audits (Lighthouse) to verify:
   - PWA requirements are met
   - All files load correctly
   - Service worker installs successfully

## Debugging

### Chrome DevTools

1. Open DevTools (F12)
2. Go to **Application** tab
3. Check:
   - **Manifest** section: Verify manifest loads and is valid
   - **Service Workers** section: Verify SW is registered, active
   - **Cache Storage** section: Verify cache contains expected files

### Common Issues

| Issue | Solution |
|-------|----------|
| Service worker not registering | Check HTTPS is enabled, check `/sw.js` path, check browser console for errors |
| App not installable | Check manifest is valid JSON, check required fields exist, check icons are accessible |
| Offline page not showing | Check service worker is active, disable cache in DevTools and reload, check `/offline.html` path |
| Icons not showing | Check PNG files are valid, check icon paths in manifest are correct, check file sizes match declared sizes |
| Session lost on iOS | Expected behavior - iOS closes web app after ~7 days, user needs to re-authenticate |

## Maintenance

### Updating the App

1. Update code as needed
2. Rebuild: `npm run build`
3. Service worker will automatically invalidate cache on new deployment (old version removed, new version installed)
4. Users will get the latest version on next app open

### Icon Updates

To replace the coffee rewards icon:
1. Create new PNG files (192x192 and 512x512)
2. Add maskable versions (same dimensions, but safe zone aware)
3. Save to `/public/icons/`
4. Rebuild: `npm run build`
5. Increment cache version in `sw.js` if needed

## Resources

- [Web.dev PWA Documentation](https://web.dev/progressive-web-apps/)
- [MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest Spec](https://www.w3.org/TR/appmanifest/)
- [Chrome DevTools - Application Tab](https://developer.chrome.com/docs/devtools/progressive-web-apps/)
