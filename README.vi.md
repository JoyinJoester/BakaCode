# BakaCode CLI AI Agent

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![npm version](https://badge.fury.io/js/bakacode.svg)](https://badge.fury.io/js/bakacode)

**🌍 [English](./README.md) | [中文](./README.zh-CN.md) | [日本語](./README.ja.md)**

BakaCode là một CLI AI Agent mạnh mẽ cho Node.js hỗ trợ gọi công cụ, hội thoại đa vòng và bộ nhớ ngữ cảnh. Được tích hợp hệ thống prompt chất lượng cao của Claude Code để mang lại trải nghiệm tương tác AI tuyệt vời.

## ✨ Tính năng chính

- 🧠 **Tương tác AI kiểu Claude** - Phản hồi AI chất lượng cao với hệ thống prompt gốc của Claude Code
- 🤖 **Hỗ trợ đa nhà cung cấp AI** - Hỗ trợ mô hình cục bộ Ollama, OpenAI và API tương thích
- 🛠️ **Hệ thống công cụ mạnh mẽ** - Các công cụ tích hợp cho thao tác file, lệnh shell, HTTP request, tìm kiếm web
- 💾 **Bộ nhớ ngữ cảnh thông minh** - Hội thoại đa vòng với lưu trữ phiên liên tục
- 🔒 **Sandbox bảo mật** - Kiểm soát quyền toàn diện và chính sách bảo mật
- 🌍 **Giao diện đa ngôn ngữ** - Hỗ trợ English, 简体中文, 繁体中文, 日本語, 한국어, Tiếng Việt
- 🎯 **Tối ưu mô hình cục bộ** - Tương thích hoàn toàn với Ollama cho sử dụng ngoại tuyến
- 🌊 **Đầu ra streaming** - Phản hồi thời gian thực cho trải nghiệm người dùng được cải thiện
- ⚙️ **Cấu hình linh hoạt** - File cấu hình YAML và quản lý cấu hình CLI
- 📦 **Hỗ trợ đa nền tảng** - Tương thích Windows, macOS, Linux

## 🚀 Bắt đầu nhanh

### Cài đặt

```bash
npm install -g bakacode
```

Hoặc cài đặt từ mã nguồn:

```bash
git clone https://github.com/JoyinJoester/BakaCode.git
cd BakaCode
npm install
npm run build
npm link
```

### Cấu hình cơ bản

1. Sao chép template môi trường:
```bash
cp .env.example .env
```

2. Cấu hình các API key cần thiết:
```bash
# Cho nhà cung cấp OpenAI
bakac config set provider.apiKey "your-openai-api-key"

# Cho tính năng tìm kiếm web
bakac config set bing_key "your-bing-api-key"
```

### 🌍 Cấu hình đa ngôn ngữ

Thiết lập ngôn ngữ giao diện:
```bash
# Thiết lập tiếng Anh
bakac config set locale en

# Thiết lập tiếng Trung giản thể
bakac config set locale zh-CN

# Thiết lập tiếng Nhật
bakac config set locale ja

# Thiết lập tiếng Việt (mặc định)
bakac config set locale vi

# Hiển thị cài đặt ngôn ngữ hiện tại
bakac config show
```

### 🤖 Cấu hình mô hình cục bộ (Khuyến nghị)

1. Cài đặt và khởi động Ollama:
```bash
# Tải xuống và cài đặt Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Khởi động dịch vụ Ollama
ollama serve
```

2. Tải xuống mô hình được đề xuất:
```bash
# Mô hình Qwen (khuyến nghị cho tiếng Trung)
ollama pull qwen3:4b

# Hoặc các mô hình khác
ollama pull llama3
```

3. Cấu hình sử dụng mô hình cục bộ:
```bash
# Thiết lập nhà cung cấp Ollama
bakac config set provider.type ollama
bakac config set provider.model qwen3:4b

# Xác minh cấu hình
bakac config show
```

## 📖 Sử dụng

### Chat tương tác

```bash
# Bắt đầu phiên chat mới
bakac chat

# Chat bằng ngôn ngữ cụ thể
bakac -l vi chat
bakac -l en chat
bakac -l ja chat

# Sử dụng mô hình cụ thể
bakac chat -m qwen3:4b -p ollama

# Tiếp tục cuộc hội thoại hiện có
bakac chat -c conv_1234567890_abc123
```

### Thực thi tác vụ đơn

```bash
# Tác vụ tiếng Việt
bakac -l vi run --task "Tạo script Python để phân tích dữ liệu"

# Tác vụ tiếng Anh
bakac -l en run --task "Create a Python script for data analysis"

# Tác vụ tiếng Nhật
bakac -l ja run --task "データ分析用のPythonスクリプトを作成してください"

# Với cấu hình cụ thể
bakac run --task "Viết script Python" -m qwen3:4b -p ollama --max-tokens 2048
```

### Tìm kiếm web

```bash
# Tìm kiếm tiếng Việt
bakac -l vi websearch "tin tức công nghệ AI mới nhất"

# Tìm kiếm tiếng Nhật
bakac -l ja websearch "最新のAI技術の突破"

# Kết quả tìm kiếm với tóm tắt AI
bakac websearch "Node.js best practices" --summarize

# Tham số tìm kiếm tùy chỉnh
bakac websearch "machine learning" --count 20 --market vi-VN
```

### Quản lý cấu hình

```bash
# Hiển thị cấu hình hiện tại
bakac config show

# Thiết lập giá trị cấu hình
bakac config set provider.model qwen3:4b
bakac config set provider.temperature 0.7
bakac config set locale vi

# Lấy giá trị cấu hình
bakac config get provider.model

# Cấu hình prompt (kiểu Claude)
bakac config prompt --show          # Hiển thị cài đặt prompt hiện tại
bakac config prompt --claude        # Kích hoạt prompt kiểu Claude (mặc định)
bakac config prompt --default       # Sử dụng prompt BakaCode truyền thống
bakac config prompt --file <path>   # Sử dụng file prompt tùy chỉnh
```

## 🛠️ Hệ thống công cụ

### Công cụ tích hợp

1. **Công cụ File** (`file`)
   - Đọc, ghi, liệt kê file
   - Thao tác thư mục
   - Hạn chế đường dẫn an toàn

2. **Công cụ Shell** (`shell`)
   - Thực thi lệnh hệ thống
   - Kiểm soát thư mục làm việc
   - Chặn lệnh nguy hiểm

3. **Công cụ HTTP** (`http`)
   - HTTP request
   - Gọi REST API
   - Bảo vệ mạng riêng tư

4. **Công cụ tìm kiếm Web** (`websearch`)
   - Bing Search API
   - Tổng hợp kết quả
   - Tóm tắt AI

### Ví dụ sử dụng

Trong chat, agent sẽ tự động gọi các công cụ liên quan:

```
You: Tạo một script Python để đọc file CSV
Assistant: Tôi sẽ tạo script Python để đọc file CSV cho bạn.

[Agent tự động gọi công cụ file để tạo file]

You: Tìm kiếm thông tin phiên bản mới nhất của pandas
Assistant: Tôi sẽ tìm kiếm thông tin phiên bản mới nhất của pandas.

[Agent tự động gọi công cụ websearch để tìm kiếm]
```

## 🔒 Tính năng bảo mật

### Bảo mật hệ thống file
- Mặc định chỉ cho phép truy cập thư mục hiện tại và thư mục con
- Danh sách thư mục được phép có thể cấu hình
- Chặn truy cập vào thư mục hệ thống quan trọng

### Bảo mật thực thi lệnh
- Chặn các lệnh hệ thống nguy hiểm
- Danh sách đen lệnh có thể cấu hình
- Môi trường thực thi được sandbox hóa

### Bảo mật mạng
- Chặn truy cập mạng cục bộ và riêng tư
- Lưu trữ API key an toàn
- Timeout và giới hạn request

## 🛠️ Phát triển

### Cấu trúc dự án

```
src/
├── agent/          # ReAct loop, gọi công cụ, quản lý ngữ cảnh
├── providers/      # Triển khai nhà cung cấp Ollama, OpenAI
├── tools/          # Hệ thống công cụ
├── memory/         # Triển khai bộ nhớ ngữ cảnh
├── config/         # Quản lý cấu hình
├── cli/            # Triển khai lệnh CLI
├── i18n/           # Quốc tế hóa
└── utils/          # Tiện ích và xử lý lỗi
```

### Thêm công cụ mới

1. Kế thừa từ lớp `BaseTool`:

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
    // Triển khai logic công cụ
    return { success: true, result: 'done' };
  }
}
```

2. Đăng ký công cụ:

```typescript
// Đăng ký trong ToolManager
toolManager.registerTool(new MyTool());
```

### Chạy test

```bash
npm test                # Chạy tất cả test
npm run test:watch      # Chế độ watch
npm run test:coverage   # Tạo báo cáo coverage
```

## 🐛 Khắc phục sự cố

### Các vấn đề thường gặp

1. **Kết nối Ollama thất bại**
   ```bash
   # Kiểm tra Ollama có đang chạy không
   curl http://localhost:11434/api/tags
   
   # Thiết lập URL đúng
   bakac config set provider.baseUrl http://localhost:11434/api
   ```

2. **Lỗi OpenAI API**
   ```bash
   # Kiểm tra API key
   bakac config get provider.apiKey
   
   # Đặt lại API key
   bakac config set provider.apiKey "your-new-key"
   ```

3. **Tìm kiếm web thất bại**
   ```bash
   # Kiểm tra Bing API key
   bakac config get bing_key
   
   # Thiết lập Bing API key
   bakac config set bing_key "your-bing-key"
   ```

### Chế độ debug

```bash
# Bật log chi tiết
LOG_LEVEL=debug bakac chat

# Kiểm tra cấu hình
bakac config show
```

## 🤝 Đóng góp

Chúng tôi hoan nghênh các đóng góp! Vui lòng làm theo các bước sau:

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit thay đổi (`git commit -m 'Add amazing feature'`)
4. Push lên branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## 📧 Liên hệ

- **Tác giả**: Joyin
- **Email**: joyin8888@foxmail.com
- **GitHub**: [JoyinJoester](https://github.com/JoyinJoester)
- **Repository**: [BakaCode](https://github.com/JoyinJoester/BakaCode)

Nếu bạn có câu hỏi hoặc đề xuất, vui lòng liên hệ qua [Issues](https://github.com/JoyinJoester/BakaCode/issues).

## 📄 Giấy phép

Dự án này được cấp phép theo MIT License. Xem file [LICENSE](LICENSE) để biết chi tiết.

## 🙏 Lời cảm ơn

- Lấy cảm hứng từ [Claude Code](https://claude.ai/code) và [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli)
- Trải nghiệm tương tác AI tuyệt vời nhờ hệ thống prompt gốc của Claude Code
- Cảm ơn tất cả các nhà đóng góp mã nguồn mở và sự hỗ trợ của cộng đồng
