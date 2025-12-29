# 🚀 AI Crew - 你的虚拟 AI 智能体团队

<div align="center">

![AI Crew Banner](https://img.shields.io/badge/AI-Crew-blue?style=for-the-badge&logo=ai&logoColor=white)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[English](README.md) | 简体中文

</div>

> **AI Crew** 是一个革命性的工作空间，你可以与一支专业的 AI 智能体团队协作，共同打造产品、创作内容并管理整个业务。将它想象成你的虚拟公司，拥有跨 8 个部门的 35+ 专业 AI 智能体。

[🌐 在线演示](#) | [📖 文档](#) | [🐛 报告问题](https://github.com/quyangminddock/ai_crew/issues) | [✨ 功能建议](https://github.com/quyangminddock/ai_crew/issues)

---

## ✨ 功能特点

### 🏢 8 个部门，35+ 专业智能体

AI Crew 将专业的 AI 智能体组织成部门，就像真实公司一样：

- **📋 产品部** - 优先级规划师、反馈分析师、趋势研究员
- **🎨 设计部** - UI设计师、UX研究员、品牌守护者、视觉叙事师
- **💻 工程部** - 前端/后端开发、AI工程师、DevOps、移动端开发
- **📢 市场部** - 内容创作者、增长黑客、ASO优化师、社媒运营
- **📅 项目部** - 项目交付专家、实验追踪员、工作室制片人
- **🏠 运营部** - 数据分析师、财务跟踪员、客服响应专员
- **🧪 测试部** - API测试员、性能基准测试员、测试结果分析师
- **⭐ 特别组** - 气氛调节师、团队教练

### 🤖 多 AI 提供商支持

- **Google Gemini**（包括 Gemini Live 实时语音交互）
- **OpenAI**（GPT-4、GPT-3.5）
- **Anthropic Claude**（Claude 3.5）
- **DeepSeek**

### 🌟 核心能力

- **🎯 任务驱动工作流** - 自然语言任务分配，智能匹配合适的智能体
- **💬 实时协作** - 同时与多个智能体对话
- **🔄 智能体交接** - 部门间无缝任务转移
- **📊 任务历史** - 追踪并重新打开之前的对话
- **🎨 控制台风格 UI** - 现代化界面，灵感来自开发者工具
- **🌍 国际化支持** - 内置中英文双语
- **🎤 实时语音对话** - 通过 Gemini Live 进行实时语音交互
- **📱 AR 集成** - 使用 MediaPipe 进行人脸追踪和 AR 功能

---

## 🏗️ 技术栈

### 前端
- **框架**: Next.js 16.1.1（App Router）
- **UI 库**: React 19.2.3
- **样式**: Tailwind CSS 4.0
- **状态管理**: Zustand 5.0
- **UI 组件**: Radix UI（Dialog、Select、Switch、Tabs、Tooltip）
- **动画**: Framer Motion 12.23
- **图标**: Lucide React

### AI 与机器学习
- **AI SDK**: Vercel AI SDK 6.0
- **提供商**: 
  - `@ai-sdk/google` - Google Gemini
  - `@ai-sdk/openai` - OpenAI
  - `@ai-sdk/anthropic` - Anthropic Claude
- **计算机视觉**: MediaPipe Tasks Vision
- **实时通信**: WebSocket (ws)

### 开发者体验
- **语言**: TypeScript 5.0
- **代码检查**: ESLint 9
- **数据验证**: Zod 4.2
- **Markdown**: react-markdown、remark-gfm

---

## 🚀 快速开始

### 环境要求

- **Node.js** 18.0 或更高版本
- **npm**、**yarn**、**pnpm** 或 **bun**
- 至少一个 AI 提供商的 API 密钥（Gemini、OpenAI、Claude 或 DeepSeek）

### 安装步骤

1. **克隆仓库**

```bash
git clone https://github.com/quyangminddock/ai_crew.git
cd ai_crew
```

2. **安装依赖**

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

3. **设置环境变量**

在根目录创建 `.env.local` 文件：

```env
# 必需：至少一个 AI 提供商的 API 密钥
GOOGLE_GENERATIVE_AI_API_KEY=你的_gemini_api_密钥
OPENAI_API_KEY=你的_openai_api_密钥
ANTHROPIC_API_KEY=你的_claude_api_密钥
DEEPSEEK_API_KEY=你的_deepseek_api_密钥

# 可选：默认 AI 模型
DEFAULT_AI_MODEL=gemini-2.0-flash-exp
```

4. **运行开发服务器**

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

5. **打开浏览器**

访问 [http://localhost:3000](http://localhost:3000) 体验 AI Crew！

---

## 📖 使用方法

### 基础工作流

1. **选择部门** - 根据任务选择 8 个部门之一
2. **挑选智能体** - 选择最适合需求的专业智能体
3. **开始对话** - 与智能体聊天或用自然语言分配任务
4. **智能体协作** - 智能体可以将任务交接给其他部门
5. **跟踪进度** - 在工作区监控所有活动任务

### 示例任务流程

```
用户："我需要分析一个新 AI 产品的市场趋势"
  ↓
系统：分配给趋势研究员（产品部）
  ↓
趋势研究员：分析市场数据和趋势
  ↓
可交接给 UI 设计师制作原型或市场部制定策略
```

### 语音交互（Gemini Live）

1. 进入设置页面
2. 启用 Gemini Live
3. 点击任意聊天中的麦克风图标
4. 自然地与 AI 智能体对话

---

## 🗂️ 项目结构

```
ai_crew/
├── src/
│   ├── app/              # Next.js App Router 页面
│   ├── components/       # React 组件
│   │   ├── agents/       # 智能体相关组件
│   │   ├── chat/         # 聊天界面
│   │   ├── layout/       # 布局组件（侧边栏、控制台）
│   │   ├── modals/       # 模态对话框
│   │   ├── settings/     # 设置界面
│   │   └── workspace/    # 工作区管理
│   ├── lib/              # 核心逻辑
│   │   ├── agents/       # 智能体定义和数据
│   │   ├── ai/           # AI 提供商集成
│   │   ├── ar/           # AR 和人脸追踪
│   │   └── i18n/         # 国际化
│   ├── stores/           # Zustand 状态存储
│   ├── types/            # TypeScript 类型定义
│   └── hooks/            # 自定义 React Hooks
├── public/               # 静态资源
└── package.json
```

---

## 🤝 贡献指南

我们欢迎贡献！以下是你可以帮助的方式：

1. **Fork 本仓库**
2. **创建功能分支**（`git checkout -b feature/amazing-feature`）
3. **提交更改**（`git commit -m 'Add some amazing feature'`）
4. **推送到分支**（`git push origin feature/amazing-feature`）
5. **提交 Pull Request**

### 欢迎贡献的领域

- 🤖 **新 AI 智能体** - 为新用例添加专业智能体
- 🌍 **翻译** - 帮助翻译到更多语言
- 🎨 **UI/UX 改进** - 增强界面体验
- 🔧 **AI 提供商支持** - 集成更多 AI 提供商
- 📝 **文档** - 改进指南和示例
- 🐛 **错误修复** - 帮助我们消灭 bug

更多详情请查看 [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 🛣️ 路线图

- [ ] 添加更多 AI 智能体专业化
- [ ] 实现多智能体对话（群聊）
- [ ] 为工程智能体添加代码执行沙箱
- [ ] 创建自定义智能体市场
- [ ] 移动应用（React Native）
- [ ] 增强创意智能体的 AR 功能
- [ ] 与外部工具集成（GitHub、Figma、Notion）
- [ ] 实时协作功能

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 🙏 致谢

- **Next.js** - 驱动本应用的 React 框架
- **Vercel AI SDK** - AI 提供商的统一接口
- **Radix UI** - 无障碍组件原语
- **MediaPipe** - 实时人脸追踪能力
- 所有优秀的 AI 提供商（Google、OpenAI、Anthropic、DeepSeek）

---

## 📧 联系方式

- **GitHub**: [@quyangminddock](https://github.com/quyangminddock)
- **项目链接**: [https://github.com/quyangminddock/ai_crew](https://github.com/quyangminddock/ai_crew)

---

<div align="center">

**由 AI Crew 社区用 ❤️ 打造**

⭐ 在 GitHub 上给我们加星 — 这对我们很重要！

</div>
