const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Configuration
const ARTIFACTORY_BASE_URL = 'https://artifactory.persgroep.cloud';
const REPO_PATH = '/artifactory/api/storage/advertising-libraries-ext/be/persgroep/advertising/mobileadvertising-banner-advertising';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Proxy endpoint to get directory listing
app.get('/api/browse', async (req, res) => {
    try {
        const requestedPath = req.query.path || '';
        const fullPath = `${ARTIFACTORY_BASE_URL}${REPO_PATH}${requestedPath}`;
        
        console.log('Fetching:', fullPath);
        
        const response = await axios.get(fullPath, {
            headers: {
                'Accept': 'application/json'
            },
            validateStatus: (status) => status < 500
        });
        
        // Return the response with the appropriate status
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error fetching directory:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch directory',
            message: error.message 
        });
    }
});

// Proxy endpoint to get file content
app.get('/api/file', async (req, res) => {
    try {
        const requestedPath = req.query.path || '';
        const fullPath = `${ARTIFACTORY_BASE_URL}/artifactory/advertising-libraries-ext/be/persgroep/advertising/mobileadvertising-banner-advertising${requestedPath}`;
        
        console.log('Fetching file:', fullPath);
        
        const response = await axios.get(fullPath, {
            responseType: 'text',
            validateStatus: (status) => status < 500
        });
        
        // Check if the response is successful
        if (response.status === 200) {
            res.send(response.data);
        } else {
            // Return appropriate error status
            res.status(response.status).json({
                error: 'File not found',
                message: `File not found at path: ${requestedPath}`,
                status: response.status
            });
        }
    } catch (error) {
        console.error('Error fetching file:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch file',
            message: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Artifactory Viewer running at http://localhost:${PORT}`);
    console.log(`📁 Browsing: ${ARTIFACTORY_BASE_URL}${REPO_PATH}`);
});
