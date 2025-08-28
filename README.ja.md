# BakaCode CLI AI Agent

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![npm version](https://badge.fury.io/js/bakacode.svg)](https://badge.fury.io/js/bakacode)

**🌍 [English](./README.md) | [中文](./README.zh-CN.md) | [Tiếng Việt](./README.vi.md)**

BakaCodeは、ツール呼び出し、マルチターン会話、コンテキストメモリをサポートする強力なNode.js CLI AIエージェントです。Claude Codeの高品質プロンプトシステムを採用し、優れたAIインタラクション体験を提供します。

## ✨ 主要機能

- 🧠 **Claude風AIインタラクション** - Claude Codeのネイティブプロンプトシステムによる高品質なAI応答
- 🤖 **マルチAIプロバイダーサポート** - Ollamaローカルモデル、OpenAI、互換APIに対応
- 🛠️ **強力なツールシステム** - ファイル操作、シェルコマンド、HTTPリクエスト、ウェブ検索など内蔵ツール
- 💾 **スマートコンテキストメモリ** - 永続的なセッションストレージを備えたマルチターン会話
- 🔒 **セキュリティサンドボックス** - 包括的な権限制御とセキュリティポリシー
- 🌍 **多言語インターフェース** - English、简体中文、繁体中文、日本語、한국어、Tiếng Việtサポート
- 🎯 **ローカルモデル最適化** - Ollamaとの完全互換性でオフライン使用可能
- 🌊 **ストリーミング出力** - リアルタイム応答による向上したユーザー体験
- ⚙️ **柔軟な設定** - YAML設定ファイルとCLI設定管理
- 📦 **クロスプラットフォームサポート** - Windows、macOS、Linux互換性

## 🚀 クイックスタート

### インストール

```bash
npm install -g bakacode
```

またはソースからインストール：

```bash
git clone https://github.com/JoyinJoester/BakaCode.git
cd BakaCode
npm install
npm run build
npm link
```

### 基本設定

1. 環境テンプレートをコピー：
```bash
cp .env.example .env
```

2. 必要なAPIキーを設定：
```bash
# OpenAIプロバイダー用
bakac config set provider.apiKey "your-openai-api-key"

# ウェブ検索機能用
bakac config set bing_key "your-bing-api-key"
```

### 🌍 多言語設定

インターフェース言語を設定：
```bash
# 英語に設定
bakac config set locale en

# 簡体字中国語に設定
bakac config set locale zh-CN

# 日本語に設定（デフォルト）
bakac config set locale ja

# ベトナム語に設定
bakac config set locale vi

# 現在の言語設定を表示
bakac config show
```

### 🤖 ローカルモデル設定（推奨）

1. Ollamaをインストールして起動：
```bash
# Ollamaをダウンロードしてインストール
curl -fsSL https://ollama.ai/install.sh | sh

# Ollamaサービスを開始
ollama serve
```

2. 推奨モデルをダウンロード：
```bash
# Qwenモデル（中国語推奨）
ollama pull qwen3:4b

# または他のモデル
ollama pull llama3
```

3. ローカルモデル使用を設定：
```bash
# Ollamaプロバイダーに設定
bakac config set provider.type ollama
bakac config set provider.model qwen3:4b

# 設定を確認
bakac config show
```

## 📖 使用方法

### インタラクティブチャット

```bash
# 新しいチャットセッションを開始
bakac chat

# 特定の言語でチャット
bakac -l ja chat
bakac -l en chat
bakac -l vi chat

# 特定のモデルを使用
bakac chat -m qwen3:4b -p ollama

# 既存の会話を続行
bakac chat -c conv_1234567890_abc123
```

### 単一タスク実行

```bash
# 日本語タスク
bakac -l ja run --task "データ分析用のPythonスクリプトを作成してください"

# 英語タスク
bakac -l en run --task "Create a Python script for data analysis"

# ベトナム語タスク
bakac -l vi run --task "Tạo script Python để phân tích dữ liệu"

# 特定の設定で
bakac run --task "Pythonスクリプトを書いてください" -m qwen3:4b -p ollama --max-tokens 2048
```

### ウェブ検索

```bash
# 日本語検索
bakac -l ja websearch "最新のAI技術の突破"

# ベトナム語検索
bakac -l vi websearch "tin tức công nghệ mới nhất"

# AI要約付き検索結果
bakac websearch "Node.jsベストプラクティス" --summarize

# カスタム検索パラメータ
bakac websearch "機械学習" --count 20 --market ja-JP
```

### 設定管理

```bash
# 現在の設定を表示
bakac config show

# 設定値を設定
bakac config set provider.model qwen3:4b
bakac config set provider.temperature 0.7
bakac config set locale ja

# 設定値を取得
bakac config get provider.model

# プロンプト設定（Claude風）
bakac config prompt --show          # 現在のプロンプト設定を表示
bakac config prompt --claude        # Claude風プロンプトを有効化（デフォルト）
bakac config prompt --default       # 従来のBakaCodeプロンプトを使用
bakac config prompt --file <path>   # カスタムプロンプトファイルを使用
```

## 🛠️ ツールシステム

### 内蔵ツール

1. **ファイルツール** (`file`)
   - ファイルの読み取り、書き込み、一覧表示
   - ディレクトリ操作
   - 安全なパス制限

2. **シェルツール** (`shell`)
   - システムコマンド実行
   - 作業ディレクトリ制御
   - 危険なコマンドのブロック

3. **HTTPツール** (`http`)
   - HTTPリクエスト
   - REST API呼び出し
   - プライベートネットワーク保護

4. **ウェブ検索ツール** (`websearch`)
   - Bing検索API
   - 結果集約
   - AI要約

### 使用例

チャットでは、エージェントが自動的に関連ツールを呼び出します：

```
You: CSVファイルを読み取るPythonスクリプトを作成してください
Assistant: CSVファイルを読み取るPythonスクリプトを作成いたします。

[エージェントが自動的にfileツールを呼び出してファイルを作成]

You: pandasの最新バージョン情報を検索してください
Assistant: pandasの最新バージョン情報を検索いたします。

[エージェントが自動的にwebsearchツールを呼び出して検索]
```

## 🔒 セキュリティ機能

### ファイルシステムセキュリティ
- デフォルトで現在のディレクトリとサブディレクトリのみアクセス可能
- 設定可能な許可ディレクトリリスト
- システム重要ディレクトリへのアクセスブロック

### コマンド実行セキュリティ
- 危険なシステムコマンドのブロック
- 設定可能なブラックリストコマンド
- サンドボックス化された実行環境

### ネットワークセキュリティ
- ローカルおよびプライベートネットワークアクセスのブロック
- 安全なAPIキーストレージ
- リクエストタイムアウトと制限

## 🛠️ 開発

### プロジェクト構造

```
src/
├── agent/          # ReActループ、ツール呼び出し、コンテキスト管理
├── providers/      # Ollama、OpenAIプロバイダー実装
├── tools/          # ツールシステム
├── memory/         # コンテキストメモリ実装
├── config/         # 設定管理
├── cli/            # CLIコマンド実装
├── i18n/           # 国際化
└── utils/          # ユーティリティとエラーハンドリング
```

### 新しいツールの追加

1. `BaseTool`クラスを継承：

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
    // ツールロジックを実装
    return { success: true, result: 'done' };
  }
}
```

2. ツールを登録：

```typescript
// ToolManagerで登録
toolManager.registerTool(new MyTool());
```

### テスト実行

```bash
npm test                # すべてのテストを実行
npm run test:watch      # ウォッチモード
npm run test:coverage   # カバレッジレポート生成
```

## 🐛 トラブルシューティング

### よくある問題

1. **Ollama接続失敗**
   ```bash
   # Ollamaが実行中かチェック
   curl http://localhost:11434/api/tags
   
   # 正しいURLを設定
   bakac config set provider.baseUrl http://localhost:11434/api
   ```

2. **OpenAI APIエラー**
   ```bash
   # APIキーをチェック
   bakac config get provider.apiKey
   
   # APIキーをリセット
   bakac config set provider.apiKey "your-new-key"
   ```

3. **ウェブ検索失敗**
   ```bash
   # Bing APIキーをチェック
   bakac config get bing_key
   
   # Bing APIキーを設定
   bakac config set bing_key "your-bing-key"
   ```

### デバッグモード

```bash
# 詳細ログを有効化
LOG_LEVEL=debug bakac chat

# 設定をチェック
bakac config show
```

## 🤝 貢献

貢献を歓迎します！以下の手順に従ってください：

1. プロジェクトをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📧 連絡先

- **作者**: Joyin
- **メール**: joyin8888@foxmail.com
- **GitHub**: [JoyinJoester](https://github.com/JoyinJoester)
- **リポジトリ**: [BakaCode](https://github.com/JoyinJoester/BakaCode)

質問や提案がございましたら、[Issues](https://github.com/JoyinJoester/BakaCode/issues)よりお気軽にお問い合わせください。

## 📄 ライセンス

このプロジェクトはMITライセンスの下でライセンスされています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 🙏 謝辞

- [Claude Code](https://claude.ai/code)と[google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli)からインスピレーションを得ました
- Claude Codeのネイティブプロンプトシステムによる優れたAIインタラクション体験
- すべてのオープンソース貢献者とコミュニティサポートに感謝
