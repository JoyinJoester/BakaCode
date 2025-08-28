# BakaCode 安装和快速开始指南

## 系统要求

- Node.js 16.0.0 或更高版本
- npm 7.0.0 或更高版本
- Windows 10/11, macOS 10.15+, 或 Linux

## 安装方式

### 方式 1: 从源码安装（推荐）

1. **克隆仓库**
   ```bash
   git clone <your-repository-url>
   cd BakaCode
   ```

2. **运行快速启动脚本**
   
   **Linux/macOS:**
   ```bash
   chmod +x scripts/quick-start.sh
   ./scripts/quick-start.sh
   ```
   
   **Windows:**
   ```cmd
   scripts\quick-start.bat
   ```

3. **验证安装**
   ```bash
   agent --help
   ```

### 方式 2: 手动安装

1. **安装依赖**
   ```bash
   npm install
   ```

2. **构建项目**
   ```bash
   npm run build
   ```

3. **全局链接**
   ```bash
   npm link
   ```

## 第一次运行

完成安装后，你可以开始使用 BakaCode：

1. **查看帮助**
   ```bash
   agent --help
   ```

2. **查看当前配置**
   ```bash
   agent config show
   ```

3. **设置基本配置**
   ```bash
   # 使用本地 Ollama（推荐）
   agent config set provider.type ollama
   agent config set provider.model llama3
   
   # 或使用 OpenAI
   agent config set provider.type openai
   agent config set provider.apiKey "your-api-key"
   ```

4. **开始第一次对话**
   ```bash
   agent chat
   ```

项目现在已经完全可用！🎉
