// ⭐ 核心概念:vite.config.js 的"三件套" —— 课程 10+ 个独立配置选项中,本子项目挑 3 个最 Vite-only 的演示:
//   1. server.proxy      —— dev 期跨端口请求转发(免 CORS)
//   2. .env + VITE_ 前缀 —— 浏览器可见的环境变量(import.meta.env)
//   3. build.sourcemap   —— 生产构建产物对源码的可追溯性

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // ⭐ 核心概念 1:server.proxy —— 课程原文:
  //   "your React app typically runs on one port (e.g., 3000) while your backend runs on another (e.g., 3001).
  //    The browser's same-origin policy would normally block requests between them.
  //    Vite's proxy setting solves this without requiring CORS configuration on the backend."
  //
  // 不用 server.proxy:前端 fetch('http://localhost:3001/api/notes') 被浏览器同源策略拦截
  // 用 server.proxy:前端 fetch('/api/notes')         → Vite dev 服务器转发到 http://localhost:3001/api/notes
  //                              ↑ 注意:fetch 写相对路径,不带域名/端口,浏览器以为是同源
  //
  // 课程 verbatim 配置:/api → http://localhost:3001, changeOrigin=true 重写 Host 头
  // 验证:在浏览器 devtools Network 看 /api/notes 这条请求的 "Proxied" 列 / Remote Address 显示的是 Vite proxy 不是真后端
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },

  // ⭐ 核心概念 3:build.sourcemap —— 课程原文:
  //   "In development, Vite generates source maps automatically. For production builds, you can enable them explicitly."
  //   "Note that production source maps increase build time and expose your source code to anyone who looks at the network tab."
  //
  // 不用 build.sourcemap:生产 dist/assets/*.js 单行压缩,报错栈指向 dist 行号,几乎不可调试
  // 用 build.sourcemap:同时生成 .map 文件,浏览器 devtools 报错时栈指向原始 src/App.jsx
  // ⚠️ 课程警告:.map 文件暴露源码,生产环境要么不上线 .map,要么把 .map 上传到 Sentry 这种监控服务后从 public 端删除
  // 验证:npm run build 后 dist/assets/*.js.map 出现,浏览器报错栈显示真实文件名
  build: {
    sourcemap: true,
  },
})