# NBYApp - Generate Web Apps from Ideas

NBYApp is a platform that transforms high-level ideas into complete web applications using AI. Simply describe your app concept, choose your preferred LLM service, and NBYApp will generate a fully functional web application with multiple screens, modern UI/UX design, and all the necessary code.

## Features

- **Idea-to-App Generation**: Transform text descriptions into complete web applications
- **Multiple LLM Services**: Choose between OpenAI, Anthropic Claude, or DeepSeek Coder
- **Multiple Screens**: Generated apps include 4-5 core screens with working navigation
- **Modern Design**: Apple-inspired minimalist UI/UX design principles
- **Code Preview**: View and edit generated HTML, CSS, and JavaScript code
- **Live Preview**: Test your generated application in real-time
- **App Gallery**: Browse and manage your previously generated applications

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/nbyapp/nbyapp.git
cd nbyapp
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
   - Copy the `.env.local.example` file to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
   - Edit `.env.local` and add your API keys
   - Set `VITE_USE_MOCK_IMPLEMENTATIONS=false` to use real API calls
   - If you don't have API keys, leave `VITE_USE_MOCK_IMPLEMENTATIONS=true` to use mock implementations

4. Start the development server:
```bash
npm run dev
```

5. Visit `http://localhost:3000` in your browser to use the application.

## API Keys

NBYApp can connect to the following LLM services:

1. **OpenAI API** - Get your API key from [OpenAI's platform](https://platform.openai.com/api-keys)
2. **Anthropic Claude API** - Get your API key from [Anthropic's console](https://console.anthropic.com/)
3. **DeepSeek API** - Get your API key from [DeepSeek's platform](https://platform.deepseek.com/)

Set these keys in your `.env.local` file to enable real LLM integration:

```
VITE_OPENAI_API_KEY=your_key_here
VITE_ANTHROPIC_API_KEY=your_key_here
VITE_DEEPSEEK_API_KEY=your_key_here
VITE_USE_MOCK_IMPLEMENTATIONS=false
```

## Usage

1. **Create an App**:
   - Navigate to the "Create App" page
   - Select your preferred LLM service (OpenAI, Claude, or DeepSeek)
   - Enter your app idea in the text input
   - Click "Generate App"
   - Wait for the AI to process your request and generate the app

2. **View and Edit Code**:
   - After app generation, you'll be redirected to the preview page
   - Switch between "Preview" and "Code" tabs to see your app
   - View different files by clicking on file tabs in the code view

3. **Manage Your Apps**:
   - Visit the "App Gallery" to see all your generated apps
   - Each app shows which LLM service was used to generate it
   - Click on any app to view or edit it
   - Delete apps you no longer need

## How It Works

NBYApp uses a sophisticated AI prompt to interpret your app idea and generate the necessary code files. The prompt instructs the AI to create:

1. HTML/JSX for all core screens (4-5 screens total)
2. Full CSS/styling with responsive design
3. JavaScript for navigation and core functionality
4. Working interactive elements and state management

The AI follows best practices for modern web development, including:
- Responsive design (mobile-first approach)
- Accessibility compliance
- Clean, production-ready code
- Modern UI patterns (inspired by Apple's Human Interface Guidelines)

## LLM Service Integration

NBYApp supports multiple AI services for code generation:

- **OpenAI GPT-4o**: A powerful and versatile model with strong coding capabilities
- **Anthropic Claude 3 Opus**: Known for comprehensive and well-structured code generation
- **DeepSeek Coder**: Specialized for programming tasks with clean code output

In the current demo implementation, these services are simulated for demonstration purposes. In a production environment, you would need to configure API keys and implement the actual API calls to these services.

## Project Structure

```
nbyapp/
  ├── src/              # Application source code
  │   ├── components/   # Reusable React components
  │   ├── pages/        # Application pages
  │   ├── utils/        # Utility functions and AI service integration
  │   └── App.jsx       # Main application component
  ├── userapps/         # Storage for user-generated applications
  └── public/           # Static assets
```

## Technology Stack

- **Frontend**: React.js with React Router
- **Styling**: Tailwind CSS
- **Code Editor**: CodeMirror
- **AI Integration**: Ready for integration with OpenAI, Anthropic Claude, and DeepSeek Coder
- **Deployment**: Deployed on GitHub Pages (or any static hosting service)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- This project was inspired by the growing capabilities of AI in code generation
- UI design inspired by Apple's Human Interface Guidelines