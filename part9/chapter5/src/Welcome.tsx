// part5 b → part5 g — Welcome 三种写法(从 App.tsx 迁出)
//
// 课程原文 (line 85-156) 在 sub-section "React components with TypeScript" 给出
// 3 种 Welcome 组件写法变体,1:1 复刻到 App.tsx (sub-section 2 完成)。
//
// sub-section 7 "React app with state" (line 573-796) 要求 App.tsx 改写成 note app,
// 这里把上一次的 3 种 Welcome 写法迁到独立文件,作为 sub-section 2 的学习存档;
// 课程原文未演示此迁出,纯粹为了保留章节进度。
//
// 课程原文 3 种写法(已用 import type { JSX } from 'react' 适配 React 19):

// ⚠️ React 19 + @types/react@19 把全局 JSX 命名空间移除了 — 课程原文 (line 117/135)
// 写 `: JSX.Element` 假设 JSX 是 global namespace;React 19 types 改成 named export,
// 必须显式 import。这是 course-follow-official Step 5 描述的"tooling 版本不匹配",
// 用最小修复 (import) 还原全局 JSX 可用,而不是改写课程代码。
import type { JSX } from 'react';

// ─────────────────────────────────────────────────────────────────────────
// (1) interface + 显式 JSX.Element return type
// 课程原文 (line 110-124) verbatim
// ─────────────────────────────────────────────────────────────────────────
interface WelcomeProps {
  name: string;
}

const WelcomeVerbose = (props: WelcomeProps): JSX.Element => {
  return <h1>Hello, {props.name}</h1>;
};

// ─────────────────────────────────────────────────────────────────────────
// (2) inline destructured props type
// 课程原文 (line 134-138) verbatim
// ─────────────────────────────────────────────────────────────────────────
const WelcomeInline = ({ name }: { name: string }): JSX.Element => (
  <h1>Hello, {name}</h1>
);

// ─────────────────────────────────────────────────────────────────────────
// (3) 隐去 return type — TS 自动推断
// 课程原文 (line 144-156) verbatim
// ─────────────────────────────────────────────────────────────────────────
interface WelcomePropsInferred {
  name: string;
}

const WelcomeInferred = (props: WelcomePropsInferred) => {
  return <h1>Hello, {props.name}</h1>;
};

export { WelcomeVerbose, WelcomeInline, WelcomeInferred };