# BakaCode 配置示例

## 基础配置 (.env)

```bash
# 默认提供商设置
DEFAULT_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434/api
DEFAULT_MODEL=llama3

# OpenAI 配置
OPENAI_API_KEY=your-openai-api-key

# Bing 搜索配置
BING_API_KEY=your-bing-api-key

# 生成参数
MAX_TOKENS=4096
TEMPERATURE=0.7

# 安全设置
ALLOWED_DIRECTORIES=./,../,~/Documents
BLOCKED_COMMANDS=rm,del,format,shutdown,reboot

# 记忆设置
ENABLE_PERSISTENT_MEMORY=true
MEMORY_FILE=.agent_memory.json
MAX_CONTEXT_LENGTH=8192

# 日志级别
LOG_LEVEL=info
```

## YAML 配置示例 (~/.bakacode/config.yaml)

```yaml
provider:
  type: ollama
  baseUrl: http://localhost:11434/api
  model: llama3
  maxTokens: 4096
  temperature: 0.7
  # apiKey: your-api-key  # 仅 OpenAI 需要

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
    - ~/Projects
  blockedCommands:
    - rm
    - del
    - format
    - shutdown
    - reboot
    - mkfs
    - fdisk
```

## JSON 配置示例 (bakacode.config.json)

```json
{
  "provider": {
    "type": "openai",
    "baseUrl": "https://api.openai.com/v1",
    "model": "gpt-4",
    "maxTokens": 4096,
    "temperature": 0.7,
    "apiKey": "your-openai-api-key"
  },
  "tools": ["file", "shell", "http", "websearch"],
  "memory": {
    "enabled": true,
    "persistent": true,
    "maxLength": 8192
  },
  "security": {
    "allowedDirectories": ["./", "../", "~/Documents"],
    "blockedCommands": ["rm", "del", "format", "shutdown", "reboot"]
  }
}
```

## 多环境配置

### 开发环境

```yaml
# config/development.yaml
provider:
  type: ollama
  baseUrl: http://localhost:11434/api
  model: llama3
  temperature: 0.9  # 更高的创造性

security:
  allowedDirectories:
    - ./
    - ../
    - ~/dev
    - ~/projects
```

### 生产环境

```yaml
# config/production.yaml
provider:
  type: openai
  baseUrl: https://api.openai.com/v1
  model: gpt-4
  temperature: 0.3  # 更低的随机性

security:
  allowedDirectories:
    - ./data
    - ./output
  blockedCommands:
    - rm
    - del
    - format
    - shutdown
    - reboot
    - sudo
    - su
```

## 特定用途配置

### 代码助手配置

```yaml
provider:
  type: ollama
  model: codellama
  temperature: 0.1  # 精确的代码生成

tools:
  - file
  - shell
  # 禁用网络工具以提高安全性

security:
  allowedDirectories:
    - ./src
    - ./test
    - ./docs
  blockedCommands:
    - rm
    - del
    - npm install  # 防止未授权的包安装
```

### 研究助手配置

```yaml
provider:
  type: openai
  model: gpt-4
  temperature: 0.7

tools:
  - websearch
  - http
  - file

memory:
  maxLength: 16384  # 更大的上下文窗口
```
