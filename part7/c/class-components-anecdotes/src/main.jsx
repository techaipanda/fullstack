// ⭐ Vite 模板标准入口 —— 与 b 章一致,只是渲染的目标换成 Class Component
// (本身没有 class/function 之分 —— main.jsx 里 <App /> 是 JSX,语法层看不出差异)
// 课程里没有专门写 main.jsx 的教学,这是 Vite + @vitejs/plugin-react 的标准模板
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(<App />)