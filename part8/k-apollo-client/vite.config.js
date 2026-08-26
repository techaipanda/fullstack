// ⭐ vite.config.js — Vite + React plugin 配置(Vite scaffold 标准配置)
// ⭐ 课程原文: "Let's create a new React app"(imply Vite — Create React App 已弃用)
// ⭐ 此文件按 Vite 官方 React 模板 verbatim 写 — 与课程无关的最小工程配置
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
