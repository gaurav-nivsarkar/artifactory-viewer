// State management
let currentPath = '';
let currentFile = null;
let notificationsEnabled = false;
let pollingInterval = null;
let lastSnapshot = null;
const POLL_INTERVAL = 3600000; // Check every 1 hour (3600000 ms)

// DOM elements
const fileList = document.getElementById('fileList');
const breadcrumb = document.getElementById('breadcrumb');
const contentArea = document.getElementById('contentArea');
const viewerTitle = document.getElementById('viewerTitle');
const downloadBtn = document.getElementById('downloadBtn');
const closeBtn = document.getElementById('closeBtn');
const refreshBtn = document.getElementById('refreshBtn');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const notificationToggle = document.getElementById('notificationToggle');
const notificationStatus = document.getElementById('notificationStatus');
const changeIndicator = document.getElementById('changeIndicator');
const debugConsole = document.getElementById('debugConsole');
const debugMessages = document.getElementById('debugMessages');
const toggleConsoleBtn = document.getElementById('toggleConsole');
const clearConsoleBtn = document.getElementById('clearConsole');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadDirectory('');
    
    refreshBtn.addEventListener('click', () => {
        changeIndicator.style.display = 'none';
        loadDirectory(currentPath);
    });
    
    closeBtn.addEventListener('click', () => {
        closeViewer();
    });
    
    downloadBtn.addEventListener('click', () => {
        if (currentFile) {
            downloadFile(currentFile);
        }
    });
    
    notificationToggle.addEventListener('click', () => {
        toggleNotifications();
    });
    
    // Check if notifications were previously enabled
    if (localStorage.getItem('notificationsEnabled') === 'true') {
        requestNotificationPermission();
    }
    
    // Initialize debug console
    initDebugConsole();
});

