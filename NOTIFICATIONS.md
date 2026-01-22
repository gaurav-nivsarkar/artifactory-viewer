# Change Notification System

## Overview

The Artifactory Browser now includes a real-time change detection system that monitors your repository and notifies you when files are added, modified, or removed.

## How It Works

### 1. **Polling Mechanism**
- The system checks the repository every **1 hour** for changes
- Only monitors the current directory you're viewing
- Automatically updates when you navigate to different folders

### 2. **Change Detection**
The system detects three types of changes:
- **Added files**: New files that appear in the directory
- **Modified files**: Existing files with changed size or modification date
- **Removed files**: Files that have been deleted

### 3. **Notifications**
When changes are detected, you receive:
- **Browser notification**: Desktop notification (if permissions granted)
- **Visual indicator**: Red "🔴 Changes detected" badge in the file browser
- **Detailed information**: Number of files added, modified, or removed

### 4. **State Persistence**
- Your notification preference is saved in browser localStorage
- If notifications were enabled, they'll automatically re-enable on page reload

## Usage

### Enable Notifications

1. Click the **"🔔 Enable Notifications"** button in the header
2. Allow notification permissions when your browser prompts you
3. You'll receive a test notification confirming it's enabled
4. The button will turn green and show "🔔 Notifications ON"
5. Status text will show: "Checking every 1 hour"

### Disable Notifications

1. Click the **"🔔 Notifications ON"** button
2. Notifications will stop immediately
3. The button will return to its original state

### Viewing Changes

When changes are detected:

1. You'll see a browser notification with details
2. A red indicator appears: "🔴 Changes detected"
3. Click either:
   - The notification (focuses window and refreshes)
   - The refresh button 🔄 (hides indicator and refreshes)

## Technical Details

### Polling Interval
- Default: 1 hour
- Configurable in `app.js`: `const POLL_INTERVAL = 3600000;`

### Notification Permission
- Uses standard Browser Notification API
- Requires user permission grant
- Works in Chrome, Firefox, Safari, Edge (latest versions)

### Performance
- Lightweight API calls every 1 hour
- Only compares file metadata (URI, size, modification date)
- Minimal impact on browsing performance
- Polling automatically stops when notifications are disabled

### Browser Compatibility
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ❌ Safari on iOS (notifications not supported)

## Privacy & Data

- No data is sent to external servers
- All checks are done via your local Node.js server
- Notification preferences stored only in your browser's localStorage
- No tracking or analytics

## Troubleshooting

### Notifications not appearing?

1. **Check browser permissions**:
   - Chrome: Settings → Privacy and security → Site Settings → Notifications
   - Firefox: Preferences → Privacy & Security → Permissions → Notifications
   - Safari: Preferences → Websites → Notifications

2. **Check Do Not Disturb mode**: Ensure your OS isn't blocking notifications

3. **Check console**: Open browser DevTools and look for error messages

### False change detections?

- This can happen if the Artifactory server's modification timestamps are inconsistent
- The system compares both file size and last modified date
- Network issues might cause temporary false positives

### Want different polling interval?

Edit `/public/app.js`:

```javascript
const POLL_INTERVAL = 60000; // Example: 60 seconds (60000 ms)
// Current setting: 3600000 (1 hour)
```

## Future Enhancements

Potential improvements:
- [ ] Configurable polling interval via UI
- [ ] Different notification sounds
- [ ] Filter notifications by file type
- [ ] Change history/log viewer
- [ ] WebSocket support for real-time updates (no polling)
