import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';

function AppPreviewPage() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('preview');
  const [activeFile, setActiveFile] = useState(null);
  const [iframeKey, setIframeKey] = useState(0); // For forcing iframe refresh

  useEffect(() => {
    // Load the app from localStorage
    const loadApp = () => {
      try {
        const apps = JSON.parse(localStorage.getItem('nbyApps') || '[]');
        const foundApp = apps.find(a => a.id === appId);
        
        if (!foundApp) {
          throw new Error('App not found');
        }
        
        setApp(foundApp);
        setActiveFile(foundApp.files[0]); // Set first file as active by default
      } catch (error) {
        console.error('Error loading app:', error);
        // Navigate back to gallery if app not found
        navigate('/gallery');
      } finally {
        setLoading(false);
      }
    };

    loadApp();
  }, [appId, navigate]);

  // Get language extension for CodeMirror based on file type
  const getLanguageExtension = (fileType) => {
    switch (fileType) {
      case 'javascript':
        return javascript();
      case 'html':
        return html();
      case 'css':
        return css();
      default:
        return javascript();
    }
  };

  // Generate a data URL for the combined app files for the iframe preview
  const generatePreviewContent = () => {
    if (!app || !app.files) return '';
    
    // Find each file type
    const htmlFile = app.files.find(file => file.type === 'html')?.content || '';
    const cssFile = app.files.find(file => file.type === 'css')?.content || '';
    const jsFile = app.files.find(file => file.type === 'javascript')?.content || '';
    
    // Combine files into a single HTML document
    const combinedContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${cssFile}</style>
      </head>
      <body>
        ${htmlFile}
        <script>${jsFile}</script>
      </body>
      </html>
    `;
    
    return URL.createObjectURL(new Blob([combinedContent], { type: 'text/html' }));
  };

  // Handle downloading the app files as a ZIP
  const handleDownload = () => {
    alert('Download functionality would be implemented here. In a full implementation, this would create a ZIP file with all the app files.');
  };

  // Force refresh of the preview iframe
  const refreshPreview = () => {
    setIframeKey(prevKey => prevKey + 1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <svg className="animate-spin h-10 w-10 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">App Not Found</h1>
        <p className="mt-2 text-gray-600">The app you're looking for doesn't exist or has been deleted.</p>
        <button 
          onClick={() => navigate('/gallery')}
          className="mt-4 btn btn-primary py-2 px-4"
        >
          Return to Gallery
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* App header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{app.name}</h1>
              <p className="mt-1 text-sm text-gray-500 max-w-2xl line-clamp-2">{app.idea}</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-4">
              <button
                onClick={refreshPreview}
                className="btn btn-secondary py-2 px-4 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button
                onClick={handleDownload}
                className="btn btn-primary py-2 px-4 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'preview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('preview')}
            >
              Preview
            </button>
            <button
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'code'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('code')}
            >
              Code
            </button>
          </nav>
        </div>
      </div>

      {/* Main content area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'preview' ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 md:aspect-h-7 border-b border-gray-200 h-screen max-h-[800px]">
              <iframe
                key={iframeKey}
                src={generatePreviewContent()}
                title="App Preview"
                className="w-full h-full"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* File tabs */}
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="px-4 sm:px-6 lg:px-8 flex overflow-x-auto">
                {app.files.map((file) => (
                  <button
                    key={file.name}
                    className={`py-3 px-4 text-sm font-medium whitespace-nowrap ${
                      activeFile?.name === file.name
                        ? 'text-primary-600 border-b-2 border-primary-500'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveFile(file)}
                  >
                    {file.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Code editor */}
            <div className="h-screen max-h-[600px] overflow-auto">
              {activeFile && (
                <CodeMirror
                  value={activeFile.content}
                  height="100%"
                  theme="light"
                  extensions={[getLanguageExtension(activeFile.type)]}
                  readOnly={true}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AppPreviewPage;