// Load directory contents
async function loadDirectory(path) {
    currentPath = path;
    updateBreadcrumb(path);
    
    try {
        loading.style.display = 'block';
        errorDiv.style.display = 'none';
        fileList.innerHTML = '';
        
        const response = await fetch(`/api/browse?path=${encodeURIComponent(path)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        loading.style.display = 'none';
        
        if (data.errors) {
            throw new Error(data.errors[0]?.message || 'Failed to load directory');
        }
        
        renderFileList(data.children || []);
        
        // Capture snapshot if notifications are enabled
        if (notificationsEnabled) {
            captureSnapshot();
        }
        
        // Log successful directory load
        logToDebugConsole('info', `Loaded directory: ${path || '/'} (${data.children?.length || 0} items)`);
    } catch (error) {
        loading.style.display = 'none';
        errorDiv.textContent = `Error: ${error.message}`;
        errorDiv.style.display = 'block';
        console.error('Error loading directory:', error);
        logToDebugConsole('error', `Failed to load directory: ${error.message}`, {
            stack: error.stack,
            path: path
        });
    }
}

// Render file list
function renderFileList(items) {
    fileList.innerHTML = '';
    
    if (!items || items.length === 0) {
        fileList.innerHTML = '<li class="file-item" style="cursor: default;">No items found</li>';
        return;
    }
    
    // Sort: folders first, then files, alphabetically
    items.sort((a, b) => {
        if (a.folder && !b.folder) return -1;
        if (!a.folder && b.folder) return 1;
        return a.uri.localeCompare(b.uri);
    });
    
    items.forEach(item => {
        const li = document.createElement('li');
        li.className = 'file-item';
        
        const icon = document.createElement('span');
        icon.className = 'file-icon';
        icon.textContent = item.folder ? '📁' : getFileIcon(item.uri);
        
        const name = document.createElement('span');
        name.className = 'file-name';
        name.textContent = item.uri.substring(1); // Remove leading slash
        
        li.appendChild(icon);
        li.appendChild(name);
        
        if (!item.folder && item.size) {
            const size = document.createElement('span');
            size.className = 'file-size';
            size.textContent = formatBytes(item.size);
            li.appendChild(size);
        }
        
        li.addEventListener('click', (e) => {
            if (item.folder) {
                loadDirectory(currentPath + item.uri);
            } else {
                viewFile(currentPath + item.uri, item.uri.substring(1), e);
            }
        });
        
        fileList.appendChild(li);
    });
}

// Update breadcrumb navigation
function updateBreadcrumb(path) {
    breadcrumb.innerHTML = '';
    
    const parts = path.split('/').filter(p => p);
    
    // Root
    const root = document.createElement('span');
    root.className = 'breadcrumb-item';
    root.textContent = '🏠 Root';
    root.dataset.path = '';
    root.addEventListener('click', () => loadDirectory(''));
    breadcrumb.appendChild(root);
    
    // Path parts
    let accumulatedPath = '';
    parts.forEach((part, index) => {
        const separator = document.createElement('span');
        separator.className = 'breadcrumb-separator';
        separator.textContent = '/';
        breadcrumb.appendChild(separator);
        
        accumulatedPath += '/' + part;
        const item = document.createElement('span');
        item.className = 'breadcrumb-item';
        item.textContent = part;
        item.dataset.path = accumulatedPath;
        
        if (index < parts.length - 1) {
            item.addEventListener('click', () => loadDirectory(accumulatedPath));
        }
        
        breadcrumb.appendChild(item);
    });
}

// View file content
async function viewFile(path, name, event) {
    currentFile = { path, name };
    
    try {
        viewerTitle.textContent = `📄 ${name}`;
        downloadBtn.style.display = 'inline-block';
        closeBtn.style.display = 'inline-block';
        
        contentArea.innerHTML = '<div class="loading">Loading file...</div>';
        
        const response = await fetch(`/api/file?path=${encodeURIComponent(path)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const content = await response.text();
        
        // Highlight active file in list
        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.remove('active');
        });
        if (event) {
            event.target.closest('.file-item')?.classList.add('active');
        }
        
        // Render based on file type
        if (name.toLowerCase().endsWith('.md')) {
            renderMarkdown(content);
        } else {
            renderPlainText(content);
        }
        
        // Log successful file load
        logToDebugConsole('info', `Loaded file: ${name} (${content.length} bytes)`);
    } catch (error) {
        contentArea.innerHTML = `<div class="error">Error loading file: ${error.message}</div>`;
        console.error('Error loading file:', error);
        logToDebugConsole('error', `Failed to load file: ${error.message}`, {
            stack: error.stack,
            path: path,
            name: name
        });
    }
}

// Render markdown content
function renderMarkdown(content) {
    const html = marked.parse(content);
    contentArea.innerHTML = `<div class="markdown-content">${html}</div>`;
    
    // Fix links in markdown
    fixMarkdownLinks();
}

// Fix links in rendered markdown
async function fixMarkdownLinks() {
    const markdownContent = contentArea.querySelector('.markdown-content');
    if (!markdownContent) return;
    
    const links = markdownContent.querySelectorAll('a');
    
    for (const link of links) {
        const href = link.getAttribute('href');
        if (!href) continue;
        
        // Skip external links (http://, https://, mailto:, etc.)
        if (href.match(/^[a-z]+:/i)) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
            link.classList.add('external-link');
            link.title = `Opens in new tab: ${href}`;
            continue;
        }
        
        // Skip anchor links
        if (href.startsWith('#')) {
            continue;
        }
        
        // Handle relative links - these should point to Artifactory
        link.addEventListener('click', (e) => {
            e.preventDefault();
            handleMarkdownLink(href);
        });
        
        // Add visual indicator for internal links
        link.style.cursor = 'pointer';
        link.classList.add('internal-link');
        link.title = `Click to open: ${href}`;
        
        // Add a subtle icon to indicate it's an internal link
        if (!link.querySelector('.link-icon')) {
            const icon = document.createElement('span');
            icon.className = 'link-icon';
            icon.textContent = ' 📄';
            icon.style.fontSize = '0.8em';
            icon.style.opacity = '0.6';
            link.appendChild(icon);
        }
    }
    
    // Also fix image links
    fixMarkdownImages();
}

