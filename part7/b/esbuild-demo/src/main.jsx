// ⭐ 核心概念:React 18+ 的 createRoot API
// 旧写法是 ReactDOM.render(<App />, document.getElementById('root'))(React 17 及以前)
// 新写法 ReactDOM.createRoot(...).render(...) 是 React 18 引入的并发模式入口
// 课程原文如此:import React from 'react' + createRoot 调用,保留 verbatim
// (即使在 React 19 + jsx=automatic 下,这里的 `import React from 'react'` 已不再必需,
//  但删掉它会偏离课程 1:1,所以保留并加注释说明。)
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// ⭐ 核心概念:JSX → React.createElement 由 esbuild 完成
// --jsx=automatic 标志让 esbuild 自动注入 jsx-runtime,所以 <App /> 不需要显式 React.createElement
// 不用 --jsx=automatic:会报 "React is not defined" 错误
// 用 --jsx=automatic:esbuild 把 <App /> 转成 _jsx(App, ...),React 不必在作用域
ReactDOM.createRoot(document.getElementById('root')).render(<App />)