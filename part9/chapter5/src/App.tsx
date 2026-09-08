// part5 b — React components with TypeScript
//
// 课程原文 (line 85-156) 展示了 3 个 TS 写法变体:
//   (1) interface WelcomeProps + (props: WelcomeProps): JSX.Element     ← line 110-124
//   (2) inline destructured: ({ name }: { name: string }): JSX.Element   ← line 134-138
//   (3) 隐去 return type,让 TS 自动推断                                  ← line 144-156
//
// 1:1 复刻这 3 个写法(按课程顺序展示),都 export 给 main.tsx 实际渲染的是 (3)。
//
// 注意:课程用的是单文件 main.tsx 直接 render;Vite 模板拆成 App.tsx + main.tsx,
//      这里把"组件定义"放到 App.tsx(组件归属 App),"入口 render"放 main.tsx,职责切分不变。

// ⚠️ React 19 + @types/react@19 把全局 JSX 命名空间移除了 — 课程原文 (line 117/135) 写
// `: JSX.Element` 假设 JSX 是 global namespace;React 19 types 改成 named export,
// 必须显式 import。这是 course-follow-official Step 5 描述的"tooling 版本不匹配",
// 用最小修复 (import) 还原全局 JSX 可用,而不是改写课程代码。
// 关联: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/69495
import type { JSX } from 'react';

// ─────────────────────────────────────────────────────────────────────────
// (1) interface + 显式 JSX.Element return type
// 课程原文 (line 110-124):
//   interface WelcomeProps { name: string }
//   const Welcome = (props: WelcomeProps): JSX.Element => {
//     return <h1>Hello, {props.name}</h1>;
//   };
// ⭐ 核心概念:interface WelcomeProps + JSX.Element return type
//  为什么需要 interface: 函数组件本质是 (props) => JSX 的函数,
//    TS 给 React 组件定义 props 的方式和普通函数参数完全一样 — 先定义类型,再标注参数
//  为什么返回 JSX.Element: 让契约更显式 — 函数"承诺"返回 JSX 元素
//    实际不写也能跑(TS 自动推断),所以课程在 (3) 演示省略它
//  验证: hover 在 'props' 上看到类型 { name: string } 在 'Welcome' 上看到 (props: WelcomeProps) => JSX.Element
//  关联: 课程原文 line 108-126
// ─────────────────────────────────────────────────────────────────────────
interface WelcomeProps {
  name: string;
}

const WelcomeVerbose = (props: WelcomeProps): JSX.Element => {
  return <h1>Hello, {props.name}</h1>;
};

// ─────────────────────────────────────────────────────────────────────────
// (2) inline destructured props type
// 课程原文 (line 134-138):
//   const Welcome = ({ name }: { name: string }): JSX.Element => (
//     <h1>Hello, {name}</h1>
//   );
// ⭐ 核心概念: 直接在解构位置标注 props 类型
//  不用 interface:  props 结构只在一个地方用、且不会扩展时,可以"就地"标注
//  何时该用哪个:
//    - interface 写法 (1): props 多字段 / 会被复用 / 团队共享 → 抽出来有名字
//    - inline 写法   (2): props 单字段 / 只用一次 / 演示性代码     → 就地更紧凑
//  验证: 把 'name' 改成 number,看 'Hello, {name}' 处 TS 报类型错误
//  关联: 课程原文 line 132-140
// ─────────────────────────────────────────────────────────────────────────
const WelcomeInline = ({ name }: { name: string }): JSX.Element => (
  <h1>Hello, {name}</h1>
);

// ─────────────────────────────────────────────────────────────────────────
// (3) 隐去 return type — TS 自动推断
// 课程原文 (line 144-156):
//   interface WelcomeProps { name: string }
//   const Welcome = (props: WelcomeProps) => {                    // ← 没有 : JSX.Element
//     return <h1>Hello, {props.name}</h1>;
//   };
//   createRoot(...).render(<Welcome name="Sarah" />)
// ⭐ 核心概念: TS 的返回类型推断 (return type inference)
//  不用显式标注: 因为函数体只有一条 return <h1>...</h1>,TS 100% 能推断出返回类型
//  为什么可以省略:
//    - 推断结果和 JSX.Element 完全等价
//    - 不写更简洁,且将来 JSX.Element 改名时不用同步改
//  什么时候**还是该写**:
//    - 公共 API / 导出函数 → TS 编码风格要求显式 return 类型(见 rules/typescript/coding-style.md "Public APIs")
//    - 复杂泛型 / 重载 → 推断不出或推断结果不友好
//  验证: hover 在 Welcome 的 'name' 上看不到 ': JSX.Element',但类型仍然正确
//  关联: 课程原文 line 142-156 "There is actually no need to define the return type ..."
// ─────────────────────────────────────────────────────────────────────────
interface WelcomePropsInferred {
  name: string;
}

const WelcomeInferred = (props: WelcomePropsInferred) => {
  return <h1>Hello, {props.name}</h1>;
};

// ─────────────────────────────────────────────────────────────────────────
// 课程原文最终渲染的是 (3) — inferred 版本
// 课程 line 153-155:
//   createRoot(document.getElementById('root')!).render(
//     <Welcome name="Sarah" />
//   )
// App.tsx 默认导出 Inferred 版本(对应课程最终示范),同时把 (1)(2) 也 export 出来,
// 方便学习者对比三种写法;课程本身不演示组件切换,这里把 (3) 作为实际渲染对象。
// ─────────────────────────────────────────────────────────────────────────
function App() {
  return (
    <div>
      <WelcomeInferred name="Sarah" />
    </div>
  );
}

export default App;
// 把另外两种写法也 export,方便在 main.tsx 里切换对比(课程原文未演示)
export { WelcomeVerbose, WelcomeInline };