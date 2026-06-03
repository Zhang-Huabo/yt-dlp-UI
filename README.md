# 🔱 Neptune Media Downloader (海王星影音下载器)

<p align="center">
  <img src="src/assets/hero.png" alt="Neptune Logo" width="220" />
</p>

<p align="center">
  <a href="https://github.com/Zhang-Huabo/yt-dlp-UI/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/Zhang-Huabo/yt-dlp-UI?style=for-the-badge&color=4FACFE" alt="License" />
  </a>
  <a href="https://github.com/Zhang-Huabo/yt-dlp-UI/stargazers">
    <img src="https://img.shields.io/github/stars/Zhang-Huabo/yt-dlp-UI?style=for-the-badge&color=00F2FE" alt="Stars" />
  </a>
  <a href="https://github.com/Zhang-Huabo/yt-dlp-UI/network/members">
    <img src="https://img.shields.io/github/forks/Zhang-Huabo/yt-dlp-UI?style=for-the-badge&color=7F00FF" alt="Forks" />
  </a>
  <a href="https://github.com/Zhang-Huabo/yt-dlp-UI/issues">
    <img src="https://img.shields.io/github/issues/Zhang-Huabo/yt-dlp-UI?style=for-the-badge&color=FF3366" alt="Issues" />
  </a>
</p>

<p align="center">
  <strong>一款基于 <code>yt-dlp</code> 的极致视觉美感、本地优先、零配置开箱即用的私人影音下载与媒体管理面板。</strong>
  <br />
  A premium, local-first personal audio/video download manager and media viewer built on top of <code>yt-dlp</code> with zero-config setup.
</p>

---

## ✨ 核心特色 (Core Features)

* **💎 极致视觉设计 (Stunning Aesthetics):** 采用深海星空暗黑主题，配备霓虹发光渐变、磨砂玻璃拟态 (Glassmorphism) 卡片，以及丝滑的微交互动画，打造极具未来感的网页端控制台。
* **⚡ 零配置开箱即用 (Zero Friction Setup):** 后端内置 **“智能依赖管理引擎”**（支持 Windows 系统下一键自动下载 `yt-dlp.exe` 和 `ffmpeg.exe` 并完成本地沙盒化配置），免去繁琐的环境变量配置痛苦。
* **🔴 实时进度流推送 (SSE Progress Stream):** 基于 **Server-Sent Events (SSE)** 长连接技术，实时捕获并输出子进程下载速率、文件大小、百分比进度条与剩余时间（ETA），零延迟同步。
* **🎬 本地私人影音馆 (Media Library):** 内置毛玻璃风格的 HTML5 多功能播放器。下载完成的影音文件将自动整理归档，支持一键在浏览器中直接点播、极速删除和目录浏览。
* **🛠️ 智能混流与降级保护:** 自动检测并优先调用 `ffmpeg` 进行 1080p/4K 视频的高保真音视频无损合并；若系统中完全没有 `ffmpeg`，系统将自动降级拉取“最佳预合成单文件”（如 720p 格式），确保任务永远不会因缺失依赖而报错崩溃。
* **🍪 防机器人校验与解密算法优化:** 针对 YouTube 人机校验（如 `Sign in to confirm you are not a bot`）及 signature `n-parameter` 解密挑战：
  - 支持免配置自动锁定当前 Node 进程运行时 (`--js-runtimes node:...`) 协助 `yt-dlp` 进行高效算法解密。
  - 支持项目根目录下读取标准 Netscape 格式的 `cookies.txt`，用于下载私有列表或规避限制。

---

## 🚀 快速开始 (Quick Start)

### 📌 Windows 平台 (推荐 - 最省心)

1. **获取项目代码**
   ```bash
   git clone https://github.com/Zhang-Huabo/yt-dlp-UI.git
   cd yt-dlp-UI
   ```

2. **双击启动**
   双击根目录下的 **`start.bat`** 即可。脚本将自动：
   * 检测并安装 Node.js 依赖包（如未下载）。
   * 自动打开浏览器并定位到控制台网页：`http://localhost:5173`。
   * 开启后端 API 服务与前端热更新联调。

3. **初始化依赖**
   * 打开网页后，点击左侧导航栏 **“系统设置” (Settings)**。
   * 在 “二进制依赖管理” 部分，直接点击 **“一键安装环境依赖”**。
   * 系统将自动在后台下载最新版的 `yt-dlp` 和 `ffmpeg`。当状态变更为 **“已就绪”** 时，即可开始畅享极速解析与下载。