// Fix image links in markdown
function fixMarkdownImages() {
    const markdownContent = contentArea.querySelector('.markdown-content');
    if (!markdownContent) return;
    
    const images = markdownContent.querySelectorAll('img');
    
    images.forEach(img => {
        const src = img.getAttribute('src');
        if (!src) return;
        
        // Skip external images
        if (src.match(/^https?:/i)) {
            return;
        }
        
        // For relative image paths, try to resolve them
        // If they fail to load, show a placeholder
        img.addEventListener('error', () => {
            img.alt = `[Image not found: ${src}]`;
            img.style.display = 'none';
            
            // Create a placeholder
            const placeholder = document.createElement('div');
            placeholder.className = 'image-placeholder';
            placeholder.textContent = `🖼️ Image not available: ${src}`;
            img.parentNode.insertBefore(placeholder, img);
        });
    });
}

// Handle markdown link clicks
async function handleMarkdownLink(href) {
    logToDebugConsole('info', `Processing link: ${href}`);
    
    // Resolve relative path
    let targetPath = resolveRelativePath(currentFile.path, href);
    logToDebugConsole('info', `Resolved path: ${targetPath}`);
    
    // Check if it's likely a file or directory
    const isLikelyFile = href.includes('.') || href.match(/\.[a-z0-9]+$/i);
    
    if (isLikelyFile) {
        // Try to find and open the file
        const fileName = href.split('/').pop();
        const fileBaseName = fileName.toLowerCase().replace(/\.[^/.]+$/, ''); // Remove extension
        
        // First, try the exact path (suppress 404 logging as this is expected)
        const exactExists = await checkPathExists(targetPath, false, true);
        if (exactExists) {
            logToDebugConsole('success', `Found file at exact path: ${targetPath}`);
            viewFile(targetPath, fileName);
            return;
        }
        
        // If not found, try to find similar files in the current directory
        logToDebugConsole('info', `Exact path not found, searching for similar files matching: ${fileBaseName}`);
        const similarFile = await findSimilarFile(fileBaseName);
        if (similarFile) {
            logToDebugConsole('success', `Found similar file: ${similarFile.name} at ${similarFile.path}`);
            viewFile(similarFile.path, similarFile.name);
            return;
        }
        
        // If still not found, show error
        logToDebugConsole('warning', `Could not find file for link: ${href}`);
        showLinkError(href, 'File not found. The link may be broken or the file may not exist in this repository.');
    } else {
        // Try to navigate to directory
        const dirExists = await checkPathExists(targetPath, true, true);
        if (dirExists) {
            loadDirectory(targetPath);
        } else {
            showLinkError(href, 'Directory not found. The link may be broken or the directory may not exist.');
        }
    }
}

// Check if a path exists
async function checkPathExists(path, isDirectory, suppressErrorLogging = false) {
    try {
        if (isDirectory) {
            const response = await fetch(`/api/browse?path=${encodeURIComponent(path)}`);
            const data = await response.json();
            const exists = response.ok && !data.errors;
            
            if (!exists && !suppressErrorLogging && response.status !== 404) {
                logToDebugConsole('warning', `Directory check failed: ${path}`, {
                    status: response.status
                });
            }
            
            return exists;
        } else {
            const response = await fetch(`/api/file?path=${encodeURIComponent(path)}`);
            const exists = response.ok;
            
            // Only log non-404 errors, and only if not suppressed
            // 404s are expected when checking if files exist
            if (!exists && !suppressErrorLogging && response.status !== 404) {
                const errorData = await response.text();
                logToDebugConsole('warning', `File check failed: ${path}`, {
                    status: response.status,
                    response: errorData.substring(0, 200)
                });
            }
            
            return exists;
        }
    } catch (error) {
        if (!suppressErrorLogging) {
            logToDebugConsole('error', `Error checking path: ${path}`, {
                message: error.message,
                stack: error.stack
            });
        }
        return false;
    }
}

