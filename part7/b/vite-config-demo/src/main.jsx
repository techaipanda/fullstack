// ⭐ 核心概念:Vite 模板的 main.jsx —— 与 esbuild-demo 同款
// 关键差异:这里没有 --jsx=automatic 这种 CLI 标志,而是 @vitejs/plugin-react 在 vite.config.js 的 plugins 里
//          帮你在 build/dev 阶段转译 JSX(本质是调 @babel/plugin-transform-react-jsx)
// 课程里也明确说:"The @vitejs/plugin-react plugin enables JSX transformation, fast refresh..."
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(<App />)