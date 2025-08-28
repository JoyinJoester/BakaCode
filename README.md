# BakaCode CLI AI Agent

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![npm version](https://badge.fury.io/js/bakacode.svg)](https://badge.fury.io/js/bakacode)

BakaCode 是一个强大的 Node.js CLI AI Agent，支持工具调用、多轮对话和上下文记忆。采用Claude Code的高质量提示词系统，提供卓越的AI交互体验。

## ✨ 核心特性

- � **Claude风格AI交互** - 采用Claude Code的原生提示词系统，提供高质量的AI响应
- 🤖 **多AI提供商支持** - 兼容Ollama本地模型、OpenAI及兼容API
- 🛠️ **强大工具系统** - 内置文件操作、Shell命令、HTTP请求、Web搜索等工具
- 💾 **智能上下文记忆** - 支持多轮对话和持久化会话存储
- 🔒 **安全沙箱** - 完善的权限控制和安全策略
- 🌍 **多语言界面** - 支持英语、简体中文、繁体中文、日语、韩语
- 🎯 **本地模型优化** - 完美兼容Ollama，支持离线使用
- 🌊 **流式输出** - 实时响应，提升用户体验
- ⚙️ **灵活配置** - 支持YAML配置文件和CLI配置管理
- 📦 **跨平台支持** - Windows、macOS、Linux全平台兼容

## 快速开始

### 安装

```bash
npm install -g bakacode
```

或者从源码安装：

```bash
git clone https://github.com/JoyinJoester/BakaCode.git
cd BakaCode
npm install
npm run build
npm link
```

### 基础配置

1. 复制环境变量模板：
```bash
cp .env.example .env
```

2. 配置必要的 API 密钥：
```bash
# 对于 OpenAI 提供商
agent config set provider.apiKey "your-openai-api-key"

# 对于 Web 搜索功能
agent config set bing_key "your-bing-api-key"
```

### 🌍 多语言配置

设置界面语言：
```bash
# 设置为简体中文
agent config set locale zh-CN

# 设置为英语
agent config set locale en

# 设置为日语
agent config set locale ja

# 查看当前语言设置
agent config show
```

### 🤖 本地模型配置（推荐）

1. 安装并启动 Ollama：
```bash
# 下载安装 Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# 启动 Ollama 服务
ollama serve
```

2. 下载推荐的中文模型：
```bash
# 下载通义千问模型（推荐）
ollama pull qwen3:4b

# 或下载其他模型
ollama pull llama3
```

3. 配置使用本地模型：
```bash
# 设置为 Ollama 提供商
agent config set provider.type ollama
agent config set provider.model qwen3:4b

# 验证配置
agent config show
```

3. 配置默认提供商：
```bash
# 使用本地 Ollama（默认）
agent config set provider.type ollama
agent config set provider.model llama3

# 或使用 OpenAI
agent config set provider.type openai
agent config set provider.model gpt-4
```

### 基本使用

#### 快速开始

```bash
# 查看帮助
bakacode --help
bakac --help

# 快速语言切换
bakac -l zh-CN    # 中文界面
bakac -l en       # 英文界面
bakac -l ja       # 日文界面

# 语言管理
bakac lang list     # 列出支持的语言
bakac lang current  # 显示当前语言
bakac lang set zh-CN # 设置语言
```

#### 交互式聊天

```bash
# 开始新的聊天会话
bakac chat

# 中文聊天会话
bakac -l zh-CN chat

# 使用特定模型
bakac chat -m qwen3:4b -p ollama

# 继续现有对话
bakac chat -c conv_1234567890_abc123
```

#### 执行单个任务

```bash
# 中文任务
bakac -l zh-CN run --task "分析 docs 目录下所有 Markdown 文件内容，生成汇总报告"

# 英文任务
bakac -l en run --task "Create a Python script for data analysis"

# 日文任务
bakac -l ja run --task "Python スクリプトを作成してください"

# 使用特定配置
bakac run --task "编写一个 Python 脚本" -m qwen3:4b -p ollama --max-tokens 2048
```

#### Web 搜索

```bash
# 中文搜索
bakac -l zh-CN websearch "量子计算的最新突破"

# 英文搜索
bakac -l en websearch "latest quantum computing breakthroughs"

# 使用 AI 总结搜索结果
bakac websearch "Node.js 最佳实践" --summarize

# 自定义搜索参数
bakac websearch "机器学习" --count 20 --market zh-CN
```

#### 配置管理

```bash
# 查看当前配置
bakac config show

# 设置配置值
bakac config set provider.model qwen3:4b
bakac config set provider.temperature 0.7
bakac config set locale zh-CN

# 获取配置值
bakac config get provider.model

# 提示词配置（Claude风格）
bakac config prompt --show          # 查看当前提示词配置
bakac config prompt --claude        # 启用Claude风格提示词（默认）
bakac config prompt --default       # 使用传统BakaCode提示词
bakac config prompt --file <path>   # 使用自定义提示词文件
```

## 配置选项

### 提供商配置

```bash
# Ollama 配置
bakac config set provider.type ollama
bakac config set provider.baseUrl http://localhost:11434/api
bakac config set provider.model qwen3:4b

# OpenAI 配置
agent config set provider.type openai
agent config set provider.baseUrl https://api.openai.com/v1
agent config set provider.model gpt-4
agent config set provider.apiKey "your-api-key"
```

### 高级配置

支持通过配置文件进行更详细的配置：

```yaml
# ~/.bakacode/config.yaml
provider:
  type: ollama
  baseUrl: http://localhost:11434/api
  model: llama3
  maxTokens: 4096
  temperature: 0.7

tools:
  - file
  - shell
  - http
  - websearch

memory:
  enabled: true
  persistent: true
  maxLength: 8192

security:
  allowedDirectories:
    - ./
    - ../
    - ~/Documents
  blockedCommands:
    - rm
    - del
    - format
    - shutdown
    - reboot
```

## 工具系统

### 内置工具

1. **文件工具** (`file`)
   - 读取、写入、列举文件
   - 目录操作
   - 安全路径限制

2. **Shell 工具** (`shell`)
   - 执行系统命令
   - 工作目录控制
   - 危险命令阻止

3. **HTTP 工具** (`http`)
   - HTTP 请求
   - REST API 调用
   - 私有网络保护

4. **Web 搜索工具** (`websearch`)
   - Bing 搜索 API
   - 结果聚合
   - AI 总结

### 使用示例

在聊天中，Agent 会自动调用相关工具：

```
You: 请帮我创建一个 Python 脚本来读取 CSV 文件
Assistant: 我来帮你创建一个 Python 脚本来读取 CSV 文件。

[Agent 自动调用 file 工具创建文件]

You: 搜索一下 pandas 的最新版本信息
Assistant: 我来为你搜索 pandas 的最新版本信息。

[Agent 自动调用 websearch 工具搜索]
```

## 安全策略

### 文件系统安全
- 默认只允许访问当前目录和子目录
- 可配置允许的目录列表
- 禁止访问系统敏感目录

### 命令执行安全
- 阻止危险系统命令
- 可配置黑名单命令
- 沙箱化执行环境

### 网络安全
- 阻止访问本地和私有网络
- API 密钥安全存储
- 请求超时和限制

## 开发指南

### 项目结构

```
src/
├── agent/          # ReAct 循环、工具调用、上下文管理
├── providers/      # Ollama、OpenAI provider 实现
├── tools/          # 工具系统
├── memory/         # 上下文记忆实现
├── config/         # 配置管理
├── cli/            # CLI 命令实现
└── utils/          # 工具类和错误处理
```

### 添加新工具

1. 继承 `BaseTool` 类：

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
    // 实现工具逻辑
    return { success: true, result: 'done' };
  }
}
```

2. 注册工具：

```typescript
// 在 ToolManager 中注册
toolManager.registerTool(new MyTool());
```

### 添加新提供商

1. 继承 `BaseProvider` 类：

```typescript
import { BaseProvider } from './BaseProvider';

