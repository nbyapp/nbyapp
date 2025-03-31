/**
 * File system utilities for saving and reading generated app files
 */

import { addGenerationStep } from './generationStatus';

/**
 * Save app files to localStorage and optionally to disk
 * @param {string} appId - The unique ID for the app
 * @param {Array} files - Array of file objects with name, content, and type
 * @param {Object} metadata - Additional metadata about the app
 * @returns {Object} - The saved app object
 */
export const saveAppFiles = async (appId, files, metadata = {}) => {
  const timestamp = new Date().toISOString();
  
  // Create app object with metadata
  const generatedApp = {
    id: appId,
    name: metadata.name || `App ${appId.replace('app_', '')}`,
    idea: metadata.idea || '',
    llmService: metadata.llmService || '',
    llmModel: metadata.llmModel || '',
    createdAt: timestamp,
    files: files
  };
  
  // For browser demo, store in localStorage
  try {
    // Get existing apps
    const apps = JSON.parse(localStorage.getItem('nbyApps') || '[]');
    
    // Add new app
    apps.push(generatedApp);
    
    // Save back to localStorage
    localStorage.setItem('nbyApps', JSON.stringify(apps));
    
    addGenerationStep('Saved app to browser storage');
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    addGenerationStep('Failed to save to browser storage', 'error');
  }
  
  // For server implementation, save to disk
  if (typeof window === 'undefined' || typeof fetch !== 'undefined') {
    try {
      // In a real server implementation, this is where you would:
      // 1. Create the directory for the app
      // 2. Write each file to disk
      // 3. Optionally commit to git

      // For now, we'll simulate a server call to demonstrate how it would work
      addGenerationStep('Saving files to disk (simulated)');
      
      // Simulate API call to save files
      const saveResult = await simulateSaveFilesToDisk(appId, files);
      
      if (saveResult.success) {
        addGenerationStep(`Files saved to disk at ${saveResult.path}`, 'success');
      } else {
        addGenerationStep(`Failed to save files to disk: ${saveResult.error}`, 'error');
      }
    } catch (error) {
      console.error('Error saving files to disk:', error);
      addGenerationStep('Failed to save files to disk', 'error');
    }
  }
  
  return generatedApp;
};

/**
 * Simulate saving files to disk (in a real implementation, this would actually write files)
 * @param {string} appId - The app ID
 * @param {Array} files - The files to save
 * @returns {Object} - The result of the save operation
 */
const simulateSaveFilesToDisk = async (appId, files) => {
  try {
    addGenerationStep('Saving files to disk via API');
    
    // Call our backend API to save the files
    const response = await fetch('http://localhost:3001/api/save-files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ appId, files })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save files');
    }
    
    const result = await response.json();
    
    // Log the files that were created
    if (result.files && result.files.length > 0) {
      result.files.forEach(fileName => {
        console.log(`Created: /userapps/${appId}/${fileName}`);
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error saving files to disk:', error);
    return {
      success: false,
      error: error.message,
      fallback: 'Using browser storage only'
    };
  }
};

/**
 * Get app by ID from localStorage
 * @param {string} appId - The app ID to retrieve
 * @returns {Object|null} - The app object or null if not found
 */
export const getAppById = (appId) => {
  const apps = JSON.parse(localStorage.getItem('nbyApps') || '[]');
  return apps.find(app => app.id === appId) || null;
};

/**
 * Get all apps from localStorage
 * @returns {Array} - Array of app objects
 */
export const getAllApps = () => {
  return JSON.parse(localStorage.getItem('nbyApps') || '[]');
};

/**
 * Delete an app from localStorage
 * @param {string} appId - The app ID to delete
 * @returns {boolean} - Whether the app was successfully deleted
 */
export const deleteApp = (appId) => {
  const apps = JSON.parse(localStorage.getItem('nbyApps') || '[]');
  const newApps = apps.filter(app => app.id !== appId);
  
  if (newApps.length === apps.length) {
    return false; // App not found
  }
  
  localStorage.setItem('nbyApps', JSON.stringify(newApps));
  return true;
}; 