// Find a similar file in the current directory
async function findSimilarFile(searchTerm) {
    try {
        // Get the current file's directory
        const currentDir = currentFile.path.substring(0, currentFile.path.lastIndexOf('/'));
        
        logToDebugConsole('info', `Searching in directory: ${currentDir}`);
        
        // Browse the current directory
        const response = await fetch(`/api/browse?path=${encodeURIComponent(currentDir)}`);
        if (!response.ok) {
            logToDebugConsole('warning', `Failed to browse directory: ${currentDir}`, {
                status: response.status
            });
            return null;
        }
        
        const data = await response.json();
        if (!data.children) {
            logToDebugConsole('warning', 'No children in directory data');
            return null;
        }
        
        logToDebugConsole('info', `Found ${data.children.length} items in directory`);
        
        // Normalize search term
        searchTerm = searchTerm.toLowerCase();
        
        // Common file name mappings (generic name -> pattern to search)
        const fileNameMappings = {
            'changelog': '-changelog',
            'readme': '-readme',
            'license': '-license',
            'migration': '-migration',
            'troubleshooting': '-troubleshooting'
        };
        
        // Check if searchTerm matches a known generic name
        let searchPattern = searchTerm;
        for (const [genericName, pattern] of Object.entries(fileNameMappings)) {
            if (searchTerm.includes(genericName)) {
                searchPattern = pattern;
                logToDebugConsole('info', `Mapped "${genericName}" to pattern "${pattern}"`);
                break;
            }
        }
        
        // Search for files containing the search pattern
        const matchingFiles = data.children.filter(item => 
            !item.folder && item.uri.toLowerCase().includes(searchPattern)
        );
        
        logToDebugConsole('info', `Found ${matchingFiles.length} matching files for pattern "${searchPattern}"`);
        
        if (matchingFiles.length > 0) {
            // Scoring system for best match
            const scoredFiles = matchingFiles.map(file => {
                const fileName = file.uri.toLowerCase();
                let score = 0;
                
                // Exact name match gets highest score
                if (fileName.includes(searchTerm)) score += 10;
                
                // Contains search pattern
                if (fileName.includes(searchPattern)) score += 5;
                
                // Ends with same extension as search term
                const searchExt = searchTerm.match(/\.[^/.]+$/);
                if (searchExt && fileName.endsWith(searchExt[0])) score += 3;
                
                // Prefer files with the same base name as current file (same version/product)
                const currentBaseName = currentFile.name.split('-').slice(0, -1).join('-');
                if (fileName.includes(currentBaseName.toLowerCase())) score += 8;
                
                logToDebugConsole('info', `File: ${file.uri.substring(1)} - Score: ${score}`);
                
                return { file, score };
            });
            
            // Sort by score (highest first)
            scoredFiles.sort((a, b) => b.score - a.score);
            
            const bestMatch = scoredFiles[0].file;
            const result = {
                path: currentDir + bestMatch.uri,
                name: bestMatch.uri.substring(1)
            };
            
            logToDebugConsole('success', `Best match: ${result.name} (score: ${scoredFiles[0].score})`);
            
            return result;
        }
        
        logToDebugConsole('warning', `No similar files found for "${searchTerm}"`);
        return null;
    } catch (error) {
        logToDebugConsole('error', 'Error finding similar file', {
            message: error.message,
            stack: error.stack
        });
        return null;
    }
}

// Show link error message
function showLinkError(href, message) {
    const errorHtml = `
        <div class="link-error">
            <h3>⚠️ Link Not Found</h3>
            <p><strong>Link:</strong> <code>${href}</code></p>
            <p>${message}</p>
            <button onclick="closeViewer()" class="btn-action">Close</button>
        </div>
    `;
    
    contentArea.innerHTML = errorHtml;
    logToDebugConsole('warning', `Broken link detected: ${href}`, {
        message: message,
        currentFile: currentFile?.name
    });
}

// Resolve relative path based on current file location
function resolveRelativePath(currentFilePath, relativePath) {
    // Get directory of current file
    const currentDir = currentFilePath.substring(0, currentFilePath.lastIndexOf('/'));
    
    // Handle different relative path patterns
    if (relativePath.startsWith('/')) {
        // Absolute path from root
        return relativePath;
    } else if (relativePath.startsWith('./')) {
        // Current directory
        return currentDir + '/' + relativePath.substring(2);
    } else if (relativePath.startsWith('../')) {
        // Parent directory
        let path = currentDir;
        let rel = relativePath;
        
        while (rel.startsWith('../')) {
            path = path.substring(0, path.lastIndexOf('/'));
            rel = rel.substring(3);
        }
        
        return path + '/' + rel;
    } else {
        // Relative to current directory
        return currentDir + '/' + relativePath;
    }
}

