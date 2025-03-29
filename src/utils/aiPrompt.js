/**
 * This file contains the prompt template for generating apps with AI
 */

export const APP_GENERATION_PROMPT = `
**Objective:** Create a fully functional web app prototype based on the following high-level idea. Generate all necessary code files for 4-5 core screens with modern UI/UX design (Apple-inspired minimalist aesthetic), working navigation, and populated dummy data.

**App Idea:** 
{APP_IDEA}

**Output Requirements:**

1. **Complete Code Generation:**
   * HTML/JSX for ALL core screens (4-5 screens total)
   * Full CSS/styling implementation with responsive design
   * JavaScript for navigation and core functionality
   * Working interactive elements and state management

2. **Technical Specifications:**
   * Use modern front-end technologies (React/Vue/vanilla JS - choose the most appropriate)
   * Implement responsive design (mobile-first approach)
   * Include dark/light mode if appropriate
   * Ensure accessibility compliance

3. **Data & Functionality:**
   * Create appropriate data structures based on the app concept
   * Generate realistic dummy data 
   * Implement core user flows and interactions
   * Include state management for user interactions

4. **Additional Notes:**
   * Focus on clean, production-ready code
   * Prioritize modern UI patterns (inspired by Apple's Human Interface Guidelines)
   * Use comments to explain complex sections
   * Organize code logically for easy understanding

The final output should be ready-to-use code that could be directly implemented in a development environment with minimal modifications.
`;

/**
 * Generate the complete prompt for AI app generation
 * @param {string} appIdea - The user's app idea
 * @returns {string} - The complete prompt for the AI
 */
export const generateAIPrompt = (appIdea) => {
  return APP_GENERATION_PROMPT.replace('{APP_IDEA}', appIdea);
};

/**
 * In a full implementation, this function would call an actual AI service
 * For the prototype, we'll simulate the response
 * @param {string} prompt - The AI prompt
 * @returns {Promise<Object>} - The AI response including the generated app files
 */
export const callAIService = async (prompt) => {
  // This is a mock implementation
  // In a real app, this would call an API endpoint
  
  console.log('AI Prompt:', prompt);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Return mock response
  return {
    success: true,
    message: 'App generated successfully',
    // The actual implementation would parse the AI response 
    // and extract HTML, CSS, and JS code
  };
};
