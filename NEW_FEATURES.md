# New Features Guide

This document describes the four major features that have been added to enhance the Artifactory Repository Browser.

## 🔍 Search Functionality

### Overview
Instantly search for files by name within the current directory without navigating through folders.

### How to Use
1. **Locate the search box** at the top of the file browser panel
2. **Type your search query** - results update in real-time
3. **View filtered results** - only matching files are displayed
4. **Clear the search** by clicking the X button or clearing the input

### Features
- Real-time filtering as you type
- Case-insensitive search
- Searches both file and folder names
- Shows result count
- Preserves full file list when search is cleared

### Example Use Cases
- Finding a specific version: "1.2.3"
- Locating markdown files: ".md"
- Finding changelog files: "changelog"

---

## 🔄 Version Comparison

### Overview
Compare two files side-by-side to see differences, perfect for comparing different versions or configurations.

### How to Use
1. **Open a file** you want to compare
2. **Click the "🔄 Compare" button** in the viewer header
3. **Select another file** from the file list
4. **View the comparison** with differences highlighted

### Features
- Side-by-side comparison view
- Line-by-line diff highlighting
- Added lines shown in green
- Removed lines shown in red
- Unchanged lines shown normally
- Modal overlay for focused comparison

### Visual Indicators
- **Green background**: Lines added in the second file
- **Red background**: Lines removed/different from first file
- **White/Dark background**: Identical lines

### Example Use Cases
- Compare different versions of a configuration file
- Review changes between releases
- Check differences in documentation updates
- Validate migration files

---

## 🌙 Dark Mode

### Overview
Toggle between light and dark themes for comfortable viewing in any lighting condition.

### How to Use
1. **Click the theme toggle button** in the header
   - "🌙 Dark Mode" when in light mode
   - "☀️ Light Mode" when in dark mode
2. **The theme switches instantly** across the entire interface
3. **Your preference is saved** and persists across sessions

### What's Themed
- Background gradients
- Container backgrounds
- Text colors (primary, secondary, muted)
- Border colors
- Code blocks and syntax highlighting
- File browser and content viewer
- Debug console
- Modals and sidebars
- All interactive elements

### Benefits
- Reduces eye strain in low-light environments
- Saves battery on OLED screens
- Provides better contrast for some users
- Modern, professional appearance

---

## 📜 Navigation History

### Overview
Track your browsing activity with recent files and path history, plus full browser back/forward support.

### Components

#### 1. Browser History Integration
- **Use browser back/forward buttons** to navigate through paths
- **URL updates** with current path for bookmarking
- **Seamless integration** with browser navigation

#### 2. Recent Files Tab
- Shows **last 20 files** you've viewed
- Displays:
  - File icon
  - File name
  - Full path
  - Time viewed ("Just now", "5 min ago", etc.)
- **Click any file** to open it instantly

#### 3. Path History Tab
- Shows **last 30 directories** you've visited
- Displays:
  - Folder icon
  - Directory path
  - Time visited
- **Click any path** to navigate to it

### How to Use
1. **Click "📜 History" button** in the header
2. **Choose a tab**:
   - "Recent Files" - files you've viewed
   - "Path History" - directories you've visited
3. **Click any item** to navigate to it
4. **Sidebar closes automatically** after selection

### Persistence
- Recent files saved in browser localStorage
- Path history saved in browser localStorage
- Survives page refreshes and browser restarts
- Automatic cleanup (keeps most recent items)

### Time Formatting
- "Just now" - within last minute
- "X min ago" - within last hour
- "X hours ago" - within last day
- "X days ago" - older items

---

## 🎯 Tips for Maximum Productivity

### Search + History
1. Use search to find files quickly
2. Recently searched files appear in history
3. Revisit common files via Recent Files tab

### Comparison Workflow
1. Open the older version first
2. Click Compare
3. Select the newer version
4. Review changes systematically

### Dark Mode Best Practices
- Enable for evening/night work
- Use light mode for printing or screenshots
- Switch modes based on ambient lighting

### Navigation Efficiency
1. Use browser back/forward for quick navigation
2. Check Recent Files for frequently accessed files
3. Use Path History to jump between common directories
4. Bookmark important paths via URL

---

## 🔧 Technical Details

### Performance
- Search is client-side (instant filtering)
- Comparison runs in-browser (no server load)
- Theme switching uses CSS variables (smooth transitions)
- History uses localStorage (5-10MB typical)

### Browser Compatibility
All features work on modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

### Storage
- Dark mode preference: ~10 bytes
- Recent files: ~2KB (20 items)
- Path history: ~1KB (30 items)
- Total: <5KB localStorage usage

### Keyboard Shortcuts (Future Enhancement)
Currently mouse/click-based. Keyboard shortcuts could be added:
- `Ctrl/Cmd + F` - Focus search
- `Ctrl/Cmd + D` - Toggle dark mode
- `Ctrl/Cmd + H` - Toggle history
- `Escape` - Close modals/sidebars

---

## 🐛 Troubleshooting

### Search not working?
- Ensure files are loaded (not in loading state)
- Check browser console for errors
- Refresh the page

### Comparison modal stuck?
- Click outside modal or press Escape
- Close and reopen the file
- Refresh the page

### Dark mode not saving?
- Check browser allows localStorage
- Clear localStorage and try again
- Check browser privacy settings

### History not appearing?
- Click the History button in header
- Check localStorage is enabled
- Try clearing and rebuilding history

---

## 📝 Feedback & Improvements

These features are designed to improve your workflow. If you have suggestions for enhancements or find issues, please report them to the development team.

### Potential Future Enhancements
- Advanced search (regex, file type filters)
- Export comparison as diff file
- Multiple theme options
- Keyboard shortcuts
- History search/filter
- Bookmarks/favorites system