// Render plain text content
function renderPlainText(content) {
    const pre = document.createElement('pre');
    pre.className = 'plain-text';
    pre.textContent = content;
    contentArea.innerHTML = '';
    contentArea.appendChild(pre);
}

// Close viewer
function closeViewer() {
    currentFile = null;
    viewerTitle.textContent = 'Content Viewer';
    downloadBtn.style.display = 'none';
    closeBtn.style.display = 'none';
    contentArea.innerHTML = '<div class="empty-state"><p>👈 Select a file to view its contents</p></div>';
    
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('active');
    });
}

// Download file
function downloadFile(file) {
    const link = document.createElement('a');
    link.href = `/api/file?path=${encodeURIComponent(file.path)}`;
    link.download = file.name;
    link.click();
}

// Helper: Get file icon based on extension
function getFileIcon(filename) {
    const ext = filename.toLowerCase().split('.').pop();
    const iconMap = {
        'md': '📝',
        'txt': '📄',
        'json': '📋',
        'xml': '📋',
        'yml': '⚙️',
        'yaml': '⚙️',
        'js': '💛',
        'ts': '💙',
        'html': '🌐',
        'css': '🎨',
        'png': '🖼️',
        'jpg': '🖼️',
        'jpeg': '🖼️',
        'gif': '🖼️',
        'svg': '🎨',
        'pdf': '📕',
        'zip': '📦',
        'jar': '☕',
        'aar': '🤖'
    };
    return iconMap[ext] || '📄';
}

// Helper: Format bytes to human readable
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// ===== NOTIFICATION & CHANGE DETECTION FEATURES =====

// Toggle notifications
async function toggleNotifications() {
    if (!notificationsEnabled) {
        await requestNotificationPermission();
    } else {
        disableNotifications();
    }
}

// Request notification permission
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        alert('This browser does not support notifications');
        return;
    }
    
    try {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            enableNotifications();
            // Send a test notification
            new Notification('Artifactory Browser', {
                body: 'Change notifications are now enabled! You\'ll be notified when files are added or modified.',
                icon: '🔔'
            });
        } else {
            notificationStatus.textContent = 'Permission denied';
            setTimeout(() => {
                notificationStatus.textContent = '';
            }, 3000);
        }
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        alert('Failed to enable notifications');
    }
}

// Enable notifications
function enableNotifications() {
    notificationsEnabled = true;
    localStorage.setItem('notificationsEnabled', 'true');
    
    notificationToggle.textContent = '🔔 Notifications ON';
    notificationToggle.classList.add('active');
    notificationStatus.textContent = `Checking every ${formatInterval(POLL_INTERVAL)}`;
    
    // Take initial snapshot
    captureSnapshot();
    
    // Start polling
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }
    pollingInterval = setInterval(checkForChanges, POLL_INTERVAL);
    
    console.log('Notifications enabled - polling every', formatInterval(POLL_INTERVAL));
}

// Format interval for display
function formatInterval(ms) {
    const seconds = ms / 1000;
    const minutes = seconds / 60;
    const hours = minutes / 60;
    
    if (hours >= 1) {
        return hours === 1 ? '1 hour' : `${hours} hours`;
    } else if (minutes >= 1) {
        return minutes === 1 ? '1 minute' : `${Math.round(minutes)} minutes`;
    } else {
        return seconds === 1 ? '1 second' : `${seconds} seconds`;
    }
}

// Disable notifications
function disableNotifications() {
    notificationsEnabled = false;
    localStorage.setItem('notificationsEnabled', 'false');
    
    notificationToggle.textContent = '🔔 Enable Notifications';
    notificationToggle.classList.remove('active');
    notificationStatus.textContent = '';
    
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
    
    console.log('Notifications disabled');
}

