// ===== part6 — Context API =====
// 课程章节: https://fullstackopen.com/en/part6/react_query_context_api
// 课程原文 verbatim: 课程 §useCounter.js 整块抽取。
//
// verbatim 1:1 对照:
//   - 一个 thin wrapper: useContext(CounterContext) → 直接 export 给调用方
//   - 这样所有需要 counter 的组件 import 同一个 hook,
//     不需要每个组件都写 useContext(CounterContext)
//   - 复用模式与 useNotes hook(part6c useNotes 自定义 hook)类似:
//     "把底层 API 包成一个语义化的本地 hook"
//
// 课程末段指向仓库 https://github.com/fullstack-hy2020/context-counter
// 本文件的 verbatim 与该仓库 src/hooks/useCounter.js 一致。

import { useContext } from 'react'
import CounterContext from '../CounterContext'

const useCounter = () => useContext(CounterContext)

export default useCounter