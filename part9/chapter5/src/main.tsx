import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// part5 a — Vite with TypeScript
// ⭐ 核心概念: 非空断言 (non-null assertion) — TS 的后缀 ! 操作符
// 写法:       expr!.value 告诉 TS 编译器 "我保证 expr 不是 null/undefined"
// 为什么不:    document.getElementById('root') 的返回值类型是 HTMLElement | null
//              TS 严格模式下会报错 "Object is possibly 'null'",课程需要拿掉这个错误
// 为什么安全:  index.html 写了 <div id="root">,且是项目入口;root 一定存在
// 课程原文 (line 66-83): 讲解此技巧,并提醒"earlier we warned about type assertions, but in our case the assertion is ok"
// 验证:        hover 在 'root'! 上,看到类型从 HTMLElement | null 收窄为 HTMLElement
// 关联:        README part9 chapter5 "Vite with TypeScript" 段
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);