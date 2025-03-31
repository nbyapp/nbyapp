/**
 * This file contains the implementation for different LLM services
 * In a production environment, you would need to set up proper API keys
 * and authentication for each service.
 */

import { generateAIPrompt } from './aiPrompt';
import { 
  startGeneration, 
  addGenerationStep, 
  updateGenerationProgress, 
  addGeneratedFile, 
  setGenerationError, 
  completeGeneration 
} from './generationStatus';
import { saveAppFiles } from './fileSystem';

// LLM Service options with model choices
export const LLM_SERVICES = [
  { 
    id: 'openai', 
    name: 'OpenAI', 
    icon: '🧠',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', default: true },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
    ]
  },
  { 
    id: 'claude', 
    name: 'Anthropic Claude', 
    icon: '🔮',
    models: [
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', default: true },
      { id: 'claude-3.7-sonnet-20240229', name: 'Claude 3.7 Sonnet' },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' }
    ]
  },
  { 
    id: 'deepseek', 
    name: 'DeepSeek', 
    icon: '🔍',
    models: [
      { id: 'deepseek-coder-33b-instruct', name: 'Coder 33B', default: true },
      { id: 'deepseek-coder-6.7b-instruct', name: 'Coder 6.7B' }
    ]
  }
];

// Get API key from environment variables
const getApiKey = (service) => {
  // Debug output to console
  console.log('Env check in client:');
  console.log('VITE_USE_MOCK_IMPLEMENTATIONS:', import.meta.env.VITE_USE_MOCK_IMPLEMENTATIONS);
  
  // Check if we should use mock implementations
  if (import.meta.env.VITE_USE_MOCK_IMPLEMENTATIONS === 'true') {
    console.log('Using mock implementations as specified in .env.local');
    throw new Error('Using mock implementations');
  }
  
  // For the client side, we don't need actual API keys since they're handled by the proxy
  // This just checks if we should proceed with real API calls or use mocks
  return 'API_KEY_MANAGED_BY_SERVER';
};

/**
 * Call the appropriate LLM service based on the selected option
 * @param {string} serviceId - The ID of the selected LLM service
 * @param {string} modelId - The ID of the selected model (optional)
 * @param {string} appIdea - The user's app idea
 * @returns {Promise<Object>} - The response from the LLM service
 */
