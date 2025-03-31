/**
 * This file contains the implementation for different LLM services
 */

import { generateAIPrompt } from './aiPrompt';
import { 
  startGeneration, 
  addGenerationStep, 
  updateGenerationProgress, 
  addGeneratedFile, 
  setGenerationError, 
  completeGeneration,
  generationStatus
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
  // Check if we should use mock implementations
  if (import.meta.env.VITE_USE_MOCK_IMPLEMENTATIONS === 'true') {
    console.log('Using mock implementations as specified in .env.local');
    throw new Error('Using mock implementations');
  }
  
  // For development, get API key from environment variables
  const keyMap = {
    'openai': import.meta.env.VITE_OPENAI_API_KEY,
    'anthropic': import.meta.env.VITE_ANTHROPIC_API_KEY,
    'deepseek': import.meta.env.VITE_DEEPSEEK_API_KEY
  };
  
  const key = keyMap[service];
  
  if (!key) {
    throw new Error(`No API key found for ${service}. Please check your .env.local file.`);
  }
  
  return key;
};

/**
 * Call the appropriate LLM service based on the selected option
 * @param {string} serviceId - The ID of the selected LLM service
 * @param {string} appIdea - The user's app idea
 * @param {string} modelId - The ID of the selected model (optional)
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
    // Check if we should use mock implementations
    if (import.meta.env.VITE_USE_MOCK_IMPLEMENTATIONS === 'true') {
      addGenerationStep('Using mock implementation (as specified in .env.local)');
      return await mockLLMCall(serviceId, appIdea, model.name);
    }
    
    addGenerationStep(`Sending request to ${service.name} API`);
    updateGenerationProgress(10);
    
    // Call the appropriate API based on serviceId
    let response;
    switch (serviceId) {
      case 'openai':
        response = await callOpenAI(prompt, modelId);
        break;
      case 'claude':
        response = await callClaude(prompt, modelId);
        break;
      case 'deepseek':
        response = await callDeepSeek(prompt, modelId);
        break;
      default:
        throw new Error(`Unknown LLM service: ${serviceId}`);
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
      
      // Save files to storage
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
    
    // Check if the error is about using mock implementations
    if (error.message === 'Using mock implementations') {
      addGenerationStep('Using mock implementation instead of API call');
      return await mockLLMCall(serviceId, appIdea, model.name);
    }
    
    setGenerationError(error);
    throw error; // Re-throw to be handled by the caller
  }
};

// OpenAI API call implementation
const callOpenAI = async (prompt, model = 'gpt-4o') => {
  try {
    const apiKey = getApiKey('openai');
    addGenerationStep('Sending request to OpenAI API');
    
    const response = await fetch('/api/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
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
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
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

// Claude API call implementation
const callClaude = async (prompt, model = 'claude-3-opus-20240229') => {
  try {
    const apiKey = getApiKey('anthropic');
    addGenerationStep('Sending request to Claude API');
    
    const response = await fetch('/api/anthropic/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 4000
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Claude API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    return processClaudeResponse(data);
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

// DeepSeek API call implementation
const callDeepSeek = async (prompt, model = 'deepseek-coder-33b-instruct') => {
  try {
    const apiKey = getApiKey('deepseek');
    addGenerationStep('Sending request to DeepSeek API');
    
    const response = await fetch('/api/deepseek/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
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
      const errorData = await response.json();
      throw new Error(`DeepSeek API error: ${errorData.error?.message || 'Unknown error'}`);
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
  
  // If no files were extracted, create basic placeholders
  if (files.length === 0) {
    addGenerationStep('No valid code files found in response, creating placeholders', 'warning');
    
    files.push(
      { 
        name: 'index.html', 
        content: '<html><head><title>Generated App</title><link rel="stylesheet" href="styles.css"></head><body><h1>Generated App</h1><script src="app.js"></script></body></html>', 
        type: 'html' 
      },
      { 
        name: 'styles.css', 
        content: 'body { font-family: sans-serif; margin: 0; padding: 20px; }', 
        type: 'css' 
      },
      { 
        name: 'app.js', 
        content: 'console.log("App initialized");', 
        type: 'javascript' 
      }
    );
  }
  
  return files;
};

// Mock implementation for development and fallback
const mockLLMCall = async (serviceId, appIdea, modelName = '') => {
  const serviceName = LLM_SERVICES.find(s => s.id === serviceId)?.name || serviceId;
  
  // Simulate API delay
  addGenerationStep('Generating app components...');
  updateGenerationProgress(20);
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  addGenerationStep('Creating HTML structure...');
  updateGenerationProgress(40);
  await new Promise(resolve => setTimeout(resolve, 800));
  
  addGenerationStep('Styling components with CSS...');
  updateGenerationProgress(60);
  await new Promise(resolve => setTimeout(resolve, 800));
  
  addGenerationStep('Implementing JavaScript functionality...');
  updateGenerationProgress(80);
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Create mock files
  const mockFiles = [
    { name: 'index.html', content: createMockHTMLContent(serviceId, appIdea, modelName), type: 'html' },
    { name: 'styles.css', content: createMockCSSContent(), type: 'css' },
    { name: 'app.js', content: createMockJSContent(), type: 'javascript' }
  ];
  
  // Generate unique ID and create metadata
  const appId = 'app_' + Date.now();
  const metadata = {
    name: `App from "${appIdea.substring(0, 30)}${appIdea.length > 30 ? '...' : ''}"`,
    idea: appIdea,
    llmService: serviceId,
    llmModel: modelName,
    serviceName: serviceName,
    modelName: modelName
  };
  
  // Save files to storage and potentially to disk
  await saveAppFiles(appId, mockFiles, metadata);
  
  // Track files individually
  mockFiles.forEach(file => {
    addGeneratedFile(file);
  });
  
  // Add appId to the generation status for navigation
  generationStatus.updateStatus({ appId });
  
  addGenerationStep('Finalizing app generation...');
  updateGenerationProgress(100);
  completeGeneration();
  
  return {
    success: true,
    message: `App generated successfully with ${serviceName} (${modelName || 'default'})`,
    service: serviceId,
    files: mockFiles
  };
};

// Mock content creation functions for fallback
const createMockHTMLContent = (serviceId, appIdea, modelName = '') => {
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
            <p>Generated with: ${serviceName} ${modelName ? `(${modelName})` : ''}</p>
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
        <p>&copy; 2025 Mock App. All rights reserved.</p>
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