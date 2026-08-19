// ============================================================================
// part7 a.3 React.memo — MyComponent(课程 verbatim 代码块)
// 最小化演示:用 React.memo 包裹后,父组件重渲染不再触发本组件 render
// 关联:README.md a.3 段 1-2,课程 verbatim Console 段落
// ============================================================================

import { memo } from 'react'

// 课程原文代码块(verbatim structure):
//
//   const MyComponent = React.memo(({ value }) => {
//     console.log('rendered')
//     return <div>{value}</div>
//   })
//
// 我们用 `memo` named import 替代 `React.memo`(React 17+ 风格)
// 拆成 Base + memo 包裹两步,方便加注释
//
// ⭐ 核心概念:value 是字符串(primitive),React.memo 浅比较时按值比
//
// React.memo 默认对 props 做 shallow equality(Object.is):
//   - primitive(字符串/数字/布尔)→ 比值
//   - 对象/数组/函数 → 比引用(同一对象才算相等)
//
// value 在这里是字符串,虽然每次父组件 render 都"重新生成"这个字符串,
// 但 JS 字符串是 immutable + 值类型,只要内容相同,Object.is('hello', 'hello') = true。
//
// 验证场景(在 App.jsx 里):
//   1. 第一次渲染 → 看到 'MyComponent rendered'
//   2. 父组件 App 触发别的 state(如点 "bump unrelated state" 按钮)
//      → value 没变(都是字符串 'hello ...') → Object.is 相等 → 跳过 render
//      → 看不到 'MyComponent rendered' 日志
//   3. 父组件传不同的 value 字符串(比如 filter 变了 → myValue 用 useMemo 重新计算)
//      → 字符串值变了 → 重新 render
//
// 关键对比:
//   - SearchResults(options 是对象) → 引用比较 → 必须配合 useMemo 才能让 React.memo 生效
//   - MyComponent(value 是字符串)   → 值比较   → React.memo 自动就生效,无需 useMemo
//
// 详情见 src/App.jsx ⭐ 核心概念 段
// ============================================================================
const MyComponentBase = ({ value }) => {
  console.log('MyComponent rendered')
  return <div>{value}</div>
}

// memo() 包装成新组件并 default export
const MyComponent = memo(MyComponentBase)

export default MyComponent
