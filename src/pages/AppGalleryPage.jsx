import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LLM_SERVICES } from '../utils/llmServices';

function AppGalleryPage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load apps from localStorage
    const loadApps = () => {
      try {
        const savedApps = JSON.parse(localStorage.getItem('nbyApps') || '[]');
        setApps(savedApps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (error) {
        console.error('Error loading apps:', error);
        setApps([]);
      } finally {
        setLoading(false);
      }
    };

    loadApps();
  }, []);

  const deleteApp = (appId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this app?')) {
      try {
        const updatedApps = apps.filter(app => app.id !== appId);
        localStorage.setItem('nbyApps', JSON.stringify(updatedApps));
        setApps(updatedApps);
      } catch (error) {
        console.error('Error deleting app:', error);
      }
    }
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get LLM service details by ID
  const getLLMServiceDetails = (serviceId) => {
    return LLM_SERVICES.find(service => service.id === serviceId) || { name: 'Unknown Service', icon: '🤖' };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">App Gallery</h1>
        <p className="mt-2 text-lg text-gray-600">
          View and manage your generated web applications.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <svg className="animate-spin h-10 w-10 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <div>
          {apps.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-2 text-xl font-medium text-gray-900">No apps yet</h3>
              <p className="mt-1 text-gray-500">Get started by creating your first app.</p>
              <div className="mt-6">
                <Link to="/create" className="btn btn-primary py-2 px-4">
                  Create an App
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {apps.map((app) => {
                // Get LLM service details
                const llmService = app.llmService 
                  ? getLLMServiceDetails(app.llmService)
                  : { name: 'AI Service', icon: '🤖' };
                
                return (
                  <Link
                    key={app.id}
                    to={`/preview/${app.id}`}
                    className="card bg-white hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <h2 className="text-xl font-semibold text-gray-900 truncate">{app.name}</h2>
                        <button
                          onClick={(e) => deleteApp(app.id, e)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{app.idea}</p>
                      <div className="mt-4 flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          Created: {formatDate(app.createdAt)}
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                            {app.files.length} files
                          </div>
                          <div className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full flex items-center">
                            <span className="mr-1">{llmService.icon}</span>
                            {llmService.name.split(' ')[0]}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AppGalleryPage;