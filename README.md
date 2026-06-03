# 🔱 Neptune Media Downloader (海王星影音下载器)

<p align="center">
  <img src="https://img.shields.io/github/license/username/reponame?style=for-the-badge&color=blue" alt="License" />
  <img src="https://img.shields.io/github/stars/username/reponame?style=for-the-badge&color=ff69b4" alt="Stars" />
  <img src="https://img.shields.io/github/forks/username/reponame?style=for-the-badge&color=00F2FE" alt="Forks" />
  <img src="https://img.shields.io/github/issues/username/reponame?style=for-the-badge&color=red" alt="Issues" />
</p>

<p align="center">
  <strong>一款基于 <code>yt-dlp</code> 的极致视觉美感、本地优先、零配置开箱即用的私人影音下载与媒体管理面板。</strong>
  <br />
  A premium, local-first personal audio/video download manager and media viewer built on top of <code>yt-dlp</code> with zero-config setup.
</p>

---

## ✨ 核心特色 (Core Features)

* **💎 极致视觉设计 (Stunning Aesthetics):** 采用深海星空暗黑主题，配备霓虹发光渐变、磨砂玻璃拟态 (Glassmorphism) 布局，以及丝滑的微动效，打造艺术品级别的开发者工具。
* **⚡ 零配置开箱即用 (Zero Friction Setup):** 内置**环境智能检测与一键自动部署**（支持 Windows 系统下自动下载 `yt-dlp.exe` 和 `ffmpeg.exe` 并完成本地沙盒配置），彻底消除下载合并失败、找不到环境变量的痛点。
* **🔴 实时进度流推送 (SSE Progress Stream):** 基于 Server-Sent Events (SSE) 长连接技术，实时捕获并输出下载速率、文件大小、百分比进度条与剩余时间（ETA），零延迟展示。
* **🎬 本地私人影音馆 (Media Library):** 内嵌高颜值 HTML5 播放器，下载完成的视频/音频自动归档在网页上，可一键即时在线点播、删除和整理。
* **🛠️ 智能混流与降级保护:** 自动使用 FFmpeg 进行 1080p/4K 视频的高保真音视频合并。若检测到无 FFmpeg，系统会自动降级下载合成好的最佳单文件格式（如 720p），确保持续可用，不发生崩溃。

---

## 📸 界面预览 (Screenshots)

> *此处可以录制并贴上你的项目运行 GIF 或高清截图以吸引 Star*
> *Attach a cool GIF showing URL analysis, real-time downloading, and playing here to wow users!*

---

## 🚀 快速开始 (Quick Start)

### 📌 Windows 平台 (推荐 - 最省心)
1. **下载/克隆仓库：**
   ```bash
   git clone https://github.com/username/reponame.git
   cd reponame
   ```
2. **双击启动：**
   双击根目录下的 **`start.bat`** 即可。脚本将自动：
   * 检测并安装 Node.js 依赖包
   * 自动打开浏览器进入网页版控制台 `http://localhost:5173`
   * 开启前后端并发联调服务

---

### 💻 跨平台手动启动 (macOS / Linux)
1. 安装依赖包：
   ```bash
   npm install
   ```
2. 启动服务 (API 与 Vite 服务端并发运行)：
   ```bash
   npm run dev
   ```
3. 打开浏览器访问 `http://localhost:5173` 开始使用。

---

## 🛠️ 技术栈与架构 (Tech Stack)

```text
/neptune-downloader
  ├── bin/                 # 自动下载存储的本地 yt-dlp & ffmpeg 二进制 (Windows)
  ├── server/              # Node.js + Express 后端 API
  │   ├── binManager.js    # 二进制管理、环境检测与自动下载器
  │   ├── downloader.js    # yt-dlp 子进程管理与 stdout 进度正则解析器
  │   └── server.js        # 路由入口与 SSE 广播服务
  ├── src/                 # React 前端
  │   ├── App.jsx          # UI 主控制逻辑与 SSE 长连接监听
  │   └── index.css        # 全局设计系统 CSS 样式 (暗色毛玻璃与微动效)
  ├── downloads/           # 本地音视频默认下载路径
  └── start.bat            # Windows 双击一键启动脚本
```

---

## 🤝 贡献与反馈 (Contributing)

如果你喜欢这个项目，请给它点个 **⭐ Star**！这也是对我们最大的鼓励！
* 提交 Bug 或新功能建议：欢迎在 GitHub Issues 中发起反馈。
* 提交代码贡献：欢迎 Fork 仓库并提交 Pull Request。

---

## 📄 开源协议 (License)

本项目基于 **MIT License** 开源，详情请见 [LICENSE](LICENSE) 文件。