---

### 💻 跨平台手动启动 (macOS / Linux)

1. **安装本地依赖 (以 Homebrew 为例)**
   ```bash
   brew install yt-dlp ffmpeg
   ```
2. **下载并安装 Node.js 模块**
   ```bash
   npm install
   ```
3. **同时启动前端与后端**
   ```bash
   npm run dev
   ```
4. 打开浏览器访问 `http://localhost:5173`，开始使用。

---

## 🛠️ 技术栈与目录架构

本项目采用**前后端分离**架构，易于扩展和维护。

```text
yt-dlp-UI/
  ├── bin/                 # 本地依赖二进制存放处 (自动管理 yt-dlp.exe / ffmpeg.exe)
  ├── downloads/           # 本地默认多媒体下载保存目录
  ├── server/              # Node.js + Express 后端服务
  │   ├── binManager.js    # 二进制版本检测、多重定向容错下载与解包模块
  │   ├── downloader.js    # 子进程多路并发控制与 Progress stdout 正则解析器
  │   └── server.js        # 后端 RESTful API 路由与 SSE 广播通道
  ├── src/                 # React 前端代码
  │   ├── assets/          # 静态图片资源 (含 3D Hero 封面)
  │   ├── App.jsx          # 前端核心业务逻辑 (含 SSE 长链接接收与播放器挂载)
  │   └── index.css        # 全局 Vanilla CSS 磨砂霓虹排版设计系统
  ├── start.bat            # Windows 平台下一键集成环境启动脚本
  ├── package.json         # 项目依赖项配置
  └── vite.config.js       # Vite 前端编译配置 (内置 API 代理映射)
```

---

## 💡 常见问题排查与高级玩法 (Troubleshooting)

### 1. YouTube 报错 "Sign in to confirm you are not a bot" / 遭遇人机验证怎么办？
由于频繁下载或使用公共 IP，YouTube 等平台可能会触发速率限制和机器人拦截。
* **解决方法：**
  1. 在浏览器（如 Chrome/Edge）中安装 **Get cookies.txt LOCALLY** 类似的 Cookie 导出插件。
  2. 登录您的 YouTube 账户，使用该插件导出 Netscape 格式的 Cookie 文本。
  3. 将导出的文本保存并命名为 **`cookies.txt`**，放置在项目的根目录（即 `yt-dlp-UI/` 根目录）下即可。
  4. Neptune Downloader 将自动读取并在下载时带上该凭证，绕过机器人限制。

### 2. 遇到 `Signature decryption failed` (签名解密失败)
`yt-dlp` 解析视频链接时，YouTube 会频繁更新签名算法。为了成功运行解密逻辑，`yt-dlp` 必须依赖一个 JS 运行环境。
* **Neptune Downloader 的优势：** 
  我们已在底层默认注入了参数 `--js-runtimes node:<current_exec_path>`，使 `yt-dlp` 直接调用 Node.js 自身的程序作为运行时环境来成功解开混淆代码。**请确保您的系统安装了 Node.js 18.0 或以上版本。**

### 3. 局域网内无法下载依赖文件 (FFmpeg/yt-dlp)
如果您所在的网络环境对境外网络（如 GitHub Release、FFmpeg 官方源）存在访问限制，一键自动下载可能会超时或失败。
* **解决方法：**
  您可以在本地先科学上网，然后手动将以下二进制程序存入项目根目录的 `./bin` 文件夹下：
  * `yt-dlp.exe` （放置在 `bin/yt-dlp.exe`）
  * `ffmpeg.exe` 和 `ffprobe.exe` （放置在 `bin/ffmpeg.exe` 和 `bin/ffprobe.exe`，请注意不要多嵌套一层文件夹）

---

## 🤝 参与贡献与支持

如果您喜欢这个项目，欢迎：
* 点一个 **⭐ Star** 让更多人发现这个工具！
* 提交 **Pull Request** 协助我们增加更多高颜值的主题或改进提取速率。
* 在 **Issues** 里面向我们提出任何建议或反馈异常链接。

---

## 📄 开源许可证

本项目使用 [MIT License](LICENSE)。您可以自由用于私人学习、修改和部署分发。
