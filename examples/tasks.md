# 示例任务配置

## 文件分析任务

分析项目中的所有 TypeScript 文件，生成代码质量报告。

```bash
agent run --task "请分析 src 目录下的所有 TypeScript 文件，统计代码行数、函数数量，并识别潜在的代码质量问题，生成详细的分析报告。"
```

## Web 搜索总结

搜索最新的技术趋势并生成总结报告。

```bash
agent websearch "2024年前端开发趋势" --summarize
```

## 多步骤任务

执行复杂的多步骤任务，包括文件操作、网络请求和数据处理。

```bash
agent run --task "请帮我完成以下任务：1. 从 https://api.github.com/repos/microsoft/vscode/releases/latest 获取 VS Code 最新版本信息；2. 将信息保存到 vscode-info.json 文件；3. 分析版本信息并生成一个简短的更新摘要。"
```

## 代码生成任务

生成特定功能的代码示例。

```bash
agent run --task "请创建一个 Node.js Express 服务器的示例，包含用户认证、文件上传和 RESTful API 端点。将代码保存到 server.js 文件中，并添加详细的注释。"
```

## 数据处理任务

处理和分析数据文件。

```bash
agent run --task "请读取 data.csv 文件，分析其中的数据模式，计算基本统计信息，并生成一个可视化的 HTML 报告保存为 report.html。"
```
