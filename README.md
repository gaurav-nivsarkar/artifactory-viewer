# Artifactory Repository Browser

A convenient web interface to browse Artifactory repositories with inline markdown file viewing.

## Features

- 🌐 **Intuitive Web Interface** - Clean, modern UI for browsing repository contents
- 📝 **Inline Markdown Viewing** - View .md files rendered directly in the browser
- 🔗 **Smart Link Handling** - Click links within markdown files to navigate to referenced files and folders
  - Automatically fixes broken links by searching for similar files
  - Handles version-specific file names intelligently
  - Visual indicators for external vs internal links
  - See [LINK_HANDLING.md](LINK_HANDLING.md) for details
- 📁 **Directory Navigation** - Easy folder navigation with breadcrumb trail
- 🔍 **File Preview** - Preview various file types without downloading
- ⬇️ **Quick Download** - Download files with a single click
- 🔔 **Change Notifications** - Get browser notifications when files are added, modified, or removed (checks every 1 hour)
- 🔴 **Visual Change Indicators** - See when changes are detected in the current directory
- 🐛 **Debug Console** - Built-in developer console at the bottom of the page showing JavaScript errors, warnings, and technical details
- 🎨 **Beautiful Design** - Modern, responsive interface

## Installation

1. Install dependencies:
```bash
npm install
```

## Usage

1. Start the server:
```bash
npm start
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. Browse the repository:
   - Click on folders to navigate into them
   - Click on files to view their contents
   - Use breadcrumb navigation to go back
   - Click download button to save files locally

4. Enable change notifications (optional):
   - Click the "🔔 Enable Notifications" button in the header
   - Allow browser notification permissions when prompted
   - You'll receive notifications every 1 hour when changes are detected
   - A visual indicator (🔴 Changes detected) will also appear in the file browser
   - Click the notification or refresh button to view the changes

5. Use the debug console (for developers):
   - Click the "🐛 Developer Console" bar at the bottom to expand/collapse
   - View JavaScript errors, warnings, and technical details
   - Errors are color-coded: red (errors), yellow (warnings), blue (info), green (success)
   - Click "Clear" to clear the console
   - The console remembers its expanded/collapsed state
   - Automatically flashes red when errors occur while collapsed

## Configuration

You can modify the Artifactory URL and repository path in `server.js`:

```javascript
const ARTIFACTORY_BASE_URL = 'https://artifactory.persgroep.cloud';
const REPO_PATH = '/artifactory/api/storage/advertising-libraries-ext/...';
```

## Authentication

If your Artifactory repository requires authentication, you can add credentials in `server.js`:

```javascript
const response = await axios.get(fullPath, {
    headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN' // or Basic auth
    }
});
```

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Markdown Rendering**: marked.js
- **Backend**: Node.js, Express
- **HTTP Client**: Axios

## Browser Support

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
