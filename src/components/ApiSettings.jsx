import React, { useState, useEffect } from 'react';

const ApiSettings = ({ isOpen, onClose }) => {
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    anthropic: '',
    deepseek: ''
  });
  
  // Load API keys from localStorage on component mount
  useEffect(() => {
    const savedKeys = JSON.parse(localStorage.getItem('nbyapp_api_keys') || '{}');
    setApiKeys({
      openai: savedKeys.openai || '',
      anthropic: savedKeys.anthropic || '',
      deepseek: savedKeys.deepseek || ''
    });
  }, []);
  
  // Update localStorage when API keys change
  const handleSave = () => {
    localStorage.setItem('nbyapp_api_keys', JSON.stringify(apiKeys));
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">API Settings</h2>
        
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Enter your API keys for each service you want to use. These keys are stored in your browser and are never sent to our servers.
          </p>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="openai-key" className="block text-sm font-medium text-gray-700 mb-1">
                OpenAI API Key
              </label>
              <input
                id="openai-key"
                type="password"
                value={apiKeys.openai}
                onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                className="input w-full border-gray-300"
                placeholder="sk-..."
              />
            </div>
            
            <div>
              <label htmlFor="anthropic-key" className="block text-sm font-medium text-gray-700 mb-1">
                Anthropic API Key
              </label>
              <input
                id="anthropic-key"
                type="password"
                value={apiKeys.anthropic}
                onChange={(e) => setApiKeys({ ...apiKeys, anthropic: e.target.value })}
                className="input w-full border-gray-300"
                placeholder="sk-ant-..."
              />
            </div>
            
            <div>
              <label htmlFor="deepseek-key" className="block text-sm font-medium text-gray-700 mb-1">
                DeepSeek API Key
              </label>
              <input
                id="deepseek-key"
                type="password"
                value={apiKeys.deepseek}
                onChange={(e) => setApiKeys({ ...apiKeys, deepseek: e.target.value })}
                className="input w-full border-gray-300"
                placeholder="sk-..."
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="btn btn-primary"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiSettings;