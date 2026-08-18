// ===== part6 — Context API =====
// 课程章节: https://fullstackopen.com/en/part6/react_query_context_api
// 课程原文 verbatim: part6 "Context API" 段(与 TanStack Query 并列的另一 H2),
// 本节独立项目 counter-context(不是对 query-notes 的修改)。
//
// verbatim 1:1 对照(课程 §CounterContext.jsx 整块抽取):
//   - createContext() 无默认值参数(标准 React 18+ 写法)
//   - CounterContextProvider 是一个常规组件,持有 useState(0)
//   - 暴露: counter + increment + decrement + zero 4 个值/函数
//   - 通过 <CounterContext.Provider value={...}> 包 children
//
// 课程说明(本节首段):
// "Let's return to the good old counter application."
// — 本节(Context API)的叙事弧是:
//   1) 反例:把 useState 放在 App,Display + Controls 通过 props 拿 counter
//      → "prop drilling" 问题
//   2) 解决:抽 Context.Provider 进 CounterContext.jsx
//   3) App.jsx 不再持有状态,CounterContextProvider 把状态 + 函数注给整棵树
//   4) Display + Controls 通过 useCounter() hook 取用
//
// 课程原话末段:
// "The application code is in the GitHub repository
//  https://github.com/fullstack-hy2020/context-counter."

import { createContext, useState } from 'react'

const CounterContext = createContext()

export default CounterContext

export const CounterContextProvider = (props) => {
  const [counter, setCounter] = useState(0)

  const increment = () => setCounter(counter + 1)
  const decrement = () => setCounter(counter - 1)
  const zero = () => setCounter(0)

  return (
    <CounterContext.Provider value={{ counter, increment, decrement, zero }}>
      {props.children}
    </CounterContext.Provider>
  )
}