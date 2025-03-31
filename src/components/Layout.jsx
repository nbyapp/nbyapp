import { Outlet, Link, useLocation } from 'react-router-dom';
import GenerationStatusBar from './GenerationStatusBar';

function Layout() {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'bg-primary-100 text-primary-800' : 'text-gray-600 hover:bg-gray-100';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-primary-600 font-bold text-xl">NBYApp</Link>
              </div>
              <nav className="ml-6 flex space-x-4">
                <Link to="/" className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive('/')}`}>
                  Home
                </Link>
                <Link to="/create" className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive('/create')}`}>
                  Create App
                </Link>
                <Link to="/gallery" className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive('/gallery')}`}>
                  App Gallery
                </Link>
              </nav>
            </div>
            <div className="flex items-center">
              <a 
                href="https://github.com/nbyapp/nbyapp" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        <Outlet />
      </main>
      
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} NBYApp - Create web apps from your ideas
          </p>
        </div>
      </footer>

      {/* Global Generation Status Bar */}
      <GenerationStatusBar />
    </div>
  );
}

export default Layout;