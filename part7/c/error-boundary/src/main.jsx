// ⭐ Vite 模板标准入口 —— ErrorBoundary 是 App 内部用的,
// main.jsx 这一层不需要包 ErrorBoundary(整个应用挂掉应该让顶层异常暴露)
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(<App />)