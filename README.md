# Artifactory Repository Browser

A dedicated web interface to browse a specific Artifactory repository with inline markdown file viewing.

**Note:** This project is configured for a single, specific Artifactory instance and repository path.

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

### Option 1: Pull from GitHub Container Registry (Easiest)

The Docker image is automatically built and published to GitHub Container Registry.

```bash
# Pull the latest image
docker pull ghcr.io/YOUR_GITHUB_USERNAME/artifactory-viewer:latest

# Run the container
docker run -d -p 3000:3000 --name artifactory-viewer ghcr.io/YOUR_GITHUB_USERNAME/artifactory-viewer:latest
```

Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.

### Option 2: Build Docker Image Locally

1. Build the Docker image:
```bash
docker build -t artifactory-viewer .
```

2. Run the container:
```bash
docker run -d -p 3000:3000 --name artifactory-viewer artifactory-viewer
```

Or use Docker Compose:
```bash
docker-compose up -d
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

### Option 3: Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and navigate to:
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

This application is configured for a specific Artifactory instance. The Artifactory URL and repository path are set in `server.js`:

```javascript
const ARTIFACTORY_BASE_URL = 'https://artifactory.persgroep.cloud';
const REPO_PATH = '/artifactory/api/storage/advertising-libraries-ext/...';
```

**This project is designed for this specific repository and is not intended to be a general-purpose Artifactory browser.**

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

## Docker Deployment

### Automatic Builds

This repository uses GitHub Actions to automatically build and publish Docker images to GitHub Container Registry on every push to the main branch.

- **Image Location**: `ghcr.io/YOUR_GITHUB_USERNAME/artifactory-viewer`
- **Tags**: `latest`, version tags (if you use git tags like `v1.0.0`), and commit SHA

### Pulling from GitHub Container Registry

```bash
# Pull and run the latest version
docker pull ghcr.io/YOUR_GITHUB_USERNAME/artifactory-viewer:latest
docker run -d -p 3000:3000 ghcr.io/YOUR_GITHUB_USERNAME/artifactory-viewer:latest
```

### Building for Internal Registry

To push to your company's container registry:

```bash
# Pull from GitHub
docker pull ghcr.io/YOUR_GITHUB_USERNAME/artifactory-viewer:latest

# Tag for your internal registry
docker tag ghcr.io/YOUR_GITHUB_USERNAME/artifactory-viewer:latest registry.persgroep.cloud/artifactory-viewer:latest

# Push to internal registry
docker push registry.persgroep.cloud/artifactory-viewer:latest
```

### Kubernetes Deployment (Example)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: artifactory-viewer
spec:
  replicas: 1
  selector:
    matchLabels:
      app: artifactory-viewer
  template:
    metadata:
      labels:
        app: artifactory-viewer
    spec:
      containers:
      - name: artifactory-viewer
        image: registry.persgroep.cloud/artifactory-viewer:latest
        ports:
        - containerPort: 3000
---
apiVersion: v1
kind: Service
metadata:
  name: artifactory-viewer
spec:
  selector:
    app: artifactory-viewer
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

## Browser Support

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
