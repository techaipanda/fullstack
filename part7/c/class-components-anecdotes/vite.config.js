// ⭐ part7 c — Class Components 子节配套的最小 Vite 配置
// 课程里这一节不涉及 vite.config 的定制 —— 只有 Vite 模板默认 + @vitejs/plugin-react
// (JSX 转译 + React Fast Refresh)
// 与 b 章 vite-config-demo 的关键差异:
//   - 这里不配 server.proxy(课程 verbatim 的 App.jsx 直接 axios.get('http://localhost:3001/...')
//     → 浏览器会撞 CORS,真实复现课程"老式"做法。课程原文没要求绕 CORS)
//   - 不配 build.sourcemap(本节专注 class API,不演示 sourcemap)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})