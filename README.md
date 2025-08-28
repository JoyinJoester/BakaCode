# BakaCode CLI AI Agent

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![npm version](https://badge.fury.io/js/bakacode.svg)](https://badge.fury.io/js/bakacode)

**🌍 [中文](./README.zh-CN.md) | [日本語](./README.ja.md) | [Tiếng Việt](./README.vi.md)**

BakaCode is a powerful Node.js CLI AI Agent that supports tool calling, multi-turn conversations, and context memory. It features an advanced built-in prompt system for exceptional AI interaction experiences.

## ✨ Core Features

- 🧠 **Enhanced AI Interaction** - Powered by advanced built-in prompt system for high-quality AI responses
- 🤖 **Multi-AI Provider Support** - Compatible with Ollama local models, OpenAI, and compatible APIs
- 🛠️ **Powerful Tool System** - Built-in file operations, shell commands, HTTP requests, web search, and more
- 💾 **Smart Context Memory** - Multi-turn conversations with persistent session storage
- 🔒 **Security Sandbox** - Comprehensive permission controls and security policies
- 🌍 **Multi-language Interface** - Support for English, 简体中文, 繁体中文, 日本語, 한국어, Tiếng Việt
- 🎯 **Local Model Optimization** - Perfect compatibility with Ollama for offline usage
- 🌊 **Streaming Output** - Real-time responses for enhanced user experience
- ⚙️ **Flexible Configuration** - YAML config files and CLI configuration management
- 📦 **Cross-platform Support** - Windows, macOS, Linux compatibility

## 🚀 Quick Start

### Installation

```bash
npm install -g bakacode
```

Or install from source:

```bash
git clone https://github.com/JoyinJoester/BakaCode.git
cd BakaCode
npm install
npm run build
npm link
```

### Basic Configuration

1. Copy environment template:
```bash
cp .env.example .env
```

2. Configure necessary API keys:
```bash
# For OpenAI provider
bakac config set provider.apiKey "your-openai-api-key"

# For web search functionality
bakac config set bing_key "your-bing-api-key"
```

### 🌍 Multi-language Configuration

Set interface language:
```bash
# Set to English (default)
bakac config set locale en

# Set to Simplified Chinese
bakac config set locale zh-CN

# Set to Japanese
bakac config set locale ja

# Set to Vietnamese
bakac config set locale vi

# View current language settings
bakac config show
```

### 🤖 Local Model Configuration (Recommended)

1. Install and start Ollama:
```bash
# Download and install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve
```

2. Download recommended models:
```bash
# Download Qwen model (recommended for Chinese)
ollama pull qwen3:4b

# Or download other models
ollama pull llama3
```

3. Configure local model usage:
```bash
# Set to Ollama provider
bakac config set provider.type ollama
bakac config set provider.model qwen3:4b

# Verify configuration
bakac config show
```

## 📖 Usage

### Interactive Chat

```bash
# Start new chat session
bakac chat

# Chat with specific language
bakac -l en chat
bakac -l zh-CN chat
bakac -l vi chat

# Use specific model
bakac chat -m qwen3:4b -p ollama

# Continue existing conversation
bakac chat -c conv_1234567890_abc123
```

### Single Task Execution

```bash
# English task
bakac run --task "Create a Python script for data analysis"

# Chinese task
bakac -l zh-CN run --task "分析 docs 目录下所有 Markdown 文件内容，生成汇总报告"

# Vietnamese task
bakac -l vi run --task "Tạo script Python để phân tích dữ liệu"

# With specific configuration
bakac run --task "Write a Python script" -m qwen3:4b -p ollama --max-tokens 2048
```

### Web Search

```bash
# English search
bakac websearch "latest AI breakthroughs"

# Vietnamese search
bakac -l vi websearch "tin tức công nghệ mới nhất"

# AI-summarized search results
bakac websearch "Node.js best practices" --summarize

# Custom search parameters
bakac websearch "machine learning" --count 20 --market en-US
```

### Configuration Management

```bash
# View current configuration
bakac config show

# Set configuration values
bakac config set provider.model qwen3:4b
bakac config set provider.temperature 0.7
bakac config set locale vi

# Get configuration values
bakac config get provider.model

# Prompt configuration (Claude-style)
bakac config prompt --show          # View current prompt configuration
bakac config prompt --enhanced       # Enable enhanced prompts (default)
bakac config prompt --default       # Use traditional BakaCode prompts
bakac config prompt --file <path>   # Use custom prompt file
```

## 🛠️ Tool System

### Built-in Tools

1. **File Tool** (`file`)
   - Read, write, list files
   - Directory operations
   - Safe path restrictions

2. **Shell Tool** (`shell`)
   - Execute system commands
   - Working directory control
   - Dangerous command blocking

3. **HTTP Tool** (`http`)
   - HTTP requests
   - REST API calls
   - Private network protection

4. **Web Search Tool** (`websearch`)
   - Bing Search API
   - Result aggregation
   - AI summarization

### Usage Examples

In chat, the Agent will automatically call relevant tools:

```
You: Please create a Python script to read CSV files
Assistant: I'll help you create a Python script to read CSV files.

[Agent automatically calls file tool to create file]

You: Search for the latest pandas version information
Assistant: I'll search for the latest pandas version information for you.

[Agent automatically calls websearch tool to search]
```

## 🔒 Security Features

### File System Security
- Default access only to current directory and subdirectories
- Configurable allowed directory list
- Sensitive system directory blocking

### Command Execution Security
- Dangerous system command blocking
- Configurable blacklist commands
- Sandboxed execution environment

### Network Security
- Private and local network access blocking
- Secure API key storage
- Request timeout and rate limiting

## 🛠️ Development

### Project Structure

```
src/
├── agent/          # ReAct loop, tool calling, context management
├── providers/      # Ollama, OpenAI provider implementations
├── tools/          # Tool system
├── memory/         # Context memory implementation
├── config/         # Configuration management
├── cli/            # CLI command implementations
├── i18n/           # Internationalization
└── utils/          # Utilities and error handling
```

### Adding New Tools

1. Extend `BaseTool` class:

```typescript
import { BaseTool } from './BaseTool';

export class MyTool extends BaseTool {
  public name = 'mytool';
  public description = 'My custom tool';
  public schema = {
    type: 'object',
    properties: {
      input: { type: 'string', description: 'Input parameter' }
    },
    required: ['input']
  };

  async execute(parameters: Record<string, any>): Promise<any> {
    this.validateParameters(parameters);
    // Implement tool logic
    return { success: true, result: 'done' };
  }
}
```

2. Register the tool:

```typescript
// Register in ToolManager
toolManager.registerTool(new MyTool());
```

### Running Tests

```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Generate coverage report
```

## 🐛 Troubleshooting

### Common Issues

1. **Ollama connection failed**
   ```bash
   # Check if Ollama is running
   curl http://localhost:11434/api/tags
   
   # Configure correct URL
   bakac config set provider.baseUrl http://localhost:11434/api
   ```

2. **OpenAI API errors**
   ```bash
   # Check API key
   bakac config get provider.apiKey
   
   # Reset API key
   bakac config set provider.apiKey "your-new-key"
   ```

3. **Web search failures**
   ```bash
   # Check Bing API key
   bakac config get bing_key
   
   # Set Bing API key
   bakac config set bing_key "your-bing-key"
   ```

### Debug Mode

```bash
# Enable verbose logging
LOG_LEVEL=debug bakac chat

# Check configuration
bakac config show
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## 📧 Contact

- **Author**: Joyin
- **Email**: joyin8888@foxmail.com
- **GitHub**: [JoyinJoester](https://github.com/JoyinJoester)
- **Repository**: [BakaCode](https://github.com/JoyinJoester/BakaCode)

For questions or suggestions, please contact us through [Issues](https://github.com/JoyinJoester/BakaCode/issues).

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Claude Code](https://claude.ai/code) and [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli)
- Powered by advanced built-in prompt system for exceptional AI interaction experiences
- Thanks to all open source contributors and community support