export const callLLMService = async (serviceId, appIdea, modelId = null) => {
  // Generate the prompt for the LLM
  const prompt = generateAIPrompt(appIdea);
  
  // Find service and get default model if none specified
  const service = LLM_SERVICES.find(s => s.id === serviceId);
  if (!service) throw new Error(`Unknown LLM service: ${serviceId}`);
  
  if (!modelId) {
    // Find default model
    const defaultModel = service.models.find(m => m.default);
    modelId = defaultModel ? defaultModel.id : service.models[0].id;
  }
  
  // Get the model details
  const model = service.models.find(m => m.id === modelId) || { id: modelId, name: modelId };
  
  // Initialize generation status
  startGeneration(service.name, model.name, appIdea);
  
  // Log the prompt and selected service (for debugging)
  console.log(`Using ${serviceId} (${modelId}) with prompt:`, prompt);
  addGenerationStep(`Preparing prompt for ${service.name} (${model.name})`);
  
  try {
    addGenerationStep(`Sending request to ${service.name} API`);
    updateGenerationProgress(10);
    
    // Add a timeout for the API call
    const timeoutMs = 30000; // 30 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request to ${service.name} timed out after ${timeoutMs/1000} seconds`));
      }, timeoutMs);
    });
    
    // Call the appropriate API based on serviceId with a timeout
    let response;
    try {
      // Race the API call against a timeout
      const apiCallPromise = (async () => {
        switch (serviceId) {
          case 'openai':
            return await callOpenAI(prompt, modelId);
          case 'claude':
            return await callClaude(prompt, modelId);
          case 'deepseek':
            return await callDeepSeek(prompt, modelId);
          default:
            throw new Error(`Unknown LLM service: ${serviceId}`);
        }
      })();
      
      response = await Promise.race([apiCallPromise, timeoutPromise]);
    } catch (apiError) {
      // If the error is a timeout or network error, give a helpful message
      if (apiError.message.includes('timed out') || 
          apiError.message.includes('NetworkError') ||
          apiError.message.includes('network') ||
          apiError.message.includes('ECONNRESET') ||
          apiError.code === 'ECONNABORTED') {
        
        addGenerationStep(`Connection error with ${service.name} API: ${apiError.message}`, 'error');
        addGenerationStep('Falling back to mock implementation due to connection issues', 'warning');
        
        // Fall back to mock implementation
        return mockLLMCall(serviceId, appIdea);
      }
      
      // Otherwise, rethrow the error
      throw apiError;
    }
    
    addGenerationStep(`Successfully received response from ${service.name}`);
    updateGenerationProgress(70);
    
    // Process and save the files
    addGenerationStep('Processing generated files');
    
    // Add each file to tracking
    if (response.files) {
      addGenerationStep(`Creating ${response.files.length} files`);
      
      // Generate unique ID and create metadata
      const appId = 'app_' + Date.now();
      const metadata = {
        name: `App from "${appIdea.substring(0, 30)}${appIdea.length > 30 ? '...' : ''}"`,
        idea: appIdea,
        llmService: serviceId,
        llmModel: modelId,
        serviceName: service.name,
        modelName: model.name
      };
      
      // Save files to storage and potentially to disk
      await saveAppFiles(appId, response.files, metadata);
      
      // Track files individually
      response.files.forEach(file => {
        addGeneratedFile(file);
      });
      
      // Add appId to the generation status for navigation
      generationStatus.updateStatus({ appId });
    }
    
    updateGenerationProgress(90);
    
    addGenerationStep('Finalizing app generation');
    completeGeneration();
    
    return response;
  } catch (error) {
    console.error(`Error calling ${serviceId}:`, error);
    setGenerationError(error);
    
    // Fall back to mock implementation
    addGenerationStep('Falling back to mock implementation', 'warning');
    return mockLLMCall(serviceId, appIdea);
  }
};

// Real implementation of OpenAI API call
const callOpenAI = async (prompt, model = 'gpt-4o') => {
  try {
    const apiKey = getApiKey('openai');
    
    addGenerationStep('Sending request to OpenAI via proxy');
    
    const response = await fetch('http://localhost:3001/api/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // API key is added by the proxy server
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: 'You are a web application generator.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    return processOpenAIResponse(data);
  } catch (error) {
    console.error('OpenAI API call failed:', error);
    addGenerationStep(`OpenAI API call failed: ${error.message}`, 'error');
    throw error;
  }
};

// Process OpenAI response
const processOpenAIResponse = (data) => {
  const content = data.choices[0]?.message?.content || '';
  
  addGenerationStep('Processing OpenAI response');
  updateGenerationProgress(50);
  
  // Extract code blocks from the content
  addGenerationStep('Extracting code files from response');
  const files = extractFilesFromContent(content);
  
  return {
    success: true,
    message: 'App generated successfully with OpenAI',
    service: 'openai',
    files: files
  };
};

// Real implementation of Claude API call
const callClaude = async (prompt, model = 'claude-3-opus-20240229') => {
  try {
    const apiKey = getApiKey('anthropic');
    
    addGenerationStep('Sending request to Claude via proxy');
    
    // First try with the proxy
    try {
      const response = await fetch('http://localhost:3001/api/anthropic/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // API key and version are added by the proxy server
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'user', content: prompt }
          ],
          max_tokens: 4000
        }),
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });
      
      // If successful, process response and return
      if (response.ok) {
        const data = await response.json();
        return processClaudeResponse(data);
      }
      
      // If proxy failed with a non-connection error, throw error with details
      const errorData = await response.json();
      throw new Error(`Claude API proxy error: ${errorData.error?.message || JSON.stringify(errorData)}`);
      
    } catch (proxyError) {
      // Check if the error is a connection error
      const isConnectionError = proxyError.message.includes('NetworkError') || 
                               proxyError.message.includes('Failed to fetch') ||
                               proxyError.message.includes('CORS') ||
                               proxyError.message.includes('ECONNRESET') ||
                               proxyError.message.includes('AbortError') ||
                               proxyError.message.includes('timeout') ||
                               proxyError.message.includes('connection');
      
      // If it's a connection error, try the direct route
      if (isConnectionError) {
        addGenerationStep('Proxy connection failed, trying direct API route', 'warning');
        console.log('Trying fallback direct API route due to connection error', proxyError);
        
        const directResponse = await fetch('http://localhost:3001/api/anthropic-direct/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'user', content: prompt }
            ],
            max_tokens: 4000
          })
        });
        
        if (!directResponse.ok) {
          const directErrorData = await directResponse.json();
          throw new Error(`Claude direct API error: ${directErrorData.error?.message || JSON.stringify(directErrorData)}`);
        }
        
        const directData = await directResponse.json();
        return processClaudeResponse(directData);
      }
      
      // If it's not a connection error, rethrow
      throw proxyError;
    }
  } catch (error) {
    console.error('Claude API call failed:', error);
    addGenerationStep(`Claude API call failed: ${error.message}`, 'error');
    throw error;
  }
};

