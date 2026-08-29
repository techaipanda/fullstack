// ⭐ vite.config.js — Vite + React plugin 配置(Vite scaffold 标准配置)
// ⭐ 课程原文(part8o "Updating the cache")不动此文件 — 沿用 part8n verbatim
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})