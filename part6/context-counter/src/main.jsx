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

// H3 子段 "Defining the counter context in its own file" verbatim:
//   - 引入 StrictMode(本节课程 §H3 main.jsx 代码块里有)
//   - 用 <StrictMode> 包住 <CounterContextProvider>
//   — StrictMode 是 React 18+ 的开发期检查工具,会双调用渲染函数
//     来暴露副作用问题;生产 build 不会影响。

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import { CounterContextProvider } from './CounterContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CounterContextProvider>
      <App />
    </CounterContextProvider>
  </StrictMode>
)