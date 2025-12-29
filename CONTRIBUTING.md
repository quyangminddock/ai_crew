# Contributing to AI Crew

Thank you for your interest in contributing to AI Crew! We love your input and want to make contributing as easy and transparent as possible.

## 🌟 How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples** to demonstrate the steps
* **Describe the behavior you observed** and what you expected
* **Include screenshots** if possible
* **Include your environment details** (OS, Node version, browser, etc.)

### ✨ Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a detailed description** of the suggested enhancement
* **Explain why this enhancement would be useful**
* **List some examples** of how it would be used

### 🔨 Pull Requests

1. **Fork** the repo and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Make your changes**
4. **Test your changes**: Ensure the app runs without errors
5. **Follow the code style**: Run `npm run lint`
6. **Write clear commit messages**
7. **Push** to your fork and submit a pull request

#### Pull Request Guidelines

* Keep changes focused - one feature or fix per PR
* Update documentation for any changed functionality
* Add comments for complex logic
* Follow the existing code style
* Test your changes thoroughly

## 🤖 Adding New AI Agents

We especially welcome contributions of new specialized AI agents! Here's how:

1. **Create agent definition** in `src/lib/agents/data.ts`
2. **Create agent prompt file** in a GitHub repository (reference in the agent definition)
3. **Add agent to appropriate department**
4. **Test the agent** thoroughly with various prompts
5. **Document the agent's capabilities** in your PR description

Example agent definition:

```typescript
{
  id: 'my-new-agent',
  name: { zh: '我的新代理', en: 'My New Agent' },
  department: 'engineering',
  file: 'my-new-agent.md'
}
```

## 🌍 Translations

To add a new language:

1. Create a new dictionary file in `src/lib/i18n/dictionaries/[lang].json`
2. Translate all keys from `en.json`
3. Add the locale to `src/lib/i18n/config.ts`
4. Test the UI with your new language

## 💻 Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/ai_crew.git
cd ai_crew

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your API keys to .env.local

# Start development server
npm run dev
```

## 📝 Code Style

* Use TypeScript for type safety
* Follow the existing code organization
* Use functional components and hooks
* Write meaningful variable and function names
* Add JSDoc comments for complex functions
* Run `npm run lint` before committing

## 🔄 Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests after the first line

Examples:
```
Add voice transcription support for Gemini Live
Fix agent handoff not preserving context
Update Chinese translations for new features
```

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## ❓ Questions?

Feel free to:
* Open an issue with the `question` label
* Reach out to the maintainers
* Join our community discussions

---

**Thank you for making AI Crew better! 🚀**
