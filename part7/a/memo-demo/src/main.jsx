// ============================================================================
// Vite + React 入口
// ============================================================================

import { StrictMode } from 'react'         // React 18+ 的开发模式辅助
import { createRoot } from 'react-dom/client' // React 18+ 的新根 API(替代 ReactDOM.render)
import './index.css'
import App from './App.jsx'

// ⚠️ 重要:StrictMode 在开发模式下会"故意双调用"组件函数体
// 目的:帮你发现副作用(比如 setState 没有用函数式更新、副作用没清理等)
// 表现:console.log 在 dev 模式下会看到两次 — 这是**正常**的开发行为,production 不会
// 更多信息:https://react.dev/reference/react/StrictMode
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
