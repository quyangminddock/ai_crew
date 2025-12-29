# 🚀 AI Crew - Your Virtual Team of AI Agents

<div align="center">

![AI Crew Banner](https://img.shields.io/badge/AI-Crew-blue?style=for-the-badge&logo=ai&logoColor=white)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

English | [简体中文](README.zh-CN.md)

</div>

> **AI Crew** is a revolutionary workspace where you can collaborate with a team of specialized AI agents to build products, create content, and manage your entire business. Think of it as your virtual company with 35+ expert AI agents across 8 departments.

[🌐 Live Demo](#) | [📖 Documentation](#) | [🐛 Report Bug](https://github.com/quyangminddock/ai_crew/issues) | [✨ Request Feature](https://github.com/quyangminddock/ai_crew/issues)

---

## ✨ Features

### 🏢 8 Departments, 35+ Specialized Agents

AI Crew organizes specialized AI agents into departments, just like a real company:

- **📋 Product** - Sprint Prioritizer, Feedback Synthesizer, Trend Researcher
- **🎨 Design** - UI Designer, UX Researcher, Brand Guardian, Visual Storyteller
- **💻 Engineering** - Frontend/Backend Developers, AI Engineer, DevOps, Mobile Developer
- **📢 Marketing** - Content Creator, Growth Hacker, ASO Specialist, Social Media Managers
- **📅 Project Management** - Project Shipper, Experiment Tracker, Studio Producer
- **🏠 Operations** - Analytics Reporter, Finance Tracker, Support Responder
- **🧪 Testing** - API Tester, Performance Benchmarker, Test Results Analyzer
- **⭐ Bonus** - Team Joker, Studio Coach

### 🤖 Multi-AI Provider Support

- **Google Gemini** (including Gemini Live for real-time voice interaction)
- **OpenAI** (GPT-4, GPT-3.5)
- **Anthropic Claude** (Claude 3.5)
- **DeepSeek**

### 🌟 Key Capabilities

- **🎯 Task-Based Workflow** - Natural language task assignment with intelligent agent matching
- **💬 Real-time Collaboration** - Chat with multiple agents simultaneously
- **🔄 Agent Handoff** - Seamless task transfer between departments
- **📊 Task History** - Track and reopen previous conversations
- **🎨 Console-Style UI** - Beautiful, modern interface inspired by developer tools
- **🌍 i18n Support** - Built-in English and Chinese localization
- **🎤 Live Voice Chat** - Real-time voice interaction with Gemini Live
- **📱 AR Integration** - Face tracking and AR features using MediaPipe

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 16.1.1 (App Router)
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS 4.0
- **State Management**: Zustand 5.0
- **UI Components**: Radix UI (Dialog, Select, Switch, Tabs, Tooltip)
- **Animations**: Framer Motion 12.23
- **Icons**: Lucide React

### AI & ML
- **AI SDK**: Vercel AI SDK 6.0
- **Providers**: 
  - `@ai-sdk/google` - Google Gemini
  - `@ai-sdk/openai` - OpenAI
  - `@ai-sdk/anthropic` - Anthropic Claude
- **Computer Vision**: MediaPipe Tasks Vision
- **Real-time**: WebSocket (ws)

### Developer Experience
- **Language**: TypeScript 5.0
- **Linting**: ESLint 9
- **Validation**: Zod 4.2
- **Markdown**: react-markdown, remark-gfm

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.0 or higher
- **npm**, **yarn**, **pnpm**, or **bun**
- API keys for at least one AI provider (Gemini, OpenAI, Claude, or DeepSeek)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/quyangminddock/ai_crew.git
cd ai_crew
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Required: At least one AI provider API key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_claude_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key

# Optional: Default AI model
DEFAULT_AI_MODEL=gemini-2.0-flash-exp
```

4. **Run the development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000) to see AI Crew in action!

---

## 📖 Usage

### Basic Workflow

1. **Select a Department** - Choose from 8 departments based on your task
2. **Pick an Agent** - Select the specialized agent that best fits your needs
3. **Start a Conversation** - Chat with your agent or assign tasks in natural language
4. **Agent Collaboration** - Agents can hand off tasks to other departments
5. **Track Progress** - Monitor all active tasks in your workspace

### Example Task Flow

```
User: "I need to analyze market trends for a new AI product"
  ↓
System: Assigns to Trend Researcher (Product Department)
  ↓
Trend Researcher: Analyzes market data and trends
  ↓
Can hand off to UI Designer for mockups or Marketing for strategy
```

### Voice Interaction (Gemini Live)

1. Navigate to Settings
2. Enable Gemini Live
3. Click the microphone icon in any chat
4. Speak naturally with your AI agent

---

## 🗂️ Project Structure

```
ai_crew/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   │   ├── agents/       # Agent-related components
│   │   ├── chat/         # Chat interface
│   │   ├── layout/       # Layout components (Sidebar, Console)
│   │   ├── modals/       # Modal dialogs
│   │   ├── settings/     # Settings UI
│   │   └── workspace/    # Workspace management
│   ├── lib/              # Core logic
│   │   ├── agents/       # Agent definitions and data
│   │   ├── ai/           # AI provider integrations
│   │   ├── ar/           # AR and face tracking
│   │   └── i18n/         # Internationalization
│   ├── stores/           # Zustand state stores
│   ├── types/            # TypeScript type definitions
│   └── hooks/            # Custom React hooks
├── public/               # Static assets
└── package.json
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Areas We Welcome Contributions

- 🤖 **New AI Agents** - Add specialized agents for new use cases
- 🌍 **Translations** - Help translate to more languages
- 🎨 **UI/UX Improvements** - Enhance the interface
- 🔧 **AI Provider Support** - Integrate additional AI providers
- 📝 **Documentation** - Improve guides and examples
- 🐛 **Bug Fixes** - Help us squash bugs

---

## 🛣️ Roadmap

- [ ] Add more AI agent specializations
- [ ] Implement multi-agent conversation (group chat)
- [ ] Add code execution sandbox for engineering agents
- [ ] Create agent marketplace for custom agents
- [ ] Mobile app (React Native)
- [ ] Enhanced AR features for creative agents
- [ ] Integration with external tools (GitHub, Figma, Notion)
- [ ] Real-time collaboration features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js** - The React framework that powers this app
- **Vercel AI SDK** - Unified interface for AI providers
- **Radix UI** - Accessible component primitives
- **MediaPipe** - Real-time face tracking capabilities
- All the amazing AI providers (Google, OpenAI, Anthropic, DeepSeek)

---

## 📧 Contact

- **GitHub**: [@quyangminddock](https://github.com/quyangminddock)
- **Project Link**: [https://github.com/quyangminddock/ai_crew](https://github.com/quyangminddock/ai_crew)

---

<div align="center">

**Built with ❤️ by the AI Crew community**

⭐ Star us on GitHub — it motivates us a lot!

</div>