// Capture current state snapshot
async function captureSnapshot() {
    try {
        const response = await fetch(`/api/browse?path=${encodeURIComponent(currentPath)}`);
        if (!response.ok) return;
        
        const data = await response.json();
        if (data.children) {
            lastSnapshot = {
                path: currentPath,
                files: data.children.map(item => ({
                    uri: item.uri,
                    folder: item.folder,
                    size: item.size,
                    lastModified: item.lastModified
                }))
            };
            console.log('Snapshot captured:', lastSnapshot.files.length, 'items');
        }
    } catch (error) {
        console.error('Error capturing snapshot:', error);
    }
}

// Check for changes
async function checkForChanges() {
    if (!notificationsEnabled || !lastSnapshot) {
        return;
    }
    
    try {
        const response = await fetch(`/api/browse?path=${encodeURIComponent(currentPath)}`);
        if (!response.ok) return;
        
        const data = await response.json();
        if (!data.children) return;
        
        const currentFiles = data.children.map(item => ({
            uri: item.uri,
            folder: item.folder,
            size: item.size,
            lastModified: item.lastModified
        }));
        
        // Check if we're still on the same path
        if (currentPath !== lastSnapshot.path) {
            lastSnapshot = {
                path: currentPath,
                files: currentFiles
            };
            return;
        }
        
        // Detect changes
        const changes = detectChanges(lastSnapshot.files, currentFiles);
        
        if (changes.added.length > 0 || changes.modified.length > 0 || changes.removed.length > 0) {
            console.log('Changes detected:', changes);
            notifyChanges(changes);
            
            // Show visual indicator
            changeIndicator.style.display = 'inline-block';
            
            // Update snapshot
            lastSnapshot.files = currentFiles;
        }
    } catch (error) {
        console.error('Error checking for changes:', error);
    }
}

// Detect changes between two file lists
function detectChanges(oldFiles, newFiles) {
    const changes = {
        added: [],
        modified: [],
        removed: []
    };
    
    const oldMap = new Map(oldFiles.map(f => [f.uri, f]));
    const newMap = new Map(newFiles.map(f => [f.uri, f]));
    
    // Check for added and modified files
    for (const [uri, newFile] of newMap) {
        const oldFile = oldMap.get(uri);
        if (!oldFile) {
            changes.added.push(newFile);
        } else if (!newFile.folder && (newFile.size !== oldFile.size || newFile.lastModified !== oldFile.lastModified)) {
            changes.modified.push(newFile);
        }
    }
    
    // Check for removed files
    for (const [uri, oldFile] of oldMap) {
        if (!newMap.has(uri)) {
            changes.removed.push(oldFile);
        }
    }
    
    return changes;
}

// Send notification about changes
function notifyChanges(changes) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
    }
    
    let message = '';
    const details = [];
    
    if (changes.added.length > 0) {
        details.push(`${changes.added.length} file(s) added`);
    }
    if (changes.modified.length > 0) {
        details.push(`${changes.modified.length} file(s) modified`);
    }
    if (changes.removed.length > 0) {
        details.push(`${changes.removed.length} file(s) removed`);
    }
    
    message = details.join(', ');
    
    const notification = new Notification('Repository Updated', {
        body: message,
        icon: '🔔',
        tag: 'artifactory-changes',
        requireInteraction: false
    });
    
    // Click notification to focus window and refresh
    notification.onclick = () => {
        window.focus();
        changeIndicator.style.display = 'none';
        loadDirectory(currentPath);
        notification.close();
    };
    
    // Auto-close after 10 seconds
    setTimeout(() => notification.close(), 10000);
}

// ===== DEBUG CONSOLE FEATURES =====

