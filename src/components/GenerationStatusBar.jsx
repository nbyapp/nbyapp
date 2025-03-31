import React, { useState, useEffect } from 'react';
import { generationStatus } from '../utils/generationStatus';

const GenerationStatusBar = () => {
  const [status, setStatus] = useState({
    isGenerating: false,
    steps: [],
    progress: 0,
    currentStep: '',
    files: []
  });

  useEffect(() => {
    // Subscribe to generation status updates
    const unsubscribe = generationStatus.subscribe(newStatus => {
      setStatus(newStatus);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // If not generating, don't show anything
  if (!status.isGenerating) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium">Generating App</h3>
          <span className="text-sm text-gray-500">
            {Math.round(status.progress)}% Complete
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${status.progress}%` }}
          ></div>
        </div>

        {/* Current step */}
        <div className="mb-2 text-sm font-medium">
          {status.currentStep}
        </div>

        {/* Collapsible details section */}
        <details className="text-sm">
          <summary className="cursor-pointer mb-2 text-blue-600 hover:text-blue-800">
            View Details
          </summary>
          
          {/* Steps log */}
          <div className="bg-gray-50 rounded p-3 max-h-48 overflow-y-auto mb-2">
            {status.steps.map((step, index) => (
              <div key={index} className="mb-1">
                <span className={`
                  inline-block w-2 h-2 rounded-full mr-2
                  ${step.type === 'error' ? 'bg-red-500' : 
                    step.type === 'warning' ? 'bg-yellow-500' : 
                    step.type === 'success' ? 'bg-green-500' : 
                    step.type === 'file' ? 'bg-purple-500' : 'bg-blue-500'}
                `}></span>
                {step.message}
              </div>
            ))}
          </div>
          
          {/* Files generated */}
          {status.files.length > 0 && (
            <div>
              <h4 className="font-medium mb-1">Files Generated:</h4>
              <ul className="list-disc list-inside pl-2">
                {status.files.map((file, index) => (
                  <li key={index} className="text-gray-700">
                    {file.name} <span className="text-gray-500">({file.type})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </details>
      </div>
    </div>
  );
};

export default GenerationStatusBar; 