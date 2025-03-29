import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateAIPrompt, callAIService } from '../utils/aiPrompt';

function AppCreatorPage() {
  const [appIdea, setAppIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Generate the app using AI
  const generateApp = async () => {
    if (!appIdea.trim()) {
      setError('Please enter an app idea');
      return;
    }

    setError('');
    setIsGenerating(true);
    
    try {
      // Generate the AI prompt
      const prompt = generateAIPrompt(appIdea);
      
      // Call the AI service - in a real implementation, this would
      // communicate with an actual AI API
      await callAIService(prompt);
      
      // Generate a unique ID for the app
      const appId = 'app_' + Date.now();
      
      // In a real implementation, we would parse the AI response
      // and extract the generated files
      
      // For demo purposes, we'll store a minimal app structure in localStorage
      const generatedApp = {
        id: appId,
        name: `App from "${appIdea.substring(0, 30)}${appIdea.length > 30 ? '...' : ''}"`,
        idea: appIdea,
        createdAt: new Date().toISOString(),
        files: [
          { 
            name: 'index.html', 
            content: createMockHTMLContent(appIdea),
            type: 'html'
          },
          { 
            name: 'styles.css', 
            content: createMockCSSContent(),
            type: 'css'
          },
          { 
            name: 'app.js', 
            content: createMockJSContent(),
            type: 'javascript'
          }
        ]
      };
      
      // Save to localStorage
      const apps = JSON.parse(localStorage.getItem('nbyApps') || '[]');
      apps.push(generatedApp);
      localStorage.setItem('nbyApps', JSON.stringify(apps));
      
      // Navigate to preview page
      navigate(`/preview/${appId}`);
      
    } catch (err) {
      console.error('Error generating app:', err);
      setError('An error occurred while generating your app. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Mock content generation functions - these would be replaced with actual AI-generated content
  const createMockHTMLContent = (idea) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated App</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <nav>
            <div class="logo">App</div>
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
            <h1>Welcome to Your App</h1>
            <p>Based on your idea: "${idea}"</p>
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
        <p>&copy; 2025 Generated App. All rights reserved.</p>
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
}

/* Features Section */
.features {
    padding: 4rem 2rem;
}

.features h2 {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 3rem;
}

.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.feature-card {
    background-color: white;
    border-radius: 0.5rem;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.feature-card h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #111;
}

/* Footer */
footer {
    padding: 2rem;
    text-align: center;
    background-color: #f9fafb;
    border-top: 1px solid #eaeaea;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
    nav {
        flex-direction: column;
        padding: 1rem;
    }
    
    nav ul {
        margin-top: 1rem;
    }
    
    nav ul li {
        margin-left: 1rem;
        margin-right: 1rem;
    }
    
    .hero {
        padding: 4rem 1rem;
    }
    
    .hero h1 {
        font-size: 2rem;
    }
}`;
  };
  
  const createMockJSContent = () => {
    return `// Simple JavaScript for the generated app
document.addEventListener('DOMContentLoaded', function() {
    // Add click event to the Get Started button
    const getStartedBtn = document.querySelector('.btn.primary');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function() {
            alert('Welcome! This is a placeholder for your app functionality.');
        });
    }
    
    // Add navigation active class toggle
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Remove active class from all links
            navLinks.forEach(navLink => {
                navLink.classList.remove('active');
            });
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Prevent default action for demo purposes
            e.preventDefault();
        });
    });
    
    // Add hover effect to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        });
    });
    
    console.log('App initialized successfully!');
});`;
  };

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
            ></textarea>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-center">
            <button
              className="btn btn-primary py-2 px-6"
              onClick={generateApp}
              disabled={isGenerating}
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
    </div>
  );
}

export default AppCreatorPage;