// Process Claude response
const processClaudeResponse = (data) => {
  const content = data.content?.[0]?.text || '';
  
  addGenerationStep('Processing Claude response');
  updateGenerationProgress(50);
  
  // Extract code blocks from the content
  addGenerationStep('Extracting code files from response');
  const files = extractFilesFromContent(content);
  
  return {
    success: true,
    message: 'App generated successfully with Claude',
    service: 'claude',
    files: files
  };
};

// Real implementation of DeepSeek API call
const callDeepSeek = async (prompt, model = 'deepseek-coder-33b-instruct') => {
  try {
    const apiKey = getApiKey('deepseek');
    
    addGenerationStep('Sending request to DeepSeek via proxy');
    
    const response = await fetch('http://localhost:3001/api/deepseek/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // API key is added by the proxy server
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: 'You are a web application generator.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 4000
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`DeepSeek API error: ${error.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    return processDeepSeekResponse(data);
  } catch (error) {
    console.error('DeepSeek API call failed:', error);
    addGenerationStep(`DeepSeek API call failed: ${error.message}`, 'error');
    throw error;
  }
};

// Process DeepSeek response
const processDeepSeekResponse = (data) => {
  const content = data.choices[0]?.message?.content || '';
  
  addGenerationStep('Processing DeepSeek response');
  updateGenerationProgress(50);
  
  // Extract code blocks from the content
  addGenerationStep('Extracting code files from response');
  const files = extractFilesFromContent(content);
  
  return {
    success: true,
    message: 'App generated successfully with DeepSeek',
    service: 'deepseek',
    files: files
  };
};

// Helper function to extract files from LLM response content
const extractFilesFromContent = (content) => {
  const files = [];
  
  // Regex to match markdown code blocks with language tags
  const codeBlockRegex = /```([a-zA-Z]+)\n([\s\S]*?)```/g;
  let match;
  
  while ((match = codeBlockRegex.exec(content)) !== null) {
    const language = match[1].toLowerCase();
    const code = match[2].trim();
    
    // Determine file type and name based on language
    let type, name;
    
    switch (language) {
      case 'html':
        type = 'html';
        name = 'index.html';
        break;
      case 'css':
        type = 'css';
        name = 'styles.css';
        break;
      case 'javascript':
      case 'js':
        type = 'javascript';
        name = 'app.js';
        break;
      default:
        // Skip unknown languages
        continue;
    }
    
    // Check if file with this name already exists
    const existingFileIndex = files.findIndex(f => f.name === name);
    if (existingFileIndex >= 0) {
      // If file exists, add a number to the name
      const baseName = name.split('.')[0];
      const extension = name.split('.')[1];
      let counter = 1;
      
      while (files.findIndex(f => f.name === `${baseName}${counter}.${extension}`) >= 0) {
        counter++;
      }
      
      name = `${baseName}${counter}.${extension}`;
    }
    
    files.push({
      name: name,
      content: code,
      type: type
    });
  }
  
  // If we couldn't extract any files, create placeholders
  if (files.length === 0) {
    files.push(
      { name: 'index.html', content: '<h1>Generated App</h1>', type: 'html' },
      { name: 'styles.css', content: 'body { font-family: sans-serif; }', type: 'css' },
      { name: 'app.js', content: 'console.log("App initialized");', type: 'javascript' }
    );
  }
  
  return files;
};

// Mock implementation for fallback in development
const mockLLMCall = async (serviceId, appIdea) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const serviceName = LLM_SERVICES.find(s => s.id === serviceId)?.name || serviceId;
  
  return {
    success: true,
    message: `App generated successfully with ${serviceName} (MOCK)`,
    service: serviceId,
    files: [
      { name: 'index.html', content: createMockHTMLContent(serviceId, appIdea), type: 'html' },
      { name: 'styles.css', content: createMockCSSContent(), type: 'css' },
      { name: 'app.js', content: createMockJSContent(), type: 'javascript' }
    ]
  };
};

// Mock content creation functions for fallback
const createMockHTMLContent = (serviceId, appIdea) => {
  const serviceName = LLM_SERVICES.find(s => s.id === serviceId)?.name || serviceId;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated App (Mock)</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <nav>
            <div class="logo">MockApp</div>
            <ul>
                <li><a href="#" class="active">Home</a></li>
                <li><a href="#">Features</a></li>
                <li><a href="#">About</a></li>
                <li><a href="#">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <section class="hero">
            <h1>Welcome to Your Mock App</h1>
            <p>App Idea: "${appIdea || 'No app idea provided'}"</p>
            <p>This is a mock app because real API integration is disabled or no API key was provided.</p>
            <p>Generated with: ${serviceName} (Mock)</p>
            <button class="btn primary">Get Started</button>
        </section>
        
        <section class="features">
            <h2>Features</h2>
            <div class="feature-grid">
                <div class="feature-card">
                    <h3>Feature 1</h3>
                    <p>Description of this amazing feature</p>
                </div>
                <div class="feature-card">
                    <h3>Feature 2</h3>
                    <p>Description of this amazing feature</p>
                </div>
                <div class="feature-card">
                    <h3>Feature 3</h3>
                    <p>Description of this amazing feature</p>
                </div>
            </div>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2024 Mock App. All rights reserved.</p>
    </footer>
    
    <script src="app.js"></script>
</body>
</html>`;
};

const createMockCSSContent = () => {
  return `/* Basic Reset */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    line-height: 1.6;
    color: #333;
}

/* Navigation */
nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: #0070f3;
}

nav ul {
    display: flex;
    list-style: none;
}

nav ul li {
    margin-left: 2rem;
}

nav ul li a {
    text-decoration: none;
    color: #666;
    font-weight: 500;
    transition: color 0.3s ease;
}

nav ul li a:hover, nav ul li a.active {
    color: #0070f3;
}

/* Hero Section */
.hero {
    padding: 6rem 2rem;
    text-align: center;
    background-color: #f9fafb;
}

.hero h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: #111;
}

.hero p {
    font-size: 1.25rem;
    max-width: 800px;
    margin: 0 auto 2rem;
    color: #666;
}

/* Buttons */
.btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    border-radius: 0.375rem;
    font-weight: 500;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    font-size: 1rem;
}

.primary {
    background-color: #0070f3;
    color: white;
}

.primary:hover {
    background-color: #005dd1;
}`;
};

const createMockJSContent = () => {
  return `// Simple app initialization
document.addEventListener('DOMContentLoaded', () => {
  console.log('Mock App initialized');
  
  // Get all navigation links
  const navLinks = document.querySelectorAll('nav ul li a');
  
  // Add click event listeners to nav links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remove active class from all links
      navLinks.forEach(l => l.classList.remove('active'));
      
      // Add active class to clicked link
      link.classList.add('active');
      
      // In a real app, we would handle navigation here
      console.log('Navigating to:', link.textContent);
    });
  });
  
  // Get the primary button
  const primaryButton = document.querySelector('.btn.primary');
  
  // Add click event listener to primary button
  if (primaryButton) {
    primaryButton.addEventListener('click', () => {
      console.log('Primary button clicked');
      alert('This is a mock app! In a real implementation, this would trigger an action.');
    });
  }
});`;
};