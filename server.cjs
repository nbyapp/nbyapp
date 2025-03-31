const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Log environment variables (without exposing full key values)
console.log('Environment variables loaded:');
console.log('VITE_USE_MOCK_IMPLEMENTATIONS:', process.env.VITE_USE_MOCK_IMPLEMENTATIONS);
console.log('VITE_OPENAI_API_KEY:', process.env.VITE_OPENAI_API_KEY ? '(Set, starts with: ' + process.env.VITE_OPENAI_API_KEY.substring(0, 3) + '...)' : '(Not set or invalid)');
console.log('VITE_ANTHROPIC_API_KEY:', process.env.VITE_ANTHROPIC_API_KEY ? '(Set, starts with: ' + process.env.VITE_ANTHROPIC_API_KEY.substring(0, 3) + '...)' : '(Not set or invalid)');
console.log('VITE_DEEPSEEK_API_KEY:', process.env.VITE_DEEPSEEK_API_KEY ? '(Set, starts with: ' + process.env.VITE_DEEPSEEK_API_KEY.substring(0, 3) + '...)' : '(Not set or invalid)');

// Check if we're using placeholder values
if (process.env.VITE_OPENAI_API_KEY === 'your_openai_api_key_here' ||
    process.env.VITE_ANTHROPIC_API_KEY === 'your_anthropic_api_key_here' ||
    process.env.VITE_DEEPSEEK_API_KEY === 'your_deepseek_api_key_here') {
  console.warn('\n⚠️ WARNING: Using placeholder API keys. Set VITE_USE_MOCK_IMPLEMENTATIONS=true in .env.local\n');
}

const app = express();
// Force port 3001 for consistency - Vite uses 3000
const PORT = 3001; 

// Enable CORS for the frontend
app.use(cors({
  origin: 'http://localhost:3000', // Frontend runs on 3000
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-api-key', 'anthropic-version', 'Authorization'],
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json({ limit: '50mb' }));

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Special test endpoint to check env vars
app.get('/api/env-check', (req, res) => {
  // Force re-read of environment variables
  try {
    const envPath = path.resolve(__dirname, '.env.local');
    console.log('Attempting to read .env.local from:', envPath);
    
    // Read the file directly to verify its contents
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('.env.local contents:', envContent);
    
    // Re-load environment variables
    const envConfig = dotenv.parse(envContent);
    
    // Log what we found
    console.log('Parsed environment variables:');
    for (const key in envConfig) {
      if (key.startsWith('VITE_')) {
        console.log(`${key}: ${key.includes('KEY') ? '(Key value hidden)' : envConfig[key]}`);
      }
    }
    
    // Prepare response
    res.json({
      mockImplementations: envConfig.VITE_USE_MOCK_IMPLEMENTATIONS === 'true',
      openAiKeyValid: envConfig.VITE_OPENAI_API_KEY && 
                      envConfig.VITE_OPENAI_API_KEY !== 'your_openai_api_key_here',
      anthropicKeyValid: envConfig.VITE_ANTHROPIC_API_KEY && 
                      envConfig.VITE_ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here',
      deepseekKeyValid: envConfig.VITE_DEEPSEEK_API_KEY && 
                      envConfig.VITE_DEEPSEEK_API_KEY !== 'your_deepseek_api_key_here',
      currentEnv: { 
        VITE_USE_MOCK_IMPLEMENTATIONS: envConfig.VITE_USE_MOCK_IMPLEMENTATIONS
      }
    });
  } catch (error) {
    console.error('Error reading environment variables:', error);
    res.status(500).json({ error: 'Failed to read environment variables' });
  }
});

// Proxy routes for LLM services
// OpenAI proxy
app.use('/api/openai', createProxyMiddleware({
  target: 'https://api.openai.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/openai': '/v1'
  },
  onProxyReq: (proxyReq, req) => {
    // Add API key from environment variable
    const apiKey = process.env.VITE_OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      console.error('⚠️ WARNING: Using a placeholder or empty API key for OpenAI');
    }
    proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
    console.log('Proxying OpenAI request');
  }
}));

// Anthropic proxy
app.use('/api/anthropic', createProxyMiddleware({
  target: 'https://api.anthropic.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/anthropic': '/v1'
  },
  timeout: 120000, // Increase timeout to 120 seconds
  proxyTimeout: 120000, // Increase proxy timeout
  onProxyReq: (proxyReq, req) => {
    // Add API key from environment variable
    const apiKey = process.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
      console.error('⚠️ WARNING: Using a placeholder or empty API key for Anthropic');
    }
    
    proxyReq.setHeader('x-api-key', apiKey);
    proxyReq.setHeader('anthropic-version', '2023-06-01');
    console.log('Proxying Anthropic request');
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('Received response from Anthropic API with status:', proxyRes.statusCode);
  },
  onError: (err, req, res) => {
    console.error('Anthropic Proxy error:', err);
    
    // Send a properly formatted JSON response
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: {
        type: 'connection_error',
        message: `Proxy connection error: ${err.message}`, 
        code: err.code || 'UNKNOWN'
      }
    }));
  }
}));

// Fallback direct route for Anthropic API in case the proxy fails
app.post('/api/anthropic-direct/messages', async (req, res) => {
  try {
    console.log('Using direct Anthropic API fallback route');
    const apiKey = process.env.VITE_ANTHROPIC_API_KEY;
    
    if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
      return res.status(400).json({
        error: {
          message: 'Invalid or missing Anthropic API key'
        }
      });
    }
    
    // Forward the request to Anthropic directly
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });
    
    // Get response data
    const data = await response.json();
    
    // Forward the response back to the client
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Direct Anthropic API call failed:', error);
    res.status(500).json({
      error: {
        message: `Direct API call failed: ${error.message}`
      }
    });
  }
});

// DeepSeek proxy
app.use('/api/deepseek', createProxyMiddleware({
  target: 'https://api.deepseek.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/deepseek': '/v1'
  },
  onProxyReq: (proxyReq, req) => {
    // Add API key from environment variable
    proxyReq.setHeader('Authorization', `Bearer ${process.env.VITE_DEEPSEEK_API_KEY}`);
    console.log('Proxying DeepSeek request');
  }
}));

// File saving endpoint
app.post('/api/save-files', (req, res) => {
  console.log('Received file save request');
  const { appId, files } = req.body;
  
  if (!appId || !files || !Array.isArray(files)) {
    return res.status(400).json({ success: false, error: 'Invalid request format' });
  }
  
  try {
    // Create app directory
    const appDir = path.join(__dirname, 'userapps', appId);
    fs.mkdirSync(appDir, { recursive: true });
    
    // Write each file
    const savedFiles = [];
    for (const file of files) {
      if (!file.name || !file.content) continue;
      
      const filePath = path.join(appDir, file.name);
      fs.writeFileSync(filePath, file.content);
      savedFiles.push(file.name);
      console.log(`Saved file: ${filePath}`);
    }
    
    return res.json({
      success: true,
      path: `/userapps/${appId}/`,
      filesCreated: savedFiles.length,
      files: savedFiles
    });
  } catch (error) {
    console.error('Error saving files:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to save files' 
    });
  }
});

// Status check endpoint
app.get('/api/status', (req, res) => {
  res.json({ status: 'OK', time: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`Frontend should be running on http://localhost:3000`);
}); 