export class MyProvider extends BaseProvider {
  async complete(options: CompletionOptions): Promise<Message> {
    // 实现完成逻辑
  }

  async *stream(options: CompletionOptions): AsyncIterable<StreamChunk> {
    // 实现流式逻辑
  }

  async toolCall(message: Message, tools: Tool[]): Promise<ToolCall[]> {
    // 实现工具调用逻辑
  }
}
```

2. 在 `ProviderFactory` 中注册。

### 运行测试

```bash
npm test                # 运行所有测试
npm run test:watch      # 监听模式
npm run test:coverage   # 生成覆盖率报告
```

## 故障排除

### 常见问题

1. **Ollama 连接失败**
   ```bash
   # 检查 Ollama 是否运行
   curl http://localhost:11434/api/tags
   
   # 配置正确的 URL
   agent config set provider.baseUrl http://localhost:11434/api
   ```

2. **OpenAI API 错误**
   ```bash
   # 检查 API 密钥
   agent config get provider.apiKey
   
   # 重新设置 API 密钥
   agent config set provider.apiKey "your-new-key"
   ```

3. **Web 搜索失败**
   ```bash
   # 检查 Bing API 密钥
   agent config get bing_key
   
   # 设置 Bing API 密钥
   agent config set bing_key "your-bing-key"
   ```

### 调试模式

```bash
# 启用详细日志
LOG_LEVEL=debug agent chat

# 检查配置
agent config show
```

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📧 联系方式

- **作者**: Joyin
- **邮箱**: joyin8888@foxmail.com
- **GitHub**: [JoyinJoester](https://github.com/JoyinJoester)
- **项目仓库**: [BakaCode](https://github.com/JoyinJoester/BakaCode)

如有问题或建议，欢迎通过 [Issues](https://github.com/JoyinJoester/BakaCode/issues) 联系。

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- 灵感来源于 [Claude Code](https://claude.ai/code) 和 [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli)
- 采用Claude Code的原生提示词系统，提供卓越的AI交互体验
- 感谢所有开源贡献者和社区支持
