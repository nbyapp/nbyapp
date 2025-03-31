import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { callLLMService, LLM_SERVICES } from '../utils/llmServices';
import { generationStatus } from '../utils/generationStatus';
import GenerationStatusBar from '../components/GenerationStatusBar';

function AppCreatorPage() {
  const [appIdea, setAppIdea] = useState('');
  const [selectedLLM, setSelectedLLM] = useState('openai'); // Default to OpenAI
  const [selectedModel, setSelectedModel] = useState(''); // Will be set based on default model
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Set default model when LLM service changes
  useEffect(() => {
    const service = LLM_SERVICES.find(s => s.id === selectedLLM);
    if (service && service.models) {
      // Find default model or use first model
      const defaultModel = service.models.find(m => m.default);
      setSelectedModel(defaultModel ? defaultModel.id : service.models[0].id);
    }
  }, [selectedLLM]);

  // Subscribe to generation status
  useEffect(() => {
    const unsubscribe = generationStatus.subscribe(status => {
      setIsGenerating(status.isGenerating);
      
      if (status.error) {
        setError(status.error.message || 'An error occurred during generation');
      }
      
      // If generation completed and there's an appId, navigate to it
      if (!status.isGenerating && status.appId) {
        navigate(`/preview/${status.appId}`);
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);

  // Generate the app using the selected LLM service and model
  const generateApp = async () => {
    if (!appIdea.trim()) {
      setError('Please enter an app idea');
      return;
    }

    setError('');
    
    try {
      // Call the selected LLM service with the selected model
      await callLLMService(selectedLLM, appIdea, selectedModel);
    } catch (err) {
      console.error('Error generating app:', err);
      // Error is handled by the generationStatus subscription
    }
  };
  
  // Find the selected LLM service details
  const selectedLLMDetails = LLM_SERVICES.find(service => service.id === selectedLLM);
  
  // Find the selected model details
  const selectedModelDetails = selectedLLMDetails?.models?.find(model => model.id === selectedModel);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Create Your App</h1>
        <p className="mt-2 text-lg text-gray-600">
          Describe your app idea, and our AI will generate a complete web application.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="card bg-white p-6 shadow-md rounded-lg">
          {/* LLM Service selection */}
          <div className="mb-5">
            <label htmlFor="llm-selector" className="block text-sm font-medium text-gray-700 mb-2">
              Select AI Service
            </label>
            <div className="relative">
              <select
                id="llm-selector"
                name="llm-selector"
                className="input w-full py-2 pl-3 pr-10 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md"
                value={selectedLLM}
                onChange={(e) => setSelectedLLM(e.target.value)}
                disabled={isGenerating}
              >
                {LLM_SERVICES.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.icon} {service.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Model selection */}
          {selectedLLMDetails?.models && (
            <div className="mb-5">
              <label htmlFor="model-selector" className="block text-sm font-medium text-gray-700 mb-2">
                Select Model
              </label>
              <div className="relative">
                <select
                  id="model-selector"
                  name="model-selector"
                  className="input w-full py-2 pl-3 pr-10 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={isGenerating}
                >
                  {selectedLLMDetails.models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} {model.default ? "(Default)" : ""}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Different models have different capabilities and speed
              </p>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="appIdea" className="block text-sm font-medium text-gray-700 mb-2">
              Describe your app idea
            </label>
            <textarea
              id="appIdea"
              name="appIdea"
              rows={6}
              className="input w-full border-gray-300 focus:ring-primary-500 focus:border-primary-500"
              placeholder="E.g., A minimalist habit tracking app that helps users build consistent routines through visual progress tracking and gentle reminders."
              value={appIdea}
              onChange={(e) => setAppIdea(e.target.value)}
              disabled={isGenerating}
            ></textarea>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              <p>{error}</p>
              {error.includes('API key') && (
                <p className="mt-2 text-sm">
                  Make sure you've set the API key in your .env.local file for {selectedLLM === 'claude' ? 'VITE_ANTHROPIC_API_KEY' : 
                    selectedLLM === 'openai' ? 'VITE_OPENAI_API_KEY' : 'VITE_DEEPSEEK_API_KEY'}.
                </p>
              )}
            </div>
          )}

          <div className="flex justify-center">
            <button
              className="btn btn-primary py-2 px-6"
              onClick={generateApp}
              disabled={isGenerating || !appIdea.trim()}
            >
              {isGenerating ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating App...
                </span>
              ) : (
                "Generate App"
              )}
            </button>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tips for great results</h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <svg className="flex-shrink-0 h-5 w-5 text-primary-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="ml-2">Describe your app's purpose and target audience</span>
            </li>
            <li className="flex items-start">
              <svg className="flex-shrink-0 h-5 w-5 text-primary-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="ml-2">Mention key features you'd like your app to have</span>
            </li>
            <li className="flex items-start">
              <svg className="flex-shrink-0 h-5 w-5 text-primary-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="ml-2">Specify any design preferences or aesthetic style</span>
            </li>
            <li className="flex items-start">
              <svg className="flex-shrink-0 h-5 w-5 text-primary-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="ml-2">Be as specific as possible for better results</span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Generation Status Bar */}
      <GenerationStatusBar />
    </div>
  );
}

export default AppCreatorPage;