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
    serviceName: metadata.serviceName || '',
    modelName: metadata.modelName || '',
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
  
  // For now we skip any server-side saving to disk
  // In a production implementation, this would save files to server
  
  return generatedApp;
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