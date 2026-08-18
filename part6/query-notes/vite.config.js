// ===== part6c — Managing data on the server with the TanStack Query library =====
// 课程章节: https://fullstackopen.com/en/part6/many_redux_or_one_question#managing-data-on-the-server-with-the-tanstack-query-library
// 课程原文 verbatim: part6c 第 1 个 H2 — 安装 @tanstack/react-query + main.jsx 加
// QueryClient/QueryClientProvider,App 用 useQuery 拉 notes。
//
// 本节与 part6c — Synchronizing data to the server using TanStack Query(下一 H2,
// branch part6-2)区分:本节只做"读"+ 抽 getNotes 到 requests.js,不做 mutation。

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})