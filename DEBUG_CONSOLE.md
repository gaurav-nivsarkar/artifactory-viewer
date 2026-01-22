# Debug Console Documentation

## Overview

The Artifactory Browser includes a built-in developer console at the bottom of the page that displays JavaScript errors, warnings, and other technical details that aren't shown to regular users.

## Features

### 🐛 Error Tracking
- **JavaScript Errors**: Catches all runtime JavaScript errors
- **Unhandled Promises**: Captures unhandled promise rejections
- **Console Errors**: Intercepts `console.error()` and `console.warn()` calls
- **Network Errors**: Logs failed API calls and file loads
- **Link Errors**: Tracks broken links in markdown files

### 🎨 Visual Design
- **Dark Theme**: Easy on the eyes with a VS Code-inspired color scheme
- **Color Coding**: 
  - 🔴 Red: Errors
  - 🟡 Yellow: Warnings
  - 🔵 Blue: Info messages
  - 🟢 Green: Success messages
- **Timestamps**: Each message shows when it occurred
- **Auto-scroll**: Automatically scrolls to latest messages

### 💾 Persistent State
- Remembers whether the console is expanded or collapsed
- Saved in browser localStorage
- Automatically restores state on page reload

## How to Use

### Opening/Closing the Console

**Method 1: Click the Header**
- Click anywhere on the "🐛 Developer Console" bar at the bottom

**Method 2: Click the Toggle Button**
- Click the ▲/▼ button in the top-right corner of the console

**Keyboard Shortcut**
- Currently none (can be added if needed)

### Clearing the Console

Click the "🗑️ Clear" button to remove all messages.

### Reading Error Messages

Each error message includes:

1. **Timestamp**: When the error occurred (HH:MM:SS format)
2. **Message**: The error description
3. **Details** (if available):
   - File path and line number
   - Stack trace
   - Related context (URL, status code, etc.)

**Example:**
```
15:23:45  Failed to load file: HTTP 404: Not Found
          File: /11.2.9/nonexistent-file.md
          
          Stack trace:
          Error: HTTP 404: Not Found
              at viewFile (app.js:185)
              at handleMarkdownLink (app.js:256)
```

## Message Types

### Error Messages (Red)
Indicates something went wrong:
- JavaScript runtime errors
- Network failures (404, 500, etc.)
- Failed file operations
- Broken links

### Warning Messages (Yellow)
Indicates potential issues:
- Broken links that were recovered
- Deprecated features
- Non-critical failures

### Info Messages (Blue)
General information:
- Successful directory loads
- Successful file loads
- Navigation events
- Feature initialization

### Success Messages (Green)
Positive confirmations:
- Console initialization
- Successful operations
- Features enabled

## Visual Indicators

### Border Flash
When the console is collapsed and an error occurs:
- The top border flashes red briefly
- Alerts you to check the console

### Auto-scroll
- New messages automatically scroll into view
- Stays at bottom when new messages arrive

## Memory Management

The console automatically:
- Limits to 100 messages maximum
- Removes oldest messages when limit reached
- Prevents memory leaks from excessive logging

## Programmatic Usage

You can manually log to the debug console from the browser's main console:

```javascript
// Log an error
window.debugLog.error('Something went wrong', {
    url: 'https://example.com',
    status: 404
});

// Log a warning
window.debugLog.warn('This feature is deprecated');

// Log info
window.debugLog.info('User clicked button');

// Log success
window.debugLog.success('Operation completed');
```

## Integration with Existing Code

The debug console automatically captures:

### 1. Directory Loading Errors
```javascript
Error: Failed to load directory: HTTP 500: Internal Server Error
Path: /some/path
Stack trace: ...
```

### 2. File Loading Errors
```javascript
Error: Failed to load file: HTTP 404: Not Found
Path: /11.2.9/file.md
Name: file.md
Stack trace: ...
```

### 3. Broken Links
```javascript
Warning: Broken link detected: ../CHANGELOG.md
Message: File not found. The link may be broken...
Current file: migration-guide-android.md
```

### 4. Successful Operations
```javascript
Info: Loaded directory: /11.2.9/ (11 items)
Info: Loaded file: changelog.md (5234 bytes)
Success: Debug console initialized successfully
```

## Technical Details

### Error Capture Methods

**Global Error Handler:**
```javascript
window.addEventListener('error', (event) => {
    // Captures syntax errors, reference errors, etc.
});
```

**Unhandled Promise Rejections:**
```javascript
window.addEventListener('unhandledrejection', (event) => {
    // Captures async errors
});
```

**Console Override:**
```javascript
console.error = function(...args) {
    originalConsoleError.apply(console, args);
    logToDebugConsole('error', args.join(' '));
};
```

### Styling

Based on VS Code's dark theme:
- Background: `#1e1e1e`
- Foreground: `#d4d4d4`
- Accent: `#667eea`
- Error: `#dc3545`
- Warning: `#ffc107`
- Info: `#4fc3f7`
- Success: `#28a745`

## Best Practices

### For Developers

1. **Check the console regularly** when testing
2. **Clear before testing** to see only relevant messages
3. **Look for patterns** in errors
4. **Copy error messages** for bug reports

### For Users

1. **Keep it collapsed** during normal use
2. **Expand when something seems wrong**
3. **Take screenshots** of errors for support
4. **Clear periodically** to improve performance

## Troubleshooting

### Console not showing?
- Check bottom of page
- Refresh the browser
- Clear browser cache

### Messages not appearing?
- Check if console is expanded (click to toggle)
- Verify JavaScript is enabled
- Check browser console for meta-errors

### Too many messages?
- Click "Clear" button
- Console auto-limits to 100 messages
- Messages are automatically cleaned up

### Cannot read messages?
- Expand the console to full height
- Use browser zoom (Cmd/Ctrl +)
- Scroll within the console area

## Future Enhancements

Potential improvements:
- [ ] Filter messages by type (errors only, warnings only, etc.)
- [ ] Search/filter messages by text
- [ ] Export console log to file
- [ ] Keyboard shortcuts (Ctrl+` to toggle)
- [ ] Network request logging with timing
- [ ] Performance metrics
- [ ] Copy individual messages to clipboard
- [ ] Resizable console height
