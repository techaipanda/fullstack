// ===== part6c — Managing data on the server with the TanStack Query library =====
// 课程章节: https://fullstackopen.com/en/part6/many_redux_or_one_question#managing-data-on-the-server-with-the-tanstack-query-library
// 课程原文 verbatim: part6c 第 1 个 H2 段 2 "A few additions to the file
// main.jsx are needed to pass the library functions to the entire application"。
//
// verbatim 1:1 对照(第 1 个 H2 段 2 代码块):
//   import { createRoot } from 'react-dom/client'
//   import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
//   import App from './App.jsx'
//
//   const queryClient = new QueryClient()
//
//   createRoot(document.getElementById('root')).render(
//     <QueryClientProvider client={queryClient}>
//       <App />
//     </QueryClientProvider>
//   )
//
// 课程说明:"A few additions to the file main.jsx are needed to pass the library
// functions to the entire application" — QueryClient 持有所有 query/mutation 缓存
// 状态,QueryClientProvider 用 React Context 把 client 注入到整棵组件树。
//
// 课程说明:"Let's use JSON Server as in the previous parts to simulate the
// backend" — backend 走 json-server,本项目 db.json + npm run server 启动。

import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)