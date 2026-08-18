// ===== part6 — Context API =====
// 课程章节: https://fullstackopen.com/en/part6/react_query_context_api
// 课程原文 verbatim: 课程 §main.jsx 整块抽取。
//
// verbatim 1:1 对照:
//   - CounterContextProvider 包住整个 App,context 在整棵树都可见
//   - 没引 StrictMode(课程 §main.jsx verbatim 不引,但实际仓库可能引 — 课程正文为准)
//   - 没引 QueryClient / QueryClientProvider(本节是 Context,不是 TanStack Query)
//
// 课程说明(本节关键句):
// "CounterContextProvider ... passes the context value to the entire
//  application — every component below the Provider can read counter state
//  through useCounter() without prop drilling."
//
// 课程原话末段:
// "The application code is in the GitHub repository
//  https://github.com/fullstack-hy2020/context-counter."

import { createRoot } from 'react-dom/client'

import App from './App'
import { CounterContextProvider } from './CounterContext'

createRoot(document.getElementById('root')).render(
  <CounterContextProvider>
    <App />
  </CounterContextProvider>
)