# Link Handling in Markdown Files

## Overview

The Artifactory Browser includes intelligent link handling for markdown files, automatically resolving and fixing broken links where possible.

## Link Types

### 1. **External Links** 🌐
Links starting with `http://`, `https://`, `mailto:`, etc.

**Behavior:**
- Opens in a new browser tab
- Shown in green color
- Has a ↗ icon indicating external link

**Example:**
```markdown
[Google](https://google.com)
```

### 2. **Internal/Relative Links** 📄
Links to other files or directories in the repository.

**Behavior:**
- Clicks are handled within the application
- Attempts to resolve the path intelligently
- Falls back to smart search if exact path not found

**Example:**
```markdown
[README](./README.md)
[License](../LICENSE)
```

### 3. **Anchor Links** ⚓
Links to sections within the same document.

**Behavior:**
- Standard browser scroll behavior
- No special handling needed

**Example:**
```markdown
[Jump to section](#my-section)
```

## Smart Link Resolution

When you click on a relative link, the system performs these steps:

### Step 1: Exact Path Resolution
First, it tries to find the file at the exact relative path.

Example: If you're viewing `/11.2.9/migration-guide-android.md` and click `[Changelog](../CHANGELOG.md)`, it looks for `/CHANGELOG.md`

### Step 2: Intelligent File Search
If the exact file isn't found, the system searches the current directory for similar files.

**Search Features:**
- **Pattern Matching**: Maps generic names to common patterns
  - `CHANGELOG.md` → looks for files containing `-changelog`
  - `README.md` → looks for files containing `-readme`
  - `LICENSE` → looks for files containing `-license`
  
- **Version Awareness**: Prioritizes files with the same version/product name as the current file
  - If viewing `mobileadvertising-banner-advertising-11.2.9-migration-guide-android.md`
  - And link is `../CHANGELOG.md`
  - It will find `mobileadvertising-banner-advertising-11.2.9-changelog.md`

- **Scoring System**: Ranks potential matches based on:
  - Name similarity (10 points)
  - Pattern match (5 points)
  - Same file extension (3 points)
  - Same product/version prefix (8 points)

### Step 3: Error Display
If no match is found, shows a helpful error message with:
- The broken link path
- Clear explanation
- Option to close the viewer

## Visual Indicators

### Link Icons
- **External links**: Green text with ↗ symbol
- **Internal links**: Blue text with 📄 icon
- All links show tooltip on hover

### Image Handling
- External images load normally
- Broken image references show a placeholder:
  ```
  🖼️ Image not available: path/to/image.png
  ```

## Common Link Patterns

### Same Directory
```markdown
[File](./file.md)
[File](file.md)
```
Both resolve to a file in the current directory.

### Parent Directory
```markdown
[File](../file.md)
```
Looks for file in the parent directory.

### Absolute Path
```markdown
[File](/path/to/file.md)
```
Starts from the repository root.

### Nested Paths
```markdown
[File](../../other/folder/file.md)
```
Navigates up two directories, then down into other/folder.

## Examples from Real Files

### Example 1: Changelog Link
**Link in file:** `[Changelog](../CHANGELOG.md)`

**Current file:** `/11.2.9/mobileadvertising-banner-advertising-11.2.9-migration-guide-android.md`

**Resolution:**
1. Tries: `/CHANGELOG.md` → Not found
2. Searches current directory (`/11.2.9/`) for files matching "changelog"
3. Finds: `mobileadvertising-banner-advertising-11.2.9-changelog.md`
4. Opens that file ✓

### Example 2: License Link
**Link in file:** `[LICENSE](../LICENSE)`

**Current file:** `/11.2.9/mobileadvertising-banner-advertising-11.2.9-readme-android.md`

**Resolution:**
1. Tries: `/LICENSE` → Not found
2. Searches current directory for files matching "license"
3. If found, opens it; otherwise shows error

### Example 3: Image Link
**Link in file:** `![Screenshot](../.bitbucket/img/screenshot.png)`

**Behavior:**
- Browser attempts to load the image
- If it fails (404), shows placeholder: "🖼️ Image not available"

## Troubleshooting

### Link doesn't work?

**Possible reasons:**
1. **File doesn't exist** - The referenced file isn't in the repository
2. **Different naming** - File exists but with a different name
3. **Wrong path** - The relative path is incorrect

**What the system does:**
- Searches intelligently for similar files
- Shows clear error messages
- Provides option to return to file browser

### Want to see the actual link?

Hover over any link to see:
- External links: Full URL
- Internal links: The relative path from the markdown

## Developer Notes

### Path Resolution Algorithm

```javascript
resolveRelativePath(currentFilePath, relativePath) {
  if (relativePath.startsWith('/')) {
    // Absolute from root
    return relativePath;
  } else if (relativePath.startsWith('./')) {
    // Same directory
    return currentDir + '/' + relativePath.substring(2);
  } else if (relativePath.startsWith('../')) {
    // Parent directory (handles multiple ../)
    return navigateUp(currentDir, relativePath);
  } else {
    // Relative to current directory
    return currentDir + '/' + relativePath;
  }
}
```

### File Search Priorities

1. **Exact match** (same file name)
2. **Version-specific match** (same product + version + type)
3. **Pattern match** (generic name mapped to pattern)
4. **Partial match** (contains search term)

## Future Enhancements

Potential improvements:
- [ ] Cache resolved paths for faster subsequent loads
- [ ] Show "Did you mean?" suggestions for broken links
- [ ] Support for glob patterns in links
- [ ] Preview tooltip on link hover
- [ ] Breadcrumb trail for link navigation history