// Initialize debug console
function initDebugConsole() {
    // Toggle console visibility
    toggleConsoleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDebugConsole();
    });
    
    // Also toggle when clicking header
    document.querySelector('.debug-header').addEventListener('click', () => {
        toggleDebugConsole();
    });
    
    // Clear console
    clearConsoleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearDebugConsole();
    });
    
    // Capture global errors
    window.addEventListener('error', (event) => {
        logToDebugConsole('error', `${event.message}`, {
            file: event.filename,
            line: event.lineno,
            column: event.colno,
            stack: event.error?.stack
        });
    });
    
    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        logToDebugConsole('error', `Unhandled Promise Rejection: ${event.reason}`, {
            stack: event.reason?.stack
        });
    });
    
    // Override console methods to capture them
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleLog = console.log;
    
    console.error = function(...args) {
        originalConsoleError.apply(console, args);
        logToDebugConsole('error', args.join(' '));
    };
    
    console.warn = function(...args) {
        originalConsoleWarn.apply(console, args);
        logToDebugConsole('warning', args.join(' '));
    };
    
    // Keep original console.log but optionally capture it
    // (commented out to avoid too much noise)
    // console.log = function(...args) {
    //     originalConsoleLog.apply(console, args);
    //     logToDebugConsole('info', args.join(' '));
    // };
    
    // Check console state from localStorage
    const consoleState = localStorage.getItem('debugConsoleExpanded');
    if (consoleState === 'true') {
        debugConsole.classList.remove('collapsed');
        toggleConsoleBtn.textContent = '▼';
    }
    
    logToDebugConsole('success', 'Debug console initialized successfully');
}

// Toggle debug console
function toggleDebugConsole() {
    debugConsole.classList.toggle('collapsed');
    
    if (debugConsole.classList.contains('collapsed')) {
        toggleConsoleBtn.textContent = '▲';
        localStorage.setItem('debugConsoleExpanded', 'false');
    } else {
        toggleConsoleBtn.textContent = '▼';
        localStorage.setItem('debugConsoleExpanded', 'true');
        // Scroll to bottom when opening
        setTimeout(() => {
            debugMessages.scrollTop = debugMessages.scrollHeight;
        }, 100);
    }
}

// Clear debug console
function clearDebugConsole() {
    debugMessages.innerHTML = '<div class="debug-message info">Console cleared.</div>';
    logToDebugConsole('success', 'Console cleared at ' + new Date().toLocaleTimeString());
}

// Log message to debug console
function logToDebugConsole(level, message, details = null) {
    const timestamp = new Date().toLocaleTimeString();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `debug-message ${level}`;
    
    const timestampSpan = document.createElement('span');
    timestampSpan.className = 'debug-timestamp';
    timestampSpan.textContent = timestamp;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'debug-content-text';
    contentDiv.textContent = message;
    
    messageDiv.appendChild(timestampSpan);
    messageDiv.appendChild(contentDiv);
    
    // Add details if available
    if (details) {
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'debug-stack';
        
        let detailsText = '';
        if (details.file) {
            detailsText += `File: ${details.file}:${details.line}:${details.column}\n`;
        }
        if (details.stack) {
            detailsText += `\nStack trace:\n${details.stack}`;
        }
        if (details.url) {
            detailsText += `URL: ${details.url}\n`;
        }
        if (details.status) {
            detailsText += `Status: ${details.status}\n`;
        }
        
        detailsDiv.textContent = detailsText;
        contentDiv.appendChild(detailsDiv);
    }
    
    debugMessages.appendChild(messageDiv);
    
    // Auto-scroll to bottom
    debugMessages.scrollTop = debugMessages.scrollHeight;
    
    // Limit messages to 100 to prevent memory issues
    const messages = debugMessages.querySelectorAll('.debug-message');
    if (messages.length > 100) {
        messages[0].remove();
    }
    
    // Flash the console if it's collapsed and it's an error
    if (level === 'error' && debugConsole.classList.contains('collapsed')) {
        debugConsole.style.borderTopColor = '#dc3545';
        setTimeout(() => {
            debugConsole.style.borderTopColor = '#667eea';
        }, 500);
    }
}

// Export function for manual logging
window.debugLog = {
    error: (msg, details) => logToDebugConsole('error', msg, details),
    warn: (msg, details) => logToDebugConsole('warning', msg, details),
    info: (msg, details) => logToDebugConsole('info', msg, details),
    success: (msg, details) => logToDebugConsole('success', msg, details)
};
